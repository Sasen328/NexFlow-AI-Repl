/**
 * GitHub org/user lookup — FREE, no key needed for low rate.
 * Useful when the seed company has an open-source presence (most fintech,
 * AI, crypto, dev-tools companies in the GCC do).
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { fetchJSON, pickNeeded, extractDomain, SCRAPER_UA } from "./_common.js";

interface GhOrg {
  login?: string;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  description?: string;
  twitter_username?: string;
  followers?: number;
  public_repos?: number;
  created_at?: string;
}

export const githubOrgConnector: Connector = {
  source_key: "github_org",

  async test() {
    const r = await fetchJSON<GhOrg>("https://api.github.com/orgs/microsoft", {
      headers: { "User-Agent": SCRAPER_UA, Accept: "application/vnd.github+json" },
    });
    return r.ok ? { ok: true, message: "GitHub API reachable" } : { ok: false, message: r.error ?? `HTTP ${r.status}` };
  },

  async enrich({ seed, apiKey, alreadyFilled }): Promise<EnrichResult> {
    if (!seed.company) return { status: "miss", fields: {} };
    const candidates: Field[] = ["company_description", "company_country", "twitter_handle", "company_domain"];
    if (candidates.every(f => alreadyFilled.has(f))) return { status: "skipped", fields: {} };

    const guess = seed.company.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const headers: Record<string, string> = {
      "User-Agent": SCRAPER_UA,
      Accept: "application/vnd.github+json",
    };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    // Try org first, then user
    let org: GhOrg | null = null;
    const r1 = await fetchJSON<GhOrg>(`https://api.github.com/orgs/${guess}`, { headers });
    if (r1.ok && r1.data?.login) org = r1.data;
    if (!org) {
      const r2 = await fetchJSON<GhOrg>(`https://api.github.com/users/${guess}`, { headers });
      if (r2.ok && r2.data?.login) org = r2.data;
    }
    if (!org) return { status: "miss", fields: {} };

    const out: Partial<Record<Field, unknown>> = {};
    if (org.description) out.company_description = org.description;
    if (org.location) out.company_country = org.location;
    if (org.twitter_username) out.twitter_handle = `@${org.twitter_username}`;
    if (org.blog) {
      try {
        const d = new URL(org.blog.startsWith("http") ? org.blog : `https://${org.blog}`).hostname.replace(/^www\./, "");
        if (d && /\./.test(d)) out.company_domain = d;
      } catch { /* ignore */ }
    }
    if (org.created_at) {
      const yr = parseInt(org.created_at.slice(0, 4), 10);
      if (yr && !alreadyFilled.has("company_founded_year")) out.company_founded_year = yr;
    }
    // Repo count is a weak hiring signal
    if (org.public_repos && org.public_repos > 50 && !alreadyFilled.has("hiring_signals")) {
      out.hiring_signals = `Active open-source presence (${org.public_repos} public repos, ${org.followers ?? 0} followers) — likely engineering hiring.`;
    }

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
// extractDomain is intentionally imported but unused here; left for future expansion.
void extractDomain;
