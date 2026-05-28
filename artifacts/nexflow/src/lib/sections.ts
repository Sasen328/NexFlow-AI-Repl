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
  /** Optional group header rendered above this item in the sidebar.
   *  Items sharing the same group label are visually clustered. */
  group?: string;
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
    items: [],
  },

  // ─── 2. CRM (was "Pipeline") ───────────────────────────────────────
  {
    key: "leads",
    label: "CRM",
    icon: GitBranch,
    tagline: "People · Companies · Deals · Command Center.",
    accent: "#88B8B0",
    defaultHref: "/command-center",
    items: [
      { icon: Sparkles,   label: "Command Center",  href: "/command-center", desc: "Live scorecards · push actions to any contact · search & jump", group: "Command" },
      { icon: Users,      label: "Contacts",        href: "/contacts",       desc: "All contacts · enrich · score · history" },
      { icon: Building2,  label: "Companies",       href: "/companies",      desc: "Accounts · revenue · contacts roster" },
      { icon: GitBranch,  label: "Deals",           href: "/deal-pipeline",  desc: "Kanban pipeline · stages · win/loss" },
      { icon: GitBranch,  label: "Sequences",       href: "/sequences-audiences", desc: "Multi-touch cadences · automation rules · templates", group: "Automation" },
      { icon: Layers,     label: "Templates",       href: "/templates",      desc: "Reusable email · WhatsApp · script templates", group: "Automation" },
      { icon: Target,     label: "Segments",        href: "/segments",       desc: "Dynamic segments, filters, smart lists", group: "Automation" },
    ],
  },

  // ─── 3. Call Center ────────────────────────────────────────────────
  {
    key: "callcenter",
    label: "Comms",
    icon: MessageSquare,
    tagline: "Dashboard · Dialer · Calls · AI Text · Command Center.",
    accent: "#C0A0B8",
    defaultHref: "/callcenter/dashboard",
    items: [
      { icon: BarChart3,       label: "Dashboard",           href: "/callcenter/dashboard",      desc: "Comms overview — KPIs · queues · AI insights · live status" },
      { icon: Phone,           label: "Dialer",              href: "/power-dialer",              desc: "Outbound calls — Manual · Auto-dial · AI Agent" },
      { icon: Phone,           label: "Calls & Transcripts", href: "/callcenter/calls",          desc: "History · transcripts · scoring · sentiment — pushed to lead timeline" },
      { icon: MessageSquare,   label: "AI Text",             href: "/callcenter/messages",       desc: "AI-driven WhatsApp + Email — auto-reply, push-to-todo, bilingual" },
      { icon: Bot,             label: "AI Voice Agent",      href: "/callcenter/agent",          desc: "Automated callers · settings & deployments", group: "Command Center" },
      { icon: Layers,          label: "Templates",           href: "/templates",                 desc: "Reusable scripts · email · WhatsApp templates",  group: "Command Center" },
      { icon: BookOpen,        label: "Knowledge Base",      href: "/callcenter/knowledge-base", desc: "Talk tracks · objections · playbooks",           group: "Command Center" },
      { icon: Bot,             label: "AI Workforce",        href: "/datahub/workforce",         desc: "Custom AI agents, prompts & scoring — build and deploy AI reps", group: "Capabilities" },
    ],
  },

  // ─── 4. Enrichment ─────────────────────────────────────────────────
  {
    key: "datahub",
    label: "★ Enrichment",
    icon: Database,
    tagline: "Lead Generation · CRM Enrichment · Settings.",
    accent: "#B8A0C8",
    defaultHref: "/enrichment-engine",
    items: [
      { icon: Search,    label: "Lead Generation",  href: "/enrichment-engine",         desc: "Masar DB · AI Builder · Website Intel · Company & Person profiles" },
      { icon: Sparkles,  label: "CRM Enrichment",   href: "/enrichment-engine/enrich",   desc: "Quick Enrich · Bulk Upload · Card Scanner" },
      { icon: Settings,  label: "Settings",          href: "/enrichment-engine/settings", desc: "Waterfall sources · Dedup · API keys · export history" },
    ],
  },

  // ─── 5. Marketing ─────────────────────────────────────────────────
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
      { icon: Layers,     label: "Hub Pro",       href: "/marketing-hub-pro",  desc: "Landing pages · A/B testing · lead scoring · attribution (HubSpot-style)" },
      { icon: FileText,   label: "Templates",     href: "/templates",          desc: "Email/WhatsApp/SMS message templates" },
      { icon: GitBranch,  label: "Sequences",     href: "/sequences-audiences",desc: "Cadences and multi-touch journeys" },
      { icon: Users,      label: "Audiences",     href: "/audiences",          desc: "Segments and target lists" },
      { icon: FileText,   label: "Web Forms",     href: "/web-forms",          desc: "AI form creator + ad-funnel forms" },
    ],
  },

  // ─── Single-page tab shells ────────────────────────────────────────
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

  // ─── Settings ─────────────────────────────────────────────────────
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

  // ─── Hidden legacy sections — kept ONLY so legacy deep links resolve ─
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
 * The SIX visible top-bar buttons.
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
  { key: "leads",      label: "CRM",          icon: GitBranch,     sections: ["leads"] },
  { key: "callcenter", label: "Comms",        icon: MessageSquare, sections: ["callcenter"] },
  { key: "datahub",    label: "★ Enrichment", icon: Database,      sections: ["datahub"] },
  { key: "marketing",  label: "Growth",       icon: Megaphone,     sections: ["marketing"] },
  { key: "insights",   label: "Insights",     icon: BarChart3,     sections: ["insights"] },
];

