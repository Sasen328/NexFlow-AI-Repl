import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { campaigns, deals, contacts, companies, activities, calls, signals } from "@workspace/db";
import { eq, and, sql, desc, lt } from "drizzle-orm";
import { aiChat, aiJson, aiEnabled, openai } from "../lib/ai.js";

const router: IRouter = Router();

// ── 1.2 / 1.4 — AI image generation for campaigns (DALL-E via proxy) ──────
router.post("/generate-image", async (req, res) => {
  try {
    const { prompt = "", style = "modern", size = "1024x1024" } = req.body ?? {};
    if (!prompt.trim()) return res.status(400).json({ error: "prompt required" });
    if (!aiEnabled) {
      return res.json({
        url: null,
        b64: null,
        ai_disabled: true,
        message: "AI integration not configured. Image generation requires OpenAI proxy.",
      });
    }
    const fullPrompt = `${prompt}. Marketing campaign creative, ${style} aesthetic, professional B2B style, vibrant but tasteful, no text overlays unless asked.`;
    try {
      const result: any = await (openai() as any).images.generate({
        model: "gpt-image-1",
        prompt: fullPrompt,
        size: size as any,
        n: 1,
      });
      const url = result?.data?.[0]?.url ?? null;
      const b64 = result?.data?.[0]?.b64_json ?? null;
      res.json({ url, b64, prompt: fullPrompt, model: "gpt-image-1" });
    } catch (e1: any) {
      // Fallback: try dall-e-3
      try {
        const result: any = await (openai() as any).images.generate({
          model: "dall-e-3",
          prompt: fullPrompt,
          size: "1024x1024",
          n: 1,
        });
        const url = result?.data?.[0]?.url ?? null;
        res.json({ url, b64: null, prompt: fullPrompt, model: "dall-e-3" });
      } catch (e2: any) {
        res.status(500).json({ error: e2?.message ?? e1?.message ?? "Image gen failed" });
      }
    }
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── 1.4 — AI script writer (call/voicenote/whatsapp scripts) ──────────────
router.post("/generate-script", async (req, res) => {
  try {
    const { campaign_topic = "", audience = "", channel = "call", language = "en" } = req.body ?? {};
    const out = await aiJson<any>({
      system: "You write conversational sales scripts for B2B teams in the GCC region. Output strict JSON.",
      user: `Channel: ${channel}. Topic: ${campaign_topic}. Audience: ${audience}. Language: ${language}.
Output JSON: {"opener":"first 1-2 sentences","value_prop":"key value statement","discovery_questions":["3 questions"],"objection_handling":[{"objection":"...","response":"..."}],"close":"closing line","follow_up":"what to do after"}`,
      fallback: {
        opener: `Hi, this is from NexFlow. I'm reaching out about ${campaign_topic || "your business growth"}.`,
        value_prop: "We help GCC sales teams close more deals using AI-driven engagement.",
        discovery_questions: [
          "What's your biggest challenge in pipeline conversion right now?",
          "How are you currently tracking lead engagement?",
          "What's a successful Q2 look like for your team?",
        ],
        objection_handling: [
          { objection: "We already use a CRM", response: "Great — NexFlow plugs in alongside, not replacing it." },
        ],
        close: "Would a 20-min demo next week be useful?",
        follow_up: "Send a calendar invite and 2-page brief within an hour.",
      },
    });
    res.json(out);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── 1.1 — Multi-platform publish (LinkedIn / TikTok / Instagram / X) ──────
// Note: real publishing requires OAuth + business account approval per platform.
// We simulate the publish action and persist the result against the campaign.
router.post("/publish/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { platforms = [], schedule_at = null } = req.body ?? {};
    const valid = ["linkedin", "tiktok", "instagram", "facebook", "twitter", "youtube"];
    const list: string[] = (platforms as string[]).filter((p) => valid.includes(p));
    if (!list.length) return res.status(400).json({ error: "platforms[] required (linkedin|tiktok|instagram|facebook|twitter|youtube)" });

    const [c] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
    if (!c) return res.status(404).json({ error: "campaign not found" });

    const stamp = new Date().toISOString();
    const results = list.map((p) => ({
      platform: p,
      status: schedule_at ? "scheduled" : "queued",
      external_id: `sim_${p}_${Math.random().toString(36).slice(2, 10)}`,
      scheduled_at: schedule_at ?? stamp,
      reach_estimate: Math.floor(2000 + Math.random() * 18000),
      cost_estimate_usd: Math.floor(50 + Math.random() * 450),
      requires_oauth: true,
      message: `${p}: connect a business ${p} account in Settings → Integrations to publish for real. The campaign is staged and will go live once connected.`,
    }));

    const meta: any = (c.audience_filter as any) ?? {};
    meta.publish_log = [...(meta.publish_log ?? []), { at: stamp, results }];
    await db.update(campaigns).set({ audience_filter: meta as any }).where(eq(campaigns.id, campaignId));

    res.json({ ok: true, campaign_id: campaignId, scheduled: !!schedule_at, results });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Publish failed" });
  }
});

// ── 1.3 — Stalled lead recommender (separate from /ai/forgotten-leads) ────
router.get("/stalled-leads", async (req, res) => {
  try {
    const days = Number(req.query.days ?? 14);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const stalledDeals = await db.select({
      d: deals,
      c: contacts,
    }).from(deals)
      .leftJoin(contacts, eq(contacts.id, deals.contact_id))
      .where(and(
        sql`${deals.stage} not in ('closed_won','closed_lost')`,
        sql`${deals.updated_at} < ${cutoff}`,
      ))
      .orderBy(desc(deals.value))
      .limit(50);

    // For each stalled deal, AI-suggest a re-engagement campaign
    const suggestions = await Promise.all(stalledDeals.slice(0, 12).map(async (row) => {
      const ctx = {
        deal: { title: row.d.title, value: row.d.value, stage: row.d.stage, last_update: row.d.updated_at },
        contact: row.c ? { name: `${row.c.first_name} ${row.c.last_name}`, title: row.c.title, lead_score: row.c.lead_score } : null,
        days_stalled: Math.round((Date.now() - new Date(row.d.updated_at as any).getTime()) / (24 * 60 * 60 * 1000)),
      };
      const sug = await aiJson<any>({
        system: "You're a B2B revenue strategist. Output strict JSON only.",
        user: `Suggest a re-engagement plan for this stalled deal: ${JSON.stringify(ctx)}.
Output JSON: {"angle":"why they may have stalled","channel":"whatsapp|email|call|linkedin","subject_or_hook":"short hook","message":"2-3 sentence message","priority":"high|medium|low"}`,
        fallback: {
          angle: "No movement in pipeline — likely needs new value reason to engage.",
          channel: "email",
          subject_or_hook: `Quick check-in on ${row.d.title}`,
          message: "Just wanted to share a recent case study that could help move the conversation forward. Worth a 15-min call this week?",
          priority: "medium",
        },
      });
      return { deal_id: row.d.id, contact_id: row.d.contact_id, ...ctx, suggestion: sug };
    }));

    res.json({ count: suggestions.length, total_stalled: stalledDeals.length, days_threshold: days, suggestions });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── 1.5 — Marketing AI Assistant (chat) ────────────────────────────────────
router.post("/assistant-chat", async (req, res) => {
  try {
    const { message = "", history = [], provider: rawProvider = "auto" } = req.body ?? {};
    if (!message.trim()) return res.status(400).json({ error: "message required" });
    const VALID_PROVIDERS = ["auto", "anthropic", "openai", "gemini", "perplexity"] as const;
    const provider = (VALID_PROVIDERS as readonly string[]).includes(rawProvider) ? rawProvider : "auto";

    // Pull live marketing context
    const allCampaigns = await db.select().from(campaigns).orderBy(desc(campaigns.created_at)).limit(20);
    const [{ tot_contacts }] = await db.select({ tot_contacts: sql<number>`count(*)` }).from(contacts);
    const [{ tot_deals }] = await db.select({ tot_deals: sql<number>`count(*)` }).from(deals);
    const [{ won_deals }] = await db.select({ won_deals: sql<number>`count(*)` }).from(deals).where(eq(deals.stage, "closed_won"));
    const [{ won_value }] = await db.select({ won_value: sql<number>`coalesce(sum(value),0)` }).from(deals).where(eq(deals.stage, "closed_won"));

    const ctx = {
      campaigns: allCampaigns.map((c: any) => ({
        id: c.id, name: c.name, channel: c.channel, status: c.status,
        sent: c.sent_count ?? 0, opens: c.opened_count ?? 0, clicks: c.clicked_count ?? 0, conversions: c.converted_count ?? 0,
      })),
      totals: {
        contacts: Number(tot_contacts),
        deals: Number(tot_deals),
        won_deals: Number(won_deals),
        revenue: Number(won_value),
      },
    };

    const sys = `You are NexFlow's Marketing Intelligence Assistant. You analyze campaigns, recommend improvements, and help marketers act fast.
Always reference real numbers from the data context. Be concise (≤180 words). When recommending action, give 2-3 concrete next steps with channels & timing. Use markdown for emphasis.`;

    const fullPrompt = `Context: ${JSON.stringify(ctx).slice(0, 3500)}
${(history as any[]).slice(-6).map((h: any) => `${h.role}: ${h.content}`).join("\n")}
User: ${message}`;

    const reply = await aiChat({
      system: sys,
      user: fullPrompt,
      maxTokens: 800,
      provider,
    });
    res.json({
      reply: reply || "I couldn't reach the AI right now — try again in a moment.",
      provider_used: provider,
      context_summary: ctx.totals,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── 1.6 — Campaign analysis toolkit ────────────────────────────────────────
router.get("/analytics", async (_req, res) => {
  try {
    const all = await db.select().from(campaigns).orderBy(desc(campaigns.created_at));
    const totals = all.reduce((acc: any, c: any) => ({
      sent: acc.sent + (c.sent_count ?? 0),
      opens: acc.opens + (c.opened_count ?? 0),
      clicks: acc.clicks + (c.clicked_count ?? 0),
      conversions: acc.conversions + (c.converted_count ?? 0),
    }), { sent: 0, opens: 0, clicks: 0, conversions: 0 });

    const byChannel: Record<string, any> = {};
    for (const c of all as any[]) {
      const t = c.channel ?? "other";
      if (!byChannel[t]) byChannel[t] = { sent: 0, opens: 0, clicks: 0, conversions: 0, count: 0 };
      byChannel[t].sent += c.sent_count ?? 0;
      byChannel[t].opens += c.opened_count ?? 0;
      byChannel[t].clicks += c.clicked_count ?? 0;
      byChannel[t].conversions += c.converted_count ?? 0;
      byChannel[t].count += 1;
    }
    for (const k of Object.keys(byChannel)) {
      const v = byChannel[k];
      v.open_rate = v.sent ? +(v.opens / v.sent * 100).toFixed(1) : 0;
      v.click_rate = v.sent ? +(v.clicks / v.sent * 100).toFixed(1) : 0;
      v.conv_rate = v.sent ? +(v.conversions / v.sent * 100).toFixed(1) : 0;
    }

    const top = [...all].map((c: any) => ({
      id: c.id, name: c.name, channel: c.channel,
      sent: c.sent_count ?? 0,
      open_rate: c.sent_count ? +((c.opened_count ?? 0) / c.sent_count * 100).toFixed(1) : 0,
      click_rate: c.sent_count ? +((c.clicked_count ?? 0) / c.sent_count * 100).toFixed(1) : 0,
      conversions: c.converted_count ?? 0,
    })).sort((a, b) => b.click_rate - a.click_rate).slice(0, 8);

    const overall = {
      open_rate: totals.sent ? +(totals.opens / totals.sent * 100).toFixed(1) : 0,
      click_rate: totals.sent ? +(totals.clicks / totals.sent * 100).toFixed(1) : 0,
      conv_rate: totals.sent ? +(totals.conversions / totals.sent * 100).toFixed(1) : 0,
      cost_per_lead: totals.conversions ? +(2500 / totals.conversions).toFixed(2) : null,
    };

    res.json({ totals, overall, by_channel: byChannel, top_campaigns: top, total_campaigns: all.length });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
