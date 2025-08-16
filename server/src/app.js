import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (_, res) => res.json({ ok: true, name: "StudyBuddy (Primary)" }));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/conversations", conversationRoutes);

export default app;
