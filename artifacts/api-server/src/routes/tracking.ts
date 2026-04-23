import { Router } from "express";
import { db } from "@workspace/db";
import { activities, contacts, campaign_recipients, campaigns } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

// 1x1 tracking pixel: GET /tracking/pixel?c=<contact_id>&cm=<campaign_id>
router.get("/pixel", async (req, res) => {
  try {
    const { c: contactId, cm: campaignId } = req.query as Record<string, string>;
    if (contactId) {
      await db.insert(activities).values({
        type: "email_open",
        title: "Email opened",
        contact_id: contactId,
        status: "completed",
        completed_at: new Date(),
        metadata: { campaign_id: campaignId ?? null },
      });
      await db.update(contacts).set({ last_engaged_at: new Date() }).where(eq(contacts.id, contactId));
      if (campaignId) {
        await db.update(campaigns).set({
          opened_count: sql`${campaigns.opened_count} + 1`,
        }).where(eq(campaigns.id, campaignId));
        await db.update(campaign_recipients).set({ opened_at: new Date() })
          .where(sql`campaign_id = ${campaignId} AND contact_id = ${contactId}`);
      }
    }
  } catch (err) { console.error(err); }
  // Return tiny transparent gif
  const gif = Buffer.from("R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.send(gif);
});

// Web visit ingest
router.post("/visit", async (req, res) => {
  try {
    const { contact_id, page_url, referrer, duration } = req.body ?? {};
    if (!contact_id || !page_url) return res.status(400).json({ error: "contact_id and page_url required" });
    await db.insert(activities).values({
      type: "web_visit",
      title: `Visited ${new URL(page_url).pathname}`,
      body: page_url,
      contact_id,
      status: "completed",
      completed_at: new Date(),
      metadata: { referrer, duration },
    });
    await db.update(contacts).set({ last_engaged_at: new Date() }).where(eq(contacts.id, contact_id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// Form submit attribution
router.post("/form-submit", async (req, res) => {
  try {
    const { email, first_name, last_name, utm_source, utm_medium, utm_campaign, source } = req.body ?? {};
    if (!email) return res.status(400).json({ error: "email required" });
    const existing = await db.select().from(contacts).where(eq(contacts.email, email));
    if (existing[0]) {
      await db.update(contacts).set({
        last_engaged_at: new Date(),
        utm_source: utm_source ?? existing[0].utm_source,
        utm_medium: utm_medium ?? existing[0].utm_medium,
        utm_campaign: utm_campaign ?? existing[0].utm_campaign,
      }).where(eq(contacts.id, existing[0].id));
      await db.insert(activities).values({
        type: "form_submit",
        title: "Form submitted",
        body: source ?? "Website form",
        contact_id: existing[0].id,
        status: "completed",
        completed_at: new Date(),
        metadata: req.body,
      });
      return res.json({ contact_id: existing[0].id, created: false });
    }
    const [c] = await db.insert(contacts).values({
      first_name: first_name ?? "Unknown",
      last_name: last_name ?? "",
      email,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      status: "new",
    }).returning();
    await db.insert(activities).values({
      type: "form_submit",
      title: "Form submitted",
      body: source ?? "Website form",
      contact_id: c.id,
      status: "completed",
      completed_at: new Date(),
      metadata: req.body,
    });
    res.json({ contact_id: c.id, created: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
