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

// AI Marketing Strategy Builder
router.post("/ai-strategy", async (req, res) => {
  try {
    const { goal, audience, budget, platforms = [] } = req.body;
    const platformStr = Array.isArray(platforms) ? platforms.join(", ") : "email";
    const allContacts = await db.select({ id: contacts.id, lead_score: contacts.lead_score, status: contacts.status }).from(contacts).limit(200);
    const hot = allContacts.filter((c: any) => (c.lead_score ?? 0) >= 80).length;
    const warm = allContacts.filter((c: any) => (c.lead_score ?? 0) >= 60 && (c.lead_score ?? 0) < 80).length;
    const cold = allContacts.length - hot - warm;

    const strategy = await aiChat({
      system: "You are a senior B2B marketing strategist. Return ONLY valid JSON. No markdown, no text outside JSON.",
      user: `Build a full multi-channel marketing strategy. 
Goal: ${goal}. Audience: ${audience}. Budget: ${budget}. Platforms: ${platformStr}.
Contact breakdown: ${hot} hot (score 80+), ${warm} warm (score 60-79), ${cold} cold.

Return JSON:
{
  "summary": "2-sentence overview",
  "segments": [{"name":"segment name","size":number,"channel":"channel","message":"strategy"}],
  "calendar": [{"day":"Day N","action":"action","channel":"channel id","leads":number}],
  "budget_breakdown": [{"platform":"name","budget":"$X","reach":number,"est_meetings":number}],
  "total_est_meetings": number,
  "total_pipeline": "$X",
  "roi": "Nx",
  "next_actions": ["action1","action2","action3","action4"]
}`,
      maxTokens: 1200,
    });
    const parsed = JSON.parse(strategy.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// AI Dormant Lead Personalized Message
router.post("/dormant-message", async (req, res) => {
  try {
    const { contact, dormant_days = 45 } = req.body;
    const name = `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim();
    const msg = await aiChat({
      system: "You are an elite sales copywriter specializing in B2B re-engagement. Return ONLY valid JSON. No markdown.",
      user: `Create personalized re-engagement messages for: ${name}, ${contact.title ?? ""} at ${contact.company_name ?? ""}. Silent for ${dormant_days}+ days. Lead score: ${contact.lead_score ?? "unknown"}.

Return JSON:
{
  "whatsapp_message": "short personal WhatsApp message (max 3 sentences)",
  "email_subject": "compelling subject line",
  "email_body": "3-paragraph re-engagement email body",
  "platform_recommendation": "whatsapp or email or linkedin",
  "reason": "one sentence reason why",
  "urgency": "high or medium or low"
}`,
      maxTokens: 500,
    });
    const parsed = JSON.parse(msg.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
