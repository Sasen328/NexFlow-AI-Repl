import { Router } from "express";
import { db } from "@workspace/db";
import { signals, contacts, companies } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { ingestWamdaFeed } from "../lib/signals/wamda-feed.js";

const router = Router();

// Pull live entrepreneurship signals from Wamda's public RSS feed
// (startup news across MENA/GCC: funding rounds, exec moves, expansions).
// Returns counts of items fetched/inserted/duplicate. Idempotent.
router.post("/refresh-wamda", async (req, res) => {
  try {
    const result = await ingestWamdaFeed("default");
    res.json({ ok: true, source: "wamda", ...result });
  } catch (err: any) {
    req.log?.error?.({ err: err?.message ?? String(err) }, "wamda ingest failed");
    res.status(502).json({ ok: false, error: err?.message ?? "wamda ingest failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { type, status, contact_id, company_id, limit = "50", offset = "0" } =
      req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    const wheres: any[] = [];
    if (type) wheres.push(eq(signals.type, type as any));
    if (status) wheres.push(eq(signals.status, status as any));
    if (contact_id) wheres.push(eq(signals.contact_id, contact_id));
    if (company_id) wheres.push(eq(signals.company_id, company_id));

    const results = await db
      .select({
        id: signals.id,
        org_id: signals.org_id,
        contact_id: signals.contact_id,
        contact_name: sql<string>`coalesce(concat(contacts.first_name, ' ', contacts.last_name), '')`,
        company_id: signals.company_id,
        company_name: companies.name,
        type: signals.type,
        title: signals.title,
        body: signals.body,
        score: signals.score,
        status: signals.status,
        source_url: signals.source_url,
        created_at: signals.created_at,
      })
      .from(signals)
      .leftJoin(contacts, eq(signals.contact_id, contacts.id))
      .leftJoin(companies, eq(signals.company_id, companies.id))
      .where(wheres.length > 0 ? and(...wheres) : undefined)
      .orderBy(desc(signals.score), desc(signals.created_at))
      .limit(lim)
      .offset(off);

    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list signals" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [signal] = await db.insert(signals).values({
      ...req.body,
      org_id: "default",
      score: req.body.score || Math.floor(Math.random() * 40 + 60),
    }).returning();
    res.status(201).json(signal);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create signal" });
  }
});

router.post("/:id/dismiss", async (req, res) => {
  try {
    const [updated] = await db
      .update(signals)
      .set({ status: "dismissed" })
      .where(eq(signals.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Signal not found" });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to dismiss signal" });
  }
});

// ── POST /signals/scan — company signal scan via signal-engine ─────────────────

router.post("/scan", async (req, res) => {
  const { companyName, companyId, domain, companyNameAr } = req.body as {
    companyName?: string; companyId?: string; domain?: string; companyNameAr?: string;
  };
  if (!companyName) { res.status(400).json({ error: "companyName required" }); return; }

  try {
    const { scanCompanySignals } = await import("../lib/signal-engine.js");
    const result = await scanCompanySignals({ companyName, companyNameAr, companyId, domain, saveToDB: true });
    res.json({ ok: true, ...result });
  } catch (err: any) {
    req.log?.error?.({ err: err?.message ?? String(err) }, "signal scan failed");
    res.status(500).json({ error: "Signal scan failed", detail: String(err) });
  }
});

// ── GET /signals/news — recent news signals ───────────────────────────────────

router.get("/news", async (req, res) => {
  const { company_id, limit = "20" } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit), 100);

  try {
    const wheres: any[] = [eq(signals.type, "news" as any)];
    if (company_id) wheres.push(eq(signals.company_id, company_id));

    const rows = await db.select().from(signals).where(and(...wheres)).orderBy(desc(signals.created_at)).limit(lim);
    res.json(rows);
  } catch (err: any) {
    req.log?.error?.({ err: err?.message ?? String(err) }, "news fetch failed");
    res.status(500).json({ error: "Failed to fetch news signals" });
  }
});

// ── GET /signals/sanctions — sanction match signals ───────────────────────────

