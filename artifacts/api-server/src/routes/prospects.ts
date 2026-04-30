import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contacts, companies, signals, activities } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { aiChat, aiJson, openrouter } from "../lib/ai.js";
import { randomUUID } from "crypto";

const router: IRouter = Router();

type ProspectCard = {
  first_name: string;
  last_name: string;
  title: string;
  seniority: "junior" | "mid" | "senior" | "c-level";
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  company: {
    name: string;
    industry: string;
    country: string;
    city?: string | null;
    size: string;
    website?: string | null;
    description?: string | null;
  };
  persona: string;
  pain_points: string[];
  buying_signals: string[];
  next_actions: { action: string; reason: string }[];
  lead_score: number;
  confidence: number;
  research_sources: string[];
  summary: string;
};

const RESEARCH_SYSTEM = `You are a senior B2B sales researcher with deep knowledge of GCC markets (KSA, UAE, Qatar, Kuwait, Bahrain, Oman). You search the live web and return well-cited research about real companies and the people who work there. Bias toward decision-makers in mid-to-large enterprises with active buying signals (funding rounds, hiring, recent product launches, regulatory changes). NEVER fabricate emails or phone numbers — say "(unknown)" if you don't know. Cite source URLs inline.`;

const STRUCTURE_SYSTEM = `You convert messy real-web research into strict JSON prospect cards for a CRM. Output ONLY valid JSON. Never invent emails or phone numbers — leave them null if the research did not include a verified value. Pick at most the requested count of prospects, prioritizing those with the strongest buying signals.`;

const ENHANCE_SYSTEM = `You are a senior account executive scoring B2B prospects for a GCC sales team. Given one prospect card, refine the persona, sharpen the pain points, write a 2-3 sentence buying-context summary, and propose the 3 next-best actions for an SDR. Be concrete and channel-aware (call vs whatsapp vs email vs linkedin). Output strict JSON.`;

