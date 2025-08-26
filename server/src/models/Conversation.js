// models/Conversation.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["student", "ai"], required: true },
  content: { type: String, required: true },
  externalLinks: [String],
  source: {
    type: String,
    enum: ["stem", "book", "internet", "none"],
    default: "none",
  }, // ✅ track where AI answer came from
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: { type: String, required: true },
  messages: [messageSchema],
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
});

export default mongoose.model("Conversation", conversationSchema);
