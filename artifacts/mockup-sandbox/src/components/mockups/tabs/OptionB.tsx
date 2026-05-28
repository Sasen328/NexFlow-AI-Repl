import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Bell, Settings } from "lucide-react";
import { NAV, type NavSection, type SubItem } from "./navData";

function pickMain(key: string) {
  return NAV.find((n) => n.key === key)!;
}

export default function OptionB() {
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
      style={{ background: "linear-gradient(145deg, #F2EFFF 0%, #EBF7F3 50%, #FEF0F8 100%)" }}>

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 w-72 h-72 rounded-full opacity-25 blur-3xl"
          style={{ background: color }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{ background: "#F472B6" }} />
      </div>

      {/* ── LEVEL 1: Top bar ── */}
      <header className="relative z-20 flex items-center h-[54px] px-5 gap-4 shrink-0"
        style={{
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(28px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.9), 0 2px 12px rgba(0,0,0,0.04)",
        }}>
        {/* Logo */}
        <div className="flex items-center gap-2 mr-3 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs"
            style={{ background: `linear-gradient(135deg, ${color}EE, ${color}88)` }}>N</div>
          <span className="font-bold text-[13px] tracking-tight" style={{ color: "#1E1B3A" }}>NexFlow</span>
        </div>

        {/* Section tabs — underline style */}
        <nav className="flex-1 flex items-center h-full overflow-x-auto">
          {NAV.map((n) => {
            const Icon   = n.icon;
            const active = n.key === mainKey;
            return (
              <button key={n.key} onClick={() => selectMain(n.key)}
                className="relative flex items-center gap-1.5 px-3 h-full text-[12px] font-semibold transition-all duration-200 whitespace-nowrap shrink-0"
                style={{ color: active ? n.color : "rgba(71,85,105,0.5)" }}>
                <Icon size={13} strokeWidth={active ? 2.5 : 1.8} />
                <span>{n.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-t-full"
                    style={{ background: `linear-gradient(90deg, ${n.color}CC, ${n.color}66)` }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Utilities */}
        <div className="flex items-center gap-1 shrink-0">
          {[Search, Bell, Settings].map((Icon, i) => (
            <button key={i} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ color: "rgba(100,116,139,0.6)" }}>
              <Icon size={14} />
            </button>
          ))}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold ml-1"
            style={{ background: `linear-gradient(135deg, ${color}EE, ${color}88)` }}>K</div>
        </div>
      </header>

      {/* ── LEVEL 2: Sub-tab strip ── */}
      <div className="relative z-10 flex items-center h-11 px-5 gap-0.5 shrink-0 overflow-x-auto"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
        }}>
        {/* Section breadcrumb label */}
        <span className="text-[11px] font-black mr-3 shrink-0 uppercase tracking-wide"
          style={{ color: `${color}BB` }}>{section.label}</span>
        <span className="text-slate-200 text-xs mr-2 shrink-0">/</span>

        {section.subs.map((s) => {
          const active = s.key === subKey;
          return (
            <button key={s.key} onClick={() => selectSub(s.key)}
              className="px-3 py-1 rounded-full text-[11.5px] font-semibold transition-all duration-200 whitespace-nowrap shrink-0"
              style={active ? {
                background: `${color}18`,
                color,
                outline: `1.5px solid ${color}35`,
              } : { color: "rgba(71,85,105,0.5)" }}>
              {s.label}
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
              background: "rgba(255,255,255,0.62)",
              backdropFilter: "blur(28px)",
              borderRight: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "4px 0 20px rgba(0,0,0,0.04)",
            }}>
            {/* Toggle */}
            <button onClick={() => setSidebar(!sidebarOpen)}
              className="absolute -right-3.5 top-4 w-7 h-7 rounded-full flex items-center justify-center z-20 transition-colors"
              style={{
                background: "white",
                border: "1px solid rgba(0,0,0,0.10)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
                color: "rgba(100,116,139,0.7)",
              }}>
              {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </button>

            {/* Sidebar items */}
            <div className="pt-3 pb-2 px-1.5 space-y-0.5 overflow-y-auto">
              {subItem.items.map((item) => {
                const Icon   = item.icon;
                const active = item.key === pageKey;
                return (
                  <button key={item.key} onClick={() => setPageKey(item.key)}
                    className="w-full flex items-center rounded-xl transition-all duration-200 text-left"
                    style={{
                      gap: sidebarOpen ? 10 : 0,
                      padding: sidebarOpen ? "8px 10px" : "8px",
                      justifyContent: sidebarOpen ? "flex-start" : "center",
                      background: active ? `${color}15` : "transparent",
                      borderLeft: active ? `2.5px solid ${color}` : "2.5px solid transparent",
                      color: active ? color : "rgba(100,116,139,0.65)",
                    }}>
                    <Icon size={15} strokeWidth={active ? 2.2 : 1.7} />
                    {sidebarOpen && (
                      <span className="text-[11.5px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
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
              <div key={k.label} className="rounded-2xl p-4 bg-white"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-1.5 text-slate-400">{k.label}</div>
                <div className="text-2xl font-black mb-1" style={{ color }}>{k.val}</div>
                <div className="text-[10px] text-slate-400 mb-2">{k.sub}</div>
                <div className="h-1 rounded-full bg-slate-100">
                  <div className="h-full rounded-full transition-all" style={{ background: color, width: `${k.bar}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Activity list */}
          <div className="rounded-2xl overflow-hidden bg-white"
            style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${color}18` }}>
              <span className="text-xs font-bold text-slate-600">Recent Activity</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${color}15`, color }}>● Live</span>
            </div>
            {[
              "Khalid called Al-Ittihad Group — 14 min",
              "AI drafted follow-up for Aramco deal",
              "Sara moved Riyadh Tech → Active",
              "Layla scheduled demo: Al-Rajhi Capital",
            ].map((row, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3"
                style={{ borderBottom: i < 3 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-slate-500">{row}</span>
              </div>
            ))}
          </div>

          {/* Design label */}
          <div className="rounded-xl px-4 py-3 text-xs bg-white"
            style={{ border: `1px solid ${color}28`, color: `${color}CC` }}>
            <span className="font-bold">Option B — Aurora Light · </span>
            Frosted white top bar · colored underline accent · breadcrumb + pill sub-tabs · white glass sidebar
          </div>
        </main>
      </div>
    </div>
  );
}