// ── POST /api/prospects/research ───────────────────────────────────────────
// body: { query, count?, region?, save?: boolean }
router.post("/research", async (req, res) => {
  try {
    const {
      query = "",
      count = 5,
      region = "GCC",
      save = false,
    } = req.body ?? {};

    if (!query.trim()) {
      return res.status(400).json({ error: "query required (e.g. 'CFOs at Series A+ fintechs in UAE')" });
    }
    if (!process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY) {
      return res.status(503).json({
        error: "OpenRouter not configured. Set AI_INTEGRATIONS_OPENROUTER_API_KEY to enable real prospect research.",
      });
    }

    const cap = Math.min(Math.max(parseInt(String(count)) || 5, 1), 15);

    // ── Step 1: Perplexity online search (live web) ────────────────────────
    req.log.info({ query, count: cap, region }, "[prospects] step 1 — perplexity research");
    const research = await aiChat({
      system: RESEARCH_SYSTEM,
      provider: "perplexity",
      user: `Find ${cap} real prospects matching: "${query}".
Region focus: ${region}.

For each prospect, gather:
- Full name, current title, company name
- Public LinkedIn URL if discoverable
- Company industry, headcount band, HQ city/country, public website
- Recent buying signals (funding rounds, hiring sprees, product launches, expansion announcements, regulatory changes)
- Likely pain points based on company stage and industry
- Source URLs for the research

Return a numbered prose research brief with citations. Do NOT invent emails or phone numbers. Be honest when data is unavailable.`,
      maxTokens: 3500,
    });

    if (!research || research.trim().length < 50) {
      return res.status(502).json({ error: "Research step returned no useful data — try a more specific query." });
    }
    req.log.info({ chars: research.length }, "[prospects] perplexity returned brief");

    // ── Step 2: Gemini extracts structured prospect cards ──────────────────
    // (Gemini's strict json_object mode through OpenRouter can be flaky — fall back to OpenAI if empty.)
    req.log.info("[prospects] step 2 — gemini structure");
    const structurePrompt = `Convert this research brief into a JSON array of up to ${cap} prospect cards.

Schema (strict):
{
  "prospects": [{
    "first_name": string,
    "last_name": string,
    "title": string,
    "seniority": "junior" | "mid" | "senior" | "c-level",
    "email": string | null,
    "phone": string | null,
    "linkedin_url": string | null,
    "company": {
      "name": string,
      "industry": string,
      "country": string,
      "city": string | null,
      "size": "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+",
      "website": string | null,
      "description": string | null
    },
    "persona": "Decision Maker" | "Champion" | "Influencer" | "User" | "Gatekeeper",
    "pain_points": string[],
    "buying_signals": string[],
    "next_actions": [{ "action": "call"|"email"|"whatsapp"|"linkedin", "reason": string }],
    "lead_score": number (0-100),
    "confidence": number (0-100),
    "research_sources": string[] (URLs),
    "summary": string (2-3 sentences)
  }]
}

Research brief:
${research}`;

    let structured = await aiJson<{ prospects: ProspectCard[] }>({
      system: STRUCTURE_SYSTEM,
      provider: "gemini",
      user: structurePrompt,
      fallback: { prospects: [] },
    });

    if (!structured.prospects || structured.prospects.length === 0) {
      req.log.warn("[prospects] gemini returned 0 — falling back to openai");
      structured = await aiJson<{ prospects: ProspectCard[] }>({
        system: STRUCTURE_SYSTEM,
        provider: "openai",
        user: structurePrompt,
        fallback: { prospects: [] },
      });
    }

    let prospects = (structured.prospects ?? []).slice(0, cap);

    // If structuring still returned nothing AND the research brief had real content,
    // surface that to the client instead of pretending the run succeeded.
    if (prospects.length === 0) {
      const briefSummary = research.slice(0, 280).replace(/\s+/g, " ").trim();
      return res.status(200).json({
        query,
        region,
        requested: cap,
        returned: 0,
        prospects: [],
        saved: [],
        pipeline: ["perplexity:research", "gemini:structure", "openai:structure-fallback", "no-prospects"],
        notice:
          "The live web research returned data but no individual prospects could be extracted. " +
          "Try a more specific query (e.g. include role + industry + city/country + a buying-signal keyword).",
        researchPreview: briefSummary,
      });
    }

    // ── Step 3: Claude refines each prospect (persona, next actions) ───────
    req.log.info({ count: prospects.length }, "[prospects] step 3 — claude refine");
    const refined = await Promise.all(
      prospects.map(async (p) => {
        try {
          const enhanced = await aiJson<Partial<ProspectCard>>({
            system: ENHANCE_SYSTEM,
            provider: "anthropic",
            user: `Refine this prospect card. Keep all factual fields the same — only improve persona, pain_points, buying_signals, next_actions, summary, and lead_score.

Current:
${JSON.stringify(p, null, 2)}

Return JSON: { "persona": "...", "pain_points": [...], "buying_signals": [...], "next_actions": [{"action":"...","reason":"..."}], "summary": "...", "lead_score": 0-100 }`,
            fallback: {},
          });
          return { ...p, ...enhanced };
        } catch {
          return p;
        }
      }),
    );
    prospects = refined;

    // ── Step 4: Save to DB if requested ────────────────────────────────────
    let saved: { contact_id: string; company_id: string | null; name: string }[] = [];
    if (save) {
      req.log.info("[prospects] step 4 — persist to DB");
      for (const p of prospects) {
        try {
          // Resolve / create company
          let companyId: string | null = null;
          const companyName = p.company?.name?.trim();
          if (companyName) {
            const existing = await db.select().from(companies).where(sql`lower(name) = lower(${companyName})`).limit(1);
            if (existing[0]) {
              companyId = existing[0].id;
            } else {
              const [c] = await db.insert(companies).values({
                name: companyName,
                industry: p.company.industry ?? null,
                country: p.company.country ?? null,
                city: p.company.city ?? null,
                size: p.company.size ?? null,
                website: p.company.website ?? null,
                description: p.company.description ?? null,
              } as any).returning();
              companyId = c.id;
            }
          }

          // Skip duplicate by email if available
          if (p.email) {
            const dup = await db.select().from(contacts).where(eq(contacts.email, p.email)).limit(1);
            if (dup[0]) {
              saved.push({ contact_id: dup[0].id, company_id: companyId, name: `${p.first_name} ${p.last_name}` });
              continue;
            }
          }

          const contactId = randomUUID();
          await db.insert(contacts).values({
            id: contactId,
            first_name: p.first_name || "Unknown",
            last_name: p.last_name || "",
            email: p.email || null,
            phone: p.phone || null,
            title: p.title || null,
            linkedin_url: p.linkedin_url || null,
            company_id: companyId,
            tags: ["ai-prospected", p.persona ?? "Influencer"].filter(Boolean) as any,
            lead_score: p.lead_score ?? 60,
            status: "new",
            notes: p.summary ?? null,
            source: "ai_prospect_research",
          } as any);

          // Create signals from buying_signals
          if (Array.isArray(p.buying_signals)) {
            for (const sig of p.buying_signals.slice(0, 3)) {
              await db.insert(signals).values({
                org_id: "default",
                contact_id: contactId,
                company_id: companyId,
                type: "intent" as any,
                title: typeof sig === "string" ? sig.slice(0, 120) : "Buying signal",
                body: typeof sig === "string" ? sig : JSON.stringify(sig),
                score: 80,
                status: "new" as any,
                source_url: p.research_sources?.[0] ?? null,
              } as any);
            }
          }

          await db.insert(activities).values({
            type: "note" as any,
            title: "Prospect generated by AI research",
            body: `Found via Perplexity → Gemini → Claude pipeline. Query: "${query}". Sources: ${(p.research_sources ?? []).slice(0, 3).join(", ")}`,
            contact_id: contactId,
            status: "completed" as any,
            completed_at: new Date(),
            metadata: { sources: p.research_sources, query, region } as any,
          });

          saved.push({ contact_id: contactId, company_id: companyId, name: `${p.first_name} ${p.last_name}` });
        } catch (err: any) {
          req.log.error({ err: err?.message, prospect: p.first_name }, "[prospects] failed to save one");
        }
      }
    }

    res.json({
      query,
      region,
      requested: cap,
      returned: prospects.length,
      prospects,
      saved,
      pipeline: ["perplexity:research", "gemini:structure", "claude:refine", save ? "db:persist" : "preview-only"],
    });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// ── GET /api/prospects/recent ──────────────────────────────────────────────
router.get("/recent", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: contacts.id,
        name: sql<string>`${contacts.first_name} || ' ' || ${contacts.last_name}`,
        title: contacts.title,
        company_id: contacts.company_id,
        lead_score: contacts.lead_score,
        notes: contacts.notes,
        created_at: contacts.created_at,
      })
      .from(contacts)
      .where(eq(contacts.source, "ai_prospect_research"))
      .orderBy(sql`${contacts.created_at} desc`)
      .limit(20);
    res.json({ prospects: rows });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
