/**
 * Agent Tools — exposed to the Claude orchestrator via the Anthropic SDK
 * tool-use API. Each tool wraps an existing engine (NEXUS, harvester, free
 * search, scrapers) so the orchestrator can call them as functions.
 */

import { nexusRunRole, type AgentRole } from "../nexus/llm-router.js";
import { freeWebSearch } from "../free-search.js";

export interface ToolHandlerResult {
  result: unknown;
  summary?: string;
}

export interface ToolDef {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
  handler: (input: Record<string, unknown>) => Promise<ToolHandlerResult>;
}

// ── nexus_run: dispatch a sub-task to NEXUS by role ───────────────────────────
const nexus_run: ToolDef = {
  name: "nexus_run",
  description:
    "Dispatch a sub-task to a specialized model via NEXUS. Pick the role that best matches the sub-task; NEXUS will route to the optimal provider behind the scenes.",
  input_schema: {
    type: "object",
    properties: {
      role: {
        type: "string",
        enum: ["planner","researcher","extractor","arabic","writer","validator","bulk","signal","tree"],
        description: "Specialist role to handle the sub-task.",
      },
      task: { type: "string", description: "The full task / prompt for the sub-agent." },
    },
    required: ["role","task"],
  },
  async handler(input) {
    const role = input.role as AgentRole;
    const task = String(input.task || "");
    const res = await nexusRunRole(role, task);
    return { result: res.text, summary: `${role} returned ${res.text.length} chars` };
  },
};

// ── web_search: free search waterfall (Tavily → SearXNG → Google) ─────────────
const web_search: ToolDef = {
  name: "web_search",
  description:
    "Search the live web for current information. Returns title + url + snippet for top results. Use for any task that needs fresh facts not in your training data.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query." },
      limit: { type: "number", description: "Max results (default 8, max 20)." },
    },
    required: ["query"],
  },
  async handler(input) {
    const q = String(input.query || "");
    const limit = Math.min(Number(input.limit) || 8, 20);
    const hits = await freeWebSearch(q, { limit });
    return {
      result: hits.map((h) => ({ title: h.title, url: h.url, snippet: h.snippet?.slice(0, 240) })),
      summary: `web_search: ${hits.length} results for "${q.slice(0, 60)}"`,
    };
  },
};

// ── url_crawl: fast static fetch via Cheerio/axios ────────────────────────────
const url_crawl: ToolDef = {
  name: "url_crawl",
  description:
    "Fetch a single URL and return the visible text. Fast — uses static HTML parsing. Use this first; escalate to deep_scrape only if the page is JS-heavy.",
  input_schema: {
    type: "object",
    properties: { url: { type: "string", description: "Absolute URL to fetch." } },
    required: ["url"],
  },
  async handler(input) {
    const url = String(input.url || "");
    try {
      const axios = (await import("axios")).default;
      const r = await axios.get(url, {
        timeout: 12000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; NexFlow-Bot/1.0)" },
      });
      const html: string = typeof r.data === "string" ? r.data : "";
      const text = html
        .replace(/<script[^]*?<\/script>/gi, "")
        .replace(/<style[^]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000);
      return { result: { url, text }, summary: `url_crawl: ${text.length} chars from ${new URL(url).hostname}` };
    } catch (e) {
      return { result: { url, error: e instanceof Error ? e.message : String(e) }, summary: "url_crawl: failed" };
    }
  },
};

// ── harvester_run: unified harvester façade ───────────────────────────────────
const harvester_run: ToolDef = {
  name: "harvester_run",
  description:
    "Run the multi-source harvester for a company/topic query. Wraps Google News, Saudi RSS feeds, GLEIF, OpenCorporates, Wikidata, sanctions, and Scout site intel.",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Company name or topic." },
      limit: { type: "number", description: "Max rows (default 12)." },
    },
    required: ["query"],
  },
  async handler(input) {
    const query = String(input.query || "");
    const limit = Math.min(Number(input.limit) || 12, 30);
    // Fallback to free web search when the harvester module isn't loaded
    try {
      const harvesterPath = "../harvester/index.js" as string;
      const mod = await import(harvesterPath).catch(() => null);
      if (mod) {
        const rows: unknown[] = [];
        const harvest = (mod as unknown as { harvest: (q: string) => AsyncIterable<unknown> }).harvest;
        if (typeof harvest === "function") {
          for await (const row of harvest(query)) {
            rows.push(row);
            if (rows.length >= limit) break;
          }
          return { result: rows, summary: `harvester_run: ${rows.length} rows` };
        }
      }
    } catch { /* fall through */ }
    const hits = await freeWebSearch(query, { limit });
    return { result: hits, summary: `harvester_run (freeSearch): ${hits.length} rows` };
  },
};

