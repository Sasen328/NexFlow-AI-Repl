/**
 * Web Engine — Firecrawl-equivalent surface, in-process.
 *
 *   scrape()  — single URL → clean Markdown + metadata
 *   map()     — domain → list of URLs (sitemap + robots.txt)
 *   crawl()   — bounded BFS site crawl → list of page Markdowns
 *   extract() — URLs + schema → structured JSON via Gemini
 */

import { scraperFetch } from "../enrichment/connectors/web-scraper.js";
import { htmlToMarkdown, type MarkdownResult } from "./markdown.js";

export { mapDomain, type MapResult } from "./sitemap.js";
export { crawlSite, type CrawlResult, type CrawlPage, type CrawlOptions } from "./crawl.js";
export { extractFromUrls, ExtractInputSchema, type ExtractInput, type ExtractResult } from "./extract.js";
export { htmlToMarkdown, type MarkdownResult } from "./markdown.js";

export interface ScrapeResult {
  ok: boolean;
  url: string;
  status: number;
  from_cache?: boolean;
  markdown?: string;
  html?: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
  };
  links?: string[];
  images?: string[];
  error?: string;
  duration_ms: number;
}

export async function scrapeUrl(url: string, opts: {
  mode?: "cheerio" | "playwright";
  includeHtml?: boolean;
} = {}): Promise<ScrapeResult> {
  const started = Date.now();
  const fetched = await scraperFetch(url, opts.mode ?? "cheerio");
  if (!fetched.ok || !fetched.html) {
    return {
      ok: false, url, status: fetched.status,
      from_cache: fetched.from_cache,
      error: fetched.error,
      duration_ms: Date.now() - started,
    };
  }
  const md: MarkdownResult = htmlToMarkdown(fetched.html, url);
  return {
    ok: true,
    url,
    status: fetched.status,
    from_cache: fetched.from_cache,
    markdown: md.markdown,
    html: opts.includeHtml ? fetched.html : undefined,
    metadata: { title: md.title, description: md.description, language: md.language },
    links: md.links,
    images: md.images,
    duration_ms: Date.now() - started,
  };
}
