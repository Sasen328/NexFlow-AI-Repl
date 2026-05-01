import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, companies, activities } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { aiChat, aiJson, aiGeminiVisionJson } from "../lib/ai.js";

const router = Router();

// ICP seed matching the client-side icp.ts rules
const ICP_INDUSTRIES = [
  "asset management", "family office", "insurance", "private banking",
  "wealth management", "banking", "finance", "financial services", "investment",
];
const ICP_REGIONS = [
  "saudi arabia", "uae", "united arab emirates", "qatar",
  "bahrain", "kuwait", "oman", "ksa",
];

function checkIcp(extracted: Record<string, any>): { passes: boolean; failed: string[] } {
  const failed: string[] = [];
  const industry = (extracted.industry_guess ?? "").toLowerCase();
  const country = (extracted.country ?? "").toLowerCase();
  const industryOk = !extracted.industry_guess || ICP_INDUSTRIES.some((i) => industry.includes(i));
  const regionOk = !extracted.country || ICP_REGIONS.some((r) => country.includes(r));
  if (!industryOk) failed.push(`Industry "${extracted.industry_guess}" is outside Finance / Wealth / Banking target segments`);
  if (!regionOk) failed.push(`Region "${extracted.country}" is outside GCC target markets (KSA, UAE, Qatar, Bahrain, Kuwait, Oman)`);
  return { passes: industryOk && regionOk, failed };
}

// ─── AGENT 1: Gemini Vision — raw OCR + field extraction ──────────────────
async function agent1GeminiOCR(imageDataUrl: string): Promise<{ result: any; error?: string }> {
  const prompt = `You are an expert business-card OCR for GCC/Middle-East markets. Analyse this image.

STEP 1 — Validate: Is this image a real professional business card with a real person's name and contact info?
Return is_business_card=false if it is: a screenshot, random photo, ID card, invoice, meme, poster, product image, logo-only, or anything NOT a business card.

STEP 2 — Extract every visible field accurately.

Return ONLY valid JSON:
{
  "is_business_card": true|false,
  "rejection_reason": null|"one clear sentence",
  "name_en": string|null,
  "name_ar": string|null,
  "title": string|null,
  "company": string|null,
  "company_ar": string|null,
  "email": string|null,
  "mobile": string|null,
  "office": string|null,
  "fax": string|null,
  "website": string|null,
  "address": string|null,
  "city": string|null,
  "country": string|null,
  "linkedin": string|null,
  "twitter": string|null,
  "industry_guess": string|null,
  "ocr_confidence": 0-100,
  "fields": [{"key":"name_en","confidence":0-100,"bbox":{"x":0-100,"y":0-100,"w":0-100,"h":0-100}}]
}

Rules:
- Normalize phones in international format (+966, +971, +974, +965, +973, +968)
- Strip protocol from URLs ("neom.com" not "https://neom.com")
- Return null (never empty string) for absent fields
- Arabic names must use proper Arabic script
- Guess industry from company name / context`;

  try {
    const result = await aiGeminiVisionJson({ prompt, imageDataUrl });
    return { result };
  } catch (err: any) {
    return { result: { is_business_card: false, rejection_reason: err.message }, error: err.message };
  }
}

