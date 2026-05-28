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
      { key: "dialer",     label: "Power Dialer",      subs: ["Manual", "Auto-Dial", "AI Agent"] },
      { key: "calls",      label: "Calls & Transcripts",subs: ["Call Scoring", "Conversation Intel"] },
      { key: "postcall",   label: "Post-Call Auto",    subs: ["Approval Queue", "Cadence Rules", "Inbox"] },
      { key: "calldash",   label: "Call Dashboard",    subs: [] },
      { key: "setup",      label: "Setup",             subs: ["Overview", "AI Voice Agent", "Knowledge Base", "Guardrails"] },
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
      { key: "mkt-ws",   label: "Workspace",         subs: [] },
      { key: "mkt-dash", label: "Dashboard",          subs: [] },
      { key: "mkt-camp", label: "Campaign Builder",   subs: ["Sales Funnel", "AI Builder", "Manual Builder", "Publishing"] },
      { key: "mkt-seq",  label: "Sequences",          subs: ["Sequences", "Templates", "Audiences"] },
      { key: "mkt-form", label: "Web Forms",          subs: [] },
      { key: "mkt-perf", label: "Performance",        subs: [] },
    ],
  },
  {
    key: "insights", label: "Insights", icon: BarChart3, color: "#A0C8A8",
    subs: [
      { key: "ins-dash",  label: "Dashboards",  subs: [] },
      { key: "ins-rpt",   label: "Reports",     subs: [] },
      { key: "ins-team",  label: "Team",        subs: ["YTD", "Inception", "Custom Range"] },
      { key: "ins-pred",  label: "Predictive",  subs: [] },
    ],
  },
];

export default function OptionA() {
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
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B8A0C8]/15 text-[#7C5E9E] text-[11px] font-semibold tracking-wide uppercase">
          Option A — Floating Pill Tabs
        </span>
        <p className="text-[11px] text-[#8A849A] mt-1">Filled gradient pill · active tab gets color shadow · 3-level nav</p>
      </div>

      {/* ── Level 1: Main tab bar ── */}
      <div className="mx-5 bg-white/70 backdrop-blur-md rounded-2xl shadow-md shadow-black/5 border border-white/80 p-1.5 flex items-center gap-1">
        {NAV.map((t) => {
          const active = t.key === main;
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => pickMain(t.key)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200"
              style={active
                ? { background: `linear-gradient(135deg, ${t.color}E8, ${t.color}AA)`, color: "#fff", boxShadow: `0 3px 10px ${t.color}55` }
                : { color: "#9A94AD" }}>
              <Icon size={13} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Level 2: Section sub-tabs ── */}
      <div className="mx-5 mt-2 flex items-center gap-1 flex-wrap">
        {section.subs.map((s) => {
          const active = s.key === subItem.key;
          return (
            <button key={s.key} onClick={() => pickSub(s.key)}
              className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all"
              style={active
                ? { background: `${c}22`, color: c, fontWeight: 700 }
                : { color: "#9A94AD" }}>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Level 3: Page sub-tabs (only when the sub has children) ── */}
      {subItem.subs.length > 0 && (
        <div className="mx-5 mt-1.5 p-1 rounded-xl flex items-center gap-0.5 w-fit"
          style={{ background: `${c}10` }}>
          {subItem.subs.map((label, i) => (
            <button key={label} onClick={() => setPage(i)}
              className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
              style={page === i
                ? { background: "white", color: c, fontWeight: 700, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "#9A94AD" }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Content preview ── */}
      <div className="mx-5 mt-4 grid grid-cols-3 gap-3">
        {["Pipeline Health", "Hot Leads", "Team Output"].map((title, i) => (
          <div key={title} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</div>
            <div className="text-xl font-black" style={{ color: c }}>{["84%","23","147"][i]}</div>
            <div className="text-[10px] text-gray-400">{["deals progressing","scored ≥70","activities today"][i]}</div>
          </div>
        ))}
      </div>

      {/* Design notes */}
      <div className="mx-5 mt-4 rounded-xl p-4 border text-[11px]"
        style={{ background: `${c}08`, borderColor: `${c}25` }}>
        <span className="font-bold" style={{ color: c }}>Design notes: </span>
        <span className="text-[#6B6480]">
          Level 1 = gradient pill + shadow · Level 2 = accent chip strip · Level 3 = mini capsule switcher inside a tinted track.
          Three distinct visual weights so the eye reads depth instantly.
        </span>
      </div>
    </div>
  );
}
