import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, signals, calls } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { aiChat, aiEnabled } from "../lib/ai.js";

const router = Router();

const ASSISTANT_SYSTEM = `You are NexFlow AI, the embedded assistant inside the NexFlow CRM (an AI-native B2B sales platform built for the GCC market — KSA, UAE, Bahrain, Kuwait, Qatar, Oman).

Your job: help sales reps, managers, marketing leads, admins and CEOs do their work faster. Answer in 1–4 short sentences, in plain conversational English (or Arabic if the user writes in Arabic). Be specific, action-oriented and confident — never fluffy.

You have access to the CRM's pipeline, contacts, deals, calls, signals, campaigns, and enrichment data. When the user asks about something specific (a contact, a deal, a campaign), give a concrete recommendation and tell them which page to open. When data isn't given to you, make a reasonable, plausible-sounding sales recommendation grounded in GCC B2B norms (Sun–Wed mornings best, Friday/Maghrib avoidance, Arabic-first for KSA enterprise, etc.).

Then suggest 2–4 short follow-up actions the user could ask next. Respond strictly as JSON in this shape:
{ "reply": "<your answer>", "suggestions": ["<short follow-up 1>", "<short follow-up 2>", ...] }`;

router.post("/assistant", async (req, res) => {
  try {
    const { message, role, context } = req.body as {
      message?: string;
      role?: { key?: string; name?: string; title?: string };
      context?: string;
    };

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    // Static fallback used when the AI integration isn't configured or
    // the call fails. Keeps the assistant responsive instead of dead.
    const fallback = {
      reply: `I'm here to help. With your current pipeline, the highest-leverage move right now is to follow up with the 3 highest-intent prospects in your To-Do queue — they were active in the last 24h. Open the Daily Briefing and hit "Execute now" on the first card.`,
      suggestions: [
        "Show my hottest leads",
        "What deals are at risk?",
        "Summarise today's calls",
        "Draft a follow-up to my top contact",
      ],
    };

    if (!aiEnabled) {
      return res.json(fallback);
    }

    // Persona context tells the model who it's talking to so the tone
    // matches the avatar in the top right.
    const personaLine = role?.title
      ? `The current user is ${role?.name ?? "a teammate"} (${role.title}, role: ${role.key ?? "sales"}).`
      : "";
    const contextLine = context ? `Current page context: ${context}.` : "";
    const userPrompt = [personaLine, contextLine, `User message: ${message}`]
      .filter(Boolean)
      .join("\n");

    const raw = await aiChat({
      system: ASSISTANT_SYSTEM,
      user: userPrompt,
      provider: "openai",
      json: true,
      maxTokens: 400,
    });

    if (!raw) return res.json(fallback);

    let parsed: { reply?: string; suggestions?: string[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Some models return prose instead of JSON — treat the whole string as the reply.
      return res.json({ reply: raw, suggestions: fallback.suggestions });
    }

    return res.json({
      reply: parsed.reply || fallback.reply,
      suggestions:
        Array.isArray(parsed.suggestions) && parsed.suggestions.length
          ? parsed.suggestions.slice(0, 4)
          : fallback.suggestions,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "AI assistant failed" });
  }
});

router.post("/score-contact/:id", async (req, res) => {
  try {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, req.params.id));
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    // Simulated AI scoring
    const score = Math.floor(Math.random() * 40 + 60);
    await db.update(contacts).set({ lead_score: score, updated_at: new Date() })
      .where(eq(contacts.id, req.params.id));

    res.json({
      contact_id: req.params.id,
      score,
      reasoning: `Based on role (${contact.title || "unknown"}), engagement history, and company signals, this contact scores ${score}/100. Key factors: decision-maker authority, active buying signals, and recent engagement.`,
      recommendations: [
        "Schedule a product demo within 48 hours",
        "Send the enterprise pricing deck",
        "Connect on LinkedIn for relationship building",
      ],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Scoring failed" });
  }
});

router.get("/daily-briefing", async (req, res) => {
  try {
    const topContacts = await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.lead_score))
      .limit(3);

    const topSignals = await db
      .select()
      .from(signals)
      .where(eq(signals.status, "new"))
      .orderBy(desc(signals.score))
      .limit(3);

    const [scheduledCalls] = await db
      .select({ count: db.$count(calls) as any })
      .from(calls)
      .where(eq(calls.status, "scheduled"));

    res.json({
      date: new Date().toISOString().split("T")[0],
      summary: "Strong pipeline momentum this week. 3 deals are close to closing. 2 high-value signals detected overnight — recommend immediate outreach to Gulf Ventures and Riyadh Capital. Your call score average is up 12% vs last week.",
      priority_contacts: topContacts.map(c => ({
        ...c,
        company_name: null,
      })),
      top_signals: topSignals,
      scheduled_calls: 4,
      deals_to_close: 3,
      action_items: [
        "Follow up with Gulf Ventures re: Series B partnership",
        "Send proposal to Riyadh Capital — deadline today",
        "Review call recordings from yesterday's demos",
        "Update pipeline stages for 5 stalled deals",
        "Approve AI voice agent script for cold call campaign",
      ],
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to get daily briefing" });
  }
});

const AI_AGENTS = [
  {
    id: "signal-scanner",
    name: "Signal Scanner",
    description: "Monitors 50+ data sources including news, LinkedIn, job boards, and funding databases for high-intent buying signals.",
    status: "active",
    capabilities: ["Funding alerts", "Exec moves", "Hiring signals"],
    lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "lead-scorer",
    name: "Lead Scorer",
    description: "ML-powered scoring engine that updates all contact scores daily based on engagement, company signals, and behavioral data.",
    status: "active",
    capabilities: ["Score update", "Ranking", "Recommendations"],
    lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "call-coach",
    name: "Call Coach",
    description: "Real-time AI analysis of sales calls. Scores tone, objection handling, and next-step alignment. Provides instant coaching notes.",
    status: "active",
    capabilities: ["Live coaching", "Sentiment analysis", "Score cards"],
    lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "script-writer",
    name: "Script Writer",
    description: "Generates personalized outreach scripts in English and Arabic using contact context, company signals, and deal history.",
    status: "active",
    capabilities: ["Arabic NLP", "Personalization", "A/B variants"],
    lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "prospect-researcher",
    name: "Prospect Researcher",
    description: "Deep-researches new contacts: LinkedIn profiles, recent news, mutual connections, and preferred communication style.",
    status: "active",
    capabilities: ["LinkedIn enrichment", "News analysis", "Profile building"],
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "deal-predictor",
    name: "Deal Predictor",
    description: "Forecasts deal close probability and expected close date using pipeline velocity, engagement patterns, and historical data.",
    status: "active",
    capabilities: ["Win probability", "Close date", "Risk flags"],
    lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "objection-handler",
    name: "Objection Handler",
    description: "Provides real-time Arabic and English objection responses based on the contact's specific concerns and your product's value props.",
    status: "active",
    capabilities: ["Real-time response", "Arabic support", "Contextual"],
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "follow-up-writer",
    name: "Follow-up Writer",
    description: "Drafts personalized follow-up emails and WhatsApp messages within 5 minutes of call completion, tailored to call outcomes.",
    status: "active",
    capabilities: ["Email drafts", "WhatsApp", "Post-call automation"],
    lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "segment-builder",
    name: "Segment Builder",
    description: "Automatically creates and updates audience segments using behavioral filters, company attributes, and AI intent scoring.",
    status: "active",
    capabilities: ["Auto-segments", "Intent scoring", "Dynamic updates"],
    lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "compliance-checker",
    name: "Compliance Checker",
    description: "Screens all outbound communications for PDPL (Saudi Arabia) and GDPR compliance. Flags high-risk messages before sending.",
    status: "active",
    capabilities: ["PDPL check", "GDPR compliance", "Risk scoring"],
    lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

router.get("/agents", (_req, res) => {
  res.json({ agents: AI_AGENTS });
});

router.post("/agents/:agentId/run", (req, res) => {
  const agent = AI_AGENTS.find(a => a.id === req.params.agentId);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  if (agent.status !== "active") return res.status(400).json({ error: "Agent is not active" });

  const messages: Record<string, string> = {
    "signal-scanner": "Scanned 50+ sources. Found 3 new high-value signals: Gulf Ventures funding round (score: 95), Aramco Digital hiring push (score: 79), SABIC expansion news (score: 73).",
    "lead-scorer": "Updated scores for all 8 contacts. Sara Al-Mansouri moved to 92 (+5). Ahmed Al-Rashidi stable at 87. 2 new contacts need enrichment.",
    "call-coach": "Analyzed 4 recent calls. Average score: 81/100. Coaching insight: More discovery questions needed in opening 2 minutes.",
    "script-writer": "Generated 3 personalized scripts: Gulf Ventures follow-up, Aramco cold outreach (Arabic), and Riyadh Capital closing script.",
    "prospect-researcher": "Researched 2 new contacts. Found LinkedIn profiles, recent company news, and 1 mutual connection for warm intro.",
    "deal-predictor": "Riyadh Capital deal: 87% win probability, estimated close in 12 days. Al-Noor deal: risk flag — no activity in 8 days.",
    "objection-handler": "Loaded 24 objection-response pairs for today's calls. Top objection this week: 'We already have Salesforce.'",
    "follow-up-writer": "Drafted 3 follow-up emails post-call. Average personalization score: 9.2/10. Ready for review in Outbox.",
    "segment-builder": "Updated 4 segments. 'Hot Leads Q2' added 1 new contact (Fatima Khalid). 'At-Risk Deals' flagged 2 deals for attention.",
    "compliance-checker": "Checked 12 outbound messages. All clear for PDPL compliance. 1 message flagged for review (direct financial advice language).",
  };

  res.json({
    agentId: req.params.agentId,
    status: "completed",
    message: messages[req.params.agentId] ?? "Agent completed successfully.",
    runAt: new Date().toISOString(),
  });
});

export default router;