// ── deep_scrape: Playwright + stealth for JS-heavy pages ──────────────────────
const deep_scrape: ToolDef = {
  name: "deep_scrape",
  description:
    "Render a JS-heavy page with Playwright (headless Chromium + stealth) and return the rendered text. Slower than url_crawl (3-10s).",
  input_schema: {
    type: "object",
    properties: { url: { type: "string", description: "Absolute URL." } },
    required: ["url"],
  },
  async handler(input) {
    const url = String(input.url || "");
    try {
      const scraperPath = "../power-scraper.js" as string;
      const mod = await import(scraperPath).catch(() => null);
      if (mod && typeof (mod as { scrapeWithPlaywright?: (u: string) => Promise<{ text?: string }> }).scrapeWithPlaywright === "function") {
        const out = await (mod as unknown as { scrapeWithPlaywright: (u: string) => Promise<{ text?: string }> }).scrapeWithPlaywright(url);
        const text = (out.text || "").slice(0, 12000);
        return { result: { url, text }, summary: `deep_scrape: ${text.length} chars from ${new URL(url).hostname}` };
      }
      return url_crawl.handler({ url });
    } catch (e) {
      return { result: { url, error: e instanceof Error ? e.message : String(e) }, summary: "deep_scrape: failed" };
    }
  },
};

// ── sanctions_screen: OpenSanctions API → web-search fallback ────────────────
const sanctions_screen: ToolDef = {
  name: "sanctions_screen",
  description: "Screen a company or person against OFAC SDN, UN Consolidated, EU sanctions, and OpenSanctions. Returns match confidence.",
  input_schema: {
    type: "object",
    properties: { name: { type: "string", description: "Entity name to screen." } },
    required: ["name"],
  },
  async handler(input) {
    const name = String(input.name || "");
    // 1. Try OpenSanctions free API
    try {
      const axios = (await import("axios")).default;
      const r = await axios.post(
        "https://api.opensanctions.org/match/default",
        { queries: { q0: { schema: "LegalEntity", properties: { name: [name] } } } },
        { timeout: 8000, headers: { Authorization: `ApiKey ${process.env.OPENSANCTIONS_API_KEY || ""}` } },
      );
      const results = r.data?.responses?.q0?.results ?? [];
      const hits = results.filter((x: { score?: number }) => (x.score ?? 0) > 0.5);
      return {
        result: { name, matched: hits.length > 0, hits: hits.slice(0, 3), source: "opensanctions" },
        summary: `sanctions_screen: ${hits.length} potential match(es) for "${name}"`,
      };
    } catch { /* fall through to web search */ }
    // 2. Fallback — web search for name + sanctions keywords
    try {
      const hits = await freeWebSearch(`"${name}" OFAC sanctions OR "UN list" OR "EU sanctions"`, { limit: 5 });
      const flagged = hits.some((h) =>
        /sanction|ofac|blocked|restricted|prohibited/i.test(h.title + " " + (h.snippet ?? ""))
      );
      return {
        result: { name, flagged, webHits: hits.slice(0, 3), source: "web_search_fallback" },
        summary: `sanctions_screen: ${flagged ? "⚠ potential flag" : "no match"} for "${name}"`,
      };
    } catch (e) {
      return { result: { name, error: e instanceof Error ? e.message : String(e) }, summary: "sanctions_screen: failed" };
    }
  },
};

