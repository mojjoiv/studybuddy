import express from "express";
import { startSession, endSession, getSession } from "../controllers/conversationController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/start", requireAuth, startSession);
router.post("/end/:sessionId", requireAuth, endSession);
router.get("/:sessionId", requireAuth, getSession);

export default router;
