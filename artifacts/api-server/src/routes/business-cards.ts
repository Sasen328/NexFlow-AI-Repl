import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, companies, activities } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { aiChat, aiJson, aiGeminiVisionJson, aiOpenAIVisionJson } from "../lib/ai.js";

const router = Router();

// ─── ICP rules ─────────────────────────────────────────────────────────────
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
  const country  = (extracted.country ?? "").toLowerCase();
  const industryOk = !extracted.industry_guess || ICP_INDUSTRIES.some((i) => industry.includes(i));
  const regionOk   = !extracted.country || ICP_REGIONS.some((r) => country.includes(r));
  if (!industryOk) failed.push(`Industry "${extracted.industry_guess}" is outside Finance / Wealth / Banking target segments`);
  if (!regionOk)   failed.push(`Region "${extracted.country}" is outside GCC target markets (KSA, UAE, Qatar, Bahrain, Kuwait, Oman)`);
  return { passes: industryOk && regionOk, failed };
}

// ─── AGENT 1: Gemini Vision OCR (front OR back image) ─────────────────────
async function agent1GeminiOCR(
  imageDataUrl: string,
  side: "front" | "back" = "front",
): Promise<{ result: any; error?: string }> {
  const sideNote = side === "back"
    ? "This is the BACK side of the card. Focus on additional info: address, QR code data, Arabic text, second phone, or other details not on the front."
    : "This is the FRONT side of the card.";

  const prompt = `You are an expert business-card OCR specialist for GCC/Middle-East B2B markets. ${sideNote}

CRITICAL RULE: Default to is_business_card=true unless the image is OBVIOUSLY something completely different (selfie, food photo, landscape, government ID with face photo). Dark, colored, metallic, luxury, minimal images ARE business cards.

GCC cards often have: dark backgrounds (black, navy, maroon, dark red, burgundy), gold/silver text, bilingual Arabic + English, just a logo + QR code, or ultra-minimalist designs.

── GCC BILINGUAL CARD LAYOUT (extremely common) ──
Most GCC professional cards follow this layout:
  [Company logo]              [QR code or decorative element]
  [Arabic name — right-to-left Arabic script]
  [English name — Latin letters directly below the Arabic name]
  [Job title — full title, never truncate]
  [Phone] [Email] [Website]

EXTRACTION RULES for bilingual cards:
• name_ar: The line written in Arabic script (right-to-left characters). Read every Arabic character exactly as printed — do NOT transliterate or guess. If you are unsure of a character, read what is actually on the card.
• name_en: The Latin-script name, typically the line DIRECTLY BELOW the Arabic name. Read EXACTLY what is printed — do NOT substitute or guess alternative spellings.
• title: The job title line — read the FULL title including ALL words.
• company / company_ar: Read ALL lines of the company name exactly as printed.

CRITICAL: Read what is ACTUALLY on the card. Do not substitute example names or guesses — extract the literal text visible in the image.

DO NOT skip short lines or lines that appear decorative — on GCC cards these are often the person's name or department.

── SPECIAL INSTRUCTION — QR CODES ──
If you see a QR code on the card, attempt to decode it. QR codes on business cards typically encode:
- vCard format (BEGIN:VCARD with name/tel/email/url/linkedin)  
- LinkedIn profile URLs (linkedin.com/in/...)
- WhatsApp links (wa.me/...)
- A website URL
- Plain contact info

Return ONLY valid JSON:
{
  "is_business_card": true|false,
  "rejection_reason": null,
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
  "qr_detected": true|false,
  "qr_raw_data": string|null,
  "qr_type": "vcard"|"linkedin"|"whatsapp"|"url"|"text"|null,
  "qr_extracted": { "name": null, "email": null, "phone": null, "linkedin": null, "website": null }|null,
  "fields": [{"key":"name_en","confidence":0-100,"bbox":{"x":0-100,"y":0-100,"w":0-100,"h":0-100}}]
}

Rules:
- Normalize phones in international format (+966, +971, +974, +965, +973, +968)
- Strip protocol from URLs ("neom.com" not "https://neom.com") — EXCEPT LinkedIn: keep as linkedin.com/in/username
- Return null (never empty string) for absent fields
- Arabic names MUST use proper Arabic script — read exactly what is printed, never substitute or guess
- title: return the COMPLETE job title string, never truncate it
- LinkedIn URL: ONLY set if explicitly visible on the card or decoded from QR. NEVER guess.
- If QR is decoded and contains a linkedin.com URL, put it in both qr_extracted.linkedin AND linkedin field`;

  try {
    const result = await aiGeminiVisionJson({ prompt, imageDataUrl, maxTokens: 2500 });
    return { result };
  } catch (err: any) {
    return { result: { is_business_card: false, rejection_reason: err.message }, error: err.message };
  }
}

