/**
 * Shared types for the four Intelligence Engines:
 *   - Masaar          (Saudi CR-number → bilingual company intel)
 *   - Person Intel    (name + company → person dossier)
 *   - Company Intel   (company name → structured company dossier)
 *   - Lead Finder     (company name → list of likely employees / leads)
 *
 * All engines share a common run envelope so the UI can render them
 * generically (history table, status pill, save button).
 */

export type EngineKind = "masaar" | "person_intel" | "company_intel" | "lead_finder";

export interface EngineRunEnvelope<TInput, TReport> {
  id?: string;
  engine: EngineKind;
  title: string;
  input: TInput;
  report: TReport | null;
  sourcesUsed: string[];
  durationMs: number;
  status: "pending" | "ok" | "error";
  error?: string | null;
}

// ─────────────────────── Masaar ───────────────────────────────

export interface MasaarInput {
  crNumber?: string;            // 10-digit Saudi commercial registration
  nameAr?: string;              // optional name fallback when no CR
  nameEn?: string;
}

export interface MasaarShareholder {
  nameEn: string;
  nameAr: string;
  ownershipPct: string;
  nationality?: string;
  type?: string;
}

export interface MasaarManager {
  nameEn: string;
  nameAr: string;
  title?: string;
  appointmentTerm?: string;
  powers?: string;
}

export interface MasaarReport {
  crNumber: string | null;
  fetchedAt: string;
  sources: {
    mcGovSa?: { ok: boolean; rawText?: string; note?: string };
    emagazine?: { ok: boolean; aoaUrls?: string[]; note?: string };
    najiz?: { ok: boolean; agencies?: unknown[]; note?: string };
    perplexity?: { ok: boolean; note?: string };
    gemini?: { ok: boolean; note?: string };
  };
  parsed: {
    nameEn: string | null;
    nameAr: string | null;
    crNumber: string | null;
    legalForm: string | null;
    legalFormAr: string | null;
    headquarterCity: string | null;
    foundingYear: string | null;
    capitalAmount: string | null;
    estimatedRevenue: string | null;
    industry: string | null;
    summaryEn: string;
    summaryAr: string;
    contactDetails: Record<string, string>;
    shareholders: MasaarShareholder[];
    managers: MasaarManager[];
  };
  conflicts: Array<{
    field: string;
    source1: string; value1: string;
    source2: string; value2: string;
    severity?: "high" | "medium" | "low";
  }>;
  reportEn: string;
  reportAr: string;
}

// ─────────────────────── Person Intel ─────────────────────────

export interface PersonIntelInput {
  name: string;
  company?: string;
  title?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  country?: string;
  knownFacts?: string;
  sellerContext?: { companyName?: string; product?: string; objectives?: string[] };
}

export interface PersonIntelReport {
  profile: {
    fullName: string;
    arabicName: string;
    title: string;
    company: string;
    nationality: string;
    location: string;
    age: number | null;
    linkedin: string;
  };
  career: Array<{ company: string; title: string; period: string; description: string }>;
  education: Array<{ institution: string; degree: string; year: string }>;
  company_analysis: {
    name: string; industry: string; founded: string; headquarters: string;
    employees: string; revenue_estimate: string; performance: string;
    market_position: string; key_clients: string[]; recent_developments: string;
    competitors: string[]; pain_points: string[];
  };
  wealth_profile: {
    estimated_net_worth: string; income_estimate: string;
    wealth_sources: string[]; assets: string; investments: string;
    lifestyle_indicators: string;
  };
  personal_profile: {
    interests: string[]; personality_traits: string[]; communication_style: string;
    languages: string[]; board_memberships: string[]; publications: string[];
    awards: string[]; social_presence: string;
  };
  approach_strategy: {
    best_channel: string; best_timing: string; opening_angle: string;
    value_proposition: string; potential_objections: string[];
    conversation_starters: string[]; cultural_notes: string;
    recommended_approach: string; sample_message: string;
  };
  intelligence_notes: {
    confidence_level: "High" | "Medium" | "Low";
    data_sources: string[];
    verified_facts: string[];
    estimated_facts: string[];
    caveats: string;
  };
}

// ─────────────────────── Company Intel ────────────────────────

export interface CompanyIntelInput {
  companyName: string;
  website?: string;
  crNumber?: string;
  city?: string;
  knownFacts?: string;
  sellerContext?: { companyName?: string; product?: string; objectives?: string[] };
}

export interface CompanyIntelReport {
  profile: {
    nameEn: string; nameAr: string; legalForm: string; legalFormAr: string;
    crNumber: string | null; founded: string | null; city: string | null;
    address: string | null; website: string | null; phone: string | null;
    email: string | null; industry: string | null; mainActivity: string;
    mainActivityAr: string;
  };
  financials: {
    revenueEstimate: string | null; revenueRange: string | null;
    revenueRationale: string; employeeCount: string | null;
    paidUpCapital: string | null; profitabilityIndicator: string;
    growthSignals: string[]; recentFinancialNews: string | null;
  };
  ownership: {
    structure: string | null;
    shareholders: Array<{
      nameEn: string; nameAr: string; ownershipPct: string;
      nationality: string; type: string;
    }>;
    isPubliclyListed: boolean;
    stockExchange: string | null;
    ticker: string | null;
  };
  leadership: {
    ceo: { nameEn: string; nameAr: string; title: string };
    boardChairman: { nameEn: string; nameAr: string };
    executives: Array<{ nameEn: string; nameAr: string; title: string }>;
    boardMembers: Array<{ nameEn: string; nameAr: string; role: string }>;
  };
  operations: {
    activities: string[]; products: string[]; keyClients: string[];
    subsidiaries: string[]; geographicPresence: string[];
  };
  market: {
    marketPosition: string; marketShare: string | null;
    competitors: string[]; strengths: string[]; weaknesses: string[];
    opportunities: string[];
  };
  approach: {
    bestChannel: string; bestTiming: string; entryPoint: string;
    valueProp: string; openingAngle: string; potentialObjections: string[];
    culturalNotes: string; sampleMessage: string;
  };
  news: Array<{ title: string; date: string; summary: string; source: string }>;
  intelligence: {
    confidenceScore: number;
    dataQuality: "high" | "medium" | "low";
    verifiedFacts: string[]; estimatedFacts: string[];
    caveats: string; dataSources: string[];
  };
  executiveSummary: string;
}

// ─────────────────────── Lead Finder ──────────────────────────

export interface LeadFinderInput {
  companyName: string;
  website?: string;
  city?: string;
  country?: string;
  /** Job titles / functions to focus on, e.g. ["CEO","CFO","VP Sales"] */
  rolesWanted?: string[];
  /** Approximate count to surface (1–25) */
  count?: number;
}

export interface DiscoveredLead {
  fullName: string;
  arabicName?: string;
  title: string;
  department?: string;
  seniority?: "C-suite" | "VP" | "Director" | "Manager" | "Individual";
  linkedinUrl?: string;
  email?: string;
  phone?: string;
  source: string;          // which agent surfaced this lead
  confidence: "high" | "medium" | "low";
  notes?: string;
}

export interface LeadFinderReport {
  company: { name: string; website: string | null; city: string | null };
  leads: DiscoveredLead[];
  byDepartment: Record<string, number>;
  bySeniority: Record<string, number>;
  totalFound: number;
  sourcesQueried: string[];
  recommendations: {
    bestEntryPoints: string[];   // which leads to approach first + why
    decisionMakers: string[];    // who actually signs deals
    blockers: string[];          // gatekeepers to navigate
    suggestedSequence: string;   // multi-touch outreach plan
  };
  generatedAt: string;
}
