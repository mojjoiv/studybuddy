import express from "express";
import multer from "multer";
import { uploadBook, listBooks } from "../controllers/bookController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/upload", requireAuth, requireAdmin, upload.single("file"), uploadBook);
router.get("/", listBooks);

export default router;