// ─── AGENT 1C: GPT-4o Vision — third-pass fallback for stubborn cards ──────
// Called when BOTH Gemini passes return no contact data. GPT-4o is often
// better than Gemini at reading text from photos taken at an angle, with
// shadows, creases, or dark/metallic backgrounds.
async function agent1GptVisionOCR(
  imageDataUrl: string,
  hint: string = "",
): Promise<{ result: any; error?: string }> {
  const prompt = `You are an expert business-card OCR specialist. ${hint}

This image shows a business card — extract every piece of text you can see, even if the photo is shadowed, angled, or has low contrast.

Return ONLY valid JSON:
{
  "is_business_card": true,
  "rejection_reason": null,
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
  "qr_detected": true|false,
  "qr_raw_data": string|null,
  "qr_type": "vcard"|"linkedin"|"whatsapp"|"url"|"text"|null,
  "qr_extracted": null,
  "fields": []
}

Rules:
- name_ar: Arabic script line (right-to-left). name_en: Latin-script name.
- title: full job title (never truncate — include every word).
- company: read ALL lines of the company name.
- Normalize phones: international format (+966, +971, +974...).
- Confidence: reflect how clearly you can read the text (0=nothing, 100=perfect).`;

  try {
    const result = await aiOpenAIVisionJson({ prompt, imageDataUrl, maxTokens: 1500 });
    result.is_business_card = true;
    result.rejection_reason = null;
    return { result };
  } catch (err: any) {
    return { result: { is_business_card: true, ocr_confidence: 0 }, error: err.message };
  }
}

// ─── AGENT 1B: Second-pass for dark/failed cards ───────────────────────────
async function agent1SecondPass(imageDataUrl: string): Promise<{ result: any; error?: string }> {
  const prompt = `You are examining a confirmed business card image. Extract every visible piece of text.

The card may have: dark background, light-colored text (white/gold/silver), Arabic + English, QR code.

If you see a QR code: try to decode it. QR codes on GCC business cards typically encode vCard, LinkedIn URL, or website.

Instructions:
1. Look carefully at ALL areas of the image
2. Try to read any text regardless of contrast or quality
3. Extract whatever you can — even partial names, numbers, or domain fragments
4. Set is_business_card=true always (this IS confirmed to be a card)

Return ONLY valid JSON:
{
  "is_business_card": true,
  "rejection_reason": null,
  "name_en": string|null, "name_ar": string|null, "title": string|null,
  "company": string|null, "company_ar": string|null,
  "email": string|null, "mobile": string|null, "office": string|null,
  "fax": string|null, "website": string|null, "address": string|null,
  "city": string|null, "country": string|null,
  "linkedin": string|null, "twitter": string|null, "industry_guess": string|null,
  "ocr_confidence": 0-100,
  "qr_detected": false, "qr_raw_data": null, "qr_type": null, "qr_extracted": null,
  "fields": []
}`;

  try {
    const result = await aiGeminiVisionJson({ prompt, imageDataUrl, maxTokens: 2000 });
    return { result: { ...result, is_business_card: true, rejection_reason: null } };
  } catch (err: any) {
    return { result: { is_business_card: true, ocr_confidence: 0 }, error: err.message };
  }
}

// ─── Merge front + back OCR data intelligently ────────────────────────────
function mergeCardSides(front: any, back: any): any {
  if (!back) return front;
  const merged: any = { ...front };

  // Identity fields: front takes priority (name, title, company on the front)
  const frontPriorityFields = ["name_en", "name_ar", "title", "company", "company_ar", "linkedin", "twitter", "industry_guess"];
  for (const f of frontPriorityFields) {
    if (!merged[f] && back[f]) merged[f] = back[f];
  }

  // Contact/location fields: BACK takes priority on GCC cards — phone, email,
  // address, country are almost always on the back, not the front.
  const backPriorityFields = ["email", "mobile", "office", "fax", "website", "address", "city", "country"];
  for (const f of backPriorityFields) {
    // Use back value if back has it (even if front also has something)
    if (back[f]) merged[f] = back[f];
  }

  // QR data: prefer whichever side found it
  if (!merged.qr_detected && back.qr_detected) {
    merged.qr_detected = back.qr_detected;
    merged.qr_raw_data = back.qr_raw_data;
    merged.qr_type = back.qr_type;
    merged.qr_extracted = back.qr_extracted;
  }
  // Apply QR extracted fields if they fill gaps
  const qr = merged.qr_extracted ?? {};
  if (!merged.email    && qr.email)    merged.email    = qr.email;
  if (!merged.mobile   && qr.phone)    merged.mobile   = qr.phone;
  if (!merged.linkedin && qr.linkedin) merged.linkedin = qr.linkedin;
  if (!merged.website  && qr.website)  merged.website  = qr.website;
  if (!merged.name_en  && qr.name)     merged.name_en  = qr.name;
  // Confidence: average both sides if available
  const frontConf = front.ocr_confidence ?? 0;
  const backConf  = back.ocr_confidence  ?? 0;
  merged.ocr_confidence = Math.round((frontConf + backConf) / (back ? 2 : 1));
  merged.both_sides_scanned = true;
  return merged;
}

