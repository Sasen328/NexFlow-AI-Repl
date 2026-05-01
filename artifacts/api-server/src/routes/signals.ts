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

export default router;
