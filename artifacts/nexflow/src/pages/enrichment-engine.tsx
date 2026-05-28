/**
 * enrichment-engine.tsx — 3-group / inner-tab architecture (rewrite May 2026)
 *
 * Level 2 (group-strip):  Agentic Hub | Lead Generation | CRM Enrichment
 * Level 3 (inner-strip):  sub-tabs per group, separators between sub-groups
 *
 * Legacy sidebar paths still resolve:
 *   /enrichment-engine          → agentic › AI Chat
 *   /enrichment-engine/enrich   → crm › Quick Enrich
 *   /enrichment-engine/settings → crm › Settings
 *   /enrichment-engine/cards    → crm › Card Scanner
 */
import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Lazy panel imports ────────────────────────────────────────────────────
const NexusChatPanel         = lazy(() => import("@/components/enrichment/nexus-chat-panel").then(m => ({ default: m.NexusChatPanel })));
const SwarmBoardPanel        = lazy(() => import("@/components/enrichment/swarm-board-panel").then(m => ({ default: m.SwarmBoardPanel })));
const LeadGenomePanel        = lazy(() => import("@/components/enrichment/lead-genome-panel").then(m => ({ default: m.LeadGenomePanel })));
const PersonHuntPanel        = lazy(() => import("@/components/enrichment/person-hunt-panel").then(m => ({ default: m.PersonHuntPanel })));
const CompanyHuntPanel       = lazy(() => import("@/components/enrichment/company-hunt-panel").then(m => ({ default: m.CompanyHuntPanel })));
const SignalIntelPanel       = lazy(() => import("@/components/enrichment/signal-intel-panel").then(m => ({ default: m.SignalIntelPanel })));
const RelationshipIntelPanel = lazy(() => import("@/components/enrichment/relationship-intel-panel").then(m => ({ default: m.RelationshipIntelPanel })));
const ICPScannerPanel        = lazy(() => import("@/components/enrichment/icp-scanner-panel").then(m => ({ default: m.ICPScannerPanel })));
const MasaarPanel            = lazy(() => import("@/components/enrichment/intel-engines-tab").then(m => ({ default: m.MasaarPanel })));
const IntelEnginesTab        = lazy(() => import("@/components/enrichment/intel-engines-tab").then(m => ({ default: m.IntelEnginesTab })));
const MasarDatabasePanel     = lazy(() => import("@/components/enrichment/masar-database-panel").then(m => ({ default: m.MasarDatabasePanel })));
const AiDatabaseBuilderPanel = lazy(() => import("@/components/enrichment/ai-database-builder-panel").then(m => ({ default: m.AiDatabaseBuilderPanel })));
const LeadEnrichPage         = lazy(() => import("./lead-enrich"));
const BusinessCards          = lazy(() => import("./business-cards"));
const DedupPage              = lazy(() => import("./dedup"));

// ── Colors ────────────────────────────────────────────────────────────────
const PRI  = "#B8A0C8";
const TEAL = "#88B8B0";
const GOLD = "#C8A880";

// ── Group / tab definitions ───────────────────────────────────────────────
type Group = "agentic" | "leadgen" | "crm";
type InnerTab = string;

interface TabDef { id: string; label: string; }
type StripItem = TabDef | null; // null = separator

const GROUP_DEFS: { id: Group; label: string; color: string; bg: string }[] = [
  { id: "agentic", label: "Agentic Hub",      color: PRI,  bg: "rgba(184,160,200,.10)" },
  { id: "leadgen", label: "Lead Generation",  color: TEAL, bg: "rgba(136,184,176,.10)" },
  { id: "crm",     label: "CRM Enrichment",   color: GOLD, bg: "rgba(200,168,128,.10)" },
];

const INNER_TABS: Record<Group, StripItem[]> = {
  agentic: [
    { id: "aichat",       label: "AI Chat" },
    { id: "leadgenome",   label: "Lead Genome" },
    { id: "agentswarm",   label: "Agent Swarm" },
  ],
  leadgen: [
    { id: "personhunt",       label: "Person Hunt" },
    { id: "companyhunt",      label: "Company Hunt" },
    { id: "results",          label: "Results" },
    null,
    { id: "signalintel",      label: "Signal Intel" },
    { id: "relationshipintel",label: "Relationship Intel" },
    null,
    { id: "icpscanner",       label: "ICP Scanner" },
    { id: "masaarengine",     label: "Masaar Engine" },
    { id: "masaardb",         label: "Masaar DB" },
    { id: "aidbbuilder",      label: "AI DB Builder" },
  ],
  crm: [
    { id: "quickenrich",  label: "Quick Enrich" },
    { id: "bulkupload",   label: "Bulk Upload" },
    { id: "waterfall",    label: "Waterfall Sources" },
    null,
    { id: "cardscanner",  label: "Card Scanner" },
    { id: "prosengine",   label: "ProsEngine" },
    null,
    { id: "settings",     label: "Settings" },
  ],
};

const DEFAULT_INNER: Record<Group, InnerTab> = {
  agentic: "aichat",
  leadgen: "personhunt",
  crm:     "quickenrich",
};

// ── URL → initial group + tab ─────────────────────────────────────────────
function pathToState(path: string): { group: Group; inner: InnerTab } {
  const p = path.split("?")[0];
  if (p.includes("/enrich"))    return { group: "crm",     inner: "quickenrich" };
  if (p.includes("/settings"))  return { group: "crm",     inner: "settings" };
  if (p.includes("/cards"))     return { group: "crm",     inner: "cardscanner" };
  if (p.includes("/prosengine"))return { group: "crm",     inner: "prosengine" };
  if (p.includes("/genome"))    return { group: "agentic", inner: "leadgenome" };
  if (p.includes("/swarm"))     return { group: "agentic", inner: "agentswarm" };
  if (p.includes("/signals"))   return { group: "leadgen", inner: "signalintel" };
  if (p.includes("/masaar"))    return { group: "leadgen", inner: "masaarengine" };
  if (p.includes("/icp"))       return { group: "leadgen", inner: "icpscanner" };
  return { group: "agentic", inner: "aichat" };
}

// ── Inline simple panels ──────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" style={{ color: PRI }} />
    </div>
  );
}

function ResultsPanel() {
  const [filter, setFilter] = useState("");
  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {[{v:"847",l:"Total leads",sub:"+128 this run",c:PRI},{v:"91%",l:"Verified",c:TEAL},{v:"38",l:"Companies",c:GOLD},{v:"12",l:"Dupes removed",c:"#9B8EAC"},{v:"6",l:"Signal alerts",c:"#4CAA84"}].map(k => (
          <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
            <div className="text-[20px] font-bold" style={{ color: k.c }}>{k.v}</div>
            <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
            {"sub" in k && k.sub && <div className="text-[10px]" style={{ color: k.c }}>{k.sub}</div>}
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#E8E2F0] bg-white">
        <div className="flex items-center gap-2 border-b border-[#E8E2F0] p-4">
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter results…" className="flex-1 rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-2 text-[12px] focus:outline-none" />
          <select className="rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-2 text-[12px] focus:outline-none">
            <option>All types</option><option>Person only</option><option>Company only</option>
          </select>
          <button className="rounded-lg px-3 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E8E2F0] bg-[#FAFAF9]">
                {["Name","Type","Company","ICP Tier","Signal","Status",""].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {n:"Mohammed AlQasem", t:"Person",  c:"Tabby",     tier:"A+", sig:"Hot",    status:"Enriched"},
                {n:"Tabby",           t:"Company", c:"—",         tier:"A+", sig:"Active", status:"Enriched"},
                {n:"Hisham Al-Falih", t:"Person",  c:"Lean Tech", tier:"A+", sig:"Rising", status:"Partial"},
              ].map(row => (
                <tr key={row.n} className="border-b border-[#F0EBF8] last:border-0 hover:bg-[#FAFAF9]">
                  <td className="px-3 py-2 font-bold text-[#4A3B5C]">{row.n}</td>
                  <td className="px-3 py-2 text-[#7B6E8D]">{row.t}</td>
                  <td className="px-3 py-2 text-[#4A3B5C]">{row.c}</td>
                  <td className="px-3 py-2"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: PRI }}>{row.tier}</span></td>
                  <td className="px-3 py-2"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: row.sig === "Hot" ? "rgba(213,107,122,.15)" : "rgba(200,168,128,.15)", color: row.sig === "Hot" ? "#D56B7A" : GOLD }}>{row.sig}</span></td>
                  <td className="px-3 py-2"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: row.status === "Enriched" ? "rgba(136,184,176,.15)" : "rgba(200,168,128,.15)", color: row.status === "Enriched" ? TEAL : GOLD }}>{row.status}</span></td>
                  <td className="px-3 py-2"><button className="rounded-lg border border-[#E2D8EA] px-2 py-1 text-[11px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">{row.status === "Enriched" ? "Push" : "Enrich"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 border-t border-[#E8E2F0] p-4">
          <button className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: TEAL }}>Push All to CRM</button>
          <button className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Export All</button>
        </div>
      </div>
    </div>
  );
}

