import { Router } from "express";
import { db } from "@workspace/db";
import { notifications } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { unread_only } = req.query as Record<string, string>;
    let query = db.select().from(notifications).orderBy(desc(notifications.created_at)).limit(100);
    const results = await query;
    const filtered = unread_only === "true" ? results.filter(n => !n.read) : results;
    res.json(filtered);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list notifications" });
  }
});

router.post("/:id/read", async (req, res) => {
  try {
    const [updated] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

router.post("/read-all", async (req, res) => {
  try {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.read, false))
      .returning();
    res.json({ updated: result.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to mark all read" });
  }
});

export default router;
