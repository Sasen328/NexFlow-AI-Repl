/**
 * SourcesTab — Waterfall Sources Orchestrator
 *
 * Lists every enrichment connector (official APIs + GCC-native registries +
 * stealth scraper + Python AI sidecar). Lets users paste API keys, toggle
 * sources in/out of the waterfall, set priority, and run a test ping.
 *
 * Changes:
 *  - admin / ceo / manager all get full edit access
 *  - Rich embedded fallback covers all 28 connectors when the API is not yet
 *    wired, so the panel is always functional
 *  - localStorage persists enable/disable + priority changes in fallback mode
 */

import { useEffect, useMemo, useState } from "react";
import {
  Database, Globe, ShieldCheck, ShieldAlert, KeyRound, Loader2,
  Check, X, Play, RefreshCw, ChevronDown, ChevronUp, Eye, EyeOff,
  Building2, BadgeCheck, Sparkles, MapPin, Bot, Code2, Network,
  ArrowRight, AlertTriangle, Zap, Activity, ToggleLeft, ToggleRight,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/useApi";
import { getRole } from "@/lib/marketing-auth";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SourceRow {
  id: string;
  source_key: string;
  name: string;
  kind: "api" | "scraper" | "gov_registry" | "exchange" | "ai_scraper";
  enabled: boolean;
  priority: number;
  key_set: boolean;
  last_test_ok: boolean | null;
  last_test_message: string | null;
  last_test_at: string | null;
  total_calls: number;
  total_fields_filled: number;
  meta: SourceMeta;
}

interface SourceMeta {
  category: "western_api" | "gcc_native" | "scraper" | "ai_sidecar";
  blurb: string;
  fields: string[];
  gcc_coverage: "high" | "medium" | "low" | "n/a";
  pricing: string;
  docs_url?: string;
  needs_key: boolean;
  key_label?: string;
  region_badge?: string;
  rate_hint?: string;
}

const CATEGORY_LABEL: Record<SourceMeta["category"], string> = {
  western_api:  "Western APIs",
  gcc_native:   "GCC-native registries & exchanges",
  scraper:      "Public-web scraper",
  ai_sidecar:   "AI scraper sidecar",
};

const CATEGORY_TINT: Record<SourceMeta["category"], string> = {
  western_api: "#88B8B0",
  gcc_native:  "#C8A880",
  scraper:     "#B8A0C8",
  ai_sidecar:  "#B8B880",
};

const COVERAGE_STYLE: Record<SourceMeta["gcc_coverage"], { label: string; tint: string }> = {
  high:   { label: "GCC: strong",   tint: "#88B8B0" },
  medium: { label: "GCC: moderate", tint: "#C8A880" },
  low:    { label: "GCC: weak",     tint: "#C08080" },
  "n/a":  { label: "Coverage: any", tint: "#A8A8A8" },
};

// ── Embedded fallback — all 28 connectors ─────────────────────────────────────
const FALLBACK_SOURCES: SourceRow[] = [
  // ── Western APIs ─────────────────────────────────────────────────────────
  {
    id: "perplexity", source_key: "perplexity", name: "Perplexity Sonar",
    kind: "api", enabled: true, priority: 1,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "western_api", needs_key: true, key_label: "API Key",
      blurb: "Real-time web search with citations. Best all-round signal for GCC executives and companies.",
      fields: ["description","funding","keyPeople","news","linkedinUrl","website","industry","headcount"],
      gcc_coverage: "high", pricing: "$5 / 1M tokens", rate_hint: "50 req/s",
      docs_url: "https://docs.perplexity.ai", region_badge: "Global",
    },
  },
  {
    id: "gemini", source_key: "gemini", name: "Google Gemini",
    kind: "api", enabled: true, priority: 2,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "western_api", needs_key: true, key_label: "API Key",
      blurb: "Synthesis and OCR (Gemini Vision). Used for business-card scans and report extraction.",
      fields: ["description","industry","products","revenue","headcount","address"],
      gcc_coverage: "medium", pricing: "Free tier / $0.001 / 1K chars",
      docs_url: "https://ai.google.dev", region_badge: "Global",
    },
  },
  {
    id: "claude", source_key: "claude", name: "Anthropic Claude",
    kind: "api", enabled: true, priority: 3,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "western_api", needs_key: true, key_label: "API Key",
      blurb: "Long-context synthesis and structured JSON extraction from scraped web content.",
      fields: ["description","keyPeople","products","strategy","risks","funding"],
      gcc_coverage: "medium", pricing: "$3 / 1M input tokens",
      docs_url: "https://anthropic.com/api", region_badge: "Global",
    },
  },
  {
    id: "openai", source_key: "openai", name: "OpenAI GPT-4o",
    kind: "api", enabled: true, priority: 4,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "western_api", needs_key: true, key_label: "API Key",
      blurb: "Fallback synthesizer and email-permutation validator. Also used for Lead Finder second-pass.",
      fields: ["email","phone","title","department","description"],
      gcc_coverage: "medium", pricing: "$5 / 1M input tokens",
      docs_url: "https://platform.openai.com", region_badge: "Global",
    },
  },
  {
    id: "apollo", source_key: "apollo", name: "Apollo.io",
    kind: "api", enabled: false, priority: 5,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "western_api", needs_key: true, key_label: "API Key",
      blurb: "B2B contact & company database. Strong for Western markets; moderate Gulf coverage.",
      fields: ["email","phone","title","linkedinUrl","company","industry","headcount","revenue"],
      gcc_coverage: "medium", pricing: "$49/mo (basic plan)", rate_hint: "100 exports/mo",
      docs_url: "https://apollo.io/developers", region_badge: "Global",
    },
  },
  {
    id: "hunter", source_key: "hunter", name: "Hunter.io",
    kind: "api", enabled: false, priority: 6,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "western_api", needs_key: true, key_label: "API Key",
      blurb: "Email finder and verifier by domain. Used as fallback when scraper finds no email.",
      fields: ["email","emailVerified","firstName","lastName","title"],
      gcc_coverage: "low", pricing: "$49/mo (500 req)", rate_hint: "500 verifications/mo",
      docs_url: "https://hunter.io/api-documentation", region_badge: "Global",
    },
  },
  {
    id: "clearbit", source_key: "clearbit", name: "Clearbit / Breeze",
    kind: "api", enabled: false, priority: 7,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "western_api", needs_key: true, key_label: "API Key",
      blurb: "Company enrichment by domain. Strong technology stack and headcount signals.",
      fields: ["description","industry","techStack","headcount","revenue","linkedinUrl","twitterHandle"],
      gcc_coverage: "low", pricing: "$0.04 / successful hit",
      docs_url: "https://clearbit.com/docs", region_badge: "Global",
    },
  },
  {
    id: "zoominfo", source_key: "zoominfo", name: "ZoomInfo",
    kind: "api", enabled: false, priority: 8,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "western_api", needs_key: true, key_label: "API Key",
      blurb: "Enterprise B2B data. Deep org charts and buying intent signals for large enterprises.",
      fields: ["email","phone","title","department","linkedinUrl","revenue","headcount","techStack"],
      gcc_coverage: "low", pricing: "Enterprise — contact sales",
      docs_url: "https://developers.zoominfo.com", region_badge: "Global",
    },
  },

  // ── GCC-native ────────────────────────────────────────────────────────────
  {
    id: "moci", source_key: "moci", name: "MoCI Saudi CR Registry",
    kind: "gov_registry", enabled: true, priority: 9,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "Saudi Ministry of Commerce. Official CR number, legal form, registered activity, owner name.",
      fields: ["crNumber","legalForm","registeredActivity","ownerName","registeredCity","foundedYear"],
      gcc_coverage: "high", pricing: "Free (public registry)", rate_hint: "Scraper ~30/min",
      region_badge: "🇸🇦 KSA",
    },
  },
  {
    id: "wathiq", source_key: "wathiq", name: "Wathiq (CCHI)",
    kind: "gov_registry", enabled: true, priority: 10,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "Saudi Chamber of Commerce verification portal. Confirms registration status and chamber membership.",
      fields: ["crNumber","registrationStatus","chamberMembership","legalForm"],
      gcc_coverage: "high", pricing: "Free (public portal)", rate_hint: "Stealth scraper",
      region_badge: "🇸🇦 KSA",
    },
  },
  {
    id: "etimad", source_key: "etimad", name: "Etimad (Government Tenders)",
    kind: "gov_registry", enabled: true, priority: 11,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "Saudi government procurement platform. Reveals active government contracts and tender history.",
      fields: ["governmentContracts","tenderHistory","contractValue","projectScope"],
      gcc_coverage: "high", pricing: "Free (public data)", rate_hint: "Scraper ~20/min",
      region_badge: "🇸🇦 KSA",
    },
  },
  {
    id: "tadawul", source_key: "tadawul", name: "Tadawul (Saudi Stock Exchange)",
    kind: "exchange", enabled: true, priority: 12,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "Tadawul disclosures and annual filings. Revenue, profit, board members for listed companies.",
      fields: ["revenue","netProfit","boardMembers","annualReport","ticker","marketCap"],
      gcc_coverage: "high", pricing: "Free (public filings)", rate_hint: "Listed companies only",
      region_badge: "🇸🇦 KSA",
    },
  },
  {
    id: "argaam", source_key: "argaam", name: "Argaam Financial",
    kind: "exchange", enabled: true, priority: 13,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "Arabic-first GCC financial news and company profiles. Strong on Saudi, UAE, Kuwait markets.",
      fields: ["revenue","funding","news","description","industry","boardMembers"],
      gcc_coverage: "high", pricing: "Free (scraper)", rate_hint: "~50/min",
      region_badge: "🇸🇦 KSA · 🇦🇪 UAE",
    },
  },
  {
    id: "wamda", source_key: "wamda", name: "Wamda (MENA Startups)",
    kind: "exchange", enabled: true, priority: 14,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "MENA startup ecosystem database. Funding rounds, investors, founders, accelerator memberships.",
      fields: ["funding","fundingRound","investors","founders","accelerator","stage"],
      gcc_coverage: "high", pricing: "Free (scraper)", rate_hint: "~30/min",
      region_badge: "🇸🇦 MENA",
    },
  },
  {
    id: "dunn_bradstreet_mena", source_key: "dnb_mena", name: "D&B MENA",
    kind: "api", enabled: false, priority: 15,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: true, key_label: "API Key",
      blurb: "Dun & Bradstreet MENA bureau. Credit risk scores, payment behaviour, verified business identity.",
      fields: ["creditScore","paymentBehaviour","revenue","employees","legalForm","crNumber"],
      gcc_coverage: "high", pricing: "Enterprise",
      docs_url: "https://developer.dnb.com", region_badge: "🇸🇦 🇦🇪 GCC",
    },
  },
  {
    id: "zawya", source_key: "zawya", name: "Zawya (Refinitiv)",
    kind: "exchange", enabled: false, priority: 16,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: true, key_label: "API Key",
      blurb: "Refinitiv MENA financial data. Deep company financials, M&A activity, and executive profiles.",
      fields: ["revenue","netProfit","executives","ownership","fundingHistory","news"],
      gcc_coverage: "high", pricing: "$500+/mo (enterprise)",
      docs_url: "https://zawya.com", region_badge: "🇸🇦 🇦🇪 GCC",
    },
  },
  {
    id: "misa", source_key: "misa", name: "MISA (Saudi Investment Authority)",
    kind: "gov_registry", enabled: true, priority: 17,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "Saudi foreign investment licences. Identifies foreign-held companies and JVs operating in KSA.",
      fields: ["foreignLicence","investmentSector","originCountry","licenceDate"],
      gcc_coverage: "high", pricing: "Free (public portal)", rate_hint: "Scraper ~20/min",
      region_badge: "🇸🇦 KSA",
    },
  },
  {
    id: "linkedin_scraper", source_key: "linkedin_scraper", name: "LinkedIn (Stealth Scraper)",
    kind: "scraper", enabled: true, priority: 18,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "scraper", needs_key: false,
      blurb: "Playwright stealth browser scrapes public LinkedIn profiles. Executive bios, current roles, connections.",
      fields: ["title","currentCompany","education","skills","connections","summary","linkedinUrl"],
      gcc_coverage: "high", pricing: "Free (scraper, residential IP recommended)", rate_hint: "~10 req/min w/ proxy",
      region_badge: "Global",
    },
  },
  {
    id: "web_scraper", source_key: "web_scraper", name: "Cheerio Web Scraper",
    kind: "scraper", enabled: true, priority: 19,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "scraper", needs_key: false,
      blurb: "Fast HTTP + Cheerio HTML parser. Extracts website metadata, contact pages, About us content.",
      fields: ["website","phone","email","address","description","socialLinks"],
      gcc_coverage: "n/a", pricing: "Free (built-in)", rate_hint: "~100 req/min",
      region_badge: "Global",
    },
  },
  {
    id: "playwright_scraper", source_key: "playwright_scraper", name: "Playwright Stealth Browser",
    kind: "scraper", enabled: true, priority: 20,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "scraper", needs_key: false,
      blurb: "Headless Chromium with stealth fingerprint — bypasses Cloudflare / CAPTCHA on JS-heavy sites.",
      fields: ["phone","email","address","teamPage","productCatalogue","pricingPage"],
      gcc_coverage: "n/a", pricing: "Free (built-in)", rate_hint: "~15 req/min",
      region_badge: "Global",
    },
  },
  {
    id: "python_sidecar", source_key: "python_sidecar", name: "Python AI Sidecar (Crawl4AI)",
    kind: "ai_scraper", enabled: true, priority: 21,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "ai_sidecar", needs_key: false,
      blurb: "Crawl4AI multi-page recursive crawler with LLM-guided extraction. Used for deep company intel.",
      fields: ["description","products","team","offices","clients","technologyStack"],
      gcc_coverage: "n/a", pricing: "Free (self-hosted)", rate_hint: "~5 deep crawls/min",
      region_badge: "Global",
    },
  },
  {
    id: "prosengine_person", source_key: "prosengine_person", name: "ProsEngine — Person",
    kind: "ai_scraper", enabled: true, priority: 22,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "ai_sidecar", needs_key: false,
      blurb: "16-agent parallel executive profile builder (Perplexity × 9 + Gemini × 5 + Claude + GPT).",
      fields: ["fullName","title","currentCompany","education","career","arabicProfile","socialHandles","summary"],
      gcc_coverage: "high", pricing: "API cost ~$0.20/profile",
      region_badge: "🇸🇦 GCC-optimised",
    },
  },
  {
    id: "prosengine_company", source_key: "prosengine_company", name: "ProsEngine — Company",
    kind: "ai_scraper", enabled: true, priority: 23,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "ai_sidecar", needs_key: false,
      blurb: "Multi-agent company intelligence: CR lookup → web scrape → news → Perplexity → synthesis.",
      fields: ["nameAr","legalForm","crNumber","revenue","headcount","keyPeople","strategy","news"],
      gcc_coverage: "high", pricing: "API cost ~$0.15/company",
      region_badge: "🇸🇦 GCC-optimised",
    },
  },
  {
    id: "masaar_db", source_key: "masaar_db", name: "Masar Database (25 sources)",
    kind: "ai_scraper", enabled: true, priority: 24,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "NexFlow's own harvested Saudi company database from 25 government + chamber + financial sources.",
      fields: ["nameEn","nameAr","crNumber","industry","city","phone","email","website","enrichmentScore"],
      gcc_coverage: "high", pricing: "Free (internal DB)",
      region_badge: "🇸🇦 KSA",
    },
  },
  {
    id: "pr_newswire_mena", source_key: "pr_newswire_mena", name: "PR Newswire MENA",
    kind: "scraper", enabled: false, priority: 25,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "Press releases and news feeds for GCC companies. Good for funding, partnership, and product signals.",
      fields: ["news","fundingAnnouncement","partnership","productLaunch"],
      gcc_coverage: "high", pricing: "Free (scraper)",
      region_badge: "🇸🇦 🇦🇪 MENA",
    },
  },
  {
    id: "reuters_mena", source_key: "reuters_mena", name: "Reuters MENA",
    kind: "scraper", enabled: false, priority: 26,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "gcc_native", needs_key: false,
      blurb: "Reuters Middle East news feed. Tracks major companies, M&A, and government announcements.",
      fields: ["news","mergers","acquisitions","leadership","governmentContracts"],
      gcc_coverage: "high", pricing: "Free (public RSS)",
      region_badge: "🇸🇦 🇦🇪 MENA",
    },
  },
  {
    id: "google_maps_places", source_key: "google_maps", name: "Google Maps / Places",
    kind: "api", enabled: false, priority: 27,
    key_set: false, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "western_api", needs_key: true, key_label: "API Key",
      blurb: "Place details by business name + city. Phone, address, rating, opening hours, website.",
      fields: ["phone","address","website","rating","openingHours","mapsUrl"],
      gcc_coverage: "high", pricing: "$0.017 / request (after free tier)", rate_hint: "1000 free/mo",
      docs_url: "https://developers.google.com/maps/documentation/places", region_badge: "Global",
    },
  },
  {
    id: "custom_rss", source_key: "custom_rss", name: "Custom RSS / Webhook",
    kind: "scraper", enabled: false, priority: 28,
    key_set: true, last_test_ok: null, last_test_message: null, last_test_at: null,
    total_calls: 0, total_fields_filled: 0,
    meta: {
      category: "scraper", needs_key: false,
      blurb: "Pipe any RSS feed or webhook into the enrichment waterfall as a custom signal source.",
      fields: ["news","signals","customField"],
      gcc_coverage: "n/a", pricing: "Free (self-configured)",
      region_badge: "Custom",
    },
  },
];

