import { saveBookFromFile } from "../services/bookService.js";
import Book from "../models/Book.js";

export const uploadBook = async (req, res) => {
  try {
    const { title, subject, grade } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { book, chunks, provider } = await saveBookFromFile(req.file, {
      title,
      subject,
      grade,
    });

    res.json({
      message: "Book uploaded & indexed",
      book: {
        id: book._id,
        title: book.title,
        subject: book.subject,
        grade: book.grade,
        createdAt: book.createdAt,
      },
      chunks,
      embeddingProvider: provider,
    });
  } catch (e) {
    console.error("Book upload error:", e.message);
    res.status(400).json({ error: e.message });
  }
};

export const listBooks = async (req, res) => {
  try {
    const { grade, subject } = req.query;
    const filter = {};
    if (grade) filter.grade = grade;
    if (subject) filter.subject = subject;

    const books = await Book.find(filter).select(
      "_id title subject grade createdAt"
    );

    res.json(books);
  } catch (e) {
    console.error("List books error:", e.message);
    res.status(500).json({ error: "Failed to fetch books" });
  }
};
