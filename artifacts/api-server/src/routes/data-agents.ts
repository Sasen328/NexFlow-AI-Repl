/**
 * /api/data-agents — Two AI agent endpoints:
 *   POST /validate — Field-level data quality check (format, completeness, ICP)
 *   POST /verify   — Live multi-source verification against the web
 */
import { Router } from "express";
import { aiChat, aiJson } from "../lib/ai.js";

const router = Router();

// ─── Types ─────────────────────────────────────────────────────────────────
interface ContactInput {
  first_name?: string;
  last_name?: string;
  name_en?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  linkedin?: string;
  linkedin_url?: string;
  website?: string;
  company?: string;
  title?: string;
  country?: string;
  city?: string;
  industry?: string;
  industry_guess?: string;
  [key: string]: any;
}

interface FieldResult {
  ok: boolean;
  value: string | null;
  issue?: string;
  suggestion?: string;
  confidence?: number;
}

// ─── POST /validate ────────────────────────────────────────────────────────
// Fast AI-powered field validation — no external calls, instant result
router.post("/validate", async (req, res) => {
  try {
    const contact: ContactInput = req.body?.contact ?? req.body ?? {};

    const name = contact.name_en
      ?? [contact.first_name, contact.last_name].filter(Boolean).join(" ")
      ?? "";
    const email    = contact.email ?? null;
    const phone    = contact.mobile ?? contact.phone ?? null;
    const linkedin = (contact.linkedin ?? contact.linkedin_url ?? "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    const website  = contact.website ?? null;
    const company  = contact.company ?? null;
    const country  = contact.country ?? null;
    const industry = contact.industry ?? contact.industry_guess ?? null;

    const fields: Record<string, FieldResult> = {};
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 0;
    let total = 0;

    // ── Name ────────────────────────────────────────────────────────────────
    total++;
    if (name.trim().length >= 2) {
      const hasFirst = name.trim().split(/\s+/).length >= 1;
      const hasLast  = name.trim().split(/\s+/).length >= 2;
      fields.name = {
        ok: true,
        value: name,
        confidence: hasLast ? 100 : 85,
        issue: hasLast ? undefined : "Only one name component — last name missing",
      };
      score++;
      if (!hasLast) recommendations.push("Add the contact's last name for full identification");
    } else {
      fields.name = { ok: false, value: name || null, issue: "Name is empty or too short" };
      issues.push("Contact name is required");
    }

    // ── Email ────────────────────────────────────────────────────────────────
    if (email) {
      total++;
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      const corporateDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
      if (!emailRe.test(email)) {
        fields.email = { ok: false, value: email, issue: "Invalid email format", confidence: 0 };
        issues.push(`Email "${email}" has an invalid format`);
      } else {
        const domain = email.split("@")[1] ?? "";
        const isPersonal = corporateDomains.includes(domain.toLowerCase());
        fields.email = {
          ok: true,
          value: email,
          confidence: isPersonal ? 75 : 95,
          issue: isPersonal ? "Personal email domain — corporate email preferred for B2B" : undefined,
        };
        if (isPersonal) recommendations.push("Try to obtain a corporate email address for B2B outreach");
        score++;
      }
    } else {
      issues.push("Email address missing — required for outreach");
      recommendations.push("Obtain an email address for this contact");
      fields.email = { ok: false, value: null, issue: "Email address missing" };
    }

    // ── Phone ────────────────────────────────────────────────────────────────
    if (phone) {
      total++;
      const digitsOnly = phone.replace(/[\s\-().]/g, "");
      const intlRe = /^\+[1-9]\d{7,14}$/;
      const gccPrefixes = ["+966", "+971", "+974", "+965", "+973", "+968"];
      if (!intlRe.test(digitsOnly)) {
        fields.phone = {
          ok: false,
          value: phone,
          issue: "Phone not in international format",
          suggestion: "Format as +966XXXXXXXXX (KSA), +971XXXXXXXXX (UAE), etc.",
          confidence: 40,
        };
        issues.push("Phone number not in international format");
      } else {
        const isGcc = gccPrefixes.some((p) => digitsOnly.startsWith(p));
        fields.phone = {
          ok: true,
          value: phone,
          confidence: isGcc ? 98 : 85,
          issue: isGcc ? undefined : "Phone not from a GCC country code",
        };
        if (!isGcc) recommendations.push("Confirm region — phone country code is not GCC");
        score++;
      }
    } else {
      fields.phone = { ok: false, value: null, issue: "Phone number missing" };
      issues.push("Phone number missing");
      recommendations.push("Obtain mobile or office phone for call engagement");
    }

    // ── LinkedIn ─────────────────────────────────────────────────────────────
    if (linkedin) {
      total++;
      const liRe = /^(www\.)?linkedin\.com\/in\/[A-Za-z0-9_%-]{3,}(\/.*)?$/;
      if (!liRe.test(linkedin)) {
        fields.linkedin = {
          ok: false,
          value: linkedin,
          issue: "LinkedIn URL format invalid",
          suggestion: "Should be linkedin.com/in/username",
          confidence: 10,
        };
        issues.push("LinkedIn URL format is invalid — may be incorrect");
      } else {
        const slug = (linkedin.match(/linkedin\.com\/in\/([A-Za-z0-9_%-]+)/i)?.[1] ?? "").toLowerCase();
        const nameParts = name.toLowerCase().split(/\s+/);
        const slugMatchesName = nameParts.some((p) => slug.includes(p) || p.includes(slug.slice(0, 4)));
        fields.linkedin = {
          ok: true,
          value: linkedin,
          confidence: slugMatchesName ? 88 : 60,
          issue: !slugMatchesName
            ? "LinkedIn slug does not appear to match this person's name — verify it is the correct profile"
            : undefined,
        };
        if (!slugMatchesName) {
          issues.push("LinkedIn URL slug does not match the contact's name — needs verification");
          recommendations.push("Manually verify this LinkedIn profile belongs to the correct person");
        }
        score++;
      }
    } else {
      fields.linkedin = { ok: false, value: null, issue: "LinkedIn URL missing" };
      recommendations.push("Find and add the contact's LinkedIn profile for social selling");
    }

    // ── Company ───────────────────────────────────────────────────────────────
    total++;
    if (company && company.trim().length >= 2) {
      fields.company = { ok: true, value: company, confidence: 90 };
      score++;
    } else {
      fields.company = { ok: false, value: company || null, issue: "Company name missing or too short" };
      issues.push("Company name missing");
    }

    // ── Country / Region ──────────────────────────────────────────────────────
    if (country) {
      total++;
      const gccCountries = ["saudi arabia", "ksa", "uae", "united arab emirates", "qatar", "bahrain", "kuwait", "oman"];
      const isGcc = gccCountries.some((c) => (country ?? "").toLowerCase().includes(c));
      fields.country = {
        ok: true,
        value: country,
        confidence: 95,
        issue: !isGcc ? "Contact is outside GCC target region" : undefined,
      };
      if (!isGcc) issues.push(`Country "${country}" is outside GCC target region`);
      score++;
    }

    // ── Website ───────────────────────────────────────────────────────────────
    if (website) {
      total++;
      const webRe = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;
      if (webRe.test(website)) {
        fields.website = { ok: true, value: website, confidence: 90 };
        score++;
      } else {
        fields.website = { ok: false, value: website, issue: "Website URL format invalid" };
        issues.push("Website URL format invalid");
      }
    }

    // ── AI-powered summary using Claude/GPT ────────────────────────────────
    let aiSummary: string | null = null;
    let aiRecommendations: string[] = [];
    try {
      const aiResult = await aiJson<{ summary: string; recommendations: string[] }>({
        system: `You are a GCC B2B CRM data quality specialist. Analyze the contact data and provide a brief data quality assessment and recommendations. Be concise and specific. Return JSON only.`,
        user: `Contact data to validate:
Name: ${name || "missing"}
Email: ${email || "missing"}  
Phone: ${phone || "missing"}
LinkedIn: ${linkedin || "missing"}
Company: ${company || "missing"}
Country: ${country || "missing"}
Industry: ${industry || "missing"}

Known issues found: ${issues.join("; ") || "none"}

Return JSON: { "summary": "1-2 sentence data quality summary", "recommendations": ["up to 3 specific actionable recommendations"] }`,
        provider: "openai",
        fallback: {
          summary: `Contact has ${score}/${total} fields validated. ${issues.length > 0 ? `Issues: ${issues.slice(0, 2).join(", ")}.` : "Data quality is acceptable."}`,
          recommendations: recommendations.slice(0, 3),
        },
      });
      aiSummary = aiResult.summary;
      aiRecommendations = aiResult.recommendations ?? [];
    } catch {
      aiSummary = `${score}/${total} fields validated. ${issues.length} issues found.`;
      aiRecommendations = recommendations.slice(0, 3);
    }

    const overallScore = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade =
      overallScore >= 90 ? "A" :
      overallScore >= 75 ? "B" :
      overallScore >= 60 ? "C" :
      overallScore >= 40 ? "D" : "F";

    res.json({
      valid: score === total && issues.length === 0,
      overall_score: overallScore,
      grade,
      fields,
      issues,
      recommendations: aiRecommendations.length > 0 ? aiRecommendations : recommendations,
      ai_summary: aiSummary,
      fields_checked: total,
      fields_passed: score,
    });
  } catch (err: any) {
    req.log?.error?.({ err }, "[data-agents] validate failed");
    res.status(500).json({ error: err?.message ?? "Validation failed" });
  }
});

// ─── POST /verify ───────────────────────────────────────────────────────────
// Live multi-source verification using Perplexity + Gemini
router.post("/verify", async (req, res) => {
  try {
    const contact: ContactInput = req.body?.contact ?? req.body ?? {};

    const name = contact.name_en
      ?? [contact.first_name, contact.last_name].filter(Boolean).join(" ")
      ?? "";
    const company = contact.company ?? null;
    const title   = contact.title   ?? null;
    const linkedin = (contact.linkedin ?? contact.linkedin_url ?? "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "") || null;
    const email   = contact.email ?? null;
    const website = contact.website ?? null;

    if (!name) {
      return res.status(400).json({ error: "Contact name is required for verification" });
    }

    const t0 = Date.now();

    // ── Run 3 parallel verification probes ─────────────────────────────────
    const [personVerify, companyVerify, linkedinVerify] = await Promise.all([
      // Probe 1: Person existence & role verification
      (async () => {
        try {
          const text = await aiChat({
            provider: "perplexity",
            system: `You are a GCC B2B contact verification specialist. Your job is to verify whether a contact's information is accurate using public sources. Be precise and factual. Only report what you find — never guess.`,
            user: `Verify this contact:
Name: ${name}
Title: ${title ?? "unknown"}
Company: ${company ?? "unknown"}
Email: ${email ?? "unknown"}

Tasks:
1. Does this person exist in public sources? (LinkedIn, company website, news)
2. Is their title accurate at this company?
3. Are there any red flags (name mismatch, company mismatch, inactive)?
4. What is the most likely correct email format for this company?

Return bullet points with your findings. Be specific about confidence level.`,
            maxTokens: 600,
          });
          return { text: text ?? "", ms: Date.now() - t0, ok: Boolean(text) };
        } catch {
          return { text: "", ms: Date.now() - t0, ok: false };
        }
      })(),

      // Probe 2: Company verification
      (async () => {
        if (!company) return { text: "", ms: 0, ok: false };
        try {
          const text = await aiChat({
            provider: "perplexity",
            system: "You are a company intelligence analyst for GCC markets. Verify company details using public sources.",
            user: `Verify this company:
Company: ${company}
Website: ${website ?? "unknown"}
Country: ${contact.country ?? "unknown"}

Tasks:
1. Does this company exist? Is it active?
2. Is the website correct for this company?
3. Approximate company size and industry?
4. Any notable news or risk flags?

Return bullet points. Be specific about confidence.`,
            maxTokens: 500,
          });
          return { text: text ?? "", ms: Date.now() - t0, ok: Boolean(text) };
        } catch {
          return { text: "", ms: 0, ok: false };
        }
      })(),

      // Probe 3: LinkedIn profile verification
      (async () => {
        if (!linkedin) return { text: "", ms: 0, ok: false };
        try {
          const text = await aiChat({
            provider: "perplexity",
            system: "You are a LinkedIn profile verification specialist.",
            user: `Verify this LinkedIn profile:
URL: linkedin.com/in/${linkedin.replace(/^(www\.)?linkedin\.com\/in\//, "")}
Expected name: ${name}
Expected company: ${company ?? "unknown"}
Expected title: ${title ?? "unknown"}

Tasks:
1. Does this LinkedIn profile exist?
2. Does the profile name match "${name}"?
3. Does it show employment at "${company ?? "unknown"}"?
4. Is this the correct person or a different person with similar name?

Return bullet points with confidence level.`,
            maxTokens: 400,
          });
          return { text: text ?? "", ms: Date.now() - t0, ok: Boolean(text) };
        } catch {
          return { text: "", ms: 0, ok: false };
        }
      })(),
    ]);

    // ── AI synthesis of verification results ──────────────────────────────
    const synthesisInput = `
CONTACT TO VERIFY:
Name: ${name}
Title: ${title ?? "—"}
Company: ${company ?? "—"}
Email: ${email ?? "—"}
LinkedIn: ${linkedin ?? "—"}

PERSON VERIFICATION FINDINGS:
${personVerify.text || "No data retrieved"}

COMPANY VERIFICATION FINDINGS:
${companyVerify.text || "No data retrieved"}

LINKEDIN VERIFICATION FINDINGS:
${linkedinVerify.text || "Not checked (no LinkedIn provided)"}
`;

    let synthesis: any = null;
    try {
      synthesis = await aiJson<{
        verified: boolean;
        confidence: number;
        person_confirmed: boolean;
        company_confirmed: boolean;
        linkedin_confirmed: boolean | null;
        discrepancies: string[];
        risk_flags: string[];
        verified_fields: Record<string, { confirmed: boolean; note: string }>;
        recommendation: string;
      }>({
        system: `You are a senior CRM data verification agent. Synthesise all verification intelligence and produce a final verification report. Be accurate — only mark as "confirmed" if there is real evidence. Return JSON only.`,
        user: `${synthesisInput}

Return JSON:
{
  "verified": boolean (true if core identity confirmed with good confidence),
  "confidence": 0-100,
  "person_confirmed": boolean,
  "company_confirmed": boolean,
  "linkedin_confirmed": boolean|null (null if not checked),
  "discrepancies": ["any mismatches found"],
  "risk_flags": ["any concerns or red flags"],
  "verified_fields": {
    "name": { "confirmed": boolean, "note": "what was found" },
    "title": { "confirmed": boolean, "note": "what was found" },
    "company": { "confirmed": boolean, "note": "what was found" },
    "email": { "confirmed": boolean, "note": "what was found" },
    "linkedin": { "confirmed": boolean|null, "note": "what was found" }
  },
  "recommendation": "1 sentence: approve / verify manually / flag for review"
}`,
        provider: "anthropic",
        fallback: {
          verified: false,
          confidence: 0,
          person_confirmed: false,
          company_confirmed: false,
          linkedin_confirmed: null,
          discrepancies: [],
          risk_flags: ["Verification could not be completed — AI provider unavailable"],
          verified_fields: {},
          recommendation: "Manual verification required — automated check failed",
        },
      });
    } catch {
      synthesis = {
        verified: false,
        confidence: 0,
        person_confirmed: personVerify.ok,
        company_confirmed: companyVerify.ok,
        linkedin_confirmed: linkedinVerify.ok ? true : null,
        discrepancies: [],
        risk_flags: [],
        verified_fields: {},
        recommendation: "Partial verification — review raw findings below",
      };
    }

    res.json({
      ...synthesis,
      sources_checked: [
        personVerify.ok  ? "perplexity/person-search"  : null,
        companyVerify.ok ? "perplexity/company-search"  : null,
        linkedinVerify.ok ? "perplexity/linkedin-check" : null,
      ].filter(Boolean),
      raw_findings: {
        person:  personVerify.text  || null,
        company: companyVerify.text || null,
        linkedin: linkedinVerify.text || null,
      },
      duration_ms: Date.now() - t0,
    });
  } catch (err: any) {
    req.log?.error?.({ err }, "[data-agents] verify failed");
    res.status(500).json({ error: err?.message ?? "Verification failed" });
  }
});

export default router;
