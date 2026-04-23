import { Router } from "express";
import { db } from "@workspace/db";
import { ai_agents, ai_agent_runs } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { aiChat } from "../lib/ai.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(ai_agents).orderBy(desc(ai_agents.created_at));
    res.json({ agents: rows });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.post("/", async (req, res) => {
  try {
    const [a] = await db.insert(ai_agents).values({ ...req.body, org_id: "default" }).returning();
    res.status(201).json(a);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [a] = await db.select().from(ai_agents).where(eq(ai_agents.id, req.params.id));
    if (!a) return res.status(404).json({ error: "Not found" });
    const runs = await db.select().from(ai_agent_runs).where(eq(ai_agent_runs.agent_id, a.id)).orderBy(desc(ai_agent_runs.ran_at)).limit(20);
    res.json({ ...a, runs });
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const [a] = await db.update(ai_agents).set(req.body).where(eq(ai_agents.id, req.params.id)).returning();
    res.json(a);
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(ai_agents).where(eq(ai_agents.id, req.params.id));
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.post("/:id/run", async (req, res) => {
  try {
    const [a] = await db.select().from(ai_agents).where(eq(ai_agents.id, req.params.id));
    if (!a) return res.status(404).json({ error: "Not found" });
    if (!a.enabled) return res.status(400).json({ error: "Agent disabled" });

    const input = req.body?.input ?? "";
    const t0 = Date.now();
    const output = await aiChat({
      system: a.system_prompt,
      user: input || "Run your default task.",
      maxTokens: 1200,
    });
    const duration = Date.now() - t0;

    await db.insert(ai_agent_runs).values({ agent_id: a.id, input, output, status: "completed", duration_ms: duration });
    await db.update(ai_agents).set({ run_count: (a.run_count ?? 0) + 1, last_run_at: new Date() }).where(eq(ai_agents.id, a.id));

    res.json({ output, duration });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
