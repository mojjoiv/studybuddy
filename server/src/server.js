import { ReadableStream } from 'web-streams-polyfill';
globalThis.ReadableStream = ReadableStream;

import { Blob } from 'node:buffer';
globalThis.Blob = Blob;

if (typeof globalThis.DOMException === 'undefined') {
  globalThis.DOMException = class extends Error {
    constructor(message, name = 'DOMException') {
      super(message);
      this.name = name;
    }
  };
}

import fetch from 'node-fetch';
globalThis.fetch = fetch;
globalThis.Headers = fetch.Headers;
globalThis.Request = fetch.Request;
globalThis.Response = fetch.Response;

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// 🚨 Development fallback keys (only for local dev, do not use in prod)
if (!process.env.GROQ_API_KEY) {
  process.env.GROQ_API_KEY = "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";
}
if (!process.env.HF_API_KEY) {
  process.env.HF_API_KEY = "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";
}

console.log("Loaded GROQ key:", process.env.GROQ_API_KEY ? "✅ Found" : "❌ Missing");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing");

import connectDB from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("Server startup failed:", err.message);
  process.exit(1);
}
