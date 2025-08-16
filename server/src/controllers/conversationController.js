import Conversation from "../models/Conversation.js";

export const startSession = async (req, res) => {
  const { subject } = req.body;
  const userId = req.user._id;
  const c = await Conversation.create({ userId, subject, messages: [] });
  res.json({ sessionId: c._id, startedAt: c.startedAt });
};

export const endSession = async (req, res) => {
  const c = await Conversation.findByIdAndUpdate(req.params.sessionId, { endedAt: new Date() }, { new: true });
  res.json({ sessionId: c._id, endedAt: c.endedAt });
};

export const getSession = async (req, res) => {
  const c = await Conversation.findById(req.params.sessionId);
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
};
