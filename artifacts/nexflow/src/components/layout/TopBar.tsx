import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles, Users, Building2, TrendingUp, Zap, Activity,
  Phone, FileText, Bell, BarChart3, Target, Database, Bot,
  ChevronDown, Search, Moon, Sun, Settings, Mail, UserSquare2, FlaskConical,
  ListIcon, LayoutDashboard, Filter, Megaphone, GitBranch, Wand2, Layers, Globe,
  Calendar, Mic, Briefcase, Headphones, BookOpen,
  Workflow, ScanLine, Network, BookText, Route, FileSpreadsheet, CreditCard, Heart, Eye,
  Menu, X, LogOut, ChevronRight,
} from "lucide-react";
import { NexFlowWordmark, NexFlowLogo } from "./NexFlowLogo";
import { useNotifications } from "@/hooks/useApi";

const NAV_GROUPS = [
  {
    key: "home",
    label: "Home",
    icon: Sparkles,
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
    key: "automation",
    label: "Automation",
    icon: Workflow,
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
    items: [
      { icon: Sparkles, label: "Lead Intelligence",  href: "/intelligence", desc: "Score & prioritize leads" },
      { icon: Bot,      label: "AI Workforce",       href: "/ai",           desc: "Your virtual SDR team" },
      { icon: Sparkles, label: "Predictive",         href: "/predictive",   desc: "Forecasts & risk" },
      { icon: Database, label: "Enrichment",         href: "/sourcing",     desc: "Bulk find new leads" },
      { icon: Wand2,    label: "Quick Enrich Lead",  href: "/lead-enrich",  desc: "Single-shot AI enrichment" },
      { icon: Zap,      label: "Signals",            href: "/signals",      desc: "Buying intent signals" },
      { icon: BookText, label: "Sales Playbooks",    href: "/playbooks",    desc: "Battle-tested plays" },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
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
    items: [
      { icon: ListIcon,        label: "Lists",         href: "/lists",        desc: "Static & dynamic lists" },
      { icon: Target,          label: "Segments",      href: "/segments",     desc: "Smart segments" },
      { icon: GitBranch,       label: "Deduplication", href: "/dedup",        desc: "Merge duplicate contacts" },
      { icon: FileSpreadsheet, label: "Migration",     href: "/migration",    desc: "CSV import/export" },
      { icon: Filter,          label: "Properties",    href: "/account-settings/properties", desc: "Custom fields" },
    ],
  },
];

interface TopBarProps {
  dark: boolean;
  onDark: (v: boolean) => void;
}

export function TopBar({ dark, onDark }: TopBarProps) {
  const [location] = useLocation();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { data: notifData } = useNotifications();
  const unreadCount = (notifData?.notifications ?? []).filter((n: any) => !n.read).length;

  function isActive(href: string) {
    return href === "/" ? location === "/" : (location === href || location.startsWith(href + "/"));
  }

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenKey(null);
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpenKey(null);
    setMobileOpen(false);
    setAvatarOpen(false);
  }, [location]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpenKey(null); setMobileOpen(false); setAvatarOpen(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header ref={wrapRef} className="sticky top-0 z-40 glass-panel border-b border-border/30 backdrop-blur-xl">
      <div className="flex items-center h-14 px-4 gap-3">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <NexFlowLogo size={28} />
            <span className="hidden md:block"><NexFlowWordmark /></span>
          </div>
        </Link>

        {/* Mobile burger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden ml-auto p-2 rounded-lg hover:bg-muted/50">
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 ml-2">
          {NAV_GROUPS.map((g) => {
            const containsActive = g.items.some((i) => isActive(i.href));
            const isOpen = openKey === g.key;
            const Icon = g.icon;
            return (
              <button
                key={g.key}
                onClick={() => setOpenKey(isOpen ? null : g.key)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={`nav-panel-${g.key}`}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                  isOpen ? "bg-muted text-foreground" :
                  containsActive ? "text-foreground bg-muted/40" :
                  "text-foreground/70 hover:text-foreground hover:bg-muted/30"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", containsActive ? "text-[#B8A0C8]" : "text-foreground/50")} />
                <span>{g.label}</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen ? "rotate-180" : "")} />
              </button>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="hidden lg:flex items-center gap-1 ml-auto">
          <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 text-muted-foreground text-xs hover:bg-muted/60 transition-colors w-56">
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Search...</span>
            <span className="opacity-50 font-mono">⌘K</span>
          </button>

          <Link href="/notifications">
            <button className={cn("relative p-2 rounded-lg hover:bg-muted/50 transition-colors",
              isActive("/notifications") ? "text-[#B8A0C8]" : "text-foreground/70")}>
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full nf-chameleon-bg text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </Link>

          <button onClick={() => onDark(!dark)} className="p-2 rounded-lg hover:bg-muted/50 text-foreground/70 transition-colors">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button onClick={() => setAvatarOpen(!avatarOpen)} className="flex items-center gap-2 ml-1 p-1 rounded-lg hover:bg-muted/50">
              <div className="w-7 h-7 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[11px] font-black">A</div>
            </button>
            {avatarOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 glass-card rounded-xl border border-border/40 shadow-xl py-2 z-50">
                <div className="px-3 py-2 border-b border-border/30">
                  <div className="text-sm font-semibold">Admin User</div>
                  <div className="text-xs text-muted-foreground">admin@nexflow.ai</div>
                </div>
                <Link href="/account-settings">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer">
                    <Settings className="w-3.5 h-3.5 text-muted-foreground" /> Account Settings
                    <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground" />
                  </div>
                </Link>
                <Link href="/capabilities">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground" /> Capabilities
                  </div>
                </Link>
                <div className="border-t border-border/30 mt-1 pt-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </div>
                </div>
                <div className="px-3 pt-2 mt-1 border-t border-border/30">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#C8A880]/10 border border-[#C8A880]/25">
                    <FlaskConical className="w-3 h-3 text-[#C8A880]" />
                    <div className="text-[10px] font-bold text-[#C8A880]">DEMO MODE</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mega-dropdown panel */}
      {openKey && (
        <div
          id={`nav-panel-${openKey}`}
          role="menu"
          aria-label={`${NAV_GROUPS.find((g) => g.key === openKey)?.label} navigation`}
          className="absolute left-0 right-0 top-full glass-panel border-t border-border/30 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            {NAV_GROUPS.filter((g) => g.key === openKey).map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.key}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg nf-chameleon-bg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{g.label}</div>
                      <div className="text-xs text-muted-foreground">{g.items.length} tools available</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {g.items.map((item: any) => {
                      const ItemIcon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link key={item.href} href={item.href}>
                          <div className={cn(
                            "rounded-xl p-3 cursor-pointer transition-all border group",
                            active
                              ? "border-[#B8A0C8]/40 bg-[#B8A0C8]/5"
                              : "border-transparent hover:border-border/50 hover:bg-muted/40"
                          )}>
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                                active ? "nf-chameleon-bg" : "bg-muted/60 group-hover:bg-muted"
                              )}>
                                <ItemIcon className={cn("w-3.5 h-3.5", active ? "text-white" : "text-foreground/70")} />
                              </div>
                              <div className="min-w-0">
                                <div className={cn("text-sm font-semibold truncate", active ? "text-[#B8A0C8]" : "text-foreground")}>
                                  {item.label}
                                </div>
                                {item.desc && (
                                  <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.desc}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile slide-down */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/30 max-h-[80vh] overflow-y-auto">
          {NAV_GROUPS.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.key} className="px-3 py-2 border-b border-border/20">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Icon className="w-3 h-3" /> {g.label}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {g.items.map((item: any) => {
                    const ItemIcon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href}>
                        <div className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm",
                          active ? "nf-chameleon-bg text-white" : "text-foreground/80 hover:bg-muted/50"
                        )}>
                          <ItemIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="px-3 py-3 flex items-center justify-between">
            <Link href="/account-settings"><span className="text-sm font-medium">Account Settings</span></Link>
            <button onClick={() => onDark(!dark)} className="p-2 rounded-lg hover:bg-muted/50">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
