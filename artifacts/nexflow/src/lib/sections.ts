import {
  Sparkles, Activity, Bot, Briefcase, GitBranch, Users, Building2, Network,
  FileText, TrendingUp, ScanLine, Heart, Headphones, LayoutDashboard, Phone,
  Zap, Mic, BookOpen, Mail, Megaphone, Calendar, Layers, Target, Eye,
  CreditCard, Globe, Workflow, Wand2, Route, Database, BookText, BarChart3,
  UserSquare2, ListIcon, Filter, FileSpreadsheet, Settings, MoreHorizontal,
  Send, Share2, MessageSquare, Home as HomeIcon,
  type LucideIcon,
} from "lucide-react";

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
  {
    key: "home",
    label: "Home",
    icon: Sparkles,
    tagline: "Your AI-powered daily briefing.",
    accent: "#B8A0C8",
    defaultHref: "/home",
    items: [
      { icon: Sparkles, label: "Daily Briefing & Command Center", href: "/home",     desc: "AI briefing + one-tap actions" },
      { icon: Activity, label: "Daily Insights",                  href: "/insights", desc: "AI insights for your day" },
    ],
  },
  {
    key: "crm",
    label: "CRM",
    icon: Briefcase,
    tagline: "Pipeline, deals, contacts, and revenue intelligence.",
    accent: "#88B8B0",
    defaultHref: "/section/crm",
    items: [
      { icon: HomeIcon,    label: "CRM Workspace",        href: "/section/crm",   desc: "AI-powered CRM home" },
      { icon: LayoutDashboard, label: "CRM Dashboard",    href: "/crm-dashboard", desc: "Contacts, companies, lead-stage insights" },
      { icon: GitBranch,   label: "Pipeline",             href: "/pipeline",      desc: "Pre-SAL lead funnel + AI gap analysis" },
      { icon: TrendingUp,  label: "Deal Pipeline",        href: "/deal-pipeline", desc: "Post-SAL deals — drag-and-drop stages" },
      { icon: Users,       label: "Contacts",             href: "/contacts",      desc: "All people in your CRM" },
      { icon: MessageSquare, label: "Engagement Activities", href: "/engagement",  desc: "Calls, meetings, emails — with AI analysis" },
      { icon: Building2,   label: "Companies & Accounts", href: "/companies",     desc: "Accounts + Account Hub (ABM)" },
      { icon: TrendingUp,  label: "Forecasting",          href: "/forecasting",   desc: "Pipeline + revenue forecast" },
    ],
  },
  {
    key: "callcenter",
    label: "Contact Center",
    icon: Headphones,
    tagline: "Voice, AI agents, and conversational intelligence.",
    accent: "#C0A0B8",
    defaultHref: "/section/callcenter",
    items: [
      { icon: HomeIcon,        label: "Contact Center Workspace", href: "/section/callcenter",         desc: "Live voice activity & AI coaching" },
      { icon: Zap,             label: "Power Dialer",             href: "/power-dialer",               desc: "Live calling — manual, auto-dial, or AI agent" },
      { icon: Phone,           label: "Calls & Transcripts",      href: "/calls",                      desc: "Call scoring, action plans & conversation intel" },
      { icon: Send,            label: "Post-Call Automation",     href: "/post-call-automation",       desc: "Email, WhatsApp & AI follow-up cadences" },
      { icon: LayoutDashboard, label: "Call Dashboard",           href: "/call-list",                  desc: "Live call activity feed" },
      { icon: Settings,        label: "Contact Center Setup",     href: "/contact-center-setup",       desc: "AI Voice Agent, Knowledge Base & guardrails" },
    ],
  },
  {
    key: "enrichment",
    label: "Enrichment",
    icon: Database,
    tagline: "Find new leads. Enrich existing ones. GCC-first data.",
    accent: "#B8B880",
    defaultHref: "/section/enrichment",
    items: [
      { icon: HomeIcon, label: "Enrichment Workspace", href: "/section/enrichment", desc: "Daily briefing, KPIs & top signals" },
      { icon: Database, label: "Enrichment Engine",    href: "/enrichment-engine",  desc: "Prospecting · Signals · Lists · Dedup · Cards · History" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    tagline: "AI-powered campaigns from seed → publish → measure.",
    accent: "#C8A880",
    defaultHref: "/section/marketing",
    items: [
      { icon: HomeIcon,        label: "Marketing Workspace",    href: "/section/marketing",      desc: "Briefing, KPIs & top alerts" },
      { icon: LayoutDashboard, label: "Marketing Dashboard",    href: "/marketing-dashboard",    desc: "AI analysis · winning points · pain points · how to win" },
      { icon: Sparkles,        label: "Campaign Builder",       href: "/campaign-builder",       desc: "AI builder · manual upload · publishing · cultural intel" },
      { icon: GitBranch,       label: "Sequences & Audiences",  href: "/sequences-audiences",    desc: "Cadences · templates · segments in one place" },
      { icon: FileText,        label: "Web Forms",              href: "/web-forms",              desc: "Build & predict — AI form creator + ad-funnel forms" },
      { icon: Eye,             label: "Campaign Performance",   href: "/campaign-performance",   desc: "Per-campaign deep dive · hot lead alerts" },
    ],
  },
  // ─── Sections grouped under "More" ──────────────────────────────────────
  {
    key: "automation",
    label: "Automation",
    icon: Workflow,
    tagline: "Visual workflows, rules, and custom AI agents.",
    accent: "#90B8B8",
    defaultHref: "/workflows",
    items: [
      { icon: Workflow, label: "Workflow Builder", href: "/workflows",         desc: "Visual automation flows" },
      { icon: Zap,      label: "Automation Rules", href: "/automation",        desc: "If-this-then-that rules" },
      { icon: Wand2,    label: "Agent Builder",    href: "/agents",            desc: "Build custom AI agents" },
      { icon: Route,    label: "Lead Routing",     href: "/lead-routing",      desc: "Auto-assign to reps" },
      { icon: Mail,     label: "Activity Capture", href: "/activity-capture",  desc: "Auto-log emails & calls" },
    ],
  },
  {
    key: "ai",
    label: "AI Hub",
    icon: Bot,
    tagline: "Your AI workforce. Predictions, agents, and playbooks.",
    accent: "#A090C8",
    defaultHref: "/ai",
    items: [
      { icon: Bot,      label: "AI Workforce",    href: "/ai",         desc: "Your virtual SDR team" },
      { icon: Sparkles, label: "Predictive",      href: "/predictive", desc: "Forecasts & risk" },
      { icon: BookText, label: "Sales Playbooks", href: "/playbooks",  desc: "Battle-tested plays" },
    ],
  },
  {
    key: "insights",
    label: "Insights & Analytics",
    icon: BarChart3,
    tagline: "Dashboards, attribution, and team performance.",
    accent: "#88B8B0",
    defaultHref: "/dashboards",
    items: [
      { icon: LayoutDashboard, label: "Dashboards",       href: "/dashboards",     desc: "Custom dashboards" },
      { icon: FileText,        label: "Reports",          href: "/reports",        desc: "Saved reports" },
      { icon: BarChart3,       label: "Analytics",        href: "/analytics",      desc: "Funnel & KPI deep dive" },
      { icon: UserSquare2,     label: "Team Performance", href: "/team",           desc: "Rep leaderboards" },
      { icon: BarChart3,       label: "Attribution",      href: "/attribution",    desc: "Revenue attribution" },
      { icon: BarChart3,       label: "Report Builder",   href: "/report-builder", desc: "Build new reports" },
      { icon: Heart,           label: "Health Scores",    href: "/health-scores",  desc: "Account engagement health" },
    ],
  },
  {
    key: "data",
    label: "Data Tools",
    icon: Database,
    tagline: "Your CRM data layer — lists, segments, properties.",
    accent: "#C0A0B8",
    defaultHref: "/lists",
    items: [
      { icon: ListIcon,        label: "Lists",         href: "/lists",        desc: "Static & dynamic lists" },
      { icon: Target,          label: "Segments",      href: "/segments",     desc: "Smart segments" },
      { icon: GitBranch,       label: "Deduplication", href: "/dedup",        desc: "Merge duplicate contacts" },
      { icon: FileSpreadsheet, label: "Migration",     href: "/migration",    desc: "CSV import/export" },
      { icon: Filter,          label: "Properties",    href: "/account-settings/properties", desc: "Custom fields" },
      { icon: FileText,        label: "Quotes & CPQ",  href: "/quotes",       desc: "Send quotes & contracts" },
    ],
  },
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
];

/**
 * The 6 visible top-bar buttons. Each one maps to one or more SECTIONS:
 *   - Single-section entries (Home, CRM, Contact Center, Enrichment, Marketing)
 *     navigate directly and show that section's items in the hover dropdown.
 *   - The "More" entry maps to a list of sections — its hover dropdown shows
 *     each grouped section as a categorized sub-list.
 */
export interface TopNavEntry {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Section keys this entry covers, in order. Single-section for the first
   *  five; multi-section for "more". */
  sections: string[];
}

export const TOP_NAV: TopNavEntry[] = [
  { key: "home",       label: "Home",           icon: Sparkles,        sections: ["home"] },
  { key: "crm",        label: "CRM",            icon: Briefcase,       sections: ["crm"] },
  { key: "callcenter", label: "Contact Center", icon: Headphones,      sections: ["callcenter"] },
  { key: "enrichment", label: "Enrichment",     icon: Database,        sections: ["enrichment"] },
  { key: "marketing",  label: "Marketing",      icon: Megaphone,       sections: ["marketing"] },
  { key: "more",       label: "More",           icon: MoreHorizontal,  sections: ["automation", "ai", "insights", "data", "settings"] },
];

/** Reverse lookup: returns the section the given route belongs to, or null. */
export function findSectionByRoute(pathname: string): SectionDef | null {
  // First, exact match on hub route /section/<key>
  const hubMatch = pathname.match(/^\/section\/([\w-]+)/);
  if (hubMatch) {
    const s = SECTIONS.find((x) => x.key === hubMatch[1]);
    if (s) return s;
  }
  // Otherwise, find the section whose item matches this route
  for (const s of SECTIONS) {
    for (const item of s.items) {
      if (item.href === pathname) return s;
      if (item.href !== "/" && pathname.startsWith(item.href + "/")) return s;
    }
  }
  // Special-case routes that don't appear in items but logically belong somewhere
  if (pathname === "/accounts" || pathname.startsWith("/accounts/")) {
    return SECTIONS.find((s) => s.key === "crm") ?? null;
  }
  if (pathname === "/funnel" || pathname === "/deals") {
    return SECTIONS.find((s) => s.key === "crm") ?? null;
  }
  // Home fallback only for the Home root path
  if (pathname === "/home") return SECTIONS.find((s) => s.key === "home") ?? null;
  return null;
}

/** Returns the TopNavEntry that owns the given section key. */
export function findTopNavBySection(sectionKey: string): TopNavEntry | null {
  return TOP_NAV.find((t) => t.sections.includes(sectionKey)) ?? null;
}
