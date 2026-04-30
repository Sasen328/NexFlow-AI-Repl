import {
  Sparkles, Activity, Bot, Briefcase, GitBranch, Users, Building2, Network,
  FileText, TrendingUp, ScanLine, Heart, Headphones, LayoutDashboard, Phone,
  Zap, Mic, BookOpen, Mail, Megaphone, Calendar, Layers, Target, Eye,
  CreditCard, Globe, Workflow, Wand2, Route, Database, BookText, BarChart3,
  UserSquare2, ListIcon, Filter, FileSpreadsheet, Settings, MoreHorizontal,
  BrainCircuit,
  Send, Share2, MessageSquare, Home as HomeIcon, AlertCircle, Search,
  Compass, Inbox,
  type LucideIcon,
} from "lucide-react";

/**
 * NexFlow IA — final tab structure (April 2026 restructure).
 *
 * Top nav collapsed to SIX tabs (Home, Leads, Call Center, Data Hub,
 * Marketing, Insights). The "More" tab is gone — every legacy page lives
 * under one of the six, or in Settings (gear icon → avatar menu). Legacy
 * section keys ("crm", "enrichment", "data", "automation", "ai") are kept
 * at the bottom of SECTIONS purely so deep links keep resolving via
 * findSectionByRoute, but they are NEVER shown in TOP_NAV.
 */

export interface SectionItem {
  icon: LucideIcon;
  label: string;
  href: string;
  desc: string;
}

export interface SectionDef {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Tagline shown on the section hub hero */
  tagline: string;
  /** Chameleon hex used to tint the section hub hero */
  accent: string;
  /** Where the top-nav button for this section navigates to on click. */
  defaultHref: string;
  items: SectionItem[];
}

