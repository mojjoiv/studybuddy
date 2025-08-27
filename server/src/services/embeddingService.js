import Book from "../models/Book.js";
import BookChunk from "../models/BookChunk.js";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

const HF_API_KEY = process.env.HF_API_KEY;

// HuggingFace embeddings instance
const emb = new HuggingFaceInferenceEmbeddings({
  apiKey: HF_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

// Utility: chunk text into ~500 char pieces
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);
    start = end - overlap; // overlap for context continuity
  }

  return chunks;
}

// Main: index a book into BookChunk
export const indexBook = async (bookId) => {
  const book = await Book.findById(bookId);
  if (!book) throw new Error("Book not found");

  const chunks = chunkText(book.content);

  console.log(`📚 Indexing book: ${book.title}, chunks: ${chunks.length}`);

  const vectors = await emb.embedDocuments(chunks);

  const docs = chunks.map((chunk, i) => ({
    bookId: book._id,
    subject: book.subject,
    grade: book.grade,
    text: chunk,
    vector: vectors[i],
    ord: i,
  }));

  // insert many chunks at once
  await BookChunk.insertMany(docs);

  console.log(`✅ Indexed ${docs.length} chunks for ${book.title}`);
};