// ── scout_osint: Scout OSINT → web-search fallback ───────────────────────────
const scout_osint: ToolDef = {
  name: "scout_osint",
  description: "Run OSINT on a person, username, or domain. Returns presence across LinkedIn, X, GitHub, and news. Falls back to multi-source web search.",
  input_schema: {
    type: "object",
    properties: { query: { type: "string", description: "Name, email, username, or domain." } },
    required: ["query"],
  },
  async handler(input) {
    const query = String(input.query || "");
    // 1. Try Scout sidecar if running
    try {
      const axios = (await import("axios")).default;
      const base = process.env.SCOUT_URL || "http://localhost:8099";
      const r = await axios.post(`${base}/osint`, { query }, { timeout: 8000 });
      return { result: r.data, summary: `scout_osint: ${query}` };
    } catch { /* fall through */ }
    // 2. Multi-platform web search fallback
    try {
      const platforms = ["linkedin.com", "x.com OR twitter.com", "crunchbase.com", "github.com"];
      const searches = await Promise.allSettled(
        platforms.map((site) => freeWebSearch(`"${query}" site:${site}`, { limit: 3 }))
      );
      const combined: unknown[] = [];
      searches.forEach((s, i) => {
        if (s.status === "fulfilled") combined.push(...s.value.map((h) => ({ ...h, platform: platforms[i] })));
      });
      return {
        result: { query, profiles: combined, source: "web_search_fallback" },
        summary: `scout_osint: ${combined.length} profile hits for "${query}"`,
      };
    } catch (e) {
      return { result: { error: e instanceof Error ? e.message : String(e) }, summary: "scout_osint: failed" };
    }
  },
};

// ── lead_factory_run: 7-agent pipeline → NEXUS builder fallback ──────────────
const lead_factory_run: ToolDef = {
  name: "lead_factory_run",
  description: "Start the full 7-agent Lead Factory pipeline to generate qualified B2B leads for a target industry and region.",
  input_schema: {
    type: "object",
    properties: {
      industry:    { type: "string", description: "Target industry (e.g. fintech, healthcare)." },
      country:     { type: "string", description: "Country code or region (e.g. SA, UAE, GCC)." },
      targetCount: { type: "number", description: "Number of leads to produce (default 10)." },
    },
    required: ["industry"],
  },
  async handler(input) {
    const industry = String(input.industry || "");
    const country  = String(input.country  || "GCC");
    const count    = Math.min(Number(input.targetCount) || 10, 25);
    // 1. Try the lead-factory microservice if deployed
    try {
      const axios = (await import("axios")).default;
      const base = process.env.SELF_URL || "http://localhost:8080";
      const r = await axios.post(`${base}/api/lead-factory/start`, {
        mode: "person", targetCount: count,
        industries: [industry], regions: [country],
      }, { timeout: 12000 });
      return { result: r.data, summary: `lead_factory_run: job ${r.data?.jobId ?? "queued"}` };
    } catch { /* fall through */ }
    // 2. NEXUS builder fallback — synthesise leads directly
    const task = `Generate ${count} qualified B2B leads in the ${industry} industry in ${country}. ` +
      `For each lead output: name, title, company, LinkedIn URL (if known), estimated email format, ICP score 0-1. ` +
      `Focus on decision-makers (C-suite / VP / Director). Output as a JSON array.`;
    const res = await nexusRunRole("builder" as AgentRole, task);
    return {
      result: { leads: res.text, source: "nexus_builder_fallback" },
      summary: `lead_factory_run: ${count} leads synthesised via builder for ${industry}/${country}`,
    };
  },
};

// ── signal_monitor: live buying signals via harvester ─────────────────────────
const signal_monitor: ToolDef = {
  name: "signal_monitor",
  description: "Detect recent buying signals (funding, hiring spike, leadership change) for a company. Last 90 days.",
  input_schema: {
    type: "object",
    properties: { company: { type: "string", description: "Company name." } },
    required: ["company"],
  },
  async handler(input) {
    const company = String(input.company || "");
    try {
      const result = await harvester_run.handler({ query: company + " hiring OR funding OR leadership", limit: 20 });
      return { result: result.result, summary: `signal_monitor: scanned ${company}` };
    } catch (e) {
      return { result: { error: e instanceof Error ? e.message : String(e) }, summary: "signal_monitor: failed" };
    }
  },
};

export const AGENT_TOOLS: ToolDef[] = [
  nexus_run,
  web_search,
  url_crawl,
  deep_scrape,
  harvester_run,
  sanctions_screen,
  scout_osint,
  lead_factory_run,
  signal_monitor,
];

export function getToolByName(name: string): ToolDef | undefined {
  return AGENT_TOOLS.find((t) => t.name === name);
}

export function toAnthropicTools(): Array<{ name: string; description: string; input_schema: ToolDef["input_schema"] }> {
  return AGENT_TOOLS.map(({ name, description, input_schema }) => ({ name, description, input_schema }));
}