router.get("/sanctions", async (req, res) => {
  const { limit = "50" } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit), 200);

  try {
    const rows = await db.select().from(signals)
      .where(eq(signals.type, "sanctions" as any))
      .orderBy(desc(signals.created_at)).limit(lim);
    res.json(rows);
  } catch (err: any) {
    req.log?.error?.({ err: err?.message ?? String(err) }, "sanctions fetch failed");
    res.status(500).json({ error: "Failed to fetch sanction signals" });
  }
});

// ── GET /signals/regulatory — regulatory signals ──────────────────────────────

router.get("/regulatory", async (req, res) => {
  const { company_id, limit = "30" } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit), 100);

  try {
    const wheres: any[] = [eq(signals.type, "regulatory" as any)];
    if (company_id) wheres.push(eq(signals.company_id, company_id));

    const rows = await db.select().from(signals).where(and(...wheres)).orderBy(desc(signals.created_at)).limit(lim);
    res.json(rows);
  } catch (err: any) {
    req.log?.error?.({ err: err?.message ?? String(err) }, "regulatory fetch failed");
    res.status(500).json({ error: "Failed to fetch regulatory signals" });
  }
});

// ── GET /signals/individual/:contactId — signals for a single contact ─────────

router.get("/individual/:contactId", async (req, res) => {
  const { contactId } = req.params;
  const { limit = "20" } = req.query as Record<string, string>;

  try {
    const rows = await db.select().from(signals)
      .where(eq(signals.contact_id, contactId))
      .orderBy(desc(signals.score), desc(signals.created_at))
      .limit(Math.min(parseInt(limit), 100));
    res.json(rows);
  } catch (err: any) {
    req.log?.error?.({ err: err?.message ?? String(err) }, "individual signal fetch failed");
    res.status(500).json({ error: "Failed to fetch individual signals" });
  }
});

// ── GET /signals/recent — last N signals across all types ─────────────────────

router.get("/recent", async (req, res) => {
  const { limit = "30", hours = "24" } = req.query as Record<string, string>;
  const lim   = Math.min(parseInt(limit), 200);
  const since = new Date(Date.now() - parseInt(hours) * 3600000);

  try {
    const rows = await db.select({
      id: signals.id,
      type: signals.type,
      title: signals.title,
      score: signals.score,
      status: signals.status,
      contact_id: signals.contact_id,
      company_id: signals.company_id,
      created_at: signals.created_at,
    }).from(signals)
      .where(sql`${signals.created_at} >= ${since}`)
      .orderBy(desc(signals.score), desc(signals.created_at))
      .limit(lim);

    res.json(rows);
  } catch (err: any) {
    req.log?.error?.({ err: err?.message ?? String(err) }, "recent signals fetch failed");
    res.status(500).json({ error: "Failed to fetch recent signals" });
  }
});

// ── GET /signals/feed — SSE stream of live signals ────────────────────────────

router.get("/feed", (req, res) => {
  (res as any).setHeader("Content-Type", "text/event-stream");
  (res as any).setHeader("Cache-Control", "no-cache");
  (res as any).setHeader("Connection", "keep-alive");
  (res as any).setHeader("X-Accel-Buffering", "no");
  (res as any).flushHeaders?.();

  const send = (data: unknown) => (res as any).write(`data: ${JSON.stringify(data)}\n\n`);

  send({ type: "connected", message: "Signal feed active. Poll /signals/recent for live updates.", ts: Date.now() });

  const heartbeat = setInterval(() => send({ type: "heartbeat", ts: Date.now() }), 20000);

  (req as any).on("close", () => {
    clearInterval(heartbeat);
    (res as any).end();
  });
});

// ── POST /signals/:id/push-to-genome — index a signal into Lead Genome ────────

router.post("/:id/push-to-genome", async (req, res) => {
  try {
    const [signal] = await db.select().from(signals).where(eq(signals.id, req.params.id)).limit(1);
    if (!signal) { res.status(404).json({ error: "Signal not found" }); return; }

    const { saveLead } = await import("../lib/lead-genome.js");
    const result = await saveLead({
      sourceTable: "signals",
      company: signal.company_id || undefined,
    });

    res.json({ ok: true, signalId: req.params.id, genome: result });
  } catch (err: any) {
    req.log?.error?.({ err: err?.message ?? String(err) }, "push-to-genome failed");
    res.status(500).json({ error: "Failed to push to genome", detail: String(err) });
  }
});

export default router;
