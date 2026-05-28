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

export default function OptionA() {
  const [active, setActive] = useState("crm");
  const tab = TABS.find((t) => t.key === active)!;

  return (
    <div className="min-h-screen bg-[#F5F3FA] flex flex-col items-center justify-start pt-10 px-8 font-sans">
      {/* Label */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8A0C8]/15 text-[#7C5E9E] text-xs font-semibold tracking-wide uppercase">
          Option A — Floating Pill Tabs
        </div>
        <p className="mt-2 text-[13px] text-[#6B6480]">
          Rounded pills with filled active state &amp; soft shadow · subtabs slide underneath
        </p>
      </div>

      {/* Top-level Nav Bar */}
      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-md rounded-2xl shadow-lg shadow-black/5 border border-white/80 p-2 flex items-center gap-1">
        {TABS.map((t) => {
          const isActive = t.key === active;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200"
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${t.color}E8, ${t.color}B0)`,
                      color: "#fff",
                      boxShadow: `0 4px 12px ${t.color}55`,
                    }
                  : { color: "#8A849A", background: "transparent" }
              }
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tab strip */}
      <div className="w-full max-w-4xl mt-3 flex items-center gap-1 px-1">
        {["Dashboard", "Pipeline", "Contacts", "Companies", "Forecasting"].map((s, i) => (
          <button
            key={s}
            className="px-4 py-1.5 rounded-full text-[12px] font-medium transition-all"
            style={
              i === 0
                ? { background: `${tab.color}20`, color: tab.color, fontWeight: 700 }
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
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</div>
            <div className="text-2xl font-black" style={{ color: tab.color }}>
              {["84%", "23", "147"][i]}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {["deals progressing", "scored ≥70", "activities today"][i]}
            </div>
          </div>
        ))}
      </div>

      {/* Highlight */}
      <div className="w-full max-w-4xl mt-5 rounded-2xl p-5 border"
        style={{ background: `linear-gradient(135deg, ${tab.color}12, ${tab.color}06)`, borderColor: `${tab.color}30` }}>
        <div className="text-[12px] font-bold mb-1" style={{ color: tab.color }}>Design notes</div>
        <ul className="text-[12px] text-[#6B6480] space-y-1 list-disc list-inside">
          <li>Active tab gets a pill-shaped gradient fill + color shadow</li>
          <li>Inactive tabs are ghost — label + icon only, no border</li>
          <li>Sub-tab strip uses matching accent as soft pill chips</li>
          <li>Entire nav bar sits on a frosted-glass card with subtle shadow</li>
        </ul>
      </div>
    </div>
  );
}
