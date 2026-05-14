/**
 * /api/prosengine — Data Seeder endpoints (Doc 3 §7)
 *
 *   POST /api/prosengine/seed          — text mode: AI generates Saudi company/executive records
 *   POST /api/prosengine/analyze-url   — analyze a URL and produce tailored Q&A
 *   POST /api/prosengine/seed-from-url — extract companies from URL based on user answers
 *   POST /api/prosengine/chat          — AI chat about results
 */

import { Router } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger.js";
import { scraperFetch } from "../lib/enrichment/connectors/web-scraper.js";
import { synthesizeGeminiDirect } from "../lib/engines/_ai.js";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

async function runWebSeeder(url: string, query: string, opts: { maxPages?: number } = {}): Promise<{ text: string } | null> {
  try {
    const scraperBase = process.env.ENRICHMENT_SCRAPER_URL || "http://localhost:8000/scraper";
    const resp = await fetch(`${scraperBase}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, maxPages: opts.maxPages ?? 5, query }),
      signal: AbortSignal.timeout(20000),
    });
    if (resp.ok) {
      const data = await resp.json() as any;
      return { text: data.text || data.content || "" };
    }
  } catch { /* fall through */ }

  try {
    const text = await scraperFetch(url);
    return { text: text?.slice(0, 8000) || "" };
  } catch { return null; }
}

async function searchWithGemini(prompt: string): Promise<string | null> {
  try {
    return await synthesizeGeminiDirect(prompt, 1500);
  } catch { return null; }
}

// ── POST /api/prosengine/seed — text mode: AI generates Saudi company/executive records ──────────

router.post("/seed", async (req, res) => {
  const { prompt, industry, city, recordType, count, extraContext } = req.body;

  const systemPrompt = "You are a Saudi Arabia B2B data specialist. Generate realistic Saudi company and executive records for prospecting. Use real Saudi business naming conventions in both Arabic and English.";

  const userPrompt = `Generate ${count || 20} Saudi Arabia ${recordType || "company"} records.

Request: ${prompt || `${industry || "mixed"} companies in ${city || "Saudi Arabia"}`}
Industry: ${industry || "All sectors"}
City/Region: ${city || "All Saudi Arabia"}
Record Type: ${recordType || "companies"}
${extraContext ? `Additional context: ${extraContext}` : ""}

IMPORTANT:
- Generate realistic Saudi company names (in Arabic and English)
- Include real-sounding Saudi executive names (Arabic script + English transliteration)
- Use realistic Saudi phone numbers (+966 5X XXXX XXXX or +966 1X XXXX XXXX)
- Use realistic Saudi email patterns (name@company.com.sa)
- Include variety of cities: Riyadh, Jeddah, Dammam, Khobar, etc.
- For companies: include companyName, industry, city, phone, email, website, description, employees, revenue
- For executives: include fullName, title, company, phone, email, city, industry, bio
- Revenue in SAR (realistic for Saudi SMEs: SAR 500K - SAR 500M range)

Return ONLY valid JSON:
{
  "records": [...array of ${count || 20} records...],
  "summary": "Brief description of what was generated",
  "market_insight": "One insight about this Saudi market segment",
  "count": ${count || 20},
  "fields": ["list of field names used"]
}`;

  try {
    const r = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 4000,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 45000)),
    ]);

    const text = r.choices[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      res.status(500).json({ error: "AI generation failed to return valid JSON" });
      return;
    }
    res.json(JSON.parse(match[0]));
  } catch (err) {
    logger.error({ err }, "prosengine/seed error");
    res.status(500).json({ error: "Generation failed" });
  }
});

// ── POST /api/prosengine/analyze-url — analyze a URL and generate tailored questions ────────────

router.post("/analyze-url", async (req, res) => {
  const { url, description } = req.body;

  if (!url?.trim()) { res.status(400).json({ error: "url is required" }); return; }

  try {
    const crawlRes = await runWebSeeder(url, "", { maxPages: 3 });
    const siteText = crawlRes?.text || "";

    const analysisPrompt = `Analyze this URL: ${url}
${description ? `Description: ${description}` : ""}
Sample content from website: ${siteText.slice(0, 3000)}

Return JSON:
{
  "siteType": "company-directory / trade-association / chamber / yellow-pages / etc",
  "companiesDetected": "estimated number or description of what's listed",
  "pageTitle": "website title",
  "url": "${url}",
  "questions": [
    {
      "id": "unique_id",
      "question": "question text",
      "type": "choice",
      "options": ["option1", "option2", "option3"]
    }
  ]
}

Generate 3-5 focused questions that help extract exactly the right companies. Examples:
- "Which cities should we focus on?" (choice: Riyadh / Jeddah / Dammam / All)
- "What industry sector?" (choice list)
- "Do you need contact information?" (boolean)
- "Any specific keywords to filter by?" (text)`;

    const geminiResult = await searchWithGemini(analysisPrompt).catch(() => null);
    let result: string | null = null;

    if (geminiResult && geminiResult.includes("{")) {
      result = geminiResult;
    } else {
      const r = await Promise.race([
        openai.chat.completions.create({
          model: "gpt-4o",
          max_completion_tokens: 800,
          messages: [{ role: "user", content: analysisPrompt }],
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 30000)),
      ]);
      result = r.choices[0]?.message?.content || null;
    }

    const match = String(result || "").match(/\{[\s\S]*\}/);
    if (!match) { res.status(500).json({ error: "URL analysis failed" }); return; }
    res.json(JSON.parse(match[0]));
  } catch (err) {
    logger.error({ err }, "prosengine/analyze-url error");
    res.status(500).json({ error: "URL analysis failed" });
  }
});

// ── POST /api/prosengine/seed-from-url — extract companies based on user answers ─────────────────

router.post("/seed-from-url", async (req, res) => {
  const { url, answers, description } = req.body;

  if (!url?.trim()) { res.status(400).json({ error: "url is required" }); return; }

  try {
    const queryTerms = Object.values(answers as Record<string, string>).join(" ");
    const crawlRes = await runWebSeeder(url, queryTerms, { maxPages: 15 });
    const siteText = crawlRes?.text || "";

    const answerContext = Object.entries(answers as Record<string, string>)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const extractPrompt = `Extract Saudi company records from this website: ${url}
${description ? `Context: ${description}` : ""}

User preferences:
${answerContext}

Website content:
${siteText.slice(0, 6000)}

Extract ALL companies/businesses matching the user's preferences. For each record include:
- companyName (or fullName for executives)
- phone, email, website
- city, address
- industry / type
- description
- any other relevant fields from the page

Return JSON:
{
  "records": [...extracted records...],
  "summary": "X companies extracted from [site description]",
  "market_insight": "insight about this data",
  "count": number,
  "url": "${url}"
}`;

    const r = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o",
        max_completion_tokens: 4000,
        messages: [{ role: "user", content: extractPrompt }],
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 45000)),
    ]);

    const text = r.choices[0]?.message?.content || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) { res.status(500).json({ error: "Extraction failed" }); return; }
    res.json(JSON.parse(match[0]));
  } catch (err) {
    logger.error({ err }, "prosengine/seed-from-url error");
    res.status(500).json({ error: "Company extraction failed" });
  }
});

// ── POST /api/prosengine/chat — AI chat about seeder results ─────────────────────────────────────

router.post("/chat", async (req, res) => {
  const { message, context, mode } = req.body;

  const systemPrompt = mode === "website"
    ? "You are a Saudi Arabia B2B intelligence analyst specializing in analyzing company website data. Help the user understand and act on the intelligence gathered."
    : mode === "seeder"
    ? "You are a Saudi Arabia B2B data specialist. Help the user understand, analyze, and leverage the generated prospecting data."
    : "You are a Saudi Arabia B2B intelligence analyst. Answer questions about the research data provided.";

  try {
    const r = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 800,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context:\n${context}\n\nUser question: ${message}` },
      ],
    });
    res.json({ reply: r.choices[0]?.message?.content || "I couldn't generate a response." });
  } catch (err) {
    logger.error({ err }, "prosengine/chat error");
    res.status(500).json({ reply: "Sorry, I couldn't process that request." });
  }
});

export default router;
