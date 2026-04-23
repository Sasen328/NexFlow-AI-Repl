import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Building2, TrendingUp, Zap, Activity,
  Phone, FileText, Bell, BarChart3, Target,
  ChevronLeft, ChevronRight, ChevronDown, Search, Moon, Sun,
  MessageSquare, Star, Settings, Mail, Sparkles, UserSquare2, Bot
} from "lucide-react";
import { NexFlowLogo, NexFlowWordmark } from "./NexFlowLogo";
import { useNotifications } from "@/hooks/useApi";
import { useState, useEffect } from "react";

const SOLO_ITEM = { icon: LayoutDashboard, label: "Dashboard", href: "/" };

const NAV_GROUPS = [
  {
    key: "crm",
    label: "CRM",
    items: [
      { icon: Users, label: "Contacts", href: "/contacts" },
      { icon: Building2, label: "Companies", href: "/companies" },
      { icon: TrendingUp, label: "Deals", href: "/deals" },
    ],
  },
  {
    key: "intel",
    label: "Intelligence",
    items: [
      { icon: Star, label: "Lead Intelligence", href: "/intelligence" },
      { icon: Zap, label: "Signals", href: "/signals" },
      { icon: Target, label: "Segments", href: "/segments" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
    ],
  },
  {
    key: "comms",
    label: "Communication",
    items: [
      { icon: Phone, label: "Calls", href: "/calls" },
      { icon: MessageSquare, label: "WhatsApp", href: "/whatsapp" },
      { icon: Mail, label: "Email", href: "/email" },
      { icon: Activity, label: "Activities", href: "/activities" },
      { icon: FileText, label: "Scripts", href: "/scripts" },
    ],
  },
  {
    key: "ops",
    label: "Team & Ops",
    items: [
      { icon: UserSquare2, label: "Team Performance", href: "/team" },
      { icon: Zap, label: "Automation", href: "/automation" },
    ],
  },
  {
    key: "ai",
    label: "AI & Alerts",
    items: [
      { icon: Bot, label: "AI Agents", href: "/ai" },
      { icon: Sparkles, label: "AI Assistant", href: "/assistant" },
      { icon: Bell, label: "Notifications", href: "/notifications", badge: true },
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

  // Find which group the current location belongs to
  const activeGroup = NAV_GROUPS.find((g) =>
    g.items.some((i) => location === i.href || location.startsWith(i.href + "/"))
  );

  const [openSection, setOpenSection] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ?? activeGroup?.key ?? "crm";
    } catch {
      return activeGroup?.key ?? "crm";
    }
  });

  // Auto-expand the section containing the current route
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

  const dashboardActive = location === "/";

  return (
    <aside
      className={cn(
        "glass-panel flex flex-col h-screen sticky top-0 z-30 transition-all duration-300 flex-shrink-0",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-border/30 flex-shrink-0",
        collapsed ? "justify-center px-0 py-4" : "gap-2.5 px-4 py-4"
      )}>
        <div className="nf-logo-mark flex-shrink-0">
          <NexFlowLogo size={collapsed ? 30 : 32} />
        </div>
        {!collapsed && <NexFlowWordmark className="text-[17px]" />}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-border/20 flex-shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs cursor-pointer hover:bg-muted/70 transition-colors">
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Search anything...</span>
            <span className="ml-auto opacity-50 font-mono">⌘K</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {/* Solo Dashboard */}
        <div className="px-2 mb-2">
          <Link href={SOLO_ITEM.href}>
            <div
              className={cn(
                "flex items-center rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 group",
                collapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2",
                dashboardActive
                  ? "nf-chameleon-bg text-white shadow-sm"
                  : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
              )}
              title={collapsed ? SOLO_ITEM.label : undefined}
            >
              <SOLO_ITEM.icon className={cn(
                "flex-shrink-0",
                collapsed ? "w-[18px] h-[18px]" : "w-4 h-4",
                dashboardActive ? "text-white" : "text-foreground/50 group-hover:text-foreground"
              )} />
              {!collapsed && <span className="flex-1">{SOLO_ITEM.label}</span>}
              {!collapsed && dashboardActive && <div className="w-1.5 h-1.5 rounded-full bg-white/70" />}
            </div>
          </Link>
        </div>

        {/* When collapsed, just show all items as icons (no section headers) */}
        {collapsed ? (
          <div className="px-2 space-y-0.5">
            {NAV_GROUPS.flatMap((g) => g.items).map(({ icon: Icon, label, href, badge }: any) => {
              const active = location === href || location.startsWith(href + "/");
              const showBadge = badge && unreadCount > 0;
              return (
                <Link key={href} href={href}>
                  <div
                    className={cn(
                      "flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-all duration-150 group relative",
                      active
                        ? "nf-chameleon-bg text-white shadow-sm"
                        : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
                    )}
                    title={label}
                  >
                    <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", active ? "text-white" : "text-foreground/50 group-hover:text-foreground")} />
                    {showBadge && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B8A0C8]" />}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          // Expanded: collapsible sections
          <div className="px-2 space-y-0.5">
            {NAV_GROUPS.map((group) => {
              const isOpen = openSection === group.key;
              const containsActive = group.items.some((i) =>
                location === i.href || location.startsWith(i.href + "/")
              );
              const groupBadgeCount = group.items.some((i: any) => i.badge) ? unreadCount : 0;

              return (
                <div key={group.key}>
                  <button
                    onClick={() => toggleSection(group.key)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide uppercase transition-all",
                      containsActive
                        ? "text-foreground/70"
                        : "text-muted-foreground/50 hover:text-foreground/60"
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform flex-shrink-0",
                        isOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                    <span className="flex-1 text-left">{group.label}</span>
                    {!isOpen && groupBadgeCount > 0 && (
                      <span className="w-4 h-4 rounded-full nf-chameleon-bg text-white text-[9px] font-black flex items-center justify-center">
                        {groupBadgeCount > 9 ? "9+" : groupBadgeCount}
                      </span>
                    )}
                    {!isOpen && containsActive && (
                      <div className="w-1.5 h-1.5 rounded-full nf-chameleon-bg" />
                    )}
                  </button>

                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      isOpen ? "max-h-96 opacity-100 mt-0.5 mb-1.5" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="space-y-0.5">
                      {group.items.map(({ icon: Icon, label, href, badge }: any) => {
                        const active = location === href || location.startsWith(href + "/");
                        const showBadge = badge && unreadCount > 0;
                        return (
                          <Link key={href} href={href}>
                            <div
                              className={cn(
                                "flex items-center gap-2.5 px-2.5 py-1.5 ml-4 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 group",
                                active
                                  ? "nf-chameleon-bg text-white shadow-sm"
                                  : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              <Icon className={cn(
                                "w-4 h-4 flex-shrink-0",
                                active ? "text-white" : "text-foreground/50 group-hover:text-foreground"
                              )} />
                              <span className="flex-1">{label}</span>
                              {showBadge && (
                                <span className="w-4 h-4 rounded-full bg-white/90 text-[#B8A0C8] text-[9px] font-black flex items-center justify-center">
                                  {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                              )}
                              {active && !showBadge && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
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
          <button
            onClick={() => onDark(!dark)}
            className="flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all flex-1"
            title={collapsed ? (dark ? "Light" : "Dark") : undefined}
          >
            {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {!collapsed && <span className="text-xs">{dark ? "Light" : "Dark"}</span>}
          </button>
          <button
            onClick={() => onCollapse(!collapsed)}
            className="flex items-center justify-center px-2 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
