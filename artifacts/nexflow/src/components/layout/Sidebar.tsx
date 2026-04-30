import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Sparkles, Users, Building2, TrendingUp, Zap, Activity,
  Phone, FileText, Bell, BarChart3, Target, Database, Bot,
  ChevronLeft, ChevronRight, ChevronDown, Search, Moon, Sun,
  MessageSquare, Settings, Mail, FlaskConical,
  LayoutDashboard, Megaphone, GitBranch, Wand2, Layers, Globe,
  Mic, Headphones, BookOpen, Inbox,
  Workflow, Network, Shield,
  Route as RouteIcon, Lock,
  Briefcase, CheckSquare, Sliders, Compass,
} from "lucide-react";
import { NexFlowLogo, NexFlowWordmark } from "./NexFlowLogo";
import { useNotifications } from "@/hooks/useApi";
import { useState, useEffect } from "react";

const SOLO_BOTTOM = { icon: Bell, label: "Notifications", href: "/notifications", badge: true };

// ─────────────────────────────────────────────────────────────────
// NAVIGATION v3 — graduated from canvas mockup (NavigationV2.tsx)
// 7 collapsible sections + bottom admin rail. Calm, ~25 visible items.
// All ~80 legacy routes still resolve; this just reorganises the menu.
// ─────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    key: "home",
    label: "Home",
    icon: Sparkles,
    items: [
      { icon: Sparkles,  label: "Command Center", href: "/home" },
      { icon: Compass,   label: "Studio",         href: "/enrichment-engine" },
    ],
  },
  {
    key: "pipeline",
    label: "Pipeline",
    icon: GitBranch,
    items: [
      { icon: GitBranch,  label: "Pipeline & Deals", href: "/funnel" },
      { icon: Users,      label: "People",           href: "/contacts" },
      { icon: Building2,  label: "Companies",        href: "/companies" },
      { icon: Network,    label: "Accounts (ABM)",   href: "/accounts" },
      { icon: TrendingUp, label: "Forecasting",      href: "/forecasting" },
      { icon: FileText,   label: "Quotes",           href: "/quotes" },
    ],
  },
  {
    key: "comms",
    label: "Comms",
    icon: MessageSquare,
    items: [
      { icon: Inbox,         label: "Unified Inbox",       href: "/messages" },
      { icon: Phone,         label: "Dialer",              href: "/power-dialer" },
      { icon: Headphones,    label: "Calls & Transcripts", href: "/calls" },
      { icon: Bot,           label: "AI Voice Agent",      href: "/voice-agents" },
      { icon: Mic,           label: "Conversation Intel",  href: "/conversation-intelligence" },
      { icon: MessageSquare, label: "WhatsApp",            href: "/whatsapp" },
      { icon: Mail,          label: "Email",               href: "/email" },
      { icon: Layers,        label: "Templates",           href: "/templates" },
      { icon: BookOpen,      label: "Knowledge Base",      href: "/scripts" },
    ],
  },
  {
    key: "enrichment",
    label: "Enrichment",
    icon: Database,
    emphasis: true,
    items: [
      { icon: Sparkles,  label: "Engine",         href: "/enrichment-engine" },
      { icon: Wand2,     label: "Quick Enrich",   href: "/lead-enrich" },
      { icon: Database,  label: "Data Providers", href: "/datahub/enrichment" },
      { icon: Compass,   label: "Find New Leads", href: "/sourcing" },
      { icon: GitBranch, label: "Dedup",          href: "/dedup" },
    ],
  },
  {
    key: "growth",
    label: "Growth",
    icon: Megaphone,
    items: [
      { icon: GitBranch, label: "Sequences",             href: "/sequences" },
      { icon: Megaphone, label: "Campaigns",             href: "/campaigns" },
      { icon: Sparkles,  label: "Marketing AI",          href: "/marketing-assistant" },
      { icon: Target,    label: "Audiences",             href: "/audiences" },
      { icon: Globe,     label: "Cultural Intelligence", href: "/cultural-intelligence" },
      { icon: FileText,  label: "Web Forms",             href: "/web-forms" },
    ],
    more: [
      { icon: BarChart3,    label: "Document Tracking",  href: "/document-tracking" },
      { icon: Layers,       label: "Campaign Builder",   href: "/campaign-builder" },
      { icon: TrendingUp,   label: "Performance",        href: "/campaign-performance" },
    ],
  },
  {
    key: "aihub",
    label: "AI Hub",
    icon: Bot,
    items: [
      { icon: Bot,        label: "Conductor",        href: "/ai" },
      { icon: Workflow,   label: "Workflows",        href: "/workflows" },
      { icon: Zap,        label: "Automation Rules", href: "/automation" },
      { icon: Wand2,      label: "Agent Builder",    href: "/agents" },
      { icon: RouteIcon,  label: "Lead Routing",     href: "/lead-routing" },
      { icon: CheckSquare,label: "Approvals",        href: "/approvals" },
      { icon: Activity,   label: "Signals",          href: "/signals" },
    ],
    more: [
      { icon: Sparkles,  label: "Predictive",       href: "/predictive" },
      { icon: Sparkles,  label: "Lead Intel",       href: "/intelligence" },
      { icon: Bot,       label: "AI Workforce",     href: "/datahub/workforce" },
      { icon: BookOpen,  label: "Sales Playbooks",  href: "/playbooks" },
      { icon: Mail,      label: "Activity Capture", href: "/activity-capture" },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
    items: [
      { icon: LayoutDashboard, label: "Dashboards",       href: "/insights/dashboards" },
      { icon: FileText,        label: "Reports",          href: "/insights/reports" },
      { icon: BarChart3,       label: "Analytics",        href: "/analytics" },
      { icon: Briefcase,       label: "Team Performance", href: "/insights/team" },
      { icon: BarChart3,       label: "Attribution",      href: "/attribution" },
    ],
    more: [
      { icon: FileText, label: "Report Builder", href: "/report-builder" },
      { icon: Sliders,  label: "ICP Rules",      href: "/datahub/icp-rules" },
      { icon: Layers,   label: "Lists",          href: "/lists" },
      { icon: Sliders,  label: "Properties",     href: "/properties" },
      { icon: Target,   label: "Segments",       href: "/segments" },
      { icon: GitBranch,label: "Migration",      href: "/migration" },
    ],
  },
];

