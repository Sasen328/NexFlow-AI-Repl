import { Router } from "express";
import { db } from "@workspace/db";
import { signals, contacts, companies } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { type, status, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

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
