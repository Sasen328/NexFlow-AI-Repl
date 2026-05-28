/**
 * nexus-chat-panel.tsx — AI Research Composer
 * 6-stage pipeline: Compose → Enhance → Clarify → Run → Report → Enrich
 * Matches the definitive prototype exactly.
 */
import { useState, useCallback, useRef } from "react";
import {
  ChevronDown, Eye, Sliders, ShieldCheck, BookOpen,
  CheckCircle2, XCircle, Loader2, RefreshCw, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Colors ──────────────────────────────────────────────────────────────────
const PRI  = "#B8A0C8";
const TEAL = "#88B8B0";
const GOLD = "#C8A880";

// ── Types ────────────────────────────────────────────────────────────────────
type Stage      = "compose" | "enhance" | "clarify" | "run" | "report" | "enrich";
type Layer      = 1 | 2 | 3 | 4;
type Target     = "person" | "company" | "both";
type ReportShape = "exec" | "detail" | "custom";
type EnrichTab  = "leads" | "companies";
interface AgentCard { id: string; name: string; desc: string; state: "running" | "done" | "err"; }

// ── Static data ──────────────────────────────────────────────────────────────
const TEMPLATES = [
  { v: "t1", l: "Saudi fintech CTOs · 2024 funded" },
  { v: "t2", l: "Tadawul board comparison" },
  { v: "t3", l: "Family-office contact map" },
  { v: "blank", l: "— Start blank —" },
];
const MODES = [
  { id: "leadgen",  l: "Lead Gen",          d: "finds people" },
  { id: "enrich",   l: "Enrich",            d: "adds fields" },
  { id: "research", l: "Research",          d: "" },
  { id: "compare",  l: "Compare",           d: "" },
  { id: "deepdive", l: "Deep Dive",         d: "" },
  { id: "signal",   l: "Signal Watch",      d: "" },
  { id: "tree",     l: "Relationship Tree", d: "" },
];
const COUNTRIES = [
  { id: "sa", l: "Saudi Arabia", s: "KSA" },
  { id: "ae", l: "UAE",          s: "UAE" },
  { id: "kw", l: "Kuwait",       s: "Kuwait" },
  { id: "qa", l: "Qatar",        s: "Qatar" },
  { id: "bh", l: "Bahrain",      s: "Bahrain" },
  { id: "om", l: "Oman",         s: "Oman" },
  { id: "gcc","l": "GCC (all)",  s: "GCC" },
  { id: "mena","l":"MENA",       s: "MENA" },
];
const INDUSTRIES = ["Fintech","Banking","Insurance","Energy","Construction","Real Estate","Healthcare","Retail","Logistics","Telecom","SaaS / Tech","Government"];
const LISTING    = ["Any","Tadawul main","Nomu","Private","VC-backed","PE-owned","Family-owned","State-owned"];
const SOURCES: Record<string, string[]> = {
  "reco":        ["Tavily Search", "Argaam Financial", "GLEIF LEI", "LinkedIn (Scout)", "Perplexity Deep", "Wamda"],
  "ksa-market":  ["MCI Commercial Registry","SAMA","CMA","MISA","Monsha'at SME","GASTAT","Tadawul","Najiz","REGA","OpenSanctions","PIF Portfolio"],
  "arabic-press":["Argaam Financial","Mubasher Markets","Saudi Gazette AR","Al Eqtisadiah","Asharq Al-Awsat","Aleqt","Madamasr","Al Wasat BH","Al Rai KW","Gulf News AR"],
  "social":      ["LinkedIn (Scout)","X / Twitter","Instagram Business","YouTube Channel","TikTok Business","Snapchat","Reddit MENA","Facebook Business","WhatsApp Business","Telegram Channels"],
};
const CONNECTORS: Record<string, string[]> = {
  "scraping": ["Playwright Stealth","Crawl4AI","BeautifulSoup4","Puppeteer","Cheerio","Selenium","Scrapy","Apify","BrightData"],
  "prod":     ["Google Workspace","Microsoft 365","Notion","Confluence","Airtable","Trello","Asana","Jira"],
  "crm":      ["NexFlow CRM","Salesforce","HubSpot","Zoho CRM","Pipedrive","Monday Sales"],
};
const SKILLS: Record<string, string[]> = {
  "finance":    ["Saudi CR Analyzer","SAMA License Checker","Tadawul Fetcher","GCC Funding Tracker"],
  "real":       ["Saudi RE Registry","REGA License Lookup","NEOM Contractor Map"],
  "people":     ["Executive Profiler","Board Member Tracker","Alumni Network"],
  "compliance": ["OpenSanctions Screener","PEP Checker"],
};
const SUB_FILTERS: Record<string, { l: string; opts: string[] }[]> = {
  fintech:  [{ l:"Sub-sector",opts:["All","BNPL","Open Banking","Payments","InsurTech"]},{l:"License",opts:["Any","SAMA","CMA","ADGM"]},{l:"Stage",opts:["Any","Seed","Series A","Series B+","Listed"]}],
  banking:  [{ l:"Type",opts:["Commercial","Islamic","Investment","Digital-only"]},{l:"Assets",opts:["Any","<SAR5B","5–50B","50B+"]},{l:"Listed",opts:["Any","Tadawul","Private"]}],
  default:  [{ l:"Ownership",opts:["Any","Founder-led","PE-owned","State"]},{l:"Stage",opts:["Startup","Growth","Mature"]},{l:"Export-ready",opts:["Any","Yes","No"]}],
};
const REPORT_SHAPES = [
  { id:"exec",   l:"Executive Summary",  d:"2-page · KPIs + 3 insights · NO table" },
  { id:"detail", l:"Detailed Report",    d:"Full · table · citations · all blocks" },
  { id:"custom", l:"Custom",             d:"Pick blocks" },
];
const CUSTOM_BLOCKS = ["Person table","Company table","Financials KPI","Signal block","Relationship tree","Outreach drafts","Citations"];
const ENRICH_LEAD = [
  {l:"LinkedIn URL",d:"Verified profile"},{l:"Email",d:"DNS+MX validated"},
  {l:"Phone",d:"+966 / GCC"},{l:"Background",d:"Schools · prev jobs"},
  {l:"ICP Score",d:"Tier + reasoning"},{l:"Activity",d:"Recent posts"},
  {l:"Outreach",d:"Personalized Ar/En"},{l:"Title verify",d:"Cross-source"},
];
const ENRICH_CO = [
  {l:"CR number",d:"Saudi MCI"},{l:"LEI / GLEIF",d:"Legal entity"},
  {l:"Revenue",d:"3-year"},{l:"Employees",d:"Verified"},
  {l:"Ownership",d:"Shareholders"},{l:"Funding",d:"All rounds"},
  {l:"Tech stack",d:"BuiltWith"},{l:"News",d:"90d"},
];
const REGEN = [
  {h:"Deeper report",t:"Re-render with Outreach blocks"},
  {h:"Alt enrichment",t:"Compliance/PEP on same results"},
  {h:"Expand",t:"+10 more · dedup applied"},
  {h:"Build tree",t:"Cross-company relationships"},
  {h:"Watch",t:"Daily signal digest"},
  {h:"New",t:"Start fresh",reset:true},
];
const RECENT_RUNS = [
  {when:"Today 06:14",title:"Saudi fintech CTOs · 2024 funded",meta:"Lead Gen + Enrich · 5 leads · Tabby+4"},
  {when:"Yesterday 22:01",title:"Tadawul board diversity audit",meta:"Compare · 12 cos · 78 board members"},
  {when:"2 days ago",title:"NEOM contractor signal watch",meta:"Signal · 6 active triggers"},
];
const DEMO_AGENTS = [
  {name:"Planner",        desc:"Decomposing query into 4 sub-tasks…",         done:"4 tasks scheduled · 2 parallel tracks"},
  {name:"Researcher",     desc:"Scanning LinkedIn, Crunchbase, news…",         done:"12 sources checked · 3 fintech matches found"},
  {name:"Harvester",      desc:"Pulling GCC regulatory filings…",              done:"SAMA + Tadawul data fetched"},
  {name:"Sanctions",      desc:"Screening against OFAC + OpenSanctions…",      done:"No matches — entity clear"},
  {name:"OSINT",          desc:"Mapping digital footprint across platforms…",  done:"8 LinkedIn profiles confirmed"},
  {name:"Lead Factory",   desc:"Building structured lead records…",            done:"5 leads · A+ ICP tier verified"},
  {name:"Writer",         desc:"Composing final report…",                      done:"Report ready · 6 cited sources"},
];
const STAGES: { id: Stage; n: number; l: string }[] = [
  {id:"compose", n:1, l:"Compose"},
  {id:"enhance", n:2, l:"Enhance"},
  {id:"clarify", n:3, l:"Clarify"},
  {id:"run",     n:4, l:"Run"},
  {id:"report",  n:5, l:"Report"},
  {id:"enrich",  n:6, l:"Enrich"},
];

// ── Shimmer + orbit keyframes injected once ────────────────────────────────
const KEYFRAMES = `
@keyframes shimmerSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
@keyframes ringPulse    { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes dotBlink     { 0%,100%{opacity:1} 50%{opacity:.2} }
`;

// ── Small helpers ─────────────────────────────────────────────────────────
function Chip({ on, onClick, children }: { on?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all",
        on
          ? "text-white"
          : "border border-[#E2D8EA] bg-white text-[#7B6E8D] hover:border-[#B8A0C8]/60"
      )}
      style={on ? { background: PRI } : undefined}
    >
      {children}
    </span>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors"
      style={{ background: on ? PRI : "#D1C8DC" }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-[#E8E2F0] bg-white p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{children}</div>;
}

// ── Customize panel sub-component ────────────────────────────────────────
type CustTab = "models" | "behavior" | "output";

const STAGE_DEFS = [
  { id:"planner",     l:"Planner",     d:"Decomposes query into parallel sub-tasks" },
  { id:"researcher",  l:"Researcher",  d:"Web search + Saudi source fetching" },
  { id:"validator",   l:"Validator",   d:"Email / phone / title cross-verification" },
  { id:"synthesizer", l:"Synthesizer", d:"Merges all agent outputs into one record" },
  { id:"writer",      l:"Writer",      d:"Final report + Arabic/English outreach" },
];

const MODEL_OPTS = [
  { id:"gemini-2.5-pro",   l:"Gemini 2.5 Pro",    badge:"Best",    color:TEAL  },
  { id:"perplexity",        l:"Perplexity",         badge:"Web",     color:"#7B6E8D" },
  { id:"claude-3-5-sonnet", l:"Claude 3.5 Sonnet",  badge:"Precise", color:PRI   },
  { id:"claude-3-5-haiku",  l:"Claude 3.5 Haiku",   badge:"Fast",    color:PRI   },
  { id:"gpt-4o-mini",       l:"GPT-4o mini",         badge:"Economy", color:"#4CAA84" },
];

const DEFAULT_STAGE_MODELS: Record<string, string> = {
  planner:     "gemini-2.5-pro",
  researcher:  "perplexity",
  validator:   "claude-3-5-sonnet",
  synthesizer: "gemini-2.5-pro",
  writer:      "claude-3-5-haiku",
};

function CustomizePanel() {
  const [tab,          setTab]          = useState<CustTab>("models");
  const [stageModels,  setStageModels]  = useState<Record<string, string>>(DEFAULT_STAGE_MODELS);
  const [concurrency,  setConcurrency]  = useState(8);
  const [temperature,  setTemperature]  = useState(3);   // × 0.1 → 0.3
  const [tokenBudget,  setTokenBudget]  = useState("48K");
  const [agentTimeout, setAgentTimeout] = useState("55s");
  const [deepCrawl,    setDeepCrawl]    = useState(true);
  const [arabicSrc,    setArabicSrc]    = useState(true);
  const [stealth,      setStealth]      = useState(false);
  const [parallelFan,  setParallelFan]  = useState(true);
  const [autoRetry,    setAutoRetry]    = useState(true);
  const [language,     setLanguage]     = useState("Bilingual");
  const [citation,     setCitation]     = useState("Inline");
  const [currency,     setCurrency]     = useState("SAR");
  const [outputFields, setOutputFields] = useState(new Set(["LinkedIn URL","Email","ICP Score","Funding"]));

  const ALL_FIELDS = ["LinkedIn URL","Email","Phone","Title","ICP Score","Funding","Headcount","Tech Stack","90d News","Arabic Outreach","Board Members","Ownership"];
  const toggleField = (f: string) => setOutputFields(p => { const n = new Set(p); n.has(f) ? n.delete(f) : n.add(f); return n; });

  const TABS: { id: CustTab; l: string }[] = [
    { id:"models",   l:"Models" },
    { id:"behavior", l:"Behavior" },
    { id:"output",   l:"Output" },
  ];

  return (
    <div className="rounded-xl border border-[#D5C8E0] bg-white shadow-sm overflow-hidden">
      {/* header + tab strip */}
      <div className="flex items-center gap-2 border-b border-[#E8E2F0] bg-[#FAFAF9] px-4 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: PRI }}>Orchestrator Config</span>
        <div className="ml-auto flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="rounded-lg px-3 py-1 text-[11px] font-semibold transition-all"
              style={tab === t.id ? { background: PRI, color: "#fff" } : { color: "#7B6E8D" }}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Models tab */}
      {tab === "models" && (
        <div className="p-4 space-y-3.5">
          {STAGE_DEFS.map(s => (
            <div key={s.id}>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#4A3B5C]">{s.l}</span>
                <span className="text-[10px] text-[#9B8EAC]">— {s.d}</span>
                <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                  style={{ background: MODEL_OPTS.find(m => m.id === stageModels[s.id])?.color ?? PRI }}>
                  {MODEL_OPTS.find(m => m.id === stageModels[s.id])?.badge}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MODEL_OPTS.map(m => {
                  const active = stageModels[s.id] === m.id;
                  return (
                    <button key={m.id}
                      onClick={() => setStageModels(prev => ({ ...prev, [s.id]: m.id }))}
                      className="inline-flex items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                      style={active
                        ? { background: m.color, color: "#fff" }
                        : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>
                      {m.l}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="border-t border-[#F0EBF8] pt-3 flex flex-wrap gap-3">
            {[
              { l:"Parallel fan-out", on:parallelFan, set:setParallelFan },
              { l:"Auto-retry 429",   on:autoRetry,   set:setAutoRetry   },
              { l:"Deep web crawl",   on:deepCrawl,   set:setDeepCrawl   },
              { l:"Stealth browser",  on:stealth,     set:setStealth      },
            ].map(t => (
              <div key={t.l} className="flex items-center gap-1.5 text-[11px] font-medium text-[#4A3B5C]">
                <Toggle on={t.on} onClick={() => t.set((p: boolean) => !p)} /> {t.l}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Behavior tab */}
      {tab === "behavior" && (
        <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Concurrency — {concurrency} agents</FieldLabel>
            <input type="range" min={1} max={20} value={concurrency}
              onChange={e => setConcurrency(+e.target.value)}
              className="w-full accent-[#B8A0C8]" />
            <div className="mt-0.5 flex justify-between text-[9px] text-[#9B8EAC]"><span>1</span><span>10</span><span>20</span></div>
          </div>
          <div>
            <FieldLabel>Temperature — {(temperature / 10).toFixed(1)}</FieldLabel>
            <input type="range" min={0} max={10} value={temperature}
              onChange={e => setTemperature(+e.target.value)}
              className="w-full accent-[#B8A0C8]" />
            <div className="mt-0.5 flex justify-between text-[9px] text-[#9B8EAC]"><span>0 Strict</span><span>0.5</span><span>1.0 Creative</span></div>
          </div>
          <div>
            <FieldLabel>Token Budget</FieldLabel>
            <div className="flex flex-wrap gap-1">
              {["16K","32K","48K","64K","128K"].map(v => (
                <span key={v} onClick={() => setTokenBudget(v)}
                  className="cursor-pointer rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                  style={tokenBudget === v
                    ? { background: PRI, color: "#fff" }
                    : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Agent Timeout</FieldLabel>
            <div className="flex flex-wrap gap-1">
              {["30s","55s","90s","3min"].map(v => (
                <span key={v} onClick={() => setAgentTimeout(v)}
                  className="cursor-pointer rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                  style={agentTimeout === v
                    ? { background: TEAL, color: "#fff" }
                    : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Arabic Sources</FieldLabel>
            <Toggle on={arabicSrc} onClick={() => setArabicSrc(p => !p)} />
          </div>
          <div>
            <FieldLabel>Stealth Browser</FieldLabel>
            <Toggle on={stealth} onClick={() => setStealth(p => !p)} />
          </div>
        </div>
      )}

      {/* Output tab */}
      {tab === "output" && (
        <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Language</FieldLabel>
            <div className="flex flex-wrap gap-1">
              {["English","Arabic","Bilingual"].map(v => (
                <span key={v} onClick={() => setLanguage(v)}
                  className="cursor-pointer rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                  style={language === v ? { background: PRI, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Citation Style</FieldLabel>
            <div className="flex flex-wrap gap-1">
              {["Inline","Footnotes","Appendix","None"].map(v => (
                <span key={v} onClick={() => setCitation(v)}
                  className="cursor-pointer rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                  style={citation === v ? { background: TEAL, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Currency Normalisation</FieldLabel>
            <div className="flex flex-wrap gap-1">
              {["SAR","USD","Both"].map(v => (
                <span key={v} onClick={() => setCurrency(v)}
                  className="cursor-pointer rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                  style={currency === v ? { background: GOLD, color: "#fff" } : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>
                  {v}
                </span>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Output Fields ({outputFields.size} selected)</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {ALL_FIELDS.map(f => (
                <span key={f} onClick={() => toggleField(f)}
                  className="cursor-pointer rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all"
                  style={outputFields.has(f)
                    ? { background: PRI + "22", color: PRI, border: `1px solid ${PRI}55` }
                    : { border: "1px solid #E2D8EA", color: "#7B6E8D" }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
export function NexusChatPanel() {
  const [stage, setStage] = useState<Stage>("compose");
  const [layer, setLayer] = useState<Layer>(1);
  const [reachedStages, setReachedStages] = useState<Set<Stage>>(new Set(["compose"]));

  // Compose state
  const [template,     setTemplate]     = useState("t1");
  const [modes,        setModes]        = useState<Set<string>>(new Set(["leadgen", "enrich"]));
  const [showModesPop, setShowModesPop] = useState(false);
  const [target,       setTarget]       = useState<Target>("both");
  const [countries,    setCountries]    = useState<Set<string>>(new Set(["sa"]));
  const [showCtryPop,  setShowCtryPop]  = useState(false);
  const [industry,     setIndustry]     = useState("fintech");
  const [listing,      setListing]      = useState("Any");
  const [sourceCat,    setSourceCat]    = useState("reco");
  const [connCat,      setConnCat]      = useState("scraping");
  const [skillCat,     setSkillCat]     = useState("finance");
  const [selectedSources,    setSelectedSources]    = useState<Set<string>>(new Set(["Tavily Search", "Argaam Financial", "LinkedIn (Scout)"]));
  const [selectedConns,      setSelectedConns]      = useState<Set<string>>(new Set(["Playwright Stealth", "Crawl4AI"]));
  const [selectedSkills,     setSelectedSkills]     = useState<Set<string>>(new Set(["Saudi CR Analyzer", "SAMA License Checker"]));
  const [queryText,    setQueryText]    = useState("Find 5 Saudi fintech CTOs at Series-A+ companies that closed 2024 funding and are hiring engineers in Riyadh.");
  const [inputMode,    setInputMode]    = useState<"both" | "write" | "filter">("both");
  const [enhancerOn,   setEnhancerOn]   = useState(true);

  // Clarify state
  const [reportShape,  setReportShape]  = useState<ReportShape>("detail");
  const [customBlocks, setCustomBlocks] = useState<Set<string>>(new Set(["Person table", "Company table", "Financials KPI", "Citations"]));

  // Toolbar panels
  const [showObserver,   setShowObserver]   = useState(false);
  const [showCustomize,  setShowCustomize]  = useState(false);
  const [showConstraints,setShowConstraints]= useState(false);

  // Run state
  const [agentCards, setAgentCards] = useState<AgentCard[]>([]);
  const [runWorking, setRunWorking] = useState(false);

  // Report / Enrich
  const [enrichTab,    setEnrichTab]    = useState<EnrichTab>("leads");
  const [leadOpts,     setLeadOpts]     = useState<Set<string>>(new Set(["LinkedIn URL", "Email"]));
  const [coOpts,       setCoOpts]       = useState<Set<string>>(new Set(["CR number", "LEI / GLEIF", "Employees"]));
  const [enrichResult, setEnrichResult] = useState("");
  const [miniChatOpen, setMiniChatOpen] = useState(false);
  const [miniMsg,      setMiniMsg]      = useState("");

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 2500); };

  const gotoStage = (s: Stage) => {
    setReachedStages(prev => { const n = new Set(prev); n.add(s); return n; });
    setStage(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stageOrder = STAGES.map(s => s.id);
  const stageIdx   = (s: Stage) => stageOrder.indexOf(s);
  const reached    = (s: Stage) => reachedStages.has(s);

  const buildRoute = () => {
    const ms = [...modes].map(m => MODES.find(x => x.id === m)?.l || m).join("+");
    const cs = [...countries].map(c => COUNTRIES.find(x => x.id === c)?.s || c).join(",");
    return `route → ${target} · ${cs} · ${industry} · modes ${ms || "—"} · report ${reportShape}`;
  };

  const buildEnhanced = () => [
    `OBJECTIVE — Identify ${target === "person" ? "individuals" : target === "company" ? "companies" : "companies AND key people"} matching:`,
    `  • Industry: ${industry}`,
    `  • Markets: ${[...countries].map(c => COUNTRIES.find(x => x.id === c)?.l || c).join(", ")}`,
    `  • Listing: ${listing}`,
    "",
    `SOURCES — ${[...selectedSources].join(" · ")}`,
    `MODES — ${[...modes].map(m => MODES.find(x => x.id === m)?.l).join(" + ") || "—"}`,
    `REPORT SHAPE — ${reportShape}`,
    "",
    `RULES`,
    `  1. Honor every filter · no relaxation without asking`,
    `  2. Cite every claim with source URL`,
    `  3. Never invent contact data · leave blank + flag`,
    `  4. Email validation: DNS+MX pass required`,
    `  5. Currency-normalize all financial fields to SAR`,
  ].join("\n");

  const startAgents = useCallback(async () => {
    if (runWorking) return;
    setRunWorking(true);
    gotoStage("run");
    setAgentCards([]);

    const add  = (name: string, desc: string) =>
      setAgentCards(prev => [...prev, { id: name, name, desc, state: "running" }]);
    const done = (name: string, summary: string) =>
      setAgentCards(prev => prev.map(c => c.id === name ? { ...c, state: "done", desc: summary } : c));
    const err  = (msg: string) =>
      setAgentCards(prev => [...prev, { id: "err-" + Date.now(), name: "Error", desc: msg, state: "err" }]);

    try {
      const body = {
        message: queryText || `Research ${industry} leads in ${[...countries].map(c => COUNTRIES.find(x => x.id === c)?.l).join(", ")}`,
        system: "You are a GCC B2B research expert. Find leads matching the request. Be concise and structured.",
      };
      const res = await fetch("/api/ai-chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok || !res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.event === "agent_start") add(ev.data.agent, ev.data.description || "");
            else if (ev.event === "agent_done") done(ev.data.agent, ev.data.summary || "");
            else if (ev.event === "error") err(ev.data?.message || "Unknown error");
          } catch { /* skip malformed */ }
        }
      }
    } catch {
      // Demo fallback — plays through DEMO_AGENTS with realistic delays
      for (const a of DEMO_AGENTS) {
        await new Promise(r => setTimeout(r, 320 + Math.random() * 280));
        add(a.name, a.desc);
        await new Promise(r => setTimeout(r, 580 + Math.random() * 520));
        done(a.name, a.done);
      }
    }

    setRunWorking(false);
    setTimeout(() => gotoStage("report"), 400);
  }, [runWorking, queryText, industry, countries]);

  const kickoff = () => {
    if (enhancerOn) gotoStage("enhance");
    else gotoStage("clarify");
  };

  const resetAll = () => {
    setStage("compose");
    setLayer(1);
    setReachedStages(new Set(["compose"]));
    setAgentCards([]);
    setEnrichResult("");
  };

  const subFilters = SUB_FILTERS[industry.toLowerCase()] || SUB_FILTERS.default;

  // ── Compose layer prev/next helpers ─────────────────────────────────────
  const prevLayer = () => setLayer(l => Math.max(1, l - 1) as Layer);
  const nextLayer = () => setLayer(l => Math.min(4, l + 1) as Layer);

  // ── Toggle helpers ───────────────────────────────────────────────────────
  const toggleMode   = (id: string) => setModes(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleCtry   = (id: string) => setCountries(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSrc    = (s: string)  => setSelectedSources(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const toggleConn   = (s: string)  => setSelectedConns(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const toggleSkill  = (s: string)  => setSelectedSkills(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const toggleLeadOpt= (s: string)  => setLeadOpts(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const toggleCoOpt  = (s: string)  => setCoOpts(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const toggleCustomBlock = (s: string) => setCustomBlocks(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; });

  const modesSummary   = [...modes].map(m => MODES.find(x => x.id === m)?.l || m).join(", ") || "None";
  const countrySummary = [...countries].map(c => COUNTRIES.find(x => x.id === c)?.s || c).join(", ") || "None";

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* ── Keyframe styles ── */}
      <style>{KEYFRAMES}</style>

      {/* ── Mega-live banner ── */}
      <div
        className="rounded-xl border border-[#D5C8E0] px-4 py-3 text-[12px] font-semibold"
        style={{ background: "linear-gradient(135deg,rgba(184,160,200,.08),rgba(136,184,176,.06))" }}
      >
        <span className="mr-2 font-bold" style={{ color: PRI }}>MEGA-MIND ORCHESTRATOR</span>
        <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: "#4CAA84", animation: "dotBlink 1.5s infinite" }} />
        <span className="font-mono text-[11px] text-[#9B8EAC]">{buildRoute()}</span>
      </div>

      {/* ── AI Toolbar ── */}
      <div className="flex flex-wrap gap-2">
        {[
          { icon: <Sliders className="h-3.5 w-3.5" />, label: "Customize", active: showCustomize,   onClick: () => { setShowCustomize(p => !p); setShowObserver(false); setShowConstraints(false); } },
          { icon: <Eye className="h-3.5 w-3.5" />,    label: "AI Observer", active: showObserver,   onClick: () => { setShowObserver(p => !p); setShowCustomize(false); setShowConstraints(false); } },
          { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Constraints", active: showConstraints, onClick: () => { setShowConstraints(p => !p); setShowObserver(false); setShowCustomize(false); } },
          { icon: <BookOpen className="h-3.5 w-3.5" />, label: "Memory", active: false, onClick: () => toast("Memory panel coming soon") },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all",
              btn.active
                ? "border-[#B8A0C8] text-white"
                : "border-[#DDD5E8] bg-white text-[#7B6E8D] hover:border-[#B8A0C8]/60"
            )}
            style={btn.active ? { background: PRI } : undefined}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      {/* ── AI Observer panel ── */}
      {showObserver && (
        <Card>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: PRI }}>AI Observer — live agent statuses</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { n: "Planner",     status: "idle",    desc: "Awaiting brief" },
              { n: "Researcher",  status: "idle",    desc: "Awaiting plan" },
              { n: "Validator",   status: "idle",    desc: "Awaiting data" },
              { n: "ICP Scorer",  status: "idle",    desc: "Awaiting leads" },
            ].map(a => (
              <div key={a.n} className="rounded-lg border border-[#EDE8F4] bg-[#FAFAF9] p-3">
                <div className="mb-0.5 text-[12px] font-bold text-[#4A3B5C]">{a.n}</div>
                <div className="mb-1 text-[10px] text-[#9B8EAC]">{a.desc}</div>
                <span className="rounded-full bg-[#EDE8F4] px-2 py-0.5 text-[10px] font-bold text-[#9B8EAC]">{a.status}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Customize panel ── */}
      {showCustomize && <CustomizePanel />}

      {/* ── Constraints panel ── */}
      {showConstraints && (
        <Card>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: PRI }}>Research Constraints</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              {l:"Email policy",   opts:["DNS+MX only","AI-guess allowed","Skip emails"],  sel:0},
              {l:"Title verify",   opts:["Yes — cross-source","No — trust primary"],       sel:0},
              {l:"Language",       opts:["English","Arabic","Bilingual"],                  sel:0},
              {l:"Currency",       opts:["SAR","USD","Both"],                              sel:0},
              {l:"Min funding",    opts:["Any","$2M+","$10M+","$50M+"],                    sel:1},
            ].map(f => (
              <div key={f.l}>
                <FieldLabel>{f.l}</FieldLabel>
                <div className="flex flex-wrap gap-1">
                  {f.opts.map((o, i) => <Chip key={o} on={i === f.sel} onClick={() => {}}>{o}</Chip>)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── 6-stage bar ── */}
      <div className="flex items-center gap-0 overflow-x-auto rounded-xl border border-[#E8E2F0] bg-white p-1">
        {STAGES.map((s, i) => {
          const isCurrent  = stage === s.id;
          const isDone     = stageIdx(stage) > stageIdx(s.id);
          const isReachable= reached(s.id) || isDone;
          return (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => isReachable ? gotoStage(s.id) : toast("Complete earlier stages first")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all",
                  isCurrent  ? "text-white" : isDone ? "text-[#4CAA84]" : "text-[#9B8EAC] hover:text-[#4A3B5C]"
                )}
                style={isCurrent ? { background: PRI } : undefined}
              >
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: isCurrent ? "rgba(255,255,255,.3)" : isDone ? "rgba(76,170,132,.18)" : "rgba(155,142,172,.12)" }}
                >
                  {isDone ? <CheckCircle2 className="h-3 w-3" /> : s.n}
                </span>
                <span className="hidden sm:inline">{s.l}</span>
              </button>
              {i < STAGES.length - 1 && <span className="px-0.5 text-[#D1C8DC]">›</span>}
            </div>
          );
        })}
      </div>

      {/* ── Recent runs + insight cards (compose stage) ── */}
      {stage === "compose" && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {RECENT_RUNS.map(r => (
              <button
                key={r.when}
                onClick={() => toast("Loaded: " + r.title)}
                className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-left transition-all hover:border-[#B8A0C8]/40 hover:shadow-sm"
              >
                <div className="mb-0.5 text-[10px] font-bold text-[#9B8EAC]">{r.when}</div>
                <div className="mb-0.5 text-[12px] font-bold text-[#4A3B5C]">{r.title}</div>
                <div className="text-[11px] text-[#9B8EAC]">{r.meta}</div>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {h:"Ran 3× this week",t:"Re-run with 2025 data",cta:"Reload",color:PRI},
              {h:"Likely next",t:"Series-B fintech CFOs",cta:"Open",color:PRI},
              {h:"Live signal",t:"Hala hired 4 senior engineers · score up",cta:"Open Signal Watch",color:GOLD},
              {h:"Relationship Tree",t:"Map Tabby exec network · 12 ties",cta:"Build tree",color:TEAL},
            ].map(c => (
              <div
                key={c.h}
                className="cursor-pointer rounded-xl border border-[#E8E2F0] bg-white p-3 transition-all hover:shadow-sm"
                onClick={() => toast(c.cta)}
              >
                <div className="mb-0.5 text-[12px] font-bold" style={{ color: c.color }}>{c.h}</div>
                <div className="text-[11px] text-[#6B5E7E]">{c.t}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════
           STAGE: COMPOSE
      ══════════════════════════════════════════════ */}
      {stage === "compose" && (
        <div className="flex flex-col gap-3">
          {/* Layer breadcrumb */}
          <div className="flex items-center gap-1 text-[12px]">
            {["Pick","Scope","Tools","Ask"].map((l, i) => {
              const num = (i + 1) as Layer;
              const active = layer === num;
              const done   = layer > num;
              return (
                <div key={l} className="flex items-center gap-1">
                  <button
                    onClick={() => num <= layer ? setLayer(num) : {}}
                    className={cn("rounded-full px-3 py-1 font-semibold transition-all",
                      active ? "text-white" : done ? "text-[#4CAA84]" : "text-[#9B8EAC]")}
                    style={active ? { background: PRI } : undefined}
                  >
                    {done ? "✓ " : ""}{l}
                  </button>
                  {i < 3 && <span className="text-[#D1C8DC]">›</span>}
                </div>
              );
            })}
          </div>

          {/* Layer 1: Pick */}
          {layer === 1 && (
            <Card>
              <div className="mb-4 text-[13px] font-bold text-[#4A3B5C]">1 — Template, Mode & Target</div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <FieldLabel>Template</FieldLabel>
                  <select
                    value={template}
                    onChange={e => setTemplate(e.target.value)}
                    className="w-full rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-2 text-[12px] font-medium text-[#4A3B5C] focus:outline-none"
                  >
                    {TEMPLATES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                  </select>
                </div>

                <div className="relative">
                  <FieldLabel>Modes</FieldLabel>
                  <button
                    onClick={() => setShowModesPop(p => !p)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-2 text-[12px] font-medium text-[#4A3B5C]"
                  >
                    <span className="truncate">{modesSummary}</span>
                    <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-[#9B8EAC]" />
                  </button>
                  {showModesPop && (
                    <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-xl border border-[#E2D8EA] bg-white p-2 shadow-lg">
                      {MODES.map(m => (
                        <label key={m.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#F5F1FA]">
                          <input type="checkbox" checked={modes.has(m.id)} onChange={() => toggleMode(m.id)} className="accent-[#B8A0C8]" />
                          <span className="text-[12px] font-medium text-[#4A3B5C]">{m.l}</span>
                          {m.d && <span className="ml-auto text-[10px] text-[#9B8EAC]">{m.d}</span>}
                        </label>
                      ))}
                      <button onClick={() => setShowModesPop(false)} className="mt-1 w-full rounded-lg py-1 text-[11px] font-bold text-[#B8A0C8] hover:bg-[#F5F1FA]">Done</button>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel>Looking for</FieldLabel>
                  <div className="flex gap-1.5">
                    {(["person","company","both"] as Target[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setTarget(t)}
                        className="flex-1 rounded-lg border py-1.5 text-[11px] font-bold capitalize transition-all"
                        style={target === t ? { background: PRI, borderColor: PRI, color: "#fff" } : { borderColor: "#E2D8EA", color: "#7B6E8D" }}
                      >
                        {t === "person" ? "Individuals" : t === "company" ? "Companies" : "Both"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={nextLayer} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>
                  Next: Scope →
                </button>
              </div>
            </Card>
          )}

          {/* Layer 2: Scope */}
          {layer === 2 && (
            <Card>
              <div className="mb-4 text-[13px] font-bold text-[#4A3B5C]">2 — Geography, Industry & Listing</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <FieldLabel>Countries / Markets</FieldLabel>
                  <button
                    onClick={() => setShowCtryPop(p => !p)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-2 text-[12px] font-medium text-[#4A3B5C]"
                  >
                    <span className="truncate">{countrySummary}</span>
                    <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-[#9B8EAC]" />
                  </button>
                  {showCtryPop && (
                    <div className="absolute left-0 top-full z-30 mt-1 w-56 rounded-xl border border-[#E2D8EA] bg-white p-2 shadow-lg">
                      {COUNTRIES.map(c => (
                        <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#F5F1FA]">
                          <input type="checkbox" checked={countries.has(c.id)} onChange={() => toggleCtry(c.id)} className="accent-[#B8A0C8]" />
                          <span className="text-[12px] font-medium text-[#4A3B5C]">{c.l}</span>
                        </label>
                      ))}
                      <button onClick={() => setShowCtryPop(false)} className="mt-1 w-full rounded-lg py-1 text-[11px] font-bold text-[#B8A0C8] hover:bg-[#F5F1FA]">Done</button>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel>Industry</FieldLabel>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value.toLowerCase())}
                    className="w-full rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-2 text-[12px] font-medium text-[#4A3B5C] focus:outline-none"
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i.toLowerCase()}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <FieldLabel>Listing / Ownership type</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {LISTING.map(l => <Chip key={l} on={listing === l} onClick={() => setListing(l)}>{l}</Chip>)}
                </div>
              </div>

              {subFilters.length > 0 && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {subFilters.map(f => (
                    <div key={f.l}>
                      <FieldLabel>{f.l}</FieldLabel>
                      <div className="flex flex-wrap gap-1">
                        {f.opts.map((o, i) => <Chip key={o} on={i === 0} onClick={() => {}}>{o}</Chip>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <button onClick={prevLayer} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">← Pick</button>
                <button onClick={nextLayer} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Next: Tools →</button>
              </div>
            </Card>
          )}

          {/* Layer 3: Tools */}
          {layer === 3 && (
            <Card>
              <div className="mb-4 text-[13px] font-bold text-[#4A3B5C]">3 — Sources, Connectors & Skills</div>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Sources */}
                <div>
                  <FieldLabel>Sources</FieldLabel>
                  <select value={sourceCat} onChange={e => setSourceCat(e.target.value)} className="mb-2 w-full rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-1.5 text-[11px] font-medium focus:outline-none">
                    {Object.keys(SOURCES).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-1">
                    {SOURCES[sourceCat].map(s => <Chip key={s} on={selectedSources.has(s)} onClick={() => toggleSrc(s)}>{s}</Chip>)}
                  </div>
                </div>
                {/* Connectors */}
                <div>
                  <FieldLabel>Connectors</FieldLabel>
                  <select value={connCat} onChange={e => setConnCat(e.target.value)} className="mb-2 w-full rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-1.5 text-[11px] font-medium focus:outline-none">
                    {Object.keys(CONNECTORS).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-1">
                    {CONNECTORS[connCat].map(s => <Chip key={s} on={selectedConns.has(s)} onClick={() => toggleConn(s)}>{s}</Chip>)}
                  </div>
                </div>
                {/* Skills */}
                <div>
                  <FieldLabel>Skills</FieldLabel>
                  <select value={skillCat} onChange={e => setSkillCat(e.target.value)} className="mb-2 w-full rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-1.5 text-[11px] font-medium focus:outline-none">
                    {Object.keys(SKILLS).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-1">
                    {SKILLS[skillCat].map(s => <Chip key={s} on={selectedSkills.has(s)} onClick={() => toggleSkill(s)}>{s}</Chip>)}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button onClick={prevLayer} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">← Scope</button>
                <button onClick={nextLayer} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Next: Ask →</button>
              </div>
            </Card>
          )}

          {/* Layer 4: Ask */}
          {layer === 4 && (
            <Card>
              <div className="mb-4 text-[13px] font-bold text-[#4A3B5C]">4 — Ask</div>
              {/* Live context pills */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-[#D5C8E0] bg-[#F5F1FA] px-2.5 py-1 text-[10px] font-bold text-[#7B6E8D]">{industry}</span>
                <span className="rounded-full border border-[#D5C8E0] bg-[#F5F1FA] px-2.5 py-1 text-[10px] font-bold text-[#7B6E8D]">{countrySummary}</span>
                <span className="rounded-full border border-[#D5C8E0] bg-[#F5F1FA] px-2.5 py-1 text-[10px] font-bold text-[#7B6E8D]">{target}</span>
                <span className="rounded-full border border-[#D5C8E0] bg-[#F5F1FA] px-2.5 py-1 text-[10px] font-bold text-[#7B6E8D]">{modesSummary}</span>
              </div>
              {/* Write / Filter mode */}
              <div className="mb-3 flex gap-0 overflow-hidden rounded-lg border border-[#E2D8EA]">
                {(["both","write","filter"] as const).map(m => (
                  <button key={m} onClick={() => setInputMode(m)}
                    className="flex-1 py-1.5 text-[11px] font-bold capitalize transition-all"
                    style={inputMode === m ? { background: PRI, color: "#fff" } : { background: "#FAFAF9", color: "#7B6E8D" }}
                  >{m}</button>
                ))}
              </div>
              {/* Query textarea */}
              {(inputMode === "both" || inputMode === "write") && (
                <textarea
                  value={queryText}
                  onChange={e => setQueryText(e.target.value)}
                  rows={3}
                  placeholder="Ask the AI to compose your research query…"
                  className="mb-3 w-full resize-none rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-2 text-[13px] text-[#4A3B5C] focus:outline-none focus:ring-1"
                  style={{ "--tw-ring-color": PRI } as React.CSSProperties}
                />
              )}
              {/* AI Prompt Enhancer toggle */}
              <div className="mb-4 flex items-center gap-3">
                <Toggle on={enhancerOn} onClick={() => setEnhancerOn(p => !p)} />
                <div>
                  <span className="text-[12px] font-bold text-[#4A3B5C]">AI Prompt Enhancer</span>
                  <span className="ml-2 text-[11px] text-[#9B8EAC]">rewrites query for max precision before running</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={prevLayer} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">← Tools</button>
                <button
                  onClick={kickoff}
                  className="rounded-lg px-5 py-2 text-[13px] font-bold text-white shadow"
                  style={{ background: PRI }}
                >
                  Compose & Run →
                </button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
           STAGE: ENHANCE
      ══════════════════════════════════════════════ */}
      {stage === "enhance" && (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-bold text-[#4A3B5C]">Enhanced Prompt</div>
              <div className="text-[11px] text-[#9B8EAC]">AI-rewritten for precision · review and run</div>
            </div>
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white" style={{ background: TEAL }}>Enhanced</span>
          </div>
          <pre className="mb-4 whitespace-pre-wrap rounded-lg border border-[#E8E2F0] bg-[#FAFAF9] p-4 font-mono text-[11.5px] leading-relaxed text-[#4A3B5C]">
            {buildEnhanced()}
          </pre>
          <div className="flex items-center justify-between">
            <button onClick={() => gotoStage("compose")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">← Compose</button>
            <div className="flex gap-2">
              <button onClick={() => toast("Prompt saved as template")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Save Template</button>
              <button onClick={() => gotoStage("clarify")} className="rounded-lg px-5 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Next: Clarify →</button>
            </div>
          </div>
        </Card>
      )}

      {/* ══════════════════════════════════════════════
           STAGE: CLARIFY
      ══════════════════════════════════════════════ */}
      {stage === "clarify" && (
        <Card>
          <div className="mb-4 text-[13px] font-bold text-[#4A3B5C]">Clarify — Report Configuration</div>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {[
              { l:"Include 'Head of Eng' / 'VP Eng'?",      opts:["Yes","No"],                         sel:0 },
              { l:"Min funding round",                       opts:["Any","$2M+","$10M+","$50M+"],       sel:1 },
              { l:"Verify titles cross-source?",             opts:["Yes","No · trust primary"],          sel:0 },
              { l:"Email policy",                            opts:["DNS+MX only","AI-guess","Skip"],     sel:0 },
              { l:"Language",                                opts:["English","Arabic","Bilingual"],       sel:0 },
              { l:"Currency",                                opts:["SAR","USD","Both"],                  sel:0 },
            ].map(f => (
              <div key={f.l}>
                <FieldLabel>{f.l}</FieldLabel>
                <div className="flex flex-wrap gap-1">
                  {f.opts.map((o, i) => <Chip key={o} on={i === f.sel} onClick={() => {}}>{o}</Chip>)}
                </div>
              </div>
            ))}
          </div>
          <FieldLabel>Report shape</FieldLabel>
          <div className="mb-3 grid gap-2 sm:grid-cols-3">
            {REPORT_SHAPES.map(rs => (
              <button
                key={rs.id}
                onClick={() => setReportShape(rs.id as ReportShape)}
                className="rounded-xl border p-3 text-left transition-all"
                style={reportShape === rs.id ? { borderColor: PRI, background: "rgba(184,160,200,.08)" } : { borderColor: "#E8E2F0" }}
              >
                <div className="text-[12px] font-bold text-[#4A3B5C]">{rs.l}</div>
                <div className="text-[10px] text-[#9B8EAC]">{rs.d}</div>
              </button>
            ))}
          </div>
          {reportShape === "custom" && (
            <div className="mb-4">
              <FieldLabel>Pick blocks</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {CUSTOM_BLOCKS.map(b => <Chip key={b} on={customBlocks.has(b)} onClick={() => toggleCustomBlock(b)}>{b}</Chip>)}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button onClick={() => gotoStage("enhance")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">← Enhance</button>
            <button onClick={startAgents} className="rounded-lg px-5 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Run →</button>
          </div>
        </Card>
      )}

      {/* ══════════════════════════════════════════════
           STAGE: RUN
      ══════════════════════════════════════════════ */}
      {stage === "run" && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ background: PRI }}>
              {runWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#4A3B5C]">Agents Working</div>
              {runWorking && (
                <div className="flex items-center gap-1 text-[11px] text-[#9B8EAC]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4CAA84", animation: "dotBlink 1s infinite" }} />
                  streaming
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {agentCards.map(card => (
              <div
                key={card.id}
                className="relative overflow-hidden rounded-xl border bg-white"
                style={{ borderColor: card.state === "done" ? "#4CAA84" : card.state === "err" ? "#D56B7A" : PRI, borderLeftWidth: 4 }}
              >
                {card.state === "running" && (
                  <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "rgba(184,160,200,.18)", overflow: "hidden" }}>
                    <div className="absolute inset-y-0 w-1/2" style={{ background: PRI, animation: "shimmerSlide 1.4s infinite linear" }} />
                  </div>
                )}
                <div className="flex items-start gap-3 p-4 pt-5">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{
                      background: card.state === "done" ? "#4CAA84" : card.state === "err" ? "#D56B7A" : PRI,
                      boxShadow: card.state === "running" ? `0 0 0 3px rgba(184,160,200,.25)` : undefined,
                      animation: card.state === "running" ? "ringPulse 1.5s infinite" : undefined,
                    }}
                  >
                    {card.state === "done" ? <CheckCircle2 className="h-4 w-4" /> : card.state === "err" ? <XCircle className="h-4 w-4" /> : card.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold text-[#4A3B5C]">{card.name}</div>
                    <div className="mt-0.5 text-[11px] text-[#9B8EAC]">{card.desc}</div>
                  </div>
                  <span
                    className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: card.state === "done" ? "rgba(76,170,132,.12)" : card.state === "err" ? "rgba(213,107,122,.12)" : "rgba(184,160,200,.15)",
                      color: card.state === "done" ? "#4CAA84" : card.state === "err" ? "#D56B7A" : PRI,
                    }}
                  >
                    {card.state}
                  </span>
                </div>
              </div>
            ))}
            {agentCards.length === 0 && (
              <div className="py-8 text-center text-[13px] text-[#9B8EAC]">
                <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" style={{ color: PRI }} />
                Initializing agents…
              </div>
            )}
          </div>
          {!runWorking && agentCards.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => gotoStage("clarify")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">← Clarify</button>
              <button onClick={() => gotoStage("report")} className="rounded-lg px-5 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>View Report →</button>
            </div>
          )}
        </Card>
      )}

      {/* ══════════════════════════════════════════════
           STAGE: REPORT
      ══════════════════════════════════════════════ */}
      {stage === "report" && (
        <Card>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-bold text-[#4A3B5C]">Saudi Fintech CTOs — 5 Leads</div>
              <div className="text-[11px] text-[#9B8EAC]">Generated · {reportShape === "exec" ? "Executive" : reportShape === "detail" ? "Detailed" : "Custom"} shape · {new Date().toLocaleTimeString()}</div>
            </div>
            <div className="flex gap-2">
              {["Save Template","Save Skill","Rerun"].map(a => (
                <button key={a} onClick={() => toast(a + "...")} className="rounded-lg border border-[#E2D8EA] px-3 py-1.5 text-[11px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">{a}</button>
              ))}
            </div>
          </div>
          {/* KPI row */}
          <div className="mb-4 grid grid-cols-4 gap-3">
            {[
              {v:"5",   l:"Leads found",   c:PRI},
              {v:"91%", l:"Verified email",c:TEAL},
              {v:"0.89",l:"Avg ICP score", c:GOLD},
              {v:"6",   l:"Sources cited", c:"#7B6E8D"},
            ].map(k => (
              <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-3 text-center">
                <div className="text-[18px] font-bold" style={{ color: k.c }}>{k.v}</div>
                <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
              </div>
            ))}
          </div>
          {/* Person table */}
          <div className="mb-4 overflow-x-auto rounded-xl border border-[#E8E2F0]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#E8E2F0] bg-[#FAFAF9]">
                  {["Name","Title","Company","Email","ICP","Source"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {n:"Sara Al-Otaibi",     t:"CTO",             c:"Lean Technologies",  e:"s.al-otaibi@lean.sa", icp:"0.94",src:"factory"},
                  {n:"Omar Al-Farhan",     t:"VP Engineering",  c:"Tamara",             e:"o.alfarhan@tamara.co",icp:"0.91",src:"prosengine"},
                  {n:"Layla Al-Harbi",     t:"Founder",         c:"Mod5r",              e:"layla@mod5r.com",     icp:"0.85",src:"masaar"},
                  {n:"Faisal Al-Noor",     t:"Head of Data",    c:"Foodics",            e:"f.alnoor@foodics.com",icp:"0.79",src:"signals"},
                  {n:"Ahmad Al-Dosari",    t:"VP Procurement",  c:"STC Group",          e:"a.aldosari@stc.com",  icp:"0.75",src:"ai chat"},
                ].map(row => (
                  <tr key={row.n} className="border-b border-[#F0EBF8] last:border-0 hover:bg-[#FAFAF9]">
                    <td className="px-3 py-2 font-bold text-[#4A3B5C]">{row.n}</td>
                    <td className="px-3 py-2 text-[#7B6E8D]">{row.t}</td>
                    <td className="px-3 py-2 text-[#4A3B5C]">{row.c}</td>
                    <td className="px-3 py-2 font-mono text-[10px] text-[#9B8EAC]">{row.e}</td>
                    <td className="px-3 py-2 font-bold" style={{ color: parseFloat(row.icp) >= 0.85 ? PRI : TEAL }}>{row.icp}</td>
                    <td className="px-3 py-2"><span className="rounded-full bg-[#F0EBF8] px-2 py-0.5 text-[10px] font-bold" style={{ color: PRI }}>{row.src}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* What next regen */}
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">What next?</div>
          <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {REGEN.map(r => (
              <button
                key={r.h}
                onClick={() => r.reset ? resetAll() : toast(r.h)}
                className="rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-2 text-left transition-all hover:border-[#B8A0C8]/40 hover:shadow-sm"
              >
                <div className="text-[11px] font-bold text-[#4A3B5C]">{r.h}</div>
                <div className="text-[10px] text-[#9B8EAC]">{r.t}</div>
              </button>
            ))}
          </div>
          {/* Mini-chat */}
          <div className="mb-4 flex items-center gap-3">
            <Toggle on={miniChatOpen} onClick={() => setMiniChatOpen(p => !p)} />
            <div>
              <span className="text-[12px] font-bold text-[#4A3B5C]">Chat with AI to adjust this report</span>
              <span className="ml-2 text-[10px] text-[#9B8EAC]">Live tweaks — no full rerun</span>
            </div>
          </div>
          {miniChatOpen && (
            <div className="mb-4 rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-3">
              <div className="mb-2 text-[11px] font-bold" style={{ color: PRI }}>AI Assistant</div>
              <div className="mb-3 rounded-lg bg-white p-3 text-[12px] text-[#4A3B5C]">I see you ran Lead Gen + Enrich on 5 fintechs. Want me to: add outreach drafts, expand to Series B+, or compare CTO tenures?</div>
              <div className="flex gap-2">
                <input
                  value={miniMsg}
                  onChange={e => setMiniMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { toast("AI adjusting report…"); setMiniMsg(""); } }}
                  placeholder="Ask me to adjust the report or enrichment…"
                  className="flex-1 rounded-lg border border-[#E2D8EA] bg-white px-3 py-1.5 text-[12px] focus:outline-none"
                />
                <button onClick={() => { toast("AI adjusting report…"); setMiniMsg(""); }} className="rounded-lg px-3 py-1.5 text-[12px] font-bold text-white" style={{ background: PRI }}>Send</button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button onClick={() => gotoStage("run")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">← Run</button>
            <button onClick={() => gotoStage("enrich")} className="rounded-lg px-5 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Continue: Enrich →</button>
          </div>
        </Card>
      )}

      {/* ══════════════════════════════════════════════
           STAGE: ENRICH
      ══════════════════════════════════════════════ */}
      {stage === "enrich" && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: TEAL }}>E</div>
            <div className="text-[13px] font-bold text-[#4A3B5C]">Enrich · Route</div>
          </div>
          {/* Sub-tabs */}
          <div className="mb-4 flex gap-0 overflow-hidden rounded-lg border border-[#E2D8EA]">
            {(["leads","companies"] as EnrichTab[]).map(t => (
              <button key={t} onClick={() => setEnrichTab(t)}
                className="flex-1 py-2 text-[12px] font-bold capitalize transition-all"
                style={enrichTab === t ? { background: TEAL, color: "#fff" } : { background: "#FAFAF9", color: "#7B6E8D" }}
              >{t === "leads" ? "Enrich Leads" : "Enrich Companies"}</button>
            ))}
          </div>

          {enrichTab === "leads" && (
            <>
              <div className="mb-3 rounded-lg bg-[#F5F1FA] p-3 text-[11px] text-[#7B6E8D]">
                Lead enrichment · endpoint POST /api/leads/enrich · gate dedup+validate+verify · email threshold ≥75 · halt on title conflict.
              </div>
              <div className="mb-3 grid grid-cols-4 gap-2">
                {ENRICH_LEAD.map(o => (
                  <button key={o.l} onClick={() => toggleLeadOpt(o.l)}
                    className="rounded-xl border p-2 text-left transition-all"
                    style={leadOpts.has(o.l) ? { borderColor: PRI, background: "rgba(184,160,200,.08)" } : { borderColor: "#E8E2F0" }}
                  >
                    <div className="text-[11px] font-bold text-[#4A3B5C]">{o.l}</div>
                    <div className="text-[10px] text-[#9B8EAC]">{o.d}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {enrichTab === "companies" && (
            <>
              <div className="mb-3 rounded-lg bg-[#F0F8F7] p-3 text-[11px] text-[#7B6E8D]">
                Company enrichment · endpoint POST /api/companies/enrich · gate CR-dedup + GLEIF cross-check · SAR conversion.
              </div>
              <div className="mb-3 grid grid-cols-4 gap-2">
                {ENRICH_CO.map(o => (
                  <button key={o.l} onClick={() => toggleCoOpt(o.l)}
                    className="rounded-xl border p-2 text-left transition-all"
                    style={coOpts.has(o.l) ? { borderColor: TEAL, background: "rgba(136,184,176,.08)" } : { borderColor: "#E8E2F0" }}
                  >
                    <div className="text-[11px] font-bold text-[#4A3B5C]">{o.l}</div>
                    <div className="text-[10px] text-[#9B8EAC]">{o.d}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Gate pills */}
          <div className="mb-4 flex items-center gap-2 text-[11px]">
            <span className="font-bold text-[#4A3B5C]">Gates:</span>
            {[{l:"pass",c:"#4CAA84"},{l:"unverified",c:GOLD},{l:"dup",c:"#D56B7A"},{l:"rejected",c:"#D56B7A"}].map(g => (
              <span key={g.l} className="rounded-full px-2.5 py-0.5 font-bold text-white text-[10px]" style={{ background: g.c }}>{g.l}</span>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => { toast("Enriching…"); setTimeout(() => setEnrichResult(enrichTab === "leads" ? "Done · 3 enriched · 2 flagged · 0 rejected" : "Done · 5 companies enriched · 1 conflict flagged"), 1800); }}
              className="rounded-lg px-4 py-2 text-[12px] font-bold text-white"
              style={{ background: TEAL }}
            >{enrichTab === "leads" ? "Apply Lead Enrichment" : "Apply Company Enrichment"}</button>
            <button onClick={() => toast("5 records pushed to CRM")} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: GOLD }}>
              {enrichTab === "leads" ? "Push to Leads DB" : "Push to Companies DB"}
            </button>
          </div>

          {enrichResult && (
            <div className="mb-4 rounded-lg border border-[#E8E2F0] bg-[#FAFAF9] p-3 text-[12px] text-[#4A3B5C]">{enrichResult}</div>
          )}

          {/* What next regen */}
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">What next?</div>
          <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {REGEN.map(r => (
              <button key={r.h} onClick={() => r.reset ? resetAll() : toast(r.h)}
                className="rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-2 text-left transition-all hover:border-[#B8A0C8]/40 hover:shadow-sm"
              >
                <div className="text-[11px] font-bold text-[#4A3B5C]">{r.h}</div>
                <div className="text-[10px] text-[#9B8EAC]">{r.t}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button onClick={() => gotoStage("report")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">← Report</button>
            <span className="text-[11px] text-[#9B8EAC]">Final stage</span>
          </div>
        </Card>
      )}

      {/* ── Toast ── */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-[13px] font-bold text-white shadow-lg" style={{ background: PRI }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
