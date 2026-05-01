import { Router } from "express";
import { db } from "@workspace/db";
import { static_lists, static_list_members, contacts, companies, users } from "@workspace/db";
import { and, eq, desc, sql, inArray } from "drizzle-orm";
import { aiJson } from "../lib/ai.js";
import { randomUUID } from "crypto";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const results = await db
      .select({
        id: static_lists.id,
        name: static_lists.name,
        description: static_lists.description,
        object_type: static_lists.object_type,
        owner_id: static_lists.owner_id,
        owner_name: users.name,
        color: static_lists.color,
        member_count: sql<number>`(select count(*) from static_list_members where list_id = ${static_lists.id})::int`,
        created_at: static_lists.created_at,
        updated_at: static_lists.updated_at,
      })
      .from(static_lists)
      .leftJoin(users, eq(users.id, static_lists.owner_id))
      .orderBy(desc(static_lists.updated_at));
    res.json({ lists: results, total: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [l] = await db.insert(static_lists).values({ ...req.body, org_id: "default" }).returning();
    res.status(201).json(l);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(static_lists).where(eq(static_lists.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [list] = await db.select().from(static_lists).where(eq(static_lists.id, req.params.id));
    if (!list) return res.status(404).json({ error: "Not found" });
    const memberRows = await db.select({ entity_id: static_list_members.entity_id, added_at: static_list_members.added_at })
      .from(static_list_members)
      .where(eq(static_list_members.list_id, req.params.id));
    let members: any[] = [];
    if (memberRows.length) {
      const ids = memberRows.map(m => m.entity_id);
      if (list.object_type === "contact") {
        members = await db.select().from(contacts).where(inArray(contacts.id, ids));
      } else if (list.object_type === "company") {
        members = await db.select().from(companies).where(inArray(companies.id, ids));
      }
    }
    res.json({ ...list, members });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// Bulk add a contact/company to multiple lists at once
router.post("/bulk-add", async (req, res) => {
  try {
    const { list_ids, entity_ids } = req.body as { list_ids: string[]; entity_ids: string[] };
    if (!Array.isArray(list_ids) || !Array.isArray(entity_ids)) return res.status(400).json({ error: "list_ids and entity_ids required" });
    const rows: any[] = [];
    for (const lid of list_ids) for (const eid of entity_ids) rows.push({ list_id: lid, entity_id: eid });
    if (!rows.length) return res.json({ added: 0 });
    await db.insert(static_list_members).values(rows).onConflictDoNothing();
    res.status(201).json({ added: rows.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.post("/:id/members", async (req, res) => {
  try {
    const { entity_ids } = req.body as { entity_ids: string[] };
    if (!Array.isArray(entity_ids) || !entity_ids.length) return res.status(400).json({ error: "entity_ids required" });
    const rows = entity_ids.map(eid => ({ list_id: req.params.id, entity_id: eid }));
    await db.insert(static_list_members).values(rows).onConflictDoNothing();
    res.status(201).json({ added: rows.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.delete("/:id/members/:entityId", async (req, res) => {
  try {
    await db.delete(static_list_members).where(and(eq(static_list_members.list_id, req.params.id), eq(static_list_members.entity_id, req.params.entityId)));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// ── POST /api/lists/ai-generate ────────────────────────────────────────────
// AI generates a call list from existing CRM contacts based on questionnaire
// body: { name, criteria: { industry, seniority, stage, intent, region, callWindow, goalNotes, maxCount } }
router.post("/ai-generate", async (req, res) => {
  try {
    const { name = "AI Call List", criteria = {} } = req.body ?? {};
    const {
      industry = "",
      seniority = "",
      stage = "",
      intent = "",
      region = "",
      callWindow = "",
      goalNotes = "",
      maxCount = 20,
    } = criteria;

    // Fetch candidate contacts from DB (score ≥ 40 or any contact)
    const candidates = await db
      .select({
        id: contacts.id,
        first_name: contacts.first_name,
        last_name: contacts.last_name,
        title: contacts.title,
        email: contacts.email,
        phone: contacts.phone,
        lead_score: contacts.lead_score,
        status: contacts.status,
        tags: contacts.tags,
        notes: contacts.notes,
        company_id: contacts.company_id,
        source: contacts.source,
      })
      .from(contacts)
      .limit(200);

    if (!candidates.length) {
      return res.status(422).json({ error: "No contacts in CRM yet. Add contacts first." });
    }

    // Build compact candidate list for AI
    const candidateSummary = candidates.map((c, i) =>
      `${i}: id=${c.id} name="${c.first_name} ${c.last_name}" title="${c.title ?? ""}" score=${c.lead_score ?? 0} status=${c.status ?? ""} tags=[${(c.tags as string[] ?? []).join(",")}]`
    ).join("\n");

    const systemPrompt = `You are a B2B sales strategist. Given a list of CRM contacts and calling criteria, pick the best contacts for an outbound call list. Return ONLY valid JSON.`;

    const userPrompt = `Calling criteria:
- Industry focus: ${industry || "any"}
- Seniority: ${seniority || "any"}
- Deal stage: ${stage || "any"}
- Intent signals: ${intent || "any"}
- Region: ${region || "any"}
- Best call window: ${callWindow || "any"}
- Goal / notes: ${goalNotes || "none"}
- Max contacts: ${maxCount}

Candidate contacts (index: fields):
${candidateSummary}

Pick the best ${Math.min(maxCount, candidates.length)} contacts for this call list. Prioritize: higher lead_score, status=active/qualified, tags matching criteria.

Return JSON: { "selected_indices": [0, 3, 7, ...], "rationale": "Why these contacts?" }`;

    let selectedIndices: number[] = [];
    let rationale = "";

    // Try AI selection — fall back to score-sorted top-N if AI fails
    try {
      const parsed = await aiJson<{ selected_indices: number[]; rationale: string }>({
        provider: "openai",
        system: systemPrompt,
        user: userPrompt,
        fallback: { selected_indices: [], rationale: "" },
      });
      selectedIndices = parsed.selected_indices ?? [];
      rationale = parsed.rationale ?? "";
    } catch { /* fallback below */ }

    if (!selectedIndices.length) {
      // Fallback: sort by lead_score and take top maxCount
      const sorted = [...candidates].sort((a, b) => (b.lead_score ?? 0) - (a.lead_score ?? 0));
      selectedIndices = sorted.slice(0, maxCount).map((c) => candidates.indexOf(c));
      rationale = "Selected by lead score ranking (AI selection unavailable).";
    }

    // Clamp indices to valid range
    selectedIndices = selectedIndices.filter(i => i >= 0 && i < candidates.length).slice(0, maxCount);
    const chosen = selectedIndices.map(i => candidates[i]).filter(Boolean);

    if (!chosen.length) {
      return res.status(422).json({ error: "AI could not select any contacts. Try relaxing the criteria." });
    }

    // Create the list in DB
    const listId = randomUUID();
    const [list] = await db.insert(static_lists).values({
      id: listId,
      name,
      description: rationale,
      object_type: "contact",
      org_id: "default",
      color: "#B8A0C8",
    } as any).returning();

    // Add members
    const memberRows = chosen.map(c => ({ list_id: listId, entity_id: c.id }));
    await db.insert(static_list_members).values(memberRows).onConflictDoNothing();

    res.status(201).json({
      list,
      members: chosen,
      rationale,
      count: chosen.length,
    });
  } catch (err: any) {
    console.error("[lists/ai-generate]", err);
    res.status(500).json({ error: err?.message ?? "Failed to generate list" });
  }
});

export default router;
