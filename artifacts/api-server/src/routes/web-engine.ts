/**
 * /api/engine/* — Firecrawl-equivalent web engine REST surface.
 *
 *   POST /api/engine/scrape   — { url, mode?, includeHtml? }
 *   POST /api/engine/map      — { url, search?, limit?, includeSubdomains? }
 *   POST /api/engine/crawl    — { url, maxDepth?, maxPages?, includePaths?, excludePaths?, allowSubdomains?, mode? }
 *   POST /api/engine/extract  — { urls[], prompt?, schema?, mode? }
 */

import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  scrapeUrl,
  mapDomain,
  crawlSite,
  extractFromUrls,
  ExtractInputSchema,
} from "../lib/web-engine/index.js";
import { checkUrlSafe } from "../lib/web-engine/guards.js";

function guard(url: string): { ok: true } | { ok: false; status: number; body: { error: string } } {
  const r = checkUrlSafe(url);
  if (!r.ok) return { ok: false, status: 400, body: { error: r.reason ?? "URL blocked" } };
  return { ok: true };
}

const router: IRouter = Router();

const ScrapeBody = z.object({
  url: z.string().url(),
  mode: z.enum(["cheerio", "playwright"]).optional(),
  includeHtml: z.boolean().optional(),
});

const MapBody = z.object({
  url: z.string().url(),
  search: z.string().optional(),
  limit: z.number().int().min(1).max(5000).optional(),
  includeSubdomains: z.boolean().optional(),
});

const CrawlBody = z.object({
  url: z.string().url(),
  maxDepth: z.number().int().min(0).max(5).optional(),
  maxPages: z.number().int().min(1).max(200).optional(),
  includePaths: z.array(z.string()).optional(),
  excludePaths: z.array(z.string()).optional(),
  allowSubdomains: z.boolean().optional(),
  mode: z.enum(["cheerio", "playwright"]).optional(),
});

router.post("/scrape", async (req, res) => {
  const parsed = ScrapeBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  const g = guard(parsed.data.url);
  if (!g.ok) return res.status(g.status).json(g.body);
  try {
    const result = await scrapeUrl(parsed.data.url, {
      mode: parsed.data.mode,
      includeHtml: parsed.data.includeHtml,
    });
    return res.json(result);
  } catch (e) {
    req.log.error({ err: e }, "scrape failed");
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

router.post("/map", async (req, res) => {
  const parsed = MapBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  const g = guard(parsed.data.url);
  if (!g.ok) return res.status(g.status).json(g.body);
  try {
    const result = await mapDomain(parsed.data.url, {
      search: parsed.data.search,
      limit: parsed.data.limit,
      includeSubdomains: parsed.data.includeSubdomains,
    });
    return res.json(result);
  } catch (e) {
    req.log.error({ err: e }, "map failed");
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

router.post("/crawl", async (req, res) => {
  const parsed = CrawlBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  const g = guard(parsed.data.url);
  if (!g.ok) return res.status(g.status).json(g.body);
  try {
    const { url, ...opts } = parsed.data;
    const result = await crawlSite(url, opts);
    return res.json(result);
  } catch (e) {
    req.log.error({ err: e }, "crawl failed");
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

router.post("/extract", async (req, res) => {
  const parsed = ExtractInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
  }
  for (const u of parsed.data.urls) {
    const g = guard(u);
    if (!g.ok) return res.status(g.status).json({ ...g.body, url: u });
  }
  try {
    const result = await extractFromUrls(parsed.data);
    return res.json(result);
  } catch (e) {
    req.log.error({ err: e }, "extract failed");
    return res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

export default router;