// ─── Legacy path → section key remap ────────────────────────────────
const LEGACY_PATH_PREFIX_TO_SECTION: Array<[string, string]> = [
  ["/pipeline",          "leads"],
  ["/deal-pipeline",     "leads"],
  ["/deals",             "leads"],
  ["/command-center",    "leads"],
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
  if (pathname === "/home" || pathname.startsWith("/home#")) {
    return SECTIONS.find((s) => s.key === "home") ?? null;
  }
  const hubMatch = pathname.match(/^\/section\/([\w-]+)/);
  if (hubMatch) {
    const s = SECTIONS.find((x) => x.key === hubMatch[1]);
    if (s) return s;
  }
  for (const t of TOP_NAV) {
    if (pathname === `/${t.key}` || pathname.startsWith(`/${t.key}/`)) {
      const s = SECTIONS.find((x) => x.key === t.sections[0]);
      if (s) return s;
    }
  }
  for (const [prefix, key] of LEGACY_PATH_PREFIX_TO_SECTION) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      const s = SECTIONS.find((x) => x.key === key);
      if (s) return s;
    }
  }
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

/* ─── Per-persona top nav scopes ──────────────────────────────────── */

const ALL_TOP_NAV_ENTRIES: TopNavEntry[] = [
  ...TOP_NAV,
  { key: "tab-campaign-builder",     label: "Campaign Builder",         icon: Sparkles, sections: ["tab-campaign-builder"] },
  { key: "tab-campaign-performance", label: "Campaign Performance",     icon: Eye,      sections: ["tab-campaign-performance"] },
  { key: "tab-email-generator",      label: "Email & Message Generator", icon: Wand2,   sections: ["tab-email-generator"] },
  { key: "markhub",                  label: "MarkHub",                  icon: Layers,   sections: ["markhub"] },
];

export const ROLE_NAV: Record<string, string[]> = {
  ceo:       ["home", "insights"],
  sales:     ["home", "leads", "callcenter", "datahub", "marketing", "insights"],
  manager:   ["home", "leads", "callcenter", "datahub", "marketing", "insights"],
  admin:     ["home", "leads", "callcenter", "datahub", "marketing", "insights"],
  marketing: ["home", "tab-campaign-builder", "tab-email-generator", "tab-campaign-performance", "markhub"],
};

/** Returns the TopNavEntry list that should be visible for a given role. */
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
