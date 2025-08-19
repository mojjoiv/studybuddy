import { askGroundedPrimary } from "../services/aiService.js";
import Conversation from "../models/Conversation.js";
import { extractLinks } from "../utils/links.js";
import User from "../models/User.js";

export const ask = async (req, res) => {
  try {
    const { sessionId, subject, question } = req.body;
    const user = req.user;

    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    // if sessionId not provided, create one automatically
    let conversation;
    if (!sessionId) {
      if (!subject) {
        return res.status(400).json({ error: "Either provide sessionId or subject to start a new session" });
      }
      conversation = await Conversation.create({
        userId: user._id,
        subject,
        messages: []
      });
    } else {
      conversation = await Conversation.findById(sessionId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
    }

    // Ensure grade from user is used for grounding
    const answer = await askGroundedPrimary({
      question,
      subject: conversation.subject,
      grade: user.grade,
      preferences: user.preferences || {}
    });

    const links = extractLinks(answer);

    // Store both student Q and AI answer in conversation
    await Conversation.findByIdAndUpdate(conversation._id, {
      $push: {
        messages: [
          { role: "student", content: question, externalLinks: [] },
          { role: "ai", content: answer, externalLinks: links }
        ]
      }
    });

    // Save history for quick student feedback
    user.history.push({ question, answer, subject: conversation.subject });
    await user.save();

    res.json({
      sessionId: conversation._id,
      answer,
      externalLinks: links,
      externalLinkTriggered: links.length > 0
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
