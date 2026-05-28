
import { useState } from "react";

const ACCENT = "#B8A0C8";
const TEAL = "#88B8B0";
const GOLD = "#C8A880";

type Toggle = "signals" | "relationship";

const SIGNAL_SOURCES = [
  { name: "LinkedIn Jobs", tier: "primary", status: "active", country: "GCC" },
  { name: "X / Twitter", tier: "primary", status: "active", country: "GCC" },
  { name: "Wamda", tier: "secondary", status: "active", country: "MENA" },
  { name: "MoCI (Saudi)", tier: "primary", status: "active", country: "KSA" },
  { name: "PR Newswire", tier: "secondary", status: "active", country: "Global" },
  { name: "Reuters Arabia", tier: "secondary", status: "degraded", country: "MENA" },
  { name: "Argaam", tier: "primary", status: "active", country: "KSA" },
  { name: "Custom RSS", tier: "secondary", status: "active", country: "Custom" },
];

const REL_ENGINES = [
  { name: "Sherlock", role: "Username/profile discovery across 300+ social sites", status: "active", color: TEAL },
  { name: "TheHarvester", role: "Email + subdomain + employee discovery", status: "active", color: ACCENT },
  { name: "Network Graph", role: "Visual relationship map overlay on profiles", status: "active", color: GOLD },
  { name: "Apollo Contacts", role: "Verified email + phone enrichment layer", status: "active", color: "#8898C8" },
];

