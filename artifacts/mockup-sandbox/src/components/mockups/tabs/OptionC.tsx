import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Bell, Sparkles } from "lucide-react";
import { NAV, type NavSection, type SubItem } from "./navData";

function pickMain(key: string) {
  return NAV.find((n) => n.key === key)!;
}

export default function OptionC() {
  const [mainKey, setMainKey]   = useState("crm");
  const [subKey, setSubKey]     = useState("pipeline");
  const [pageKey, setPageKey]   = useState("presal");
  const [sidebarOpen, setSidebar] = useState(true);

  const section: NavSection = pickMain(mainKey);
  const subItem: SubItem    = section.subs.find((s) => s.key === subKey) ?? section.subs[0];
  const hasSubs             = subItem.items.length > 0;
  const color               = section.color;

  function selectMain(key: string) {
    const s = pickMain(key);
    setMainKey(key);
    setSubKey(s.subs[0]?.key ?? "");
    setPageKey(s.subs[0]?.items[0]?.key ?? "");
  }
  function selectSub(key: string) {
    const sub = section.subs.find((s) => s.key === key)!;
    setSubKey(key);
    setPageKey(sub.items[0]?.key ?? "");
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans select-none"
      style={{ background: "linear-gradient(160deg, #0F1117 0%, #161922 60%, #111418 100%)" }}>

      {/* Subtle grid pattern */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 30% 0%, ${color}18 0%, transparent 55%)` }} />

      {/* ── LEVEL 1: Top bar — dual-row ── */}
      <header className="relative z-20 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Row A: Logo + section icons + utilities */}
        <div className="flex items-center h-12 px-4 gap-3"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)" }}>
          {/* Logo */}
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs"
              style={{ background: `linear-gradient(135deg, ${color}EE, ${color}66)` }}>N</div>
            <span className="font-bold text-[13px] text-white/70 tracking-tight">NexFlow</span>
          </div>

          {/* Section tabs — icon + label, compact */}
          <nav className="flex-1 flex items-center gap-0.5">
            {NAV.map((n) => {
              const Icon   = n.icon;
              const active = n.key === mainKey;
              return (
                <button key={n.key} onClick={() => selectMain(n.key)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all duration-200 whitespace-nowrap"
                  style={active ? {
                    background: `${n.color}20`,
                    color: n.color,
                    border: `1px solid ${n.color}30`,
                  } : {
                    color: "rgba(255,255,255,0.35)",
                    border: "1px solid transparent",
                  }}>
                  <Icon size={13} strokeWidth={active ? 2.2 : 1.7} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Utilities */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <Search size={13} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              <Bell size={13} />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
              style={{ background: `${color}22`, color, border: `1px solid ${color}35` }}>
              <Sparkles size={12} />
              AI
            </button>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-bold"
              style={{ background: `${color}EE` }}>K</div>
          </div>
        </div>

        {/* Row B: Sub-tabs + page context */}
        <div className="flex items-center h-9 px-4 gap-0.5"
          style={{ background: "rgba(255,255,255,0.025)", backdropFilter: "blur(12px)" }}>
          {section.subs.map((s) => {
            const active = s.key === subKey;
            return (
              <button key={s.key} onClick={() => selectSub(s.key)}
                className="relative px-3 h-full text-[11px] font-semibold transition-all duration-200 whitespace-nowrap"
                style={{ color: active ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.28)" }}>
                {s.label}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-sm"
                    style={{ background: color }} />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="relative flex-1 flex overflow-hidden">

        {/* ── LEVEL 3: Glassmorphic sidebar ── */}
        {hasSubs && (
          <aside className="relative z-10 shrink-0 flex flex-col transition-all duration-300"
            style={{
              width: sidebarOpen ? 196 : 52,
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
            }}>
            {/* Toggle */}
            <button onClick={() => setSidebar(!sidebarOpen)}
              className="absolute -right-3 top-4 w-6 h-6 rounded-full flex items-center justify-center z-20 transition-colors"
              style={{
                background: "#1E2330",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                color: "rgba(255,255,255,0.5)",
              }}>
              {sidebarOpen ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
            </button>

            {/* Section label */}
            {sidebarOpen && (
              <div className="px-3 pt-3 pb-1">
                <span className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: `${color}80` }}>{subItem.label}</span>
              </div>
            )}

            {/* Sidebar items */}
            <div className="pt-1 pb-2 px-1.5 space-y-0.5 overflow-y-auto">
              {subItem.items.map((item) => {
                const Icon   = item.icon;
                const active = item.key === pageKey;
                return (
                  <button key={item.key} onClick={() => setPageKey(item.key)}
                    className="w-full flex items-center rounded-lg transition-all duration-200 text-left"
                    style={{
                      gap: sidebarOpen ? 9 : 0,
                      padding: sidebarOpen ? "7px 9px" : "7px",
                      justifyContent: sidebarOpen ? "flex-start" : "center",
                      background: active ? `${color}20` : "transparent",
                      borderLeft: active ? `2px solid ${color}` : "2px solid transparent",
                      color: active ? color : "rgba(255,255,255,0.38)",
                    }}>
                    <Icon size={14} strokeWidth={active ? 2.2 : 1.7} />
                    {sidebarOpen && (
                      <span className="text-[11px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* ── Main content ── */}
        <main className="flex-1 overflow-auto p-5 space-y-4">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pipeline Health", val: "84%", sub: "deals progressing", bar: 84 },
              { label: "Hot Leads",       val: "23",  sub: "scored ≥ 70",       bar: 63 },
              { label: "Today's Actions", val: "147", sub: "activities logged",  bar: 91 },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                  style={{ color: "rgba(255,255,255,0.3)" }}>{k.label}</div>
                <div className="text-2xl font-black mb-1" style={{ color }}>{k.val}</div>
                <div className="text-[10px] mb-2" style={{ color: "rgba(255,255,255,0.28)" }}>{k.sub}</div>
                <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ background: color, width: `${k.bar}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Activity list */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs font-bold text-white/60">Recent Activity</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${color}25`, color }}>● Live</span>
            </div>
            {[
              "Khalid called Al-Ittihad Group — 14 min",
              "AI drafted follow-up for Aramco deal",
              "Sara moved Riyadh Tech → Active",
              "Layla scheduled demo: Al-Rajhi Capital",
            ].map((row, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3"
                style={{ borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{row}</span>
              </div>
            ))}
          </div>

          {/* Design label */}
          <div className="rounded-xl px-4 py-3 text-xs"
            style={{ background: `${color}12`, border: `1px solid ${color}22`, color: `${color}CC` }}>
            <span className="font-bold">Option C — Dark Slate Pro · </span>
            Dual-row top bar (icons + sub-tabs) · dark glass sidebar · grid-texture background
          </div>
        </main>
      </div>
    </div>
  );
}