// ─── AGENT 2: Claude/GPT-4o — reasoning, normalisation, ICP check ─────────
async function agent2ReasoningValidate(rawOcr: any): Promise<{ result: any; model: string }> {
  const systemPrompt = `You are a senior CRM data quality agent specialising in GCC B2B contacts.
You receive raw OCR output from a business card image and must:
1. NEVER change is_business_card — if the input has is_business_card=true, you MUST return true.
2. Normalize and clean all fields (fix encoding, capitalisation, phone formats)
3. Fill logical gaps: if city=Dubai, set country=UAE; infer industry from company name
4. LinkedIn URL: ONLY include if it was present in OCR. NEVER fabricate. Clean format to "linkedin.com/in/username"
5. Assign a data_quality score 0-100 and list validation_notes
6. NEVER fabricate contact details — only clean/normalise what OCR returned

Return ONLY valid JSON with the same schema plus:
  "data_quality": 0-100,
  "validation_notes": ["..."],
  "is_business_card": true`;

  const userPrompt = `OCR output:\n${JSON.stringify(rawOcr, null, 2)}\n\nReturn cleaned JSON:`;

  try {
    const text = await aiChat({ system: systemPrompt, user: userPrompt, provider: "anthropic", maxTokens: 1400 });
    const cleaned = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
    return { result: { ...rawOcr, ...cleaned }, model: "claude-via-openrouter" };
  } catch {
    try {
      const text = await aiChat({ system: systemPrompt, user: userPrompt, provider: "openai", maxTokens: 1400 });
      const cleaned = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
      return { result: { ...rawOcr, ...cleaned }, model: "gpt-4o-mini" };
    } catch {
      return { result: rawOcr, model: "ocr-only" };
    }
  }
}

// ─── AGENT 3a: Perplexity — live person intelligence ──────────────────────
async function agent3aPersonSearch(
  nameEn: string,
  nameAr: string | null,
  title: string | null,
  company: string | null,
): Promise<{ text: string; ms: number }> {
  const t0 = Date.now();
  if (!nameEn && !nameAr) return { text: "", ms: 0 };

  const identifiers = [
    nameEn && `English name: "${nameEn}"`,
    nameAr && `Arabic name: "${nameAr}"`,
    title  && `Title: "${title}"`,
    company && `Company: "${company}"`,
  ].filter(Boolean).join("\n");

  try {
    const text = await aiChat({
      provider: "perplexity",
      system: `You are a GCC B2B sales intelligence analyst. Research this professional and return everything you can verify from public sources. Be thorough — include career history, education, notable projects, company background, and any public statements or news. Output a structured brief that a sales executive would use before a first meeting.`,
      user: `Research this GCC business professional:
${identifiers}

Find and return ALL of the following:
1. CURRENT ROLE — exact title, company, and how long they've been there
2. CAREER HISTORY — previous roles in reverse chronological order (company, title, approximate dates)
3. EDUCATION — university, degree, graduation year if available
4. COMPANY PROFILE — what does "${company ?? "their company"}" do, size, AUM/revenue if known, key offerings
5. LINKEDIN PROFILE — search for their LinkedIn URL (linkedin.com/in/...). Include it if found.
6. NEWS & ACHIEVEMENTS — any press mentions, awards, conferences, publications, interviews
7. PERSONAL BACKGROUND — board memberships, advisory roles, civic activities
8. OUTREACH INSIGHT — one-sentence summary of how to approach this person professionally

Search using both the English name "${nameEn ?? ""}" and Arabic name "${nameAr ?? ""}" for best results.
Be specific and cite what you found. Do NOT fabricate any information — if something is not found, say so.`,
      maxTokens: 1200,
    });
    return { text: text ?? "", ms: Date.now() - t0 };
  } catch {
    return { text: "", ms: Date.now() - t0 };
  }
}

