import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import {
  Bell, Search, Moon, Sun, Settings, Sparkles, FlaskConical,
  LogOut, ChevronRight, ChevronDown,
} from "lucide-react";
import { NexFlowLogo } from "./NexFlowLogo";
import { useNotifications } from "@/hooks/useApi";
import {
  SECTIONS, TOP_NAV, findSectionByRoute, findTopNavBySection,
  type SectionDef, type TopNavEntry,
} from "@/lib/sections";

interface TopBarProps {
  dark: boolean;
  onDark: (v: boolean) => void;
}

/**
 * Two-row hero navigation:
 *   Row 1 — logo icon (no wordmark) + six top-nav buttons (Home, CRM,
 *           Contact Center, Enrichment, Marketing, More). Single-section
 *           buttons reveal their sub-tabs on hover. "More" opens a
 *           hierarchical two-pane menu where the left column lists
 *           grouped sections and the right column reveals that section's
 *           sub-tabs on hover/click.
 *   Row 2 — search bar + utilities (notifications, dark mode, avatar)
 *           pushed to the right edge. No logos or icons in this row.
 */
export function TopBar({ dark, onDark }: TopBarProps) {
  const [location] = useLocation();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [openTopKey, setOpenTopKey] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: notifData } = useNotifications();
  const unreadCount = (notifData?.notifications ?? []).filter((n: { read?: boolean }) => !n.read).length;

  const activeSection = findSectionByRoute(location);
  const activeTop = activeSection ? findTopNavBySection(activeSection.key) : null;

  // Close avatar/nav dropdowns on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
        setOpenTopKey(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close everything on route change / Escape
  useEffect(() => {
    setAvatarOpen(false);
    setOpenTopKey(null);
  }, [location]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAvatarOpen(false);
        setOpenTopKey(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Hover open/close with a short delay so a quick mouse-out doesn't snap shut
  function openTop(key: string) {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenTopKey(key);
  }
  function scheduleCloseTop() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpenTopKey(null), 150);
  }

  return (
    <header
      ref={wrapRef}
      className="sticky top-0 z-40 glass-panel border-b border-border/30 backdrop-blur-xl"
    >
      {/* ── Row 1 (top): logo icon + 6-button top nav ──────────────
            Logo sits beside the Home tab. No wordmark. No utilities. */}
      <div className="flex items-center h-12 px-3 sm:px-4 max-w-[1600px] mx-auto w-full gap-2">
        <Link href="/home">
          <div className="flex-shrink-0 cursor-pointer p-1 rounded-lg hover:bg-muted/40 transition-colors" aria-label="NexFlow home">
            <NexFlowLogo size={28} />
          </div>
        </Link>
        <nav
          className="flex items-center gap-1 flex-1 flex-wrap"
          aria-label="Primary"
        >
          {TOP_NAV.map((entry) => (
            <TopNavButton
              key={entry.key}
              entry={entry}
              isActive={activeTop?.key === entry.key}
              isOpen={openTopKey === entry.key}
              onOpen={() => openTop(entry.key)}
              onClose={() => setOpenTopKey(null)}
              onScheduleClose={scheduleCloseTop}
              onItemClick={() => setOpenTopKey(null)}
              currentPath={location}
            />
          ))}
        </nav>
      </div>

      {/* ── Row 2 (below tabs): search + utilities, right-aligned.
            Nothing on the left — completely clean below the tab row. */}
      <div className="border-t border-border/20">
        <div className="flex items-center justify-end h-10 px-3 sm:px-4 max-w-[1600px] mx-auto w-full gap-1">
          <button
            className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 text-muted-foreground text-xs hover:bg-muted/60 transition-colors w-44 lg:w-64"
            aria-label="Search"
            onClick={() => alert("Global search coming soon — try the per-page search inside Contacts, Companies, etc.")}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Search...</span>
            <span className="opacity-50 font-mono">⌘K</span>
          </button>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 text-foreground/70"
            aria-label="Search"
            onClick={() => alert("Global search coming soon.")}
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
                  <button
                    onClick={() => {
                      import("@/lib/marketing-auth").then((m) => {
                        m.setSignedIn(false);
                        window.location.href = "/welcome";
                      });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
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
    </header>
  );
}

/* ─── Single top-nav button + hover dropdown ─────────────────────── */

function TopNavButton({
  entry, isActive, isOpen, onOpen, onClose, onScheduleClose, onItemClick, currentPath,
}: {
  entry: TopNavEntry;
  isActive: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onScheduleClose: () => void;
  onItemClick: () => void;
  currentPath: string;
}) {
  const [, navigate] = useLocation();
  const Icon = entry.icon;
  const isMore = entry.key === "more";

  // Determine the click-through target. "More" doesn't navigate; it just opens
  // the dropdown. Single-section entries jump to that section's defaultHref.
  const primarySection: SectionDef | null = isMore
    ? null
    : SECTIONS.find((s) => s.key === entry.sections[0]) ?? null;
  const clickHref = primarySection?.defaultHref ?? "/";

  // Accent for the active state — first section's accent (or chameleon for More)
  const accent = primarySection?.accent ?? "#B8A0C8";

  function handleClick(e: React.MouseEvent) {
    if (isMore) {
      // Click toggles the More dropdown; no hover timing involved.
      e.preventDefault();
      e.stopPropagation();
      if (isOpen) onClose();
      else onOpen();
    } else {
      navigate(clickHref);
    }
  }

  // Hover-open is kept for the single-section tabs (Home, CRM, etc.) where it
  // worked fine, but is DISABLED for "More" so the dropdown is purely a
  // click-driven menu — no 150ms close timer can sneak in and shut it.
  const hoverHandlers = isMore
    ? {}
    : {
        onMouseEnter: onOpen,
        onMouseLeave: onScheduleClose,
        onFocus: onOpen,
        onBlur: (e: React.FocusEvent) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) onScheduleClose();
        },
      };

  return (
    <div
      className="relative"
      {...hoverHandlers}
    >
      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap flex-shrink-0 transition-all",
          isActive
            ? "text-white shadow-sm"
            : "text-foreground/70 hover:text-foreground hover:bg-muted/40",
        )}
        style={
          isActive
            ? {
                background: `linear-gradient(135deg, ${accent}, #B8A0C8)`,
                boxShadow: `0 4px 12px ${accent}40`,
              }
            : undefined
        }
        aria-current={isActive ? "page" : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={handleClick}
      >
        <Icon
          className="w-3.5 h-3.5"
          style={{ color: isActive ? "#fff" : accent }}
        />
        <span>{entry.label}</span>
        {isMore && (
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform",
              isOpen ? "rotate-180" : "",
            )}
          />
        )}
      </button>

      {isOpen && (isMore
        ? <MoreDropdown entry={entry} onItemClick={onItemClick} currentPath={currentPath} />
        : <SingleSectionDropdown entry={entry} onItemClick={onItemClick} currentPath={currentPath} />
      )}
    </div>
  );
}

