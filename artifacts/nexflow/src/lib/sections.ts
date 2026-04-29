import {
  Sparkles, Activity, Bot, Briefcase, GitBranch, Users, Building2, Network,
  FileText, TrendingUp, ScanLine, Heart, Headphones, LayoutDashboard, Phone,
  Zap, Mic, BookOpen, Mail, Megaphone, Calendar, Layers, Target, Eye,
  CreditCard, Globe, Workflow, Wand2, Route, Database, BookText, BarChart3,
  UserSquare2, ListIcon, Filter, FileSpreadsheet,
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
  items: SectionItem[];
}

export const SECTIONS: SectionDef[] = [
  {
    key: "home",
    label: "Home",
    icon: Sparkles,
    tagline: "Your AI-powered daily briefing.",
    accent: "#B8A0C8",
    items: [
      { icon: Sparkles, label: "Command Center", href: "/", desc: "Daily briefing & priorities" },
      { icon: Activity, label: "Daily Insights", href: "/insights", desc: "AI insights for your day" },
      { icon: Bot,      label: "AI Assistant",   href: "/assistant", desc: "Chat with NexFlow AI" },
    ],
  },
  {
    key: "sales",
    label: "Sales",
    icon: Briefcase,
    tagline: "Pipeline, deals, and revenue intelligence.",
    accent: "#88B8B0",
    items: [
      { icon: GitBranch,  label: "Pipeline & Deals",  href: "/funnel",         desc: "Drag-and-drop deal stages" },
      { icon: Users,      label: "Contacts",          href: "/contacts",       desc: "All people in your CRM" },
      { icon: Building2,  label: "Companies",         href: "/companies",      desc: "Accounts & domains" },
      { icon: Network,    label: "Account Hub (ABM)", href: "/accounts",       desc: "Account-based selling" },
      { icon: FileText,   label: "Quotes & CPQ",      href: "/quotes",         desc: "Send quotes & contracts" },
      { icon: TrendingUp, label: "Forecasting",       href: "/forecasting",    desc: "Pipeline + revenue forecast" },
      { icon: ScanLine,   label: "Card Scanner",      href: "/business-cards", desc: "Scan biz cards into CRM" },
      { icon: Heart,      label: "Health Scores",     href: "/health-scores",  desc: "Account engagement health" },
    ],
  },
  {
    key: "callcenter",
    label: "Call Center",
    icon: Headphones,
    tagline: "Voice, AI agents, and conversational intelligence.",
    accent: "#C0A0B8",
    items: [
      { icon: LayoutDashboard, label: "Call Dashboard",      href: "/call-list",                  desc: "Live call activity" },
      { icon: Phone,           label: "Calls & Transcripts", href: "/calls",                      desc: "Call history + AI notes" },
      { icon: Zap,             label: "Power Dialer",        href: "/power-dialer",               desc: "AI-prioritized outbound" },
      { icon: Mic,             label: "Conversation Intel",  href: "/conversation-intelligence",  desc: "Coach & analyze calls" },
      { icon: Bot,             label: "AI Voice Agent",      href: "/voice-agents",               desc: "AI dials for you" },
      { icon: BookOpen,        label: "Knowledge Base",      href: "/scripts",                    desc: "Playbooks & scripts" },
      { icon: Mail,            label: "Email",               href: "/email",                      desc: "1-to-1 email" },
      { icon: Mail,            label: "Messages",            href: "/messages",                   desc: "Unified inbox" },
      { icon: Mail,            label: "WhatsApp",            href: "/whatsapp",                   desc: "WhatsApp business" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    tagline: "Campaigns, sequences, and AI-driven growth.",
    accent: "#C8A880",
    items: [
      { icon: Megaphone,  label: "Campaigns",             href: "/campaigns",             desc: "Email + multi-platform" },
      { icon: GitBranch,  label: "Sequences",             href: "/sequences",             desc: "Automated cadences" },
      { icon: Sparkles,   label: "Marketing AI",          href: "/marketing-assistant",   desc: "AI marketing assistant" },
      { icon: Calendar,   label: "Meetings",              href: "/meetings",              desc: "Booked meetings" },
      { icon: Layers,     label: "Templates",             href: "/templates",             desc: "Reusable content" },
      { icon: Target,     label: "Audiences",             href: "/audiences",             desc: "Segments for outreach" },
      { icon: FileText,   label: "Web Forms",             href: "/web-forms",             desc: "Lead capture forms" },
      { icon: Eye,        label: "Document Tracking",     href: "/document-tracking",     desc: "Who viewed what" },
      { icon: CreditCard, label: "Quote-to-Cash",         href: "/quote-to-cash",         desc: "Close to revenue" },
      { icon: Globe,      label: "Cultural Intelligence", href: "/cultural-intelligence", desc: "GCC localization" },
    ],
  },
  {
    key: "enrichment",
    label: "Enrichment",
    icon: Database,
    tagline: "Find new leads. Enrich existing ones. GCC-first data.",
    accent: "#B8B880",
    items: [
      { icon: Database, label: "Bulk Enrichment",  href: "/sourcing",     desc: "Find new leads · Clay-style waterfall" },
      { icon: Wand2,    label: "Quick Enrich Lead", href: "/lead-enrich",  desc: "Single-shot AI enrichment" },
      { icon: Zap,      label: "Buying Signals",   href: "/signals",      desc: "Funding, hiring, intent signals" },
      { icon: Sparkles, label: "Lead Intelligence", href: "/intelligence", desc: "AI scoring & prioritization" },
    ],
  },
  {
    key: "automation",
    label: "Automation",
    icon: Workflow,
    tagline: "Visual workflows, rules, and custom AI agents.",
    accent: "#90B8B8",
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
    items: [
      { icon: Bot,      label: "AI Workforce",       href: "/ai",           desc: "Your virtual SDR team" },
      { icon: Sparkles, label: "Predictive",         href: "/predictive",   desc: "Forecasts & risk" },
      { icon: BookText, label: "Sales Playbooks",    href: "/playbooks",    desc: "Battle-tested plays" },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
    tagline: "Dashboards, attribution, and team performance.",
    accent: "#88B8B0",
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
    label: "Data",
    icon: Database,
    tagline: "Your CRM data layer — lists, segments, properties.",
    accent: "#C0A0B8",
    items: [
      { icon: ListIcon,        label: "Lists",         href: "/lists",        desc: "Static & dynamic lists" },
      { icon: Target,          label: "Segments",      href: "/segments",     desc: "Smart segments" },
      { icon: GitBranch,       label: "Deduplication", href: "/dedup",        desc: "Merge duplicate contacts" },
      { icon: FileSpreadsheet, label: "Migration",     href: "/migration",    desc: "CSV import/export" },
      { icon: Filter,          label: "Properties",    href: "/account-settings/properties", desc: "Custom fields" },
    ],
  },
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
  if (pathname === "/") return SECTIONS.find((s) => s.key === "home") ?? null;
  return null;
}
