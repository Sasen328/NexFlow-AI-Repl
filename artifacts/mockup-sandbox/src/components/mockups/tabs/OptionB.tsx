import { useState } from "react";
import { Home, Users, Phone, Database, Megaphone, BarChart3 } from "lucide-react";

const NAV = [
  {
    key: "home", label: "Home", icon: Home, color: "#B8A0C8",
    subs: [
      { key: "briefing", label: "Daily Briefing", subs: [] },
      { key: "command",  label: "Command Center", subs: [] },
    ],
  },
  {
    key: "crm", label: "CRM", icon: Users, color: "#88B8B0",
    subs: [
      { key: "dashboard",  label: "Dashboard",     subs: [] },
      { key: "pipeline",   label: "Pipeline",      subs: ["Pre-SAL", "Active", "Stalled", "Won", "Lost"] },
      { key: "deals",      label: "Deal Pipeline", subs: [] },
      { key: "contacts",   label: "Contacts",      subs: [] },
      { key: "engagement", label: "Engagement",    subs: ["All", "Calls", "Meetings"] },
      { key: "companies",  label: "Companies",     subs: ["Companies", "Account Hub"] },
      { key: "forecast",   label: "Forecasting",   subs: [] },
    ],
  },
  {
    key: "callcenter", label: "Call Center", icon: Phone, color: "#C8A880",
    subs: [
      { key: "dialer",   label: "Power Dialer",       subs: ["Manual", "Auto-Dial", "AI Agent"] },
      { key: "calls",    label: "Calls & Transcripts", subs: ["Call Scoring", "Conversation Intel"] },
      { key: "postcall", label: "Post-Call Auto",      subs: ["Approval Queue", "Cadence Rules", "Inbox"] },
      { key: "calldash", label: "Call Dashboard",      subs: [] },
      { key: "setup",    label: "Setup",               subs: ["Overview", "AI Voice Agent", "Knowledge Base", "Guardrails"] },
    ],
  },
  {
    key: "datahub", label: "Data Hub", icon: Database, color: "#A0B8C8",
    subs: [
      { key: "enrich-home",   label: "Enrichment Workspace", subs: [] },
      { key: "enrich-engine", label: "Enrichment Engine",    subs: ["Prospecting", "Buying Signals", "Quick Enrich", "Card Scanner", "List Upload", "Dedup", "History"] },
    ],
  },
  {
    key: "marketing", label: "Marketing", icon: Megaphone, color: "#C8A0A0",
    subs: [
      { key: "mkt-ws",   label: "Workspace",       subs: [] },
      { key: "mkt-dash", label: "Dashboard",        subs: [] },
      { key: "mkt-camp", label: "Campaign Builder", subs: ["Sales Funnel", "AI Builder", "Manual Builder", "Publishing"] },
      { key: "mkt-seq",  label: "Sequences",        subs: ["Sequences", "Templates", "Audiences"] },
      { key: "mkt-form", label: "Web Forms",        subs: [] },
      { key: "mkt-perf", label: "Performance",      subs: [] },
    ],
  },
  {
    key: "insights", label: "Insights", icon: BarChart3, color: "#A0C8A8",
    subs: [
      { key: "ins-dash", label: "Dashboards", subs: [] },
      { key: "ins-rpt",  label: "Reports",    subs: [] },
      { key: "ins-team", label: "Team",       subs: ["YTD", "Inception", "Custom Range"] },
      { key: "ins-pred", label: "Predictive", subs: [] },
    ],
  },
];

export default function OptionB() {
  const [main, setMain] = useState("crm");
  const [sub, setSub]   = useState("pipeline");
  const [page, setPage] = useState(0);

  const section = NAV.find((n) => n.key === main)!;
  const subItem  = section.subs.find((s) => s.key === sub) ?? section.subs[0];

  function pickMain(key: string) {
    setMain(key);
    const s = NAV.find((n) => n.key === key)!;
    setSub(s.subs[0]?.key ?? "");
    setPage(0);
  }
  function pickSub(key: string) {
    setSub(key);
    setPage(0);
  }

  const c = section.color;

  return (
    <div className="min-h-screen bg-[#F5F3FA] flex flex-col font-sans">
      {/* ── Label ── */}
      <div className="text-center pt-6 pb-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#88B8B0]/15 text-[#3E8B82] text-[11px] font-semibold tracking-wide uppercase">
          Option B — Underline Accent Tabs
        </span>
        <p className="text-[11px] text-[#8A849A] mt-1">Edge-to-edge underline · two underline levels · 3rd level chips</p>
      </div>

      {/* ── Level 1: Main tab bar — full-width underline ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-stretch">
          {NAV.map((t) => {
            const active = t.key === main;
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => pickMain(t.key)}
                className="flex-1 relative flex flex-col items-center justify-center gap-1 px-3 py-3 text-[11.5px] font-semibold transition-all"
                style={{ color: active ? t.color : "#A099B2" }}>
                <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                <span>{t.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-1.5 right-1.5 h-[3px] rounded-t-full"
                    style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color}AA)` }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Level 2: Section sub-tabs — thinner underline ── */}
      <div className="bg-white border-b border-gray-100 flex items-stretch px-3 overflow-x-auto">
        {section.subs.map((s) => {
          const active = s.key === subItem.key;
          return (
            <button key={s.key} onClick={() => pickSub(s.key)}
              className="relative whitespace-nowrap px-4 py-2.5 text-[11.5px] font-semibold transition-all flex-shrink-0"
              style={{ color: active ? c : "#A099B2" }}>
              {s.label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: c }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Level 3: Page sub-tabs — chip row ── */}
      {subItem.subs.length > 0 && (
        <div className="bg-white border-b border-gray-50 px-4 py-2 flex items-center gap-2 flex-wrap">
          {subItem.subs.map((label, i) => (
            <button key={label} onClick={() => setPage(i)}
              className="px-3 py-1 rounded-full text-[11px] font-medium border transition-all"
              style={page === i
                ? { background: c, color: "#fff", borderColor: c }
                : { color: "#9A94AD", borderColor: "#E5E2EE", background: "transparent" }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Content preview ── */}
      <div className="p-4 grid grid-cols-3 gap-3">
        {["Pipeline Health", "Hot Leads", "Team Output"].map((title, i) => (
          <div key={title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{title}</div>
            </div>
            <div className="text-xl font-black text-[#1C1A2E]">{["84%","23","147"][i]}</div>
            <div className="text-[10px] text-gray-400">{["deals progressing","scored ≥70","activities today"][i]}</div>
          </div>
        ))}
      </div>

      {/* Design notes */}
      <div className="mx-4 rounded-xl p-4 border border-gray-100 bg-white text-[11px]">
        <span className="font-bold" style={{ color: c }}>Design notes: </span>
        <span className="text-[#6B6480]">
          Level 1 = full-width underline strip (colored icon + 3px bar) · Level 2 = thinner 2px underline on a white band ·
          Level 3 = filled chip pills. Clean hierarchy, great scan-ability.
        </span>
      </div>
    </div>
  );
}
