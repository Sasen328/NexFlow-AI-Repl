/**
 * Hiring Signals scraper — LinkedIn Jobs + Bayt.com + Glassdoor.
 *
 * Active job postings are one of the strongest buying-signal proxies:
 *   - "Head of Digital Transformation" → tech investment budget unlocked
 *   - Many engineering hires → expansion, possible software/infra need
 *   - Finance/legal hires → funding round or M&A activity
 *   - Sales hires → revenue push, open to new vendor relationships
 *
 * Sources tried in order:
 *   1. LinkedIn Jobs (unauthenticated public search — limited but fast)
 *   2. Bayt.com Jobs (largest GCC jobs board, Arabic + English)
 *   3. Glassdoor (company profile open jobs count)
 *
 * Results are written to the `hiring_signals` field as a structured JSON string.
 */

import type { Connector, EnrichResult, Field } from "../types.js";
import { scraperFetch } from "./web-scraper.js";

const BAYT_SEARCH  = "https://www.bayt.com/en/saudi-arabia/jobs/?q=";
const LI_JOBS      = "https://www.linkedin.com/jobs/search/?keywords=";

interface HiringSnapshot {
  totalOpenRoles: number;
  rolesByDept: Record<string, number>;
  hiringSignals: string[];
  source: string;
}

function parseLinkedInJobs(html: string, company: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  // LinkedIn shows "X jobs at Company"
  const m = text.match(/(\d[\d,]+)\s+jobs?\s+at\s+/i);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : 0;
}

function parseBaytJobs(html: string): { total: number; roles: string[] } {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const total = parseInt((text.match(/(\d[\d,]+)\s+(?:jobs?|وظيفة)/i) ?? ["0", "0"])[1].replace(/,/g, ""), 10) || 0;

  // Extract role titles from job card text
  const roleMatches = text.match(/(?:Head of|Manager|Director|Engineer|Specialist|Analyst|Consultant|Officer)[^,.\n]{3,60}/gi) ?? [];
  const roles = Array.from(new Set(roleMatches.map((r) => r.trim()))).slice(0, 8);

  return { total, roles };
}

function inferSignals(roles: string[]): string[] {
  const signals: string[] = [];
  const roleText = roles.join(" ").toLowerCase();
  if (/digital|transform|cloud|devops|infra|engineer/i.test(roleText)) signals.push("Tech investment expansion");
  if (/sales|business dev|account|revenue/i.test(roleText)) signals.push("Revenue growth push");
  if (/finance|cfo|controller|treasury/i.test(roleText)) signals.push("Financial scaling / possible funding");
  if (/legal|compliance|risk|audit/i.test(roleText)) signals.push("Regulatory / M&A activity");
  if (/marketing|brand|content|social/i.test(roleText)) signals.push("Marketing budget active");
  if (/hr|people|talent|recruit/i.test(roleText)) signals.push("Headcount scaling");
  return signals;
}

export const hiringScraperConnector: Connector = {
  source_key: "hiring_scraper",

  async test({ apiKey: _k, config: _c }) {
    try {
      const r = await scraperFetch("https://www.bayt.com/", "cheerio");
      return { ok: r.ok, message: r.ok ? "Bayt.com reachable" : `Bayt blocked: ${r.error ?? ""}` };
    } catch (e: any) {
      return { ok: false, message: `Hiring scraper test failed: ${e?.message ?? e}` };
    }
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    const company = seed.company ?? "";
    if (!company) return { status: "skipped", fields: {} };
    if (alreadyFilled.has("hiring_signals")) return { status: "skipped", fields: {} };

    try {
      const [baytResp, liResp] = await Promise.allSettled([
        scraperFetch(`${BAYT_SEARCH}${encodeURIComponent(company)}&l=Saudi+Arabia`, "cheerio"),
        scraperFetch(`${LI_JOBS}${encodeURIComponent(company)}&location=Saudi+Arabia&f_C=`, "cheerio"),
      ]);

      const baytHtml = baytResp.status === "fulfilled" && baytResp.value.ok ? baytResp.value.text ?? "" : "";
      const liHtml   = liResp.status === "fulfilled" && liResp.value.ok ? liResp.value.text ?? "" : "";

      const bayt = parseBaytJobs(baytHtml);
      const liCount = parseLinkedInJobs(liHtml, company);
      const totalJobs = Math.max(bayt.total, liCount);

      if (totalJobs === 0 && bayt.roles.length === 0) return { status: "miss", fields: {} };

      const signals = inferSignals(bayt.roles);
      const snapshot: HiringSnapshot = {
        totalOpenRoles: totalJobs,
        rolesByDept: {},
        hiringSignals: signals,
        source: [baytHtml ? "Bayt.com" : "", liHtml ? "LinkedIn Jobs" : ""].filter(Boolean).join(", "),
      };

      // Simple dept bucketing from role titles
      for (const role of bayt.roles) {
        const rl = role.toLowerCase();
        const dept = /engineer|tech|cloud|dev/i.test(rl) ? "Engineering"
          : /sales|account|revenue/i.test(rl) ? "Sales"
          : /finance|treasury|control/i.test(rl) ? "Finance"
          : /market|brand|content/i.test(rl) ? "Marketing"
          : /hr|people|talent/i.test(rl) ? "HR"
          : "Other";
        snapshot.rolesByDept[dept] = (snapshot.rolesByDept[dept] ?? 0) + 1;
      }

      return {
        status: "ok",
        fields: { hiring_signals: JSON.stringify(snapshot) },
        cost_usd: 0,
      };
    } catch (e: any) {
      return { status: "error", fields: {}, error: e?.message ?? String(e) };
    }
  },
};
