import express from "express";
import cors from "cors";
// import { ChatOpenAI } from "@langchain/openai";
import { ChatGroq } from "@langchain/groq";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { FormData } from 'formdata-node';
globalThis.FormData = FormData;
import { File } from 'fetch-blob/file.js';
globalThis.File = File;
import { ReadableStream } from 'web-streams-polyfill';
globalThis.ReadableStream = ReadableStream;
globalThis.fetch = fetch;
globalThis.Headers = fetch.Headers;
globalThis.Request = fetch.Request;
globalThis.Response = fetch.Response;

// Routes
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (_, res) => res.json({ 
  ok: true,
  name: "StudyBuddy (Primary)",
  status: "operational",
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || "development"
}));

app.get("/test-stream", async (req, res) => {
  try {
    const model = new ChatGroq({
        model: "llama3-8b-8192",
        streaming: true,
        temperature: 0.7,
        apiKey: process.env.GROQ_API_KEY
      });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let output = "";
    const stream = await model.stream("Give me a fun fact about computer science.");
    for await (const chunk of stream) {
      if (chunk.content) output += chunk.content;
    } 
    res.json({ answer: output });  
      
    let buffer = "";
    for await (const chunk of stream) {
      buffer += chunk.content;
      res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
      if (typeof res.flush === 'function') res.flush();
    }

    console.log("Stream completed. Full response:", buffer);
    res.end();
  } catch (err) {
    console.error("Stream test failed:", err);
    res.status(500).json({ 
      error: "Stream test failed", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/conversations", conversationRoutes);

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;