// ─── AGENT 3b: Perplexity — LinkedIn-specific validated search ─────────────
async function agent3bLinkedInValidate(
  nameEn: string,
  nameAr: string | null,
  company: string | null,
  title: string | null,
  candidateLinkedIn: string | null,
): Promise<{ url: string | null; verified: boolean; confidence: number; ms: number }> {
  const t0 = Date.now();
  if (!nameEn && !nameAr) return { url: candidateLinkedIn, verified: false, confidence: 0, ms: 0 };
  const name = nameEn || nameAr || "";
  try {
    const searchParts = [
      `"${name}"`,
      company && `"${company}"`,
      title   && `"${title}"`,
      "site:linkedin.com/in",
    ].filter(Boolean).join(" ");

    const text = await aiChat({
      provider: "perplexity",
      system: `You are a LinkedIn profile verification specialist. Your ONLY job is to find the correct LinkedIn profile URL for a specific person.

RULES:
- Search using the person's English name, Arabic name (if provided), job title, and company together for maximum precision
- Only return a linkedin.com/in/ URL if you are HIGHLY confident it matches this specific person
- If the candidate URL provided matches the person, confirm it
- If you find a different/better URL, return that instead
- If you cannot find a verified match, return NOT_FOUND
- NEVER guess or fabricate LinkedIn URLs
- Format: return the URL as plain text only: linkedin.com/in/username (no https://)`,
      user: `Find the LinkedIn profile for this GCC professional:
English name: ${nameEn || "unknown"}
Arabic name: ${nameAr || "not available"}
Company: ${company ?? "unknown"}
Job title: ${title ?? "unknown"}
Candidate URL from card: ${candidateLinkedIn ?? "none found on card"}

Search query to use: ${searchParts}

Return ONLY the verified LinkedIn URL in linkedin.com/in/username format, or "NOT_FOUND" if you cannot verify one with high confidence.`,
      maxTokens: 300,
    });

    // Extract linkedin.com/in/username from response
    const match = (text ?? "").match(/linkedin\.com\/in\/([A-Za-z0-9_%-]+)/i);
    if (!match) {
      // If Perplexity couldn't find it, keep candidate URL from card if it exists
      return { url: candidateLinkedIn, verified: false, confidence: candidateLinkedIn ? 40 : 0, ms: Date.now() - t0 };
    }

    const foundUrl = `linkedin.com/in/${match[1]}`;
    // If candidate from OCR matches what Perplexity found, high confidence
    const candidateClean = (candidateLinkedIn ?? "").toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const foundClean = foundUrl.toLowerCase();
    const isMatch = candidateClean && (candidateClean === foundClean || candidateClean.includes(match[1].toLowerCase()));
    const confidence = isMatch ? 92 : 75;

    return { url: foundUrl, verified: true, confidence, ms: Date.now() - t0 };
  } catch {
    return { url: candidateLinkedIn, verified: false, confidence: candidateLinkedIn ? 35 : 0, ms: Date.now() - t0 };
  }
}

