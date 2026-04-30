import { Router } from "express";
import { db } from "@workspace/db";
import { deals, contacts, companies, activities } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();

const STAGE_ORDER = ["lead", "qualified", "proposal", "negotiation", "closed_won"] as const;
const STAGE_PROBABILITY: Record<string, number> = {
  lead: 20,
  qualified: 40,
  proposal: 60,
  negotiation: 80,
  closed_won: 100,
  closed_lost: 0,
};
const STAGE_LABEL: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

router.get("/", async (req, res) => {
  try {
    const { stage, contact_id, company_id, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    const wheres = [];
    if (stage) wheres.push(eq(deals.stage, stage as any));
    if (contact_id) wheres.push(eq(deals.contact_id, contact_id));
    if (company_id) wheres.push(eq(deals.company_id, company_id));

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
      .where(wheres.length ? and(...wheres) : undefined)
      .orderBy(desc(deals.created_at))
      .limit(lim)
      .offset(off);

    const total = wheres.length
      ? results.length
      : await db.$count(deals);
    const [{ total_value }] = await db.select({ total_value: sql<number>`coalesce(sum(value), 0)::int` }).from(deals).where(wheres.length ? and(...wheres) : undefined);

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

// Advance a deal to the next stage (or to a specified stage like closed_lost).
// Auto-sets probability and writes an activity row to the contact timeline.
router.post("/:id/advance", async (req, res) => {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.id, req.params.id));
    if (!deal) return res.status(404).json({ error: "Deal not found" });

    const requested = (req.body?.to_stage as string | undefined)?.toLowerCase();
    let toStage = requested;
    if (!toStage) {
      const idx = STAGE_ORDER.indexOf(deal.stage as typeof STAGE_ORDER[number]);
      if (idx === -1 || idx >= STAGE_ORDER.length - 1) {
        return res.status(400).json({ error: "Deal is already at terminal stage" });
      }
      toStage = STAGE_ORDER[idx + 1];
    }
    if (!(toStage in STAGE_PROBABILITY)) {
      return res.status(400).json({ error: `Unknown stage: ${toStage}` });
    }
    if (toStage === deal.stage) {
      return res.status(400).json({ error: "Already at that stage" });
    }

    const fromStage = deal.stage as string;
    const probability = STAGE_PROBABILITY[toStage];

    // Atomic conditional update guards against concurrent stage changes.
    const updatedRows = await db
      .update(deals)
      .set({ stage: toStage as any, probability, updated_at: new Date() } as any)
      .where(and(eq(deals.id, deal.id), eq(deals.stage, fromStage as any)))
      .returning();
    if (updatedRows.length === 0) {
      return res.status(409).json({ error: "Deal stage changed concurrently. Please refresh." });
    }
    const updated = updatedRows[0];

    if (deal.contact_id) {
      const isWin = toStage === "closed_won";
      const isLoss = toStage === "closed_lost";
      const title = isWin
        ? `Deal won: ${deal.title}`
        : isLoss
          ? `Deal lost: ${deal.title}`
          : `Stage advanced: ${STAGE_LABEL[fromStage] ?? fromStage} → ${STAGE_LABEL[toStage] ?? toStage}`;
      const body = `${deal.title} · ${deal.value ? `$${(deal.value / 1000).toFixed(0)}k` : ""}`.trim();
      try {
        await db.insert(activities).values({
          type: "note" as any,
          title,
          body,
          contact_id: deal.contact_id,
          deal_id: deal.id,
          status: "completed",
          completed_at: new Date(),
          metadata: { source: "deal_advance", from: fromStage, to: toStage },
        } as any);
      } catch (e: any) {
        req.log.warn({ err: e?.message }, "failed to insert advance activity");
      }
    }

    res.json({ deal: updated, from: fromStage, to: toStage, probability });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: err?.message ?? "Failed to advance deal" });
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
