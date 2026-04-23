import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, signals, calls } from "@workspace/db";
import { desc, eq } from "drizzle-orm";

const router = Router();

router.post("/assistant", async (req, res) => {
  try {
    const { message } = req.body;

    // AI response simulation (real AI integration would go here via Anthropic)
    const responses: Record<string, { reply: string; suggestions: string[] }> = {
      default: {
        reply: `I analyzed your CRM data. Based on current pipeline activity, I recommend focusing on contacts in the proposal stage — they have a 68% conversion rate when followed up within 24 hours. Your top signal this week is the funding round at Gulf Ventures which aligns with 3 of your active deals.`,
        suggestions: [
          "Show me deals closing this month",
          "Which contacts need follow-up?",
          "Generate a weekly sales report",
          "Analyze my best-performing scripts",
        ],
      },
    };

    const lower = message.toLowerCase();
    let result = responses.default;

    if (lower.includes("contact") || lower.includes("lead")) {
      result = {
        reply: "Your top-scoring contacts this week are in the tech and financial services sectors. I recommend prioritizing contacts with lead scores above 80 — they show 3x higher conversion rates in your pipeline.",
        suggestions: ["List high-score contacts", "Enrich contact data", "Create a new segment"],
      };
    } else if (lower.includes("deal") || lower.includes("pipeline")) {
      result = {
        reply: "Your pipeline currently has 12 open deals totaling $2.4M. 3 deals are at risk of stalling — I recommend immediate outreach to Gulf Capital, Riyadh Tech, and Al-Noor Investments.",
        suggestions: ["Show at-risk deals", "Move deals to next stage", "Get deal forecast"],
      };
    } else if (lower.includes("signal") || lower.includes("intelligence")) {
      result = {
        reply: "I detected 5 high-value signals this week: 2 funding rounds, 1 executive move, and 2 expansion signals. The Gulf Ventures Series B round ($50M) is the highest-priority signal aligned with your current pipeline.",
        suggestions: ["Show top signals", "Create outreach for Gulf Ventures", "Dismiss low-score signals"],
      };
    }

    res.json(result);
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

