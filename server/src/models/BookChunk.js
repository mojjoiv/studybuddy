import mongoose from "mongoose";

const bookChunkSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", index: true },
  subject: { type: String, index: true },
  grade: { type: String, index: true },
  text: { type: String, required: true },
  vector: { type: [Number], required: true }, // vector stored here (Atlas index required separately)
  ord: Number
}, {timestamps: true}
);

export default mongoose.model("BookChunk", bookChunkSchema, "bookchunks");
