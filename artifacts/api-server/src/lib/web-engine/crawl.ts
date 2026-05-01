/**
 * Bounded site crawler — Firecrawl `/crawl` equivalent.
 *
 * BFS from a seed URL, same-origin by default, capped by maxDepth and
 * maxPages. Every fetch goes through `scraperFetch` so we get caching +
 * Playwright fallback for free. Each visited page is converted to clean
 * Markdown via htmlToMarkdown.
 *
 * Designed for synchronous use (await the full result) with a hard cap.
 * For multi-thousand-page jobs we'd add a BullMQ-style queue, but for
 * the typical "crawl this prospect's site for sales context" use case
 * the bounded sync version is the right shape.
 */

import { scraperFetch } from "../enrichment/connectors/web-scraper.js";
import { htmlToMarkdown, type MarkdownResult } from "./markdown.js";

export interface CrawlPage {
  url: string;
  status: number;
  ok: boolean;
  from_cache?: boolean;
  markdown?: string;
  title?: string;
  description?: string;
  language?: string;
  links_found?: number;
  error?: string;
}

export interface CrawlResult {
  seed_url: string;
  origin: string;
  pages: CrawlPage[];
  total_pages: number;
  total_succeeded: number;
  duration_ms: number;
  truncated: boolean;
}

export interface CrawlOptions {
  maxDepth?: number;       // default 2
  maxPages?: number;       // default 25
  includePaths?: string[]; // glob-ish substrings (any-of)
  excludePaths?: string[]; // glob-ish substrings (any-of)
  allowSubdomains?: boolean;
  mode?: "cheerio" | "playwright";
}

const HARD_MAX_PAGES = 200;

function matchesAny(path: string, patterns: string[]): boolean {
  return patterns.some(p => path.includes(p));
}

function shouldVisit(url: string, originHost: string, opts: CrawlOptions): boolean {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return false; }
  if (!parsed.protocol.startsWith("http")) return false;
  if (!opts.allowSubdomains && parsed.host !== originHost) return false;
  if (opts.allowSubdomains && !parsed.host.endsWith(originHost.replace(/^www\./, ""))) return false;

  const path = parsed.pathname;
  // Skip obvious binary/asset URLs
  if (/\.(pdf|zip|jpg|jpeg|png|gif|webp|svg|ico|mp4|mp3|css|js|woff2?)(\?|$)/i.test(path)) return false;

  if (opts.includePaths && opts.includePaths.length > 0 && !matchesAny(path, opts.includePaths)) return false;
  if (opts.excludePaths && opts.excludePaths.length > 0 && matchesAny(path, opts.excludePaths)) return false;
  return true;
}

export async function crawlSite(seedUrl: string, opts: CrawlOptions = {}): Promise<CrawlResult> {
  const started = Date.now();
  const maxDepth = Math.max(0, Math.min(opts.maxDepth ?? 2, 5));
  const maxPages = Math.max(1, Math.min(opts.maxPages ?? 25, HARD_MAX_PAGES));
  const mode = opts.mode ?? "cheerio";

  let seed: URL;
  try { seed = new URL(seedUrl); } catch {
    return {
      seed_url: seedUrl, origin: seedUrl, pages: [],
      total_pages: 0, total_succeeded: 0, duration_ms: 0, truncated: false,
    };
  }
  const originHost = seed.host;
  const origin = `${seed.protocol}//${seed.host}`;

  const queue: Array<{ url: string; depth: number }> = [{ url: seedUrl, depth: 0 }];
  const seen = new Set<string>([seedUrl]);
  const pages: CrawlPage[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const { url, depth } = queue.shift()!;
    const fetched = await scraperFetch(url, mode);
    const page: CrawlPage = {
      url,
      status: fetched.status,
      ok: fetched.ok,
      from_cache: fetched.from_cache,
    };

    if (fetched.ok && fetched.html) {
      const md: MarkdownResult = htmlToMarkdown(fetched.html, url);
      page.markdown = md.markdown;
      page.title = md.title;
      page.description = md.description;
      page.language = md.language;
      page.links_found = md.links.length;

      if (depth < maxDepth) {
        for (const link of md.links) {
          if (seen.has(link)) continue;
          if (!shouldVisit(link, originHost, opts)) continue;
          seen.add(link);
          queue.push({ url: link, depth: depth + 1 });
          if (seen.size > maxPages * 10) break; // bound discovery too
        }
      }
    } else if (!fetched.ok) {
      page.error = fetched.error;
    }

    pages.push(page);
  }

  return {
    seed_url: seedUrl,
    origin,
    pages,
    total_pages: pages.length,
    total_succeeded: pages.filter(p => p.ok).length,
    duration_ms: Date.now() - started,
    truncated: queue.length > 0,
  };
}
