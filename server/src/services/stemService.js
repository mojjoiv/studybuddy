import { create, all } from "mathjs";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { vectorSearch } from "./retrievalService.js";

const math = create(all, { number: "number", matrix: "Array" });
const llm = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY, model: "gpt-4o-mini", temperature: 0.2 });
const emb = new OpenAIEmbeddings({ apiKey: process.env.OPENAI_API_KEY });

// Very simple: ask LLM to produce JSON steps with optional calc expressions for primary-level problems.
export const solveStem = async (question, filters) => {
  const qv = await emb.embedQuery(question);
  const hits = await vectorSearch(qv, filters);
  const context = hits.map(h => h.text).join("\n\n").slice(0, 6000);

  const systemPrompt = `You are a friendly primary-school STEM tutor. Use ONLY the textbook excerpts (if present). Break explanation into small steps. For arithmetic steps include a mathjs-compatible expression in "calc". Output strict JSON: {"steps":[{"explain":"...","calc":"..." }], "final":"..."}. Context:\n${context}`;

  const raw = await llm.invoke([{ role: "system", content: systemPrompt }, { role: "user", content: question }]);

  let parsed;
  try { parsed = JSON.parse(raw.content); }
  catch { return { steps: [{ explain: "Couldn't parse LLM plan. Here's the raw response: " + raw.content }], final: "See above" }; }

  const results = [];
  const scope = {};
  for (const s of parsed.steps || []) {
    if (s.calc) {
      try {
        const val = math.evaluate(s.calc, scope);
        if (s.store_as) scope[s.store_as] = val;
        results.push({ explain: s.explain, calc: s.calc, value: val });
      } catch (e) {
        results.push({ explain: s.explain, calc: s.calc, error: e.message });
      }
    } else {
      results.push({ explain: s.explain });
    }
  }

  return { steps: results, final: parsed.final || parsed.final_answer || "No final provided" };
};
