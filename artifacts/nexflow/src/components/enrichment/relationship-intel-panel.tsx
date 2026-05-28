import { useState } from "react";

const PRI   = "#B8A0C8";
const TEAL  = "#88B8B0";
const GOLD  = "#C8A880";
const GREEN = "#4CAA84";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors" style={{ background: on ? PRI : "#D1C8DC" }}>
      <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ transform: on ? "translateX(20px)" : "translateX(2px)" }} />
    </button>
  );
}

// ── Tree data ──────────────────────────────────────────────────────────────
interface TNode {
  id: string; x: number; y: number; r: number;
  label: string; sub: string; initials: string;
  color: string; highlight?: boolean; badge?: string;
  parent?: string;
}

const TREE_NODES: TNode[] = [
  // Root
  { id:"root", x:460, y:62,  r:34, label:"Tabby",               sub:"$50M Series D · KSA",       initials:"TB", color:PRI,        badge:"Root" },
  // Level 1 — first-degree
  { id:"n1",   x:110, y:190, r:24, label:"Hosam Arab",          sub:"CEO · Co-founder",           initials:"HA", color:"#7B6E8D",  parent:"root" },
  { id:"n2",   x:310, y:190, r:24, label:"Mohammed AlQasem",    sub:"CTO",                        initials:"MA", color:GREEN,      highlight:true, badge:"Warm", parent:"root" },
  { id:"n3",   x:570, y:190, r:24, label:"Sequoia MENA",        sub:"Lead Investor · Board",      initials:"SQ", color:TEAL,       parent:"root" },
  { id:"n4",   x:810, y:190, r:24, label:"Mubadala",            sub:"Series D · Abu Dhabi",       initials:"MB", color:GOLD,       parent:"root" },
  // Level 2 — second-degree
  { id:"n11",  x:50,  y:338, r:17, label:"KFUPM Alumni",        sub:"8 shared connections",       initials:"KA", color:"#9B8EAC",  parent:"n1" },
  { id:"n12",  x:172, y:338, r:17, label:"ex-Careem",           sub:"3 connections",              initials:"CR", color:"#9B8EAC",  parent:"n1" },
  { id:"n21",  x:267, y:338, r:17, label:"STC Pay Alumni",      sub:"4 connections",              initials:"SP", color:GREEN,      highlight:true, parent:"n2" },
  { id:"n22",  x:368, y:338, r:17, label:"KFUPM Batch '09",     sub:"8 connections",              initials:"K9", color:"#9B8EAC",  parent:"n2" },
  { id:"n31",  x:490, y:338, r:17, label:"Foodics",             sub:"Portfolio · POS",            initials:"FD", color:TEAL,       parent:"n3" },
  { id:"n32",  x:580, y:338, r:17, label:"Hala",                sub:"Portfolio · Payments",       initials:"HL", color:TEAL,       parent:"n3" },
  { id:"n33",  x:670, y:338, r:17, label:"Lean Technologies",   sub:"Portfolio · Open Banking",   initials:"LT", color:TEAL,       parent:"n3" },
  { id:"n41",  x:770, y:338, r:17, label:"Fintech Portfolio",   sub:"6 overlap companies",        initials:"FP", color:GOLD,       parent:"n4" },
  { id:"n42",  x:868, y:338, r:17, label:"Board Seat",          sub:"Mubadala representative",    initials:"BS", color:GOLD,       parent:"n4" },
];

const ENGINES = [
  { name:"LinkedIn Network Mapper",  meta:"1st-3rd degree connections · alumni · board ties",        status:"Active", on:true  },
  { name:"Investment Graph",         meta:"VC → portfolio → co-investors",                            status:"Active", on:true  },
  { name:"Board & Advisor Tracker",  meta:"Board membership · advisory roles",                       status:"Active", on:true  },
  { name:"Alumni Network",           meta:"University · past employer co-workers",                    status:"Beta",   on:true  },
  { name:"Family Office Map",        meta:"GCC family office decision chains",                        status:"Beta",   on:false },
];

const ENRICHMENT_STEPS = [
  { step:1, label:"LinkedIn Scout",    desc:"Profile + connections mapped",          status:"done",    nodes:4 },
  { step:2, label:"Alumni Graph",      desc:"University + employer overlap found",   status:"done",    nodes:12 },
  { step:3, label:"Investment Graph",  desc:"VC portfolio → co-investor chains",     status:"running", nodes:3 },
  { step:4, label:"Board Tracker",     desc:"Pending board cross-reference",         status:"pending", nodes:0 },
  { step:5, label:"Family Office Map", desc:"Pending GCC family office lookup",      status:"pending", nodes:0 },
];

