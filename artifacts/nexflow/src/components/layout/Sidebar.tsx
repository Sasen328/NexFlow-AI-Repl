import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Building2, TrendingUp, Zap, Activity,
  Phone, FileText, Bell, BarChart3, Brain, Target, MessageSquare,
  ChevronLeft, ChevronRight, Settings, Search, Moon, Sun
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "Contacts", href: "/contacts" },
  { icon: Building2, label: "Companies", href: "/companies" },
  { icon: TrendingUp, label: "Deals", href: "/deals" },
  { icon: Zap, label: "Signals", href: "/signals" },
  { icon: Activity, label: "Activities", href: "/activities" },
  { icon: Phone, label: "Calls", href: "/calls" },
  { icon: FileText, label: "Scripts", href: "/scripts" },
  { icon: Target, label: "Segments", href: "/segments" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Brain, label: "AI Agents", href: "/ai" },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  dark: boolean;
  onDark: (v: boolean) => void;
}

export function Sidebar({ collapsed, onCollapse, dark, onDark }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside
      className={cn(
        "glass-panel flex flex-col h-screen sticky top-0 z-30 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/40">
        <div className="nf-logo-mark flex-shrink-0 w-8 h-8 rounded-lg nf-chameleon-bg flex items-center justify-center">
          <span className="text-white font-black text-sm">N</span>
        </div>
        {!collapsed && (
          <span className="font-bold text-lg nf-chameleon-text tracking-tight">NexFlow</span>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 py-3 border-b border-border/20">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 text-muted-foreground text-sm">
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <span className="ml-auto text-xs opacity-60">⌘K</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 group",
                  active
                    ? "nf-chameleon-bg text-white shadow-sm"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted/60"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-white" : "text-foreground/60 group-hover:text-foreground")} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-border/20 space-y-1">
        <button
          onClick={() => onDark(!dark)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/60 hover:text-foreground hover:bg-muted/60 w-full transition-all"
          title={collapsed ? (dark ? "Light mode" : "Dark mode") : undefined}
        >
          {dark ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-7 h-7 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">Admin User</div>
              <div className="text-xs text-muted-foreground truncate">admin@nexflow.ai</div>
            </div>
          </div>
        )}

        <button
          onClick={() => onCollapse(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
