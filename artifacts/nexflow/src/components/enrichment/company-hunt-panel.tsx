import { useState } from "react";
import { cn } from "@/lib/utils";

const PRI  = "#B8A0C8";
const TEAL = "#88B8B0";

function Chip({ on, onClick, children }: { on?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <span
      onClick={onClick}
      className={cn("inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all", on ? "text-white" : "border border-[#E2D8EA] bg-white text-[#7B6E8D] hover:border-[#B8A0C8]/60")}
      style={on ? { background: TEAL } : undefined}
    >{children}</span>
  );
}

const PIPELINE_STEPS = [
  { n:1, name:"ICP Mapper & Source Orchestrator", desc:"Brief → prioritised sourcing plan" },
  { n:2, name:"Company Harvester", desc:"CR · GLEIF · OpenCorporates · Tadawul · Crunchbase · Wamda" },
  { n:3, name:"Deep Enrichment", desc:"Executives · financials · ownership · tech stack" },
  { n:4, name:"Signal Intelligence", desc:"Funding · hiring · regulatory · market news" },
  { n:5, name:"Validate & Deduplicate", desc:"CR cross-check · GLEIF LEI verification · dedup fingerprint" },
  { n:6, name:"ICP Scoring", desc:"Composite score · fit tier · signal strength" },
  { n:7, name:"Publish & Seed", desc:"Bridges into companies / leads / executives" },
];

export function CompanyHuntPanel() {
  const [industries, setIndustries] = useState(new Set(["Fintech","Banking"]));
  const [funding,    setFunding]    = useState(new Set(["Series A","Series B+"]));
  const [empSize,    setEmpSize]    = useState(new Set(["51-200","201-500"]));
  const [listing,    setListing]    = useState(new Set(["Any"]));
  const [countries,  setCountries]  = useState(new Set(["Saudi Arabia","UAE"]));
  const [signals,    setSignals]    = useState(new Set(["hiring_surge","funding_round"]));
  const [samaFilter, setSamaFilter] = useState("All");
  const [toast, setToast] = useState("");

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
        {[{v:"~312",l:"Est. matches"},{v:"100",l:"Target count"},{v:"$0",l:"Marginal cost"},{v:"~55s",l:"Est. run time"},{v:"CR+GLEIF",l:"Verified"},{v:"7",l:"Pipeline steps"}].map(k => (
          <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
            <div className="text-[17px] font-bold" style={{ color: TEAL }}>{k.v}</div>
            <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* LEFT: Filters */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-[#E8E2F0] bg-white">
            <div className="border-b border-[#E8E2F0] px-4 py-3 text-[12px] font-bold text-[#4A3B5C]">Filters — Company mode</div>

            {/* Company Profile */}
            <div className="border-b border-[#F0EBF8] px-4 py-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">Company Profile</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">Industry</div>
              <div className="mb-3">{chips(["Fintech","Banking","SaaS / Tech","Real Estate","Healthcare","Energy"],industries,setIndustries)}</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">Funding stage</div>
              <div className="mb-3">{chips(["Seed","Series A","Series B+","Listed","PE-owned","Family-owned"],funding,setFunding)}</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">Employees</div>
              <div className="mb-3">{chips(["1-10","11-50","51-200","201-500","500+"],empSize,setEmpSize)}</div>
              <div className="mb-2 text-[10px] font-bold text-[#7B6E8D]">SAMA / CMA</div>
              <div className="flex flex-wrap gap-1">
                {["All","SAMA licensed","CMA licensed","Unlicensed"].map(o => (
                  <Chip key={o} on={samaFilter === o} onClick={() => setSamaFilter(o)}>{o}</Chip>
                ))}
              </div>
            </div>

            {/* Listing */}
            <div className="border-b border-[#F0EBF8] px-4 py-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">Listing / Ownership</div>
              {chips(["Any","Tadawul main","Nomu","Private","VC-backed","State-owned"],listing,setListing)}
            </div>

            {/* Location */}
            <div className="border-b border-[#F0EBF8] px-4 py-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">Location</div>
              {chips(["Saudi Arabia","UAE","Kuwait","Qatar","Bahrain","Oman"],countries,setCountries)}
            </div>

            {/* Buying Signals */}
            <div className="px-4 py-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9B8EAC]">Buying Signals</div>
              {chips(["hiring_surge","funding_round","expansion","cr_filing","exec_change"],signals,setSignals)}
            </div>
          </div>

          <button
            onClick={() => showToast("Company Hunt running · CR + GLEIF + 40+ sources…")}
            className="w-full rounded-xl py-3 text-[13px] font-bold text-white shadow transition-transform active:scale-95"
            style={{ background: TEAL }}
          >Run Company Hunt →</button>
        </div>

        {/* RIGHT: Pipeline Preview */}
        <div className="rounded-xl border border-[#E8E2F0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E2F0] px-4 py-3">
            <div>
              <span className="text-[12px] font-bold text-[#4A3B5C]">Run · job co-77</span>
              <span className="ml-2 rounded-full bg-[#EDF7F6] px-2 py-0.5 text-[10px] font-bold" style={{ color: TEAL }}>preview</span>
            </div>
            <span className="text-[11px] text-[#9B8EAC]">est. ~55 s</span>
          </div>
          <div className="grid grid-cols-3 gap-3 border-b border-[#E8E2F0] p-4">
            {[{v:"~312",l:"Est. Matches"},{v:"100",l:"Target Count"},{v:"$0",l:"Marginal Cost"}].map(k => (
              <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-3 text-center">
                <div className="text-[20px] font-bold" style={{ color: TEAL }}>{k.v}</div>
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
                  className="flex items-center gap-3 rounded-xl border border-[#F0F8F7] bg-[#FAFAF9] p-3 text-left transition-all hover:border-[#88B8B0]/40 hover:shadow-sm"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: TEAL }}>{s.n}</span>
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
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-[13px] font-bold text-white shadow-lg" style={{ background: TEAL }}>{toast}</div>
      )}
    </div>
  );
}