export function RelationshipIntelPanel() {
  const [engines, setEngines]         = useState(ENGINES.map(e => ({ ...e })));
  const [searchTarget, setSearchTarget] = useState("Tabby");
  const [hoveredId, setHoveredId]     = useState<string | null>(null);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [toast, setToast]             = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2800); };
  const toggleEngine = (i: number) => setEngines(prev => prev.map((e, idx) => idx === i ? { ...e, on: !e.on } : e));

  const nodeMap = Object.fromEntries(TREE_NODES.map(n => [n.id, n]));
  const edges = TREE_NODES.filter(n => n.parent).map(n => ({ from: nodeMap[n.parent!], to: n }));

  const selected = selectedId ? nodeMap[selectedId] : null;

  return (
    <div className="flex flex-col gap-4 pb-6">

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { v:"3",   l:"Degrees mapped",    c:PRI  },
          { v:"268", l:"Mapped contacts",   c:TEAL },
          { v:"5",   l:"Active engines",    c:GREEN },
          { v:"6",   l:"Portfolio overlaps",c:GOLD },
        ].map(k => (
          <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
            <div className="text-[20px] font-bold" style={{ color: k.c }}>{k.v}</div>
            <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
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

      {/* ── SVG Tree card ── */}
      <div className="rounded-xl border border-[#E8E2F0] bg-white overflow-hidden">
        {/* header */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2F0] px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: PRI }}>T</div>
          <div>
            <div className="text-[13px] font-bold text-[#4A3B5C]">Relationship Tree — {searchTarget}</div>
            <div className="text-[11px] text-[#9B8EAC]">3 degrees mapped · 268 connections · 14 nodes</div>
          </div>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {[
              { label:"Root",    color:PRI   },
              { label:"Warm Lead",color:GREEN },
              { label:"Investor", color:TEAL  },
              { label:"Alumni",   color:GOLD  },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: l.color + "18", color: l.color }}>
                ● {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* SVG */}
        <div className="overflow-x-auto bg-[#FAFAF9]">
          <svg width={940} height={420} style={{ minWidth: 940, display: "block" }}>
            <defs>
              <pattern id="rg" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#E8E2F0" strokeWidth="0.5" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width="940" height="420" fill="url(#rg)" />

            {/* Edges */}
            {edges.map(({ from: f, to: t }) => {
              const midY = (f.y + t.y) / 2;
              const isHot  = t.highlight;
              const isHov  = hoveredId === t.id || hoveredId === f.id || selectedId === t.id || selectedId === f.id;
              return (
                <path
                  key={`${f.id}-${t.id}`}
                  d={`M${f.x},${f.y + f.r} C${f.x},${midY} ${t.x},${midY} ${t.x},${t.y - t.r}`}
                  fill="none"
                  stroke={isHov ? t.color : isHot ? t.color + "88" : "#D1C8DC"}
                  strokeWidth={isHov ? 2.5 : isHot ? 1.8 : 1}
                  strokeDasharray={isHot && !isHov ? "4 2" : undefined}
                  style={{ transition: "stroke 0.15s, stroke-width 0.15s" }}
                />
              );
            })}

            {/* Nodes */}
            {TREE_NODES.map(n => {
              const isHov = hoveredId === n.id;
              const isSel = selectedId === n.id;
              const fillInner = n.highlight ? n.color : "#fff";
              return (
                <g key={n.id} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredId(n.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId(isSel ? null : n.id)}
                >
                  {/* outer glow ring */}
                  <circle cx={n.x} cy={n.y} r={n.r + 10} fill={n.color}
                    opacity={isSel ? 0.18 : isHov ? 0.12 : 0.04}
                    style={{ transition: "opacity 0.15s" }} />
                  {/* selection ring */}
                  {isSel && <circle cx={n.x} cy={n.y} r={n.r + 5} fill="none" stroke={n.color} strokeWidth={1.5} strokeDasharray="3 2" />}
                  {/* main circle */}
                  <circle cx={n.x} cy={n.y} r={n.r}
                    fill={fillInner}
                    stroke={n.color}
                    strokeWidth={n.highlight ? 0 : 2}
                    filter={isHov || isSel ? "url(#glow)" : undefined}
                    style={{ transition: "all 0.15s" }}
                  />
                  {/* initials */}
                  <text x={n.x} y={n.y + 4} textAnchor="middle"
                    fill={n.highlight ? "#fff" : n.color}
                    fontSize={n.r > 20 ? 13 : 10} fontWeight="bold" fontFamily="system-ui, -apple-system">
                    {n.initials}
                  </text>
                  {/* badge */}
                  {n.badge && (
                    <g>
                      <rect x={n.x - 24} y={n.y - n.r - 19} width={48} height={13} rx={6.5}
                        fill={n.color} opacity={0.93} />
                      <text x={n.x} y={n.y - n.r - 9} textAnchor="middle"
                        fill="#fff" fontSize={8} fontWeight="bold" fontFamily="system-ui">{n.badge}</text>
                    </g>
                  )}
                  {/* label */}
                  <text x={n.x} y={n.y + n.r + 14} textAnchor="middle"
                    fill={isSel ? n.color : "#4A3B5C"}
                    fontSize={10} fontWeight="600" fontFamily="system-ui">
                    {n.label.length > 15 ? n.label.slice(0, 14) + "…" : n.label}
                  </text>
                  <text x={n.x} y={n.y + n.r + 25} textAnchor="middle"
                    fill="#9B8EAC" fontSize={8.5} fontFamily="system-ui">
                    {n.sub.length > 20 ? n.sub.slice(0, 19) + "…" : n.sub}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected node detail strip */}
        {selected && (
          <div className="border-t border-[#F0EBF8] px-4 py-3 flex items-center gap-3"
            style={{ background: selected.color + "08" }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold text-white flex-shrink-0"
              style={{ background: selected.color }}>{selected.initials}</div>
            <div className="flex-1">
              <div className="text-[13px] font-bold" style={{ color: selected.color }}>{selected.label}</div>
              <div className="text-[11px] text-[#9B8EAC]">{selected.sub}</div>
            </div>
            <button onClick={() => showToast("Enriching " + selected.label + "…")}
              className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-white"
              style={{ background: selected.color }}>Enrich</button>
            <button onClick={() => showToast("Pushed to CRM")}
              className="rounded-lg border border-[#E2D8EA] px-3 py-1.5 text-[11px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Push to CRM</button>
            <button onClick={() => setSelectedId(null)}
              className="rounded-lg border border-[#E2D8EA] px-2 py-1.5 text-[11px] font-bold text-[#9B8EAC] hover:bg-[#F5F1FA]">✕</button>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-[#F0EBF8] p-4">
          <button onClick={() => showToast("Tree expanded to 4th degree")} className="rounded-lg px-4 py-2 text-[12px] font-bold text-white" style={{ background: PRI }}>Expand to 4th degree</button>
          <button onClick={() => showToast("Tree exported as PNG")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Export PNG</button>
          <button onClick={() => showToast("Connections pushed to CRM")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Push connections</button>
          <button onClick={() => showToast("Signal watch activated")} className="rounded-lg border border-[#E2D8EA] px-4 py-2 text-[12px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">Watch signals</button>
        </div>
      </div>

      {/* ── Enrichment pipeline steps ── */}
      <div className="rounded-xl border border-[#E8E2F0] bg-white">
        <div className="border-b border-[#E8E2F0] px-4 py-3 text-[13px] font-bold text-[#4A3B5C]">Enrichment Pipeline</div>
        <div className="divide-y divide-[#F0EBF8]">
          {ENRICHMENT_STEPS.map(s => (
            <div key={s.step} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  background: s.status === "done" ? GREEN + "18" : s.status === "running" ? PRI + "18" : "#F0EBF8",
                  color: s.status === "done" ? GREEN : s.status === "running" ? PRI : "#9B8EAC",
                }}>
                {s.status === "done" ? "✓" : s.status === "running" ? "…" : s.step}
              </div>
              <div className="flex-1">
                <div className="text-[12px] font-bold text-[#4A3B5C]">{s.label}</div>
                <div className="text-[11px] text-[#9B8EAC]">{s.desc}</div>
              </div>
              {s.nodes > 0 && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: s.status === "done" ? GREEN+"18" : PRI+"18", color: s.status === "done" ? GREEN : PRI }}>
                  +{s.nodes} nodes
                </span>
              )}
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
                style={{
                  background: s.status === "done" ? GREEN+"18" : s.status === "running" ? PRI+"18" : "#F0EBF8",
                  color: s.status === "done" ? GREEN : s.status === "running" ? PRI : "#9B8EAC",
                }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Relationship Engines ── */}
      <div className="rounded-xl border border-[#E8E2F0] bg-white">
        <div className="border-b border-[#E8E2F0] px-4 py-3 text-[13px] font-bold text-[#4A3B5C]">Relationship Engines</div>
        <div className="divide-y divide-[#F0EBF8]">
          {engines.map((e, i) => (
            <div key={e.name} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <div className="text-[12px] font-bold text-[#4A3B5C]">{e.name}</div>
                <div className="text-[11px] text-[#9B8EAC]">{e.meta}</div>
              </div>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{ background: e.status === "Active" ? GREEN+"18" : GOLD+"18", color: e.status === "Active" ? GREEN : GOLD }}>
                {e.status}
              </span>
              <Toggle on={e.on} onClick={() => toggleEngine(i)} />
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-[13px] font-bold text-white shadow-lg"
          style={{ background: PRI }}>{toast}</div>
      )}
    </div>
  );
}
