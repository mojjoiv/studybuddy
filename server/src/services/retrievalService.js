import BookChunk from "../models/BookChunk.js";

const idx = process.env.MONGODB_VECTOR_INDEX || "vector_index";
const topK = Number(process.env.TOP_K_PRIMARY || 4);

// Use Atlas Vector Search pipeline
export const vectorSearch = async (queryVector, { subject, grade }) => {
  const pipeline = [
    {
      $vectorSearch: {
        index: idx,
        path: "vector",
        queryVector,
        numCandidates: Math.max(topK * 8, 50),
        limit: topK
      }
    },
    { $match: { ...(subject ? { subject } : {}), ...(grade ? { grade } : {}) } },
    { $project: { text: 1, subject: 1, grade: 1, bookId: 1, score: { $meta: "vectorSearchScore" } } }
  ];

  const results = await BookChunk.aggregate(pipeline);
  return results;
};
