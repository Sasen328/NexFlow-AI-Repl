/**
 * Thin AI helpers used by the four engines.
 *
 * Provider routing strategy (in priority order):
 *   1. Direct Gemini REST API  → most reliable in this environment; used for
 *      grounded research and JSON synthesis fallback.
 *   2. Perplexity via OpenRouter → live web search with citations.
 *   3. Claude via OpenRouter   → knowledge synthesis / structured JSON.
 *   4. GPT-4o-mini via OpenRouter → fallback synthesis.
 *
 * All helpers NEVER throw — they log and return empty string / fallback so
 * the waterfall keeps moving even when one provider is down.
 */

import { aiChat, aiJson, aiGeminiChat, type AiProvider } from "../ai.js";
import { logger } from "../logger.js";

/** Run N AI calls in parallel; never throws — failures become empty strings. */
export async function fanOut<T>(
  jobs: Array<{ name: string; run: () => Promise<T> }>,
  timeoutMs = 45_000,
): Promise<Array<{ name: string; ok: boolean; value?: T; error?: string }>> {
  const wrap = jobs.map(({ name, run }) =>
    Promise.race([
      run().then((value) => ({ name, ok: true as const, value })),
      new Promise<{ name: string; ok: false; error: string }>((resolve) =>
        setTimeout(() => resolve({ name, ok: false, error: "timeout" }), timeoutMs),
      ),
    ]).catch((err) => ({
      name,
      ok: false as const,
      error: err?.message ?? String(err),
    })),
  );
  return Promise.all(wrap);
}

/** Free-text web research — Perplexity (live web) via OpenRouter, falls back to Gemini direct. */
export async function searchWeb(query: string, maxTokens = 1200): Promise<string> {
  // Primary: Perplexity sonar via OpenRouter (live web search with citations)
  try {
    const text = await aiChat({
      provider: "perplexity",
      system: "You are a web research assistant. Answer using up-to-date information from the public web. Include specific names, titles, and citations. Use compact bullet points.",
      user: query,
      maxTokens,
    });
    if (text?.trim()) return text.trim();
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/searchWeb/perplexity" }, "perplexity failed");
  }

  // Fallback: Direct Gemini (works reliably in this environment)
  try {
    const text = await aiGeminiChat({
      system: "You are a research analyst with comprehensive knowledge of GCC/MENA business leaders and companies. Answer the question factually and specifically. Use bullet points. Include names, titles, LinkedIn URLs if known.",
      messages: [{ role: "user", text: query }],
      maxTokens,
    });
    if (text?.trim()) return text.trim();
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/searchWeb/gemini_fallback" }, "gemini fallback failed");
  }
  return "";
}

/**
 * Google-grounded research — uses direct Gemini REST API (most reliable).
 * Falls back to OpenRouter Gemini, then Perplexity.
 */
export async function searchGrounded(query: string, maxTokens = 1200): Promise<string> {
  // Primary: Direct Gemini API (proven working — same key used by business card scanner)
  try {
    const text = await aiGeminiChat({
      system: "You are a research analyst with deep knowledge of GCC/MENA business, government, and corporate leadership. Answer factually and specifically. Include names, titles, dates, and sources. Bullet-point format.",
      messages: [{ role: "user", text: query }],
      maxTokens,
    });
    if (text?.trim()) return text.trim();
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/searchGrounded/direct" }, "direct gemini failed");
  }

  // Fallback: OpenRouter Gemini
  try {
    const text = await aiChat({
      provider: "gemini",
      system: "You are a research assistant. Use grounded facts. Be specific and concise.",
      user: query,
      maxTokens,
    });
    if (text?.trim()) return text.trim();
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/searchGrounded/openrouter" }, "openrouter gemini failed");
  }

  // Last resort: Perplexity
  try {
    const text = await aiChat({
      provider: "perplexity",
      system: "You are a research assistant. Use grounded facts.",
      user: query,
      maxTokens,
    });
    if (text?.trim()) return text.trim();
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/searchGrounded/perplexity" }, "perplexity fallback failed");
  }
  return "";
}

/** Direct Gemini knowledge synthesis — for structured data extraction and dossiers. */
export async function synthesizeGeminiDirect(opts: { system: string; user: string; maxTokens?: number }): Promise<string> {
  try {
    const text = await aiGeminiChat({
      system: opts.system,
      messages: [{ role: "user", text: opts.user }],
      maxTokens: opts.maxTokens ?? 2000,
    });
    return text?.trim() ?? "";
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/geminiDirect" }, "direct gemini synthesis failed");
    return "";
  }
}

