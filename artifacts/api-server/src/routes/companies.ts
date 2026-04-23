import { Router } from "express";
import { db } from "@workspace/db";
import { companies, contacts, deals } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    const results = await db
      .select({
        id: companies.id,
        org_id: companies.org_id,
        name: companies.name,
        domain: companies.domain,
        industry: companies.industry,
        size: companies.size,
        country: companies.country,
        revenue: companies.revenue,
        logo_url: companies.logo_url,
        linkedin_url: companies.linkedin_url,
        website: companies.website,
        description: companies.description,
        tags: companies.tags,
        created_at: companies.created_at,
        updated_at: companies.updated_at,
        contact_count: sql<number>`(select count(*) from contacts where contacts.company_id = ${companies.id})::int`,
        deal_count: sql<number>`(select count(*) from deals where deals.company_id = ${companies.id})::int`,
      })
      .from(companies)
      .orderBy(desc(companies.created_at))
      .limit(lim)
      .offset(off);

    const total = await db.$count(companies);
    res.json({ companies: results, total });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list companies" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [company] = await db.insert(companies).values({
      ...req.body,
      org_id: "default",
    }).returning();
    res.status(201).json(company);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create company" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [company] = await db
      .select({
        id: companies.id,
        org_id: companies.org_id,
        name: companies.name,
        domain: companies.domain,
        industry: companies.industry,
        size: companies.size,
        country: companies.country,
        revenue: companies.revenue,
        logo_url: companies.logo_url,
        linkedin_url: companies.linkedin_url,
        website: companies.website,
        description: companies.description,
        tags: companies.tags,
        created_at: companies.created_at,
        updated_at: companies.updated_at,
        contact_count: sql<number>`(select count(*) from contacts where contacts.company_id = ${companies.id})::int`,
        deal_count: sql<number>`(select count(*) from deals where deals.company_id = ${companies.id})::int`,
      })
      .from(companies)
      .where(eq(companies.id, req.params.id));
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get company" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const [updated] = await db
      .update(companies)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(companies.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Company not found" });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update company" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(companies).where(eq(companies.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

export default router;
