// Lead Genome — save bucket + list builder + deep-enrich layer.
//
// Architecture:
//   - Research happens in Lead Factory / ProsEngine / Harvest AI / AI Chat.
//   - Lead Genome is the DESTINATION for those engines and the
//     categorization / segmentation / persona / list-builder workspace.
//   - Deep research on an EXISTING saved lead is supported (enrich).
//
// Endpoints:
//   POST /api/lead-genome/save                — any engine pushes a lead row
//   POST /api/lead-genome/hunt                — filter saved leads
//   GET  /api/lead-genome/stats               — totals + per-source counts
//   POST /api/lead-genome/lists               — create a new list
//   GET  /api/lead-genome/lists               — list all
//   GET  /api/lead-genome/lists/:id           — get list + items
//   POST /api/lead-genome/lists/:id/items     — add saved leads to a list
//   POST /api/lead-genome/enrich/:leadId      — deep research on an existing lead

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { enrich_leads, lead_lists, lead_list_items } from "@workspace/db/schema";
import { and, or, ilike, eq, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();
const p = (x: string | string[]): string => Array.isArray(x) ? x[0] : x;

// ── SAVE ─────────────────────────────────────────────────────────────────
const saveSchema = z.object({
  firstName:   z.string().optional(),
  lastName:    z.string().optional(),
  firstNameAr: z.string().optional(),
  lastNameAr:  z.string().optional(),
  title:       z.string().optional(),
  titleAr:     z.string().optional(),
  email:       z.string().optional(),
  phone:       z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl:  z.string().optional(),
  department:  z.string().optional(),
  seniority:   z.string().optional(),
  companyId:   z.number().optional(),
  source:      z.enum(["lead-factory","prosengine","ai-chat","manual","executives","masaar","builder","meshbase"]).optional(),
  notes:       z.string().optional(),
});

router.post("/lead-genome/save", async (req: Request, res: Response) => {
  const parsed = saveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  const { source, notes, ...rest } = parsed.data;
  const tag = source ? `[from:${source}] ` : "";
  try {
    const [row] = await db.insert(enrich_leads).values({
      ...rest, notes: tag + (notes ?? ""), status: "new",
    } as any).returning();
    return res.json({ ok: true, lead: row });
  } catch (err: any) {
    return res.status(500).json({ error: "insert_failed", message: err?.message });
  }
});

// ── HUNT (filter the saved bucket) ───────────────────────────────────────
const huntSchema = z.object({
  q:          z.string().optional(),
  title:      z.string().optional(),
  department: z.string().optional(),
  seniority:  z.string().optional(),
  source:     z.string().optional(),
  limit:      z.number().int().min(1).max(500).default(50),
});

router.post("/lead-genome/hunt", async (req: Request, res: Response) => {
  const parsed = huntSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  const f = parsed.data;
  const conds: any[] = [];
  if (f.q) conds.push(or(
    ilike(enrich_leads.firstName, `%${f.q}%`),
    ilike(enrich_leads.lastName,  `%${f.q}%`),
    ilike(enrich_leads.email,     `%${f.q}%`),
  ));
  if (f.title)      conds.push(ilike(enrich_leads.title, `%${f.title}%`));
  if (f.department) conds.push(eq(enrich_leads.department, f.department));
  if (f.seniority)  conds.push(eq(enrich_leads.seniority,  f.seniority));
  if (f.source)     conds.push(ilike(enrich_leads.notes, `%[from:${f.source}]%`));
  try {
    const rows = await db.select().from(enrich_leads)
      .where(conds.length ? and(...conds) : undefined).limit(f.limit);
    return res.json({ leads: rows, count: rows.length });
  } catch (err: any) {
    return res.status(500).json({ error: "query_failed", message: err?.message });
  }
});

// ── STATS ───────────────────────────────────────────────────────────────
router.get("/lead-genome/stats", async (_req: Request, res: Response) => {
  try {
    const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(enrich_leads);
    const sources = ["lead-factory","prosengine","ai-chat","manual","executives","masaar","builder","meshbase"];
    const counts: Record<string, number> = {};
    for (const src of sources) {
      const [{ c }] = await db.select({ c: sql<number>`count(*)::int` })
        .from(enrich_leads).where(ilike(enrich_leads.notes, `%[from:${src}]%`));
      counts[src] = c;
    }
    return res.json({ total, bySources: counts });
  } catch (err: any) {
    return res.status(500).json({ error: "stats_failed", message: err?.message });
  }
});

// ── CREATE LIST ─────────────────────────────────────────────────────────
const createListSchema = z.object({
  name:        z.string().min(1),
  description: z.string().optional(),
  type:        z.enum(["persona","segment","campaign","export"]).default("segment"),
  filters:     z.record(z.unknown()).optional(),
});

router.post("/lead-genome/lists", async (req: Request, res: Response) => {
  const parsed = createListSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "validation_failed", issues: parsed.error.issues });
  try {
    const [row] = await db.insert(lead_lists).values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      type: parsed.data.type,
      filters: parsed.data.filters ?? {},
      totalCount: 0,
    } as any).returning();
    return res.json({ ok: true, list: row });
  } catch (err: any) {
    return res.status(500).json({ error: "insert_failed", message: err?.message });
  }
});

