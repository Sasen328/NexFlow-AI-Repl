import { useState } from "react";
import { cn } from "@/lib/utils";

const PRI  = "#B8A0C8";
const TEAL = "#88B8B0";
const GOLD = "#C8A880";

function Chip({ on, onClick, children }: { on?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <span
      onClick={onClick}
      className={cn("inline-flex cursor-pointer select-none items-center rounded-full px-2.5 py-[3px] text-[11px] font-semibold transition-all", on ? "text-white" : "border border-[#E2D8EA] bg-white text-[#7B6E8D] hover:border-[#B8A0C8]/60")}
      style={on ? { background: PRI } : undefined}
    >{children}</span>
  );
}

export function ICPScannerPanel() {
  const [industries, setIndustries] = useState(new Set(["Fintech"]));
  const [sizes,      setSizes]      = useState(new Set(["51-200","201-500"]));
  const [funding,    setFunding]    = useState(new Set(["Seed+"]));
  const [territories,setTerritories]= useState(new Set(["Saudi Arabia"]));
  const [scanning,   setScanning]   = useState(false);
  const [scanDone,   setScanDone]   = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, val: string) => {
    const n = new Set(set); n.has(val) ? n.delete(val) : n.add(val); setFn(n);
  };

  const chips = (items: string[], active: Set<string>, setFn: (s: Set<string>) => void) =>
    <div className="flex flex-wrap gap-1">{items.map(i => <Chip key={i} on={active.has(i)} onClick={() => toggle(active, setFn, i)}>{i}</Chip>)}</div>;

  const runScan = () => {
    setScanning(true);
    setScanDone(false);
    setTimeout(() => { setScanning(false); setScanDone(true); }, 2200);
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {[
          {v:"4,218",  l:"Companies in ICP",  c:PRI },
          {v:"12,847", l:"Contacts matched",  c:TEAL},
          {v:"87%",    l:"ICP fit score",     c:"#4CAA84"},
          {v:"KSA",    l:"Top territory",     c:GOLD},
          {v:"A+",     l:"Avg tier",          c:PRI },
        ].map(k => (
          <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
            <div className="text-[20px] font-bold" style={{ color: k.c }}>{k.v}</div>
            <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Define ICP card */}
      <div className="rounded-xl border border-[#E8E2F0] bg-white">
        <div className="flex items-center gap-2 border-b border-[#E8E2F0] px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: PRI }}>I</div>
          <div className="text-[13px] font-bold text-[#4A3B5C]">Define ICP</div>
        </div>
        <div className="p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Target industry</div>
              {chips(["Fintech","Banking","SaaS","Real Estate","Healthcare","Energy"],industries,setIndustries)}
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Company size</div>
              {chips(["1-50","51-200","201-500","500+"],sizes,setSizes)}
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Funding required</div>
              {chips(["Any","Seed+","Series A+","Series B+","Listed"],funding,setFunding)}
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Territory</div>
              {chips(["Saudi Arabia","UAE","Kuwait","Qatar","Bahrain","GCC (all)"],territories,setTerritories)}
            </div>
          </div>

          {/* Advanced filters */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">License (SAMA/CMA)</div>
              {chips(["Any","SAMA","CMA","ADGM","Unlicensed"],new Set(["Any"]), () => {})}
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Founded after</div>
              {chips(["Any","2022","2020","2018","2015"],new Set(["Any"]), () => {})}
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">Ownership type</div>
              {chips(["Any","Founder-led","VC-backed","PE","State"],new Set(["Any"]), () => {})}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-[11px] text-[#9B8EAC]">
              AI matches company profiles against your ICP criteria across CR, Crunchbase, Wamda, and SAMA.
            </div>
            <button
              onClick={runScan}
              disabled={scanning}
              className="ml-4 flex-shrink-0 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white shadow transition-transform active:scale-95 disabled:opacity-70"
              style={{ background: scanning ? "#9B8EAC" : PRI }}
            >
              {scanning ? "Scanning…" : "Run ICP Scan"}
            </button>
          </div>
        </div>
      </div>

      {/* Scan results */}
      {scanDone && (
        <div className="rounded-xl border border-[#E8E2F0] bg-white">
          <div className="flex items-center justify-between border-b border-[#E8E2F0] px-4 py-3">
            <div>
              <div className="text-[13px] font-bold text-[#4A3B5C]">Scan Results</div>
              <div className="text-[11px] text-[#9B8EAC]">4,218 companies matched · 12,847 contacts</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => showToast("Exported")} className="rounded-lg border border-[#E2D8EA] px-3 py-1.5 text-[11px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Export CSV</button>
              <button onClick={() => showToast("Pushed to Person Hunt")} className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: TEAL }}>Push to Hunt</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[#E8E2F0] bg-[#FAFAF9]">
                  {["Company","Sector","Territory","Funding","ICP Tier","Signals"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[#9B8EAC]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {c:"Tabby Digital Finance",   s:"Fintech",        t:"Riyadh",  f:"Series D",  tier:"A+", sig:"9 hiring"},
                  {c:"Lean Technologies",       s:"Fintech",        t:"Riyadh",  f:"Series B",  tier:"A+", sig:"Series B"},
                  {c:"Hala Digital Payments",   s:"Fintech",        t:"Riyadh",  f:"Series A",  tier:"A",  sig:"SAMA OK"},
                  {c:"Tamara Technology",       s:"Fintech",        t:"Riyadh",  f:"Series C",  tier:"A+", sig:"Expansion"},
                  {c:"NymCard",                 s:"FinTech",        t:"Abu Dhabi",f:"Series A", tier:"A",  sig:"ADGM OK"},
                ].map(row => (
                  <tr key={row.c} className="border-b border-[#F0EBF8] last:border-0 hover:bg-[#FAFAF9]">
                    <td className="px-3 py-2 font-bold text-[#4A3B5C]">{row.c}</td>
                    <td className="px-3 py-2 text-[#7B6E8D]">{row.s}</td>
                    <td className="px-3 py-2 text-[#7B6E8D]">{row.t}</td>
                    <td className="px-3 py-2 text-[#7B6E8D]">{row.f}</td>
                    <td className="px-3 py-2"><span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: PRI }}>{row.tier}</span></td>
                    <td className="px-3 py-2"><span className="rounded-full bg-[#EDF7F6] px-2.5 py-0.5 text-[10px] font-bold" style={{ color: TEAL }}>{row.sig}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ICP scoring methodology */}
      <div className="rounded-xl border border-[#E8E2F0] bg-white p-4">
        <div className="mb-3 text-[13px] font-bold text-[#4A3B5C]">ICP Scoring Methodology</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {tier:"A+", desc:"≥0.90 composite · hiring + funding signal · SAMA-licensed · 50–500 emp",   color:PRI},
            {tier:"A",  desc:"0.75–0.89 · at least 2 signals · matches 3/4 core criteria",               color:TEAL},
            {tier:"B",  desc:"0.60–0.74 · partial match · worth monitoring",                             color:GOLD},
          ].map(t => (
            <div key={t.tier} className="rounded-xl border border-[#E8E2F0] bg-[#FAFAF9] p-3">
              <span className="mb-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: t.color }}>{t.tier}</span>
              <div className="text-[11px] text-[#7B6E8D]">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-[13px] font-bold text-white shadow-lg" style={{ background: PRI }}>{toast}</div>
      )}
    </div>
  );
}
