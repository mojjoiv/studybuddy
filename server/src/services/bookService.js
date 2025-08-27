import fs from "fs";
import pdfParse from "pdf-parse";
import Book from "../models/Book.js";
import BookChunk from "../models/BookChunk.js";
import { cleanText } from "../utils/text.js";
import { indexBook } from "./embeddingService.js";

/**
 * Save or update a book from a PDF or TXT file.
 * If the same title+subject+grade exists, overwrite content and reindex.
 */
export const saveBookFromFile = async (file, { title, subject, grade }) => {
  if (!file) throw new Error("File is required");
  if (!title || !subject || !grade) {
    throw new Error("title, subject, grade are required");
  }

  let text = "";
  try {
    if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text || "";
    } else if (file.mimetype === "text/plain") {
      text = fs.readFileSync(file.path, "utf-8");
    } else {
      throw new Error("Unsupported file type (use PDF or TXT).");
    }
  } finally {
    // Clean up uploaded file
    try {
      fs.unlinkSync(file.path);
    } catch {}
  }

  text = cleanText(text);

  // Upsert book
  let book = await Book.findOne({ title, subject, grade });
  if (book) {
    // Update existing book
    book.content = text;
    await book.save();

    // Delete old chunks before reindexing
    await BookChunk.deleteMany({ bookId: book._id });
  } else {
    // Create new book
    book = await Book.create({ title, subject, grade, content: text });
  }

  // Index (split + embed) book into chunks
  const { chunks, provider } = await indexBook(book._id);

  return { book, chunks, provider };
};
