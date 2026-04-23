import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Building2, TrendingUp, Zap, Activity,
  Phone, FileText, Bell, BarChart3, Brain, Target,
  ChevronLeft, ChevronRight, Search, Moon, Sun,
  MessageSquare, Star, Settings, Mail, Sparkles, UserSquare2,
  Calendar, Bot
} from "lucide-react";
import { NexFlowLogo, NexFlowWordmark } from "./NexFlowLogo";
import { useNotifications } from "@/hooks/useApi";

const NAV_GROUPS = [
  {
    label: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    ],
  },
  {
    label: "CRM",
    items: [
      { icon: Users, label: "Contacts", href: "/contacts" },
      { icon: Building2, label: "Companies", href: "/companies" },
      { icon: TrendingUp, label: "Deals", href: "/deals" },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { icon: Star, label: "Lead Intelligence", href: "/intelligence" },
      { icon: Zap, label: "Signals", href: "/signals" },
      { icon: Target, label: "Segments", href: "/segments" },
      { icon: BarChart3, label: "Analytics", href: "/analytics" },
    ],
  },
  {
    label: "COMMUNICATION",
    items: [
      { icon: Phone, label: "Call Monitoring", href: "/calls" },
      { icon: MessageSquare, label: "WhatsApp", href: "/whatsapp" },
      { icon: Mail, label: "Email", href: "/email" },
      { icon: Activity, label: "Activities", href: "/activities" },
      { icon: FileText, label: "Scripts", href: "/scripts" },
    ],
  },
  {
    label: "TEAM & OPS",
    items: [
      { icon: UserSquare2, label: "Team Performance", href: "/team" },
      { icon: Zap, label: "Automation", href: "/automation" },
    ],
  },
  {
    label: "AI & ALERTS",
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

export function Sidebar({ collapsed, onCollapse, dark, onDark }: SidebarProps) {
  const [location] = useLocation();
  const { data: notifData } = useNotifications();
  const unreadCount = (notifData?.notifications ?? []).filter((n: any) => !n.read).length;

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
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase">
                  {group.label}
                </span>
              </div>
            )}
            {collapsed && <div className="mx-2 my-2 h-px bg-border/20" />}
            <div className="px-2 space-y-0.5">
              {group.items.map(({ icon: Icon, label, href, badge }) => {
                const active = href === "/"
                  ? location === "/"
                  : location === href || location.startsWith(href + "/") || location.startsWith(href + "?");
                const showBadge = badge && unreadCount > 0;
                return (
                  <Link key={href} href={href}>
                    <div
                      className={cn(
                        "flex items-center rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 group relative",
                        collapsed ? "justify-center p-2.5" : "gap-2.5 px-2.5 py-2",
                        active
                          ? "nf-chameleon-bg text-white shadow-sm"
                          : "text-foreground/65 hover:text-foreground hover:bg-muted/50"
                      )}
                      title={collapsed ? label : undefined}
                    >
                      <Icon className={cn(
                        "flex-shrink-0",
                        collapsed ? "w-[18px] h-[18px]" : "w-4 h-4",
                        active ? "text-white" : "text-foreground/50 group-hover:text-foreground"
                      )} />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{label}</span>
                          {showBadge && (
                            <span className="w-4 h-4 rounded-full bg-white/90 text-[#B8A0C8] text-[9px] font-black flex items-center justify-center">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                          {active && !showBadge && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
                          )}
                        </>
                      )}
                      {collapsed && showBadge && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#B8A0C8]" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
