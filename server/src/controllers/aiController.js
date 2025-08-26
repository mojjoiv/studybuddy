// src/controllers/aiController.js

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

    // If sessionId not provided, create new session
    let conversation;
    if (!sessionId) {
      if (!subject) {
        return res.status(400).json({
          error: "Either provide sessionId or subject to start a new session",
        });
      }
      conversation = await Conversation.create({
        userId: user._id,
        subject,
        messages: [],
      });
    } else {
      conversation = await Conversation.findById(sessionId);
      if (!conversation) {
        return res.status(404).json({
          error: "Conversation not found. Please start a new session.",
        });
      }
    }

    let answer, source;
    try {
      const result = await askGroundedPrimary({
        question,
        subject: conversation.subject,
        grade: user.grade,
        preferences: user.preferences || {},
        name: user.name, // ✅ pass student's name
      });

      answer = result.answer;
      source = result.source;

      // ✅ Safety fallback: prepend name if model didn’t naturally use it
      if (answer && user.name && !answer.includes(user.name)) {
        answer = `Hi ${user.name}! 👋\n\n${answer}`;
      }
    } catch (err) {
      console.error("AI Service failed:", err.message);
      return res
        .status(500)
        .json({ error: "AI service failed. Please try again later." });
    }

    if (!answer) {
      return res.status(200).json({
        sessionId: conversation._id,
        answer:
          "I couldn’t generate an answer right now. Please try again.",
        source: "none",
        externalLinks: [],
        externalLinkTriggered: false,
      });
    }

    const links = extractLinks(answer);

    // Store both student Q and AI answer in conversation
    await Conversation.findByIdAndUpdate(conversation._id, {
      $push: {
        messages: [
          { role: "student", content: question, externalLinks: [] },
          {
            role: "ai",
            content: answer,
            externalLinks: links,
            source,
          },
        ],
      },
    });

    // Save history for quick student feedback
    user.history.push({
      question,
      answer,
      subject: conversation.subject,
      source,
    });
    await user.save();

    res.json({
      sessionId: conversation._id,
      answer,
      source,
      externalLinks: links,
      externalLinkTriggered: links.length > 0,
    });
  } catch (e) {
    console.error("Ask controller error:", e.message);
    res.status(500).json({ error: e.message });
  }
};
