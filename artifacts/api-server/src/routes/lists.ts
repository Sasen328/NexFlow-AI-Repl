import { Router } from "express";
import { db } from "@workspace/db";
import { static_lists, static_list_members, contacts, companies, users } from "@workspace/db";
import { and, eq, desc, sql, inArray } from "drizzle-orm";

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

export default router;
