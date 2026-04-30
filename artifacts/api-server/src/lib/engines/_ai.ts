/**
 * Thin AI helpers used by the four engines.
 *
 * Routes everything through OpenRouter (single API key → all major model
 * families). Provider names map to OpenRouter slugs in `lib/ai.ts`:
 *   - "perplexity" → perplexity/sonar       (live web search)
 *   - "gemini"     → google/gemini-2.5-flash (Google-grounded)
 *   - "anthropic"  → anthropic/claude-sonnet-4.6 (synthesis, parsing)
 *   - "openai"     → openai/gpt-4o-mini      (synthesis fallback)
 *
 * All helpers degrade gracefully — empty string / null on failure — so the
 * waterfall keeps moving when one model is down.
 */

import { aiChat, aiJson, type AiProvider } from "../ai.js";
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

/** Free-text web research — uses Perplexity's online model via OpenRouter. */
export async function searchWeb(query: string, maxTokens = 1200): Promise<string> {
  try {
    const text = await aiChat({
      provider: "perplexity",
      system: "You are a web research assistant. Answer the user's question using up-to-date information from the public web. Cite specific facts. Use compact bullets.",
      user: query,
      maxTokens,
    });
    return text.trim();
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/searchWeb" }, "perplexity search failed");
    return "";
  }
}

/** Google-grounded research via Gemini. */
export async function searchGrounded(query: string, maxTokens = 1200): Promise<string> {
  try {
    const text = await aiChat({
      provider: "gemini",
      system: "You are a research assistant with Google search. Use grounded facts. Be concise.",
      user: query,
      maxTokens,
    });
    return text.trim();
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/searchGrounded" }, "gemini grounded failed");
    return "";
  }
}

/** Knowledge synthesis — Claude Sonnet via OpenRouter. */
export async function synthesizeClaude(opts: { system: string; user: string; maxTokens?: number }) {
  try {
    return (await aiChat({
      provider: "anthropic",
      system: opts.system,
      user: opts.user,
      maxTokens: opts.maxTokens ?? 2000,
    })).trim();
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/claude" }, "claude failed");
    return "";
  }
}

/** Knowledge synthesis — GPT-4o-mini via OpenRouter. */
export async function synthesizeGpt(opts: { system: string; user: string; maxTokens?: number }) {
  try {
    return (await aiChat({
      provider: "openai",
      system: opts.system,
      user: opts.user,
      maxTokens: opts.maxTokens ?? 2000,
    })).trim();
  } catch (e) {
    logger.warn({ err: e, scope: "engines/ai/gpt" }, "gpt failed");
    return "";
  }
}

/** Strict-JSON synthesis — tries Claude first, falls back to GPT-4o-mini. */
export async function synthesizeJson<T>(opts: {
  system: string;
  user: string;
  fallback: T;
  preferredProvider?: AiProvider;
  maxTokens?: number;
}): Promise<{ data: T; provider: string }> {
  const order: AiProvider[] = opts.preferredProvider
    ? [opts.preferredProvider, "anthropic", "openai", "gemini"]
    : ["anthropic", "openai", "gemini"];
  const tried = new Set<AiProvider>();
  for (const p of order) {
    if (tried.has(p)) continue;
    tried.add(p);
    try {
      const data = await aiJson<T>({
        provider: p,
        system: opts.system,
        user: opts.user,
        fallback: opts.fallback,
      });
      // Heuristic: object with at least one non-empty top-level value
      if (data && typeof data === "object" && Object.values(data as Record<string, unknown>).some((v) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))) {
        return { data, provider: p };
      }
    } catch (e) {
      logger.warn({ err: e, scope: "engines/ai/synthesizeJson", provider: p }, "synth failed");
    }
  }
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
