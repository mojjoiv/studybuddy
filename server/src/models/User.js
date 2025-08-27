import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  question: String,
  answer: String,
  subject: String,
  source: {
    type: String,
    enum: ["stem", "book", "internet", "none", "error"],
    default: "none"
  },
  correct: { type: Boolean, default: null },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // roles: student, admin, superadmin
  role: { 
    type: String, 
    enum: ["student", "admin", "superadmin"], 
    default: "student" 
  },

  // primary-specific
  level: { type: String, enum: ["primary"], default: "primary" },
  grade: { type: String, required: function () { return this.role === "student"; } }, // only required for students
  parentEmail: { type: String },
  teacherEmail: { type: String },

  preferences: {
    learningStyle: { 
      type: String, 
      enum: ["visual","textual","step_by_step"], 
      default: "step_by_step" 
    }
  },

  history: [historySchema],

  weakAreas: [
    { 
      subject: String, 
      topic: String, 
      mistakes: { type: Number, default: 0 } 
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