export const SECTIONS: SectionDef[] = [
  // ─── 1. Home ──────────────────────────────────────────────────────
  {
    key: "home",
    label: "Home",
    icon: Sparkles,
    tagline: "Your AI-powered daily briefing.",
    accent: "#B8A0C8",
    defaultHref: "/home",
    items: [
      { icon: Sparkles,  label: "Command Center",     href: "/home",              desc: "360° AI Analysis · morning brief · today's calendar · tasks · AI assistant" },
      { icon: Compass,   label: "Studio",             href: "/studio",            desc: "All-in-one workspace · where you actually work" },
      { icon: BarChart3, label: "Performance",        href: "/home#performance",  desc: "Live KPIs and trend strip" },
      { icon: ListIcon,  label: "To-Do & Alerts",     href: "/home#todo",         desc: "AI-prioritised tasks for today" },
      { icon: Activity,  label: "Insights Dashboard", href: "/home#insights",     desc: "Lead insights + news + AI summary" },
    ],
  },

  // ─── 2. CRM (per spec §03, §08 — was "Leads") ─────────────────────
  // The key remains "leads" to keep ROLE_NAV / legacy deep links working.
  {
    key: "leads",
    label: "Pipeline",
    icon: GitBranch,
    tagline: "People, Companies, Deals, Accounts — one entry, internal tabs.",
    accent: "#88B8B0",
    defaultHref: "/contacts",
    items: [
      { icon: Users,      label: "People",         href: "/contacts",       desc: "All contacts · enrich · score · history" },
      { icon: Building2,  label: "Companies",      href: "/companies",      desc: "Accounts · revenue · contacts roster" },
      { icon: GitBranch,  label: "Deals",          href: "/deal-pipeline",  desc: "Kanban pipeline · stages · win/loss" },
      { icon: Network,    label: "Accounts (ABM)", href: "/accounts",       desc: "Strategic account map · key buying committee" },
      { icon: BarChart3,  label: "Forecasting",    href: "/forecasting",    desc: "AI-driven revenue forecasts & scenarios" },
      { icon: Heart,      label: "Health Scores",  href: "/health-scores",  desc: "Account health & churn risk" },
      { icon: FileText,   label: "Quotes",         href: "/quotes",         desc: "Quotes · CPQ · proposals" },
      { icon: CreditCard, label: "Quote-to-Cash",  href: "/quote-to-cash",  desc: "Order forms · invoices · payment tracking" },
    ],
  },

  // ─── 3. Call Center (rename of Contact Center) ────────────────────
  {
    key: "callcenter",
    label: "Comms",
    icon: MessageSquare,
    tagline: "Unified inbox, dialer, voice agents, knowledge base.",
    accent: "#C0A0B8",
    defaultHref: "/callcenter/messages",
    items: [
      { icon: Inbox,           label: "Unified Inbox",       href: "/callcenter/messages",       desc: "All incoming — WhatsApp + Email + chat in one place" },
      { icon: Phone,           label: "Dialer",              href: "/power-dialer",              desc: "Outbound calls — Manual · Auto-dial · AI Agent" },
      { icon: Phone,           label: "Calls & Transcripts", href: "/callcenter/calls",          desc: "History · transcripts · scoring · sentiment" },
      { icon: Bot,             label: "AI Voice Agent",      href: "/callcenter/agent",          desc: "Automated callers · settings & deployments" },
      { icon: MessageSquare,   label: "WhatsApp",            href: "/whatsapp",                  desc: "WhatsApp campaigns & broadcasts" },
      { icon: Layers,          label: "Templates",           href: "/templates",                 desc: "Reusable scripts · email · WhatsApp templates" },
      { icon: BookOpen,        label: "Knowledge Base",      href: "/callcenter/knowledge-base", desc: "Talk tracks · objections · playbooks" },
    ],
  },

  // ─── 4. Enrichment Engine (per spec §05, §08 — was "Data Hub") ────
  // Key remains "datahub" so ROLE_NAV / legacy deep links keep working.
  {
    key: "datahub",
    label: "★ Enrichment",
    icon: Database,
    tagline: "Engine · Data Providers · Find New Leads · Dedup · AI Workforce.",
    accent: "#B8A0C8",
    defaultHref: "/enrichment-engine",
    items: [
      { icon: BrainCircuit,    label: "Engine",            href: "/enrichment-engine",    desc: "The waterfall orchestrator · Masaar · ProsEngine · Lead Finder" },
      { icon: Wand2,           label: "Quick Enrich",      href: "/lead-enrich",          desc: "Paste a lead → fill fields in seconds" },
      { icon: Database,        label: "Data Providers",    href: "/datahub/ai-analytics", desc: "(was Sources) · Hunter · Apollo · MAGNiTT · Lusha · Wathiq…" },
      { icon: Compass,         label: "Find New Leads",    href: "/sourcing",             desc: "(was Sourcing) · prospect net-new accounts" },
      { icon: FileSpreadsheet, label: "Dedup",             href: "/dedup",                desc: "List Upload · duplicate detection · auto-merge" },
      { icon: Target,          label: "Segments",          href: "/datahub/segments",     desc: "Dynamic segments, filters, smart lists" },
      { icon: Bot,             label: "AI Workforce",      href: "/datahub/workforce",    desc: "Custom AI agents, prompts & scoring" },
    ],
  },

  // ─── 5. Marketing (kept from prior overhaul) ──────────────────────
  {
    key: "marketing",
    label: "Growth",
    icon: Megaphone,
    tagline: "AI-powered campaigns from seed → publish → measure.",
    accent: "#C8A880",
    defaultHref: "/marketing-dashboard",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",            href: "/marketing-dashboard",   desc: "AI analysis · winning points · pain points · how to win" },
      { icon: Sparkles,        label: "Campaign Builder",        href: "/campaign-builder",      desc: "AI builder · manual upload · publishing · cultural intel" },
      { icon: Wand2,           label: "Email & Message Generator", href: "/email-generator",  desc: "AI-generated Email · WhatsApp · SMS · bilingual GCC-native" },
      { icon: GitBranch,       label: "Sequences & Audiences",  href: "/sequences-audiences",  desc: "Cadences · templates · segments in one place" },
      { icon: FileText,        label: "Web Forms",              href: "/web-forms",             desc: "AI form creator + ad-funnel forms" },
      { icon: Eye,             label: "Campaign Performance",   href: "/campaign-performance",  desc: "Per-campaign deep dive · hot lead alerts" },
      { icon: Globe,           label: "Cultural Intelligence",  href: "/cultural-intelligence", desc: "GCC cultural lens + dashboard alerts" },
    ],
  },

  // ─── 6. Insights ──────────────────────────────────────────────────
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
    tagline: "Dashboards, reports, team performance, predictive.",
    accent: "#90B8B8",
    defaultHref: "/insights/dashboards",
    items: [
      { icon: LayoutDashboard, label: "Dashboards",       href: "/insights/dashboards", desc: "Editable dashboards with widgets" },
      { icon: FileText,        label: "Reports",          href: "/insights/reports",    desc: "Reports with PDF/XLSX/PPTX export" },
      { icon: UserSquare2,     label: "Team Performance", href: "/insights/team",       desc: "YTD · Since Inception · Custom range" },
      { icon: Sparkles,        label: "Predictive",       href: "/insights/predictive", desc: "Forecasts, risk, churn, conversion" },
    ],
  },

  // ─── MarkHub (marketing-only bundled tab) ─────────────────────────
  {
    key: "markhub",
    label: "MarkHub",
    icon: Layers,
    tagline: "Templates, sequences, audiences, and web forms — one hub.",
    accent: "#C8A880",
    defaultHref: "/templates",
    items: [
      { icon: FileText,   label: "Templates",  href: "/templates",           desc: "Email/WhatsApp/SMS message templates" },
      { icon: GitBranch,  label: "Sequences",  href: "/sequences-audiences", desc: "Cadences and multi-touch journeys" },
      { icon: Users,      label: "Audiences",  href: "/audiences",           desc: "Segments and target lists" },
      { icon: FileText,   label: "Web Forms",  href: "/web-forms",           desc: "AI form creator + ad-funnel forms" },
    ],
  },

  // ─── Single-page tab shells (used by per-role TOP_NAVs) ──────────
  // These exist so a TopNavEntry can point at one page (no real
  // dropdown). SingleSectionDropdown hides itself when items.length
  // === 1 AND the item's href matches defaultHref.
  {
    key: "tab-campaign-builder",
    label: "Campaign Builder",
    icon: Sparkles,
    tagline: "AI-powered campaign builder.",
    accent: "#C8A880",
    defaultHref: "/campaign-builder",
    items: [
      { icon: Sparkles, label: "Campaign Builder", href: "/campaign-builder", desc: "AI builder · manual upload · publishing" },
    ],
  },
  {
    key: "tab-campaign-performance",
    label: "Campaign Performance",
    icon: Eye,
    tagline: "Per-campaign deep dive.",
    accent: "#88B8B0",
    defaultHref: "/campaign-performance",
    items: [
      { icon: Eye, label: "Campaign Performance", href: "/campaign-performance", desc: "Per-campaign deep dive · hot lead alerts" },
    ],
  },
  {
    key: "tab-email-generator",
    label: "Email & Message Generator",
    icon: Wand2,
    tagline: "AI-generated bilingual campaign copy.",
    accent: "#B8A0C8",
    defaultHref: "/email-generator",
    items: [
      { icon: Wand2, label: "Email & Message Generator", href: "/email-generator", desc: "AI-generated Email, WhatsApp & SMS · bilingual · GCC-native" },
    ],
  },

  // ─── Settings (gear icon in avatar menu — NOT in TOP_NAV) ─────────
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    tagline: "Account, permissions, security, and trust.",
    accent: "#B8A0C8",
    defaultHref: "/account-settings",
    items: [
      { icon: Settings, label: "Account Settings", href: "/account-settings", desc: "Org-wide settings" },
      { icon: Users,    label: "Permissions",      href: "/permissions",      desc: "Roles & access" },
      { icon: Eye,      label: "Trust Center",     href: "/trust-center",     desc: "Security & compliance" },
      { icon: Sparkles, label: "Capabilities",     href: "/capabilities",     desc: "Platform feature tour" },
    ],
  },

  // ─── Hidden legacy sections — kept ONLY so legacy deep links still
  //     resolve via findSectionByRoute. NEVER shown in TOP_NAV. ─────
  {
    key: "crm",
    label: "Leads",
    icon: Briefcase,
    tagline: "Legacy CRM section — kept for back-compat routing.",
    accent: "#88B8B0",
    defaultHref: "/leads/pipeline",
    items: [
      { icon: GitBranch, label: "Pipeline",      href: "/pipeline",      desc: "Legacy" },
      { icon: TrendingUp, label: "Deal Pipeline", href: "/deal-pipeline", desc: "Legacy" },
      { icon: Users,     label: "Contacts",      href: "/contacts",      desc: "Legacy" },
      { icon: Building2, label: "Companies",     href: "/companies",     desc: "Legacy" },
    ],
  },
];

