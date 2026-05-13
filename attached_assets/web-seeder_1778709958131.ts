/**
 * ProsEngine — Paginated Multi-Agent Web Seeder
 * ──────────────────────────────────────────────────────────────────
 * Crawls a company website, assigns a dedicated Claude AI agent to
 * every page discovered, aggregates all findings into a structured
 * company intelligence profile.
 *
 * Used automatically in the background by:
 *   • Company Intelligence (parallel source)
 *   • Person Intelligence (parallel source when websiteUrl provided)
 *   • Masar Database enrichment (background setImmediate after enrichment)
 *   • POST /api/company-intel/web-seed (standalone on-demand endpoint)
 */

import axios from "axios";
import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || "dummy",
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PageIntelligence {
  url: string;
  pageType: string;
  title: string;
  extractedData: Record<string, unknown>;
  emails: string[];
  phones: string[];
  confidence: string;
}

export interface WebSeederResult {
  success: boolean;
  rootUrl: string;
  pagesAnalyzed: number;
  seedMode: string;
  aggregated: Record<string, unknown>;
  pages: PageIntelligence[];
  allEmails: string[];
  allPhones: string[];
}

export interface WebSeederOptions {
  maxPages?: number;
  seedMode?: "all" | "content" | "products" | "contact";
  timeoutMs?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export async function extractInternalLinks(html: string, baseUrl: string): Promise<string[]> {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    try {
      const href = $(el).attr("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const resolved = new URL(href, baseUrl);
      if (
        resolved.hostname === base.hostname &&
        !resolved.pathname.match(/\.(pdf|jpg|png|gif|zip|css|js|xml|json|svg|ico|woff|ttf)$/i)
      ) {
        resolved.hash = "";
        links.add(resolved.toString());
      }
    } catch { /* ignore malformed URLs */ }
  });
  return [...links].slice(0, 100);
}

export async function classifyPage(url: string): Promise<string> {
  const lower = url.toLowerCase();
  if (/about|من-نحن|about-us|whoweare|قصتنا/i.test(lower)) return "about";
  if (/service|خدمات|product|منتج/i.test(lower)) return "services";
  if (/contact|اتصل|reach/i.test(lower)) return "contact";
  if (/team|فريق|leadership|مدير/i.test(lower)) return "team";
  if (/news|أخبار|blog|مدونة|press/i.test(lower)) return "news";
  if (/careers|وظائف|jobs/i.test(lower)) return "careers";
  if (/project|مشروع|portfolio/i.test(lower)) return "projects";
  return "general";
}

export async function analyzePageWithAI(
  url: string,
  pageText: string,
  pageType: string,
  title: string,
  companyName: string,
): Promise<Record<string, unknown>> {
  const truncatedText = pageText.slice(0, 3000);
  const prompts: Record<string, string> = {
    about: `Extract from this ABOUT page: company founding story, mission, vision, values, history milestones, size, key differentiators. Company: "${companyName}".`,
    services: `Extract from this SERVICES/PRODUCTS page: all services or products with descriptions, pricing signals, target customers, technology used. Company: "${companyName}".`,
    contact: `Extract from this CONTACT page: all physical addresses, phone numbers, emails, office locations, working hours, social media links. Company: "${companyName}".`,
    team: `Extract from this TEAM page: all named executives and their titles. Include both Arabic and English names. Company: "${companyName}".`,
    news: `Extract from this NEWS/BLOG page: recent announcements, contracts won, partnerships, expansions, financial results (last 3 items). Company: "${companyName}".`,
    careers: `Extract from this CAREERS page: number of open positions, departments hiring, office locations, required skills, company culture signals. Company: "${companyName}".`,
    projects: `Extract from this PROJECTS/PORTFOLIO page: key projects, client names, project values, sectors served, notable achievements. Company: "${companyName}".`,
    general: `Extract from this page: company description, services, contact info, team names, key facts. Company: "${companyName}".`,
  };

  const extractPrompt =
    (prompts[pageType] || prompts.general) +
    `\n\nPage URL: ${url}\nPage Title: ${title}\nPage Content:\n"""\n${truncatedText}\n"""\n\nReturn ONLY valid JSON with relevant fields. Do not invent data not present in the text.`;

  try {
    const msg = await Promise.race([
      anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: extractPrompt }],
      }),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 20000)),
    ]);
    const text = (msg as { content: Array<{ type: string; text?: string }> }).content[0]?.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? (JSON.parse(jsonMatch[0]) as Record<string, unknown>) : {};
  } catch {
    return { note: "AI analysis timed out or unavailable for this page" };
  }
}

// ── Main exported function ────────────────────────────────────────────────────

/**
 * runWebSeeder
 *
 * Crawls rootUrl, assigns a Claude AI agent to every discovered page,
 * and returns a structured company intelligence profile.
 *
 * Called automatically (in background) by Company Intel, Person Intel,
 * and the Masar Database enrichment engine. Also powers the standalone
 * POST /api/company-intel/web-seed endpoint.
 */
