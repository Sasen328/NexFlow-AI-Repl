// ─── /api/scout — Scout OSINT Microservice Proxy ─────────────────────────────
//
//  Proxies calls to the Python Scout sidecar (SCOUT_URL env var).
//  Degrades to built-in Node.js equivalents when Scout is unavailable.
//
//  GET  /api/scout/status
//  POST /api/scout/site-intel
//  POST /api/scout/signals
//  POST /api/scout/signals/regulatory
//  POST /api/scout/osint
//  POST /api/scout/sherlock
//  POST /api/scout/theharvester
//  POST /api/scout/scrapegraph
//  POST /api/scout/crawl4ai
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type Request, type Response } from "express";
import { scoutSiteIntel, scoutSignalsFull, scoutSignalsRegulatory } from "../lib/scout-client.js";
import { sherlockLookup } from "../lib/scrapers/sherlock-client.js";
import { harvestEmails } from "../lib/scrapers/theharvester-client.js";
import { scrapeGraphExtract } from "../lib/scrapers/scrapegraph-client.js";

const router = Router();

const SCOUT_URL = process.env.SCOUT_URL || "";

async function scoutProxy<T>(path: string, body: unknown, timeoutMs = 60000): Promise<{ ok: boolean; data?: T; error?: string; degraded?: boolean }> {
  if (!SCOUT_URL) return { ok: false, degraded: true, error: "SCOUT_URL not configured" };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const resp = await fetch(`${SCOUT_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!resp.ok) return { ok: false, error: `Scout returned ${resp.status}` };
    return { ok: true, data: await resp.json() as T };
  } catch (err) {
    clearTimeout(t);
    return { ok: false, degraded: true, error: String(err) };
  }
}

// ── Status ───────────────────────────────────────────────────────────────────

router.get("/scout/status", async (_req: Request, res: Response): Promise<void> => {
  if (!SCOUT_URL) {
    res.json({ ok: true, scoutUrl: null, available: false, fallback: "built-in node.js scrapers" });
    return;
  }
  try {
    const resp = await fetch(`${SCOUT_URL}/health`, { signal: AbortSignal.timeout(5000) });
    const data = await resp.json();
    res.json({ ok: true, scoutUrl: SCOUT_URL, available: true, health: data });
  } catch {
    res.json({ ok: false, scoutUrl: SCOUT_URL, available: false, error: "Scout unreachable" });
  }
});

// ── Site Intel ───────────────────────────────────────────────────────────────

router.post("/scout/site-intel", async (req: Request, res: Response): Promise<void> => {
  const { url, companyName } = req.body as { url?: string; companyName?: string };
  if (!url) { res.status(400).json({ error: "url required" }); return; }

  const proxy = await scoutProxy<Record<string, unknown>>("/site-intel", { url, companyName });
  if (proxy.ok && proxy.data) { res.json({ ok: true, source: "scout", data: proxy.data }); return; }

  try {
    const data = await scoutSiteIntel(url);
    res.json({ ok: true, source: "built-in", degraded: proxy.degraded, data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Buying Signals ───────────────────────────────────────────────────────────

router.post("/scout/signals", async (req: Request, res: Response): Promise<void> => {
  const { companyName, url } = req.body as { companyName?: string; url?: string };
  if (!companyName) { res.status(400).json({ error: "companyName required" }); return; }

  const proxy = await scoutProxy<Record<string, unknown>>("/signals", { companyName, url });
  if (proxy.ok && proxy.data) { res.json({ ok: true, source: "scout", data: proxy.data }); return; }

  try {
    const data = await scoutSignalsFull(companyName, url ? { domain: url } : undefined);
    res.json({ ok: true, source: "built-in", degraded: proxy.degraded, data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Regulatory Signals ────────────────────────────────────────────────────────

router.post("/scout/signals/regulatory", async (req: Request, res: Response): Promise<void> => {
  const { companyName } = req.body as { companyName?: string };
  if (!companyName) { res.status(400).json({ error: "companyName required" }); return; }

  const proxy = await scoutProxy<Record<string, unknown>>("/signals/regulatory", { companyName });
  if (proxy.ok && proxy.data) { res.json({ ok: true, source: "scout", data: proxy.data }); return; }

  try {
    const data = await scoutSignalsRegulatory(companyName);
    res.json({ ok: true, source: "built-in", degraded: proxy.degraded, data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Full OSINT Sweep ──────────────────────────────────────────────────────────

router.post("/scout/osint", async (req: Request, res: Response): Promise<void> => {
  const { name, company, email, linkedinUrl, mode } = req.body as {
    name?: string; company?: string; email?: string; linkedinUrl?: string; mode?: "person" | "company";
  };

  if (!name && !company && !email) { res.status(400).json({ error: "name, company, or email required" }); return; }

  const proxy = await scoutProxy<Record<string, unknown>>("/osint", { name, company, email, linkedinUrl, mode }, 90000);
  if (proxy.ok && proxy.data) { res.json({ ok: true, source: "scout", data: proxy.data }); return; }

  const results: Record<string, unknown> = {};

  // Sherlock fallback for person
  if (name && mode !== "company") {
    const username = name.toLowerCase().replace(/\s+/g, ".");
    try { results.sherlock = await sherlockLookup(username); } catch { /* */ }
  }

  // theHarvester fallback for email domain / company
  const domain = email?.split("@")[1] || "";
  if (domain) {
    try { results.theharvester = await harvestEmails(domain, 30000); } catch { /* */ }
  }

  res.json({ ok: true, source: "built-in", degraded: proxy.degraded, data: results });
});

// ── Sherlock ─────────────────────────────────────────────────────────────────

router.post("/scout/sherlock", async (req: Request, res: Response): Promise<void> => {
  const { username, timeoutMs } = req.body as { username?: string; timeoutMs?: number };
  if (!username) { res.status(400).json({ error: "username required" }); return; }

  const proxy = await scoutProxy<Record<string, unknown>>("/sherlock", { username, timeout: timeoutMs || 60 });
  if (proxy.ok && proxy.data) { res.json({ ok: true, source: "scout", data: proxy.data }); return; }

  try {
    const data = await sherlockLookup(username, timeoutMs || 60000);
    res.json({ ok: true, source: "built-in", degraded: proxy.degraded, data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── theHarvester ──────────────────────────────────────────────────────────────

router.post("/scout/theharvester", async (req: Request, res: Response): Promise<void> => {
  const { domain, timeoutMs } = req.body as { domain?: string; timeoutMs?: number };
  if (!domain) { res.status(400).json({ error: "domain required" }); return; }

  const proxy = await scoutProxy<Record<string, unknown>>("/theharvester", { domain, limit: 100 });
  if (proxy.ok && proxy.data) { res.json({ ok: true, source: "scout", data: proxy.data }); return; }

  try {
    const data = await harvestEmails(domain, timeoutMs || 60000);
    res.json({ ok: true, source: "built-in", degraded: proxy.degraded, data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── ScrapeGraphAI ────────────────────────────────────────────────────────────

router.post("/scout/scrapegraph", async (req: Request, res: Response): Promise<void> => {
  const { url, schemaPrompt, schema } = req.body as { url?: string; schemaPrompt?: string; schema?: string };
  if (!url) { res.status(400).json({ error: "url required" }); return; }

  const prompt = schemaPrompt || schema || "Extract all structured data";

  const proxy = await scoutProxy<Record<string, unknown>>("/scrapegraph", { url, schema: prompt });
  if (proxy.ok && proxy.data) { res.json({ ok: true, source: "scout", data: proxy.data }); return; }

  try {
    const data = await scrapeGraphExtract(url, prompt);
    res.json({ ok: true, source: "built-in", degraded: proxy.degraded, data });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Crawl4AI ─────────────────────────────────────────────────────────────────

router.post("/scout/crawl4ai", async (req: Request, res: Response): Promise<void> => {
  const { url, extraction_strategy, css_selector } = req.body as {
    url?: string; extraction_strategy?: string; css_selector?: string;
  };
  if (!url) { res.status(400).json({ error: "url required" }); return; }

  const proxy = await scoutProxy<Record<string, unknown>>("/crawl4ai", { url, extraction_strategy, css_selector });
  if (proxy.ok && proxy.data) { res.json({ ok: true, source: "scout", data: proxy.data }); return; }

  try {
    const { scrapePage } = await import("../lib/power-scraper.js");
    const result = await scrapePage(url, { forceEngine: "playwright-stealth" });
    res.json({ ok: true, source: "built-in-playwright", degraded: proxy.degraded, data: { url, text: result.text, htmlLength: result.html?.length || 0 } });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
