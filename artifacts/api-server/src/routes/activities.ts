import { Router } from "express";
import { db } from "@workspace/db";
import { activities, contacts } from "@workspace/db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { contact_id, type, limit = "50", offset = "0" } = req.query as Record<string, string>;
    const lim = Math.min(parseInt(limit), 200);
    const off = parseInt(offset);

    const wheres: any[] = [];
    if (contact_id) wheres.push(eq(activities.contact_id, contact_id));
    if (type) {
      const types = type.split(",").map(t => t.trim()).filter(Boolean);
      if (types.length === 1) wheres.push(eq(activities.type, types[0] as any));
      else if (types.length > 1) wheres.push(inArray(activities.type, types as any[]));
    }

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
        metadata: activities.metadata,
        created_at: activities.created_at,
      })
      .from(activities)
      .leftJoin(contacts, eq(activities.contact_id, contacts.id))
      .where(wheres.length > 0 ? and(...wheres) : undefined)
      .orderBy(desc(activities.created_at))
      .limit(lim)
      .offset(off);

    res.json({ activities: results, total: results.length });
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
