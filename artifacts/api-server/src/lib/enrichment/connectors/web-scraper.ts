/**
 * Public-web stealth scraper — Cheerio for fast static pages,
 * Playwright + puppeteer-extra-stealth for JS-heavy ones.
 *
 * The scraper is the cheapest source in the waterfall and runs first
 * so it can fill obvious metadata (domain, description, social handles)
 * before paid APIs are called.
 *
 * Concurrency:
 *   - Cheerio fetches: parallel-safe, ~30/min single-IP
 *   - Playwright: shared browser singleton; one tab per call
 *
 * Caching:
 *   - All fetches go through scraperFetch() which checks scraper_cache
 *     for a < 24h-old entry before hitting the network.
 */

import * as cheerio from "cheerio";
import { db, scraper_cache } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { createHash } from "crypto";
import type { Browser } from "playwright";
import type { Connector, EnrichResult, Field, Seed } from "../types.js";
import { pickNeeded, extractDomain, SCRAPER_UA } from "./_common.js";
import { aiFindDomain } from "./openrouter-ai.js";
import { logger } from "../../logger.js";

const CACHE_TTL_HOURS = 24;
const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1_000;

// ─────────────────────────────────────────────────────────────────────
// Browser singleton (Playwright + stealth)
// ─────────────────────────────────────────────────────────────────────
let browserPromise: Promise<Browser | null> | null = null;
async function getBrowser(): Promise<Browser | null> {
  if (browserPromise) return browserPromise;
  browserPromise = (async () => {
    try {
      // Lazy-load both modules so a missing chromium binary doesn't crash
      // the api-server on cold-start — the scraper will just fall back
      // to Cheerio-only mode.
      const playwrightExtraMod = await import("playwright-extra") as unknown as {
        chromium: {
          use: (plugin: unknown) => void;
          launch: (opts: Record<string, unknown>) => Promise<Browser>;
        };
      };
      const stealthMod = await import("puppeteer-extra-plugin-stealth") as unknown as {
        default?: () => unknown;
      };
      const stealth = stealthMod.default ?? (stealthMod as unknown as () => unknown);
      playwrightExtraMod.chromium.use((stealth as () => unknown)());
      const b = await playwrightExtraMod.chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-blink-features=AutomationControlled"],
      });
      logger.info({ scope: "scraper" }, "Playwright stealth browser launched");
      return b;
    } catch (e) {
      logger.warn({ err: e, scope: "scraper" }, "Playwright unavailable — falling back to Cheerio-only");
      return null;
    }
  })();
  return browserPromise;
}

// ─────────────────────────────────────────────────────────────────────
// Cached fetch
// ─────────────────────────────────────────────────────────────────────
export interface ScrapeResult {
  ok: boolean;
  status: number;
  html?: string;
  text?: string;
  error?: string;
  from_cache?: boolean;
}

function cacheKey(url: string, mode: string): string {
  return createHash("sha256").update(`${mode}:${url}`).digest("hex").slice(0, 32);
}

async function readCache(url: string, mode: string): Promise<ScrapeResult | null> {
  const key = cacheKey(url, mode);
  const cutoff = new Date(Date.now() - CACHE_TTL_MS);
  const [row] = await db
    .select()
    .from(scraper_cache)
    .where(and(eq(scraper_cache.cache_key, key), gt(scraper_cache.fetched_at, cutoff)))
    .limit(1);
  if (!row || !row.payload) return null;
  return { ...(row.payload as unknown as ScrapeResult), from_cache: true };
}

async function writeCache(url: string, mode: string, result: ScrapeResult): Promise<void> {
  const key = cacheKey(url, mode);
  // upsert (delete-then-insert is fine here, low write rate)
  try {
    await db.insert(scraper_cache).values({
      cache_key: key,
      url,
      mode,
      payload: result as unknown as Record<string, unknown>,
      fetched_at: new Date(),
    }).onConflictDoUpdate({
      target: scraper_cache.cache_key,
      set: { payload: result as unknown as Record<string, unknown>, fetched_at: new Date() },
    });
  } catch (e) {
    logger.warn({ err: e }, "scraper_cache write failed");
  }
}

