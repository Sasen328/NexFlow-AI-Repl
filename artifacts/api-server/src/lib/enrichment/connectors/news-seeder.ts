/**
 * News Seeder connector — enriches `news_recent` and `intent_signals` by
 * running a Perplexity web-search query for the lead's company / person.
 *
 * Priority 16 — runs after Python scraper (15) and before GLEIF (18).
 * This is cheap ($0.001/call via OpenRouter) and fills intent/news fields
 * that later paid sources and the AI Composer can build on.
 *
 * DeepSeek-V3 is used as the synthesis model (cheapest option via OpenRouter
 * free tier — $0.014/1M tokens or free if within daily limits). It takes
 * the raw Perplexity search result and condenses it into structured fields.
 *
 * Gracefully skips when OpenRouter env vars are absent.
 */

import { aiChat, aiJson } from "../../ai.js";
import type { Connector, EnrichResult, Seed, SourceConfig, Field } from "../types.js";

function openrouterReady(): boolean {
  return Boolean(
    process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL &&
    process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
  );
}

interface NewsSeederOutput {
  news_recent: string;
  intent_signals: string;
  company_funding?: string;
  hiring_signals?: string;
}

/**
 * Run a Perplexity web search for recent news about the company / person,
 * then use DeepSeek-V3 (free tier via OpenRouter) to synthesize the result
 * into structured fields.
 */
async function seedNews(seed: Seed): Promise<NewsSeederOutput | null> {
  const subject = seed.company
    ? `${seed.company}${seed.full_name ? ` ${seed.full_name}` : ""}`
    : seed.full_name ?? "";
  if (!subject) return null;

  const country = seed.country ? ` ${seed.country}` : " GCC Saudi Arabia";

  // Step 1: Perplexity sonar live web search
  const rawSearch = await aiChat({
    system:
      "You are a business intelligence researcher for GCC B2B sales. " +
      "Search for the most recent news about the given company or person. " +
      "Include: recent funding rounds, expansions, M&A, product launches, " +
      "hiring announcements, executive changes, regulatory approvals, or any " +
      "signals that indicate active business investment or buying. " +
      "Report ONLY real, dated facts. No fabrication. If nothing recent (within 18 months), say 'No recent news found.'",
    user: `Find the latest news and business signals for: "${subject}"${country}. ` +
          `Focus on: funding, growth, hiring, partnerships, contracts, regulatory approvals, ` +
          `executive changes. Report each item with approximate date if available.`,
    provider: "perplexity",
    maxTokens: 800,
  });

  if (!rawSearch || rawSearch.includes("No recent news found") || rawSearch.length < 40) {
    return null;
  }

  // Step 2: DeepSeek-V3 (free tier) distills the raw search into structured JSON
  const synthesized = await aiJson<NewsSeederOutput>({
    system:
      "You are a GCC B2B sales intelligence analyst. Given raw news text about a company or person, " +
      "extract structured signals for a CRM record. Return strict JSON only.",
    user:
      `Raw news text:\n${rawSearch.slice(0, 2000)}\n\n` +
      `Extract these fields (all strings, empty string if not found):\n` +
      `- news_recent: Single sentence summarising the most significant recent development (within 18 months)\n` +
      `- intent_signals: Comma-separated list of active buying/investment signals, e.g. "Series B closed Q1 2026, hiring 50 engineers, expanding to UAE"\n` +
      `- company_funding: Most recent funding round and amount if mentioned, e.g. "Series B $20M (Jan 2026)"\n` +
      `- hiring_signals: One sentence on hiring/headcount growth if mentioned\n\n` +
      `Return ONLY the JSON object.`,
    // DeepSeek-V3 via OpenRouter free tier — cheapest synthesis option
    model: "deepseek/deepseek-chat-v3-0324:free",
    fallback: { news_recent: rawSearch.slice(0, 200), intent_signals: "" },
  });

  return synthesized;
}

export const newsSeederConnector: Connector = {
  source_key: "news_seeder",

  async test() {
    if (!openrouterReady()) return { ok: false, message: "OpenRouter env vars not set" };
    const result = await seedNews({ company: "Saudi Aramco", country: "Saudi Arabia" });
    return result
      ? { ok: true, message: `News seeder OK — got: "${result.news_recent.slice(0, 80)}"` }
      : { ok: false, message: "News seeder returned no results" };
  },

  async enrich({ seed, alreadyFilled }: {
    seed: Seed;
    apiKey: string | null;
    config: SourceConfig;
    alreadyFilled: Set<Field>;
  }): Promise<EnrichResult> {
    // Skip if we already have all fields this connector fills
    const targets: Field[] = ["news_recent", "intent_signals", "company_funding", "hiring_signals"];
    if (targets.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };
    if (!openrouterReady()) return { status: "skipped", fields: {} };

    const result = await seedNews(seed);
    if (!result) return { status: "miss", fields: {} };

    const out: Partial<Record<Field, unknown>> = {};
    if (result.news_recent && !alreadyFilled.has("news_recent"))
      out.news_recent = result.news_recent;
    if (result.intent_signals && !alreadyFilled.has("intent_signals"))
      out.intent_signals = result.intent_signals;
    if (result.company_funding && !alreadyFilled.has("company_funding"))
      out.company_funding = result.company_funding;
    if (result.hiring_signals && !alreadyFilled.has("hiring_signals"))
      out.hiring_signals = result.hiring_signals;

    return {
      status: Object.keys(out).length > 0 ? "ok" : "miss",
      fields: out,
      cost_usd: 0.002, // Perplexity search ($0.001) + DeepSeek synthesis (~$0.001)
    };
  },
};