// ─── AGENT 2: Claude/GPT-4o via OpenRouter — reasoning & validation ────────
async function agent2ReasoningValidate(rawOcr: any): Promise<{ result: any; model: string }> {
  const systemPrompt = `You are a senior CRM data quality agent specialising in GCC B2B contacts.
You receive raw OCR output from a business card image and must:
1. Verify the is_business_card determination (override if clearly wrong)
2. Normalize and clean all fields (fix encoding, capitalisation, phone formats)
3. Fill logical gaps: if city=Dubai, set country=UAE; infer industry from company name
4. Assign a data_quality score 0-100 and list validation_notes
5. NEVER fabricate contact details — only clean/normalise what OCR returned

Return ONLY valid JSON with the same schema plus these additions:
  "data_quality": 0-100,
  "validation_notes": ["..."],
  "is_business_card": true|false (may override OCR if clearly wrong)`;

  const userPrompt = `OCR output:
${JSON.stringify(rawOcr, null, 2)}

Return cleaned JSON:`;

  try {
    // Try Claude first via OpenRouter, fall back to GPT-4o-mini
    const text = await aiChat({
      system: systemPrompt,
      user: userPrompt,
      provider: "anthropic",
      maxTokens: 1200,
    });
    const cleaned = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    return { result: { ...rawOcr, ...cleaned }, model: "claude-via-openrouter" };
  } catch {
    try {
      const text = await aiChat({
        system: systemPrompt,
        user: userPrompt,
        provider: "openai",
        maxTokens: 1200,
      });
      const cleaned = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
      return { result: { ...rawOcr, ...cleaned }, model: "gpt-4o-mini" };
    } catch {
      return { result: rawOcr, model: "ocr-only" };
    }
  }
}