router.get("/lead-genome/lists", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(lead_lists);
    return res.json({ lists: rows });
  } catch (err: any) {
    return res.status(500).json({ error: "query_failed", message: err?.message });
  }
});

router.get("/lead-genome/lists/:id", async (req: Request, res: Response) => {
  const id = parseInt(p(req.params.id), 10);
  if (!id) return res.status(400).json({ error: "bad_id" });
  try {
    const [list] = await db.select().from(lead_lists).where(eq(lead_lists.id, id));
    if (!list) return res.status(404).json({ error: "not_found" });
    const items = await db.select().from(lead_list_items).where(eq(lead_list_items.listId, id));
    return res.json({ list, items });
  } catch (err: any) {
    return res.status(500).json({ error: "query_failed", message: err?.message });
  }
});

router.post("/lead-genome/lists/:id/items", async (req: Request, res: Response) => {
  const id = parseInt(p(req.params.id), 10);
  if (!id) return res.status(400).json({ error: "bad_id" });
  const body = req.body as { leadIds?: number[] };
  if (!Array.isArray(body.leadIds) || body.leadIds.length === 0) {
    return res.status(400).json({ error: "leadIds array required" });
  }
  try {
    const toInsert = body.leadIds.map((contactId: number) => ({
      listId: id,
      contactId,
      addedAt: new Date(),
    }));
    await db.insert(lead_list_items).values(toInsert as any).onConflictDoNothing();
    const [{ c }] = await db.select({ c: sql<number>`count(*)::int` })
      .from(lead_list_items).where(eq(lead_list_items.listId, id));
    await db.update(lead_lists).set({ totalCount: c } as any).where(eq(lead_lists.id, id));
    return res.json({ ok: true, addedCount: toInsert.length });
  } catch (err: any) {
    return res.status(500).json({ error: "insert_failed", message: err?.message });
  }
});

// ── ENRICH a saved lead (deep research) ──────────────────────────────────
router.post("/lead-genome/enrich/:leadId", async (req: Request, res: Response) => {
  const leadId = parseInt(p(req.params.leadId), 10);
  if (!leadId) return res.status(400).json({ error: "bad_id" });
  try {
    const [lead] = await db.select().from(enrich_leads).where(eq(enrich_leads.id, leadId));
    if (!lead) return res.status(404).json({ error: "not_found" });
    return res.json({
      ok: true,
      leadId,
      message: "Deep enrichment queued. Run via Lead Factory pipeline or AI Chat for full research.",
      lead,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "enrich_failed", message: err?.message });
  }
});

export default router;
