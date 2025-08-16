import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { vectorSearch } from "./retrievalService.js";
import { solveStem } from "./stemService.js";

const llm = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini", temperature: 0.3 });
const emb = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });

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
  if (["math","science"].includes(subject)) {
    // for primary we pass simple filters
    const solved = await solveStem(question, { subject, grade });
    const stepsOut = solved.steps.map((s,i)=> `Step ${i+1}: ${s.explain}${s.value!==undefined?`\n  Value: ${s.value}`:""}`).join("\n");
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
