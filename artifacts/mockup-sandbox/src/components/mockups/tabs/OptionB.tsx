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

export default function OptionB() {
  const [active, setActive] = useState("crm");
  const tab = TABS.find((t) => t.key === active)!;

  return (
    <div className="min-h-screen bg-[#F5F3FA] flex flex-col items-center justify-start pt-10 px-8 font-sans">
      {/* Label */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#88B8B0]/15 text-[#3E8B82] text-xs font-semibold tracking-wide uppercase">
          Option B — Underline Accent Tabs
        </div>
        <p className="mt-2 text-[13px] text-[#6B6480]">
          Edge-to-edge bar with bold underline indicator · minimal chrome, maximum content
        </p>
      </div>

      {/* Top-level Nav Bar */}
      <div className="w-full max-w-4xl bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-stretch">
          {TABS.map((t) => {
            const isActive = t.key === active;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className="flex-1 relative flex flex-col items-center justify-center gap-1 px-4 py-3.5 text-[12px] font-semibold transition-all duration-200"
                style={{ color: isActive ? t.color : "#A099B2" }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{t.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-full"
                    style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color}CC)` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-tab strip — flat underline style too */}
      <div className="w-full max-w-4xl bg-white border-b border-gray-100 flex items-stretch px-2">
        {["Dashboard", "Pipeline", "Contacts", "Companies", "Forecasting"].map((s, i) => (
          <button
            key={s}
            className="relative px-5 py-2.5 text-[12px] font-semibold transition-all"
            style={
              i === 0
                ? { color: tab.color }
                : { color: "#A099B2" }
            }
          >
            {s}
            {i === 0 && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{ background: tab.color }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content preview */}
      <div className="w-full max-w-4xl mt-5 grid grid-cols-3 gap-4">
        {["Pipeline Health", "Hot Leads", "Team Output"].map((title, i) => (
          <div
            key={title}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: tab.color }} />
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{title}</div>
            </div>
            <div className="text-2xl font-black text-[#1C1A2E]">
              {["84%", "23", "147"][i]}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {["deals progressing", "scored ≥70", "activities today"][i]}
            </div>
          </div>
        ))}
      </div>

      {/* Highlight */}
      <div className="w-full max-w-4xl mt-5 rounded-xl p-5 border border-gray-100 bg-white">
        <div className="text-[12px] font-bold mb-1" style={{ color: tab.color }}>Design notes</div>
        <ul className="text-[12px] text-[#6B6480] space-y-1 list-disc list-inside">
          <li>Active tab: colored icon + label, 3px gradient underline bar</li>
          <li>Inactive: muted gray icon + label, no border or fill</li>
          <li>Two-level underline hierarchy — main tabs + sub-tabs</li>
          <li>Works best full-width; very clean and familiar (browser/SaaS convention)</li>
        </ul>
      </div>
    </div>
  );
}
