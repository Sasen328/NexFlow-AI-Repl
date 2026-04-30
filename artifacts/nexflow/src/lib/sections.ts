import {
  Sparkles, Activity, Bot, Briefcase, GitBranch, Users, Building2, Network,
  FileText, TrendingUp, ScanLine, Heart, Headphones, LayoutDashboard, Phone,
  Zap, Mic, BookOpen, Mail, Megaphone, Calendar, Layers, Target, Eye,
  CreditCard, Globe, Workflow, Wand2, Route, Database, BookText, BarChart3,
  UserSquare2, ListIcon, Filter, FileSpreadsheet, Settings, MoreHorizontal,
  Send, Share2, MessageSquare, Home as HomeIcon, AlertCircle, Search,
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
      { icon: Sparkles, label: "Daily Briefing",  href: "/home",     desc: "AI-generated overview of your day" },
      { icon: BarChart3, label: "Performance",    href: "/home#performance", desc: "Live KPIs and trend strip" },
      { icon: ListIcon,  label: "To-Do",          href: "/home#todo", desc: "AI-prioritised tasks for today" },
      { icon: Activity,  label: "Daily Insights", href: "/insights", desc: "Signal feed + recommended actions" },
    ],
  },

  // ─── 2. Leads (rename of CRM) ─────────────────────────────────────
  {
    key: "leads",
    label: "Leads",
    icon: Briefcase,
    tagline: "Pipeline, deals, lists, research.",
    accent: "#88B8B0",
    defaultHref: "/leads/pipeline",
    items: [
      { icon: GitBranch,    label: "Pipeline & Deals", href: "/leads/pipeline",   desc: "Lead funnel + post-SAL deal stages in one view" },
      { icon: Users,        label: "Lists",            href: "/leads/lists",      desc: "Contacts, companies, static & dynamic lists" },
      { icon: Search,       label: "Research",         href: "/leads/research",   desc: "Account & contact research with AI signals" },
      { icon: AlertCircle,  label: "Forgotten Leads",  href: "/leads/forgotten",  desc: "Idle 90+ days but with a fresh signal" },
    ],
  },

  // ─── 3. Call Center (rename of Contact Center) ────────────────────
  {
    key: "callcenter",
    label: "Call Center",
    icon: Headphones,
    tagline: "Voice, AI agents, knowledge, and messages.",
    accent: "#C0A0B8",
    defaultHref: "/callcenter/dashboard",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",          href: "/callcenter/dashboard",      desc: "Today's calls, heatmap, leaderboard, predictive" },
      { icon: Phone,           label: "Calls & Transcripts", href: "/callcenter/calls",         desc: "Call scoring, live coaching, objection handler" },
      { icon: Bot,             label: "AI Agent",            href: "/callcenter/agent",         desc: "Voice agent settings & deployments" },
      { icon: BookOpen,        label: "Knowledge Base",      href: "/callcenter/knowledge-base", desc: "Scripts · Objections · Playbooks · Company insights" },
      { icon: MessageSquare,   label: "Messages",            href: "/callcenter/messages",      desc: "WhatsApp + Email in one inbox" },
    ],
  },

  // ─── 4. Data Hub (merge Enrichment + Data Tools) ──────────────────
  {
    key: "datahub",
    label: "Data Hub",
    icon: Database,
    tagline: "Segments, enrichment, AI workforce, signals.",
    accent: "#B8B880",
    defaultHref: "/datahub/segments",
    items: [
      { icon: Target,   label: "Segments",     href: "/datahub/segments",   desc: "Dynamic segments, filters, smart lists" },
      { icon: Database, label: "Enrichment",   href: "/datahub/enrichment", desc: "Waterfall enrichment + buying signals" },
      { icon: Bot,      label: "AI Workforce", href: "/datahub/workforce",  desc: "Custom AI agents, prompts & scoring" },
      { icon: Zap,      label: "Signals",      href: "/datahub/signals",    desc: "Funding, hiring, intent, news" },
    ],
  },

  // ─── 5. Marketing (kept from prior overhaul) ──────────────────────
  {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    tagline: "AI-powered campaigns from seed → publish → measure.",
    accent: "#C8A880",
    defaultHref: "/marketing-dashboard",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",            href: "/marketing-dashboard",   desc: "AI analysis · winning points · pain points · how to win" },
      { icon: Sparkles,        label: "Campaign Builder",     href: "/campaign-builder",      desc: "AI builder · manual upload · publishing · cultural intel" },
      { icon: GitBranch,       label: "Sequences & Audiences", href: "/sequences-audiences",  desc: "Cadences · templates · segments in one place" },
      { icon: FileText,        label: "Web Forms",            href: "/web-forms",             desc: "AI form creator + ad-funnel forms" },
      { icon: Eye,             label: "Campaign Performance", href: "/campaign-performance",  desc: "Per-campaign deep dive · hot lead alerts" },
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
  { key: "home",       label: "Home",        icon: Sparkles,    sections: ["home"] },
  { key: "leads",      label: "Leads",       icon: Briefcase,   sections: ["leads"] },
  { key: "callcenter", label: "Call Center", icon: Headphones,  sections: ["callcenter"] },
  { key: "datahub",    label: "Data Hub",    icon: Database,    sections: ["datahub"] },
  { key: "marketing",  label: "Marketing",   icon: Megaphone,   sections: ["marketing"] },
  { key: "insights",   label: "Insights",    icon: BarChart3,   sections: ["insights"] },
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
  ["/sequences-audiences","marketing"],
  ["/sequences",          "marketing"],
  ["/web-forms",          "marketing"],
  ["/campaign-performance","marketing"],
  ["/campaigns",          "marketing"],
  ["/templates",          "marketing"],
  ["/audiences",          "marketing"],
  ["/cultural-intelligence","marketing"],

  ["/dashboards",         "insights"],
  ["/dashboard",          "insights"],
  ["/reports",            "insights"],
  ["/analytics",          "insights"],
  ["/predictive",         "insights"],
  ["/team",               "insights"],
  ["/attribution",        "insights"],
  ["/health-scores",      "insights"],
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
