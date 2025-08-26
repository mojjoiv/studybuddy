// src/services/aiService.js

// Load environment variables
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "../../.env") }); // Adjust path

import { ChatGroq } from "@langchain/groq";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { vectorSearch } from "./retrievalService.js";
import { solveStem } from "./stemService.js";

// API Keys
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;

// Debug
console.log("Groq API Key present:", !!GROQ_API_KEY);
console.log("HF API Key present:", !!HF_API_KEY);

// Groq LLM
const llm = new ChatGroq({
  apiKey: GROQ_API_KEY,
  model: "llama3-8b-8192",
  temperature: 0.3,
});

// HuggingFace Embeddings
const emb = new HuggingFaceInferenceEmbeddings({
  apiKey: HF_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

// Instruction builder (✅ now uses student's name)
const styleInstruction = (preferences, name) => {
  const learn =
    preferences?.learningStyle === "visual"
      ? "Offer an analogy or describe a simple drawing."
      : preferences?.learningStyle === "step_by_step"
      ? "Break into small numbered steps."
      : "";

  const studentName = name || "young learner"; // fallback if no name found

  return [
    `Explain simply and kindly for children. Address the student by their name (${studentName}) instead of generic terms like 'young explorers'.`,
    learn,
  ]
    .filter(Boolean)
    .join(" ");
};

// Main function
export const askGroundedPrimary = async ({
  question,
  subject,
  grade,
  preferences,
  name, // ✅ added name
}) => {
  try {
    // 1. STEM fast-solver
    if (["math", "science"].includes(subject)) {
      try {
        const solved = await solveStem(question, { subject, grade });
        if (solved?.final) {
          const stepsOut = solved.steps
            .map(
              (s, i) =>
                `Step ${i + 1}: ${s.explain}${
                  s.value !== undefined ? `\n  Value: ${s.value}` : ""
                }`
            )
            .join("\n");
          return {
            answer: `${stepsOut}\n\nFinal: ${solved.final}`,
            source: "stem",
          };
        }
      } catch (err) {
        console.warn("STEM solver failed:", err.message);
      }
    }

    // 2. Vector Search (RAG)
    let context = "";
    try {
      const qv = await emb.embedQuery(question);
      const hits = await vectorSearch(qv, { subject, grade });
      context = hits.map((h) => h.text).join("\n\n").slice(0, 6000);

      if (context) {
        const system = {
          role: "system",
          content: `${styleInstruction(
            preferences,
            name
          )} Use only the provided textbook excerpts to answer. Excerpts:\n${context}`,
        };
        const ai = await llm.invoke([system, { role: "user", content: question }]);
        return { answer: ai.content, source: "book" };
      }
    } catch (err) {
      console.warn("Vector search failed:", err.message);
    }

    // 3. Fallback to internet LLM (Groq direct)
    try {
      const ai = await llm.invoke([
        {
          role: "system",
          content: `${styleInstruction(
            preferences,
            name
          )} Answer from your general knowledge.`,
        },
        { role: "user", content: question },
      ]);
      return { answer: ai.content, source: "internet" };
    } catch (err) {
      console.error("Internet fallback failed:", err.message);
      return {
        answer: "I couldn't find an answer right now. Please try again later.",
        source: "none",
      };
    }
  } catch (e) {
    console.error("askGroundedPrimary error:", e.message);
    return {
      answer: "Something went wrong while generating an answer.",
      source: "error",
    };
  }
};