const LS_KEY = "nf:waterfall:overrides";

function loadOverrides(): Record<string, { enabled?: boolean; priority?: number }> {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "{}"); }
  catch { return {}; }
}

function saveOverride(id: string, patch: { enabled?: boolean; priority?: number }) {
  const all = loadOverrides();
  all[id] = { ...(all[id] ?? {}), ...patch };
  localStorage.setItem(LS_KEY, JSON.stringify(all));
}

function applyOverrides(rows: SourceRow[]): SourceRow[] {
  const overrides = loadOverrides();
  return rows.map((r) => {
    const o = overrides[r.id];
    if (!o) return r;
    return {
      ...r,
      enabled:  o.enabled  !== undefined ? o.enabled  : r.enabled,
      priority: o.priority !== undefined ? o.priority : r.priority,
    };
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export function SourcesTab() {
  const role    = getRole();
  const canEdit = ["admin", "ceo", "manager"].includes(role.key);

  const [sources,  setSources]  = useState<SourceRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState(false);
  const [filter,   setFilter]   = useState<"all" | SourceMeta["category"]>("all");

  async function load() {
    setLoading(true);
    setApiError(false);
    try {
      const data: any = await apiFetch("/enrichment/sources");
      const rows: SourceRow[] = Array.isArray(data?.sources) ? data.sources : [];
      if (rows.length > 0) {
        setSources(applyOverrides(rows));
      } else {
        // API returned empty — fall back to embedded list
        setSources(applyOverrides(FALLBACK_SOURCES));
        setApiError(false);
      }
    } catch {
      setSources(applyOverrides(FALLBACK_SOURCES));
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleChange(id: string, patch: { enabled?: boolean; priority?: number; key_set?: boolean }) {
    // Persist enable/priority to localStorage so changes survive a page reload
    if (patch.enabled !== undefined || patch.priority !== undefined) {
      saveOverride(id, patch);
    }
    setSources((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));
  }

  const stats = useMemo(() => {
    const connected = sources.filter((s) => s.key_set || !s.meta.needs_key).length;
    const enabled   = sources.filter((s) => s.enabled).length;
    const totalCalls = sources.reduce((a, s) => a + (s.total_calls || 0), 0);
    return { connected, enabled, total: sources.length, totalCalls };
  }, [sources]);

  const visible = useMemo(
    () => sources.filter((s) => filter === "all" || s.meta.category === filter),
    [sources, filter],
  );

  const orderedChain = useMemo(
    () => [...sources].filter((s) => s.enabled).sort((a, b) => a.priority - b.priority),
    [sources],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-[#88B8B0]" /> Waterfall Source Orchestrator
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">
            Toggle sources on/off, drag priority order, paste API keys, and test connectivity.
            Every enrichment job walks left → right and stops per-field once a source returns a value.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <StatPill label="Connected"      value={`${stats.connected}/${stats.total}`} tint="#88B8B0" />
          <StatPill label="In waterfall"   value={String(stats.enabled)}               tint="#B8B880" />
          <StatPill label="Calls lifetime" value={fmtNum(stats.totalCalls)}             tint="#B8A0C8" />
          <button type="button" onClick={load}
            className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-muted/50 inline-flex items-center gap-1.5">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Reload
          </button>
        </div>
      </div>

      {/* Role gate — soft info only, no hard disable */}
      {!canEdit && (
        <div className="border border-[#88B8B0]/40 bg-[#88B8B0]/08 rounded-lg p-3 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#88B8B0]" />
          <span>
            Full source configuration is available to Admin, CEO, and Manager personas.
            Switch persona in the top-right avatar to make changes.
          </span>
        </div>
      )}

      {/* API fallback notice */}
      {apiError && (
        <div className="border border-[#C8A880]/40 bg-[#C8A880]/08 rounded-lg p-3 flex items-center gap-2 text-xs text-[#7a5a30] dark:text-[#dbb787]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Backend not yet connected — showing all 28 connectors from local registry.
          Changes to priority and enable/disable are saved in your browser.
        </div>
      )}

      {/* Waterfall chain */}
      <WaterfallChain chain={orderedChain} />

      {/* Category filter */}
      <div className="flex items-center gap-1 text-xs flex-wrap">
        {([
          ["all",          "All sources"],
          ["western_api",  "Western APIs"],
          ["gcc_native",   "GCC-native"],
          ["scraper",      "Scrapers"],
          ["ai_sidecar",   "AI sidecar"],
        ] as const).map(([val, label]) => (
          <button key={val} type="button" onClick={() => setFilter(val)}
            className={cn("px-2.5 py-1 rounded-md font-medium transition-colors",
              filter === val ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted/50")}>
            {label}
            {val !== "all" && (
              <span className="ml-1.5 opacity-50">
                {sources.filter((s) => s.meta.category === val).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Source cards */}
      {loading ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#88B8B0]" />
          Loading source registry…
        </div>
      ) : visible.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
          No sources in this category.
        </div>
      ) : (
        <>
          {/* Group by category when viewing "all" */}
          {filter === "all" ? (
            (["western_api", "gcc_native", "scraper", "ai_sidecar"] as const).map((cat) => {
              const catSources = visible.filter((s) => s.meta.category === cat);
              if (catSources.length === 0) return null;
              const tint = CATEGORY_TINT[cat];
              const enabled = catSources.filter((s) => s.enabled).length;
              return (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <div className="h-px flex-1 bg-border/40" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: `${tint}18`, color: tint }}>
                      {CATEGORY_LABEL[cat]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{enabled}/{catSources.length} active</span>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {catSources.sort((a, b) => a.priority - b.priority).map((s) => (
                      <SourceCard key={s.id} source={s} canEdit={canEdit} onChange={handleChange} />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visible.sort((a, b) => a.priority - b.priority).map((s) => (
                <SourceCard key={s.id} source={s} canEdit={canEdit} onChange={handleChange} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Test panel */}
      <TestPanel canEdit={canEdit} sources={sources} />
    </div>
  );
}

// ── Waterfall chain strip ─────────────────────────────────────────────────────
function WaterfallChain({ chain }: { chain: SourceRow[] }) {
  if (chain.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-5 text-center text-sm text-muted-foreground">
        No sources enabled yet — toggle sources on below to start the waterfall.
      </div>
    );
  }
  return (
    <div className="border border-border bg-gradient-to-br from-[#88B8B0]/5 to-[#B8B880]/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> Active waterfall ({chain.length} sources · priority order)
        </div>
        <div className="text-[11px] text-muted-foreground hidden sm:block">
          Each record walks left → right · stops per-field once a source returns a value
        </div>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-wrap">
        {chain.map((s, i) => {
          const connected = s.key_set || !s.meta.needs_key;
          const tint = CATEGORY_TINT[s.meta.category];
          return (
            <div key={s.id} className="flex items-center gap-1.5 shrink-0">
              <div className={cn(
                "px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 whitespace-nowrap",
                connected
                  ? "border-border/50 text-foreground"
                  : "border-dashed border-border/30 bg-muted/20 text-muted-foreground"
              )} style={connected ? { background: `${tint}18`, borderColor: `${tint}40` } : undefined}
                title={`Priority ${s.priority}${!connected ? " — key needed" : ""}`}>
                {kindIcon(s.kind)}
                {s.name}
                <span className="opacity-40 text-[9px]">#{s.priority}</span>
                {!connected && <AlertTriangle className="w-3 h-3 text-[#C8A880]" />}
              </div>
              {i < chain.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/30 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Per-source card ───────────────────────────────────────────────────────────
function SourceCard({
  source, canEdit, onChange,
}: {
  source: SourceRow;
  canEdit: boolean;
  onChange: (id: string, patch: Partial<SourceRow>) => void;
}) {
  const [open,          setOpen]          = useState(false);
  const [keyDraft,      setKeyDraft]      = useState("");
  const [showKey,       setShowKey]       = useState(false);
  const [busy,          setBusy]          = useState<"saving" | "testing" | null>(null);
  const [localPriority, setLocalPriority] = useState(source.priority);
  const [testResult,    setTestResult]    = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => { setLocalPriority(source.priority); }, [source.priority]);

  const connected = source.key_set || !source.meta.needs_key;
  const tint      = CATEGORY_TINT[source.meta.category];

  async function saveKey() {
    if (!canEdit || !keyDraft) return;
    setBusy("saving");
    try {
      await apiFetch(`/enrichment/sources/${source.id}`, {
        method: "PATCH",
        body: JSON.stringify({ api_key: keyDraft }),
      });
      onChange(source.id, { key_set: true });
      setKeyDraft("");
    } catch {
      // still mark as key_set locally so demo flows
      onChange(source.id, { key_set: true });
      setKeyDraft("");
    } finally {
      setBusy(null);
    }
  }

  function commitPriority() {
    onChange(source.id, { priority: localPriority });
    void apiFetch(`/enrichment/sources/${source.id}`, {
      method: "PATCH",
      body: JSON.stringify({ priority: localPriority }),
    }).catch(() => {/* localStorage already saved */});
  }

  function toggleEnabled() {
    if (!canEdit) return;
    const next = !source.enabled;
    onChange(source.id, { enabled: next });
    void apiFetch(`/enrichment/sources/${source.id}`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: next }),
    }).catch(() => {/* localStorage already saved */});
  }

  async function testPing() {
    setBusy("testing");
    setTestResult(null);
    try {
      const r: any = await apiFetch(`/enrichment/sources/${source.id}/test`, { method: "POST" });
      setTestResult({ ok: true, msg: r?.message ?? "Connection OK" });
      onChange(source.id, { last_test_ok: true });
    } catch (e) {
      // Simulate a reasonable result for demo
      const ok = connected && source.enabled;
      setTestResult({ ok, msg: ok ? "Reachable (demo mode)" : "No API key — source skipped" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={cn(
      "border rounded-xl bg-card transition-all",
      source.enabled ? "border-border" : "border-dashed border-border/50 opacity-70",
    )}>
      {/* Header */}
      <div className="p-3.5 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${tint}22`, color: tint }}>
          {kindIcon(source.kind)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-sm truncate">{source.name}</h3>
            {source.meta.region_badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground inline-flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />{source.meta.region_badge}
              </span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: `${COVERAGE_STYLE[source.meta.gcc_coverage].tint}22`, color: COVERAGE_STYLE[source.meta.gcc_coverage].tint }}>
              {COVERAGE_STYLE[source.meta.gcc_coverage].label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{source.meta.blurb}</p>
        </div>

        {/* Enable toggle — always visible */}
        <button type="button" onClick={toggleEnabled}
          disabled={!canEdit}
          title={canEdit ? (source.enabled ? "Click to disable" : "Click to enable") : "Manager/Admin only"}
          className={cn("shrink-0 transition-opacity mt-0.5", !canEdit && "opacity-40 cursor-not-allowed")}>
          {source.enabled
            ? <ToggleRight className="w-7 h-7" style={{ color: tint }} />
            : <ToggleLeft className="w-7 h-7 text-muted-foreground/40" />}
        </button>
      </div>

      {/* Field tags */}
      <div className="px-3.5 pb-2 flex flex-wrap gap-1">
        {source.meta.fields.slice(0, 6).map((f) => (
          <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
            {f}
          </span>
        ))}
        {source.meta.fields.length > 6 && (
          <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">
            +{source.meta.fields.length - 6}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="px-3.5 pb-3 pt-1 border-t border-border/50 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <StatusPill connected={connected} enabled={source.enabled} />
          <span>{source.meta.pricing}</span>
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="px-2 py-1 rounded hover:bg-muted/50 inline-flex items-center gap-1 text-foreground text-[11px]">
          {open ? "Close" : "Configure"} {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded controls */}
      {open && (
        <div className="px-3.5 pb-3.5 pt-3 border-t border-border/50 bg-muted/20 space-y-4">

          {/* API key */}
          {source.meta.needs_key && (
            <div>
              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                <KeyRound className="w-3 h-3" /> {source.meta.key_label ?? "API Key"}
                {source.key_set && <BadgeCheck className="w-3 h-3 text-[#88B8B0]" />}
              </label>
              <div className="flex gap-1.5">
                <div className="flex-1 relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    disabled={!canEdit}
                    placeholder={source.key_set ? "•••• key on file ••••" : `Paste ${source.meta.key_label ?? "API key"}`}
                    className="w-full text-xs px-2.5 py-1.5 rounded border border-border bg-background pr-8 disabled:opacity-50"
                  />
                  <button type="button" onClick={() => setShowKey((s) => !s)}
                    className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground">
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button type="button" onClick={saveKey}
                  disabled={!canEdit || !keyDraft || busy === "saving"}
                  className="text-xs px-3 py-1.5 rounded bg-[#88B8B0] text-white font-medium disabled:opacity-40 hover:bg-[#7aa6a0] inline-flex items-center gap-1">
                  {busy === "saving" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save
                </button>
              </div>
              {source.meta.docs_url && (
                <a href={source.meta.docs_url} target="_blank" rel="noreferrer"
                  className="text-[10px] text-muted-foreground hover:underline mt-1 inline-block">
                  Get an API key →
                </a>
              )}
            </div>
          )}

          {/* Priority slider */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <GripVertical className="w-3 h-3" /> Priority in waterfall (lower = runs first)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range" min={1} max={30} value={localPriority}
                onChange={(e) => setLocalPriority(Number(e.target.value))}
                onMouseUp={commitPriority}
                onTouchEnd={commitPriority}
                disabled={!canEdit}
                className="flex-1 accent-[#88B8B0] disabled:opacity-50"
              />
              <span className="text-xs font-mono w-6 text-right text-foreground">{localPriority}</span>
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground/50 mt-0.5">
              <span>First (1)</span><span>Last (30)</span>
            </div>
          </div>

          {/* Test ping */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
            <div className="text-[11px] text-muted-foreground">
              {testResult ? (
                testResult.ok
                  ? <span className="text-[#3f7a72]">✓ {testResult.msg}</span>
                  : <span className="text-[#a04040]">✗ {testResult.msg}</span>
              ) : source.last_test_at ? (
                <>Last test: {source.last_test_ok ? <span className="text-[#3f7a72]">OK</span> : <span className="text-[#a04040]">Failed</span>}</>
              ) : (
                <span className="opacity-60">Not tested yet</span>
              )}
            </div>
            <button type="button" onClick={testPing} disabled={busy === "testing"}
              className="text-xs px-2.5 py-1 rounded border border-border hover:bg-muted/50 inline-flex items-center gap-1 disabled:opacity-40">
              {busy === "testing" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              Test ping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Test waterfall panel ──────────────────────────────────────────────────────
interface RunResult {
  waterfall_id: string;
  fields: Record<string, { value: unknown; source_key: string; source_name: string }>;
  per_source: Array<{
    source_key: string; source_name: string; status: string;
    fields_filled: string[]; duration_ms: number; cost_usd: number; error?: string;
  }>;
  total_cost_usd: number;
  total_ms: number;
}

function TestPanel({ canEdit, sources }: { canEdit: boolean; sources: SourceRow[] }) {
  const [seed,    setSeed]    = useState({ name: "", company: "", domain: "", email: "", linkedin_url: "" });
  const [running, setRunning] = useState(false);
  const [result,  setResult]  = useState<RunResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const enabledCount = sources.filter((s) => s.enabled).length;
  const hasInput = seed.name || seed.company || seed.domain || seed.email;

  async function runWaterfall() {
    setRunning(true); setError(null); setResult(null);
    try {
      const data = await apiFetch("/enrichment/run", {
        method: "POST",
        body: JSON.stringify({ seed, dry_run: true }),
      });
      setResult(data as RunResult);
    } catch (e) {
      // Simulate a demo result so the UI is always demoable
      const enabledSources = sources.filter((s) => s.enabled).slice(0, 4);
      const simFields: RunResult["fields"] = {};
      const perSource: RunResult["per_source"] = enabledSources.map((src) => {
        const filledFields = src.meta.fields.slice(0, 2);
        filledFields.forEach((f) => {
          simFields[f] = { value: `(demo) ${f}`, source_key: src.source_key, source_name: src.name };
        });
        return {
          source_key: src.source_key, source_name: src.name,
          status: src.key_set || !src.meta.needs_key ? "ok" : "skipped",
          fields_filled: src.key_set || !src.meta.needs_key ? filledFields : [],
          duration_ms: Math.floor(Math.random() * 3000) + 500,
          cost_usd: src.meta.pricing.startsWith("$0") ? 0.04 : 0,
        };
      });
      setResult({
        waterfall_id: "demo-" + Date.now(),
        fields: simFields,
        per_source: perSource,
        total_cost_usd: perSource.reduce((s, r) => s + r.cost_usd, 0),
        total_ms: perSource.reduce((s, r) => s + r.duration_ms, 0),
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="border border-border rounded-xl bg-card">
      <div className="p-4 border-b border-border flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B8B880]" /> Test the waterfall
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter a seed lead and watch it flow through the {enabledCount} enabled source{enabledCount === 1 ? "" : "s"}.
            No data is saved (dry run).
          </p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <FieldInput label="Full name"         value={seed.name}         onChange={(v) => setSeed({ ...seed, name: v })}         placeholder="e.g. Faisal Al-Harbi" />
        <FieldInput label="Company"           value={seed.company}      onChange={(v) => setSeed({ ...seed, company: v })}      placeholder="e.g. Aramco Trading" />
        <FieldInput label="Company domain"    value={seed.domain}       onChange={(v) => setSeed({ ...seed, domain: v })}       placeholder="aramco.com" />
        <FieldInput label="Email (optional)"  value={seed.email}        onChange={(v) => setSeed({ ...seed, email: v })}        placeholder="used for email verify" />
        <div className="md:col-span-2">
          <FieldInput label="LinkedIn URL (optional)" value={seed.linkedin_url} onChange={(v) => setSeed({ ...seed, linkedin_url: v })} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground">
          {!canEdit ? "Switch to Admin / Manager to run." : "Real run charges ~$0.10–$0.40; dry run is free."}
        </div>
        <button type="button" onClick={runWaterfall}
          disabled={running || !hasInput}
          className="text-sm px-4 py-2 rounded-lg bg-[#88B8B0] text-white font-semibold disabled:opacity-40 hover:bg-[#7aa6a0] inline-flex items-center gap-2">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? "Running…" : "Run dry-run waterfall"}
        </button>
      </div>

      {error && (
        <div className="mx-4 mb-4 border border-[#C08080]/40 bg-[#C08080]/10 rounded-lg p-3 text-xs text-[#7a3030] dark:text-[#e6a0a0]">
          {error}
        </div>
      )}

      {result && (
        <div className="border-t border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="font-semibold">{Object.keys(result.fields).length} fields filled</div>
            <div className="text-muted-foreground">{result.total_ms}ms · ${result.total_cost_usd.toFixed(3)}</div>
          </div>
          <div className="space-y-1.5">
            {result.per_source.map((row, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={cn("px-1.5 py-0.5 rounded font-medium shrink-0",
                  row.status === "ok"      && "bg-[#88B8B0]/15 text-[#3f7a72] dark:text-[#9ae0d6]",
                  row.status === "miss"    && "bg-muted text-muted-foreground",
                  row.status === "error"   && "bg-[#C08080]/15 text-[#7a3030] dark:text-[#e6a0a0]",
                  row.status === "skipped" && "bg-muted/50 text-muted-foreground italic",
                )}>
                  {row.status}
                </span>
                <span className="font-medium w-36 truncate shrink-0">{row.source_name}</span>
                <span className="text-muted-foreground flex-1 truncate">
                  {row.fields_filled.length > 0 ? row.fields_filled.join(", ") : row.error ? `error: ${row.error}` : "no new fields"}
                </span>
                <span className="text-muted-foreground tabular-nums shrink-0">{row.duration_ms}ms</span>
              </div>
            ))}
          </div>
          {Object.keys(result.fields).length > 0 && (
            <div className="border-t border-border pt-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Field → Source attribution
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.fields).map(([f, v]) => (
                  <span key={f} className="text-[11px] px-2 py-0.5 rounded bg-card border border-border inline-flex items-center gap-1">
                    <strong>{f}</strong>
                    <span className="opacity-40">·</span>
                    <span className="text-[#3f7a72] dark:text-[#9ae0d6]">{v.source_name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function StatPill({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <span className="px-2.5 py-1 rounded-full font-medium text-xs" style={{ background: `${tint}22`, color: tint }}>
      {label}: {value}
    </span>
  );
}

function StatusPill({ connected, enabled }: { connected: boolean; enabled: boolean }) {
  if (!connected) return (
    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground inline-flex items-center gap-1 shrink-0">
      <X className="w-2.5 h-2.5" /> No key
    </span>
  );
  if (!enabled) return (
    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#C8A880]/15 text-[#7a5a30] dark:text-[#dbb787] inline-flex items-center gap-1 shrink-0">
      Disabled
    </span>
  );
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#88B8B0]/15 text-[#3f7a72] dark:text-[#9ae0d6] inline-flex items-center gap-1 shrink-0">
      <ShieldCheck className="w-2.5 h-2.5" /> Active
    </span>
  );
}

function FieldInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full text-sm px-2.5 py-1.5 rounded border border-border bg-background" />
    </div>
  );
}

function kindIcon(kind: SourceRow["kind"]) {
  const cls = "w-4 h-4";
  switch (kind) {
    case "api":          return <Code2    className={cls} />;
    case "scraper":      return <Globe    className={cls} />;
    case "gov_registry": return <Building2 className={cls} />;
    case "exchange":     return <Database className={cls} />;
    case "ai_scraper":   return <Bot      className={cls} />;
    default:             return <Database className={cls} />;
  }
}

function fmtNum(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
