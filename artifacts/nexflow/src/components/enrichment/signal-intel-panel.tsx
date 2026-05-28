import { useState } from "react";

const PRI  = "#B8A0C8";
const TEAL = "#88B8B0";
const GOLD = "#C8A880";

const SIGNAL_CARDS = [
  { heat:"Hot",      kind:"Hiring Signal",  body:"Tabby posted 9 engineering roles on LinkedIn",                  ago:"3 hours ago",   cta:"Alert rep",         color:PRI },
  { heat:"High",     kind:"Funding",        body:"Lean Tech closed $28M Series A · Wamda confirmed",             ago:"Yesterday",     cta:"View report",       color:GOLD },
  { heat:"Rising",   kind:"Board",          body:"Hala appointed new CFO · former SAMA executive",               ago:"2 days ago",    cta:"Build tree",        color:GOLD },
  { heat:"Warm",     kind:"PR",             body:"NymCard announced SAMA license approval",                      ago:"3 days ago",    cta:"Enrich contacts",   color:TEAL },
  { heat:"Medium",   kind:"LinkedIn",       body:"Sara Al-Mutlaq (Tamara) posted on AI infrastructure",          ago:"4 days ago",    cta:"Reach out",         color:"#9B8EAC" },
  { heat:"Monitor",  kind:"Argaam",         body:"3 Tadawul FinTech companies filed H1 2025 results",            ago:"5 days ago",    cta:"Analyze",           color:TEAL },
];

const SOURCES = [
  { name:"LinkedIn",      meta:"Hiring · job posts · profile changes",     status:"Active",  statusColor:"#4CAA84", on:true  },
  { name:"Argaam",        meta:"Saudi financial news · real-time",          status:"Active",  statusColor:"#4CAA84", on:true  },
  { name:"Wamda",         meta:"MENA startup funding rounds",               status:"Active",  statusColor:"#4CAA84", on:true  },
  { name:"MoCI Registry", meta:"Saudi CR filings · ownership changes",      status:"Partial", statusColor:GOLD,      on:true  },
  { name:"Reuters ME",    meta:"GCC region news alerts",                    status:"Active",  statusColor:"#4CAA84", on:true  },
  { name:"X / Twitter",   meta:"Executive announcements · company posts",   status:"Active",  statusColor:"#4CAA84", on:false },
  { name:"PR Newswire",   meta:"Corporate press releases",                  status:"Active",  statusColor:"#4CAA84", on:true  },
  { name:"Custom RSS",    meta:"Add your own RSS feed",                     status:"Custom",  statusColor:"#9B8EAC", on:false },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors" style={{ background: on ? TEAL : "#D1C8DC" }}>
      <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ transform: on ? "translateX(20px)" : "translateX(2px)" }} />
    </button>
  );
}

export function SignalIntelPanel() {
  const [sources, setSources] = useState(SOURCES.map(s => ({ ...s })));
  const [toast, setToast] = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const toggleSource = (i: number) => setSources(prev => prev.map((s, idx) => idx === i ? { ...s, on: !s.on } : s));

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {[
          {v:"24",    l:"Active signals", c:PRI,  sub:"+6 today"},
          {v:"8",     l:"Hot leads",      c:GOLD, sub:"triggered"},
          {v:"12",    l:"Sources",        c:TEAL, sub:"monitored"},
          {v:"94%",   l:"Accuracy",       c:"#4CAA84", sub:"signal"},
          {v:"2m",    l:"Avg alert lag",  c:"#9B8EAC", sub:""},
        ].map(k => (
          <div key={k.l} className="rounded-xl border border-[#E8E2F0] bg-white p-3 text-center">
            <div className="text-[20px] font-bold" style={{ color: k.c }}>{k.v}</div>
            <div className="text-[10px] font-medium text-[#9B8EAC]">{k.l}</div>
            {k.sub && <div className="text-[10px]" style={{ color: k.c }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Signal cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SIGNAL_CARDS.map(card => (
          <div
            key={card.body}
            className="cursor-pointer rounded-xl border bg-white p-4 transition-all hover:shadow-sm"
            style={{ borderColor: card.color + "40" }}
            onClick={() => showToast(card.cta + ": " + card.body)}
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-bold" style={{ color: card.color }}>{card.heat}</span>
              <span className="text-[10px] text-[#9B8EAC]">· {card.kind}</span>
            </div>
            <div className="mb-2 text-[13px] font-medium text-[#4A3B5C]">{card.body}</div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#9B8EAC]">{card.ago}</span>
              <button
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                style={{ background: card.color }}
              >{card.cta}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Channel Sources */}
      <div className="rounded-xl border border-[#E8E2F0] bg-white">
        <div className="flex items-center justify-between border-b border-[#E8E2F0] px-4 py-3">
          <div>
            <div className="text-[13px] font-bold text-[#4A3B5C]">Channel Sources</div>
            <div className="text-[11px] text-[#9B8EAC]">active monitoring</div>
          </div>
          <button onClick={() => showToast("Add channel")} className="rounded-lg border border-[#E2D8EA] px-3 py-1.5 text-[11px] font-bold text-[#7B6E8D] hover:bg-[#F5F1FA]">+ Add channel</button>
        </div>
        <div className="divide-y divide-[#F0EBF8]">
          {sources.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <div className="text-[12px] font-bold text-[#4A3B5C]">{s.name}</div>
                <div className="text-[11px] text-[#9B8EAC]">{s.meta}</div>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{ background: s.statusColor + "20", color: s.statusColor }}
              >{s.status}</span>
              <Toggle on={s.on} onClick={() => toggleSource(i)} />
            </div>
          ))}
        </div>
      </div>

      {/* Signal rules */}
      <div className="rounded-xl border border-[#E8E2F0] bg-white p-4">
        <div className="mb-3 text-[13px] font-bold text-[#4A3B5C]">Signal Rules & Triggers</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            {t:"Hiring surge",      d:"≥5 roles posted in 30 days → Hot lead",        on:true},
            {t:"Funding round",     d:"Series A+ confirmed by 2+ sources → High",     on:true},
            {t:"Leadership change", d:"CXO / VP appointment → Rising",                on:true},
            {t:"CR filing",         d:"New ownership change at MoCI → Monitor",       on:false},
            {t:"License granted",   d:"SAMA / CMA approval → Warm",                   on:true},
            {t:"News mention",      d:"3+ media mentions in 7d → Medium",             on:false},
          ].map(rule => (
            <div key={rule.t} className="flex items-center gap-3 rounded-lg border border-[#F0EBF8] bg-[#FAFAF9] p-3">
              <div className="flex-1">
                <div className="text-[12px] font-bold text-[#4A3B5C]">{rule.t}</div>
                <div className="text-[10px] text-[#9B8EAC]">{rule.d}</div>
              </div>
              <Toggle on={rule.on} onClick={() => showToast("Rule toggled: " + rule.t)} />
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-[13px] font-bold text-white shadow-lg" style={{ background: TEAL }}>{toast}</div>
      )}
    </div>
  );
}
