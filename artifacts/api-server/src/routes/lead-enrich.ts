import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contacts, companies } from "@workspace/db";
import { eq } from "drizzle-orm";
import { aiJson } from "../lib/ai.js";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// POST /api/lead-enrich/quick — minimal data → fully enriched contact draft
// body: { name?, email?, phone?, company?, linkedin_url?, notes?, save?: boolean }
router.post("/quick", async (req, res) => {
  try {
    const { name = "", email = "", phone = "", company = "", linkedin_url = "", notes = "", save = false } = req.body ?? {};
    const seed = `${name} ${email} ${phone} ${company} ${linkedin_url} ${notes}`.trim();
    if (!seed) return res.status(400).json({ error: "Provide at least one of: name, email, phone, company, linkedin_url" });

    const enriched = await aiJson<any>({
      system: `You are a B2B contact enrichment AI. From minimal seed data you produce a complete plausible contact profile for the GCC region. Output strict JSON only. NEVER fabricate emails or phone numbers — only return real values that were provided as input.`,
      user: `Seed data:
- Name: ${name || "(unknown)"}
- Email: ${email || "(unknown)"}
- Phone: ${phone || "(unknown)"}
- Company: ${company || "(unknown)"}
- LinkedIn: ${linkedin_url || "(unknown)"}
- Notes: ${notes || "(unknown)"}

Produce JSON: {"first_name":"...","last_name":"...","email":"<only if provided>","phone":"<only if provided>","title":"plausible title","linkedin_url":"<only if provided or guess based on name>","company":{"name":"...","industry":"e.g. Banking, Real Estate, FMCG","country":"UAE|KSA|Qatar|etc","size":"1-10|11-50|51-200|201-1000|1000+","website":"<plausible domain>"},"seniority":"junior|mid|senior|c-level","tags":["3-5 tags"],"persona":"e.g. Decision Maker / Champion / Influencer","summary":"2-sentence profile summary","next_actions":[{"action":"call|email|whatsapp|linkedin","reason":"why"}],"lead_score":0-100,"confidence":0-100,"enriched_fields":["which fields you added"]}`,
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

export default router;