/** Knowledge synthesis — Claude Sonnet via OpenRouter. */
export async function synthesizeClaude(opts: { system: string; user: string; maxTokens?: number }): Promise<string> {
  try {
    const text = await aiChat({
      provider: "anthropic",
      system: opts.system,
      user: opts.user,
      maxTokens: opts.maxTokens ?? 2000,
    });
    return text?.trim() ?? "";
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/claude" }, "claude failed");
    return "";
  }
}

/** Knowledge synthesis — GPT-4o-mini via OpenRouter. */
export async function synthesizeGpt(opts: { system: string; user: string; maxTokens?: number }): Promise<string> {
  try {
    const text = await aiChat({
      provider: "openai",
      system: opts.system,
      user: opts.user,
      maxTokens: opts.maxTokens ?? 2000,
    });
    return text?.trim() ?? "";
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/gpt" }, "gpt failed");
    return "";
  }
}

function isGoodData(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  return Object.values(data as Record<string, unknown>).some(
    (v) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0),
  );
}

function extractJsonBlock(text: string): string {
  // Try to pull a JSON block out of a free-text Gemini response
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1]!.trim();
  const braceStart = text.indexOf("{");
  const braceEnd = text.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) return text.slice(braceStart, braceEnd + 1);
  return text.trim();
}

/**
 * Strict-JSON synthesis — tries providers in order, returns first usable result.
 *
 * Order: direct Gemini JSON → Claude → GPT-4o-mini → Gemini via OpenRouter.
 * Each provider catches its own errors. Final fallback = caller's `opts.fallback`.
 */
export async function synthesizeJson<T>(opts: {
  system: string;
  user: string;
  fallback: T;
  preferredProvider?: AiProvider;
  maxTokens?: number;
}): Promise<{ data: T; provider: string }> {
  const maxTokens = opts.maxTokens ?? 4500;

  // ── 1. Direct Gemini (most reliable in this environment)
  try {
    const jsonSystem = opts.system + "\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanation, no code fences.";
    const raw = await aiGeminiChat({
      system: jsonSystem,
      messages: [{ role: "user", text: opts.user }],
      maxTokens,
    });
    if (raw?.trim()) {
      const parsed = JSON.parse(extractJsonBlock(raw)) as T;
      if (isGoodData(parsed)) {
        logger.info({ scope: "engines/ai/synthesizeJson" }, "synthesized via gemini_direct");
        return { data: parsed, provider: "gemini_direct" };
      }
    }
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/synthesizeJson/gemini_direct" }, "direct gemini JSON failed");
  }

  // ── 2. Claude via OpenRouter
  try {
    const data = await aiJson<T>({
      provider: "anthropic",
      system: opts.system,
      user: opts.user,
      fallback: opts.fallback,
    });
    if (isGoodData(data)) {
      logger.info({ scope: "engines/ai/synthesizeJson" }, "synthesized via anthropic");
      return { data, provider: "anthropic" };
    }
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/synthesizeJson/anthropic" }, "claude JSON failed");
  }

  // ── 3. GPT-4o-mini via OpenRouter
  try {
    const data = await aiJson<T>({
      provider: "openai",
      system: opts.system,
      user: opts.user,
      fallback: opts.fallback,
    });
    if (isGoodData(data)) {
      logger.info({ scope: "engines/ai/synthesizeJson" }, "synthesized via openai");
      return { data, provider: "openai" };
    }
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/synthesizeJson/openai" }, "gpt JSON failed");
  }

  // ── 4. Gemini via OpenRouter (last resort proxy path)
  try {
    const data = await aiJson<T>({
      provider: "gemini",
      system: opts.system,
      user: opts.user,
      fallback: opts.fallback,
    });
    if (isGoodData(data)) {
      logger.info({ scope: "engines/ai/synthesizeJson" }, "synthesized via gemini_openrouter");
      return { data, provider: "gemini_openrouter" };
    }
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/synthesizeJson/gemini" }, "openrouter gemini JSON failed");
  }

  logger.warn({ scope: "engines/ai/synthesizeJson" }, "all providers failed — using fallback");
  return { data: opts.fallback, provider: "fallback" };
}

/** Heuristic: a candidate string looks like a real human name. */
export function looksLikeName(s: string): boolean {
  if (!s) return false;
  const t = s.trim();
  if (t.length < 4 || t.length > 80) return false;
  if (/[<>{}|\[\]]/.test(t)) return false;
  if (/^https?:|^www\./i.test(t)) return false;
  // At least one space (first + last name) OR Arabic letters
  return /\s/.test(t) || /[\u0600-\u06FF]/.test(t);
}