/**
 * The SIX visible top-bar buttons. Settings is NOT here — it lives in the
 * avatar dropdown as a gear icon.
 */
export interface TopNavEntry {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Section keys this entry covers, in order. */
  sections: string[];
}

export const TOP_NAV: TopNavEntry[] = [
  { key: "home",       label: "Home",         icon: Sparkles,      sections: ["home"] },
  { key: "leads",      label: "Pipeline",     icon: GitBranch,     sections: ["leads"] },
  { key: "callcenter", label: "Comms",        icon: MessageSquare, sections: ["callcenter"] },
  { key: "datahub",    label: "★ Enrichment", icon: Database,      sections: ["datahub"] },
  { key: "marketing",  label: "Growth",       icon: Megaphone,     sections: ["marketing"] },
  { key: "insights",   label: "Insights",     icon: BarChart3,     sections: ["insights"] },
];

// ─── Legacy path → section key remap ────────────────────────────────
// Many older deep links still need to highlight the right top-tab. This
// table maps legacy paths to the *new* section they belong to.
const LEGACY_PATH_PREFIX_TO_SECTION: Array<[string, string]> = [
  ["/pipeline",          "leads"],
  ["/deal-pipeline",     "leads"],
  ["/deals",             "leads"],
  ["/contacts",          "leads"],
  ["/companies",         "leads"],
  ["/accounts",          "leads"],
  ["/intelligence",      "leads"],
  ["/forecasting",       "leads"],
  ["/funnel",            "leads"],
  ["/lists",             "leads"],
  ["/crm-dashboard",     "leads"],
  ["/health-scores",     "leads"],
  ["/quotes",            "leads"],
  ["/quote-to-cash",     "leads"],

  ["/calls",             "callcenter"],
  ["/call-list",         "callcenter"],
  ["/scripts",           "callcenter"],
  ["/whatsapp",          "callcenter"],
  ["/email",             "callcenter"],
  ["/messages",          "callcenter"],
  ["/voice-agents",      "callcenter"],
  ["/agent-builder",     "callcenter"],
  ["/playbooks",         "callcenter"],
  ["/power-dialer",      "callcenter"],
  ["/conversation-intelligence", "callcenter"],
  ["/post-call-automation", "callcenter"],
  ["/contact-center-setup", "callcenter"],
  ["/engagement",        "callcenter"],
  ["/meetings",          "callcenter"],

  ["/segments",          "datahub"],
  ["/signals",           "datahub"],
  ["/enrichment-engine", "datahub"],
  ["/lead-enrich",       "datahub"],
  ["/dedup",             "datahub"],
  ["/properties",        "datahub"],
  ["/migration",         "datahub"],
  ["/ai",                "datahub"],
  ["/agents",            "datahub"],
  ["/workflows",         "datahub"],
  ["/automation",        "datahub"],
  ["/lead-routing",      "datahub"],
  ["/activity-capture",  "datahub"],
  ["/sourcing",          "datahub"],

  ["/marketing-dashboard","marketing"],
  ["/campaign-builder",   "marketing"],
  ["/email-generator",    "marketing"],
  ["/sequences-audiences","marketing"],
  ["/sequences",          "marketing"],
  ["/web-forms",          "marketing"],
  ["/campaign-performance","marketing"],
  ["/campaigns",          "marketing"],
  ["/templates",          "callcenter"],
  ["/audiences",          "marketing"],
  ["/cultural-intelligence","marketing"],

  ["/dashboards",         "insights"],
  ["/dashboard",          "insights"],
  ["/reports",            "insights"],
  ["/analytics",          "insights"],
  ["/predictive",         "insights"],
  ["/team",               "insights"],
  ["/attribution",        "insights"],
  ["/report-builder",     "insights"],
];

