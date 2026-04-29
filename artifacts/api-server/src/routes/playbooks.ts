import { Router } from "express";
import { db } from "@workspace/db";
import { ai_insights } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { aiJson } from "../lib/ai";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(ai_insights)
      .where(eq(ai_insights.category, "playbook"))
      .orderBy(desc(ai_insights.generated_at));
    res.json({ playbooks: rows });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const { persona, deal_size, industry, country, situation } = req.body ?? {};
    if (!persona) return res.status(400).json({ error: "persona required" });

    const result = await aiJson<any>({
      system: `You are an expert B2B sales coach with deep GCC market expertise (Saudi Arabia, UAE, Qatar). Generate a sales playbook in JSON.`,
      user: `Create a tactical sales playbook for:
Persona: ${persona}
Deal size: ${deal_size ?? "$100K-$500K ARR"}
Industry: ${industry ?? "Enterprise SaaS"}
Country: ${country ?? "Saudi Arabia"}
Situation: ${situation ?? "Initial discovery to closed-won"}

Return JSON: {
  "title": string,
  "summary": string (2 sentences),
  "discovery_questions": string[] (5-7),
  "value_propositions": string[] (3-5),
  "objection_handlers": [{"objection": string, "response": string}] (3-5),
  "talk_tracks": [{"phase": string, "script": string}] (4),
  "next_steps": string[] (3),
  "cultural_tips": string[] (2-3, GCC-specific etiquette/communication)
}`,
      fallback: { title: persona, summary: "AI unavailable", discovery_questions: [], value_propositions: [], objection_handlers: [], talk_tracks: [], next_steps: [], cultural_tips: [] },
    });

    const [row] = await db.insert(ai_insights).values({
      category: "playbook",
      title: result.title ?? `${persona} playbook`,
      body: result.summary ?? "Playbook",
      severity: "info",
      metadata: { ...result, persona, deal_size, industry, country },
    }).returning();

    res.status(201).json(row);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(ai_insights).where(eq(ai_insights.id, req.params.id));
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

export default router;
