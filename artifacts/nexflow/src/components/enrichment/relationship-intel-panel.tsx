import { useState } from "react";

const PRI  = "#B8A0C8";
const TEAL = "#88B8B0";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors" style={{ background: on ? PRI : "#D1C8DC" }}>
      <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ transform: on ? "translateX(20px)" : "translateX(2px)" }} />
    </button>
  );
}

const TREE_NODES = [
  { depth:0, name:"Tabby",                   pos:"$50M Series D · 2024",         selected:false, isCo:true },
  { depth:1, name:"Hosam Arab",               pos:"CEO · Co-founder",              selected:false },
  { depth:1, name:"Mohammed AlQasem",          pos:"CTO",                           selected:true  },
  { depth:2, name:"KFUPM alumni (8)",          pos:"past colleagues",               selected:false },
  { depth:2, name:"STC Pay alumni (4)",        pos:"previous employer",             selected:false },
  { depth:1, name:"Sequoia Capital MENA",      pos:"Lead investor · Board seat",    selected:false },
  { depth:1, name:"Mubadala Investment",       pos:"Investor · Series D",           selected:false },
  { depth:2, name:"Portfolio overlap: 6 fintechs", pos:"cross-referral opportunities", selected:false },
];

const ENGINES = [
  { name:"LinkedIn Network Mapper",  meta:"1st-3rd degree connections · alumni · board ties",        status:"Active", on:true  },
  { name:"Investment Graph",         meta:"VC → portfolio → co-investors",                            status:"Active", on:true  },
  { name:"Board & Advisor Tracker",  meta:"Board membership · advisory roles",                        status:"Active", on:true  },
  { name:"Alumni Network",           meta:"University · past employer co-workers",                    status:"Beta",   on:true  },
  { name:"Family Office Map",        meta:"GCC family office decision chains",                        status:"Beta",   on:false },
];

export function RelationshipIntelPanel() {
  const [engines, setEngines] = useState(ENGINES.map(e => ({ ...e })));
  const [searchTarget, setSearchTarget] = useState("Tabby");
  const [toast, setToast] = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const toggleEngine = (i: number) => setEngines(prev => prev.map((e, idx) => idx === i ? { ...e, on: !e.on } : e));

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {v:"12",   l:"Connection tiers",  c:PRI},
          {v:"268",  l:"Mapped contacts",   c:TEAL},
          {v:"5",    l:"Active engines",    c:"#4CAA84"},
          {v:"6",    l:"Fintech overlaps",  c:"#C8A880"},
        ].map(k => (
          <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
            <div className="text-[20px] font-bold" style={{ color: k.c }}>{k.v}</div>
            <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Target input */}
      <div className="flex gap-2">
        <input
          value={searchTarget}
          onChange={e => setSearchTarget(e.target.value)}
          placeholder="Company name, person name, or LinkedIn URL…"
          className="flex-1 rounded-xl border border-[#E2D8EA] bg-white px-4 py-2.5 text-[13px] text-[#4A3B5C] focus:outline-none focus:ring-1"
          style={{ "--tw-ring-color": PRI } as React.CSSProperties}
        />
        <button
          onClick={() => showToast("Mapping relationships for " + searchTarget + "…")}
          className="rounded-xl px-5 py-2.5 text-[13px] font-bold text-white"
          style={{ background: PRI }}
        >Map Relationships</button>
      </div>

      {/* Relationship tree */}
      <div className="rounded-xl border border-[#E8E2F0] bg-white">
        <div className="flex items-center gap-2 border-b border-[#E8E2F0] px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: PRI }}>T</div>
          <div>
            <div className="text-[13px] font-bold text-[#4A3B5C]">Relationship Tree — {searchTarget}</div>
            <div className="text-[11px] text-[#9B8EAC]">12 connection tiers mapped</div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-0.5">
            {TREE_NODES.map((node, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg px-2 py-2 transition-all hover:bg-[#F5F1FA]"
                style={{ paddingLeft: node.depth * 24 + 8 }}
              >
                {node.depth > 0 && (
                  <div className="flex items-center">
                    <div className="h-4 w-0 border-l border-[#D1C8DC]" />
                    <div className="h-0 w-3 border-t border-[#D1C8DC]" />
                  </div>
                )}
                {node.isCo ? (
                  <span className="text-[13px] font-bold" style={{ color: PRI }}>{node.name}</span>
                ) : (
                  <span className={`text-[12px] font-${node.selected ? "bold" : "medium"} ${node.selected ? "" : "text-[#4A3B5C]"}`} style={node.selected ? { color: PRI } : undefined}>{node.name}</span>
                )}
                <span className="text-[11px] text-[#9B8EAC]">· {node.pos}</span>
                {node.selected && (
                  <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "#4CAA84" }}>Selected</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => showToast("Tree expanded to 3rd degree")} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Expand to 3rd degree</button>
            <button onClick={() => showToast("Tree exported")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Export</button>
            <button onClick={() => showToast("Connections pushed to CRM")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Push connections</button>
          </div>
        </div>
      </div>

      {/* Relationship Engines */}
      <div className="rounded-xl border border-[#E8E2F0] bg-white">
        <div className="border-b border-[#E8E2F0] px-4 py-3 text-[13px] font-bold text-[#4A3B5C]">Relationship Engines</div>
        <div className="divide-y divide-[#F0EBF8]">
          {engines.map((e, i) => (
            <div key={e.name} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <div className="text-[12px] font-bold text-[#4A3B5C]">{e.name}</div>
                <div className="text-[11px] text-[#9B8EAC]">{e.meta}</div>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{ background: e.status === "Active" ? "rgba(76,170,132,.12)" : "rgba(200,168,128,.15)", color: e.status === "Active" ? "#4CAA84" : "#C8A880" }}
              >{e.status}</span>
              <Toggle on={e.on} onClick={() => toggleEngine(i)} />
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
