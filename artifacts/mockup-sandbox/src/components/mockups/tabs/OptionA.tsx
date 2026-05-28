import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Bell, User as UserIcon } from "lucide-react";
import { NAV, type NavSection, type SubItem } from "./navData";

function pickMain(key: string) {
  return NAV.find((n) => n.key === key)!;
}

export default function OptionA() {
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
    <div className="h-screen flex flex-col overflow-hidden font-sans select-none" style={{
      background: "linear-gradient(135deg, #0D0B1E 0%, #130F2A 40%, #0B1A24 100%)",
    }}>
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: color }} />
        <div className="absolute top-20 right-0 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ background: "#38BDF8" }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
          style={{ background: "#F472B6" }} />
      </div>

      {/* ── LEVEL 1: Top bar ── */}
      <header className="relative z-20 flex items-center h-14 px-4 gap-3 shrink-0"
        style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>N</div>
          <span className="text-white/80 font-bold text-sm tracking-tight hidden sm:block">NexFlow</span>
        </div>

        {/* Section tabs */}
        <nav className="flex-1 flex items-center gap-0.5">
          {NAV.map((n) => {
            const Icon  = n.icon;
            const active = n.key === mainKey;
            return (
              <button key={n.key} onClick={() => selectMain(n.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap"
                style={active ? {
                  background: `${n.color}25`,
                  color: n.color,
                  boxShadow: `0 0 12px ${n.color}40, inset 0 1px 0 ${n.color}30`,
                  border: `1px solid ${n.color}35`,
                } : {
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid transparent",
                }}>
                <Icon size={13} />
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <Search size={14} />
          </button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 transition-colors"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <Bell size={14} />
          </button>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>K</div>
        </div>
      </header>

      {/* ── LEVEL 2: Sub-tab strip ── */}
      <div className="relative z-10 flex items-center h-10 px-5 gap-1 shrink-0"
        style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {section.subs.map((s) => {
          const active = s.key === subKey;
          return (
            <button key={s.key} onClick={() => selectSub(s.key)}
              className="relative px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap"
              style={active ? { color, background: `${color}18` } : { color: "rgba(255,255,255,0.38)" }}>
              {s.label}
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                  style={{ background: color }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div className="relative flex-1 flex overflow-hidden">

        {/* ── LEVEL 3: Glassmorphic sidebar ── */}
        {hasSubs && (
          <aside className="relative z-10 shrink-0 flex flex-col transition-all duration-300"
            style={{
              width: sidebarOpen ? 200 : 52,
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(255,255,255,0.10)",
            }}>
            {/* Toggle */}
            <button onClick={() => setSidebar(!sidebarOpen)}
              className="absolute -right-3 top-4 w-6 h-6 rounded-full flex items-center justify-center z-20 text-white/60 hover:text-white transition-colors"
              style={{ background: "rgba(30,25,50,0.9)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              {sidebarOpen ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
            </button>

            <div className="pt-3 pb-2 px-1.5 space-y-0.5 overflow-y-auto">
              {subItem.items.map((item) => {
                const Icon   = item.icon;
                const active = item.key === pageKey;
                return (
                  <button key={item.key} onClick={() => setPageKey(item.key)}
                    className="w-full flex items-center gap-2.5 rounded-xl transition-all duration-200 text-left"
                    style={{
                      padding: sidebarOpen ? "8px 10px" : "8px",
                      justifyContent: sidebarOpen ? "flex-start" : "center",
                      background: active ? `${color}22` : "transparent",
                      borderLeft: active ? `2px solid ${color}` : "2px solid transparent",
                      color: active ? color : "rgba(255,255,255,0.5)",
                    }}>
                    <Icon size={15} />
                    {sidebarOpen && (
                      <span className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
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
              { label: "Pipeline Health", val: "84%", sub: "deals progressing" },
              { label: "Hot Leads",       val: "23",  sub: "scored ≥ 70"       },
              { label: "Today's Actions", val: "147", sub: "activities logged"  },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{k.label}</div>
                <div className="text-2xl font-black" style={{ color }}>{k.val}</div>
                <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Activity list */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs font-bold text-white/70">Recent Activity</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${color}22`, color }}>Live</span>
            </div>
            {["Khalid called Al-Ittihad Group — 14 min", "AI drafted follow-up for Aramco deal", "Sara moved Riyadh Tech → Active", "Layla scheduled demo: Al-Rajhi Capital"].map((row, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-white/50">{row}</span>
              </div>
            ))}
          </div>

          {/* Design label */}
          <div className="rounded-xl px-4 py-3 text-xs"
            style={{ background: `${color}12`, border: `1px solid ${color}25`, color: `${color}CC` }}>
            <span className="font-bold">Option A — Dark Glass Rail · </span>
            Deep dark canvas · glowing section pills · frosted sidebar collapses to icon-only rail
          </div>
        </main>
      </div>
    </div>
  );
}
