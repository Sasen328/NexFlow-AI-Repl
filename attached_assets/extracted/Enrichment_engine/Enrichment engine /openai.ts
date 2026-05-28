import OpenAI from "openai";

// Prefer direct real key (works in both dev and prod).
// AI_INTEGRATIONS proxy (localhost:1106) is dev-only — never use as baseURL.
const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("No OpenAI API key configured. Set OPENAI_API_KEY.");
}

export const openai = new OpenAI({ apiKey });
