import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import Book from "../models/Book.js";
import BookChunk from "../models/BookChunk.js";

const emb = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });

export const indexBook = async (bookId) => {
  const book = await Book.findById(bookId);
  if (!book) throw new Error("Book not found");

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 150 });
  const docs = await splitter.createDocuments([book.content]);

  const texts = docs.map(d => d.pageContent);
  const vectors = await emb.embedDocuments(texts);

  const ops = texts.map((text, i) => ({
    insertOne: {
      document: {
        bookId: book._id,
        subject: book.subject,
        grade: book.grade,
        text,
        vector: vectors[i],
        ord: i
      }
    }
  }));

  if (ops.length) await BookChunk.bulkWrite(ops);
  return { chunks: ops.length };
};