function WaterfallPanel() {
  const WATERFALL_SOURCES = [
    /* ── Tier 1: Internal + Identity ─────────────────────────────── */
    { p:1,  tier:"Tier 1 · Internal",   name:"NexFlow CRM",               type:"Internal",       fields:"Email · Phone · Title · All known fields",        confidence:"100%", cost:"Free",         icon:"🔒" },
    { p:2,  tier:"Tier 1 · Identity",   name:"GLEIF (Legal Entity IDs)",  type:"Open Registry",  fields:"Legal name · LEI · Entity status · Registration", confidence:"99%",  cost:"Free",         icon:"🔏" },
    { p:3,  tier:"Tier 1 · Identity",   name:"OpenCorporates (SA)",       type:"Open Registry",  fields:"CR number · Company type · Registered address",   confidence:"97%",  cost:"Free",         icon:"🌍" },
    { p:4,  tier:"Tier 1 · Identity",   name:"Wikidata SPARQL",           type:"Open Registry",  fields:"Founded · HQ city · ISIN · CEO · Exchange",       confidence:"95%",  cost:"Free",         icon:"📡" },
    /* ── Tier 2: Saudi Government ─────────────────────────────────── */
    { p:5,  tier:"Tier 2 · Gov",        name:"Saudi Open Data (data.gov.sa)", type:"Government", fields:"CR data · Business registry datasets",            confidence:"99%",  cost:"Free",         icon:"🏛️" },
    { p:6,  tier:"Tier 2 · Gov",        name:"SAMA Registry",             type:"Government",     fields:"License · IBAN · Capital · Banking status",       confidence:"100%", cost:"Free",         icon:"🏦" },
    { p:7,  tier:"Tier 2 · Gov",        name:"REGA (Real Estate)",        type:"Government",     fields:"Developer license · Broker CR · Project status",  confidence:"100%", cost:"Free",         icon:"🏠" },
    { p:8,  tier:"Tier 2 · Gov",        name:"MODON (Industrial)",        type:"Government",     fields:"Factory license · Industrial zone · GOSI size",   confidence:"100%", cost:"Free",         icon:"🏭" },
    { p:9,  tier:"Tier 2 · Gov",        name:"Etimad Suppliers",          type:"Government",     fields:"Gov. supplier status · Tender history",           confidence:"98%",  cost:"Free",         icon:"📋" },
    { p:10, tier:"Tier 2 · Gov",        name:"muqawil.gov.sa (Contractors)", type:"Government",  fields:"Contractor grade · License type",                 confidence:"98%",  cost:"Free",         icon:"🏗️" },
    /* ── Tier 3: Professional Registries ─────────────────────────── */
    { p:11, tier:"Tier 3 · Professional", name:"SOCPA (Auditors)",        type:"Professional",   fields:"Firm name · License · Partner names",             confidence:"100%", cost:"Free",         icon:"📊" },
    { p:12, tier:"Tier 3 · Professional", name:"Saudi Bar (Lawyers)",     type:"Professional",   fields:"Firm name · License · Practice areas",            confidence:"100%", cost:"Free",         icon:"⚖️" },
    { p:13, tier:"Tier 3 · Professional", name:"MOH (Healthcare)",        type:"Professional",   fields:"License · Specialty · Facility type",             confidence:"100%", cost:"Free",         icon:"🏥" },
    /* ── Tier 4: Directories + Chambers ──────────────────────────── */
    { p:14, tier:"Tier 4 · Directory",  name:"Blue Pages SA",             type:"Directory",      fields:"Phone · Address · CR · Category",                 confidence:"92%",  cost:"Free",         icon:"📘" },
    { p:15, tier:"Tier 4 · Directory",  name:"Wikipedia + Gemini Search", type:"AI-Grounded",    fields:"Overview · Revenue · Employees · History",        confidence:"85%",  cost:"Free",         icon:"🌐" },
    { p:16, tier:"Tier 4 · Directory",  name:"Amaaly AOA Documents",      type:"Documents",      fields:"Shareholders · Capital · Board · Governance",     confidence:"96%",  cost:"Free",         icon:"🗞️" },
    { p:17, tier:"Tier 4 · Directory",  name:"Jeddah Chamber (JCC)",      type:"Chamber",        fields:"Member status · Category · Contact",              confidence:"90%",  cost:"Free",         icon:"🏛️" },
    { p:18, tier:"Tier 4 · Directory",  name:"GCC Chambers",              type:"Chamber",        fields:"GCC member status · Trade category",              confidence:"88%",  cost:"Free",         icon:"🌙" },
    { p:19, tier:"Tier 4 · Directory",  name:"AmCham Saudi Arabia",       type:"Chamber",        fields:"US-Saudi member status · Industry sector",        confidence:"88%",  cost:"Free",         icon:"🇺🇸" },
    { p:20, tier:"Tier 4 · Directory",  name:"Arab British Chamber",      type:"Chamber",        fields:"UK-Arab member status · Trade activity",          confidence:"88%",  cost:"Free",         icon:"🇬🇧" },
    { p:21, tier:"Tier 4 · Directory",  name:"Moores Rowland Members",    type:"Directory",      fields:"Partner names · Services · Office locations",     confidence:"87%",  cost:"Free",         icon:"🏢" },
    { p:22, tier:"Tier 4 · Directory",  name:"ICAEW Members (KSA)",       type:"Directory",      fields:"Chartered accountant firms · License",            confidence:"87%",  cost:"Free",         icon:"📐" },
    /* ── Tier 5: AI Search ───────────────────────────────────────── */
    { p:23, tier:"Tier 5 · AI Search",  name:"Argaam",                    type:"Press",          fields:"Financials · News · Leadership announcements",    confidence:"91%",  cost:"Free RSS",     icon:"📰" },
    { p:24, tier:"Tier 5 · AI Search",  name:"Tavily Search",             type:"AI Search",      fields:"Email · Bio · Social media · News",               confidence:"82%",  cost:"$0.001/req",   icon:"🔍" },
    { p:25, tier:"Tier 5 · AI Search",  name:"Perplexity Web Search",     type:"AI Search",      fields:"Email · Phone · Executive bio · Activity",        confidence:"78%",  cost:"$0.002/req",   icon:"✨" },
  ];

  const tiers = [...new Set(WATERFALL_SOURCES.map(s => s.tier))];

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="rounded-xl border border-[#E8E2F0] bg-white p-4">
        <div className="mb-1 text-[13px] font-bold text-[#4A3B5C]">Enrichment Waterfall — 25 Sources</div>
        <div className="mb-4 text-[12px] text-[#7B6E8D]">Sources are tried in priority order. When a source returns data above the confidence threshold, later sources are skipped for that field. All Tier 1–4 sources are 100% free.</div>

        <div className="flex flex-col gap-5">
          {tiers.map(tier => (
            <div key={tier}>
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#7B6E8D] border-b border-[#E8E2F0] pb-1">{tier}</div>
              <div className="flex flex-col gap-1.5">
                {WATERFALL_SOURCES.filter(s => s.tier === tier).map(s => (
                  <div key={s.p} className="flex items-center gap-3 rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: GOLD }}>{s.p}</span>
                    <span className="text-base shrink-0">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-[#4A3B5C]">{s.name} <span className="ml-1 text-[10px] font-medium text-[#9B8EAC]">{s.type}</span></div>
                      <div className="text-[10px] text-[#9B8EAC] truncate">{s.fields}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold" style={{ color: TEAL }}>{s.confidence}</div>
                      <div className="text-[10px]" style={{ color: s.cost.startsWith("Free") ? "#4CAA84" : "#9B8EAC" }}>{s.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Edit order</button>
          <button className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">+ Add source</button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors" style={{ background: on ? PRI : "#D1C8DC" }}>
      <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ transform: on ? "translateX(20px)" : "translateX(2px)" }} />
    </button>
  );
}

type SettingsTab = "apikeys" | "signals" | "tiers" | "relationship" | "dedup" | "validation" | "automation";

function SettingsPanel() {
  const [subTab,    setSubTab]    = useState<SettingsTab>("apikeys");
  const [srcStates, setSrcStates] = useState([true,true,true,true,false,true,false]);
  const [engStates, setEngStates] = useState([true,true,true,true,false]);
  const [toast,     setToast]     = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2400); };
  const toggleSrc = (i: number) => setSrcStates(p => p.map((v,idx) => idx === i ? !v : v));
  const toggleEng = (i: number) => setEngStates(p => p.map((v,idx) => idx === i ? !v : v));

  const TABS: { id: SettingsTab; label: string }[] = [
    { id:"apikeys",     label:"API Keys" },
    { id:"signals",     label:"Signal Sources" },
    { id:"tiers",       label:"Enrichment Tiers" },
    { id:"relationship",label:"Relationship Engines" },
    { id:"dedup",       label:"Deduplication" },
    { id:"validation",  label:"Validation & Verify" },
    { id:"automation",  label:"Automation" },
  ];

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* ── Sub-tab strip ── */}
      <div className="flex flex-wrap gap-1 overflow-hidden rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className="flex-1 min-w-max rounded-lg py-2 text-[11px] font-bold transition-all"
            style={subTab === t.id ? { background: PRI, color: "#fff" } : { color: "#7B6E8D" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── API Keys ── */}
      {subTab === "apikeys" && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {v:"7",   l:"API keys configured", c:PRI},
              {v:"3",   l:"Data providers live",  c:"#4CAA84"},
              {v:"4",   l:"AI models active",     c:TEAL},
              {v:"1",   l:"Key expiring soon",    c:GOLD},
            ].map(k => (
              <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
                <div className="text-[20px] font-bold" style={{ color: k.c }}>{k.v}</div>
                <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
              </div>
            ))}
          </div>

          {/* AI model keys */}
          <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
            <div className="border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">AI Model Providers</div>
            {[
              { name:"Google Gemini",    key:"AIza••••••••••••XkL2",   model:"gemini-2.5-pro",      status:"Active",  quota:"80K / 100K tokens" },
              { name:"Anthropic Claude", key:"sk-ant-••••••••••••9zQ", model:"claude-3-5-sonnet",   status:"Active",  quota:"32K / 50K tokens" },
              { name:"OpenAI GPT",       key:"sk-••••••••••••aR7",     model:"gpt-4o-mini",         status:"Active",  quota:"18K / 40K tokens" },
              { name:"Perplexity AI",    key:"pplx-••••••••••••kM3",   model:"sonar-pro",           status:"Expiring",quota:"12K / 20K tokens" },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-3 border-b border-[#F0EBF8] px-4 py-3 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[12px] font-bold text-[#4A3B5C]">{p.name}</div>
                    <code className="rounded bg-[#F0EBF8] px-1.5 py-0.5 text-[10px] font-mono text-[#9B8EAC]">{p.model}</code>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-[10px] font-mono text-[#9B8EAC]">{p.key}</code>
                    <span className="text-[10px] text-[#C8A880]">{p.quota}</span>
                  </div>
                </div>
                <span className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                  style={{ background: p.status === "Active" ? "#4CAA8420" : GOLD+"20", color: p.status === "Active" ? "#4CAA84" : GOLD }}>
                  {p.status}
                </span>
                <button onClick={() => showToast("Rotating key for " + p.name)}
                  className="flex-shrink-0 rounded-lg border border-[#E2D8EA] px-2.5 py-1 text-[11px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">
                  Rotate
                </button>
              </div>
            ))}
          </div>

          {/* Data source keys */}
          <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
            <div className="border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Data Source APIs</div>
            {[
              { name:"Tavily Search",        key:"tvly-••••••••••••Wr9",  cost:"$0.001/req",  status:"Active" },
              { name:"LinkedIn Scout",        key:"Not configured",         cost:"OAuth",       status:"Missing" },
              { name:"Crawl4AI / BrightData", key:"bd-••••••••••••7Kz",   cost:"$0.005/page", status:"Active" },
              { name:"SAMA Data API",         key:"Free · Open",            cost:"Free",        status:"Active" },
              { name:"GLEIF LEI Registry",    key:"Free · Open",            cost:"Free",        status:"Active" },
            ].map(p => (
              <div key={p.name} className="flex items-center gap-3 border-b border-[#F0EBF8] px-4 py-3 last:border-0">
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-[#4A3B5C]">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <code className="text-[10px] font-mono text-[#9B8EAC]">{p.key}</code>
                    <span className="text-[10px] font-semibold" style={{ color: p.cost === "Free" ? "#4CAA84" : GOLD }}>{p.cost}</span>
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                  style={{ background: p.status === "Active" ? "#4CAA8420" : p.status === "Missing" ? "#D56B7A20" : GOLD+"20",
                           color: p.status === "Active" ? "#4CAA84" : p.status === "Missing" ? "#D56B7A" : GOLD }}>
                  {p.status}
                </span>
                {p.status === "Missing"
                  ? <button onClick={() => showToast("Opening OAuth for " + p.name)} className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: PRI }}>Connect</button>
                  : <button onClick={() => showToast("Key updated")} className="rounded-lg border border-[#E2D8EA] px-2.5 py-1 text-[11px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Edit</button>
                }
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => showToast("Running key health check…")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Test all keys</button>
            <button onClick={() => showToast("Settings saved")} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Save Changes</button>
          </div>
        </div>
      )}

      {/* ── Signal Sources ── */}
      {subTab === "signals" && (
        <div className="flex flex-col gap-3">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {v:"82", l:"Total sources mapped", c:PRI},
              {v:"31", l:"Active / connected",   c:"#4CAA84"},
              {v:"19", l:"Key required (ready)", c:TEAL},
              {v:"32", l:"Plug-key stubs",       c:GOLD},
            ].map(k => (
              <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
                <div className="text-[20px] font-bold" style={{ color: k.c }}>{k.v}</div>
                <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
              </div>
            ))}
          </div>

          {/* Source groups */}
          {[
            {
              cat: "KSA Gov & Registries",
              badge: "🇸🇦 Saudi-only",
              badgeColor: PRI,
              sources: [
                {name:"MC.gov.sa (Commercial Registry)", meta:"Official CR lookup · Playwright stealth + CAPTCHA solver", type:"Scraper", status:"Active"},
                {name:"MOCI Registry",                   meta:"Ministry of Commerce · ownership changes · new registrations", type:"Scraper", status:"Active"},
                {name:"Maroof.sa",                       meta:"Verified business profiles · consumer-facing CR data", type:"Scraper", status:"Active"},
                {name:"Etimad Platform",                 meta:"Gov tender awards · supplier registrations · contract data", type:"Scraper", status:"Active"},
                {name:"MODON Industrial City",           meta:"Industrial zone tenants · factory footprint", type:"Scraper", status:"Active"},
                {name:"Wathiq KSA CR",                   meta:"Verified CR number + legal name + status (API key required)", type:"API Key", status:"Key req."},
                {name:"Najiz eServices",                 meta:"Court cases · judicial notices · gov filings", type:"Scraper", status:"Beta"},
                {name:"ZATCA Tax Authority",             meta:"VAT registration · tax compliance status", type:"Scraper", status:"Beta"},
                {name:"SAMA (Central Bank)",             meta:"Licensed FIs · SAMA sanction list", type:"Scraper", status:"Active"},
                {name:"CMA Capital Markets",             meta:"Listed companies · disclosures · insider trades", type:"Scraper", status:"Active"},
                {name:"HRDF / Taqat",                    meta:"Saudisation % · workforce development grants", type:"Scraper", status:"Beta"},
                {name:"MISA (Investment Authority)",     meta:"FDI licenses · sector attractiveness data", type:"Scraper", status:"Beta"},
                {name:"NCBE (Business Env.)",            meta:"Business climate scores · regulatory improvements", type:"Free", status:"Active"},
                {name:"GASTAT",                          meta:"Population census · economic indicators · sector stats", type:"Free", status:"Active"},
              ],
            },
            {
              cat: "Arabic Press & Financial News",
              badge: "RSS · Near-real-time",
              badgeColor: TEAL,
              sources: [
                {name:"Argaam",          meta:"Tadawul-listed company news · earnings · analyst reports (RSS + API)", type:"Free",    status:"Active"},
                {name:"Mubasher",        meta:"Arabic financial news · GCC markets · MENA economics", type:"Free",    status:"Active"},
                {name:"Al-Eqtisadiah",   meta:"Saudi business newspaper · leadership interviews · policy news", type:"Scraper", status:"Active"},
                {name:"Saudi Gazette",   meta:"English KSA news · government announcements", type:"Scraper", status:"Active"},
                {name:"Arab News",       meta:"English GCC news · large corporate moves · Vision 2030", type:"Scraper", status:"Active"},
                {name:"Zawya (Refinitiv)",meta:"MENA company profiles · funding · M&A (API key for full access)", type:"API Key", status:"Key req."},
                {name:"Maal.sa",         meta:"Saudi financial portal · SME credit · real estate data", type:"Scraper", status:"Beta"},
              ],
            },
            {
              cat: "GCC Native Intelligence",
              badge: "🌍 MENA-first",
              badgeColor: GOLD,
              sources: [
                {name:"Wamda",        meta:"MENA startup funding rounds · accelerator portfolio · founder profiles", type:"Free",    status:"Active"},
                {name:"MAGNiTT",      meta:"GCC/MENA VC & PE database · investors · portfolio mapping (API key)", type:"API Key", status:"Key req."},
                {name:"Dhow",         meta:"GCC-native contacts · Arabic names · WhatsApp seeds (native API)", type:"API Key", status:"Key req."},
                {name:"Decypha",      meta:"All 6 GCC exchanges · financials · board composition · ownership", type:"API Key", status:"Key req."},
                {name:"MENA Bytes",   meta:"MENA tech startup news · funding · exits · pivots", type:"Scraper", status:"Active"},
                {name:"Gulf News",    meta:"UAE-sourced pan-GCC business news · leadership announcements", type:"Scraper", status:"Active"},
                {name:"Gulf Business",meta:"C-suite profiles · GCC 100 lists · sector awards", type:"Scraper", status:"Beta"},
                {name:"Reuters ME",   meta:"MENA bureau · M&A · sovereign fund moves · oil & gas", type:"Scraper", status:"Active"},
                {name:"Bloomberg ME", meta:"GCC markets terminal data (API subscription required)", type:"API Key", status:"Key req."},
                {name:"Hiring Signal Scraper", meta:"LinkedIn / Bayt / Glassdoor · active job postings → growth signals", type:"Scraper", status:"Active"},
              ],
            },
            {
              cat: "Open Data APIs",
              badge: "Free · No key",
              badgeColor: "#4CAA84",
              sources: [
                {name:"GLEIF LEI Registry",   meta:"Global legal entity identifiers · cross-border ownership verification", type:"Free", status:"Active"},
                {name:"OpenCorporates",        meta:"CR numbers · founding year · country · public filing cross-check", type:"Free", status:"Active"},
                {name:"Wikidata SPARQL",       meta:"Founded year · headcount · HQ · notable leadership from linked data", type:"Free", status:"Active"},
                {name:"Clearbit Logo CDN",     meta:"Company logo resolution from domain (no key, instant)", type:"Free", status:"Active"},
                {name:"GitHub Org",            meta:"Hiring signals · tech stack · open-source activity (60 req/hr free)", type:"Free", status:"Active"},
                {name:"Tadawul / DFM / ADX",  meta:"GCC public-market revenue · ISIN · sector from exchange APIs", type:"Free", status:"Active"},
                {name:"Email Permutator",      meta:"Derives likely email patterns from name + domain (pure JS)", type:"Free", status:"Active"},
                {name:"Public Web Scraper",    meta:"Cheerio + Playwright stealth · About / Contact / Careers pages", type:"Scraper", status:"Active"},
              ],
            },
            {
              cat: "AI Research Engines",
              badge: "AI-powered",
              badgeColor: "#7B6E8D",
              sources: [
                {name:"Perplexity Sonar",          meta:"Deep web research · citations · real-time company profiling", type:"API Key", status:"Active"},
                {name:"Gemini 2.5 Flash (Search)", meta:"Grounded web search · structured field extraction · bilingual", type:"API Key", status:"Active"},
                {name:"OpenRouter — AI Search",    meta:"Multi-LLM search router · DeepSeek / Llama / Moonshot stubs", type:"API Key", status:"Active"},
                {name:"OpenRouter — Extractor",    meta:"Structured field extraction from messy HTML/PDF content", type:"API Key", status:"Active"},
                {name:"OpenRouter — Composer",     meta:"Bilingual report composer · AR/EN synthesis layer", type:"API Key", status:"Active"},
                {name:"News Seeder",               meta:"Perplexity web search + DeepSeek synthesis for news signals", type:"AI",     status:"Active"},
                {name:"Python / Crawl4AI",         meta:"Playwright headless · HTML→Markdown · AI-structured extraction", type:"Scraper", status:"Beta"},
                {name:"Groq (stub)",               meta:"Ultra-fast inference fallback · activates via GROQ_API_KEY", type:"Stub",   status:"Stub"},
              ],
            },
            {
              cat: "Western Contact APIs",
              badge: "API key required",
              badgeColor: "#9B8EAC",
              sources: [
                {name:"Apollo.io",          meta:"~20–30M MENA contacts · email + phone + title + company data", type:"API Key", status:"Key req."},
                {name:"Hunter.io",          meta:"Email finder + verifier · domain pattern detection", type:"API Key", status:"Active"},
                {name:"Lusha",              meta:"Direct-dial mobile + work email · GDPR-compliant", type:"API Key", status:"Key req."},
                {name:"Crunchbase",         meta:"Funding rounds · size · industry · investors · logo", type:"API Key", status:"Key req."},
                {name:"RocketReach",        meta:"Email + phone + LinkedIn for global executives", type:"API Key", status:"Key req."},
                {name:"People Data Labs",   meta:"Email · phone · seniority · firmographics at scale", type:"API Key", status:"Key req."},
                {name:"Wappalyzer",         meta:"Tech stack detection · GCC payment processors · SaaS signals", type:"API Key", status:"Key req."},
                {name:"FullContact",        meta:"Phone → person resolution · WhatsApp seed validation", type:"Stub",   status:"Stub"},
                {name:"D&B Direct+",        meta:"Corporate hierarchies · GCC subsidiaries · firmographic depth", type:"Stub",   status:"Stub"},
                {name:"Breeze Intelligence",meta:"Clearbit successor · company enrichment (key required)", type:"Stub",   status:"Stub"},
                {name:"Bombora",            meta:"B2B buying intent signals · topic-level intent data", type:"Stub",   status:"Stub"},
                {name:"Clay",               meta:"Waterfall enrichment across 75+ providers · GCC coverage", type:"Stub",   status:"Stub"},
              ],
            },
            {
              cat: "Chamber Directories",
              badge: "Scraped",
              badgeColor: "#88B8B0",
              sources: [
                {name:"Moores Rowland KSA", meta:"500+ member directory · contact + sector + region", type:"Scraper", status:"Active"},
                {name:"Arab-British Chamber",meta:"UK-GCC bilateral trade member companies", type:"Scraper", status:"Active"},
                {name:"AmCham Saudi",        meta:"US-KSA business council member listing", type:"Scraper", status:"Active"},
                {name:"SBBC",               meta:"Saudi-British Business Council directory", type:"Scraper", status:"Active"},
                {name:"JCC (Jordan)",        meta:"Jordanian Chamber of Commerce member search", type:"Scraper", status:"Beta"},
                {name:"FCC (French)",        meta:"French-Saudi Chamber member directory", type:"Scraper", status:"Beta"},
                {name:"German-Arab Chamber", meta:"GACIC member companies · bilateral trade", type:"Scraper", status:"Beta"},
                {name:"GCC Chambers (collective)", meta:"Umbrella scraper across all 6-country GCC chamber portals", type:"Scraper", status:"Beta"},
              ],
            },
            {
              cat: "Compliance & Sanctions Screening",
              badge: "Regulatory",
              badgeColor: "#D56B7A",
              sources: [
                {name:"OFAC SDN List",          meta:"US sanctions · Specially Designated Nationals", type:"Free", status:"Active"},
                {name:"UN Security Council",    meta:"Global UN sanctions · terrorism + proliferation", type:"Free", status:"Active"},
                {name:"EU Consolidated List",   meta:"European sanctions list · entity + person screening", type:"Free", status:"Active"},
                {name:"CMA (KSA Capital Mkt)",  meta:"Insider trading prohibitions · market manipulation flags", type:"Free", status:"Active"},
                {name:"SAMA Blacklist",         meta:"KSA Central Bank flagged entities", type:"Free", status:"Active"},
                {name:"ZATCA Compliance",       meta:"VAT non-compliance + tax evasion notices", type:"Scraper", status:"Beta"},
              ],
            },
            {
              cat: "Plug-Key Stubs (Built · Key to Activate)",
              badge: "Disabled by default",
              badgeColor: "#C8A880",
              sources: [
                {name:"ZoomInfo",        meta:"Enterprise B2B database · intent data · org charts", type:"Stub", status:"Stub"},
                {name:"Cognism",         meta:"GDPR-compliant B2B data · phone-verified mobiles", type:"Stub", status:"Stub"},
                {name:"Seamless.AI",     meta:"Real-time AI contact finding · email + mobile", type:"Stub", status:"Stub"},
                {name:"Kaspr",           meta:"LinkedIn extension data · European + GCC expats", type:"Stub", status:"Stub"},
                {name:"Datanyze",        meta:"Technographics + company signals", type:"Stub", status:"Stub"},
                {name:"SignalHire",      meta:"Email + phone from LinkedIn profile URL", type:"Stub", status:"Stub"},
                {name:"ProxyCurl",       meta:"LinkedIn profile API · company data · job posts", type:"Stub", status:"Stub"},
                {name:"Lead411",         meta:"Email + direct dial + intent data", type:"Stub", status:"Stub"},
                {name:"Prospeo",         meta:"Email finder + domain search + bulk enrichment", type:"Stub", status:"Stub"},
                {name:"SalesIntel",      meta:"Human-verified B2B data · buyer intent", type:"Stub", status:"Stub"},
                {name:"Swordfish AI",    meta:"Personal mobile + direct email finder", type:"Stub", status:"Stub"},
              ],
            },
            {
              cat: "Manual Only (No Public API)",
              badge: "Manual",
              badgeColor: "#9B8EAC",
              sources: [
                {name:"LinkedIn Sales Navigator", meta:"Manual export only · no public API · GDPR gated", type:"Manual", status:"Manual"},
                {name:"Adapt.io",                meta:"Contact data · manual export workflow", type:"Manual", status:"Manual"},
                {name:"LeadGibbon",              meta:"LinkedIn-sourced email finder · manual", type:"Manual", status:"Manual"},
                {name:"Explorium",               meta:"Augmented intelligence platform · manual integration", type:"Manual", status:"Manual"},
                {name:"Vibe Prospecting",        meta:"AI-native prospecting · private beta", type:"Manual", status:"Manual"},
              ],
            },
          ].map(group => (
            <div key={group.cat} className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{group.cat}</span>
                <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold"
                  style={{ background: group.badgeColor + "22", color: group.badgeColor }}>{group.badge}</span>
                <span className="rounded-full bg-[#F0EBF8] px-2 py-0.5 text-[9px] font-bold text-[#9B8EAC]">{group.sources.length} sources</span>
              </div>
              {group.sources.map((s, i) => {
                const typeColor = s.type === "Free" ? "#4CAA84" : s.type === "Stub" ? "#9B8EAC" : s.type === "Manual" ? "#C8A880" : s.type === "AI" ? PRI : TEAL;
                const stColor = s.status === "Active" ? "#4CAA84" : s.status === "Beta" ? GOLD : s.status === "Key req." ? "#88B8B0" : s.status === "Manual" ? "#C8A880" : "#9B8EAC";
                return (
                  <div key={s.name} className="flex items-center gap-3 border-b border-[#F5F0FB] px-4 py-2.5 last:border-0 hover:bg-[#FAFAF9]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-bold text-[#4A3B5C]">{s.name}</span>
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: typeColor + "18", color: typeColor }}>{s.type}</span>
                      </div>
                      <div className="text-[10px] text-[#9B8EAC] leading-snug truncate">{s.meta}</div>
                    </div>
                    <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: stColor + "18", color: stColor }}>{s.status}</span>
                    {s.type === "Manual" || s.type === "Stub"
                      ? <button onClick={() => showToast("Configure " + s.name)} className="flex-shrink-0 rounded-lg border border-[#E2D8EA] px-2 py-1 text-[10px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Set key</button>
                      : <Toggle on={srcStates[i % srcStates.length] ?? true} onClick={() => toggleSrc(i % srcStates.length)} />
                    }
                  </div>
                );
              })}
            </div>
          ))}

          <div className="flex items-center gap-2 justify-end">
            <button onClick={() => showToast("Opening custom RSS/endpoint form…")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">+ Custom source</button>
            <button onClick={() => showToast("Testing all active sources…")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Test all active</button>
            <button onClick={() => showToast("Source config saved")} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Save Sources</button>
          </div>
        </div>
      )}

      {/* ── Enrichment Tiers ── */}
      {subTab === "tiers" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
            <div className="border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Confidence Thresholds</div>
            {[
              { tier:"Tier 1 — Premium",  desc:"All fields enriched · cited · cross-verified",    threshold:"95%", auto:true,  color:PRI  },
              { tier:"Tier 2 — Standard", desc:"Core fields + email + ICP score",                  threshold:"80%", auto:true,  color:TEAL },
              { tier:"Tier 3 — Quick",    desc:"Name + company + phone (unverified)",              threshold:"60%", auto:false, color:GOLD },
              { tier:"Tier 4 — Minimal",  desc:"Company name + LinkedIn URL only",                 threshold:"40%", auto:false, color:"#9B8EAC"},
            ].map(t => (
              <div key={t.tier} className="flex items-center gap-3 border-b border-[#F0EBF8] px-4 py-3.5 last:border-0">
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-[#4A3B5C]">{t.tier}</div>
                  <div className="text-[11px] text-[#9B8EAC]">{t.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-[13px] font-bold" style={{ color: t.color }}>{t.threshold}</div>
                    <div className="text-[9px] text-[#9B8EAC]">min confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold" style={{ color: t.auto ? "#4CAA84" : "#9B8EAC" }}>{t.auto ? "Auto" : "Manual"}</div>
                    <div className="text-[9px] text-[#9B8EAC]">trigger</div>
                  </div>
                  <Toggle on={t.auto} onClick={() => showToast("Trigger updated for " + t.tier)} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#E8E2F0] bg-white p-4">
            <div className="mb-3 text-[12px] font-bold text-[#4A3B5C]">Field Priority Order</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                {l:"Email validation",  opts:["DNS+MX required","AI-guess OK","Skip emails"],    sel:0},
                {l:"Phone format",      opts:["+966 only","GCC numbers","Any"],                   sel:0},
                {l:"Title verify",      opts:["Cross-source","Trust primary","Skip"],             sel:0},
                {l:"Currency",          opts:["SAR","USD","Both"],                                sel:0},
                {l:"Language output",   opts:["English","Arabic","Bilingual"],                    sel:2},
                {l:"ICP scoring",       opts:["Always","On request","Off"],                       sel:0},
              ].map(f => (
                <div key={f.l}>
                  <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{f.l}</div>
                  <div className="flex flex-wrap gap-1">
                    {f.opts.map((o, i) => (
                      <span key={o}
                        className="inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                        style={i === f.sel ? { background: PRI, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => showToast("Reset to defaults")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Reset defaults</button>
              <button onClick={() => showToast("Tier settings saved")} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Save Tiers</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Relationship Engines ── */}
      {subTab === "relationship" && (
        <div className="rounded-xl border border-[#E8E2F0] bg-white">
          {[
            {name:"LinkedIn Network Mapper", meta:"1st-3rd degree connections · alumni · board ties", status:"Active"},
            {name:"Investment Graph",        meta:"VC → portfolio → co-investors",                    status:"Active"},
            {name:"Board & Advisor Tracker", meta:"Board membership · advisory roles",               status:"Active"},
            {name:"Alumni Network",          meta:"University · past employer co-workers",            status:"Beta"},
            {name:"Family Office Map",       meta:"GCC family office decision chains",                status:"Beta"},
          ].map((e, i) => (
            <div key={e.name} className="flex items-center gap-3 border-b border-[#F0EBF8] px-4 py-3 last:border-0">
              <div className="flex-1">
                <div className="text-[12px] font-bold text-[#4A3B5C]">{e.name}</div>
                <div className="text-[11px] text-[#9B8EAC]">{e.meta}</div>
              </div>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ background: e.status === "Active" ? "rgba(76,170,132,.12)" : "rgba(200,168,128,.15)", color: e.status === "Active" ? "#4CAA84" : GOLD }}>{e.status}</span>
              <Toggle on={engStates[i] ?? true} onClick={() => toggleEng(i)} />
            </div>
          ))}
        </div>
      )}

      {/* ── Deduplication ── */}
      {subTab === "dedup" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-[#E8E2F0] bg-white p-4">
            <div className="mb-3 text-[12px] font-bold text-[#4A3B5C]">Match Rules</div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {l:"Primary match key",      opts:["Email","LinkedIn URL","Phone"],                   sel:0},
                {l:"Secondary match",        opts:["Name + Company","Name + Title"],                  sel:0},
                {l:"Conflict survivor",      opts:["Most complete","Newest","Manual review"],          sel:0},
                {l:"Auto-merge threshold",   opts:["80%","90%","95%","100% only"],                    sel:1},
                {l:"Arabic name matching",   opts:["Transliteration","Exact","Both"],                  sel:2},
                {l:"Phone normalisation",    opts:["E.164 global","+966 GCC","+971 UAE","None"],      sel:0},
              ].map(f => (
                <div key={f.l}>
                  <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{f.l}</div>
                  <div className="flex flex-wrap gap-1">
                    {f.opts.map((o, i) => (
                      <span key={o}
                        className="inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                        style={i === f.sel ? { background: PRI, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E8E2F0] bg-white p-4">
            <div className="mb-3 text-[12px] font-bold text-[#4A3B5C]">Automation</div>
            <div className="flex flex-col gap-3">
              {[
                {l:"Auto-merge high-confidence dupes (>95%)",    on:true },
                {l:"Flag near-matches for manual review (80–95%)", on:true },
                {l:"Block import if dupe detected",               on:false},
                {l:"Send Slack alert on dupe batch >50",          on:true },
              ].map(t => (
                <div key={t.l} className="flex items-center gap-3">
                  <Toggle on={t.on} onClick={() => showToast("Setting updated")} />
                  <span className="text-[12px] text-[#4A3B5C]">{t.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => showToast("Running dedup scan…")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Run scan now</button>
            <button onClick={() => showToast("Dedup rules saved")} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Save Rules</button>
          </div>
        </div>
      )}

      {/* ── Validation & Verify ── */}
      {subTab === "validation" && (
        <div className="flex flex-col gap-3">
          {/* Summary tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {v:"99.1%", l:"Email deliverability", c:"#4CAA84"},
              {v:"97.8%", l:"Phone E.164 compliance", c:TEAL},
              {v:"94.3%", l:"CR format accuracy", c:GOLD},
              {v:"0.2%",  l:"Dummy / bot leads caught", c:"#D56B7A"},
            ].map(k => (
              <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
                <div className="text-[18px] font-bold" style={{ color: k.c }}>{k.v}</div>
                <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
              </div>
            ))}
          </div>

          {/* Email Validation */}
          <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
            <div className="border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Email Validation</div>
            <div className="p-4 grid gap-4 sm:grid-cols-2">
              {[
                {l:"DNS + MX Check",       opts:["Required","Warn only","Skip"],         sel:0, hint:"Verify domain has valid mail exchange record"},
                {l:"Domain Liveness",       opts:["HEAD request","Skip"],                 sel:0, hint:"HTTP probe to confirm domain resolves"},
                {l:"Dummy Detection",       opts:["Block","Warn","Off"],                  sel:0, hint:"Blocks test@, noreply@, admin@, info@ patterns"},
                {l:"AI Guess Fallback",     opts:["Allow","Warn","Disallow"],             sel:1, hint:"Use email-permutator pattern when no real email found"},
                {l:"Cross-source verify",   opts:["2+ sources","1+ source","Single OK"],  sel:0, hint:"Email must appear in multiple sources before trusted"},
                {l:"Bounce history",        opts:["Block on 1 bounce","2 bounces","Off"], sel:0, hint:"Suppress emails with prior delivery failures"},
              ].map(f => (
                <div key={f.l}>
                  <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{f.l}</div>
                  <div className="mb-1 text-[10px] text-[#BDB0CC]">{f.hint}</div>
                  <div className="flex flex-wrap gap-1">
                    {f.opts.map((o, i) => (
                      <span key={o} className="inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                        style={i === f.sel ? { background: PRI, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>{o}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone Validation */}
          <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
            <div className="border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Phone Validation</div>
            <div className="p-4 grid gap-4 sm:grid-cols-2">
              {[
                {l:"Output format",          opts:["E.164 global","+966 KSA","+971 UAE","Any"], sel:0, hint:"Normalize all phone numbers to this format"},
                {l:"GCC prefix acceptance",  opts:["All GCC (+966 +971 +973 +965 +968 +974)","KSA only","Global"], sel:0, hint:"Which country prefixes are accepted"},
                {l:"WhatsApp reachability",  opts:["Check","Skip"],                              sel:0, hint:"Probe WhatsApp Business API to confirm active number"},
                {l:"Mobile vs landline",     opts:["Prefer mobile","Accept both","Flag landlines"], sel:0, hint:"Mobile-first for WhatsApp outreach"},
              ].map(f => (
                <div key={f.l}>
                  <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{f.l}</div>
                  <div className="mb-1 text-[10px] text-[#BDB0CC]">{f.hint}</div>
                  <div className="flex flex-wrap gap-1">
                    {f.opts.map((o, i) => (
                      <span key={o} className="inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                        style={i === f.sel ? { background: TEAL, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>{o}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CR Number & Legal Validation */}
          <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
            <div className="border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">CR Number & Legal Entity</div>
            <div className="p-4 grid gap-4 sm:grid-cols-2">
              {[
                {l:"CR format check",        opts:["Strict (format + checksum)","Format only","Off"], sel:0, hint:"KSA CRs are 10 digits; MOCI checksum verified"},
                {l:"Cross-registry verify",  opts:["MOCI live lookup","GLEIF only","Off"],             sel:0, hint:"Confirm CR exists in official MOCI/GLEIF registry"},
                {l:"Legal status gate",      opts:["Active only","Warn on suspended","Allow all"],     sel:0, hint:"Block or flag companies with non-active CR status"},
                {l:"Sanctions screen on CR", opts:["Always","On import","Off"],                        sel:0, hint:"Run OFAC/UN/CMA/SAMA screen when CR is found"},
              ].map(f => (
                <div key={f.l}>
                  <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{f.l}</div>
                  <div className="mb-1 text-[10px] text-[#BDB0CC]">{f.hint}</div>
                  <div className="flex flex-wrap gap-1">
                    {f.opts.map((o, i) => (
                      <span key={o} className="inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                        style={i === f.sel ? { background: GOLD, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>{o}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fingerprint & Fuzzy Match */}
          <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
            <div className="border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Lead Fingerprint & Fuzzy Name Matching</div>
            <div className="p-4 flex flex-col gap-4">
              <div>
                <div className="mb-1.5 text-[11px] font-bold text-[#4A3B5C]">Fingerprint Match Keys <span className="text-[10px] text-[#9B8EAC] font-normal">(checked in priority order)</span></div>
                <div className="flex flex-wrap gap-2">
                  {[
                    {k:"Email",        on:true  },
                    {k:"Phone",        on:true  },
                    {k:"CR Number",    on:true  },
                    {k:"Domain",       on:true  },
                    {k:"LinkedIn URL", on:true  },
                    {k:"Name + Company", on:false},
                  ].map(fp => (
                    <div key={fp.k} className="flex items-center gap-1.5 rounded-full border px-3 py-1"
                      style={{ borderColor: fp.on ? PRI : "#E2D8EA", background: fp.on ? PRI + "12" : "transparent" }}>
                      <Toggle on={fp.on} onClick={() => showToast("Fingerprint key updated")} />
                      <span className="text-[11px] font-semibold" style={{ color: fp.on ? PRI : "#9B8EAC" }}>{fp.k}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {l:"Fuzzy name threshold",     opts:["95% (strict)","88% (standard)","80% (loose)","Off"], sel:1, hint:"Jaro-Winkler similarity threshold for name dedup"},
                  {l:"Arabic transliteration",   opts:["Always","On-request","Off"],                         sel:0, hint:"Mohammed ↔ محمد — Buckwalter + phonetic bridge"},
                  {l:"Company name normalisation",opts:["Strip suffix (LLC/Co.)","Exact","Off"],             sel:0, hint:"'Acme Trading Co.' = 'Acme Trading LLC'"},
                  {l:"Confidence gate for merge", opts:["95%","90%","85%","Manual only"],                    sel:1, hint:"Minimum score before auto-merge is triggered"},
                ].map(f => (
                  <div key={f.l}>
                    <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{f.l}</div>
                    <div className="mb-1 text-[10px] text-[#BDB0CC]">{f.hint}</div>
                    <div className="flex flex-wrap gap-1">
                      {f.opts.map((o, i) => (
                        <span key={o} className="inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                          style={i === f.sel ? { background: PRI, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>{o}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Validation toggles */}
          <div className="rounded-xl border border-[#E8E2F0] bg-white p-4">
            <div className="mb-3 text-[12px] font-bold text-[#4A3B5C]">Global Validation Toggles</div>
            <div className="flex flex-col gap-3">
              {[
                {l:"Block record if email fails DNS check",                        on:true },
                {l:"Warn (don't block) on single-source-only contact data",        on:true },
                {l:"Auto-flag suspected bot / data-broker leads",                  on:true },
                {l:"Apply sanctions screen on every new company enrichment",        on:true },
                {l:"Require phone + email before record enters Tier 1",            on:false},
                {l:"Re-validate stale records (>180 days since last enrichment)",  on:true },
                {l:"Surface validation errors inline in CRM contact card",         on:true },
              ].map(t => (
                <div key={t.l} className="flex items-center gap-3">
                  <Toggle on={t.on} onClick={() => showToast("Toggle updated")} />
                  <span className="text-[12px] text-[#4A3B5C]">{t.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => showToast("Validation rules reset to defaults")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Reset defaults</button>
            <button onClick={() => showToast("Validation settings saved")} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Save Validation</button>
          </div>
        </div>
      )}

      {/* ── Automation ── */}
      {subTab === "automation" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
            <div className="border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Trigger Rules</div>
            {[
              { trigger:"New contact created",           action:"Run Tier 2 enrichment automatically",          on:true  },
              { trigger:"Lead stage → Qualified",        action:"Run Tier 1 enrichment + ICP score",            on:true  },
              { trigger:"Signal: funding round detected",action:"Enrich company + key contacts → alert rep",    on:true  },
              { trigger:"Contact · no activity > 90 days",action:"Run signal check · flag for re-engagement",  on:true  },
              { trigger:"LinkedIn profile change",       action:"Re-enrich person · update CRM record",         on:false },
              { trigger:"New CR registration (MoCI)",    action:"Auto-enrich company · notify BD team",         on:true  },
              { trigger:"Bulk import uploaded",          action:"Dedup → Tier 2 enrichment → notify",           on:true  },
            ].map(t => (
              <div key={t.trigger} className="flex items-center gap-3 border-b border-[#F0EBF8] px-4 py-3 last:border-0">
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-[#4A3B5C]">{t.trigger}</div>
                  <div className="text-[11px] text-[#9B8EAC]">→ {t.action}</div>
                </div>
                <Toggle on={t.on} onClick={() => showToast("Trigger updated")} />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
            <div className="border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Webhooks & Notifications</div>
            {[
              { label:"Slack — enrichment complete",   url:"https://hooks.slack.com/••••",   status:"Active" },
              { label:"Slack — dupe alert batch",      url:"https://hooks.slack.com/••••",   status:"Active" },
              { label:"Zapier — new lead webhook",     url:"https://hooks.zapier.com/••••",  status:"Inactive" },
              { label:"Custom webhook endpoint",       url:"+ Add webhook",                   status:"Add" },
            ].map(w => (
              <div key={w.label} className="flex items-center gap-3 border-b border-[#F0EBF8] px-4 py-3 last:border-0">
                <div className="flex-1">
                  <div className="text-[12px] font-bold text-[#4A3B5C]">{w.label}</div>
                  <code className="text-[10px] font-mono text-[#9B8EAC]">{w.url}</code>
                </div>
                {w.status !== "Add"
                  ? <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                      style={{ background: w.status === "Active" ? "#4CAA8420" : "#F0EBF8", color: w.status === "Active" ? "#4CAA84" : "#9B8EAC" }}>
                      {w.status}
                    </span>
                  : <button onClick={() => showToast("Add webhook")} className="rounded-lg px-3 py-1 text-[11px] font-bold text-white" style={{ background: PRI }}>+ Add</button>
                }
                {w.status !== "Add" && (
                  <button onClick={() => showToast("Webhook tested")} className="rounded-lg border border-[#E2D8EA] px-2.5 py-1 text-[11px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Test</button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => showToast("Automation settings saved")} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Save Automation</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-[13px] font-bold text-white shadow-lg" style={{ background: PRI }}>{toast}</div>
      )}
    </div>
  );
}

// ── Panel renderer ────────────────────────────────────────────────────────
function PanelContent({ group, inner }: { group: Group; inner: InnerTab }) {
  const key = `${group}/${inner}`;
  const wrap = (el: React.ReactNode) => (
    <Suspense fallback={<Spinner />}>{el}</Suspense>
  );
  switch (key) {
    case "agentic/aichat":         return wrap(<NexusChatPanel />);
    case "agentic/leadgenome":     return wrap(<LeadGenomePanel />);
    case "agentic/agentswarm":     return wrap(<SwarmBoardPanel />);
    case "leadgen/personhunt":     return wrap(<PersonHuntPanel />);
    case "leadgen/companyhunt":    return wrap(<CompanyHuntPanel />);
    case "leadgen/results":        return <ResultsPanel />;
    case "leadgen/signalintel":    return wrap(<SignalIntelPanel />);
    case "leadgen/relationshipintel": return wrap(<RelationshipIntelPanel />);
    case "leadgen/icpscanner":     return wrap(<ICPScannerPanel />);
    case "leadgen/masaarengine":   return wrap(<MasaarPanel />);
    case "leadgen/masaardb":       return wrap(<MasarDatabasePanel />);
    case "leadgen/aidbbuilder":    return wrap(<AiDatabaseBuilderPanel />);
    case "crm/quickenrich":        return wrap(<LeadEnrichPage />);
    case "crm/bulkupload":         return wrap(<DedupPage />);
    case "crm/waterfall":          return <WaterfallPanel />;
    case "crm/cardscanner":        return wrap(<BusinessCards />);
    case "crm/prosengine":         return wrap(<IntelEnginesTab />);
    case "crm/settings":           return <SettingsPanel />;
    default:                       return wrap(<NexusChatPanel />);
  }
}

// ── Page titles ───────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  aichat:           { title: "AI Research Composer",   sub: "Mega-mind orchestrator · 6-stage pipeline · all flows functional" },
  leadgenome:       { title: "Lead Genome",             sub: "All enriched leads pushed from every engine · link to lists, CRM, export" },
  agentswarm:       { title: "SwarmBoard",              sub: "Kimi-coordinated multi-agent mission · live orbit · fused report · push to Genome" },
  personhunt:       { title: "Person Hunt",             sub: "Find individual contacts by title, seniority, company, location, and buying signals · 40+ sources" },
  companyhunt:      { title: "Company Hunt",            sub: "Find and profile target companies by sector, funding, size, and market signals · CR + GLEIF verified" },
  results:          { title: "Results",                 sub: "All hunt outputs, enriched data, and ready-to-use lead lists" },
  signalintel:      { title: "Signal Intel",            sub: "Live buying signals, trigger events, and market intelligence feeds" },
  relationshipintel:{ title: "Relationship Intel",      sub: "Map executive networks, board ties, alumni connections, and investment relationships" },
  icpscanner:       { title: "ICP Territory Scanner",  sub: "AI-powered Ideal Customer Profile mapping across GCC territories" },
  masaarengine:     { title: "Masaar Engine",           sub: "Saudi Commercial Registry (CR) intelligence · MCI-linked corporate data · ~10s run time" },
  masaardb:         { title: "Masaar Database",         sub: "Full Saudi CR database browser — 1.2M records · filter, segment, and export at scale" },
  aidbbuilder:      { title: "AI DB Builder",           sub: "AI-generated custom databases — define schema, sources, and refresh rules in plain English" },
  quickenrich:      { title: "Quick Enrich",            sub: "Instantly enrich a single lead or company from 40+ sources" },
  bulkupload:       { title: "Bulk Upload & Dedup",     sub: "Upload lists, deduplicate, and queue for enrichment" },
  waterfall:        { title: "Waterfall Sources",       sub: "Priority-ordered enrichment source chain — first match wins" },
  cardscanner:      { title: "Card Scanner",            sub: "AI-powered business card OCR and lead creation" },
  prosengine:       { title: "ProsEngine",              sub: "AI deep profiles — Company Intel · Person Intel · Website Intelligence · Data Seeder" },
  settings:         { title: "Settings",                sub: "Configure signal sources, relationship engines, and deduplication rules" },
};

// ── Main component ────────────────────────────────────────────────────────
export default function EnrichmentEngine() {
  const [location] = useLocation();
  const initial = pathToState(location);

  const [activeGroup, setActiveGroup] = useState<Group>(initial.group);
  const [innerTab,    setInnerTab]    = useState<InnerTab>(initial.inner);

  // When group changes, switch to its default inner tab
  const switchGroup = (g: Group) => {
    setActiveGroup(g);
    setInnerTab(DEFAULT_INNER[g]);
  };

  const groupDef   = GROUP_DEFS.find(g => g.id === activeGroup)!;
  const innerItems = INNER_TABS[activeGroup];
  const pageInfo   = PAGE_TITLES[innerTab] ?? { title: innerTab, sub: "" };

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* ── Group strip ── */}
      <div className="sticky top-0 z-20 border-b border-[#E8E2F0] bg-white">
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-2">
          {GROUP_DEFS.map(g => (
            <button
              key={g.id}
              onClick={() => switchGroup(g.id)}
              className={cn(
                "flex-shrink-0 rounded-xl border px-4 py-2 text-[12px] font-bold transition-all",
                activeGroup === g.id
                  ? "nf-chameleon-bg border-transparent text-white shadow-sm"
                  : "border-[#E8E2F0] text-[#7B6E8D] hover:text-[#4A3B5C] bg-transparent"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* ── Inner strip ── */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-[#F0EBF8] px-4 py-1.5" style={{ background: groupDef.bg }}>
          {innerItems.map((item, i) =>
            item === null ? (
              <div key={`sep-${i}`} className="mx-1 h-5 w-px flex-shrink-0 bg-[#D1C8DC]" />
            ) : (
              <button
                key={item.id}
                onClick={() => setInnerTab(item.id)}
                className={cn(
                  "flex-shrink-0 rounded-lg px-3 py-1 text-[11px] font-semibold transition-all whitespace-nowrap",
                  innerTab === item.id
                    ? "nf-chameleon-bg text-white shadow-sm"
                    : "text-[#7B6E8D] hover:text-[#4A3B5C]"
                )}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Page header ── */}
      <div className="border-b border-[#F0EBF8] bg-white px-6 py-4">
        <h1 className="text-[20px] font-bold text-[#2D2040]">{pageInfo.title}</h1>
        {pageInfo.sub && <p className="mt-0.5 text-[13px] text-[#9B8EAC]">{pageInfo.sub}</p>}
      </div>

      {/* ── Panel content ── */}
      <div className="flex-1 overflow-auto bg-[#F7F5FA] px-6 py-4">
        <PanelContent group={activeGroup} inner={innerTab} />
      </div>
    </div>
  );
}
