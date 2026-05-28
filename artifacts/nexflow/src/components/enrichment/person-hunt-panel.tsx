import { useState } from "react";
import { cn } from "@/lib/utils";

const PRI  = "#B8A0C8";
const TEAL = "#88B8B0";

function Chip({ on, onClick, children }: { on?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <span
      onClick={onClick}
      className={cn("inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all", on ? "text-white" : "border border-[#E2D8EA] bg-white text-[#7B6E8D] hover:border-[#B8A0C8]/60")}
      style={on ? { background: PRI } : undefined}
    >{children}</span>
  );
}

const PIPELINE_STEPS = [
  { n:1, name:"ICP Mapper & Source Orchestrator", desc:"Brief → prioritised sourcing plan" },
  { n:2, name:"Lead Harvester", desc:"40+ free sources · Tavily · SearXNG · Google News · Saudi RSS" },
  { n:3, name:"Deep Enrichment", desc:"Scout · GLEIF · OpenCorporates · Wikidata · Gemini" },
  { n:4, name:"Signal Intelligence", desc:"News · sanctions · regulatory · hiring · contracts" },
  { n:5, name:"Validate, Verify & Deduplicate", desc:"MX · domain liveness · dummy detection · fingerprint dedup" },
  { n:6, name:"ICP Scoring & AI Copywriter", desc:"Composite score · email · LinkedIn · WhatsApp" },
  { n:7, name:"Publish & Seed", desc:"Bridges into companies / leads / executives" },
];

export function PersonHuntPanel() {
  const [titles,    setTitles]    = useState("CTO, VP Engineering, Head of Engineering");
  const [seniority, setSeniority] = useState(new Set(["c_level","vp"]));
  const [depts,     setDepts]     = useState(new Set(["engineering"]));
  const [langs,     setLangs]     = useState(new Set(["Arabic","English"]));
  const [industries,setIndustries]= useState(new Set(["Technology"]));
  const [empSize,   setEmpSize]   = useState(new Set(["11-50","51-200"]));
  const [cities,    setCities]    = useState(new Set(["Riyadh"]));
  const [signals,   setSignals]   = useState(new Set(["hiring_surge","funding_round"]));
  const [toast,     setToast]     = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, val: string) => {
    const n = new Set(set); n.has(val) ? n.delete(val) : n.add(val); setFn(n);
  };

  const chips = (items: string[], active: Set<string>, setFn: (s: Set<string>) => void) =>
    <div className="flex flex-wrap gap-1">{items.map(i => <Chip key={i} on={active.has(i)} onClick={() => toggle(active, setFn, i)}>{i}</Chip>)}</div>;

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[{v:"~84",l:"Est. matches"},{v:"50",l:"Target count"},{v:"$0",l:"Marginal cost"},{v:"~45s",l:"Est. run time"},{v:"40+",l:"Sources"},{v:"7",l:"Pipeline steps"}].map(k => (
          <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
            <div className="text-[17px] font-bold" style={{ color: PRI }}>{k.v}</div>
            <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* LEFT: Filters */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-[#E8E2F0] bg-white">
            <div className="border-b border-[#E8E2F0] px-4 py-3 text-[12px] font-bold text-[#4A3B5C]">Filters — Person mode</div>

            {/* Person Identity */}
            <div className="border-b border-[#F0EBF8] px-4 py-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">Person Identity</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">Target titles</div>
              <input value={titles} onChange={e => setTitles(e.target.value)} placeholder="CTO, VP Engineering…" className="mb-3 w-full rounded-lg border border-[#E2D8EA] bg-[#FAFAF9] px-3 py-2 text-[12px] focus:outline-none" />
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">Seniority</div>
              <div className="mb-3">{chips(["c_level","vp","director","manager","ic"],seniority,setSeniority)}</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">Department</div>
              <div className="mb-3">{chips(["engineering","product","it","finance","operations"],depts,setDepts)}</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">Languages</div>
              {chips(["Arabic","English","Hindi","French"],langs,setLangs)}
            </div>

            {/* Firmographics */}
            <div className="border-b border-[#F0EBF8] px-4 py-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">Firmographics</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">Industry</div>
              <div className="mb-3">{chips(["Technology","Financial Services","Healthcare","Real Estate","Energy"],industries,setIndustries)}</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">Employees</div>
              {chips(["1-10","11-50","51-200","201-500","500+"],empSize,setEmpSize)}
            </div>

            {/* Location */}
            <div className="border-b border-[#F0EBF8] px-4 py-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">Location</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">City</div>
              {chips(["Riyadh","Jeddah","Dammam","Abu Dhabi","Dubai","Kuwait City"],cities,setCities)}
            </div>

            {/* Buying Signals */}
            <div className="px-4 py-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">Buying Signals</div>
              {chips(["hiring_surge","funding_round","expansion","executive_change","cr_filing"],signals,setSignals)}
            </div>
          </div>

          <button
            onClick={() => showToast("Person Hunt running · 40+ sources…")}
            className="w-full rounded-xl py-3 text-[13px] font-bold text-white shadow transition-transform active:scale-95"
            style={{ background: PRI }}
          >Run Person Hunt →</button>
        </div>

        {/* RIGHT: Pipeline Preview */}
        <div className="rounded-xl border border-[#E8E2F0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E2F0] px-4 py-3">
            <div>
              <span className="text-[12px] font-bold text-[#4A3B5C]">Run · job 1f-42</span>
              <span className="ml-2 rounded-full bg-[#F0EBF8] px-2 py-0.5 text-[10px] font-bold" style={{ color: PRI }}>preview</span>
            </div>
            <span className="text-[11px] text-[#9B8EAC]">est. ~45 s</span>
          </div>
          <div className="grid grid-cols-3 gap-3 border-b border-[#E8E2F0] p-4">
            {[{v:"~84",l:"Est. Matches"},{v:"50",l:"Target Count"},{v:"$0",l:"Marginal Cost"}].map(k => (
              <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-3 text-center">
                <div className="text-[20px] font-bold" style={{ color: PRI }}>{k.v}</div>
                <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
              </div>
            ))}
          </div>
          <div className="p-4">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">Pipeline Steps</div>
            <div className="flex flex-col gap-2">
              {PIPELINE_STEPS.map(s => (
                <button
                  key={s.n}
                  onClick={() => showToast(s.name + ": " + s.desc)}
                  className="flex items-center gap-3 rounded-xl border border-[#F0EBF8] bg-[#FAFAF9] p-3 text-left transition-all hover:border-[#B8A0C8]/40 hover:shadow-sm"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: PRI }}>{s.n}</span>
                  <div>
                    <div className="text-[12px] font-bold text-[#4A3B5C]">{s.name}</div>
                    <div className="text-[10px] text-[#9B8EAC]">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-[13px] font-bold text-white shadow-lg" style={{ background: PRI }}>{toast}</div>
      )}
    </div>
  );
}