/** Public fetch — chooses Cheerio or Playwright transparently. */
export async function scraperFetch(url: string, mode: "cheerio" | "playwright" = "cheerio"): Promise<ScrapeResult> {
  if (!/^https?:\/\//.test(url)) return { ok: false, status: 0, error: "URL must be http(s)" };

  const cached = await readCache(url, mode);
  if (cached) return cached;

  let result: ScrapeResult;
  if (mode === "playwright") {
    const browser = await getBrowser();
    if (!browser) {
      // fall back to cheerio mode
      result = await fetchWithCheerio(url);
    } else {
      result = await fetchWithPlaywright(browser, url);
    }
  } else {
    result = await fetchWithCheerio(url);
  }

  await writeCache(url, mode, result);
  return result;
}

async function fetchWithCheerio(url: string): Promise<ScrapeResult> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    const res = await fetch(url, {
      headers: { "User-Agent": SCRAPER_UA, "Accept": "text/html,application/xhtml+xml" },
      signal: ctrl.signal,
      redirect: "follow",
    }).finally(() => clearTimeout(t));
    if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
    const html = await res.text();
    return { ok: true, status: res.status, html, text: stripTags(html) };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

async function fetchWithPlaywright(browser: Browser, url: string): Promise<ScrapeResult> {
  const ctx = await browser.newContext({
    userAgent: SCRAPER_UA,
    viewport: { width: 1280, height: 720 },
    locale: "en-US",
  });
  try {
    const page = await ctx.newPage();
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15_000 });
    const status = res?.status() ?? 0;
    const html = await page.content();
    return { ok: status >= 200 && status < 400, status, html, text: stripTags(html) };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : String(e) };
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

// ─────────────────────────────────────────────────────────────────────
// HTML parsers
// ─────────────────────────────────────────────────────────────────────
function stripTags(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const OBFUSCATED_EMAIL_REGEX = /\b([A-Z0-9._%+-]+)\s*(?:\[at\]|\(at\)|@)\s*([A-Z0-9.-]+)\s*(?:\[dot\]|\(dot\)|\.)\s*([A-Z]{2,})\b/gi;

export function extractEmails(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(EMAIL_REGEX)) found.add(m[0]!.toLowerCase());
  for (const m of text.matchAll(OBFUSCATED_EMAIL_REGEX)) {
    found.add(`${m[1]}@${m[2]}.${m[3]}`.toLowerCase());
  }
  return [...found].filter(e => !/\.(png|jpg|jpeg|gif|svg|webp)$/.test(e));
}

export function parseHtmlMeta(html: string): {
  title?: string; description?: string; logo?: string;
  twitter?: string; linkedin?: string; emails: string[];
} {
  const $ = cheerio.load(html);
  const out: { title?: string; description?: string; logo?: string; twitter?: string; linkedin?: string; emails: string[] } = {
    emails: [],
  };
  out.title = $("title").first().text().trim() || $('meta[property="og:title"]').attr("content")?.trim();
  out.description = $('meta[name="description"]').attr("content")?.trim()
    || $('meta[property="og:description"]').attr("content")?.trim();
  out.logo = $('meta[property="og:image"]').attr("content") || $('link[rel="icon"]').attr("href");

  $('a[href*="linkedin.com/company"], a[href*="linkedin.com/in"]').each((_, el) => {
    if (!out.linkedin) out.linkedin = $(el).attr("href");
  });
  $('a[href*="twitter.com/"], a[href*="x.com/"]').each((_, el) => {
    if (!out.twitter) {
      const href = $(el).attr("href") ?? "";
      const m = href.match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/);
      if (m && !["share", "intent", "home"].includes(m[1]!)) out.twitter = `@${m[1]}`;
    }
  });

  const text = $("body").text();
  out.emails = extractEmails(`${text} ${html}`);
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// Connector
// ─────────────────────────────────────────────────────────────────────
/**
 * Domain discovery — delegates to OpenRouter (Perplexity) when available,
 * which handles Arabic names, brand-vs-legal-name confusion, and MENA
 * TLDs far better than HTML scraping. Falls back to null when AI is not
 * configured (the `openrouter_search` connector also runs as its own
 * waterfall step, so this is purely a convenience inside the scraper).
 */
