import { Router } from "express";
import { db } from "@workspace/db";
import { activities, contacts } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { contact_id, type, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    const results = await db
      .select({
        id: activities.id,
        org_id: activities.org_id,
        contact_id: activities.contact_id,
        contact_name: sql<string>`coalesce(concat(contacts.first_name, ' ', contacts.last_name), '')`,
        deal_id: activities.deal_id,
        type: activities.type,
        title: activities.title,
        body: activities.body,
        status: activities.status,
        scheduled_at: activities.scheduled_at,
        completed_at: activities.completed_at,
        created_at: activities.created_at,
      })
      .from(activities)
      .leftJoin(contacts, eq(activities.contact_id, contacts.id))
      .orderBy(desc(activities.created_at))
      .limit(lim)
      .offset(off);

    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list activities" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [activity] = await db.insert(activities).values({
      ...req.body,
      org_id: "default",
    }).returning();
    res.status(201).json(activity);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create activity" });
  }
});

export default router;
