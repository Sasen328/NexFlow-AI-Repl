import { Router } from "express";
import { db } from "@workspace/db";
import { campaigns, campaign_recipients, contacts, activities } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { sendEmail } from "../lib/email.js";
import { aiChat } from "../lib/ai.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(campaigns).orderBy(desc(campaigns.created_at));
    res.json({ campaigns: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [c] = await db.insert(campaigns).values({ ...req.body, org_id: "default" }).returning();
    res.status(201).json(c);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [c] = await db.select().from(campaigns).where(eq(campaigns.id, req.params.id));
    if (!c) return res.status(404).json({ error: "Not found" });
    res.json(c);
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.patch("/:id", async (req, res) => {
  try {
    const [c] = await db.update(campaigns).set(req.body).where(eq(campaigns.id, req.params.id)).returning();
    res.json(c);
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(campaigns).where(eq(campaigns.id, req.params.id));
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: "Failed" }); }
});

router.post("/:id/generate-content", async (req, res) => {
  try {
    const [c] = await db.select().from(campaigns).where(eq(campaigns.id, req.params.id));
    if (!c) return res.status(404).json({ error: "Not found" });
    const { audience = "dormant leads", goal = "re-engage", tone = "friendly" } = req.body ?? {};

    const text = await aiChat({
      system: "You are a senior B2B copywriter. Write concise, high-conversion emails for a CRM.",
      user: `Write an HTML email for campaign "${c.name}". Audience: ${audience}. Goal: ${goal}. Tone: ${tone}. Channel: ${c.channel}. Return ONLY the HTML body (no <html> wrapper). Keep under 200 words. Include 1 clear CTA button.`,
      maxTokens: 600,
    });

    const subjectMatch = await aiChat({
      user: `Write one concise email subject line for: "${c.name}" — ${goal}. No quotes. Under 60 chars.`,
      maxTokens: 60,
    });

    const [updated] = await db.update(campaigns).set({
      subject: subjectMatch.trim().replace(/^["']|["']$/g, ""),
      content: text || c.content,
      ai_generated: true,
    }).where(eq(campaigns.id, c.id)).returning();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.post("/:id/send", async (req, res) => {
  try {
    const [c] = await db.select().from(campaigns).where(eq(campaigns.id, req.params.id));
    if (!c) return res.status(404).json({ error: "Not found" });
    if (!c.subject || !c.content) return res.status(400).json({ error: "Subject and content required" });

    // Build audience: simple — all contacts (real impl would apply audience_filter)
    const audience = await db.select().from(contacts).limit(50);

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    for (const ct of audience) {
      if (!ct.email) continue;
      const result = await sendEmail({ to: ct.email, subject: c.subject!, html: c.content! });
      if (result.ok) {
        sent++;
        await db.insert(campaign_recipients).values({ campaign_id: c.id, contact_id: ct.id, status: "sent", sent_at: new Date() });
        await db.insert(activities).values({
          type: "email",
          title: `Campaign: ${c.name}`,
          body: c.subject,
          contact_id: ct.id,
          status: "completed",
          completed_at: new Date(),
          metadata: { campaign_id: c.id },
        });
      } else {
        failed++;
        if (errors.length < 3) errors.push(result.error ?? "");
      }
    }

    await db.update(campaigns).set({
      status: "running",
      sent_count: (c.sent_count ?? 0) + sent,
      audience_count: audience.length,
      started_at: new Date(),
    }).where(eq(campaigns.id, c.id));

    res.json({ sent, failed, errors });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.get("/:id/recipients", async (req, res) => {
  try {
    const rows = await db.execute(sql`
      select cr.id, cr.status, cr.sent_at, cr.opened_at, cr.clicked_at, cr.replied_at,
             (c.first_name || ' ' || c.last_name) as contact_name, c.email as contact_email, c.title as contact_title,
             co.name as company_name
      from campaign_recipients cr
      join contacts c on c.id = cr.contact_id
      left join companies co on co.id = c.company_id
      where cr.campaign_id = ${req.params.id}
      order by cr.sent_at desc nulls last
      limit 200
    `);
    res.json({ recipients: (rows as any).rows ?? rows });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.post("/:id/duplicate", async (req, res) => {
  try {
    const [orig] = await db.select().from(campaigns).where(eq(campaigns.id, req.params.id));
    if (!orig) return res.status(404).json({ error: "Not found" });
    const { id, created_at, started_at, completed_at, sent_count, opened_count, clicked_count, replied_count, ...rest } = orig as any;
    const [dup] = await db.insert(campaigns).values({
      ...rest,
      name: `${orig.name} (copy)`,
      status: "draft",
      sent_count: 0, opened_count: 0, clicked_count: 0, replied_count: 0,
    }).returning();
    res.status(201).json(dup);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
