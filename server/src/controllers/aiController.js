import { askGroundedPrimary } from "../services/aiService.js";
import Conversation from "../models/Conversation.js";
import { extractLinks } from "../utils/links.js";
import User from "../models/User.js";

export const ask = async (req, res) => {
  try {
    const { sessionId, subject, question } = req.body;
    const user = req.user;
    if (!sessionId || !subject || !question) return res.status(400).json({ error: "sessionId, subject, question required" });

    // Ensure grade from user used for retrieval
    const answer = await askGroundedPrimary({
      question,
      subject,
      grade: user.grade,
      preferences: user.preferences
    });

    const links = extractLinks(answer);

    // store in conversation
    await Conversation.findByIdAndUpdate(sessionId, {
      $push: { messages: [{ role: "student", content: question, externalLinks: [] }, { role: "ai", content: answer, externalLinks: links }] }
    });

    // save to user history
    user.history.push({ question, answer, subject });
    await user.save();

    res.json({ answer, externalLinks: links, externalLinkTriggered: links.length > 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