export async function runWebSeeder(
  rootUrl: string,
  companyName = "",
  options: WebSeederOptions = {},
): Promise<WebSeederResult> {
  const {
    maxPages = 10,
    seedMode = "all",
  } = options;

  const cappedMaxPages = Math.min(Math.max(1, Number(maxPages) || 10), 50);
  const pageResults: PageIntelligence[] = [];
  const visitedUrls = new Set<string>();
  const crawlQueue: string[] = [rootUrl.trim()];

  // ── Phase 1 + 2 + 3: Discover, classify, and analyze each page ─────────────
  while (crawlQueue.length > 0 && visitedUrls.size < cappedMaxPages) {
    const url = crawlQueue.shift()!;
    if (visitedUrls.has(url)) continue;
    visitedUrls.add(url);

    let pageHtml = "";
    let pageText = "";
    let title = "";
    let emails: string[] = [];
    let phones: string[] = [];

    try {
      const r = await axios.get(url, {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "ar-SA,ar;q=0.9,en;q=0.5",
        },
      });
      pageHtml = String(r.data || "");

      const $ = cheerio.load(pageHtml);
      title = $("title").first().text().trim() || $("h1").first().text().trim();
      $("script, style, noscript, nav, footer, header, aside").remove();
      const rawText = $("body").text().replace(/\s{3,}/g, "  ").trim();
      pageText = rawText.slice(0, 5000);

      emails = [...new Set((rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []))].slice(0, 10);
      phones = [...new Set((rawText.match(/(?:\+966|00966|0)[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/g) || []))].slice(0, 10);

      // Add internal links to queue (only on first 5 pages to avoid explosion)
      if (visitedUrls.size <= 5) {
        const links = await extractInternalLinks(pageHtml, url);
        for (const link of links) {
          if (!visitedUrls.has(link) && !crawlQueue.includes(link)) {
            crawlQueue.push(link);
          }
        }
      }
    } catch (crawlErr) {
      pageText = `[Crawl failed: ${crawlErr instanceof Error ? crawlErr.message.slice(0, 60) : "unknown"}]`;
    }

    if (!pageText || pageText.length < 50) continue;

    // Apply seedMode filter
    const pageType = await classifyPage(url);
    if (seedMode === "contact" && pageType !== "contact" && pageType !== "general") continue;
    if (seedMode === "products" && pageType !== "services" && pageType !== "projects") continue;
    if (seedMode === "content" && (pageType === "contact" || pageType === "careers")) continue;

    // Each page gets its own AI analysis agent
    const extractedData = await analyzePageWithAI(url, pageText, pageType, title, companyName || "the company");

    pageResults.push({
      url,
      pageType,
      title,
      extractedData,
      emails,
      phones,
      confidence: pageText.length > 500 ? "high" : "low",
    });
  }

  if (pageResults.length === 0) {
    return {
      success: false,
      rootUrl,
      pagesAnalyzed: 0,
      seedMode,
      aggregated: {},
      pages: [],
      allEmails: [],
      allPhones: [],
    };
  }

  // ── Phase 4: Aggregate all page intelligence ───────────────────────────────
  const allEmails = [...new Set(pageResults.flatMap(p => p.emails))].slice(0, 15);
  const allPhones = [...new Set(pageResults.flatMap(p => p.phones))].slice(0, 15);
  const allPageData = pageResults.map(p => ({
    url: p.url,
    type: p.pageType,
    title: p.title,
    data: p.extractedData,
  }));

  const aggregationPrompt = `You are a Saudi Arabia B2B intelligence analyst. Aggregate the following multi-page web intelligence into a single structured company profile.

Company: ${companyName || "Unknown (infer from data)"}
Root URL: ${rootUrl}
Pages crawled: ${pageResults.length}

All Page Intelligence:
${JSON.stringify(allPageData, null, 2).slice(0, 8000)}

All Emails found: ${allEmails.join(", ") || "none"}
All Phones found: ${allPhones.join(", ") || "none"}

Return ONLY valid JSON with this structure:
{
  "company": {
    "nameEn": "English company name",
    "nameAr": "Arabic name if found",
    "description": "2-3 sentence company description",
    "founded": "year or null",
    "industry": "main industry",
    "website": "${rootUrl}",
    "phone": "primary phone or null",
    "email": "primary email or null",
    "address": "physical address or null"
  },
  "services": ["list of services/products"],
  "team": [{"name": "Full Name", "title": "Title", "nameAr": "Arabic name if found"}],
  "news": [{"headline": "...", "date": "approx", "summary": "..."}],
  "projects": [{"name": "...", "client": "...", "description": "..."}],
  "contacts": {
    "emails": [],
    "phones": [],
    "offices": [],
    "socialMedia": {}
  },
  "intelligence": {
    "companySize": "1-10|11-50|51-200|201-500|500+ or unknown",
    "b2bSignals": ["list of B2B buying signals from site content"],
    "techStack": ["any technology mentions"],
    "keyClients": ["any mentioned clients"],
    "pagesCrawled": ${pageResults.length},
    "seedMode": "${seedMode}"
  }
}`;

  let aggregated: Record<string, unknown> = {};
  try {
    const msg = await Promise.race([
      anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        messages: [{ role: "user", content: aggregationPrompt }],
      }),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("timeout")), 45000)),
    ]);
    const text = (msg as { content: Array<{ type: string; text?: string }> }).content[0]?.text || "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) aggregated = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    aggregated = {
      company: { nameEn: companyName || "Unknown", website: rootUrl, phone: allPhones[0] || null, email: allEmails[0] || null },
      contacts: { emails: allEmails, phones: allPhones },
      intelligence: {
        pagesCrawled: pageResults.length,
        seedMode,
        note: "Aggregation engine timed out — raw page data available in pages array",
      },
    };
  }

  return {
    success: true,
    rootUrl,
    pagesAnalyzed: pageResults.length,
    seedMode,
    aggregated,
    pages: pageResults,
    allEmails,
    allPhones,
  };
}