/** Reverse lookup: returns the section the given route belongs to, or null. */
export function findSectionByRoute(pathname: string): SectionDef | null {
  // 1. /home special-case (highest priority — never wins by accident)
  if (pathname === "/home" || pathname.startsWith("/home#")) {
    return SECTIONS.find((s) => s.key === "home") ?? null;
  }
  // 2. /section/<key> hub fallback
  const hubMatch = pathname.match(/^\/section\/([\w-]+)/);
  if (hubMatch) {
    const s = SECTIONS.find((x) => x.key === hubMatch[1]);
    if (s) return s;
  }
  // 3. /<top-section-key>/* prefix (covers all NEW routes: /leads/*,
  //    /callcenter/*, /datahub/*, /insights/*). Done before item-scan so
  //    new IA wins over hidden-legacy item URLs.
  for (const t of TOP_NAV) {
    if (pathname === `/${t.key}` || pathname.startsWith(`/${t.key}/`)) {
      const s = SECTIONS.find((x) => x.key === t.sections[0]);
      if (s) return s;
    }
  }
  // 4. Legacy path-prefix remap — applied BEFORE the item-scan so legacy
  //    URLs like /contacts, /calls, /signals resolve to the new section
  //    they now belong to (Leads / Call Center / Data Hub) instead of the
  //    hidden legacy "crm" section that still owns those item URLs for
  //    back-compat.
  for (const [prefix, key] of LEGACY_PATH_PREFIX_TO_SECTION) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      const s = SECTIONS.find((x) => x.key === key);
      if (s) return s;
    }
  }
  // 5. Last-resort: exact match on any section's items (covers /section/*
  //    items and oddball legacy hrefs not in LEGACY_PATH_PREFIX_TO_SECTION).
  for (const s of SECTIONS) {
    for (const item of s.items) {
      const path = item.href.split("#")[0];
      if (path === pathname) return s;
      if (path !== "/" && pathname.startsWith(path + "/")) return s;
    }
  }
  return null;
}