// Bottom admin rail (always visible at the bottom, no collapsible group)
const BOTTOM_RAIL = [
  { icon: Settings, label: "Settings",     href: "/settings" },
  { icon: Lock,     label: "Permissions",  href: "/permissions" },
  { icon: Shield,   label: "Trust Center", href: "/trust-center" },
  { icon: Globe,    label: "Public Trust", href: "/public-trust" },
  { icon: Sparkles, label: "Capabilities", href: "/capabilities" },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  dark: boolean;
  onDark: (v: boolean) => void;
}

const STORAGE_KEY = "nf-sidebar-open-section";
const MORE_STORAGE_KEY = "nf-sidebar-more-sections";

export function Sidebar({ collapsed, onCollapse, dark, onDark }: SidebarProps) {
  const [location] = useLocation();
  const { data: notifData } = useNotifications();
  const unreadCount = (notifData?.notifications ?? []).filter((n: any) => !n.read).length;

  function isActive(href: string) {
    return href === "/" ? location === "/" : (location === href || location.startsWith(href + "/"));
  }

  const activeGroup = NAV_GROUPS.find((g) =>
    g.items.some((i) => isActive(i.href)) ||
    (g as any).more?.some((i: any) => isActive(i.href))
  );

  const [openSection, setOpenSection] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ?? activeGroup?.key ?? "home";
    } catch {
      return activeGroup?.key ?? "home";
    }
  });

  const [moreOpen, setMoreOpen] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(MORE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    if (activeGroup && openSection !== activeGroup.key) {
      setOpenSection(activeGroup.key);
      try { localStorage.setItem(STORAGE_KEY, activeGroup.key); } catch {}
    }
    // If active route is inside a "more" bucket, auto-open it
    if (activeGroup) {
      const inMore = (activeGroup as any).more?.some((i: any) => isActive(i.href));
      if (inMore && !moreOpen[activeGroup.key]) {
        const next = { ...moreOpen, [activeGroup.key]: true };
        setMoreOpen(next);
        try { localStorage.setItem(MORE_STORAGE_KEY, JSON.stringify(next)); } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  function toggleSection(key: string) {
    const next = openSection === key ? null : key;
    setOpenSection(next);
    try { localStorage.setItem(STORAGE_KEY, next ?? ""); } catch {}
  }

  function toggleMore(key: string) {
    const next = { ...moreOpen, [key]: !moreOpen[key] };
    setMoreOpen(next);
    try { localStorage.setItem(MORE_STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  function renderSoloItem(item: any) {
    const active = isActive(item.href);
    const showBadge = item.badge && unreadCount > 0;
    return (
      <Link href={item.href}>
        <div
          className={cn(
            "flex items-center rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 group relative",
            collapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2",
            active
              ? "nf-chameleon-bg text-white shadow-sm"
              : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
          )}
          title={collapsed ? item.label : undefined}
        >
          <item.icon className={cn("flex-shrink-0", collapsed ? "w-[18px] h-[18px]" : "w-4 h-4",
            active ? "text-white" : "text-foreground/50 group-hover:text-foreground")} />
          {!collapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className={cn("w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center",
                  active ? "bg-white/90 text-[#B8A0C8]" : "nf-chameleon-bg text-white")}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              {active && !showBadge && <div className="w-1.5 h-1.5 rounded-full bg-white/70" />}
            </>
          )}
          {collapsed && showBadge && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B8A0C8]" />
          )}
        </div>
      </Link>
    );
  }

  function renderItem(it: any) {
    const Icon = it.icon;
    const active = isActive(it.href);
    return (
      <Link key={it.href} href={it.href}>
        <div className={cn(
          "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 group",
          active ? "nf-chameleon-bg text-white shadow-sm" : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
        )}>
          <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", active ? "text-white" : "text-foreground/45 group-hover:text-foreground")} />
          <span className="flex-1">{it.label}</span>
          {active && <div className="w-1.5 h-1.5 rounded-full bg-white/70" />}
        </div>
      </Link>
    );
  }

  return (
    <aside
      className={cn(
        "glass-panel flex flex-col h-screen sticky top-0 z-30 transition-all duration-300 flex-shrink-0",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      <div className={cn("flex items-center border-b border-border/30 flex-shrink-0",
        collapsed ? "justify-center px-0 py-3" : "px-3 py-4")}>
        {collapsed ? <NexFlowLogo size={36} /> : <NexFlowWordmark />}
      </div>

      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-border/20 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs cursor-pointer hover:bg-muted/70 transition-colors">
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Jump to anything…</span>
            <span className="ml-auto opacity-50 font-mono">⌘K</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {collapsed ? (
          <div className="px-2 space-y-0.5">
            {NAV_GROUPS.map((group) => {
              const Icon = group.icon;
              const containsActive =
                group.items.some((i) => isActive(i.href)) ||
                (group as any).more?.some((i: any) => isActive(i.href));
              const firstHref = group.items[0]?.href ?? "/";
              return (
                <Link key={group.key} href={firstHref}>
                  <div
                    className={cn(
                      "flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-all duration-150 group",
                      containsActive
                        ? "nf-chameleon-bg text-white shadow-sm"
                        : (group as any).emphasis
                          ? "text-[#B8A0C8] hover:bg-muted/50"
                          : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
                    )}
                    title={group.label}
                  >
                    <Icon className={cn("w-[18px] h-[18px] flex-shrink-0",
                      containsActive ? "text-white" : (group as any).emphasis ? "text-[#B8A0C8]" : "text-foreground/50 group-hover:text-foreground")} />
                  </div>
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-border/20 space-y-0.5">
              {BOTTOM_RAIL.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-all duration-150",
                        active ? "nf-chameleon-bg text-white shadow-sm" : "text-foreground/55 hover:text-foreground hover:bg-muted/50"
                      )}
                      title={item.label}
                    >
                      <Icon className={cn("w-[16px] h-[16px] flex-shrink-0", active ? "text-white" : "text-foreground/45")} />
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="pt-2 mt-2 border-t border-border/20">{renderSoloItem(SOLO_BOTTOM)}</div>
          </div>
        ) : (
          <div className="px-2 space-y-0.5">
            {NAV_GROUPS.map((group) => {
              const isOpen = openSection === group.key;
              const containsActive =
                group.items.some((i) => isActive(i.href)) ||
                (group as any).more?.some((i: any) => isActive(i.href));
              const GroupIcon = group.icon;
              const isEmphasis = (group as any).emphasis;
              const moreItems: any[] = (group as any).more ?? [];
              const moreIsOpen = !!moreOpen[group.key];

              return (
                <div key={group.key}>
                  <button
                    onClick={() => toggleSection(group.key)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold transition-all",
                      containsActive
                        ? "bg-muted/60 text-foreground"
                        : isEmphasis
                          ? "text-[#B8A0C8] hover:bg-muted/40"
                          : "text-foreground/75 hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <GroupIcon className={cn("w-4 h-4 flex-shrink-0",
                      containsActive ? "text-[#B8A0C8]" : isEmphasis ? "text-[#B8A0C8]" : "text-foreground/50")} />
                    <span className="flex-1 text-left">
                      {isEmphasis && <span className="mr-1">★</span>}
                      {group.label}
                    </span>
                    {!isOpen && containsActive && <div className="w-1.5 h-1.5 rounded-full nf-chameleon-bg" />}
                    <ChevronDown className={cn("w-3 h-3 transition-transform flex-shrink-0 text-muted-foreground/60", isOpen ? "rotate-0" : "-rotate-90")} />
                  </button>

                  <div className={cn("overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-[700px] opacity-100 mt-0.5 mb-1.5" : "max-h-0 opacity-0")}>
                    <div className="space-y-0.5 ml-4 pl-2 border-l border-border/30">
                      {group.items.map(renderItem)}

                      {moreItems.length > 0 && (
                        <>
                          <button
                            onClick={() => toggleMore(group.key)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] italic text-muted-foreground/80 hover:text-foreground hover:bg-muted/40 transition-all"
                          >
                            <ChevronDown className={cn("w-3 h-3 flex-shrink-0 transition-transform", moreIsOpen ? "rotate-0" : "-rotate-90")} />
                            <span className="flex-1 text-left">More</span>
                            <span className="text-[10px] font-mono opacity-60">{moreItems.length}</span>
                          </button>
                          <div className={cn("overflow-hidden transition-all duration-200",
                            moreIsOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0")}>
                            <div className="space-y-0.5 ml-2 pl-2 border-l border-dashed border-border/40">
                              {moreItems.map(renderItem)}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom admin rail — always visible, no group toggle */}
            <div className="pt-3 mt-2 border-t border-border/20">
              <div className="px-2.5 pb-1 text-[9px] font-black tracking-[0.12em] text-muted-foreground/50 uppercase">
                Admin
              </div>
              <div className="space-y-0.5">
                {BOTTOM_RAIL.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150",
                        active ? "nf-chameleon-bg text-white shadow-sm" : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                      )}>
                        <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", active ? "text-white" : "text-foreground/45")} />
                        <span className="flex-1">{item.label}</span>
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-white/70" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-border/20">{renderSoloItem(SOLO_BOTTOM)}</div>
          </div>
        )}
      </nav>

      {!collapsed && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#C8A880]/10 border border-[#C8A880]/25" title="All page UIs are wired to a Drizzle/PostgreSQL backend with mock seed data. Connect production APIs (Lusha, Retell, Twilio, Infobip, etc.) any time without UI changes.">
            <FlaskConical className="w-3 h-3 text-[#C8A880] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-[#C8A880] leading-tight">DEMO MODE</div>
              <div className="text-[9px] text-muted-foreground leading-tight">APIs ready for prod</div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border/20 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="w-7 h-7 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[11px] font-black flex-shrink-0">A</div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-foreground truncate leading-tight">Admin User</div>
              <div className="text-[10px] text-muted-foreground truncate leading-tight">admin@nexflow.ai</div>
            </div>
            <Link href="/settings">
              <Settings className={cn("w-3.5 h-3.5 flex-shrink-0 hover:text-foreground cursor-pointer transition-colors", location === "/settings" ? "text-[#B8A0C8]" : "text-muted-foreground/50")} />
            </Link>
          </div>
        )}
        <div className={cn("flex px-2 pb-2 gap-1", collapsed ? "flex-col items-center" : "")}>
          <button onClick={() => onDark(!dark)} className="flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex-1" title={collapsed ? (dark ? "Light" : "Dark") : undefined}>
            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {!collapsed && <span className="text-xs">{dark ? "Light" : "Dark"}</span>}
          </button>
          <button onClick={() => onCollapse(!collapsed)} className="flex items-center justify-center px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all" title={collapsed ? "Expand" : "Collapse"}>
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
