/**
 * Sitemap & robots.txt discovery — Firecrawl `/map` equivalent.
 *
 * Strategy:
 *   1. Fetch /robots.txt, parse Sitemap: directives.
 *   2. Fall back to /sitemap.xml.
 *   3. Recursively expand <sitemapindex> children.
 *   4. Dedupe and cap (default 5_000 URLs).
 */

import * as cheerio from "cheerio";
import { SCRAPER_UA } from "../enrichment/connectors/_common.js";
import { checkUrlSafe, MAX_FETCH_BYTES } from "./guards.js";

const FETCH_TIMEOUT_MS = 12_000;
const MAX_URLS = 5_000;
const MAX_SITEMAPS = 50;

async function fetchText(url: string): Promise<string | null> {
  // SSRF guard — block private IPs, localhost, cloud metadata, .local, etc.
  if (!checkUrlSafe(url).ok) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: { "User-Agent": SCRAPER_UA, "Accept": "text/xml, application/xml, text/plain, */*" },
      signal: ctrl.signal,
      redirect: "follow",
    }).finally(() => clearTimeout(t));
    if (!res.ok) return null;
    // Header-based size cap (cheap, may be missing). Body-stream cap below catches the rest.
    const cl = res.headers.get("content-length");
    if (cl && Number(cl) > MAX_FETCH_BYTES) return null;
    // Stream body and abort if it exceeds the cap.
    if (!res.body) return await res.text();
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_FETCH_BYTES) { reader.cancel().catch(() => undefined); return null; }
      chunks.push(value);
    }
    const merged = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { merged.set(c, off); off += c.byteLength; }
    return new TextDecoder("utf-8").decode(merged);
  } catch {
    return null;
  }
}

function parseSitemap(xml: string): { urls: string[]; sitemaps: string[] } {
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls: string[] = [];
  const sitemaps: string[] = [];
  $("urlset > url > loc").each((_, el) => {
    const u = $(el).text().trim();
    if (u) urls.push(u);
  });
  $("sitemapindex > sitemap > loc").each((_, el) => {
    const u = $(el).text().trim();
    if (u) sitemaps.push(u);
  });
  return { urls, sitemaps };
}

function parseRobotsForSitemaps(robots: string): string[] {
  const out: string[] = [];
  for (const line of robots.split(/\r?\n/)) {
    const m = line.match(/^\s*Sitemap:\s*(\S+)/i);
    if (m) out.push(m[1]!);
  }
  return out;
}

export interface MapResult {
  origin: string;
  sitemaps_found: string[];
  urls: string[];
  total: number;
  capped: boolean;
}

export async function mapDomain(seedUrl: string, opts: {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
} = {}): Promise<MapResult> {
  const u = new URL(seedUrl);
  const origin = `${u.protocol}//${u.host}`;
  const limit = Math.min(opts.limit ?? MAX_URLS, MAX_URLS);

  const sitemapQueue: string[] = [];
  const seenSitemaps = new Set<string>();
  const sitemaps_found: string[] = [];

  // 1. robots.txt
  const robots = await fetchText(`${origin}/robots.txt`);
  if (robots) {
    for (const sm of parseRobotsForSitemaps(robots)) {
      if (!seenSitemaps.has(sm)) { sitemapQueue.push(sm); seenSitemaps.add(sm); }
    }
  }
  // 2. fallback /sitemap.xml
  if (sitemapQueue.length === 0) {
    const fallback = `${origin}/sitemap.xml`;
    sitemapQueue.push(fallback);
    seenSitemaps.add(fallback);
  }

  const allUrls = new Set<string>();
  let processed = 0;

  while (sitemapQueue.length > 0 && allUrls.size < limit && processed < MAX_SITEMAPS) {
    const sm = sitemapQueue.shift()!;
    processed++;
    const xml = await fetchText(sm);
    if (!xml) continue;
    sitemaps_found.push(sm);
    const { urls, sitemaps } = parseSitemap(xml);
    for (const u of urls) {
      try {
        const parsed = new URL(u);
        if (!opts.includeSubdomains && parsed.host !== new URL(origin).host) continue;
        allUrls.add(u);
        if (allUrls.size >= limit) break;
      } catch { /* skip */ }
    }
    for (const s of sitemaps) {
      if (!seenSitemaps.has(s) && sitemapQueue.length + processed < MAX_SITEMAPS) {
        sitemapQueue.push(s);
        seenSitemaps.add(s);
      }
    }
  }

  let urls = [...allUrls];
  if (opts.search) {
    const q = opts.search.toLowerCase();
    urls = urls.filter(u => u.toLowerCase().includes(q));
  }

  return {
    origin,
    sitemaps_found,
    urls,
    total: urls.length,
    capped: allUrls.size >= limit,
  };
}
