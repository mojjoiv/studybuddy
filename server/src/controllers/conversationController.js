// controllers/conversationController.js
import Conversation from "../models/Conversation.js";

// Start a new conversation
export const startSession = async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) return res.status(400).json({ error: "subject is required" });

    const c = await Conversation.create({ userId: req.user._id, subject, messages: [] });
    res.status(201).json({ sessionId: c._id, startedAt: c.startedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// End a conversation
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const c = await Conversation.findByIdAndUpdate(sessionId, { endedAt: new Date() }, { new: true });
    if (!c) return res.status(404).json({ error: "Conversation not found" });

    res.json({ sessionId: c._id, endedAt: c.endedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get conversation details
export const getSession = async (req, res) => {
  try {
    const c = await Conversation.findById(req.params.sessionId);
    if (!c) return res.status(404).json({ error: "Conversation not found" });

    res.json(c);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
