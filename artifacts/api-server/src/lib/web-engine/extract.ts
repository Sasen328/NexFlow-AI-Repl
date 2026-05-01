/**
 * Schema-driven extraction — Firecrawl `/extract` equivalent.
 *
 * Caller provides a JSON Schema (or Zod schema serialized to JSON) and a
 * list of URLs; we scrape each, convert to markdown, then ask Gemini to
 * fill the schema. Returns one structured object per URL plus a merged
 * "best of" object.
 */

import { z } from "zod";
import { scraperFetch } from "../enrichment/connectors/web-scraper.js";
import { htmlToMarkdown } from "./markdown.js";
import { aiChat, aiEnabled } from "../ai.js";
import { logger } from "../logger.js";

export const ExtractInputSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(20),
  prompt: z.string().min(3).max(2_000).optional(),
  schema: z.record(z.unknown()).optional(),
  mode: z.enum(["cheerio", "playwright"]).default("cheerio"),
});
export type ExtractInput = z.infer<typeof ExtractInputSchema>;

export interface ExtractResult {
  ok: boolean;
  data: Record<string, unknown> | null;
  per_url: Array<{
    url: string;
    ok: boolean;
    data?: Record<string, unknown>;
    error?: string;
  }>;
  duration_ms: number;
  ai_provider: string;
}

const MAX_MD_CHARS = 12_000;

export async function extractFromUrls(input: ExtractInput): Promise<ExtractResult> {
  const started = Date.now();
  if (!aiEnabled) {
    return {
      ok: false, data: null, per_url: [],
      duration_ms: Date.now() - started,
      ai_provider: "none",
    };
  }

  const per_url: ExtractResult["per_url"] = [];

  for (const url of input.urls) {
    try {
      const fetched = await scraperFetch(url, input.mode ?? "cheerio");
      if (!fetched.ok || !fetched.html) {
        per_url.push({ url, ok: false, error: fetched.error || `HTTP ${fetched.status}` });
        continue;
      }
      const { markdown, title, description } = htmlToMarkdown(fetched.html, url);
      const trimmed = markdown.slice(0, MAX_MD_CHARS);

      const system = [
        "You are a precise web data extractor.",
        "You will receive a Markdown rendering of a web page.",
        "Extract the requested data. Output ONLY valid JSON matching the schema.",
        "If a field is not present on the page, set it to null. Do not guess.",
      ].join(" ");

      const userMsg = [
        input.prompt ? `Goal: ${input.prompt}` : "",
        input.schema ? `Schema (JSON): ${JSON.stringify(input.schema)}` : "",
        `Page URL: ${url}`,
        title ? `Page title: ${title}` : "",
        description ? `Page description: ${description}` : "",
        "",
        "--- PAGE MARKDOWN ---",
        trimmed,
      ].filter(Boolean).join("\n");

      const raw = await aiChat({
        system, user: userMsg, provider: "gemini", json: true, maxTokens: 1500,
      });
      const parsed = safeJson(raw);
      per_url.push({ url, ok: parsed !== null, data: parsed ?? undefined });
    } catch (e) {
      logger.warn({ err: e, url, scope: "web-engine/extract" }, "extract failed");
      per_url.push({ url, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }

  // Merge: take the first non-null value per key across successful results
  const merged: Record<string, unknown> = {};
  for (const r of per_url) {
    if (!r.ok || !r.data) continue;
    for (const [k, v] of Object.entries(r.data)) {
      if (v === null || v === undefined) continue;
      if (merged[k] === undefined || merged[k] === null) merged[k] = v;
    }
  }

  return {
    ok: per_url.some(r => r.ok),
    data: Object.keys(merged).length > 0 ? merged : null,
    per_url,
    duration_ms: Date.now() - started,
    ai_provider: "gemini",
  };
}

function safeJson(s: string): Record<string, unknown> | null {
  try {
    // strip ```json fences if Gemini included them
    const cleaned = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}
