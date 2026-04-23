import { Router } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const results = await db.select().from(users).where(eq(users.active, true)).orderBy(desc(users.created_at));
    res.json({ users: results, total: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list users" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [u] = await db.insert(users).values({ ...req.body, org_id: "default" }).returning();
    res.status(201).json(u);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [u] = await db.select().from(users).where(eq(users.id, req.params.id));
    if (!u) return res.status(404).json({ error: "Not found" });
    res.json(u);
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const [u] = await db.update(users).set(req.body).where(eq(users.id, req.params.id)).returning();
    if (!u) return res.status(404).json({ error: "Not found" });
    res.json(u);
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

export default router;
