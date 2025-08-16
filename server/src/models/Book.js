import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, required: true }, // primary targeting
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Book", bookSchema);
