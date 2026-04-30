import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, companies, activities, static_list_members, static_lists, users } from "@workspace/db";
import { and, eq, ilike, or, desc, inArray, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, status, list_id, owner_id, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    const wheres: any[] = [];
    if (search) wheres.push(or(ilike(contacts.first_name, `%${search}%`), ilike(contacts.last_name, `%${search}%`), ilike(contacts.email, `%${search}%`)));
    if (status) wheres.push(eq(contacts.status, status as any));
    if (owner_id) wheres.push(eq(contacts.owner_id, owner_id));
    if (list_id) {
      const memberRows = await db.select({ id: static_list_members.entity_id }).from(static_list_members).where(eq(static_list_members.list_id, list_id));
      const ids = memberRows.map(r => r.id);
      if (!ids.length) return res.json({ contacts: [], total: 0 });
      wheres.push(inArray(contacts.id, ids));
    }

    const whereClause = wheres.length ? and(...wheres) : undefined;

    const results = await db
      .select({
        id: contacts.id,
        org_id: contacts.org_id,
        first_name: contacts.first_name,
        last_name: contacts.last_name,
        email: contacts.email,
        phone: contacts.phone,
        title: contacts.title,
        company_id: contacts.company_id,
        company_name: companies.name,
        lead_score: contacts.lead_score,
        status: contacts.status,
        avatar_url: contacts.avatar_url,
        linkedin_url: contacts.linkedin_url,
        notes: contacts.notes,
        tags: contacts.tags,
        owner_id: contacts.owner_id,
        owner_name: users.name,
        best_call_time: contacts.best_call_time,
        last_engaged_at: contacts.last_engaged_at,
        created_at: contacts.created_at,
        updated_at: contacts.updated_at,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.company_id, companies.id))
      .leftJoin(users, eq(contacts.owner_id, users.id))
      .where(whereClause as any)
      .orderBy(desc(contacts.created_at))
      .limit(lim)
      .offset(off);

    const total = whereClause ? results.length : await db.$count(contacts);

    res.json({ contacts: results, total });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list contacts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body ?? {};
    const first_name = (body.first_name ?? "").toString().trim();
    const last_name = (body.last_name ?? "").toString().trim();
    if (!first_name || !last_name) {
      return res.status(400).json({
        error: "first_name and last_name are required",
        field: !first_name ? "first_name" : "last_name",
      });
    }
    const [contact] = await db.insert(contacts).values({
      first_name,
      last_name,
      email: body.email || null,
      phone: body.phone || null,
      title: body.title || null,
      company_id: body.company_id || null,
      owner_id: body.owner_id || null,
      status: body.status || "new",
      notes: body.notes || null,
      tags: body.tags || [],
      org_id: "default",
    }).returning();
    res.status(201).json(contact);
  } catch (err) {
    req.log.error({ err }, "Failed to create contact");
    res.status(500).json({ error: "Failed to create contact" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [contact] = await db
      .select({
        id: contacts.id,
        org_id: contacts.org_id,
        first_name: contacts.first_name,
        last_name: contacts.last_name,
        email: contacts.email,
        phone: contacts.phone,
        title: contacts.title,
        company_id: contacts.company_id,
        company_name: companies.name,
        company_industry: companies.industry,
        lead_score: contacts.lead_score,
        status: contacts.status,
        avatar_url: contacts.avatar_url,
        linkedin_url: contacts.linkedin_url,
        notes: contacts.notes,
        tags: contacts.tags,
        owner_id: contacts.owner_id,
        owner_name: users.name,
        owner_email: users.email,
        last_engaged_at: contacts.last_engaged_at,
        created_at: contacts.created_at,
        updated_at: contacts.updated_at,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.company_id, companies.id))
      .leftJoin(users, eq(contacts.owner_id, users.id))
      .where(eq(contacts.id, req.params.id));

    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.json(contact);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get contact" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const body = req.body;
    const [updated] = await db
      .update(contacts)
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where(eq(contacts.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Contact not found" });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(contacts).where(eq(contacts.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

router.get("/:id/lists", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: static_lists.id,
        name: static_lists.name,
        color: static_lists.color,
        added_at: static_list_members.added_at,
      })
      .from(static_list_members)
      .innerJoin(static_lists, eq(static_lists.id, static_list_members.list_id))
      .where(eq(static_list_members.entity_id, req.params.id))
      .orderBy(desc(static_list_members.added_at));
    res.json({ lists: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/:id/activities", async (req, res) => {
  try {
    const results = await db
      .select()
      .from(activities)
      .where(eq(activities.contact_id, req.params.id))
      .orderBy(desc(activities.created_at))
      .limit(50);
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get activities" });
  }
});

export default router;