// ─── AGENT 3: Python Enrichment Scraper — company web profile ─────────────
async function agent3WebEnrich(website: string): Promise<{ result: any } | null> {
  if (!website) return null;
  const url = website.startsWith("http") ? website : `https://${website}`;
  try {
    // Route through the shared proxy (localhost:80 → /scraper/* → enrichment-scraper sidecar)
    const scraperBase = `http://127.0.0.1:80`;
    const r = await fetch(`${scraperBase}/scraper/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, mode: "bs4", respect_robots: true, timeout_seconds: 8 }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) return null;
    const data: any = await r.json();
    if (!data.ok || !data.structured) return null;
    return { result: data.structured };
  } catch {
    return null;
  }
}

// ─── AGENT 4: OpenAI — final scoring & profile assembly ───────────────────
async function agent4FinalScore(validated: any, webProfile: any): Promise<{
  lead_score: number;
  confidence: number;
  summary_en: string;
  summary_ar: string;
  next_actions: string[];
}> {
  const systemPrompt = `You are a GCC B2B revenue intelligence analyst.
Combine business card data + company web profile to produce a final contact assessment.
Output ONLY valid JSON:
{
  "lead_score": 0-100,
  "confidence": 0-100,
  "summary_en": "2-sentence English contact profile",
  "summary_ar": "2-sentence Arabic contact profile (in Arabic script)",
  "next_actions": ["top 2-3 recommended outreach actions"]
}`;

  const userPrompt = `Contact card data:
${JSON.stringify({ ...validated, fields: undefined }, null, 2)}

Company web profile:
${webProfile ? JSON.stringify(webProfile, null, 2) : "(not available)"}`;

  try {
    const r = await aiJson<any>({
      system: systemPrompt,
      user: userPrompt,
      provider: "openai",
      fallback: {
        lead_score: 60,
        confidence: 50,
        summary_en: `${validated.name_en ?? "Contact"} from ${validated.company ?? "Unknown"}.`,
        summary_ar: `${validated.name_ar ?? validated.name_en ?? "جهة الاتصال"} من ${validated.company ?? "غير معروف"}.`,
        next_actions: ["Send intro email", "Connect on LinkedIn"],
      },
    });
    return r;
  } catch {
    return {
      lead_score: 60,
      confidence: 40,
      summary_en: `${validated.name_en ?? "Contact"} from ${validated.company ?? "Unknown"}.`,
      summary_ar: `${validated.name_ar ?? "جهة الاتصال"} من ${validated.company ?? "غير معروف"}.`,
      next_actions: ["Send intro email", "Connect on LinkedIn"],
    };
  }
}

// ─── POST /scan — 4-agent orchestration pipeline ──────────────────────────
router.post("/scan", async (req, res) => {
  try {
    const { image_data_url } = req.body ?? {};
    if (!image_data_url || typeof image_data_url !== "string") {
      return res.status(400).json({ error: "image_data_url required" });
    }
    if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
      return res.status(503).json({ error: "Vision AI not configured (missing Gemini key)" });
    }

    const pipeline_trace: Record<string, any> = {};
    const t0 = Date.now();

    // Agent 1: Gemini Vision OCR
    const ocr = await agent1GeminiOCR(image_data_url);
    pipeline_trace.agent1_gemini_vision = {
      model: "gemini-2.0-flash-exp",
      ms: Date.now() - t0,
      is_business_card: ocr.result?.is_business_card,
      error: ocr.error ?? null,
    };

    // Short-circuit if clearly not a business card (no need to burn more tokens)
    if (ocr.result?.is_business_card === false) {
      res.json({
        extracted: ocr.result,
        model: "gemini-2.0-flash-exp",
        pipeline_trace,
        agents_used: ["gemini-vision"],
      });
      return;
    }

    // Agent 2: Claude/GPT-4o reasoning — runs in parallel with Agent 3 kickoff
    const t2 = Date.now();
    const validated = await agent2ReasoningValidate(ocr.result);
    pipeline_trace.agent2_reasoning = {
      model: validated.model,
      ms: Date.now() - t2,
    };

    // Agent 3: Python Enrichment Scraper (company web) — parallel-ish after Agent 1
    const t3 = Date.now();
    const website = validated.result?.website ?? ocr.result?.website;
    const webEnrich = website ? await agent3WebEnrich(website) : null;
    pipeline_trace.agent3_web_enrichment = {
      model: "python-enrichment-scraper",
      ms: Date.now() - t3,
      scraped: Boolean(webEnrich),
      website: website ?? null,
    };

    // Agent 4: OpenAI final scoring
    const t4 = Date.now();
    const finalScore = await agent4FinalScore(validated.result, webEnrich?.result ?? null);
    pipeline_trace.agent4_openai_scoring = {
      model: "gpt-4o-mini",
      ms: Date.now() - t4,
      lead_score: finalScore.lead_score,
      confidence: finalScore.confidence,
    };

    // Merge all agent outputs
    const extracted = {
      ...validated.result,
      ...finalScore,
      company_web_profile: webEnrich?.result ?? null,
    };

    pipeline_trace.total_ms = Date.now() - t0;

    res.json({
      extracted,
      model: "multi-agent",
      pipeline_trace,
      agents_used: ["gemini-vision", validated.model, webEnrich ? "python-enrichment-scraper" : null, "gpt-4o-scoring"].filter(Boolean),
    });
  } catch (err: any) {
    req.log?.error?.({ err }, "[business-cards] scan failed");
    res.status(500).json({ error: err?.message ?? "Scan failed" });
  }
});

// ─── POST /save ────────────────────────────────────────────────────────────
router.post("/save", async (req, res) => {
  try {
    const { extracted, source_image_url } = req.body ?? {};
    if (!extracted || typeof extracted !== "object") {
      return res.status(400).json({ error: "extracted required" });
    }

    const nameEn: string = (extracted.name_en ?? "").trim();
    const [first, ...rest] = nameEn ? nameEn.split(/\s+/) : ["Unknown"];
    const last = rest.join(" ") || "";
    const email: string | null = extracted.email ?? null;

    // ICP check
    const icpResult = checkIcp(extracted);
    const requiresApproval = !icpResult.passes;

    // Company upsert
    let companyId: string | null = null;
    if (extracted.company) {
      const existingCo = await db
        .select()
        .from(companies)
        .where(sql`lower(name) = lower(${extracted.company})`)
        .limit(1);
      if (existingCo[0]) {
        companyId = existingCo[0].id;
      } else {
        const webProfile = extracted.company_web_profile;
        const [c] = await db.insert(companies).values({
          name: extracted.company,
          website: extracted.website ?? null,
          country: extracted.country ?? null,
          city: extracted.city ?? null,
          industry: extracted.industry_guess ?? webProfile?.industry ?? null,
          description: webProfile?.description ?? null,
          size: webProfile?.size_band ?? null,
        } as any).returning();
        companyId = c.id;
      }
    }

    // Duplicate check
    if (email) {
      const dup = await db
        .select()
        .from(contacts)
        .where(eq(contacts.email, email))
        .limit(1);
      if (dup[0]) {
        await db
          .update(contacts)
          .set({
            phone: extracted.mobile ?? dup[0].phone,
            title: extracted.title ?? dup[0].title,
            linkedin_url: extracted.linkedin
              ? `https://${extracted.linkedin}`
              : dup[0].linkedin_url,
            last_engaged_at: new Date(),
          })
          .where(eq(contacts.id, dup[0].id));
        await db.insert(activities).values({
          type: "note",
          title: "Business card re-scanned",
          body: `Card re-scanned and contact updated. Source: ${source_image_url ?? "upload"}`,
          contact_id: dup[0].id,
          status: "completed",
          completed_at: new Date(),
          metadata: { extracted, duplicate: true },
        });
        return res.json({
          contact_id: dup[0].id,
          company_id: companyId,
          duplicate: true,
          requires_approval: false,
        });
      }
    }

    // Save contact
    const [contact] = await db
      .insert(contacts)
      .values({
        first_name: first || "Unknown",
        last_name: last,
        email,
        phone: extracted.mobile ?? extracted.office ?? null,
        title: extracted.title ?? null,
        company_id: companyId,
        linkedin_url: extracted.linkedin ? `https://${extracted.linkedin}` : null,
        source: "business_card_scan",
        status: requiresApproval ? "pending_approval" : "new",
        notes: [
          extracted.name_ar ? `Arabic name: ${extracted.name_ar}` : null,
          extracted.summary_en ? `AI summary: ${extracted.summary_en}` : null,
          extracted.summary_ar ? `ملخص: ${extracted.summary_ar}` : null,
          requiresApproval
            ? `Pending manager approval. Reasons: ${icpResult.failed.join("; ")}`
            : null,
        ]
          .filter(Boolean)
          .join("\n") || null,
        tags: requiresApproval ? ["card-scan", "pending-approval"] : ["card-scan"],
        lead_score: extracted.lead_score ?? 50,
      })
      .returning();

    await db.insert(activities).values({
      type: "note",
      title: requiresApproval
        ? "Business card scanned — pending manager approval"
        : "Business card scanned (multi-agent)",
      body: requiresApproval
        ? `Contact outside target segment — requires manager approval. Issues: ${icpResult.failed.join("; ")}`
        : `New contact captured. Agents: Gemini Vision + Claude validation + web enrichment + OpenAI scoring.${extracted.summary_en ? ` Summary: ${extracted.summary_en}` : ""}`,
      contact_id: contact.id,
      status: "completed",
      completed_at: new Date(),
      metadata: {
        extracted,
        source_image_url,
        icp: icpResult,
        requires_approval: requiresApproval,
        agents_used: extracted.agents_used ?? [],
      },
    });

    // Fire-and-forget deep enrichment for ICP-passing contacts
    if (!requiresApproval) {
      const port = process.env.PORT ?? "8080";
      fetch(`http://127.0.0.1:${port}/api/lead-enrich/deep/${contact.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then(() => {})
        .catch(() => {});
    }

    res.status(201).json({
      contact_id: contact.id,
      company_id: companyId,
      duplicate: false,
      requires_approval: requiresApproval,
      approval_reasons: icpResult.failed,
      enrichment_started: !requiresApproval,
    });
  } catch (err: any) {
    req.log?.error?.({ err }, "[business-cards] save failed");
    res.status(500).json({ error: err?.message ?? "Save failed" });
  }
});

// ─── GET /recent ───────────────────────────────────────────────────────────
router.get("/recent", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: contacts.id,
        name: sql<string>`${contacts.first_name} || ' ' || ${contacts.last_name}`,
        company_id: contacts.company_id,
        title: contacts.title,
        score: contacts.lead_score,
        status: contacts.status,
        created_at: contacts.created_at,
      })
      .from(contacts)
      .where(eq(contacts.source, "business_card_scan"))
      .orderBy(sql`${contacts.created_at} desc`)
      .limit(12);
    res.json({ scans: rows });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
