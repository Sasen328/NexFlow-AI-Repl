import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import {
  Bell, Search, Settings, LogOut, ChevronRight, Sparkles, FlaskConical,
} from "lucide-react";
import { NexFlowWordmark } from "./NexFlowLogo";
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
 * Slim 2-bar top bar:
 *
 * Bar 1  Brand bar  — wordmark + search + avatar (always visible)
 * Bar 2  Nav tabs   — 6 section tabs with underline active indicator
 */
export function TopBar({ dark, onDark }: TopBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleProfile>(() => getRole());
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

  /* ── Per-section accent colour map ─────────────────────────── */
  const sectionAccentMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(SECTIONS.map((s) => [s.key, s.accent ?? "var(--ac)"])),
    [],
  );

  const navEntries = getNavForRole(currentRole.key).filter(entry => {
    if (!tenantConfig?.tabStructure?.length) return true;
    return (tenantConfig.tabStructure as string[]).includes(entry.key);
  });

  return (
    <header ref={barRef} className="sticky top-0 z-40">

      {/* ═══ Bar 1: Brand bar ════════════════════════════════════ */}
      <div
        className="bar-cmd"
        style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "0 16px", height: "44px",
        }}
      >
        {/* Logo / wordmark */}
        {tenantConfig?.logoBase64 ? (
          <img
            src={tenantConfig.logoBase64}
            alt={tenantConfig.companyName || "Logo"}
            style={{ height: "22px", maxWidth: "100px", objectFit: "contain" }}
          />
        ) : (
          <Link href="/home" aria-label="Home">
            <NexFlowWordmark height={20} />
          </Link>
        )}

        <div style={{ flex: 1 }} />

        {/* Search pill */}
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

        {/* Bell */}
        <button
          style={{
            position: "relative", padding: "4px", borderRadius: "6px",
            border: "none", background: "transparent", cursor: "pointer",
            color: "var(--txq)", display: "flex", alignItems: "center",
          }}
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          <Bell style={{ width: "15px", height: "15px" }} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute", top: "1px", right: "1px",
                minWidth: "13px", height: "13px", borderRadius: "9999px",
                background: "var(--ac)", color: "#fff",
                fontSize: "8px", fontWeight: 700,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "0 2px",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          style={{
            padding: "4px", borderRadius: "6px", border: "none",
            background: "transparent", cursor: "pointer",
            color: "var(--txq)", display: "flex", alignItems: "center",
          }}
          onClick={() => navigate("/settings")}
          aria-label="Settings"
        >
          <Settings style={{ width: "15px", height: "15px" }} />
        </button>

        {/* Avatar */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setAvatarOpen(v => !v)}
            style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: `linear-gradient(135deg,${currentRole.accent},var(--brand-purple))`,
              color: "#fff", fontSize: "10px", fontWeight: 900,
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

      {/* ═══ Bar 2: Section tabs ══════════════════════════════════ */}
      <div
        className="bar-tab"
        style={{ display: "flex", alignItems: "stretch", height: "40px", paddingLeft: "4px" }}
      >
        {navEntries.map(entry => {
          const isActive = activeTop?.key === entry.key;
          const badge = badgeCounts[entry.key] ?? 0;
          const Icon = entry.icon;
          const ac = sectionAccentMap[entry.sections[0]] ?? "var(--ac)";
          return (
            <button
              key={entry.key}
              onClick={() => {
                const sec = SECTIONS.find(s => s.key === entry.sections[0]);
                navigate(sec?.defaultHref ?? "/home");
              }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "0 16px", height: "40px", cursor: "pointer",
                border: "none",
                borderBottom: isActive ? `3px solid ${ac}` : "3px solid transparent",
                background: isActive ? `${ac}22` : "transparent",
                color: isActive ? ac : "var(--txq)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "13px", fontFamily: "'Geist', sans-serif",
                transition: "color .18s, border-color .18s, background .18s",
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
