/**
 * /api/person-intel — save/load CRUD for person intelligence reports,
 * plus a fast Claude-only /quick enrichment endpoint.
 *
 * The full intelligence pipeline is at /api/engines/person-intel/run.
 * These routes persist reports to `prosengine_research` table
 * and auto-seed saved subjects into the ProsEngine Watchlist lead list.
 */

import { Router, type Request, type Response } from "express";
import { db, prosengine_research, lead_lists, lead_list_items } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { aiJson } from "../lib/ai.js";

const router = Router();

// ── POST /person-intel/save ───────────────────────────────────────────────────
router.post("/save", async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    personName: z.string().min(1),
    company: z.string().optional(),
    title: z.string().optional(),
    linkedinUrl: z.string().optional(),
    sellerContext: z.unknown().optional(),
    intelligenceGoals: z.array(z.string()).optional(),
    knownFacts: z.string().optional(),
    report: z.record(z.unknown()),
    tags: z.string().optional(),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() }); return; }

  const { personName, company, title, linkedinUrl, sellerContext, intelligenceGoals, knownFacts, report, tags, notes } = parsed.data;

  try {
    const [row] = await db.insert(prosengine_research).values({
      personName,
      company: company ?? null,
      title: title ?? null,
      linkedinUrl: linkedinUrl ?? null,
      sellerContext: sellerContext ? JSON.stringify(sellerContext) : null,
      intelligenceGoals: intelligenceGoals ? JSON.stringify(intelligenceGoals) : null,
      knownFacts: knownFacts ?? null,
      report,
      tags: tags ?? null,
      notes: notes ?? null,
    }).returning();

    res.json(row);

    // ── Auto-seed into ProsEngine Watchlist (background, non-blocking)
    setImmediate(async () => {
      try {
        const WATCHLIST_NAME = "ProsEngine Watchlist";
        let [watchlist] = await db.select().from(lead_lists).where(eq(lead_lists.name, WATCHLIST_NAME)).limit(1);
        if (!watchlist) {
          [watchlist] = await db.insert(lead_lists).values({
            name: WATCHLIST_NAME,
            criteria: JSON.stringify({ sources: ["prosengine"] }),
            status: "done",
            totalFound: 0,
            sourcesSearched: JSON.stringify(["prosengine"]),
          }).returning();
        }

        // Extract LinkedIn and bio from report
        let linkedin = linkedinUrl ?? null;
        let biography: string | null = null;
        try {
          const rpt = report as Record<string, unknown>;
          const prof = rpt.profile as Record<string, unknown> | undefined;
          if (prof?.linkedin && typeof prof.linkedin === "string" && prof.linkedin !== "Not found") linkedin = prof.linkedin;
          biography = rpt.executive_summary as string ?? null;
        } catch { /* non-fatal */ }

        await db.insert(lead_list_items).values({
          listId: watchlist.id,
          personName,
          personTitle: title ?? null,
          biography,
          linkedin,
          companyName: company ?? null,
          source: "prosengine",
          sourceId: `pe_${row.id}`,
          matchScore: 80,
          aiScore: 80,
          aiReasoning: "Manually added from ProsEngine Research — high-priority watchlist lead",
        });

        const [cnt] = await db
          .select({ c: sql<number>`count(*)::int` })
          .from(lead_list_items)
          .where(eq(lead_list_items.listId, watchlist.id));
        await db.update(lead_lists)
          .set({ totalFound: cnt?.c ?? 0, updatedAt: new Date() })
          .where(eq(lead_lists.id, watchlist.id));
      } catch (seedErr) {
        req.log?.warn({ err: seedErr }, "ProsEngine watchlist seed failed (non-fatal)");
      }
    });
  } catch (err: any) {
    req.log?.error({ err }, "person-intel save failed");
    res.status(500).json({ error: "Failed to save report" });
  }
});

// ── GET /person-intel/saved ───────────────────────────────────────────────────
router.get("/saved", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(prosengine_research)
      .orderBy(desc(prosengine_research.createdAt));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load saved research" });
  }
});

// ── GET /person-intel/saved/:id ───────────────────────────────────────────────
router.get("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [row] = await db
      .select()
      .from(prosengine_research)
      .where(eq(prosengine_research.id, id))
      .limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// ── PATCH /person-intel/saved/:id ────────────────────────────────────────────
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
      .update(prosengine_research)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(prosengine_research.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

// ── DELETE /person-intel/saved/:id ───────────────────────────────────────────
router.delete("/saved/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? ""));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(prosengine_research).where(eq(prosengine_research.id, id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete report" });
  }
});

// ── POST /person-intel/quick — fast Claude-only enrichment (for lead saving) ─
router.post("/quick", async (req: Request, res: Response): Promise<void> => {
  const schema = z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    title: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "name is required" }); return; }
  const { name, company, title } = parsed.data;

  try {
    const profile = await aiJson<Record<string, unknown>>({
      provider: "anthropic",
      system: "You are a Saudi Arabia B2B intelligence researcher. Generate a quick enrichment profile based on your training knowledge. Return ONLY a JSON object, no prose.",
      user: `Generate a quick enrichment profile for:\nPerson: ${name}\n${company ? `Company: ${company}\n` : ""}${title ? `Title: ${title}\n` : ""}Country: Saudi Arabia\n\nReturn JSON with these fields (use null for unknown):\n{\n  "email": "best-guess email pattern or null",\n  "phone": "best-guess phone or null",\n  "linkedin": "LinkedIn URL or null",\n  "nationality": "nationality or null",\n  "bio": "1-2 sentence professional bio based on role",\n  "industry": "industry sector",\n  "city": "likely city in Saudi Arabia or null",\n  "seniority": "C-Level|VP|Director|Manager|Staff",\n  "companySize": "estimated company size if known",\n  "revenue": "estimated company revenue range if known"\n}`,
      fallback: { bio: `${title ?? "Executive"} at ${company ?? "Saudi company"}`, industry: "Not found", seniority: "Unknown" },
    });
    res.json({ ok: true, profile });
  } catch (err: any) {
    req.log?.error({ err }, "person-intel quick failed");
    res.status(500).json({ error: "Quick enrichment failed" });
  }
});

// ── GET /person-intel/watchlist — ProsEngine Watchlist items ──────────────────
router.get("/watchlist", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [watchlist] = await db
      .select({ id: lead_lists.id })
      .from(lead_lists)
      .where(eq(lead_lists.name, "ProsEngine Watchlist"))
      .limit(1);
    if (!watchlist) { res.json([]); return; }
    const items = await db
      .select()
      .from(lead_list_items)
      .where(eq(lead_list_items.listId, watchlist.id))
      .orderBy(desc(lead_list_items.createdAt));
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load watchlist" });
  }
});

export default router;
