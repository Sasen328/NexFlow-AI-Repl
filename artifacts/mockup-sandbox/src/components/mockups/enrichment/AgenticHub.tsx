
import { useState } from "react";

const ACCENT = "#B8A0C8";
const TEAL = "#88B8B0";
const GOLD = "#C8A880";

type SubTab = "chat" | "swarm" | "genome" | "factory";

const SUB_TABS: { id: SubTab; label: string; icon: string; badge?: string; desc: string }[] = [
  { id: "chat",    label: "AI Chat",       icon: "💬", badge: "9 tools",  desc: "Multi-tool composer loop with Arabic support" },
  { id: "swarm",   label: "Agent Swarm",   icon: "🐝", badge: "NEW",      desc: "Kimi-orchestrated multi-LLM agent brief" },
  { id: "genome",  label: "Lead Genome",   icon: "🧬", badge: "DB",       desc: "Your enriched lead repository + lists" },
  { id: "factory", label: "Lead Factory",  icon: "⚙️", badge: "4-engine", desc: "Person · Company · Signals · Relationship" },
];

function ChatPanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex-1 p-4 rounded-2xl border" style={{ borderColor: `${TEAL}30`, background: "#0e0f14" }}>
          <div className="text-[11px] font-bold mb-3" style={{ color: TEAL }}>TOOLS ACTIVE (9)</div>
          <div className="flex flex-wrap gap-1.5">
            {["Masaar Search","Person Intel","Company Intel","Website Intel","Lead Factory","Signals","Masar DB","AI Builder","Genome Push"].map((t) => (
              <span key={t} className="text-[9px] px-2 py-1 rounded-full font-semibold" style={{ background: `${TEAL}15`, color: TEAL, border: `1px solid ${TEAL}30` }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="w-44 p-4 rounded-2xl border flex flex-col gap-2" style={{ borderColor: `${ACCENT}30`, background: "#0e0f14" }}>
          <div className="text-[11px] font-bold" style={{ color: ACCENT }}>NEXUS TIER</div>
          {[
            { label: "Planner", model: "Kimi", color: GOLD },
            { label: "Researcher", model: "Perplexity", color: TEAL },
            { label: "Writer", model: "Claude", color: ACCENT },
            { label: "Arabic", model: "GPT-4o", color: "#88B890" },
          ].map(({ label, model, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-[10px]" style={{ color: "#666" }}>{label}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${color}18`, color }}>{model}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-2xl border flex-1" style={{ borderColor: "#2a2a2a", background: "#0e0f14" }}>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex justify-end">
            <div className="max-w-xs px-4 py-2.5 rounded-2xl text-[13px]" style={{ background: `${ACCENT}25`, color: "#ddd" }}>
              Find me the Head of Procurement at STC and all their recent news signals
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[12px]" style={{ background: `${TEAL}20` }}>⬡</div>
            <div className="max-w-sm px-4 py-3 rounded-2xl text-[12px]" style={{ background: "#1a1b22", color: "#ccc", border: `1px solid #2a2a2a` }}>
              <div className="text-[10px] font-bold mb-2" style={{ color: TEAL }}>🔎 Running Person Intel → Perplexity ×4 + Gemini ×2…</div>
              <div>Found <strong style={{ color: ACCENT }}>Ahmad Al-Dosari</strong>, VP Procurement Strategy · STC Group</div>
              <div className="mt-1 text-[11px]" style={{ color: "#777" }}>+3 LinkedIn posts · 2 news mentions this week</div>
              <div className="mt-2 flex gap-2">
                <button className="text-[10px] px-2 py-1 rounded-lg font-bold" style={{ background: `${TEAL}20`, color: TEAL }}>Push to Genome</button>
                <button className="text-[10px] px-2 py-1 rounded-lg font-bold" style={{ background: `${GOLD}20`, color: GOLD }}>Add to List</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <input className="flex-1 px-4 py-2.5 rounded-xl text-[13px] outline-none" style={{ background: "#1a1b22", border: `1px solid #2a2a2a`, color: "#ccc" }} placeholder="Ask anything about a company, person, or market…" readOnly />
          <button className="px-4 py-2.5 rounded-xl text-[12px] font-bold" style={{ background: `linear-gradient(135deg, ${TEAL}DD, ${ACCENT}BB)`, color: "white" }}>Send</button>
        </div>
      </div>
    </div>
  );
}

function SwarmPanel() {
  const agents = [
    { id: "A1", name: "Kimi Planner", role: "Coordinator", status: "running", color: GOLD, model: "Moonshot Kimi" },
    { id: "A2", name: "Perplexity ×1", role: "Web researcher", status: "done", color: TEAL, model: "Perplexity Pro" },
    { id: "A3", name: "Perplexity ×2", role: "Signals scanner", status: "running", color: TEAL, model: "Perplexity Pro" },
    { id: "A4", name: "Claude", role: "Synthesizer", status: "waiting", color: ACCENT, model: "Claude 3.5" },
    { id: "A5", name: "GPT-4o Arabic", role: "Translation", status: "waiting", color: "#88B890", model: "GPT-4o" },
    { id: "A6", name: "DeepSeek v3", role: "Bulk classifier", status: "done", color: "#8898C8", model: "DeepSeek v3" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-2xl border" style={{ borderColor: `${GOLD}30`, background: `${GOLD}06` }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-bold" style={{ color: GOLD }}>Active Swarm Brief</div>
            <div className="text-[11px]" style={{ color: "#666" }}>"Enrich 50 SaaS companies in Riyadh · full profile + buying signals"</div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold animate-pulse" style={{ background: `${TEAL}20`, color: TEAL }}>● RUNNING</span>
        </div>
        <div className="w-full rounded-full h-1.5" style={{ background: "#1a1a2a" }}>
          <div className="h-1.5 rounded-full" style={{ width: "38%", background: `linear-gradient(90deg, ${TEAL}, ${ACCENT})` }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px]" style={{ color: "#555" }}>19 / 50 companies enriched</span>
          <span className="text-[10px]" style={{ color: "#555" }}>~4m 20s remaining</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {agents.map((a) => (
          <div key={a.id} className="p-3 rounded-xl border flex items-start gap-3" style={{ borderColor: a.status === "running" ? `${a.color}50` : "#2a2a2a", background: a.status === "running" ? `${a.color}08` : "#0e0f14" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-[12px] font-bold" style={{ background: `${a.color}20`, color: a.color }}>{a.id}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold" style={{ color: "#ddd" }}>{a.name}</div>
              <div className="text-[10px]" style={{ color: "#666" }}>{a.role}</div>
              <div className="text-[9px] mt-1 font-bold" style={{ color: a.status === "running" ? a.color : a.status === "done" ? "#4a7" : "#555" }}>
                {a.status === "running" ? "● running" : a.status === "done" ? "✓ done" : "⏳ queued"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenomePanel() {
  const leads = [
    { name: "Ahmad Al-Dosari", title: "VP Procurement · STC", score: 94, signals: 3, tags: ["SaaS","KSA"] },
    { name: "Mona Al-Rashidi", title: "CTO · Tamara", score: 87, signals: 1, tags: ["Fintech","KSA"] },
    { name: "Khalid Al-Otaibi", title: "CFO · Elm Company", score: 81, signals: 5, tags: ["GovTech","KSA"] },
    { name: "Sara Mahmoud", title: "Head of IT · SABIC", score: 76, signals: 2, tags: ["Enterprise","KSA"] },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {[
          { label: "1,842", sub: "Total leads", color: ACCENT },
          { label: "47", sub: "Added today", color: TEAL },
          { label: "12", sub: "Active lists", color: GOLD },
        ].map(({ label, sub, color }) => (
          <div key={sub} className="flex-1 p-3 rounded-xl border text-center" style={{ borderColor: `${color}30`, background: `${color}08` }}>
            <div className="text-[20px] font-bold" style={{ color }}>{label}</div>
            <div className="text-[10px]" style={{ color: "#666" }}>{sub}</div>
          </div>
        ))}
        <button className="px-4 py-2 rounded-xl text-[11px] font-bold self-center" style={{ background: `linear-gradient(135deg, ${TEAL}CC, ${ACCENT}AA)`, color: "white" }}>+ Push leads</button>
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#2a2a2a" }}>
        <div className="grid px-4 py-2 border-b text-[10px] font-bold" style={{ borderColor: "#2a2a2a", color: "#555", gridTemplateColumns: "1fr 80px 60px 80px 60px" }}>
          <div>NAME / TITLE</div><div>SCORE</div><div>SIGNALS</div><div>TAGS</div><div></div>
        </div>
        {leads.map((l) => (
          <div key={l.name} className="grid px-4 py-3 border-b items-center" style={{ borderColor: "#1a1a1a", gridTemplateColumns: "1fr 80px 60px 80px 60px" }}>
            <div>
              <div className="text-[12px] font-semibold" style={{ color: "#ddd" }}>{l.name}</div>
              <div className="text-[10px]" style={{ color: "#666" }}>{l.title}</div>
            </div>
            <div className="text-[13px] font-bold" style={{ color: l.score > 90 ? TEAL : l.score > 80 ? ACCENT : GOLD }}>{l.score}</div>
            <div className="text-[12px]" style={{ color: "#666" }}>{l.signals} 📡</div>
            <div className="flex gap-1 flex-wrap">
              {l.tags.map(t => <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: `${ACCENT}15`, color: ACCENT }}>{t}</span>)}
            </div>
            <button className="text-[9px] px-2 py-1 rounded-lg font-bold" style={{ background: `${TEAL}15`, color: TEAL }}>Push →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FactoryPanel() {
  const engines = [
    { id: "person", label: "Person Hunt", icon: "👤", color: ACCENT, desc: "16-agent deep profiling · LinkedIn + web crawls · 76-90s", status: "ready" },
    { id: "company", label: "Company Intel", icon: "🏢", color: TEAL, desc: "5-source synthesis · Gemini×5 + Perplexity×4 + Claude · ~45s", status: "ready" },
    { id: "signals", label: "Signal Intel", icon: "📡", color: GOLD, desc: "LinkedIn · X · Reuters · MoCI · Wamda · Argaam · custom RSS", status: "on" },
    { id: "relationship", label: "Relationship Intel", icon: "🕸", color: "#8898C8", desc: "Sherlock + TheHarvester network graph · connection mapping", status: "on" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {engines.map((e) => (
          <div key={e.id} className="p-4 rounded-2xl border" style={{ borderColor: `${e.color}30`, background: `${e.color}06` }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{e.icon}</span>
                <span className="text-[13px] font-bold" style={{ color: e.color }}>{e.label}</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${e.color}20`, color: e.color }}>{e.status}</span>
            </div>
            <div className="text-[10px]" style={{ color: "#666" }}>{e.desc}</div>
            <div className="mt-3 flex gap-2">
              <button className="text-[10px] px-3 py-1.5 rounded-lg font-bold flex-1" style={{ background: `${e.color}20`, color: e.color }}>Run Hunt</button>
              <button className="text-[10px] px-2 py-1.5 rounded-lg" style={{ background: "#1a1b22", color: "#666", border: "1px solid #2a2a2a" }}>Config</button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl border text-[11px]" style={{ borderColor: `${GOLD}30`, background: `${GOLD}08`, color: "#888" }}>
        💡 All engines push results to <strong style={{ color: GOLD }}>Lead Genome</strong> automatically. DB seed data is backend-internal only.
      </div>
    </div>
  );
}

export function AgenticHub() {
  const [sub, setSub] = useState<SubTab>("chat");
  return (
    <div className="min-h-screen p-6" style={{ background: "#0e0f14", fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-3xl mx-auto">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg" style={{ background: `${TEAL}20` }}>⬡</div>
          <div>
            <h1 className="text-[17px] font-bold" style={{ color: "#e2e2e2" }}>Enrich Agentic Hub</h1>
            <p className="text-[11px]" style={{ color: "#555" }}>New first tab · AI-native enrichment command centre</p>
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

        {/* Sub-tabs */}
        <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: "#1a1b22" }}>
          {SUB_TABS.map((t) => {
            const active = sub === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSub(t.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl transition-all"
                style={active
                  ? { background: `linear-gradient(135deg, ${TEAL}CC, ${ACCENT}AA)`, color: "white" }
                  : { color: "#555" }}
              >
                <span>{t.icon}</span>
                <span className="text-[11px] font-bold">{t.label}</span>
                {t.badge && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: active ? "rgba(255,255,255,0.2)" : "#2a2a2a", color: active ? "white" : "#888" }}>{t.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        {sub === "chat"    && <ChatPanel />}
        {sub === "swarm"   && <SwarmPanel />}
        {sub === "genome"  && <GenomePanel />}
        {sub === "factory" && <FactoryPanel />}
      </div>
    </div>
  );
}
