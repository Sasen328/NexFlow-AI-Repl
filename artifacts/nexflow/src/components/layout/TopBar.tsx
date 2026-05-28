import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import {
  Bell, Search, Settings, LogOut, ChevronRight, Sparkles, FlaskConical,
} from "lucide-react";
import { NexFlowWordmark, NexFlowLogo } from "./NexFlowLogo";
import { useNotifications } from "@/hooks/useApi";
import {
  SECTIONS, getNavForRole, findSectionByRoute, findTopNavBySection,
} from "@/lib/sections";
import { ROLE_LIST, getRole, setRole, setSignedIn, type RoleProfile } from "@/lib/marketing-auth";
import { useTenantConfig } from "@/hooks/useTenantConfig";

export interface TopBarProps {
  dark: boolean;
  onDark: (v: boolean) => void;
}

const FILTER_CHIPS = [
  "All", "Pinned", "High Value", "KSA", "UAE", "New This Week", "Needs Follow-up",
] as const;

/** Map a notification to a top-nav tab key based on type/category metadata. */
function mapNotifToTabKey(n: { type?: string; category?: string; related_type?: string }): string {
  const t = ((n.type ?? "") + (n.category ?? "") + (n.related_type ?? "")).toLowerCase();
  if (t.includes("call") || t.includes("voicemail") || t.includes("transcript") || t.includes("dialer")) return "callcenter";
  if (t.includes("deal") || t.includes("contact") || t.includes("lead") || t.includes("pipeline")) return "leads";
  if (t.includes("campaign") || t.includes("marketing") || t.includes("email") || t.includes("whatsapp")) return "marketing";
  if (t.includes("insight") || t.includes("report") || t.includes("forecast") || t.includes("dashboard")) return "insights";
  if (t.includes("enrich") || t.includes("signal") || t.includes("data") || t.includes("dedup")) return "datahub";
  return "home";
}

/**
 * 6-bar App Bar stack
 *
 * Bar 1  Quick Action Bar  — label + shortcuts + CTAs + theme + avatar
 * Bar 2  Command Bar       — wordmark + search pill + settings
 * Bar 3  Filter Chips      — horizontal-scroll chip strip
 * Bar 4  Smart Tab Bar     — 6 role-scoped tabs with icons + badges
 * Bar 5  Sub-Tab Bar       — section sub-items, collapsible, deep items fire GSB events
 * Bar 6  Keyboard Strip    — shortcut hints + breadcrumb
 *
 * All bar surfaces consume CSS tokens — no hardcoded QPulse hex values.
 * Sets --topbar-h on :root via ResizeObserver so downstream components
 * (GSB rail, SectionSidebar) can read the exact stacked height.
 */
