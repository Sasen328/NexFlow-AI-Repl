import { Router } from "express";
import { db } from "@workspace/db";
import { saved_views } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { object_type } = req.query as Record<string, string>;
    const where = object_type ? eq(saved_views.object_type, object_type as any) : undefined;
    const rows = await db.select().from(saved_views).where(where as any).orderBy(desc(saved_views.created_at));
    res.json({ views: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [v] = await db.insert(saved_views).values({ ...req.body, org_id: "default" }).returning();
    res.status(201).json(v);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(saved_views).where(eq(saved_views.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