async function discoverDomain(seed: Seed): Promise<string | null> {
  const known = extractDomain(seed);
  if (known) return known;
  return aiFindDomain(seed);
}

export const webScraperConnector: Connector = {
  source_key: "web_scraper",

  async test() {
    const r = await scraperFetch("https://example.com", "cheerio");
    if (!r.ok) return { ok: false, message: r.error ?? "Scraper unreachable" };
    const browser = await getBrowser();
    return {
      ok: true,
      message: browser ? "Cheerio + Playwright stealth ready" : "Cheerio ready (Playwright disabled — install chromium)",
    };
  },

  async enrich({ seed, alreadyFilled }): Promise<EnrichResult> {
    // Early-out: if every field this connector could possibly fill is
    // already known, skip the network calls entirely. Saves DuckDuckGo
    // queries + homepage fetches on warm waterfall passes.
    const candidateFields: Field[] = [
      "company_domain", "company_name", "company_description", "company_logo_url",
      "linkedin_url", "twitter_handle", "email",
    ];
    if (candidateFields.every(f => alreadyFilled.has(f))) {
      return { status: "skipped", fields: {} };
    }

    const out: Partial<Record<Field, unknown>> = {};

    // Step 1: discover domain if missing
    let domain = extractDomain(seed);
    if (!domain) {
      domain = await discoverDomain(seed);
      if (domain) out.company_domain = domain;
    } else {
      out.company_domain = domain;
    }
    if (!domain) return { status: "miss", fields: {} };

    // Step 2: fetch the homepage with Cheerio
    const home = await scraperFetch(`https://${domain}`, "cheerio");
    if (home.ok && home.html) {
      const meta = parseHtmlMeta(home.html);
      if (meta.title && !out.company_name) out.company_name = meta.title.split(/[|·–-]/)[0]!.trim();
      if (meta.description) out.company_description = meta.description;
      if (meta.logo) out.company_logo_url = meta.logo.startsWith("http") ? meta.logo : `https://${domain}${meta.logo.startsWith("/") ? "" : "/"}${meta.logo}`;
      if (meta.linkedin) out.linkedin_url = meta.linkedin;
      if (meta.twitter) out.twitter_handle = meta.twitter;
      if (meta.emails.length > 0) {
        // pick the most "exec-like" email (info@, contact@ go last)
        const sorted = meta.emails.sort((a, b) => {
          const score = (e: string) => /^(info|contact|hello|sales|support)@/.test(e) ? 1 : 0;
          return score(a) - score(b);
        });
        out.email = sorted[0];
      }
    }

    // Step 3: fetch /about or /contact for richer description if needed
    if (!out.company_description || (out.email && /^(info|contact)@/.test(String(out.email)))) {
      for (const path of ["/about", "/about-us", "/contact", "/contact-us"]) {
        const sub = await scraperFetch(`https://${domain}${path}`, "cheerio");
        if (sub.ok && sub.html) {
          const meta = parseHtmlMeta(sub.html);
          if (!out.company_description && meta.description) out.company_description = meta.description;
          if (meta.emails.length > 0 && (!out.email || /^(info|contact)@/.test(String(out.email)))) {
            out.email = meta.emails[0];
          }
          break;
        }
      }
    }

    const filtered = pickNeeded(out, alreadyFilled);
    return {
      status: Object.keys(filtered).length > 0 ? "ok" : "miss",
      fields: filtered,
      cost_usd: 0,
    };
  },
};