export function TopBar({ dark, onDark }: TopBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleProfile>(() => getRole());
  const [activeChip, setActiveChip] = useState<string>("All");
  const { data: notifData } = useNotifications();
  const unreadCount = (notifData?.notifications ?? []).filter(
    (n: { read?: boolean }) => !n.read,
  ).length;
  const { config: tenantConfig } = useTenantConfig();

  /* ── Per-tab notification badge counts ──────────────────────── */
  const badgeCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    (notifData?.notifications ?? []).forEach((n: { read?: boolean; type?: string; category?: string; related_type?: string }) => {
      if (!n.read) {
        const key = mapNotifToTabKey(n);
        counts[key] = (counts[key] ?? 0) + 1;
      }
    });
    return counts;
  }, [notifData]);

  /* ── Measure total bar height → --topbar-h ─────────────────── */
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const setH = () =>
      document.documentElement.style.setProperty("--topbar-h", el.offsetHeight + "px");
    setH();
    const obs = new ResizeObserver(setH);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ── Sync role from storage or custom event ─────────────────── */
  useEffect(() => {
    const refresh = () => setCurrentRole(getRole());
    window.addEventListener("nf:role-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("nf:role-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  /* ── Close avatar on outside click ────────────────────────── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  /* ── Close avatar on route change or Escape ─────────────────── */
  useEffect(() => { setAvatarOpen(false); }, [location]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAvatarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── Derived nav state ──────────────────────────────────────── */
  const activeSection = findSectionByRoute(location);
  const activeTop     = activeSection ? findTopNavBySection(activeSection.key) : null;
  const subItems      = activeSection?.items ?? [];
  const isHome        = activeSection?.key === "home";

  /* Per-entry accent: first section's accent colour */
  const sectionAccentMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(SECTIONS.map((s) => [s.key, (s as { accent?: string }).accent ?? "var(--ac)"])),
    [],
  );

  const navEntries = getNavForRole(currentRole.key).filter(entry => {
    if (!tenantConfig?.tabStructure?.length) return true;
    return (tenantConfig.tabStructure as string[]).includes(entry.key);
  });

  /* ── Active sub-item ────────────────────────────────────────── */
  const activeSubItem = subItems.find(
    i => location === i.href || (i.href !== "/" && location.startsWith(i.href + "/")),
  );

  return (
    <header ref={barRef} className="sticky top-0 z-40">

      {/* ═══ Bar 1: Quick Action Bar (~26px) ════════════════════════ */}
      <div className="bar-qa" style={{ height: "26px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        {/* Left: Logo + AI Action Intelligence */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/home" aria-label="Home">
            <NexFlowLogo size={20} />
          </Link>
          <button
            className="qa-ai-pill"
            onClick={() => window.dispatchEvent(new CustomEvent("nf:assistant-open"))}
            aria-label="AI Action Intelligence"
          >
            <Sparkles style={{ width: "11px", height: "11px" }} />
            AI Action
          </button>
        </div>

        {/* Right: Bell · ⊙ Theme · Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            className="qa-ghost-pill"
            style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => navigate("/notifications")}
            aria-label="Notifications"
          >
            <Bell style={{ width: "12px", height: "12px" }} />
            {unreadCount > 0 && (
              <span className="qa-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </button>
          <button
            className="qa-solid-pill"
            style={{ width: "25px", padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px", lineHeight: 1 }}
            onClick={() => window.dispatchEvent(new CustomEvent("nf:theme-drawer-open"))}
            aria-label="Open theme settings"
          >
            ⊙
          </button>
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setAvatarOpen(v => !v)}
              style={{
                width: "22px", height: "22px", borderRadius: "50%",
                background: `linear-gradient(135deg,${currentRole.accent},var(--brand-purple))`,
                color: "#fff", fontSize: "9px", fontWeight: 900,
                border: "none", cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={avatarOpen}
            >
              {currentRole.initials}
            </button>
            {avatarOpen && (
              <AvatarDropdown
                role={currentRole}
                dark={dark}
                onDark={onDark}
                onClose={() => setAvatarOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ═══ Bar 2+3: Command Bar + Filter Chips ════════════════════ */}
      <div className="bar-cmd">
        {/* Row 1: wordmark + search + settings */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 16px", height: "40px" }}>
          {tenantConfig?.logoBase64 ? (
            <img
              src={tenantConfig.logoBase64}
              alt={tenantConfig.companyName || "Logo"}
              style={{ height: "22px", maxWidth: "100px", objectFit: "contain" }}
            />
          ) : (
            <NexFlowWordmark height={22} />
          )}
          <div style={{ flex: 1 }} />
          <div
            className="cmd-search-pill"
            role="button"
            tabIndex={0}
            onClick={() => alert("Global search — try per-page search inside each section.")}
            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.click(); }}
            aria-label="Search"
          >
            <Search style={{ width: "12px", height: "12px", flexShrink: 0 }} />
            <span style={{ flex: 1, pointerEvents: "none" }}>Search...</span>
            <span style={{ opacity: 0.45, fontFamily: "'Geist Mono', monospace", fontSize: "10px", pointerEvents: "none" }}>⌘K</span>
          </div>
          <button
            style={{ padding: "4px", borderRadius: "6px", border: "none", background: "transparent", cursor: "pointer", color: "var(--txq)", display: "flex", alignItems: "center" }}
            onClick={() => navigate("/settings")}
            aria-label="Settings"
          >
            <Settings style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
        {/* Row 2: Filter Chips */}
        <div className="filter-chips-row" style={{ paddingBottom: "6px", paddingLeft: "16px", paddingRight: "16px" }}>
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={cn("filter-chip", activeChip === chip && "filter-chip--active")}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Bar 4: Smart Tab Bar (38px) ════════════════════════════ */}
      <div
        className="bar-tab"
        style={{ display: "flex", alignItems: "stretch", height: "38px" }}
      >
        {navEntries.map(entry => {
          const isActive = activeTop?.key === entry.key;
          const badge = badgeCounts[entry.key] ?? 0;
          const Icon = entry.icon;
          return (
            <button
              key={entry.key}
              onClick={() => {
                const sec = SECTIONS.find(s => s.key === entry.sections[0]);
                navigate(sec?.defaultHref ?? "/home");
              }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "0 14px", height: "38px", cursor: "pointer",
                border: "none",
                borderBottom: isActive
                  ? `2px solid ${sectionAccentMap[entry.sections[0]] ?? "var(--ac)"}`
                  : "2px solid transparent",
                background: isActive
                  ? `${sectionAccentMap[entry.sections[0]] ?? "var(--ac)"}12`
                  : "transparent",
                color: isActive
                  ? (sectionAccentMap[entry.sections[0]] ?? "var(--btx)")
                  : "var(--txq)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "13px", fontFamily: "'Geist', sans-serif",
                transition: "color .2s, border-color .2s, background .2s",
                whiteSpace: "nowrap",
              }}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon style={{ width: "14px", height: "14px", strokeWidth: 1.6 }} />
              <span>{entry.label}</span>
              {badge > 0 && (
                <span
                  style={{
                    minWidth: "15px", height: "15px", borderRadius: "9999px",
                    background: "var(--ac)", color: "#fff",
                    fontSize: "8px", fontWeight: 700,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "0 3px", flexShrink: 0,
                  }}
                >
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ Bar 5: Sub-Tab Bar (31px, collapsible) ═════════════════ */}
      <div
        className="bar-sub"
        style={{
          overflow: "hidden",
          maxHeight: subItems.length > 0 ? "40px" : "0",
          transition: "max-height .22s ease",
          display: "flex", alignItems: "center",
          padding: "0 8px", gap: "2px",
        }}
      >
        {subItems.map(item => {
          const isActiveItem =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href + "/"));
          const isDeep = !isHome;
          const displayLabel = isDeep ? item.label + " ›" : item.label;
          return (
            <button
              key={item.href}
              onClick={() => {
                if (isDeep) {
                  // Deep items open the Global Side Bar — navigation is GSB's responsibility
                  window.dispatchEvent(
                    new CustomEvent("nf:gsb-open", { detail: { label: item.label, href: item.href } }),
                  );
                } else {
                  // Home section items navigate directly and close any open GSB
                  navigate(item.href);
                  window.dispatchEvent(new CustomEvent("nf:gsb-close"));
                }
              }}
              style={{
                height: "28px", padding: "0 12px",
                borderRadius: "var(--r-pill)",
                fontSize: "12px", fontFamily: "'Geist', sans-serif",
                cursor: "pointer", border: "none",
                background: isActiveItem ? "var(--sub-bg)" : "transparent",
                fontWeight: isActiveItem ? 600 : 400,
                color: isActiveItem ? "var(--btx)" : "var(--txM)",
                transition: "background .15s, color .15s",
                whiteSpace: "nowrap",
              }}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      {/* ═══ Bar 6: Keyboard Strip (~20px) ══════════════════════════ */}
      <div
        className="bar-kbd keyboard-strip"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", height: "20px",
        }}
      >
        <span style={{ fontSize: "9px", fontFamily: "'Geist Mono', monospace", color: "var(--txq)" }}>
          ← → tabs · Space search · T theme
        </span>
        <span style={{ fontSize: "9px", fontFamily: "'Geist Mono', monospace", color: "var(--txq)" }}>
          {[activeTop?.label, activeSubItem?.label].filter(Boolean).join(" · ")}
        </span>
      </div>

    </header>
  );
}

/* ─── Avatar Dropdown ─────────────────────────────────────────────── */

function AvatarDropdown({
  role, dark, onDark, onClose,
}: {
  role: RoleProfile;
  dark: boolean;
  onDark: (v: boolean) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute right-0 top-full mt-1 w-72 glass-card rounded-xl shadow-xl py-2 z-50"
      style={{ border: "1px solid var(--bd)" }}
    >
      {/* Profile header */}
      <div className="px-3 py-2 flex items-center gap-2" style={{ borderBottom: "1px solid var(--bd)" }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
          style={{ background: `linear-gradient(135deg,${role.accent},var(--brand-purple))` }}
        >
          {role.initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">{role.name}</div>
          <div className="text-[11px] truncate" style={{ color: "var(--txM)" }}>{role.title}</div>
          <div className="text-[10px] truncate" style={{ color: "var(--txq)" }}>{role.email}</div>
        </div>
      </div>

      {/* Persona switcher */}
      <div className="px-3 pt-2 pb-1">
        <div
          className="text-[9px] font-black uppercase tracking-wider mb-1.5"
          style={{ color: "var(--txq)" }}
        >
          Switch persona
        </div>
        <div className="grid grid-cols-1 gap-1">
          {ROLE_LIST.map(r => {
            const active = r.key === role.key;
            return (
              <button
                key={r.key}
                onClick={() => { setRole(r.key); onClose(); }}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all w-full",
                  active ? "bg-muted/60" : "hover:bg-muted/40",
                )}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${r.accent},var(--brand-purple))` }}
                >
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold truncate leading-tight">{r.label}</div>
                  <div className="text-[10px] truncate leading-tight" style={{ color: "var(--txq)" }}>
                    {r.name}
                  </div>
                </div>
                {active && (
                  <div
                    className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: `${r.accent}25`, color: r.accent }}
                  >
                    Active
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dark mode toggle */}
      <div style={{ borderTop: "1px solid var(--bd)" }} className="mx-1 mt-1 pt-1">
        <button
          onClick={() => { onDark(!dark); onClose(); }}
          className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-muted/50 rounded-lg text-left"
          style={{ color: "var(--txM)" }}
        >
          <span style={{ fontSize: "13px" }}>{dark ? "☀" : "☾"}</span>
          {dark ? "Switch to light mode" : "Switch to dark mode"}
        </button>
      </div>

      {/* Links */}
      <Link href="/account-settings">
        <div
          className="flex items-center gap-2 mx-1 px-2 py-2 text-sm hover:bg-muted/50 cursor-pointer rounded-lg"
          onClick={onClose}
        >
          <Settings className="w-3.5 h-3.5" style={{ color: "var(--txq)" }} />
          <span>Account Settings</span>
          <ChevronRight className="w-3 h-3 ml-auto" style={{ color: "var(--txq)" }} />
        </div>
      </Link>
      <Link href="/capabilities">
        <div
          className="flex items-center gap-2 mx-1 px-2 py-2 text-sm hover:bg-muted/50 cursor-pointer rounded-lg"
          onClick={onClose}
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--txq)" }} />
          <span>Capabilities</span>
        </div>
      </Link>

      {/* Sign out */}
      <div style={{ borderTop: "1px solid var(--bd)" }} className="mt-1 pt-1">
        <button
          onClick={() => { setSignedIn(false); window.location.href = "/welcome"; }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 text-left"
          style={{ color: "var(--txM)" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>

      {/* Demo badge */}
      <div className="px-3 pt-2 mt-1" style={{ borderTop: "1px solid var(--bd)" }}>
        <div className="demo-badge-card flex items-center gap-1.5 px-2 py-1 rounded-lg">
          <FlaskConical className="w-3 h-3" style={{ color: "var(--brand-gold)" }} />
          <div className="text-[10px] font-bold" style={{ color: "var(--brand-gold)" }}>
            DEMO MODE — click any persona above to switch
          </div>
        </div>
      </div>
    </div>
  );
}