function Toggle({ on, color, onToggle }: { on: boolean; color: string; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all"
      style={{ background: on ? color : "#2a2a2a" }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full transition-all"
        style={{ background: on ? "white" : "#555", left: on ? 24 : 4 }}
      />
    </button>
  );
}

export function Toggles() {
  const [signals, setSignals] = useState(true);
  const [relationship, setRelationship] = useState(true);
  const [expanded, setExpanded] = useState<Toggle | null>("signals");

  return (
    <div className="min-h-screen p-6" style={{ background: "#0e0f14", fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-[17px] font-bold mb-1" style={{ color: "#e2e2e2" }}>Global Enrichment Toggles</h1>
          <p className="text-[12px]" style={{ color: "#555" }}>These controls appear in the header bar across every enrichment tab when enabled</p>
        </div>

        {/* ─── How they appear in the top bar ─── */}
        <div className="mb-6 p-4 rounded-2xl border" style={{ borderColor: "#2a2a2a", background: "#0e0f14" }}>
          <div className="text-[10px] font-bold mb-3" style={{ color: "#444" }}>PREVIEW — appears in every enrichment page header</div>
          <div className="p-3 rounded-xl border flex items-center justify-between" style={{ borderColor: "#2a2a2a", background: "#13141a" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm" style={{ background: `${ACCENT}15` }}>⬡</div>
              <span className="text-[13px] font-bold" style={{ color: "#ddd" }}>Enrichment Engine</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Signal toggle chip */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all"
                style={{ borderColor: signals ? `${TEAL}50` : "#2a2a2a", background: signals ? `${TEAL}10` : "transparent" }}
                onClick={() => setSignals(!signals)}
              >
                <div className="text-[11px]">📡</div>
                <span className="text-[10px] font-bold" style={{ color: signals ? TEAL : "#555" }}>Signal Intel</span>
                <Toggle on={signals} color={TEAL} onToggle={() => setSignals(!signals)} />
              </div>
              {/* Relationship toggle chip */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all"
                style={{ borderColor: relationship ? `${GOLD}50` : "#2a2a2a", background: relationship ? `${GOLD}10` : "transparent" }}
                onClick={() => setRelationship(!relationship)}
              >
                <div className="text-[11px]">🕸</div>
                <span className="text-[10px] font-bold" style={{ color: relationship ? GOLD : "#555" }}>Relationship Intel</span>
                <Toggle on={relationship} color={GOLD} onToggle={() => setRelationship(!relationship)} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Signal Intelligence Expansion ─── */}
        <div className="mb-4 rounded-2xl border overflow-hidden" style={{ borderColor: signals ? `${TEAL}30` : "#2a2a2a" }}>
          <div
            className="p-4 flex items-center justify-between cursor-pointer"
            style={{ background: signals ? `${TEAL}08` : "#0e0f14" }}
            onClick={() => setExpanded(expanded === "signals" ? null : "signals")}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${TEAL}15` }}>📡</div>
              <div>
                <div className="text-[13px] font-bold" style={{ color: signals ? TEAL : "#888" }}>Signal Intelligence</div>
                <div className="text-[10px]" style={{ color: "#555" }}>8 active sources · injected into all enrichment requests when ON</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold" style={{ color: signals ? TEAL : "#555" }}>{signals ? "ACTIVE" : "OFF"}</span>
              <Toggle on={signals} color={TEAL} onToggle={() => setSignals(!signals)} />
              <span className="text-[12px]" style={{ color: "#555" }}>{expanded === "signals" ? "▲" : "▼"}</span>
            </div>
          </div>
          {expanded === "signals" && (
            <div className="border-t" style={{ borderColor: "#2a2a2a" }}>
              <div className="grid grid-cols-2 gap-0">
                {SIGNAL_SOURCES.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "#1a1a1a", background: i % 2 === 0 ? "transparent" : "#0a0b0f" }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.status === "active" ? TEAL : GOLD }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold" style={{ color: "#ccc" }}>{s.name}</div>
                      <div className="text-[9px]" style={{ color: "#555" }}>{s.tier} · {s.country}</div>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ background: s.status === "active" ? `${TEAL}15` : `${GOLD}15`, color: s.status === "active" ? TEAL : GOLD }}>{s.status}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 flex justify-end">
                <button className="text-[10px] px-3 py-1.5 rounded-lg font-bold" style={{ background: `${TEAL}15`, color: TEAL }}>Manage signal sources →</button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Relationship Intelligence Expansion ─── */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: relationship ? `${GOLD}30` : "#2a2a2a" }}>
          <div
            className="p-4 flex items-center justify-between cursor-pointer"
            style={{ background: relationship ? `${GOLD}08` : "#0e0f14" }}
            onClick={() => setExpanded(expanded === "relationship" ? null : "relationship")}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: `${GOLD}15` }}>🕸</div>
              <div>
                <div className="text-[13px] font-bold" style={{ color: relationship ? GOLD : "#888" }}>Relationship Intelligence</div>
                <div className="text-[10px]" style={{ color: "#555" }}>4 engines · network graph overlaid on Person/Company reports when ON</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold" style={{ color: relationship ? GOLD : "#555" }}>{relationship ? "ACTIVE" : "OFF"}</span>
              <Toggle on={relationship} color={GOLD} onToggle={() => setRelationship(!relationship)} />
              <span className="text-[12px]" style={{ color: "#555" }}>{expanded === "relationship" ? "▲" : "▼"}</span>
            </div>
          </div>
          {expanded === "relationship" && (
            <div className="border-t" style={{ borderColor: "#2a2a2a" }}>
              <div className="flex flex-col gap-0">
                {REL_ENGINES.map((e, i) => (
                  <div key={e.name} className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "#1a1a1a", background: i % 2 === 0 ? "transparent" : "#0a0b0f" }}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                    <div className="flex-1">
                      <span className="text-[11px] font-semibold" style={{ color: e.color }}>{e.name}</span>
                      <span className="text-[10px] ml-2" style={{ color: "#555" }}>{e.role}</span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${e.color}15`, color: e.color }}>{e.status}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 flex justify-end">
                <button className="text-[10px] px-3 py-1.5 rounded-lg font-bold" style={{ background: `${GOLD}15`, color: GOLD }}>Configure relationship engines →</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 p-3 rounded-xl text-[11px] text-center" style={{ background: "#0e0f14", border: "1px solid #1e1e2a", color: "#555" }}>
          These two toggles are stored in a single <code style={{ color: ACCENT }}>enrichment_preferences</code> row per user. OFF = enrichment calls skip those layers entirely.
        </div>

      </div>
    </div>
  );
}
