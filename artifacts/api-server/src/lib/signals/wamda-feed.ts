import * as cheerio from "cheerio";
import { db, signals, companies } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { logger } from "../logger.js";

const FEED_URL = "https://www.wamda.com/feed";
const UA = "Mozilla/5.0 (compatible; NexFlowSignals/1.0; +https://nexflow.app)";

type SignalKind =
  | "funding_round"
  | "exec_move"
  | "expansion"
  | "hiring"
  | "product_launch"
  | "news";

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pub_date: string;
  categories: string[];
}

interface IngestResult {
  fetched: number;
  inserted: number;
  matched_to_company: number;
  skipped_duplicate: number;
  errors: number;
}

function classify(title: string, description: string): SignalKind {
  const t = `${title} ${description}`.toLowerCase();
  if (
    /\b(raises?|raised|funding|series\s+[abcde]|seed round|pre-seed|closes?\s+\$|secures?\s+\$|backed by|investment of)\b/.test(
      t,
    )
  )
    return "funding_round";
  if (
    /\b(appoints?|appointed|names? new|hires?\s+(ceo|cto|cfo|coo|chief)|joins as|steps down|new ceo)\b/.test(
      t,
    )
  )
    return "exec_move";
  if (/\b(expands? (into|to)|launches? in|enters? (the )?(saudi|uae|ksa|gcc|egypt|qatar|kuwait|bahrain|oman))\b/.test(t))
    return "expansion";
  if (/\b(hiring|recruiting|new role|opens? \d+ (positions|jobs)|to add \d+ (engineers|employees))\b/.test(t))
    return "hiring";
  if (/\b(launches?|unveils?|introduces?|debuts?|releases?)\b/.test(t)) return "product_launch";
  return "news";
}

function scoreFor(kind: SignalKind): number {
  switch (kind) {
    case "funding_round":
      return 0.95;
    case "exec_move":
      return 0.8;
    case "expansion":
      return 0.75;
    case "product_launch":
      return 0.6;
    case "hiring":
      return 0.55;
    default:
      return 0.4;
  }
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchFeed(): Promise<FeedItem[]> {
  const res = await fetch(FEED_URL, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml,application/xml;q=0.9,*/*;q=0.8" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Wamda feed responded ${res.status}`);
  }
  const xml = await res.text();
  const $ = cheerio.load(xml, { xmlMode: true });
  const items: FeedItem[] = [];
  $("item").each((_, el) => {
    const $el = $(el);
    const title = stripHtml($el.find("title").first().text());
    const link = $el.find("link").first().text().trim();
    const description = stripHtml($el.find("description").first().text());
    const pub_date = $el.find("pubDate").first().text().trim();
    const categories: string[] = [];
    $el.find("category").each((_, c) => {
      const v = $(c).text().trim();
      if (v) categories.push(v);
    });
    if (title && link) {
      items.push({ title, link, description, pub_date, categories });
    }
  });
  return items;
}

/**
 * Try to match a feed item to a Company we already track.
 * Strategy: collect uppercase or capitalised tokens from the title that look
 * like a company name (≥3 chars, not stop-words), then look them up in
 * companies.name with case-insensitive containment. Returns the first match.
 */
async function matchCompany(title: string, orgId: string): Promise<string | null> {
  const STOP = new Set([
    "the","and","for","with","from","into","that","this","into","over","under","plans","plan",
    "raises","raised","funds","funding","series","round","ceo","cto","cfo","coo","new","names",
    "after","before","more","than","says","said","saudi","uae","ksa","gcc","egypt","qatar",
    "report","reports","launches","launch","expands","expand","appoints","appointed","backed",
    "secures","closes","close","backed","wamda","mena","arabia","emirates","start","startup",
    "startups","fintech","health","tech","series","seed","preseed","pre","gulf","yesterday",
    "today","may","june","july","aug","sept","oct","nov","dec","jan","feb","mar","apr",
  ]);
  // Pull "Word" or "Multi Word Cap" sequences — 1-3 token names
  const matches = title.match(/\b[A-Z][A-Za-z0-9'&-]{2,}(?:\s+[A-Z][A-Za-z0-9'&-]+){0,2}\b/g) ?? [];
  const candidates = Array.from(
    new Set(
      matches
        .map((m) => m.trim())
        .filter((m) => {
          const first = m.split(" ")[0]!.toLowerCase();
          return !STOP.has(first) && m.length >= 3;
        }),
    ),
  ).slice(0, 6);

  for (const cand of candidates) {
    try {
      const rows = await db
        .select({ id: companies.id })
        .from(companies)
        .where(and(eq(companies.org_id, orgId), sql`lower(${companies.name}) like ${"%" + cand.toLowerCase() + "%"}`))
        .limit(1);
      if (rows.length > 0) return rows[0]!.id;
    } catch {
      // ignore and try next
    }
  }
  return null;
}

/**
 * Pull the Wamda RSS feed and upsert each item into the signals table.
 * Idempotent on source_url + org_id.
 */
export async function ingestWamdaFeed(orgId = "default"): Promise<IngestResult> {
  const result: IngestResult = {
    fetched: 0,
    inserted: 0,
    matched_to_company: 0,
    skipped_duplicate: 0,
    errors: 0,
  };

  let items: FeedItem[];
  try {
    items = await fetchFeed();
  } catch (err: any) {
    logger.error({ err: err?.message ?? String(err) }, "[wamda] fetch failed");
    throw err;
  }
  result.fetched = items.length;

  for (const item of items) {
    try {
      // Idempotent on source_url within the org
      const existing = await db
        .select({ id: signals.id })
        .from(signals)
        .where(and(eq(signals.org_id, orgId), eq(signals.source_url, item.link)))
        .limit(1);
      if (existing.length > 0) {
        result.skipped_duplicate++;
        continue;
      }

      const kind = classify(item.title, item.description);
      const company_id = await matchCompany(item.title, orgId);
      if (company_id) result.matched_to_company++;

      // Trim body so we don't store the entire article
      const body =
        item.description.length > 800
          ? item.description.slice(0, 800).trimEnd() + "…"
          : item.description;

      await db.insert(signals).values({
        org_id: orgId,
        company_id: company_id ?? undefined,
        contact_id: undefined,
        type: kind,
        title: item.title.slice(0, 280),
        body,
        score: scoreFor(kind),
        status: "new",
        source_url: item.link,
      });
      result.inserted++;
    } catch (err: any) {
      result.errors++;
      logger.warn({ err: err?.message ?? String(err), link: item.link }, "[wamda] item insert failed");
    }
  }

  logger.info(result, "[wamda] ingest complete");
  return result;
}
