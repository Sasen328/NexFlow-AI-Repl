import { Router } from "express";
import { db } from "@workspace/db";
import { deals, contacts, companies } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { stage, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    const results = await db
      .select({
        id: deals.id,
        org_id: deals.org_id,
        title: deals.title,
        contact_id: deals.contact_id,
        contact_name: sql<string>`coalesce(concat(contacts.first_name, ' ', contacts.last_name), '')`,
        company_id: deals.company_id,
        company_name: companies.name,
        stage: deals.stage,
        value: deals.value,
        currency: deals.currency,
        probability: deals.probability,
        expected_close_date: deals.expected_close_date,
        notes: deals.notes,
        tags: deals.tags,
        created_at: deals.created_at,
        updated_at: deals.updated_at,
      })
      .from(deals)
      .leftJoin(contacts, eq(deals.contact_id, contacts.id))
      .leftJoin(companies, eq(deals.company_id, companies.id))
      .orderBy(desc(deals.created_at))
      .limit(lim)
      .offset(off);

    const total = await db.$count(deals);
    const [{ total_value }] = await db.select({ total_value: sql<number>`coalesce(sum(value), 0)::int` }).from(deals);

    res.json({ deals: results, total, total_value });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list deals" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [deal] = await db.insert(deals).values({
      ...req.body,
      org_id: "default",
    }).returning();
    res.status(201).json(deal);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create deal" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [deal] = await db
      .select({
        id: deals.id,
        org_id: deals.org_id,
        title: deals.title,
        contact_id: deals.contact_id,
        contact_name: sql<string>`coalesce(concat(contacts.first_name, ' ', contacts.last_name), '')`,
        company_id: deals.company_id,
        company_name: companies.name,
        stage: deals.stage,
        value: deals.value,
        currency: deals.currency,
        probability: deals.probability,
        expected_close_date: deals.expected_close_date,
        notes: deals.notes,
        tags: deals.tags,
        created_at: deals.created_at,
        updated_at: deals.updated_at,
      })
      .from(deals)
      .leftJoin(contacts, eq(deals.contact_id, contacts.id))
      .leftJoin(companies, eq(deals.company_id, companies.id))
      .where(eq(deals.id, req.params.id));
    if (!deal) return res.status(404).json({ error: "Deal not found" });
    res.json(deal);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get deal" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const [updated] = await db
      .update(deals)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(deals.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Deal not found" });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update deal" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(deals).where(eq(deals.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete deal" });
  }
});

export default router;
