import { Router } from "express";
import { db } from "@workspace/db";
import { scripts } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const results = await db.select().from(scripts).orderBy(desc(scripts.created_at));
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list scripts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [script] = await db.insert(scripts).values({
      ...req.body,
      org_id: "default",
    }).returning();
    res.status(201).json(script);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create script" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [script] = await db.select().from(scripts).where(eq(scripts.id, req.params.id));
    if (!script) return res.status(404).json({ error: "Script not found" });
    res.json(script);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get script" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const [updated] = await db
      .update(scripts)
      .set({ ...req.body, updated_at: new Date() })
      .where(eq(scripts.id, req.params.id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Script not found" });
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update script" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(scripts).where(eq(scripts.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete script" });
  }
});

export default router;
