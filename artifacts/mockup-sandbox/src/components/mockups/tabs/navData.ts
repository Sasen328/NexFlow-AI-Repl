import {
  Home, Users, Phone, Database, Megaphone, BarChart3,
  CircleDot, Flame, Clock, CheckCircle2, XCircle,
  User, RefreshCw, Bot, Star, MessageSquare, Inbox, GitBranch,
  Search, Zap, CreditCard, Upload, GitMerge, History,
  Filter, Wand2, PenLine, Send, List, FileText,
  LayoutDashboard, Mic, BookOpen, Shield,
  TrendingUp, Calendar, Building2, BadgeCheck,
  type LucideIcon,
} from "lucide-react";

export type SubSubItem = { key: string; label: string; icon: LucideIcon };
export type SubItem = { key: string; label: string; items: SubSubItem[] };
export type NavSection = {
  key: string; label: string; icon: LucideIcon; color: string;
  subs: SubItem[];
};

export const NAV: NavSection[] = [
  {
    key: "home", label: "Home", icon: Home, color: "#A78BFA",
    subs: [
      { key: "briefing", label: "Daily Briefing", items: [] },
      { key: "command",  label: "Command Center", items: [] },
    ],
  },
  {
    key: "crm", label: "CRM", icon: Users, color: "#34D399",
    subs: [
      { key: "dashboard",  label: "Dashboard",     items: [] },
      { key: "pipeline",   label: "Pipeline",      items: [
        { key: "presal",  label: "Pre-SAL",    icon: CircleDot    },
        { key: "active",  label: "Active",     icon: Flame        },
        { key: "stalled", label: "Stalled",    icon: Clock        },
        { key: "won",     label: "Won",        icon: CheckCircle2 },
        { key: "lost",    label: "Lost",       icon: XCircle      },
      ]},
      { key: "deals",      label: "Deal Pipeline", items: [] },
      { key: "contacts",   label: "Contacts",      items: [] },
      { key: "engagement", label: "Engagement",    items: [
        { key: "all",      label: "All",        icon: List         },
        { key: "calls",    label: "Calls",      icon: Phone        },
        { key: "meetings", label: "Meetings",   icon: Calendar     },
      ]},
      { key: "companies",  label: "Companies",     items: [
        { key: "grid",     label: "Companies",  icon: Building2    },
        { key: "hub",      label: "Account Hub",icon: BadgeCheck   },
      ]},
      { key: "forecast",   label: "Forecasting",   items: [] },
    ],
  },
  {
    key: "callcenter", label: "Call Center", icon: Phone, color: "#FB923C",
    subs: [
      { key: "dialer",   label: "Power Dialer",       items: [
        { key: "manual",   label: "Manual",         icon: User        },
        { key: "autodial", label: "Auto-Dial",      icon: RefreshCw   },
        { key: "aiagent",  label: "AI Agent",       icon: Bot         },
      ]},
      { key: "calls",    label: "Calls & Transcripts", items: [
        { key: "scoring",  label: "Call Scoring",   icon: Star        },
        { key: "intel",    label: "Conv. Intel",    icon: MessageSquare},
      ]},
      { key: "postcall", label: "Post-Call Auto",     items: [
        { key: "queue",    label: "Approval Queue", icon: Inbox       },
        { key: "cadence",  label: "Cadence Rules",  icon: GitBranch   },
        { key: "inbox",    label: "Inbox",          icon: MessageSquare},
      ]},
      { key: "calldash", label: "Call Dashboard",     items: [] },
      { key: "setup",    label: "Setup",              items: [
        { key: "overview", label: "Overview",       icon: LayoutDashboard },
        { key: "voice",    label: "AI Voice Agent", icon: Mic         },
        { key: "kb",       label: "Knowledge Base", icon: BookOpen    },
        { key: "guard",    label: "Guardrails",     icon: Shield      },
      ]},
    ],
  },
  {
    key: "datahub", label: "Data Hub", icon: Database, color: "#38BDF8",
    subs: [
      { key: "enrich-home",   label: "Enrichment Workspace", items: [] },
      { key: "enrich-engine", label: "Enrichment Engine",    items: [
        { key: "prospect", label: "Prospecting",    icon: Search    },
        { key: "signals",  label: "Buying Signals", icon: Zap       },
        { key: "quicken",  label: "Quick Enrich",   icon: CircleDot },
        { key: "card",     label: "Card Scanner",   icon: CreditCard},
        { key: "listup",   label: "List Upload",    icon: Upload    },
        { key: "dedup",    label: "Deduplication",  icon: GitMerge  },
        { key: "history",  label: "History",        icon: History   },
      ]},
    ],
  },
  {
    key: "marketing", label: "Marketing", icon: Megaphone, color: "#F472B6",
    subs: [
      { key: "mkt-ws",   label: "Workspace",         items: [] },
      { key: "mkt-dash", label: "Dashboard",          items: [] },
      { key: "mkt-camp", label: "Campaign Builder",   items: [
        { key: "funnel",  label: "Sales Funnel",   icon: Filter  },
        { key: "aicamp",  label: "AI Builder",     icon: Wand2   },
        { key: "manual",  label: "Manual Builder", icon: PenLine },
        { key: "publish", label: "Publishing",     icon: Send    },
      ]},
      { key: "mkt-seq",  label: "Sequences",          items: [
        { key: "seqs",   label: "Sequences",       icon: List    },
        { key: "tmpls",  label: "Templates",       icon: FileText},
        { key: "auds",   label: "Audiences",       icon: Users   },
      ]},
      { key: "mkt-form", label: "Web Forms",          items: [] },
      { key: "mkt-perf", label: "Performance",        items: [] },
    ],
  },
  {
    key: "insights", label: "Insights", icon: BarChart3, color: "#A3E635",
    subs: [
      { key: "ins-dash",  label: "Dashboards",  items: [] },
      { key: "ins-rpt",   label: "Reports",     items: [] },
      { key: "ins-team",  label: "Team",        items: [
        { key: "ytd",      label: "YTD",          icon: BarChart3  },
        { key: "inception",label: "Inception",    icon: TrendingUp },
        { key: "custom",   label: "Custom Range", icon: Calendar   },
      ]},
      { key: "ins-pred",  label: "Predictive",  items: [] },
    ],
  },
];
