import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import {
  Bell, Search, Moon, Sun, Settings, Sparkles, FlaskConical,
  Menu, X, LogOut, ChevronRight,
} from "lucide-react";
import { NexFlowWordmark, NexFlowLogo } from "./NexFlowLogo";
import { useNotifications } from "@/hooks/useApi";
import { SECTIONS, findSectionByRoute } from "@/lib/sections";

interface TopBarProps {
  dark: boolean;
  onDark: (v: boolean) => void;
}

export function TopBar({ dark, onDark }: TopBarProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { data: notifData } = useNotifications();
  const unreadCount = (notifData?.notifications ?? []).filter((n: any) => !n.read).length;

  const activeSection = findSectionByRoute(location);

  // Close avatar on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
    setAvatarOpen(false);
  }, [location]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setMobileOpen(false); setAvatarOpen(false); }
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

        {/* Desktop nav — top-level sections, click to navigate to that section's hub */}
        <nav className="hidden lg:flex items-center gap-0.5 ml-2">
          {SECTIONS.map((g) => {
            const isActiveSection = activeSection?.key === g.key;
            const Icon = g.icon;
            // Home key navigates to "/" (Command Center) instead of /section/home
            const href = g.key === "home" ? "/" : `/section/${g.key}`;
            return (
              <Link key={g.key} href={href}>
                <button
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                    isActiveSection
                      ? "text-foreground bg-muted"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/40",
                  )}
                >
                  <Icon
                    className={cn("w-3.5 h-3.5")}
                    style={{ color: isActiveSection ? g.accent : undefined }}
                  />
                  <span>{g.label}</span>
                </button>
              </Link>
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
              location === "/notifications" ? "text-[#B8A0C8]" : "text-foreground/70")}>
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

      {/* Mobile slide-down */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/30 max-h-[80vh] overflow-y-auto">
          {SECTIONS.map((g) => {
            const Icon = g.icon;
            const href = g.key === "home" ? "/" : `/section/${g.key}`;
            return (
              <div key={g.key} className="px-3 py-2 border-b border-border/20">
                <Link href={href}>
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider px-1 py-1 rounded-lg hover:bg-muted/50 cursor-pointer"
                    style={{ color: g.accent }}>
                    <Icon className="w-3 h-3" /> {g.label}
                  </div>
                </Link>
                <div className="grid grid-cols-2 gap-1">
                  {g.items.map((item: any) => {
                    const ItemIcon = item.icon;
                    const active = location === item.href || (item.href !== "/" && location.startsWith(item.href + "/"));
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