/** Returns the TopNavEntry that owns the given section key. */
export function findTopNavBySection(sectionKey: string): TopNavEntry | null {
  return TOP_NAV.find((t) => t.sections.includes(sectionKey)) ?? null;
}

/* ─── Per-persona top nav scopes ────────────────────────────────────
   Each persona sees ONLY the tabs they need. The role-scoped tabs are
   built from a mix of the standard six TOP_NAV entries and a handful
   of role-specific shells (Campaign Builder, Campaign Performance,
   MarkHub) defined in SECTIONS above. */

const ALL_TOP_NAV_ENTRIES: TopNavEntry[] = [
  ...TOP_NAV,
  // Marketing-only single-page tabs:
  { key: "tab-campaign-builder",     label: "Campaign Builder",         icon: Sparkles, sections: ["tab-campaign-builder"] },
  { key: "tab-campaign-performance", label: "Campaign Performance",     icon: Eye,      sections: ["tab-campaign-performance"] },
  { key: "tab-email-generator",      label: "Email & Message Generator", icon: Wand2,   sections: ["tab-email-generator"] },
  { key: "markhub",                  label: "MarkHub",                  icon: Layers,   sections: ["markhub"] },
];

/** Map of role.key → ordered list of TopNavEntry keys to show.
 *
 *  IMPORTANT: Sales Manager and CRM Admin must see EVERYTHING (full
 *  TOP_NAV including DataHub → Enrichment). They are intentionally
 *  NOT listed here so `getNavForRole` falls back to the full TOP_NAV.
 *  Sales Rep is scoped to remove the full Marketing module — they
 *  instead get a curated Campaign Briefing widget on /home that
 *  surfaces hot leads who clicked / interacted with campaigns.
 *  CEO and Marketing are scoped to their own curated surfaces.
 */
export const ROLE_NAV: Record<string, string[]> = {
  // CEO — exec dashboards, marketing performance, high-level pipeline.
  ceo:       ["home", "insights", "marketing", "leads"],
  // Sales Rep — daily operating surfaces. NO Marketing module.
  sales:     ["home", "leads", "callcenter", "datahub", "insights"],
  // Sales Manager — same as Sales Rep + team insights. NO Marketing.
  manager:   ["home", "leads", "callcenter", "datahub", "insights"],
  // CRM Admin — full access including Marketing.
  admin:     ["home", "leads", "callcenter", "datahub", "insights", "marketing"],
  // Marketing — ONLY marketing-relevant surfaces.
  marketing: ["home", "tab-campaign-builder", "tab-email-generator", "tab-campaign-performance", "markhub"],
};

/** Returns the TopNavEntry list that should be visible for a given role.
 *  Falls back to the full six-tab nav for unknown roles. */
export function getNavForRole(roleKey: string): TopNavEntry[] {
  const keys = ROLE_NAV[roleKey];
  if (!keys) return TOP_NAV;
  const out: TopNavEntry[] = [];
  for (const k of keys) {
    const entry = ALL_TOP_NAV_ENTRIES.find((e) => e.key === k);
    if (entry) out.push(entry);
  }
  return out;
}
