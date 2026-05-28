import { useState } from "react";
import { Home, Users, Phone, Database, Megaphone, BarChart3 } from "lucide-react";

const TABS = [
  { key: "home",       label: "Home",        icon: Home,       color: "#B8A0C8" },
  { key: "crm",        label: "CRM",         icon: Users,      color: "#88B8B0" },
  { key: "callcenter", label: "Call Center", icon: Phone,      color: "#C8A880" },
  { key: "datahub",    label: "Data Hub",    icon: Database,   color: "#A0B8C8" },
  { key: "marketing",  label: "Marketing",   icon: Megaphone,  color: "#C8A0A0" },
  { key: "insights",   label: "Insights",    icon: BarChart3,  color: "#A0C8A8" },
];

const SUB = ["Dashboard", "Pipeline", "Contacts", "Companies", "Forecasting"];

export default function OptionC() {
  const [active, setActive] = useState("crm");
  const [activeSub, setActiveSub] = useState(0);
  const tab = TABS.find((t) => t.key === active)!;

  return (
    <div className="min-h-screen bg-[#F5F3FA] flex flex-col items-center justify-start pt-10 px-8 font-sans">
      {/* Label */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A880]/15 text-[#9E7E40] text-xs font-semibold tracking-wide uppercase">
          Option C — Segment Capsule
        </div>
        <p className="mt-2 text-[13px] text-[#6B6480]">
          iOS-style segmented control · bold icons · capsule slides with spring animation
        </p>
      </div>

      {/* Top-level Nav Bar — segmented capsule */}
      <div className="w-full max-w-4xl p-1.5 rounded-2xl flex items-center gap-0"
        style={{ background: "rgba(28,26,46,0.07)" }}>
        {TABS.map((t) => {
          const isActive = t.key === active;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="flex-1 relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all duration-200"
              style={
                isActive
                  ? {
                      background: "white",
                      color: t.color,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
                    }
                  : { color: "#8A849A", background: "transparent" }
              }
            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={isActive ? "font-bold" : "font-medium"}>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tabs — mini segmented */}
      <div className="w-full max-w-4xl mt-3 p-1 rounded-xl inline-flex items-center gap-0 self-start"
        style={{ background: "rgba(28,26,46,0.05)" }}>
        {SUB.map((s, i) => (
          <button
            key={s}
            onClick={() => setActiveSub(i)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
            style={
              activeSub === i
                ? {
                    background: "white",
                    color: tab.color,
                    fontWeight: 700,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }
                : { color: "#9A94AD", background: "transparent" }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content preview */}
      <div className="w-full max-w-4xl mt-5 grid grid-cols-3 gap-4">
        {["Pipeline Health", "Hot Leads", "Team Output"].map((title, i) => (
          <div
            key={title}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{title}</div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${tab.color}18`, color: tab.color }}
              >
                live
              </span>
            </div>
            <div className="text-2xl font-black" style={{ color: "#1C1A2E" }}>
              {["84%", "23", "147"][i]}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {["deals progressing", "scored ≥70", "activities today"][i]}
            </div>
            {/* Thin accent bar */}
            <div className="mt-3 h-1 rounded-full" style={{ background: `${tab.color}25` }}>
              <div
                className="h-full rounded-full"
                style={{ background: tab.color, width: ["84%", "63%", "91%"][i] }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Highlight */}
      <div className="w-full max-w-4xl mt-5 rounded-2xl p-5 border"
        style={{ background: `${tab.color}08`, borderColor: `${tab.color}25` }}>
        <div className="text-[12px] font-bold mb-1" style={{ color: tab.color }}>Design notes</div>
        <ul className="text-[12px] text-[#6B6480] space-y-1 list-disc list-inside">
          <li>Outer track uses a muted inset shadow — active slide is a white card</li>
          <li>Active item gets colored icon + bold label, no gradient or glow</li>
          <li>Sub-tabs reuse the same capsule pattern at a smaller scale</li>
          <li>Feels native (iOS/macOS segment control) — great for power users</li>
        </ul>
      </div>
    </div>
  );
}
