import express from "express";
import multer from "multer";
import { uploadBook, listBooks } from "../controllers/bookController.js";
import { requireAuth, requireAdmin, requireSuperAdmin } from "../middlewares/authMiddleware.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

/**
 * @route POST /api/books/upload
 * @desc Upload a new book (PDF or TXT), save & index into chunks
 * @access Private (Superadmin only)
 */
router.post(
  "/upload",
  requireAuth,
  requireSuperAdmin, // ✅ restrict to superadmins
  upload.single("file"),
  uploadBook
);

/**
 * @route GET /api/books
 * @desc List all books (filterable by grade & subject via query params)
 * @access Public (or requireAuth if you want students only)
 *
 * Examples:
 *   GET /api/books?grade=Grade%204
 *   GET /api/books?subject=science
 *   GET /api/books?grade=Grade%204&subject=science
 */
router.get("/", listBooks);

export default router;
