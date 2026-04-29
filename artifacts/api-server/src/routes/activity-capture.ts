import { Router } from "express";
import { db } from "@workspace/db";
import { activities, contacts } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { aiJson } from "../lib/ai";

const router = Router();

router.post("/parse", async (req, res) => {
  try {
    const { raw_text, channel } = req.body ?? {};
    if (!raw_text || typeof raw_text !== "string") {
      return res.status(400).json({ error: "raw_text required" });
    }

    const parsed = await aiJson<any>({
      system: `You are an AI assistant that extracts structured CRM activity data from raw text (emails, meeting notes, call transcripts). Return JSON only.`,
      user: `Extract activity data from this ${channel ?? "email"}:

${raw_text.slice(0, 4000)}

Return JSON: {
  "type": "email" | "meeting" | "call" | "note",
  "title": string (short summary),
  "summary": string (2-3 sentences),
  "from_email": string|null,
  "from_name": string|null,
  "to_emails": string[],
  "key_points": string[],
  "next_step": string|null,
  "sentiment": "positive" | "neutral" | "negative",
  "intent_signals": string[] (any buying signals — "wants pricing", "comparing vendors", "ready to procurement", etc),
  "suggested_followup_days": number
}`,
      fallback: { type: "note", title: raw_text.slice(0, 60), summary: "", from_email: null, from_name: null, to_emails: [], key_points: [], next_step: null, sentiment: "neutral", intent_signals: [], suggested_followup_days: 3 },
    });

    let contactId: string | null = null;
    if (parsed.from_email) {
      const found = await db.select().from(contacts).where(eq(contacts.email, parsed.from_email)).limit(1);
      if (found[0]) contactId = found[0].id;
    }

    const [activity] = await db.insert(activities).values({
      type: (["email", "meeting", "call", "note"].includes(parsed.type) ? parsed.type : "note") as any,
      title: parsed.title?.slice(0, 200) ?? "Captured activity",
      body: parsed.summary ?? raw_text.slice(0, 500),
      contact_id: contactId,
      status: "completed",
      completed_at: new Date(),
      metadata: { ...parsed, captured_at: new Date().toISOString() },
    }).returning();

    if (contactId) {
      await db.update(contacts).set({ last_engaged_at: new Date() }).where(eq(contacts.id, contactId));
    }

    res.json({ activity, parsed, contact_id: contactId });
  } catch (err: any) {
    console.error("[activity-capture] failed:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.get("/recent", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(activities)
      .where(sql`metadata ? 'captured_at'`)
      .orderBy(sql`completed_at desc`)
      .limit(20);
    res.json({ items: rows });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
