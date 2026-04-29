import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import {
  Bell, Search, Moon, Sun, Settings, Sparkles, FlaskConical,
  LogOut, ChevronRight,
} from "lucide-react";
import { NexFlowWordmark, NexFlowLogo } from "./NexFlowLogo";
import { useNotifications } from "@/hooks/useApi";
import { SECTIONS, findSectionByRoute } from "@/lib/sections";

interface TopBarProps {
  dark: boolean;
  onDark: (v: boolean) => void;
}

/**
 * Two-row hero navigation:
 *   Row 1 — brand + utilities (search / notifications / dark mode / avatar)
 *   Row 2 — every top-level section as a visible nav button (always rendered,
 *           horizontally scrollable on narrow screens — no hamburger menu)
 *
 * Below this header the SectionTabStrip renders the active section's sub-tabs.
 */
export function TopBar({ dark, onDark }: TopBarProps) {
  const [location] = useLocation();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { data: notifData } = useNotifications();
  const unreadCount = (notifData?.notifications ?? []).filter((n: any) => !n.read).length;

  const activeSection = findSectionByRoute(location);

  // Close avatar dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close avatar on route change / Escape
  useEffect(() => { setAvatarOpen(false); }, [location]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAvatarOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      ref={wrapRef}
      className="sticky top-0 z-40 glass-panel border-b border-border/30 backdrop-blur-xl"
    >
      {/* ── Row 1: brand + utilities ─────────────────────────────── */}
      <div className="flex items-center h-14 px-4 gap-3 max-w-[1600px] mx-auto w-full">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
            <NexFlowLogo size={28} />
            <span className="hidden sm:block">
              <NexFlowWordmark />
            </span>
          </div>
        </Link>

        {/* Right cluster — pushed all the way right */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Search: full width on md+, icon-only on small */}
          <button
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 text-muted-foreground text-xs hover:bg-muted/60 transition-colors w-56"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Search...</span>
            <span className="opacity-50 font-mono">⌘K</span>
          </button>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 text-foreground/70"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <Link href="/notifications">
            <button
              className={cn(
                "relative p-2 rounded-lg hover:bg-muted/50 transition-colors",
                location === "/notifications" ? "text-[#B8A0C8]" : "text-foreground/70",
              )}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full nf-chameleon-bg text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </Link>

          <button
            onClick={() => onDark(!dark)}
            className="p-2 rounded-lg hover:bg-muted/50 text-foreground/70 transition-colors"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="flex items-center gap-2 ml-1 p-1 rounded-lg hover:bg-muted/50"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={avatarOpen}
            >
              <div className="w-7 h-7 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[11px] font-black">
                A
              </div>
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

      {/* ── Row 2: HERO nav — every section visible, always ─────────── */}
      <div className="border-t border-border/20">
        <nav
          className="flex items-center gap-1 px-3 sm:px-4 h-12 overflow-x-auto no-scrollbar max-w-[1600px] mx-auto"
          aria-label="Primary"
        >
          {SECTIONS.map((g) => {
            const isActiveSection = activeSection?.key === g.key;
            const Icon = g.icon;
            // Home navigates to "/" (Command Center); others to their section hub
            const href = g.key === "home" ? "/" : `/section/${g.key}`;
            return (
              <Link key={g.key} href={href}>
                <button
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all",
                    isActiveSection
                      ? "text-white shadow-sm"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted/40",
                  )}
                  style={
                    isActiveSection
                      ? {
                          background: `linear-gradient(135deg, ${g.accent}, #B8A0C8)`,
                          boxShadow: `0 4px 12px ${g.accent}40`,
                        }
                      : undefined
                  }
                  aria-current={isActiveSection ? "page" : undefined}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: isActiveSection ? "#fff" : g.accent }}
                  />
                  <span>{g.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
