import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Sparkles, Users, Building2, TrendingUp, Zap, Activity,
  Phone, FileText, Bell, BarChart3, Target, Database, Bot,
  ChevronLeft, ChevronRight, ChevronDown, Search, Moon, Sun,
  MessageSquare, Star, Settings, Mail, UserSquare2, FlaskConical,
  ListIcon, LayoutDashboard, Filter, Megaphone, GitBranch, PhoneCall, Wand2
} from "lucide-react";
import { NexFlowLogo, NexFlowWordmark } from "./NexFlowLogo";
import { useNotifications } from "@/hooks/useApi";
import { useState, useEffect } from "react";

const SOLO_BOTTOM = { icon: Bell, label: "Notifications", href: "/notifications", badge: true };

// 6-tab structure per spec: Home, Leads, Call Center, Data Hub, Marketing, Insights
const NAV_GROUPS = [
  {
    key: "home",
    label: "Home",
    icon: Sparkles,
    items: [
      { icon: Sparkles, label: "Daily Briefing", href: "/" },
      { icon: BarChart3, label: "Performance", href: "/analytics" },
      { icon: Activity, label: "Daily Insights", href: "/insights" },
      { icon: Bot, label: "AI Assistant", href: "/assistant" },
    ],
  },
  {
    key: "leads",
    label: "Leads",
    icon: Users,
    items: [
      { icon: GitBranch, label: "Pipeline & Deals", href: "/funnel" },
      { icon: Users, label: "Contacts", href: "/contacts" },
      { icon: Building2, label: "Companies", href: "/companies" },
      { icon: ListIcon, label: "Lists", href: "/lists" },
      { icon: Star, label: "Research", href: "/intelligence" },
      { icon: Filter, label: "Properties", href: "/properties" },
    ],
  },
  {
    key: "callcenter",
    label: "Call Center",
    icon: Phone,
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/call-list" },
      { icon: Phone, label: "Calls & Transcripts", href: "/calls" },
      { icon: Bot, label: "AI Agent", href: "/voice-agents" },
      { icon: FileText, label: "Knowledge Base", href: "/scripts" },
      { icon: MessageSquare, label: "WhatsApp", href: "/whatsapp" },
      { icon: Mail, label: "Email", href: "/email" },
    ],
  },
  {
    key: "datahub",
    label: "Data Hub",
    icon: Database,
    items: [
      { icon: Target, label: "Segments", href: "/segments" },
      { icon: Database, label: "Enrichment", href: "/sourcing" },
      { icon: Bot, label: "AI Workforce", href: "/ai" },
      { icon: Zap, label: "Signals", href: "/signals" },
      { icon: Wand2, label: "Agent Builder", href: "/agents" },
      { icon: Zap, label: "Automation Rules", href: "/automation" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    items: [
      { icon: Megaphone, label: "Campaigns", href: "/campaigns" },
    ],
  },
  {
    key: "insights",
    label: "Insights",
    icon: BarChart3,
    items: [
      { icon: LayoutDashboard, label: "Dashboards", href: "/dashboards" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
      { icon: UserSquare2, label: "Team Performance", href: "/team" },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  dark: boolean;
  onDark: (v: boolean) => void;
}

const STORAGE_KEY = "nf-sidebar-open-section";

export function Sidebar({ collapsed, onCollapse, dark, onDark }: SidebarProps) {
  const [location] = useLocation();
  const { data: notifData } = useNotifications();
  const unreadCount = (notifData?.notifications ?? []).filter((n: any) => !n.read).length;

  const activeGroup = NAV_GROUPS.find((g) =>
    g.items.some((i) => location === i.href || location.startsWith(i.href + "/"))
  );

  const [openSection, setOpenSection] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ?? activeGroup?.key ?? "pipeline";
    } catch {
      return activeGroup?.key ?? "pipeline";
    }
  });

  useEffect(() => {
    if (activeGroup && openSection !== activeGroup.key) {
      setOpenSection(activeGroup.key);
      try { localStorage.setItem(STORAGE_KEY, activeGroup.key); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  function toggleSection(key: string) {
    const next = openSection === key ? null : key;
    setOpenSection(next);
    try { localStorage.setItem(STORAGE_KEY, next ?? ""); } catch {}
  }

  function isActive(href: string) {
    return href === "/" ? location === "/" : (location === href || location.startsWith(href + "/"));
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

  return (
    <aside
      className={cn(
        "glass-panel flex flex-col h-screen sticky top-0 z-30 transition-all duration-300 flex-shrink-0",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      <div className={cn("flex items-center border-b border-border/30 flex-shrink-0",
        collapsed ? "justify-center px-0 py-3" : "px-3 py-3")}>
        {collapsed ? (
          <NexFlowLogo size={36} />
        ) : (
          <NexFlowWordmark className="h-12" />
        )}
      </div>

      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-border/20 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs cursor-pointer hover:bg-muted/70 transition-colors">
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Search anything...</span>
            <span className="ml-auto opacity-50 font-mono">⌘K</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {collapsed ? (
          <div className="px-2 space-y-0.5">
            {NAV_GROUPS.map((group) => {
              const Icon = group.icon;
              const containsActive = group.items.some((i) => isActive(i.href));
              const firstHref = group.items[0]?.href ?? "/";
              return (
                <Link key={group.key} href={firstHref}>
                  <div
                    className={cn(
                      "flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-all duration-150 group",
                      containsActive ? "nf-chameleon-bg text-white shadow-sm" : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
                    )}
                    title={group.label}
                  >
                    <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", containsActive ? "text-white" : "text-foreground/50 group-hover:text-foreground")} />
                  </div>
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-border/20">{renderSoloItem(SOLO_BOTTOM)}</div>
          </div>
        ) : (
          <div className="px-2 space-y-0.5">
            {NAV_GROUPS.map((group) => {
              const isOpen = openSection === group.key;
              const containsActive = group.items.some((i) => isActive(i.href));
              const GroupIcon = group.icon;

              return (
                <div key={group.key}>
                  <button
                    onClick={() => toggleSection(group.key)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-semibold transition-all",
                      containsActive
                        ? "bg-muted/60 text-foreground"
                        : "text-foreground/75 hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <GroupIcon className={cn("w-4 h-4 flex-shrink-0", containsActive ? "text-[#B8A0C8]" : "text-foreground/50")} />
                    <span className="flex-1 text-left">{group.label}</span>
                    {!isOpen && containsActive && <div className="w-1.5 h-1.5 rounded-full nf-chameleon-bg" />}
                    <ChevronDown className={cn("w-3 h-3 transition-transform flex-shrink-0 text-muted-foreground/60", isOpen ? "rotate-0" : "-rotate-90")} />
                  </button>

                  <div className={cn("overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-[500px] opacity-100 mt-0.5 mb-1.5" : "max-h-0 opacity-0")}>
                    <div className="space-y-0.5 ml-4 pl-2 border-l border-border/30">
                      {group.items.map(({ icon: Icon, label, href }: any) => {
                        const active = isActive(href);
                        return (
                          <Link key={href} href={href}>
                            <div className={cn(
                              "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 group",
                              active ? "nf-chameleon-bg text-white shadow-sm" : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
                            )}>
                              <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", active ? "text-white" : "text-foreground/45 group-hover:text-foreground")} />
                              <span className="flex-1">{label}</span>
                              {active && <div className="w-1.5 h-1.5 rounded-full bg-white/70" />}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pt-2 mt-2 border-t border-border/20">{renderSoloItem(SOLO_BOTTOM)}</div>
          </div>
        )}
      </nav>

      {/* Demo Mode Pill */}
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
            <Settings className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 hover:text-foreground cursor-pointer" />
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
