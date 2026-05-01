import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contacts, companies, signals, activities } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { aiChat, aiJson } from "../lib/ai.js";
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

const ENHANCE_SYSTEM = `You are a senior account executive scoring B2B prospects for a GCC sales team. Given prospect cards, refine the persona, sharpen the pain points, write concise buying-context summaries, and propose the 3 next-best actions for each SDR. Be concrete and channel-aware (call vs whatsapp vs email vs linkedin). Output strict JSON matching the same structure.`;

/** Try multiple providers for aiChat until one works */
async function robustChat(opts: { system: string; user: string; maxTokens?: number }): Promise<string> {
  const errs: string[] = [];

  // 1. Perplexity (live web — best for research)
  try {
    const t = await aiChat({ provider: "perplexity", system: opts.system, user: opts.user, maxTokens: opts.maxTokens ?? 3500 });
    if (t?.trim()) return t.trim();
  } catch (e: any) { errs.push(`perplexity:${e?.message}`); }

  // 2. Direct Gemini (reliable in this env)
  try {
    const t = await aiGeminiChat({ system: opts.system, messages: [{ role: "user", text: opts.user }], maxTokens: opts.maxTokens ?? 3500 });
    if (t?.trim()) return t.trim();
  } catch (e: any) { errs.push(`gemini:${e?.message}`); }

  // 3. OpenAI via integration
  try {
    const t = await aiChat({ provider: "openai", system: opts.system, user: opts.user, maxTokens: opts.maxTokens ?? 3500 });
    if (t?.trim()) return t.trim();
  } catch (e: any) { errs.push(`openai:${e?.message}`); }

  throw new Error(`All research providers failed: ${errs.join(" | ")}`);
}

/** Try multiple providers for aiJson until one returns non-empty data */
async function robustJson<T>(opts: { system: string; user: string; fallback: T }): Promise<T> {
  // 1. OpenAI via integration (most reliable json_object support)
  try {
    const d = await aiJson<T>({ provider: "openai", system: opts.system, user: opts.user, fallback: opts.fallback });
    if (d && JSON.stringify(d) !== JSON.stringify(opts.fallback)) return d;
  } catch { /* try next */ }

  // 2. Direct Gemini with responseMimeType: "application/json" — forces valid JSON always
  try {
    const raw = await aiChat({ provider: "gemini", system: opts.system, user: opts.user, json: true, maxTokens: 4096 });
    if (raw?.trim()) {
      const parsed = JSON.parse(raw) as T;
      if (parsed && JSON.stringify(parsed) !== JSON.stringify(opts.fallback)) return parsed;
    }
  } catch { /* try next */ }

  // 3. Anthropic via OpenRouter
  try {
    const d = await aiJson<T>({ provider: "anthropic", system: opts.system, user: opts.user, fallback: opts.fallback });
    if (d && JSON.stringify(d) !== JSON.stringify(opts.fallback)) return d;
  } catch { /* try next */ }

  // 4. auto (OpenRouter picks best available)
  try {
    const d = await aiJson<T>({ provider: "auto", system: opts.system, user: opts.user, fallback: opts.fallback });
    if (d) return d;
  } catch { /* all failed */ }

  return opts.fallback;
}

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

    const cap = Math.min(Math.max(parseInt(String(count)) || 5, 1), 15);

    // ── Step 1: Live web research (Perplexity → Gemini → OpenAI fallback) ──
    req.log.info({ query, count: cap, region }, "[prospects] step 1 — web research");
    const research = await robustChat({
      system: RESEARCH_SYSTEM,
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
    req.log.info({ chars: research.length }, "[prospects] research brief ready");

    // ── Step 2: Extract structured prospect cards ─────────────────────────
    req.log.info("[prospects] step 2 — structuring cards");
    const structureUser = `Convert this research brief into a JSON array of up to ${cap} prospect cards.

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
    "research_sources": string[],
    "summary": string (2-3 sentences)
  }]
}

Research brief:
${research}`;

    let structured = await robustJson<{ prospects: ProspectCard[] }>({
      system: STRUCTURE_SYSTEM,
      user: structureUser,
      fallback: { prospects: [] },
    });

    let prospects = (structured.prospects ?? []).slice(0, cap);

    if (prospects.length === 0) {
      const briefSummary = research.slice(0, 280).replace(/\s+/g, " ").trim();
      return res.status(200).json({
        query, region, requested: cap, returned: 0,
        prospects: [], saved: [],
        pipeline: ["research", "structure", "no-prospects"],
        notice: "The live web research returned data but no individual prospects could be extracted. Try a more specific query (e.g. include role + industry + city/country + a buying-signal keyword).",
        researchPreview: briefSummary,
      });
    }

    // ── Step 3: BATCH Claude/OpenAI refine — single call for ALL prospects ─
    // (was N serial calls — now 1 batch call, saves ~20-25 seconds)
    req.log.info({ count: prospects.length }, "[prospects] step 3 — batch refine");
    const batchUser = `Refine these ${prospects.length} prospect cards. Keep all factual fields the same — only improve persona, pain_points, buying_signals, next_actions, summary, and lead_score for each.

Cards:
${JSON.stringify(prospects, null, 2)}

Return JSON: { "prospects": [ { "index": 0, "persona": "...", "pain_points": [...], "buying_signals": [...], "next_actions": [{"action":"...","reason":"..."}], "summary": "...", "lead_score": 0-100 }, ... ] }`;

    const batchRefined = await robustJson<{ prospects: Array<Partial<ProspectCard> & { index?: number }> }>({
      system: ENHANCE_SYSTEM,
      user: batchUser,
      fallback: { prospects: [] },
    });

    if (batchRefined.prospects?.length) {
      prospects = prospects.map((p, i) => {
        const patch = batchRefined.prospects.find(r => r.index === i) ?? batchRefined.prospects[i];
        if (!patch) return p;
        const { index: _idx, ...rest } = patch;
        return { ...p, ...rest };
      });
    }

    req.log.info({ count: prospects.length }, "[prospects] step 3 done");

    // ── Step 4: Save to DB if requested ────────────────────────────────────
    let saved: { contact_id: string; company_id: string | null; name: string }[] = [];
    if (save) {
      req.log.info("[prospects] step 4 — persist to DB");
      for (const p of prospects) {
        try {
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
            body: `Found via AI research pipeline. Query: "${query}". Sources: ${(p.research_sources ?? []).slice(0, 3).join(", ")}`,
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
      query, region, requested: cap, returned: prospects.length,
      prospects, saved,
      pipeline: ["research", "structure", "batch-refine", save ? "db:persist" : "preview-only"],
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
