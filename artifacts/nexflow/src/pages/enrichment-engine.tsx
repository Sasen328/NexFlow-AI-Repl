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
  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="rounded-xl border border-[#E8E2F0] bg-white p-4">
        <div className="mb-3 text-[13px] font-bold text-[#4A3B5C]">Enrichment Waterfall</div>
        <div className="mb-4 text-[12px] text-[#7B6E8D]">Sources are tried in order. If a source returns data at the required confidence threshold, subsequent sources are skipped for that field.</div>
        <div className="flex flex-col gap-2">
          {[
            {p:1,name:"NexFlow CRM",      type:"Internal",  fields:"Email · Phone · Title",                confidence:"100%", cost:"Free"},
            {p:2,name:"LinkedIn Scout",   type:"Social",    fields:"Title · Company · LinkedIn URL",        confidence:"95%",  cost:"Free"},
            {p:3,name:"MCI / GLEIF",      type:"Gov · Open",fields:"Company name · CR · Legal entity",    confidence:"98%",  cost:"Free"},
            {p:4,name:"Tavily Search",    type:"AI Search", fields:"Email · News · Bio",                   confidence:"82%",  cost:"$0.001/req"},
            {p:5,name:"Perplexity",       type:"AI Search", fields:"Email · Phone · Activity",             confidence:"78%",  cost:"$0.002/req"},
            {p:6,name:"Argaam",           type:"Press",     fields:"Financials · News · Appointments",     confidence:"91%",  cost:"Free RSS"},
            {p:7,name:"SAMA Registry",    type:"Gov",       fields:"License · IBAN · Capital",             confidence:"100%", cost:"Free"},
          ].map(s => (
            <div key={s.p} className="flex items-center gap-3 rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: GOLD }}>{s.p}</span>
              <div className="flex-1">
                <div className="text-[12px] font-bold text-[#4A3B5C]">{s.name} <span className="ml-1 text-[10px] font-medium text-[#9B8EAC]">{s.type}</span></div>
                <div className="text-[10px] text-[#9B8EAC]">{s.fields}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold" style={{ color: TEAL }}>{s.confidence}</div>
                <div className="text-[10px] text-[#9B8EAC]">{s.cost}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Edit order</button>
          <button className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Add source</button>
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

function SettingsPanel() {
  const [subTab, setSubTab] = useState<"signals" | "relationship" | "dedup">("signals");
  const [srcStates, setSrcStates] = useState([true,true,true,true,false,true,false]);
  const [engStates, setEngStates] = useState([true,true,true,true,false]);
  const toggleSrc = (i: number) => setSrcStates(p => p.map((v,idx) => idx === i ? !v : v));
  const toggleEng = (i: number) => setEngStates(p => p.map((v,idx) => idx === i ? !v : v));

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex gap-0 overflow-hidden rounded-xl border border-[#E8E2F0] bg-white">
        {([["signals","Signal Sources"],["relationship","Relationship Engines"],["dedup","Deduplication"]] as const).map(([id,label]) => (
          <button key={id} onClick={() => setSubTab(id)}
            className="flex-1 py-3 text-[12px] font-bold transition-all"
            style={subTab === id ? { background: PRI, color: "#fff" } : { color: "#7B6E8D" }}
          >{label}</button>
        ))}
      </div>

      {subTab === "signals" && (
        <div className="rounded-xl border border-[#E8E2F0] bg-white">
          {[
            {name:"LinkedIn",      meta:"Job posts · profile changes · hiring signals",        status:"Connected",statusColor:"#4CAA84"},
            {name:"Argaam",        meta:"Saudi financial news · real-time RSS",                status:"Connected",statusColor:"#4CAA84"},
            {name:"Wamda",         meta:"MENA startup funding rounds",                         status:"Connected",statusColor:"#4CAA84"},
            {name:"MoCI / Saudi CR",meta:"Ownership changes · new registrations",              status:"Partial",  statusColor:GOLD},
            {name:"X / Twitter",   meta:"Executive announcements · company posts",             status:"Connected",statusColor:"#4CAA84"},
            {name:"Reuters ME",    meta:"GCC region news · M&A · leadership changes",          status:"Connected",statusColor:"#4CAA84"},
            {name:"Custom RSS",    meta:"+ Add your own RSS feed",                             status:"Custom",   statusColor:"#9B8EAC"},
          ].map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 border-b border-[#F0EBF8] px-4 py-3 last:border-0">
              <div className="flex-1">
                <div className="text-[12px] font-bold text-[#4A3B5C]">{s.name}</div>
                <div className="text-[11px] text-[#9B8EAC]">{s.meta}</div>
              </div>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold" style={{ background: s.statusColor + "20", color: s.statusColor }}>{s.status}</span>
              {s.name === "Custom RSS"
                ? <button className="rounded-lg border border-[#E2D8EA] px-3 py-1 text-[11px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">+ Add</button>
                : <Toggle on={srcStates[i] ?? true} onClick={() => toggleSrc(i)} />}
            </div>
          ))}
        </div>
      )}

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

      {subTab === "dedup" && (
        <div className="rounded-xl border border-[#E8E2F0] bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {l:"Primary match key",      opts:["Email","LinkedIn URL","Phone"],                  sel:0},
              {l:"Secondary match",        opts:["Name + Company","Name + Title"],                 sel:0},
              {l:"Conflict survivor",      opts:["Most complete","Newest","Manual"],               sel:0},
              {l:"Auto-merge threshold",   opts:["80%","90%","95%","100% only"],                   sel:1},
            ].map(f => (
              <div key={f.l}>
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{f.l}</div>
                <div className="flex flex-wrap gap-1">
                  {f.opts.map((o, i) => (
                    <span key={o}
                      className="inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                      style={i === f.sel ? { background: PRI, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}
                    >{o}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Save Rules</button>
          </div>
        </div>
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
              className="flex-shrink-0 rounded-xl border px-4 py-2 text-[12px] font-bold transition-all"
              style={
                activeGroup === g.id
                  ? { background: g.color, borderColor: g.color, color: "#fff" }
                  : { borderColor: "#E8E2F0", color: "#7B6E8D", background: "transparent" }
              }
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
                  innerTab === item.id ? "text-white" : "text-[#7B6E8D] hover:text-[#4A3B5C]"
                )}
                style={innerTab === item.id ? { background: groupDef.color } : undefined}
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
