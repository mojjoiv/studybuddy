// models/Conversation.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["student", "ai"], required: true },
  content: { type: String, required: true },
  externalLinks: [String],
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: { type: String, required: true },
  messages: [messageSchema],
  startedAt: { type: Date, default: Date.now },
  endedAt: Date
});

export default mongoose.model("Conversation", conversationSchema);
