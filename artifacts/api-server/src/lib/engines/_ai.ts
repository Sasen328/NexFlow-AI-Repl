/**
 * Thin AI helpers used by the four engines.
 *
 * Provider routing strategy (in priority order):
 *   1. Direct Gemini REST API  → most reliable in this environment
 *   2. Perplexity via OpenRouter → live web search with citations
 *   3. Claude via OpenRouter   → knowledge synthesis / structured JSON
 *   4. GPT-4o-mini via OpenRouter → fallback synthesis
 *
 * All helpers NEVER throw — they log and return empty string / fallback so
 * the waterfall keeps moving even when one provider is down.
 *
 * fanOut signature: accepts plain Array<() => Promise<T>> + optional
 * second arg of number | { timeoutMs?: number }.
 * Returns PromiseSettledResult<T>[] so callers can check .status === "fulfilled".
 *
 * synthesizeJson: returns T directly (not wrapped in { data, provider }).
 */

import { jsonrepair } from "jsonrepair";
import { aiChat, aiJson, aiGeminiChat, type AiProvider } from "../ai.js";
import { logger } from "../logger.js";

export type FanOutResult<T> = {
  /** PromiseSettledResult-compatible */
  status: "fulfilled" | "rejected";
  value?: T;
  reason?: unknown;
  /** Named-job-compatible (r.name, r.ok, r.value) */
  name: string;
  ok: boolean;
  error?: string;
};

type JobSpec<T> = (() => Promise<T>) | { name: string; run: () => Promise<T> };

/**
 * Run N AI calls in parallel; never throws.
 * Accepts plain functions OR { name, run } objects.
 * Returns results that satisfy BOTH PromiseSettledResult AND {name,ok,value} patterns.
 */
export async function fanOut<T>(
  jobs: Array<JobSpec<T>>,
  optsOrMs: number | { timeoutMs?: number } = 18_000,
): Promise<FanOutResult<T>[]> {
  const ms =
    typeof optsOrMs === "number" ? optsOrMs : (optsOrMs.timeoutMs ?? 18_000);

  const wrapped = jobs.map((job, i) => {
    const name = typeof job === "function" ? `job_${i}` : job.name;
    const fn   = typeof job === "function" ? job          : job.run;
    return Promise.race([
      fn().then((value): FanOutResult<T> => ({
        status: "fulfilled", value, name, ok: true,
      })),
      new Promise<FanOutResult<T>>((resolve) =>
        setTimeout(
          () => resolve({ status: "rejected", reason: new Error("timeout"), name, ok: false, error: "timeout" }),
          ms,
        ),
      ),
    ]).catch((reason): FanOutResult<T> => ({
      status: "rejected",
      reason,
      name,
      ok: false,
      error: reason?.message ?? String(reason),
    }));
  });

  return Promise.all(wrapped);
}

/** Free-text web research — Perplexity (live web) via OpenRouter, falls back to Gemini direct. */
export async function searchWeb(query: string, maxTokens = 1200): Promise<string> {
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
export async function synthesizeGeminiDirect(
  optsOrPrompt: { system: string; user: string; maxTokens?: number } | string,
  maxTokensLegacy?: number,
): Promise<string> {
  const opts =
    typeof optsOrPrompt === "string"
      ? { system: "You are a Saudi B2B intelligence analyst.", user: optsOrPrompt, maxTokens: maxTokensLegacy ?? 2000 }
      : optsOrPrompt;
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

/** Extract the outermost JSON object from a possibly-polluted AI response. */
function extractJsonBlock(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1]!.trim();
  const braceStart = text.indexOf("{");
  const braceEnd = text.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) return text.slice(braceStart, braceEnd + 1);
  return text.trim();
}

/** Try parsing JSON; if that fails, try extractJsonBlock + jsonrepair. */
function robustParse<T>(raw: string): T {
  try { return JSON.parse(raw) as T; } catch { /* fall through */ }
  const block = extractJsonBlock(raw);
  try { return JSON.parse(block) as T; } catch { /* fall through */ }
  return JSON.parse(jsonrepair(block)) as T;
}

/**
 * Strict-JSON synthesis — tries providers in order, returns first usable result.
 * Returns T directly (not wrapped in { data, provider }).
 *
 * Order: DeepSeek → Gemini JSON-mode → Claude → GPT-4o-mini → OpenRouter auto → fallback.
 */
export async function synthesizeJson<T>(opts: {
  system: string;
  user: string;
  fallback: T;
  preferredProvider?: AiProvider;
  maxTokens?: number;
}): Promise<T> {
  const maxTokens = opts.maxTokens ?? 3000;

  // ── 0. DeepSeek (fast & cheap JSON synthesis if key available)
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    try {
      const resp = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${deepseekKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: opts.system },
            { role: "user", content: opts.user },
          ],
          max_tokens: maxTokens,
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (resp.ok) {
        const d = await resp.json() as { choices?: Array<{ message?: { content?: string } }> };
        const raw = d.choices?.[0]?.message?.content;
        if (raw?.trim()) {
          const parsed = robustParse<T>(raw);
          if (isGoodData(parsed)) {
            logger.info({ scope: "engines/ai/synthesizeJson" }, "synthesized via deepseek");
            return parsed;
          }
        }
      }
    } catch (e) {
      logger.warn({ err: e, scope: "engines/ai/synthesizeJson/deepseek" }, "deepseek JSON failed");
    }
  }

  // ── 1. Direct Gemini with responseMimeType: "application/json"
  try {
    const raw = await aiChat({
      provider: "gemini",
      system: opts.system,
      user: opts.user,
      json: true,
      maxTokens,
    });
    if (raw?.trim()) {
      const parsed = robustParse<T>(raw);
      if (isGoodData(parsed)) {
        logger.info({ scope: "engines/ai/synthesizeJson" }, "synthesized via gemini_direct");
        return parsed;
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
      return data;
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
      return data;
    }
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/synthesizeJson/openai" }, "gpt JSON failed");
  }

  // ── 4. Gemini via OpenRouter (last resort)
  try {
    const data = await aiJson<T>({
      provider: "gemini",
      system: opts.system,
      user: opts.user,
      fallback: opts.fallback,
    });
    if (isGoodData(data)) {
      logger.info({ scope: "engines/ai/synthesizeJson" }, "synthesized via gemini_openrouter");
      return data;
    }
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/synthesizeJson/gemini" }, "openrouter gemini JSON failed");
  }

  logger.warn({ scope: "engines/ai/synthesizeJson" }, "all providers failed — using fallback");
  return opts.fallback;
}

/** Heuristic: a candidate string looks like a real human name. */
export function looksLikeName(s: string): boolean {
  if (!s) return false;
  const t = s.trim();
  if (t.length < 4 || t.length > 80) return false;
  if (/[<>{}|\[\]]/.test(t)) return false;
  if (/^https?:|^www\./i.test(t)) return false;
  return /\s/.test(t) || /[\u0600-\u06FF]/.test(t);
}
