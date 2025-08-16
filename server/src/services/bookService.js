import fs from "fs";
import pdfParse from "pdf-parse";
import Book from "../models/Book.js";
import { cleanText } from "../utils/text.js";
import { indexBook } from "./embeddingService.js";

export const saveBookFromFile = async (file, { title, subject, grade }) => {
  if (!file) throw new Error("File is required");
  if (!title || !subject || !grade) throw new Error("title, subject, grade are required");

  let text = "";
  if (file.mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);
    text = pdfData.text || "";
  } else if (file.mimetype === "text/plain") {
    text = fs.readFileSync(file.path, "utf-8");
  } else {
    throw new Error("Unsupported file type (use PDF or TXT).");
  }

  text = cleanText(text);
  const book = await Book.create({ title, subject, grade, content: text });

  await indexBook(book._id);

  try { fs.unlinkSync(file.path); } catch {}
  return book;
};
