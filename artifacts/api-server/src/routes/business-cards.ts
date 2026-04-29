import { Router } from "express";
import { db } from "@workspace/db";
import { contacts, companies, activities } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { openai, openrouter, aiEnabled } from "../lib/ai";

const router = Router();

const SCAN_SYSTEM = `You are an expert business-card OCR and data extractor with deep knowledge of GCC (Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman) naming conventions and Arabic script.

Given an image of a business card, extract every visible field. Return ONLY a JSON object with this shape:
{
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
    { "key": "name_en"|"email"|..., "confidence": 0-100, "bbox": {"x":0-100,"y":0-100,"w":0-100,"h":0-100} }
  ]
}

Rules:
- Confidence is your honest 0-100 estimate per field
- bbox is the relative bounding box (% of image) where you saw that field — best effort
- For Arabic names use proper Arabic script
- Normalize phone numbers in international format (+966, +971, +974, +965, +973, +968)
- Strip protocol from URLs (e.g. "neom.com" not "https://neom.com")
- If a field is not visible return null (not empty string)
- Return valid JSON only, no markdown, no commentary.`;

router.post("/scan", async (req, res) => {
  try {
    const { image_data_url } = req.body ?? {};
    if (!image_data_url || typeof image_data_url !== "string") {
      return res.status(400).json({ error: "image_data_url required (data URL or https URL)" });
    }
    if (!aiEnabled && !process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY) {
      return res.status(503).json({ error: "AI not configured" });
    }

    const useRouter = Boolean(process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY);
    const client = useRouter ? openrouter() : openai();
    const model = useRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";

    const resp = await client.chat.completions.create({
      model,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SCAN_SYSTEM + " Always respond with valid JSON." },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract every field from this business card image. Return JSON only." },
            { type: "image_url", image_url: { url: image_data_url } },
          ] as any,
        },
      ],
    });

    const text = resp.choices[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch { parsed = {}; }

    res.json({ extracted: parsed, model });
  } catch (err: any) {
    console.error("[business-cards] scan failed:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "scan failed" });
  }
});

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

    let companyId: string | null = null;
    if (extracted.company) {
      const existingCompany = await db
        .select()
        .from(companies)
        .where(sql`lower(name) = lower(${extracted.company})`)
        .limit(1);
      if (existingCompany[0]) {
        companyId = existingCompany[0].id;
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

    let duplicate = false;
    if (email) {
      const dup = await db.select().from(contacts).where(eq(contacts.email, email)).limit(1);
      if (dup[0]) {
        duplicate = true;
        await db.update(contacts).set({
          phone: extracted.mobile ?? dup[0].phone,
          title: extracted.title ?? dup[0].title,
          linkedin_url: extracted.linkedin ? `https://${extracted.linkedin}` : dup[0].linkedin_url,
          last_engaged_at: new Date(),
        }).where(eq(contacts.id, dup[0].id));
        await db.insert(activities).values({
          type: "note",
          title: "Business card re-scanned",
          body: `Card scanned at event. Source: ${source_image_url ?? "upload"}`,
          contact_id: dup[0].id,
          status: "completed",
          completed_at: new Date(),
          metadata: { extracted, duplicate: true },
        });
        return res.json({ contact_id: dup[0].id, company_id: companyId, duplicate: true });
      }
    }

    const [contact] = await db.insert(contacts).values({
      first_name: first || "Unknown",
      last_name: last,
      email,
      phone: extracted.mobile ?? extracted.office ?? null,
      title: extracted.title ?? null,
      company_id: companyId,
      linkedin_url: extracted.linkedin ? `https://${extracted.linkedin}` : null,
      source: "business_card_scan",
      status: "new",
      notes: extracted.name_ar ? `Arabic name: ${extracted.name_ar}` : null,
      tags: ["card-scan", "event"],
      lead_score: 50,
    }).returning();

    await db.insert(activities).values({
      type: "note",
      title: "Business card scanned",
      body: `New contact captured from card scan. ${extracted.company ? `Company: ${extracted.company}.` : ""}`,
      contact_id: contact.id,
      status: "completed",
      completed_at: new Date(),
      metadata: { extracted, source_image_url },
    });

    res.status(201).json({ contact_id: contact.id, company_id: companyId, duplicate });
  } catch (err: any) {
    console.error("[business-cards] save failed:", err?.message ?? err);
    res.status(500).json({ error: err?.message ?? "save failed" });
  }
});

router.get("/recent", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: contacts.id,
        name: sql<string>`${contacts.first_name} || ' ' || ${contacts.last_name}`,
        company_id: contacts.company_id,
        title: contacts.title,
        score: contacts.lead_score,
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