/* ─── Single-section dropdown (Home, CRM, etc) ──────────────────── */

function SingleSectionDropdown({
  entry, onItemClick, currentPath,
}: {
  entry: TopNavEntry;
  onItemClick: () => void;
  currentPath: string;
}) {
  const section = SECTIONS.find((s) => s.key === entry.sections[0]);
  if (!section) return null;

  return (
    <div className="absolute top-full left-0 mt-1 z-50 glass-card rounded-xl border border-border/40 shadow-xl py-2 w-72">
      {section.items.map((item) => {
        const ItemIcon = item.icon;
        const active =
          currentPath === item.href ||
          (item.href !== "/" && currentPath.startsWith(item.href + "/"));
        return (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-start gap-2.5 px-3 py-2 mx-1 rounded-md cursor-pointer transition-colors",
                active ? "bg-muted/60" : "hover:bg-muted/40",
              )}
              onClick={onItemClick}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${section.accent}20` }}
              >
                <ItemIcon className="w-3.5 h-3.5" style={{ color: section.accent }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn(
                  "text-sm font-semibold truncate",
                  active ? "text-foreground" : "text-foreground/90",
                )}>
                  {item.label}
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">
                  {item.desc}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Click-driven cascading "More" dropdown ─────────────────────
   Step 1 — click "More" → primary panel shows section names.
   Step 2 — click a section → tooltip-style sub-panel pops out to its
            LEFT (More is the rightmost tab so there's no room on the
            right) listing that section's sub-tabs.
   Step 3 — click a sub-tab → navigate.                            */

function MoreDropdown({
  entry, onItemClick, currentPath,
}: {
  entry: TopNavEntry;
  onItemClick: () => void;
  currentPath: string;
}) {
  const sections = entry.sections
    .map((k) => SECTIONS.find((s) => s.key === k))
    .filter((s): s is SectionDef => Boolean(s));

  // Pre-select whichever grouped section the user is currently inside, if any.
  const initialKey =
    sections.find((s) =>
      currentPath.startsWith(`/section/${s.key}`) ||
      s.items.some((i) => currentPath === i.href || (i.href !== "/" && currentPath.startsWith(i.href + "/"))),
    )?.key ?? null;

  const [openSectionKey, setOpenSectionKey] = useState<string | null>(initialKey);

  function toggleSection(key: string) {
    setOpenSectionKey((curr) => (curr === key ? null : key));
  }

  return (
    <div className="absolute top-full right-0 mt-1 z-50 flex items-start gap-2">
      {/* Sub-list flyout (rendered to the LEFT so it never clips) — only
          shown when a section is selected. */}
      {openSectionKey && (() => {
        const section = sections.find((s) => s.key === openSectionKey);
        if (!section) return null;
        return (
          <div className="glass-card rounded-xl border border-border/40 shadow-xl py-2 w-72 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center gap-2 px-3 pb-2 border-b border-border/30 mb-1">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: `${section.accent}25` }}
              >
                <section.icon className="w-3.5 h-3.5" style={{ color: section.accent }} />
              </div>
              <div
                className="text-[11px] font-black uppercase tracking-wider"
                style={{ color: section.accent }}
              >
                {section.label}
              </div>
            </div>
            {section.items.map((item) => {
              const ItemIcon = item.icon;
              const active =
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href + "/"));
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={onItemClick}
                    className={cn(
                      "flex items-start gap-2.5 mx-1 px-2.5 py-2 rounded-md cursor-pointer transition-colors",
                      active ? "bg-muted/60" : "hover:bg-muted/40",
                    )}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${section.accent}20` }}
                    >
                      <ItemIcon className="w-3.5 h-3.5" style={{ color: section.accent }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        "text-sm font-semibold truncate",
                        active ? "text-foreground" : "text-foreground/90",
                      )}>
                        {item.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        );
      })()}

      {/* Primary section list (always rendered while More is open) */}
      <div className="glass-card rounded-xl border border-border/40 shadow-xl py-2 w-[220px]">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const isOpen = openSectionKey === section.key;
          return (
            <button
              key={section.key}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSection(section.key);
              }}
              className={cn(
                "w-full flex items-center gap-2 mx-0 px-2.5 py-2 rounded-md cursor-pointer transition-colors text-left",
                isOpen ? "bg-muted/70" : "hover:bg-muted/40",
              )}
              aria-haspopup="true"
              aria-expanded={isOpen}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${section.accent}25` }}
              >
                <SectionIcon className="w-3.5 h-3.5" style={{ color: section.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground truncate">
                  {section.label}
                </div>
              </div>
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