// ─── AGENT 4: Python Enrichment Scraper — company web profile ─────────────
async function agent4WebEnrich(website: string): Promise<{ result: any } | null> {
  if (!website) return null;
  const url = website.startsWith("http") ? website : `https://${website}`;
  try {
    const scraperBase = process.env["ENRICHMENT_SCRAPER_URL"] ?? "http://localhost:8000/scraper";
    const r = await fetch(`${scraperBase}/extract`, {
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

// ─── AGENT 5: GPT-4o-mini — final merge, scoring & bilingual summary ──────
async function agent5FinalScore(
  validated: any,
  webProfile: any,
  personIntel: string | null,
  linkedInVerified: { url: string | null; verified: boolean; confidence: number } | null,
): Promise<{
  lead_score: number;
  confidence: number;
  summary_en: string;
  summary_ar: string;
  brief_en: string;
  career_history: string[];
  company_snapshot: string;
  next_actions: string[];
}> {
  const systemPrompt = `You are a GCC B2B revenue intelligence analyst preparing a pre-meeting brief for a senior sales executive.
Combine ALL available intelligence sources — card data, web scrape, live Perplexity research — into a rich, actionable profile.
Output ONLY valid JSON with this exact schema:
{
  "lead_score": 0-100,
  "confidence": 0-100,
  "summary_en": "1-2 sentence headline summary (who they are, role, company)",
  "summary_ar": "1-2 sentence Arabic headline summary in proper Arabic script (not transliteration)",
  "brief_en": "3-5 sentence comprehensive pre-meeting brief covering their background, current responsibilities, company context, and any relevant achievements or talking points. Write as if briefing a sales VP before a call.",
  "career_history": ["Current: [title] at [company] (since ~[year])", "Previous: [title] at [company]", "...up to 4 entries, most recent first"],
  "company_snapshot": "2-3 sentence description of the company: what they do, size/AUM, key services, GCC presence",
  "next_actions": ["3 specific, personalised outreach actions referencing their role/company/background — not generic"]
}`;

  const userPrompt = `Business card extracted data:
${JSON.stringify({ ...validated, fields: undefined, qr_extracted: undefined }, null, 2)}

LinkedIn: ${linkedInVerified?.url ?? "not found"} (verified: ${linkedInVerified?.verified}, confidence: ${linkedInVerified?.confidence}%)

Company web profile (BeautifulSoup scrape):
${webProfile ? JSON.stringify(webProfile, null, 2) : "(not available)"}

Live web intelligence on this person (Perplexity research):
${personIntel ? personIntel.slice(0, 2400) : "(not available)"}

Based on all sources, produce the final JSON assessment:`;

  const fallback = {
    lead_score: 60,
    confidence: 50,
    summary_en: `${validated?.name_en ?? "Contact"} is ${validated?.title ?? "a professional"} at ${validated?.company ?? "Unknown"}.`,
    summary_ar: `${validated?.name_ar ?? validated?.name_en ?? "جهة الاتصال"} تشغل منصب ${validated?.title ?? "مهنية"} في ${validated?.company ?? "غير معروف"}.`,
    brief_en: `${validated?.name_en ?? "This contact"} serves as ${validated?.title ?? "a professional"} at ${validated?.company ?? "their company"}. Review card details and conduct additional research before outreach.`,
    career_history: [`Current: ${validated?.title ?? "Professional"} at ${validated?.company ?? "Unknown"}`],
    company_snapshot: `${validated?.company ?? "The company"} is a GCC-based organisation. Visit their website for more details.`,
    next_actions: ["Send a personalised intro email referencing their specific role", "Connect on LinkedIn with a tailored note", "Schedule a discovery call to understand their operational priorities"],
  };

  try {
    return await aiJson<any>({
      system: systemPrompt,
      user: userPrompt,
      provider: "openai",
      fallback,
    });
  } catch {
    return fallback;
  }
}

// ─── Field-level validation helper ────────────────────────────────────────
function validateFields(extracted: Record<string, any>): {
  valid: boolean;
  fields: Record<string, { ok: boolean; issue?: string }>;
  score: number;
} {
  const fields: Record<string, { ok: boolean; issue?: string }> = {};
  let pass = 0; let total = 0;

  // Name
  total++;
  if (extracted.name_en && extracted.name_en.trim().length >= 2) {
    fields.name_en = { ok: true };
    pass++;
  } else {
    fields.name_en = { ok: false, issue: "Name is required" };
  }

  // Email
  if (extracted.email) {
    total++;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRe.test(extracted.email)) {
      fields.email = { ok: true };
      pass++;
    } else {
      fields.email = { ok: false, issue: "Email format invalid" };
    }
  }

  // Phone
  if (extracted.mobile) {
    total++;
    const phoneRe = /^\+[1-9]\d{7,14}$/;
    const digitsOnly = extracted.mobile.replace(/[\s\-().]/g, "");
    if (phoneRe.test(digitsOnly)) {
      fields.mobile = { ok: true };
      pass++;
    } else {
      fields.mobile = { ok: false, issue: "Phone not in international format — expected +966..." };
    }
  }

  // LinkedIn
  if (extracted.linkedin) {
    total++;
    const liRe = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]+\/?$/;
    if (liRe.test(extracted.linkedin)) {
      fields.linkedin = { ok: true };
      pass++;
    } else {
      fields.linkedin = { ok: false, issue: "LinkedIn URL format invalid — expected linkedin.com/in/username" };
    }
  }

  // Website
  if (extracted.website) {
    total++;
    const webRe = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;
    if (webRe.test(extracted.website)) {
      fields.website = { ok: true };
      pass++;
    } else {
      fields.website = { ok: false, issue: "Website URL format invalid" };
    }
  }

  return {
    valid: total > 0 && fields.name_en?.ok === true,
    fields,
    score: total > 0 ? Math.round((pass / total) * 100) : 0,
  };
}

const hasContactData = (d: any) =>
  d.name_en || d.name_ar || d.email || d.mobile || d.office || d.company;

// ─── POST /scan — upgraded 7-agent pipeline ────────────────────────────────
//
// Stage 0 (parallel if back image provided): Agent1 on front + back simultaneously
// Stage 1 (sequential):  Merge front+back data, handle second-pass fallback
// Stage 2 (parallel, 4 agents): Claude validation, Perplexity person intel,
//                                Perplexity LinkedIn validate, Web scraper
// Stage 3 (sequential): GPT-4o-mini final merge + scoring
//
router.post("/scan", async (req, res) => {
  try {
    // Support both old (image_data_url) and new (front_image_data_url / back_image_data_url)
    const {
      image_data_url,
      front_image_data_url,
      back_image_data_url,
    } = req.body ?? {};

    const frontUrl: string | null = front_image_data_url ?? image_data_url ?? null;
    const backUrl:  string | null = back_image_data_url ?? null;

    if (!frontUrl || typeof frontUrl !== "string") {
      return res.status(400).json({ error: "front_image_data_url (or image_data_url) required" });
    }
    if (!process.env.AI_INTEGRATIONS_GEMINI_API_KEY) {
      return res.status(503).json({ error: "Vision AI not configured (missing Gemini key)" });
    }

    const pipeline_trace: Record<string, any> = {};
    const t0 = Date.now();

    // ── STAGE 0+1: Vision OCR — front and back simultaneously ──────────────
    const [frontOcr, backOcr] = await Promise.all([
      agent1GeminiOCR(frontUrl, "front"),
      backUrl ? agent1GeminiOCR(backUrl, "back") : Promise.resolve(null),
    ]);

    pipeline_trace.agent1_front_ocr = {
      model: "gemini-2.5-flash",
      ms: Date.now() - t0,
      is_business_card: frontOcr.result?.is_business_card,
      qr_detected: frontOcr.result?.qr_detected ?? false,
      error: frontOcr.error ?? null,
    };
    if (backUrl) {
      pipeline_trace.agent1b_back_ocr = {
        model: "gemini-2.5-flash",
        ms: Date.now() - t0,
        is_business_card: backOcr?.result?.is_business_card,
        qr_detected: backOcr?.result?.qr_detected ?? false,
        error: backOcr?.error ?? null,
      };
    }

    // Merge front and back
    let ocrData = mergeCardSides(frontOcr.result ?? {}, backOcr?.result ?? null);

    // Second-pass fallback: if card not detected and no contact data, retry
    if (ocrData.is_business_card === false && !hasContactData(ocrData)) {
      pipeline_trace.agent1_front_ocr.note = "first_pass_no_data_running_second_pass";
      const ocr2 = await agent1SecondPass(frontUrl);
      const d2 = ocr2.result ?? {};
      pipeline_trace.agent1c_second_pass = {
        ms: Date.now() - t0 - (pipeline_trace.agent1_front_ocr.ms ?? 0),
        has_data: Boolean(hasContactData(d2)),
        ocr_confidence: d2.ocr_confidence ?? 0,
        error: ocr2.error ?? null,
      };
      ocrData = mergeCardSides(d2, backOcr?.result ?? null);
      ocrData.is_business_card = true;
      ocrData.rejection_reason = null;
      ocrData.scan_note = hasContactData(d2)
        ? "Low-contrast card — data partially extracted on second pass"
        : "Very low contrast card — please verify fields manually";
    } else if (ocrData.is_business_card === false && hasContactData(ocrData)) {
      ocrData.is_business_card = true;
      ocrData.rejection_reason = null;
      pipeline_trace.agent1_front_ocr.override = "data_found_despite_false_flag";
    }

    // Third-pass: GPT-4o Vision — fires when Gemini is missing contact info.
    // Triggers when: no contact data at all, OR email+phone both missing (common
    // when Gemini reads the front name but can't read the dark back card).
    // When a back image is provided, ALWAYS run GPT-4o on the back — it is far
    // more reliable at reading dark-background cards than Gemini.
    const missingContact = !ocrData.email && !ocrData.mobile && !ocrData.office;
    const needsThirdPass = !hasContactData(ocrData) || (backUrl && missingContact);
    if (needsThirdPass) {
      pipeline_trace.agent1_front_ocr.note = (pipeline_trace.agent1_front_ocr.note ?? "") + ";third_pass_gpt4o_vision";
      const [gptFront, gptBack] = await Promise.all([
        // Only run front pass if name/company also missing — avoid overwriting correct front data
        !hasContactData(ocrData)
          ? agent1GptVisionOCR(frontUrl, "The card may be photographed at an angle or have a shadow.")
          : Promise.resolve(null),
        // ALWAYS run back pass when back image present and contact info is missing
        backUrl && missingContact
          ? agent1GptVisionOCR(backUrl, "This is the BACK of the card. Focus entirely on extracting: phone numbers, email address, website, street address, city, country. These are usually printed clearly on the back.")
          : Promise.resolve(null),
      ]);
      // Merge GPT results — only fill fields that are still empty
      if (gptFront?.result) {
        for (const f of ["name_en","name_ar","title","company","company_ar","linkedin","twitter","industry_guess"] as const) {
          if (!ocrData[f] && gptFront.result[f]) ocrData[f] = gptFront.result[f];
        }
      }
      if (gptBack?.result) {
        // Back card: overwrite contact/location fields with GPT-4o readings
        for (const f of ["email","mobile","office","fax","website","address","city","country"] as const) {
          if (gptBack.result[f]) ocrData[f] = gptBack.result[f];
        }
      }
      pipeline_trace.agent1d_gpt4o_vision = {
        model: "gpt-4o",
        ran_front: Boolean(gptFront),
        ran_back: Boolean(gptBack),
        back_ocr_confidence: gptBack?.result?.ocr_confidence ?? null,
        front_error: gptFront?.error ?? null,
        back_error: gptBack?.error ?? null,
      };
      const nowHasContact = Boolean(ocrData.email || ocrData.mobile || ocrData.office);
      if (nowHasContact) {
        ocrData.scan_note = "Back card required GPT-4o Vision — contact details extracted successfully";
      } else if (!hasContactData(ocrData)) {
        ocrData.scan_note = "Low-quality photo — please verify fields manually";
      }
    }

    // Lock is_business_card — no downstream agent can change it
    ocrData.is_business_card = true;
    ocrData.rejection_reason = null;

    const website = ocrData.website ?? null;
    const candidateLinkedIn = ocrData.linkedin ?? null;

    // ── STAGE 2: 4 agents in parallel ──────────────────────────────────────
    const stage2Start = Date.now();
    const [validated, personIntel, linkedInResult, webEnrich] = await Promise.all([
      // Agent 2: Claude validation + normalisation
      agent2ReasoningValidate(ocrData),

      // Agent 3a: Perplexity — comprehensive person intelligence (English + Arabic name)
      agent3aPersonSearch(
        ocrData.name_en ?? "",
        ocrData.name_ar ?? null,
        ocrData.title ?? null,
        ocrData.company ?? null,
      ),

      // Agent 3b: Perplexity — LinkedIn-specific validated search (title + Arabic name included)
      agent3bLinkedInValidate(
        ocrData.name_en ?? "",
        ocrData.name_ar ?? null,
        ocrData.company ?? null,
        ocrData.title ?? null,
        candidateLinkedIn,
      ),

      // Agent 4: BeautifulSoup — company website structured scrape
      website ? agent4WebEnrich(website) : Promise.resolve(null),
    ]);

    pipeline_trace.agent2_claude_validation = {
      model: validated.model,
      ms: Date.now() - stage2Start,
      data_quality: validated.result?.data_quality ?? null,
    };
    pipeline_trace.agent3a_perplexity_person = {
      model: "perplexity/sonar",
      ms: personIntel.ms,
      found: Boolean(personIntel.text),
    };
    pipeline_trace.agent3b_linkedin_validate = {
      model: "perplexity/sonar-linkedin",
      ms: linkedInResult.ms,
      url: linkedInResult.url,
      verified: linkedInResult.verified,
      confidence: linkedInResult.confidence,
    };
    pipeline_trace.agent4_bs4_scraper = {
      model: "python-bs4-scraper",
      scraped: Boolean(webEnrich),
      website: website ?? null,
    };

    // Apply verified LinkedIn
    const finalLinkedIn = linkedInResult.url ?? validated.result?.linkedin ?? null;
    const mergedValidated = {
      ...validated.result,
      linkedin: finalLinkedIn,
      linkedin_verified: linkedInResult.verified,
      linkedin_confidence: linkedInResult.confidence,
      // Preserve QR data from OCR
      qr_detected:   ocrData.qr_detected   ?? false,
      qr_raw_data:   ocrData.qr_raw_data   ?? null,
      qr_type:       ocrData.qr_type       ?? null,
      qr_extracted:  ocrData.qr_extracted  ?? null,
    };

    // ── STAGE 3: GPT-4o-mini final scoring ─────────────────────────────────
    const t5 = Date.now();
    const finalScore = await agent5FinalScore(
      mergedValidated,
      webEnrich?.result ?? null,
      personIntel.text || null,
      linkedInResult,
    );
    pipeline_trace.agent5_gpt_scoring = {
      model: "gpt-4o-mini",
      ms: Date.now() - t5,
      lead_score: finalScore.lead_score,
      confidence: finalScore.confidence,
    };

    // Merge all outputs
    const extracted = {
      ...mergedValidated,
      ...finalScore,
      company_web_profile: webEnrich?.result ?? null,
      perplexity_intel: personIntel.text || null,
    };
    extracted.is_business_card = true;
    extracted.rejection_reason = null;

    // Run field validation
    const fieldValidation = validateFields(extracted);
    extracted.field_validation = fieldValidation;

    pipeline_trace.total_ms = Date.now() - t0;

    const agentsUsed = [
      "gemini-2.5-flash-vision-front",
      backUrl ? "gemini-2.5-flash-vision-back" : null,
      validated.model,
      personIntel.text ? "perplexity/sonar-person" : null,
      linkedInResult.url ? "perplexity/sonar-linkedin" : null,
      webEnrich ? "python-bs4-scraper" : null,
      "gpt-4o-mini-scoring",
    ].filter(Boolean) as string[];

    res.json({
      extracted,
      model: "7-agent-orchestration",
      pipeline_trace,
      agents_used: agentsUsed,
      dual_side: Boolean(backUrl),
    });
  } catch (err: any) {
    req.log?.error?.({ err }, "[business-cards] scan failed");
    res.status(500).json({ error: err?.message ?? "Scan failed" });
  }
});

// ─── POST /validate — pre-save field validation ───────────────────────────
router.post("/validate", async (req, res) => {
  try {
    const { extracted } = req.body ?? {};
    if (!extracted || typeof extracted !== "object") {
      return res.status(400).json({ error: "extracted required" });
    }
    const result = validateFields(extracted);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Validation failed" });
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
    if (!nameEn) return res.status(400).json({ error: "name_en is required before saving" });

    const [first, ...rest] = nameEn.split(/\s+/);
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
      const dup = await db.select().from(contacts).where(eq(contacts.email, email)).limit(1);
      if (dup[0]) {
        await db.update(contacts).set({
          phone: extracted.mobile ?? dup[0].phone,
          title: extracted.title ?? dup[0].title,
          linkedin_url: extracted.linkedin ? `https://${extracted.linkedin}` : dup[0].linkedin_url,
          last_engaged_at: new Date(),
        }).where(eq(contacts.id, dup[0].id));
        await db.insert(activities).values({
          type: "note",
          title: "Business card re-scanned",
          body: `Card re-scanned and contact updated. LinkedIn verified: ${extracted.linkedin_verified ?? false}. Source: ${source_image_url ?? "upload"}`,
          contact_id: dup[0].id,
          status: "completed",
          completed_at: new Date(),
          metadata: { extracted, duplicate: true },
        });
        return res.json({ contact_id: dup[0].id, company_id: companyId, duplicate: true, requires_approval: false });
      }
    }

    // Format LinkedIn URL properly
    let linkedinUrl: string | null = null;
    if (extracted.linkedin) {
      const li = extracted.linkedin.replace(/^https?:\/\//, "").replace(/\/$/, "");
      linkedinUrl = `https://${li}`;
    }

    // Save contact
    const [contact] = await db.insert(contacts).values({
      first_name: first || "Unknown",
      last_name: last,
      email,
      phone: extracted.mobile ?? extracted.office ?? null,
      title: extracted.title ?? null,
      company_id: companyId,
      linkedin_url: linkedinUrl,
      source: "business_card_scan",
      status: requiresApproval ? "pending_approval" : "new",
      notes: [
        extracted.name_ar ? `Arabic name: ${extracted.name_ar}` : null,
        extracted.qr_detected ? `QR code on card (${extracted.qr_type ?? "unknown"}): ${extracted.qr_raw_data ?? "decoded"}` : null,
        extracted.linkedin_verified ? `LinkedIn verified by AI agent (${extracted.linkedin_confidence}% confidence)` : null,
        extracted.summary_en ? `AI summary: ${extracted.summary_en}` : null,
        extracted.summary_ar ? `ملخص: ${extracted.summary_ar}` : null,
        extracted.both_sides_scanned ? "Both card sides scanned and merged." : null,
        requiresApproval ? `Pending manager approval. Reasons: ${icpResult.failed.join("; ")}` : null,
      ].filter(Boolean).join("\n") || null,
      tags: [
        "card-scan",
        requiresApproval ? "pending-approval" : null,
        extracted.both_sides_scanned ? "dual-side" : null,
        extracted.qr_detected ? "qr-decoded" : null,
      ].filter(Boolean) as string[],
      lead_score: extracted.lead_score ?? 50,
    }).returning();

    await db.insert(activities).values({
      type: "note",
      title: requiresApproval
        ? "Business card scanned — pending manager approval"
        : "Business card scanned (7-agent pipeline)",
      body: [
        requiresApproval
          ? `Contact outside target segment — requires manager approval. Issues: ${icpResult.failed.join("; ")}`
          : `New contact captured via ${extracted.both_sides_scanned ? "dual-side" : "single"} card scan.`,
        `Agents: Gemini Vision + Claude validation + Perplexity person intel + LinkedIn verification + web enrichment + OpenAI scoring.`,
        extracted.qr_detected ? `QR code decoded: ${extracted.qr_type} data extracted.` : null,
        extracted.linkedin_verified ? `LinkedIn URL verified at ${extracted.linkedin_confidence}% confidence.` : null,
        extracted.summary_en ? `Summary: ${extracted.summary_en}` : null,
      ].filter(Boolean).join(" "),
      contact_id: contact.id,
      status: "completed",
      completed_at: new Date(),
      metadata: {
        extracted,
        source_image_url,
        icp: icpResult,
        requires_approval: requiresApproval,
        agents_used: extracted.agents_used ?? [],
        dual_side: extracted.both_sides_scanned ?? false,
        qr_detected: extracted.qr_detected ?? false,
        linkedin_verified: extracted.linkedin_verified ?? false,
      },
    });

    res.json({
      contact_id: contact.id,
      company_id: companyId,
      duplicate: false,
      requires_approval: requiresApproval,
      approval_reasons: requiresApproval ? icpResult.failed : [],
    });
  } catch (err: any) {
    req.log?.error?.({ err }, "[business-cards] save failed");
    res.status(500).json({ error: err?.message ?? "Save failed" });
  }
});

// ─── GET /recent ───────────────────────────────────────────────────────────
router.get("/recent", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: contacts.id,
        name: sql<string>`concat(${contacts.first_name}, ' ', ${contacts.last_name})`,
        title: contacts.title,
        status: contacts.status,
        created_at: contacts.created_at,
      })
      .from(contacts)
      .where(eq(contacts.source, "business_card_scan"))
      .orderBy(sql`${contacts.created_at} desc`)
      .limit(12);
    res.json({ scans: rows });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed to load recent scans" });
  }
});

export default router;
