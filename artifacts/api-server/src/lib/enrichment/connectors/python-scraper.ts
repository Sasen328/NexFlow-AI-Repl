/**
 * Python AI sidecar connector — calls the enrichment-scraper artifact
 * (FastAPI service running Crawl4AI + BeautifulSoup at /scraper/*).
 *
 * The sidecar URL defaults to localhost:80 (the workspace reverse proxy)
 * and the path prefix is /scraper. The connector is no-op when the
 * sidecar isn't running, so the waterfall keeps moving.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain } from "./_common.js";

const SIDECAR_URL = process.env["ENRICHMENT_SCRAPER_URL"] ?? "http://localhost:80/scraper";

interface SidecarExtractResponse {
  ok: boolean;
  url: string;
  text?: string;
  structured?: {
    company_name?: string;
    description?: string;
    industry?: string;
    size_band?: string;
    tech_stack?: string[];
    headcount_signals?: string[];
    news?: string[];
  };
  error?: string;
}

export const pythonScraperConnector: Connector = {
  source_key: "python_scraper",

  async test() {
    const r = await fetchJSON<{ ok: boolean; version?: string }>(`${SIDECAR_URL}/health`, {}, 4_000);
    if (!r.ok) return { ok: false, message: r.error ?? "Sidecar unreachable" };
    return { ok: true, message: `Sidecar v${r.data?.version ?? "?"} reachable` };
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    const domain = extractDomain(seed);
    if (!domain) return { status: "skipped", fields: {} };
    const url = `https://${domain}`;

    const r = await fetchJSON<SidecarExtractResponse>(
      `${SIDECAR_URL}/extract`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode: "crawl4ai" }),
      },
      20_000,
    );
    if (!r.ok) {
      return { status: "error", fields: {}, error: r.error ?? "sidecar error" };
    }

    const s = r.data?.structured;
    if (!s) return { status: "miss", fields: {} };

    const out: Partial<Record<Field, unknown>> = {};
    if (s.company_name) out.company_name = s.company_name;
    if (s.description) out.company_description = s.description;
    if (s.industry) out.company_industry = s.industry;
    if (s.size_band) out.company_size = s.size_band;
    if (s.tech_stack?.length) out.company_tech_stack = s.tech_stack.join(", ");
    if (s.news?.length) out.news_recent = s.news.join(" · ");
    if (s.headcount_signals?.length) out.hiring_signals = s.headcount_signals.join(" · ");

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
