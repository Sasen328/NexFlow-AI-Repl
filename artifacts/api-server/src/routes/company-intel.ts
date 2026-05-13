/**
 * /api/company-intel — save/load CRUD for company intelligence reports.
 *
 * The full intelligence pipeline is at /api/engines/company-intel/run.
 * These routes persist reports to `company_intel_research` table
 * for the ProsEngine research library UI.
 */

import { Router, type Request, type Response } from "express";
import { db, company_intel_research } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// ── POST /company-intel/save ──────────────────────────────────────────────────
router.post("/save", async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    companyName: z.string().min(1),
    crNumber: z.string().optional(),
    city: z.string().optional(),
    website: z.string().optional(),
    sellerContext: z.unknown().optional(),
    intelligenceGoals: z.array(z.string()).optional(),
    knownFacts: z.string().optional(),
    report: z.record(z.unknown()),
    tags: z.string().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() }); return; }

  const { companyName, crNumber, city, website, sellerContext, intelligenceGoals, knownFacts, report, tags, notes } = parsed.data;

  try {
    const [row] = await db.insert(company_intel_research).values({
      companyName,
      crNumber: crNumber ?? null,
      city: city ?? null,
      website: website ?? null,
      sellerContext: sellerContext ? JSON.stringify(sellerContext) : null,
      intelligenceGoals: intelligenceGoals ? JSON.stringify(intelligenceGoals) : null,
      knownFacts: knownFacts ?? null,
      report,
      tags: tags ?? null,
      notes: notes ?? null,
    }).returning();
    res.json(row);
  } catch (err: any) {
    req.log?.error({ err }, "company-intel save failed");
    res.status(500).json({ error: "Failed to save report" });
  }
});

// ── GET /company-intel/saved ──────────────────────────────────────────────────
router.get("/saved", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(company_intel_research)
      .orderBy(desc(company_intel_research.createdAt));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load saved reports" });
  }
});

// ── GET /company-intel/saved/:id ──────────────────────────────────────────────
router.get("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db
      .select()
      .from(company_intel_research)
      .where(eq(company_intel_research.id, id))
      .limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// ── PATCH /company-intel/saved/:id ───────────────────────────────────────────
router.patch("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const schema = z.object({
    tags: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  try {
    const [row] = await db
      .update(company_intel_research)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(company_intel_research.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

// ── DELETE /company-intel/saved/:id ──────────────────────────────────────────
router.delete("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(company_intel_research).where(eq(company_intel_research.id, id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;
