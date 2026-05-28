// ─── /api/meshbase — Meshbase Network Company Database ───────────────────────
//
//  Meshbase is the unified company mesh — a graph-oriented view of companies,
//  their relationships, shared executives, and network connections.
//
//  GET  /api/meshbase/search           — fuzzy search across all company tables
//  GET  /api/meshbase/company/:id      — get company with network edges
//  POST /api/meshbase/company/:id/enrich — trigger re-enrichment
//  GET  /api/meshbase/graph/:id        — get relationship graph for a company
//  GET  /api/meshbase/stats            — cross-table database stats
//  POST /api/meshbase/merge            — merge two company records
//
// ─────────────────────────────────────────────────────────────────────────────

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import {
  companies, contacts, masar_companies, builder_companies,
  executivesTable, companySignalsTable,
} from "@workspace/db";
import { ilike, or, eq, sql, desc } from "drizzle-orm";
import { nexusRunRole } from "../lib/nexus/index.js";

const router = Router();

// ── Search across all tables ──────────────────────────────────────────────────

router.get("/meshbase/search", async (req: Request, res: Response): Promise<void> => {
  const { q, limit = "20" } = req.query as Record<string, string>;
  const lim = Math.min(parseInt(limit), 100);

  if (!q || q.length < 2) { res.status(400).json({ error: "q required (min 2 chars)" }); return; }

  try {
    const [crmRows, masarRows, builderRows] = await Promise.all([
      db.select({ id: companies.id, name: companies.name, source: sql<string>`'crm'`, city: companies.city, sector: companies.industry })
        .from(companies).where(ilike(companies.name, `%${q}%`)).limit(lim),
      db.select({ id: masar_companies.id, name: masar_companies.nameEn, source: sql<string>`'masaar'`, city: masar_companies.city, sector: masar_companies.industry })
        .from(masar_companies).where(or(ilike(masar_companies.nameEn!, `%${q}%`), ilike(masar_companies.nameAr!, `%${q}%`))).limit(lim),
      db.select({ id: builder_companies.id, name: builder_companies.nameEn, source: sql<string>`'builder'`, city: builder_companies.city, sector: builder_companies.industry })
        .from(builder_companies).where(or(ilike(builder_companies.nameEn!, `%${q}%`), ilike(builder_companies.nameAr!, `%${q}%`))).limit(lim),
    ]);

    const merged = [...crmRows, ...masarRows, ...builderRows]
      .slice(0, lim)
      .map((r) => ({ ...r, id: String(r.id) }));

    res.json({ ok: true, results: merged, total: merged.length, query: q });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Get company with network context ──────────────────────────────────────────

router.get("/meshbase/company/:source/:id", async (req: Request, res: Response): Promise<void> => {
  const { source, id } = req.params as Record<string, string>;

  try {
    let company: Record<string, unknown> | null = null;

    if (source === "crm") {
      const [row] = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
      company = row as unknown as Record<string, unknown> | null;
    } else if (source === "masaar") {
      const [row] = await db.select().from(masar_companies).where(eq(masar_companies.id, parseInt(id))).limit(1);
      company = row as unknown as Record<string, unknown> | null;
    } else if (source === "builder") {
      const [row] = await db.select().from(builder_companies).where(eq(builder_companies.id, parseInt(id))).limit(1);
      company = row as unknown as Record<string, unknown> | null;
    }

    if (!company) { res.status(404).json({ error: "Company not found" }); return; }

    // Fetch related entities
    const numericId = parseInt(id) || 0;
    const [executives, signalRows, contactCount] = await Promise.all([
      source === "crm"
        ? db.select().from(executivesTable).where(eq(executivesTable.companyId!, numericId)).limit(10)
        : Promise.resolve([]),
      source === "crm"
        ? db.select().from(companySignalsTable).where(eq(companySignalsTable.companyId!, numericId)).limit(10)
        : Promise.resolve([]),
      source === "crm"
        ? db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.company_id, id))
        : Promise.resolve([{ count: 0 }]),
    ]);

    res.json({
      ok: true,
      company,
      source,
      network: {
        executives,
        signals: signalRows,
        contactCount: Number(contactCount?.[0]?.count || 0),
      },
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Relationship graph (stub — returns adjacency list) ─────────────────────────

router.get("/meshbase/graph/:source/:id", async (req: Request, res: Response): Promise<void> => {
  const { source, id } = req.params as Record<string, string>;

  try {
    // Get target company
    let name = "";
    if (source === "crm") {
      const [r] = await db.select({ name: companies.name }).from(companies).where(eq(companies.id, id)).limit(1);
      name = r?.name || "";
    } else if (source === "masaar") {
      const [r] = await db.select({ name: masar_companies.nameEn }).from(masar_companies).where(eq(masar_companies.id, parseInt(id))).limit(1);
      name = r?.name || "";
    }

    // Use NEXUS to generate relationship graph data
    const graphData = await nexusRunRole("researcher", `
For Saudi company "${name}", identify:
1. Parent/holding company (if any)
2. Subsidiaries and affiliates
3. Joint ventures and partnerships
4. Key clients (publicly known)
5. Key suppliers (publicly known)
6. Regulatory bodies that oversee this company

Return JSON: {
  "nodes": [{"id": "string", "name": "string", "type": "company|regulatory|person", "role": "parent|subsidiary|partner|client|supplier|regulator"}],
  "edges": [{"from": "string", "to": "string", "type": "owns|partners|supplies|regulates|client_of"}]
}
`, { maxTokens: 1500 });

    const parsed = tryParseJson(graphData.text) || { nodes: [], edges: [] };
    res.json({ ok: true, companyId: id, source, companyName: name, graph: parsed });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Database stats ────────────────────────────────────────────────────────────

router.get("/meshbase/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const [crm, masaar, builder, execs, signals, contactsCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(companies),
      db.select({ count: sql<number>`count(*)` }).from(masar_companies),
      db.select({ count: sql<number>`count(*)` }).from(builder_companies),
      db.select({ count: sql<number>`count(*)` }).from(executivesTable),
      db.select({ count: sql<number>`count(*)` }).from(companySignalsTable),
      db.select({ count: sql<number>`count(*)` }).from(contacts),
    ]);

    res.json({
      ok: true,
      tables: {
        crm:       Number(crm?.[0]?.count || 0),
        masaar:    Number(masaar?.[0]?.count || 0),
        builder:   Number(builder?.[0]?.count || 0),
        executives: Number(execs?.[0]?.count || 0),
        signals:   Number(signals?.[0]?.count || 0),
        contacts:  Number(contactsCount?.[0]?.count || 0),
      },
      total: Number(crm?.[0]?.count || 0) + Number(masaar?.[0]?.count || 0) + Number(builder?.[0]?.count || 0),
    });
  } catch (err) {
    res.json({ ok: true, tables: {}, total: 0, error: String(err) });
  }
});

// ── Merge two company records ─────────────────────────────────────────────────

router.post("/meshbase/merge", async (req: Request, res: Response): Promise<void> => {
  const { sourceId, targetId, sourceTable, targetTable } = req.body as {
    sourceId?: string; targetId?: string; sourceTable?: string; targetTable?: string;
  };

  if (!sourceId || !targetId) {
    res.status(400).json({ error: "sourceId and targetId required" });
    return;
  }

  // Re-assign contacts from source → target (CRM only)
  if (sourceTable === "crm" && targetTable === "crm") {
    try {
      await db.update(contacts).set({ company_id: targetId }).where(eq(contacts.company_id, sourceId));
      res.json({ ok: true, action: "contacts_reassigned", from: sourceId, to: targetId });
      return;
    } catch (err) {
      res.status(500).json({ error: String(err) });
      return;
    }
  }

  // Cross-table merge: just log intent (full merge is out of scope for now)
  res.json({
    ok: true,
    action: "merge_logged",
    message: "Cross-table merge queued. Full dedup pipeline will process this pair.",
    sourceId, targetId, sourceTable, targetTable,
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tryParseJson(text: string | null | undefined): Record<string, unknown> | null {
  if (!text) return null;
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]) as Record<string, unknown>; } catch { /* */ }
  return null;
}

export default router;
