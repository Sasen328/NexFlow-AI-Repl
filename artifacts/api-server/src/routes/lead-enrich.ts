import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contacts, companies, signals, activities } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { aiChat, aiJson } from "../lib/ai.js";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// POST /api/lead-enrich/quick — minimal data → fully enriched contact draft
// body: { name?, email?, phone?, company?, linkedin_url?, notes?, country?, seniority?, industry?, save?: boolean }
router.post("/quick", async (req, res) => {
  try {
    const {
      name = "", email = "", phone = "", company = "",
      linkedin_url = "", notes = "", save = false,
      country = "", seniority = "", industry = "",
    } = req.body ?? {};
    const seed = `${name} ${email} ${phone} ${company} ${linkedin_url} ${notes}`.trim();
    if (!seed) return res.status(400).json({ error: "Provide at least one of: name, email, phone, company, linkedin_url" });

    const hints = [
      country && `Country hint: ${country}`,
      seniority && `Seniority hint: ${seniority}`,
      industry && `Industry hint: ${industry}`,
    ].filter(Boolean).join("\n");

    const enriched = await aiJson<any>({
      provider: "gemini",
      system: `You are a B2B contact enrichment AI. From minimal seed data you produce a complete plausible contact profile for the GCC region. Output strict JSON only. NEVER fabricate emails or phone numbers — only return real values that were provided as input.`,
      user: `Seed data:
- Name: ${name || "(unknown)"}
- Email: ${email || "(unknown)"}
- Phone: ${phone || "(unknown)"}
- Company: ${company || "(unknown)"}
- LinkedIn: ${linkedin_url || "(unknown)"}
- Notes: ${notes || "(unknown)"}
${hints ? `\nContext hints (use these to improve accuracy):\n${hints}` : ""}

Produce JSON: {"first_name":"...","last_name":"...","email":"<only if provided>","phone":"<only if provided>","title":"plausible title","linkedin_url":"<only if provided or guess based on name>","company":{"name":"...","industry":"${industry || "e.g. Banking, Real Estate, FMCG"}","country":"${country || "UAE|KSA|Qatar|etc"}","size":"1-10|11-50|51-200|201-1000|1000+","website":"<plausible domain>"},"seniority":"${seniority ? seniority.toLowerCase() : "junior|mid|senior|c-level"}","tags":["3-5 tags"],"persona":"e.g. Decision Maker / Champion / Influencer","summary":"2-sentence profile summary","next_actions":[{"action":"call|email|whatsapp|linkedin","reason":"why"}],"lead_score":0-100,"confidence":0-100,"enriched_fields":["which fields you added"]}`,
      fallback: {
        first_name: name?.split(" ")[0] ?? "Unknown",
        last_name: name?.split(" ").slice(1).join(" ") ?? "",
        email,
        phone,
        title: "Manager",
        linkedin_url,
        company: { name: company || "Unknown", industry: "General", country: "UAE", size: "51-200", website: "" },
        seniority: "mid",
        tags: ["new-lead"],
        persona: "Influencer",
        summary: "Newly added contact awaiting more discovery.",
        next_actions: [{ action: "email", reason: "Open the conversation with intro." }],
        lead_score: 50,
        confidence: 30,
        enriched_fields: [],
      },
    });

    if (!save) {
      return res.json({ enriched, saved: false });
    }

    // Resolve / create company
    let companyId: string | null = null;
    const companyName = enriched.company?.name?.trim();
    if (companyName) {
      const [existing] = await db.select().from(companies).where(eq(companies.name, companyName)).limit(1);
      if (existing) {
        companyId = existing.id;
      } else {
        companyId = randomUUID();
        await db.insert(companies).values({
          id: companyId,
          name: companyName,
          industry: enriched.company?.industry ?? null,
          country: enriched.company?.country ?? null,
          size: enriched.company?.size ?? null,
          website: enriched.company?.website ?? null,
        } as any);
      }
    }

    const contactId = randomUUID();
    await db.insert(contacts).values({
      id: contactId,
      first_name: enriched.first_name,
      last_name: enriched.last_name,
      email: enriched.email || null,
      phone: enriched.phone || null,
      title: enriched.title || null,
      linkedin_url: enriched.linkedin_url || null,
      company_id: companyId,
      tags: enriched.tags ?? [],
      lead_score: enriched.lead_score ?? 50,
      status: "new",
      notes: enriched.summary,
      source: "ai_enrichment",
    } as any);

    res.json({ enriched, saved: true, contact_id: contactId, company_id: companyId });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

// POST /api/lead-enrich/deep/:id — multi-model enrichment chain on existing contact
// Pipeline: Perplexity (live web research) → Claude (nuanced analysis) → OpenAI (structured fields)
router.post("/deep/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY) {
      return res.status(503).json({ error: "OpenRouter not configured — deep enrichment requires it." });
    }

    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    let company: any = null;
    if (contact.company_id) {
      const [c] = await db.select().from(companies).where(eq(companies.id, contact.company_id)).limit(1);
      company = c ?? null;
    }

    const fullName = `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim();

    // ── Step 1: Perplexity live web research ──
    req.log.info({ contact_id: id, name: fullName }, "[deep-enrich] step 1 perplexity");
    const research = await aiChat({
      provider: "perplexity",
      system: `You are a senior B2B sales researcher. Search the live web for verified, recent information about this person and their company. Cite source URLs inline. Never invent contact details.`,
      user: `Research: ${fullName}${contact.title ? `, ${contact.title}` : ""}${company?.name ? ` at ${company.name}` : ""}${company?.country ? ` (${company.country})` : ""}.

Return prose covering:
1. Verified current role and tenure
2. Public LinkedIn profile URL if discoverable
3. Recent professional activity (job changes, posts, talks, articles)
4. Company recent news (funding, hiring, products, expansion, regulatory)
5. Likely active buying signals
6. Key people they likely report to or work with
7. Cite source URLs throughout`,
      maxTokens: 2500,
    });

    if (!research || research.trim().length < 30) {
      return res.status(502).json({ error: "Research step returned no useful data" });
    }

    // ── Step 2: Claude nuanced analysis (in parallel with structuring) ──
    req.log.info("[deep-enrich] step 2 claude analysis");
    const analysisP = aiJson<{
      summary: string;
      strengths: string[];
      risks: string[];
      buying_context: string;
      recommendations: { action: string; channel: string; reason: string }[];
    }>({
      provider: "anthropic",
      system: `You are a senior account executive. Read the research brief and produce strategic analysis. Output strict JSON.`,
      user: `Analyze this prospect for an SDR working a GCC enterprise sales motion. Output JSON: { "summary": "3-sentence executive read", "strengths": ["..."], "risks": ["..."], "buying_context": "1-paragraph current buying situation", "recommendations": [{"action":"...","channel":"call|email|whatsapp|linkedin","reason":"..."}] }

Research:
${research}`,
      fallback: { summary: "", strengths: [], risks: [], buying_context: "", recommendations: [] },
    });

    // ── Step 3: OpenAI structured field extraction ──
    req.log.info("[deep-enrich] step 3 openai structure");
    const structuredP = aiJson<{
      title: string | null;
      seniority: string;
      linkedin_url: string | null;
      tags: string[];
      lead_score: number;
      persona: string;
      detected_signals: { type: string; title: string; body: string; score: number; source_url: string | null }[];
      company_updates: {
        industry: string | null;
        size: string | null;
        website: string | null;
        description: string | null;
        recent_news: string | null;
      };
      sources: string[];
    }>({
      provider: "openai",
      system: `You extract verified structured fields from a research brief. Only return fields supported by the research. Do not invent emails or phone numbers. Output strict JSON.`,
      user: `Extract from research about ${fullName}:

Schema: {
  "title": string|null,
  "seniority": "junior"|"mid"|"senior"|"c-level",
  "linkedin_url": string|null (must look like a real URL),
  "tags": string[] (3-6 short tags),
  "lead_score": number (0-100),
  "persona": "Decision Maker"|"Champion"|"Influencer"|"User"|"Gatekeeper",
  "detected_signals": [{"type":"intent"|"news"|"hiring"|"funding"|"product","title":"...","body":"1-2 sentences","score":0-100,"source_url": string|null}],
  "company_updates": { "industry": string|null, "size": string|null, "website": string|null, "description": string|null, "recent_news": string|null },
  "sources": string[] (URLs)
}

Research:
${research}`,
      fallback: {
        title: contact.title,
        seniority: "mid",
        linkedin_url: contact.linkedin_url,
        tags: [],
        lead_score: contact.lead_score ?? 50,
        persona: "Influencer",
        detected_signals: [],
        company_updates: { industry: null, size: null, website: null, description: null, recent_news: null },
        sources: [],
      },
    });

    const [analysis, structured] = await Promise.all([analysisP, structuredP]);

    // ── Step 4: Persist updates ──
    const updatedFields: any = { last_engaged_at: new Date() };
    if (structured.title) updatedFields.title = structured.title;
    if (structured.linkedin_url) updatedFields.linkedin_url = structured.linkedin_url;
    if (typeof structured.lead_score === "number") updatedFields.lead_score = Math.round(structured.lead_score);
    if (analysis.summary) updatedFields.notes = analysis.summary;
    if (Array.isArray(structured.tags) && structured.tags.length > 0) {
      const merged = Array.from(new Set([...(contact.tags ?? []), ...structured.tags])).slice(0, 10);
      updatedFields.tags = merged;
    }

    await db.update(contacts).set(updatedFields).where(eq(contacts.id, id));

    // Update company if we learned more
    if (company && structured.company_updates) {
      const cu = structured.company_updates;
      const compUpdate: any = {};
      if (cu.industry && !company.industry) compUpdate.industry = cu.industry;
      if (cu.size && !company.size) compUpdate.size = cu.size;
      if (cu.website && !company.website) compUpdate.website = cu.website;
      if (cu.description) compUpdate.description = cu.description;
      if (Object.keys(compUpdate).length > 0) {
        await db.update(companies).set(compUpdate).where(eq(companies.id, company.id));
      }
    }

    // Insert detected signals
    const insertedSignals: string[] = [];
    for (const sig of (structured.detected_signals ?? []).slice(0, 5)) {
      try {
        const [row] = await db.insert(signals).values({
          org_id: "default",
          contact_id: id,
          company_id: contact.company_id,
          type: (sig.type as any) ?? "intent",
          title: sig.title?.slice(0, 200) ?? "Signal",
          body: sig.body ?? null,
          score: sig.score ?? 70,
          status: "new" as any,
          source_url: sig.source_url ?? null,
        } as any).returning({ id: signals.id });
        if (row?.id) insertedSignals.push(row.id);
      } catch (err: any) {
        req.log.warn({ err: err?.message }, "[deep-enrich] signal insert failed");
      }
    }

    await db.insert(activities).values({
      type: "note" as any,
      title: "Deep AI enrichment complete",
      body: `Pipeline: Perplexity → Claude → OpenAI. ${analysis.summary ?? ""}`.slice(0, 1000),
      contact_id: id,
      status: "completed" as any,
      completed_at: new Date(),
      metadata: {
        sources: structured.sources,
        signal_count: insertedSignals.length,
        pipeline: ["perplexity", "claude", "openai"],
      } as any,
    });

    res.json({
      contact_id: id,
      research_excerpt: research.slice(0, 800),
      analysis,
      structured,
      updated: Object.keys(updatedFields),
      signals_created: insertedSignals.length,
      pipeline: ["perplexity:research", "claude:analyze", "openai:structure", "db:persist"],
    });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
