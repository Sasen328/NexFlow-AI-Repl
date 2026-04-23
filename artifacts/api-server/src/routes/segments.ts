import { Router } from "express";
import { db } from "@workspace/db";
import { segments } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const results = await db.select().from(segments).orderBy(desc(segments.created_at));
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list segments" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [segment] = await db.insert(segments).values({
      ...req.body,
      org_id: "default",
    }).returning();
    res.status(201).json(segment);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create segment" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [segment] = await db.select().from(segments).where(eq(segments.id, req.params.id));
    if (!segment) return res.status(404).json({ error: "Segment not found" });
    res.json(segment);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get segment" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(segments).where(eq(segments.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete segment" });
  }
});

export default router;
