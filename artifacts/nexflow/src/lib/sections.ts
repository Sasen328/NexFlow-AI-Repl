import {
  Sparkles, Activity, Bot, Briefcase, GitBranch, Users, Building2, Network,
  FileText, TrendingUp, ScanLine, Heart, Headphones, LayoutDashboard, Phone,
  Zap, Mic, BookOpen, Mail, Megaphone, Calendar, Layers, Target, Eye,
  CreditCard, Globe, Workflow, Wand2, Route, Database, BookText, BarChart3,
  UserSquare2, ListIcon, Filter, FileSpreadsheet, Settings, MoreHorizontal,
  Send, Share2,
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
      { icon: Sparkles, label: "Command Center", href: "/home",      desc: "Daily briefing & priorities" },
      { icon: Activity, label: "Daily Insights",  href: "/insights",  desc: "AI insights for your day" },
      { icon: Bot,      label: "AI Assistant",    href: "/assistant", desc: "Chat with NexFlow AI" },
    ],
  },
  {
    key: "crm",
    label: "CRM",
    icon: Briefcase,
    tagline: "Pipeline, deals, and revenue intelligence.",
    accent: "#88B8B0",
    defaultHref: "/funnel",
    items: [
      { icon: GitBranch,  label: "Pipeline & Deals",  href: "/funnel",        desc: "Drag-and-drop deal stages" },
      { icon: Users,      label: "Contacts",          href: "/contacts",      desc: "All people in your CRM" },
      { icon: Building2,  label: "Companies",         href: "/companies",     desc: "Accounts & domains" },
      { icon: Network,    label: "Account Hub (ABM)", href: "/accounts",      desc: "Account-based selling" },
      { icon: FileText,   label: "Quotes & CPQ",      href: "/quotes",        desc: "Send quotes & contracts" },
      { icon: TrendingUp, label: "Forecasting",       href: "/forecasting",   desc: "Pipeline + revenue forecast" },
      { icon: Heart,      label: "Health Scores",     href: "/health-scores", desc: "Account engagement health" },
    ],
  },
  {
    key: "callcenter",
    label: "Contact Center",
    icon: Headphones,
    tagline: "Voice, AI agents, and conversational intelligence.",
    accent: "#C0A0B8",
    defaultHref: "/call-list",
    items: [
      { icon: LayoutDashboard, label: "Call Dashboard",      href: "/call-list",                  desc: "Live call activity" },
      { icon: Zap,             label: "Power Dialer",        href: "/power-dialer",               desc: "AI-prioritized outbound" },
      { icon: Phone,           label: "Calls & Transcripts", href: "/calls",                      desc: "Call history + AI notes" },
      { icon: Mic,             label: "Conversation Intel",  href: "/conversation-intelligence",  desc: "Coach & analyze calls" },
      { icon: Bot,             label: "AI Voice Agent",      href: "/voice-agents",               desc: "AI dials for you" },
      { icon: BookOpen,        label: "Knowledge Base",      href: "/scripts",                    desc: "Playbooks & scripts" },
      { icon: Mail,            label: "Email",               href: "/email",                      desc: "1-to-1 email" },
      { icon: Mail,            label: "Messages",            href: "/messages",                   desc: "Unified inbox" },
      { icon: Mail,            label: "WhatsApp",            href: "/whatsapp",                   desc: "WhatsApp business" },
    ],
  },
  {
    key: "enrichment",
    label: "Enrichment",
    icon: Database,
    tagline: "Find new leads. Enrich existing ones. GCC-first data.",
    accent: "#B8B880",
    defaultHref: "/sourcing",
    items: [
      { icon: Database, label: "Bulk Enrichment",   href: "/sourcing",       desc: "Find new leads · Clay-style waterfall" },
      { icon: Wand2,    label: "Quick Enrich Lead", href: "/lead-enrich",    desc: "Single-shot AI enrichment" },
      { icon: ScanLine, label: "Card Scanner",      href: "/business-cards", desc: "Scan biz cards into CRM" },
      { icon: Zap,      label: "Buying Signals",    href: "/signals",        desc: "Funding, hiring, intent signals" },
      { icon: Sparkles, label: "Lead Intelligence", href: "/intelligence",   desc: "AI scoring & prioritization" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    tagline: "Launch campaigns, push to every channel, watch what works.",
    accent: "#C8A880",
    defaultHref: "/campaigns",
    items: [
      { icon: Megaphone,  label: "Campaigns",             href: "/campaigns",             desc: "Launch & manage all outreach" },
      { icon: Send,       label: "Channels & Publishing", href: "/channels",              desc: "Push to LinkedIn, X, Insta, WhatsApp" },
      { icon: GitBranch,  label: "Sequences",             href: "/sequences",             desc: "Build automated multi-step cadences" },
      { icon: Layers,     label: "Templates",             href: "/templates",             desc: "Reuse on-brand content blocks" },
      { icon: Target,     label: "Audiences",             href: "/audiences",             desc: "Build & sync target segments" },
      { icon: FileText,   label: "Web Forms",             href: "/web-forms",             desc: "Capture leads from any site" },
      { icon: Eye,        label: "Engagement Tracker",    href: "/document-tracking",     desc: "See who opened what, when" },
      { icon: Sparkles,   label: "Marketing AI",          href: "/marketing-assistant",   desc: "Generate plans, copy, sequences" },
      { icon: Globe,      label: "Cultural Intelligence", href: "/cultural-intelligence", desc: "Khaleeji + GCC localization" },
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
  // Home fallback only for the Home root path
  if (pathname === "/home") return SECTIONS.find((s) => s.key === "home") ?? null;
  return null;
}

/** Returns the TopNavEntry that owns the given section key. */
export function findTopNavBySection(sectionKey: string): TopNavEntry | null {
  return TOP_NAV.find((t) => t.sections.includes(sectionKey)) ?? null;
}
