// Load environment variables first
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../../.env') }); // Adjust path based on your structure

import { ChatGroq } from "@langchain/groq";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { vectorSearch } from "./retrievalService.js";
import { solveStem } from "./stemService.js";

// Temporary hardcoded keys for testing - REMOVE LATER
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;

// Debug: Check if API key is loaded
console.log('Groq API Key present:', !!process.env.GROQ_API_KEY);
console.log('HF API Key present:', !!process.env.HF_API_KEY);

const llm = new ChatGroq({
  apiKey: GROQ_API_KEY,
  model: "llama3-8b-8192",
  temperature: 0.3
});

// Corrected: Use HuggingFaceInferenceEmbeddings with API key
const emb = new HuggingFaceInferenceEmbeddings({
  apiKey: HF_API_KEY, // Add API key
  model: "sentence-transformers/all-MiniLM-L6-v2" // Fixed model name
});

const styleInstruction = (preferences) => {
  const learn = preferences?.learningStyle === "visual"
    ? "Offer an analogy or describe a simple drawing."
    : preferences?.learningStyle === "step_by_step"
      ? "Break into small numbered steps."
      : "";
  return ["Explain simply and kindly for children.", learn].filter(Boolean).join(" ");
};

export const askGroundedPrimary = async ({ question, subject, grade, preferences }) => {
  // If simple math/physics/chemistry, delegate to stem solver (lightweight)
  if (["math", "science"].includes(subject)) {
    const solved = await solveStem(question, { subject, grade });
    const stepsOut = solved.steps
      .map((s, i) => `Step ${i + 1}: ${s.explain}${s.value !== undefined ? `\n  Value: ${s.value}` : ""}`)
      .join("\n");
    return `${stepsOut}\n\nFinal: ${solved.final}`;
  }

  // Non-STEM: RAG from bookchunks filtered by grade & subject
  const qv = await emb.embedQuery(question);
  const hits = await vectorSearch(qv, { subject, grade });
  const context = hits.map(h => h.text).join("\n\n").slice(0, 6000);

  if (!context) return "I couldn't find anything in your Grade's books. Try asking differently.";

  const system = {
    role: "system",
    content: `${styleInstruction(preferences)} Use only the provided textbook excerpts to answer. Excerpts:\n${context}`
  };
  const ai = await llm.invoke([system, { role: "user", content: question }]);
  return ai.content;
};