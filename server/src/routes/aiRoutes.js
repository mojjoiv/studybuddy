import express from "express";
import { ask } from "../controllers/aiController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/ai/ask
 * @desc    Ask a question to the AI assistant
 * @access  Private (students only)
 * 
 * Request body:
 *   {
 *     "sessionId": "optional",   // reuse an existing conversation
 *     "subject": "Math",         // required if starting new session
 *     "question": "What is 2+2?" // required
 *   }
 * 
 * Response:
 *   {
 *     "sessionId": "...",                // always returned so frontend can reuse
 *     "answer": "The answer is 4",
 *     "externalLinks": ["..."],          // any links found in AI response
 *     "externalLinkTriggered": true|false
 *   }
 */
router.post("/ask", requireAuth, ask);

export default router;
