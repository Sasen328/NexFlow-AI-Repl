
import { useState } from "react";

const ACCENT = "#B8A0C8";
const TEAL = "#88B8B0";
const GOLD = "#C8A880";

type EngineId = "masaar" | "masar" | "builder";

const ENGINES: { id: EngineId; label: string; badge: string; color: string; desc: string; stats: string }[] = [
  { id: "masaar", label: "Masaar Engine",  badge: "Doc 1",  color: GOLD,   desc: "Saudi CR intelligence · 7-agent SSE pipeline · MCI data", stats: "~10s · 7 agents" },
  { id: "masar",  label: "Masar Database", badge: "25 src", color: TEAL,   desc: "25-source agentic company harvest · live enrichment", stats: "~30s · 25 sources" },
  { id: "builder",label: "AI DB Builder",  badge: "15 src", color: ACCENT, desc: "15-source AI database builder · custom schema export", stats: "~45s · 15 sources" },
];

function EngineStatusBar({ active }: { active: EngineId }) {
  return (
    <div className="flex gap-2 mb-4 p-3 rounded-2xl border" style={{ borderColor: "#2a2a2a", background: "#0e0f14" }}>
      <div className="text-[10px] font-bold self-center mr-1" style={{ color: "#555" }}>POWERED BY</div>
      {ENGINES.map((e) => (
        <div
          key={e.id}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all"
          style={{
            borderColor: active === e.id ? `${e.color}60` : "#2a2a2a",
            background: active === e.id ? `${e.color}10` : "transparent",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: active === e.id ? e.color : "#333" }} />
          <span className="text-[10px] font-bold" style={{ color: active === e.id ? e.color : "#555" }}>{e.label}</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${e.color}15`, color: e.color }}>{e.badge}</span>
        </div>
      ))}
      <div className="ml-auto text-[10px] self-center px-2 py-1 rounded-lg border" style={{ borderColor: "#2a2a2a", color: "#555" }}>Configure →</div>
    </div>
  );
}

function ICPScannerPanel({ engineUsed }: { engineUsed: EngineId }) {
  const engine = ENGINES.find((e) => e.id === engineUsed)!;
  const companies = [
    { name: "Tamara", sector: "Fintech · BNPL", location: "Riyadh", dms: 4, score: 96, enriched: true },
    { name: "Foodics", sector: "SaaS · POS", location: "Riyadh", dms: 3, score: 91, enriched: true },
    { name: "Lean Technologies", sector: "Open Banking", location: "Riyadh", dms: 2, score: 88, enriched: true },
    { name: "Bupa Arabia", sector: "Insurance · Enterprise", location: "Jeddah", dms: 6, score: 83, enriched: false },
    { name: "stc pay", sector: "Fintech · Wallet", location: "Riyadh", dms: 5, score: 81, enriched: false },
  ];

  return (
    <div className="flex flex-col gap-4">
      <EngineStatusBar active={engineUsed} />

      {/* ICP form */}
      <div className="p-4 rounded-2xl border" style={{ borderColor: "#2a2a2a", background: "#0e0f14" }}>
        <div className="text-[11px] font-bold mb-3" style={{ color: ACCENT }}>DEFINE YOUR ICP TERRITORY</div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { label: "Industry", value: "SaaS · Fintech · E-Commerce" },
            { label: "Region", value: "Saudi Arabia · UAE" },
            { label: "Company size", value: "50–5,000 employees" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[9px] font-bold mb-1" style={{ color: "#555" }}>{label}</div>
              <div className="px-3 py-2 rounded-xl text-[11px]" style={{ background: "#1a1b22", border: "1px solid #2a2a2a", color: "#ccc" }}>{value}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px]" style={{ borderColor: `${TEAL}30`, background: `${TEAL}08`, color: TEAL }}>
            📡 Signals ON
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px]" style={{ borderColor: `${GOLD}30`, background: `${GOLD}08`, color: GOLD }}>
            🕸 Relationship ON
          </div>
          <button className="ml-auto px-5 py-2 rounded-xl text-[12px] font-bold" style={{ background: `linear-gradient(135deg, ${engine.color}DD, ${ACCENT}BB)`, color: "white" }}>
            Harvest AI → Scan Territory
          </button>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[13px] font-bold" style={{ color: "#ddd" }}>Results</span>
            <span className="text-[11px] ml-2" style={{ color: "#555" }}>127 companies matched · 3 DMs avg · via {engine.label}</span>
          </div>
          <div className="flex gap-2">
            <button className="text-[10px] px-3 py-1.5 rounded-xl font-bold" style={{ background: `${TEAL}15`, color: TEAL }}>Push all to Genome</button>
            <button className="text-[10px] px-3 py-1.5 rounded-xl font-bold" style={{ background: `${GOLD}15`, color: GOLD }}>Export CSV</button>
          </div>
        </div>
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#2a2a2a" }}>
          <div className="grid px-4 py-2 border-b text-[9px] font-bold" style={{ borderColor: "#2a2a2a", color: "#555", gridTemplateColumns: "1fr 120px 80px 60px 60px 80px" }}>
            <div>COMPANY</div><div>SECTOR</div><div>LOCATION</div><div>DMs</div><div>SCORE</div><div></div>
          </div>
          {companies.map((c) => (
            <div key={c.name} className="grid px-4 py-3 border-b items-center" style={{ borderColor: "#1a1a1a", gridTemplateColumns: "1fr 120px 80px 60px 60px 80px" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: `${ACCENT}15`, color: ACCENT }}>{c.name[0]}</div>
                <div>
                  <div className="text-[12px] font-semibold" style={{ color: "#ddd" }}>{c.name}</div>
                  {c.enriched && <div className="text-[9px]" style={{ color: TEAL }}>✓ Enriched</div>}
                </div>
              </div>
              <div className="text-[10px]" style={{ color: "#777" }}>{c.sector}</div>
              <div className="text-[10px]" style={{ color: "#666" }}>{c.location}</div>
              <div className="text-[11px]" style={{ color: "#aaa" }}>{c.dms} 👤</div>
              <div className="text-[12px] font-bold" style={{ color: c.score > 90 ? TEAL : c.score > 85 ? ACCENT : GOLD }}>{c.score}</div>
              <button className="text-[9px] px-2 py-1.5 rounded-lg font-bold" style={{ background: `${TEAL}15`, color: TEAL }}>Genome →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HarvestAI() {
  const [activeEngine, setActiveEngine] = useState<EngineId>("masaar");

  return (
    <div className="min-h-screen p-6" style={{ background: "#0e0f14", fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg" style={{ background: `${ACCENT}20` }}>🌾</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-bold" style={{ color: "#e2e2e2" }}>Lead Generation</h1>
              <span className="text-[11px] px-2.5 py-1 rounded-full font-bold" style={{ background: `${GOLD}20`, color: GOLD }}>Harvest AI</span>
            </div>
            <p className="text-[11px]" style={{ color: "#555" }}>ICP Territory Scanner powered by Masaar + Masar + AI Builder</p>
          </div>
          {/* Global toggles */}
          <div className="ml-auto flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: `${TEAL}40`, background: `${TEAL}10` }}>
              <div className="w-6 h-3 rounded-full" style={{ background: TEAL }} />
              <span className="text-[10px] font-bold" style={{ color: TEAL }}>Signals ON</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: `${GOLD}40`, background: `${GOLD}10` }}>
              <div className="w-6 h-3 rounded-full" style={{ background: GOLD }} />
              <span className="text-[10px] font-bold" style={{ color: GOLD }}>Relationship ON</span>
            </div>
          </div>
        </div>

        {/* Engine picker */}
        <div className="mb-4">
          <div className="text-[10px] font-bold mb-2" style={{ color: "#555" }}>SELECT ENGINE FOR THIS SCAN</div>
          <div className="grid grid-cols-3 gap-2">
            {ENGINES.map((e) => {
              const active = activeEngine === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setActiveEngine(e.id)}
                  className="p-3 rounded-2xl border text-left transition-all"
                  style={{
                    borderColor: active ? `${e.color}60` : "#2a2a2a",
                    background: active ? `${e.color}10` : "#0e0f14",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold" style={{ color: active ? e.color : "#888" }}>{e.label}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${e.color}20`, color: e.color }}>{e.badge}</span>
                  </div>
                  <div className="text-[9px]" style={{ color: "#555" }}>{e.stats}</div>
                </button>
              );
            })}
          </div>
        </div>

        <ICPScannerPanel engineUsed={activeEngine} />
      </div>
    </div>
  );
}
