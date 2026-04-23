import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, companies, activities } from "@workspace/db";
import { eq, ilike, or, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    let query = db
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
        created_at: contacts.created_at,
        updated_at: contacts.updated_at,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.company_id, companies.id))
      .orderBy(desc(contacts.created_at))
      .limit(lim)
      .offset(off);

    const results = await query;
    const total = await db.$count(contacts);

    res.json({ contacts: results, total });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list contacts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const [contact] = await db.insert(contacts).values({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      title: body.title,
      company_id: body.company_id || null,
      status: body.status || "new",
      notes: body.notes,
      tags: body.tags || [],
      org_id: "default",
    }).returning();
    res.status(201).json(contact);
  } catch (err) {
    req.log.error(err);
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
        lead_score: contacts.lead_score,
        status: contacts.status,
        avatar_url: contacts.avatar_url,
        linkedin_url: contacts.linkedin_url,
        notes: contacts.notes,
        tags: contacts.tags,
        created_at: contacts.created_at,
        updated_at: contacts.updated_at,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.company_id, companies.id))
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
