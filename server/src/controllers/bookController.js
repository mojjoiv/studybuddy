import { saveBookFromFile } from "../services/bookService.js";
import Book from "../models/Book.js";

export const uploadBook = async (req, res) => {
  try {
    const { title, subject, grade } = req.body;
    const book = await saveBookFromFile(req.file, { title, subject, grade });
    res.json({ message: "Book uploaded & indexed", book });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const listBooks = async (req, res) => {
  const { grade } = req.query;
  const filter = grade ? { grade } : {};
  const books = await Book.find(filter).select("_id title subject grade createdAt");
  res.json(books);
};
