import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, companies, activities } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const GEMINI_API_KEY = process.env.AI_INTEGRATIONS_GEMINI_API_KEY ?? "";
const GEMINI_FLASH = "gemini-2.0-flash";

/** Call Gemini with vision + JSON output. */
async function geminiVision(prompt: string, imageDataUrl: string): Promise<any> {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");
  const [header, b64] = imageDataUrl.split(",");
  const mimeType = header?.match(/data:([^;]+)/)?.[1] ?? "image/jpeg";
  const body = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: b64 } }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
  };
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_FLASH}:generateContent?key=${GEMINI_API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  const d: any = await r.json();
  if (!r.ok) throw new Error(d?.error?.message ?? `Gemini ${r.status}`);
  const text = d?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  try { return JSON.parse(text); } catch { return {}; }
}

// ICP seed matching the client-side icp.ts rules
const ICP_INDUSTRIES = ["asset management", "family office", "insurance", "private banking", "wealth management", "banking", "finance", "financial services", "investment"];
const ICP_REGIONS = ["saudi arabia", "uae", "united arab emirates", "qatar", "bahrain", "kuwait", "oman", "ksa"];

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

// ─── POST /scan ────────────────────────────────────────────────────────────
router.post("/scan", async (req, res) => {
  try {
    const { image_data_url } = req.body ?? {};
    if (!image_data_url || typeof image_data_url !== "string") {
      return res.status(400).json({ error: "image_data_url required" });
    }
    if (!GEMINI_API_KEY) {
      return res.status(503).json({ error: "Vision AI not configured (missing Gemini key)" });
    }

    const prompt = `You are an expert business-card OCR with deep knowledge of GCC (Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman) naming conventions and Arabic script.

STEP 1 — Validate: Is this image a real professional business card containing a real human being's name and contact details?
Return is_business_card=false if it is: a screenshot, random photo, ID card, invoice, meme, poster, product image, logo-only, or anything that is NOT a business card.

STEP 2 — If it IS a real business card, extract all visible fields accurately.

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "is_business_card": true|false,
  "rejection_reason": null|"<one clear sentence why it is not a business card>",
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
  "fields": [
    { "key": "name_en", "confidence": 0-100, "bbox": {"x":0-100,"y":0-100,"w":0-100,"h":0-100} }
  ]
}

Extraction rules (when is_business_card=true):
- Normalize phones in international format (+966, +971, +974, +965, +973, +968)
- Strip protocol from URLs (e.g. "neom.com" not "https://neom.com")
- Return null (never empty string) for absent fields
- Arabic names must use proper Arabic script
- Guess industry from company name / context if not printed`;

    const extracted = await geminiVision(prompt, image_data_url);
    res.json({ extracted, model: "gemini-2.0-flash" });
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

    // ICP check — determine if approval is needed before CRM entry
    const icpResult = checkIcp(extracted);
    const requiresApproval = !icpResult.passes;

    // Company upsert
    let companyId: string | null = null;
    if (extracted.company) {
      const existingCo = await db.select().from(companies).where(sql`lower(name) = lower(${extracted.company})`).limit(1);
      if (existingCo[0]) {
        companyId = existingCo[0].id;
      } else {
        const [c] = await db.insert(companies).values({
          name: extracted.company,
          website: extracted.website ?? null,
          country: extracted.country ?? null,
          city: extracted.city ?? null,
          industry: extracted.industry_guess ?? null,
        }).returning();
        companyId = c.id;
      }
    }

    // Duplicate check
    if (email) {
      const dup = await db.select().from(contacts).where(eq(contacts.email, email)).limit(1);
      if (dup[0]) {
        await db.update(contacts).set({
          phone: extracted.mobile ?? dup[0].phone,
          title: extracted.title ?? dup[0].title,
          linkedin_url: extracted.linkedin ? `https://${extracted.linkedin}` : dup[0].linkedin_url,
          last_engaged_at: new Date(),
        }).where(eq(contacts.id, dup[0].id));
        await db.insert(activities).values({
          type: "note", title: "Business card re-scanned",
          body: `Card re-scanned and contact updated. Source: ${source_image_url ?? "upload"}`,
          contact_id: dup[0].id, status: "completed", completed_at: new Date(),
          metadata: { extracted, duplicate: true },
        });
        return res.json({ contact_id: dup[0].id, company_id: companyId, duplicate: true, requires_approval: false });
      }
    }

    // Save contact — pending_approval status if ICP fails
    const [contact] = await db.insert(contacts).values({
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
        requiresApproval ? `Pending manager approval. Reasons: ${icpResult.failed.join("; ")}` : null,
      ].filter(Boolean).join("\n") || null,
      tags: requiresApproval ? ["card-scan", "pending-approval"] : ["card-scan"],
      lead_score: 50,
    }).returning();

    // Activity log
    await db.insert(activities).values({
      type: "note",
      title: requiresApproval ? "Business card scanned — pending manager approval" : "Business card scanned",
      body: requiresApproval
        ? `Contact outside target segment — requires manager approval before entering CRM. Issues: ${icpResult.failed.join("; ")}`
        : `New contact captured from card scan.${extracted.company ? ` Company: ${extracted.company}.` : ""}`,
      contact_id: contact.id, status: "completed", completed_at: new Date(),
      metadata: { extracted, source_image_url, icp: icpResult, requires_approval: requiresApproval },
    });

    // Fire-and-forget Gemini enrichment for ICP-passing contacts
    if (GEMINI_API_KEY && !requiresApproval) {
      const port = process.env.PORT ?? "8080";
      fetch(`http://127.0.0.1:${port}/api/lead-enrich/deep/${contact.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
      }).then(() => {}).catch(() => {});
    }

    res.status(201).json({
      contact_id: contact.id,
      company_id: companyId,
      duplicate: false,
      requires_approval: requiresApproval,
      approval_reasons: icpResult.failed,
      enrichment_started: GEMINI_API_KEY && !requiresApproval,
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
