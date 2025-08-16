import express from "express";
import { ask } from "../controllers/aiController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/ask", requireAuth, ask);

export default router;
