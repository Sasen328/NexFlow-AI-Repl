import { useState, useEffect, useRef } from "react";
import { Cpu, Zap, CheckCircle2, Circle, Loader2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#B8A0C8";
const TEAL   = "#88B8B0";
const GOLD   = "#C8A880";

const PHASES = [
  { label: "Brief parsed", desc: "Kimi extracts ICP parameters" },
  { label: "Agents dispatched", desc: "Parallel swarm initialised" },
  { label: "Harvesting", desc: "Masaar + Masaar DB + web crawl" },
  { label: "Enriching", desc: "Person Intel + Signals per company" },
  { label: "Fusing", desc: "Claude arbitrates agent outputs" },
  { label: "Report", desc: "Humanizer + source-credibility verdicts" },
];

const ENGINES = [
  { id: "masaar",   label: "Masaar",       color: GOLD },
  { id: "person",   label: "Person Intel", color: ACCENT },
  { id: "signals",  label: "Signal Intel", color: TEAL },
  { id: "rel",      label: "Relationship", color: "#C0A0B8" },
  { id: "builder",  label: "AI DB Builder",color: "#8BB8A8" },
  { id: "pros",     label: "ProsEngine",   color: ACCENT },
];

const ORBIT_NODES = [
  { label: "MASAAR", color: GOLD,   angle: 0   },
  { label: "PRENG",  color: ACCENT, angle: 60  },
  { label: "SIG",    color: TEAL,   angle: 120 },
  { label: "GPT",    color: "#10A37F", angle: 180 },
  { label: "GEMINI", color: "#1A73E8", angle: 240 },
  { label: "CLAUDE", color: "#C1441A", angle: 300 },
];

type SwarmState = "idle" | "running" | "done";

export function SwarmBoardPanel() {
  const [brief, setBrief] = useState("Enrich 50 Saudi fintech companies (50–500 employees) · full profile, buying signals, executive map, credibility verdicts");
  const [selected, setSelected] = useState<Set<string>>(new Set(["masaar", "person", "signals", "pros"]));
  const [state, setState] = useState<SwarmState>("idle");
  const [phase, setPhase] = useState(-1);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [spin, setSpin] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function toggle(id: string) {
    setSelected((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  function launch() {
    if (!brief.trim() || state === "running") return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setState("running"); setPhase(0); setSpin(true); setProgress({ done: 0, total: 50 });

    PHASES.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setPhase(i), i * 2800));
    });

    for (let i = 1; i <= 50; i++) {
      timersRef.current.push(setTimeout(() => setProgress({ done: i, total: 50 }), 1000 + i * 280));
    }

    timersRef.current.push(setTimeout(() => { setState("done"); setSpin(false); }, PHASES.length * 2800 + 500));
  }

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold">SwarmBoard</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Kimi-coordinated multi-agent swarm · live orbit · fused report</p>
        </div>
        <span className={cn("flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border",
          state === "running" ? "bg-amber-500/10 border-amber-400/30 text-amber-600" : "bg-emerald-500/10 border-emerald-400/30 text-emerald-600")}>
          <span className={cn("w-1.5 h-1.5 rounded-full", state === "running" ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
          {state === "running" ? "Swarm Running" : "Agents Ready"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 items-start">
        {/* Left — controls */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/30 bg-card/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/20 font-semibold text-[13px]">Mission Brief</div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5">Paste your mission brief</div>
                <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border/30 bg-background text-[12.5px] resize-none" />
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">Engines to deploy</div>
                <div className="flex flex-wrap gap-1.5">
                  {ENGINES.map((e) => {
                    const on = selected.has(e.id);
                    return (
                      <button key={e.id} onClick={() => toggle(e.id)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all"
                        style={on ? { background: e.color + "25", borderColor: e.color + "60", color: e.color } : undefined}>
                        {e.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={launch} disabled={state === "running"}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white disabled:opacity-50 transition-all"
                style={{ background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})`, boxShadow: `0 4px 14px ${ACCENT}35` }}>
                {state === "running" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                {state === "running" ? "Swarm Running…" : "Launch Swarm"}
              </button>
            </div>
          </div>

          {/* Mission phases */}
          <div className="rounded-2xl border border-border/30 bg-card/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/20 font-semibold text-[13px]">Mission Phases</div>
            <div className="p-4 space-y-0">
              {PHASES.map((p, i) => {
                const done = phase > i;
                const active = phase === i;
                return (
                  <div key={i} className={cn("flex items-start gap-3 py-2.5 border-b border-border/15 last:border-0 transition-all")}>
                    <div className="flex-shrink-0 mt-0.5">
                      {done ? <CheckCircle2 className="w-4 h-4" style={{ color: TEAL }} />
                        : active ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: ACCENT }} />
                        : <Circle className="w-4 h-4 text-muted-foreground/30" />}
                    </div>
                    <div>
                      <div className={cn("text-[12.5px] font-semibold", done ? "text-muted-foreground line-through" : active ? "text-foreground" : "text-muted-foreground/50")}>
                        {i + 1}. {p.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground/60">{p.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — orbit + report */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/30 bg-card/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-[14px]">Live Orbit</span>
              <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md",
                state === "running" ? "bg-amber-500/15 text-amber-600" : state === "done" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}>
                {state === "idle" ? "Idle" : state === "running" ? "Running" : "Complete"}
              </span>
            </div>

            {/* Orbit visualization */}
            <div className="relative w-[240px] h-[240px] mx-auto my-4">
              {/* Core */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white text-[9px] font-bold text-center leading-tight shadow-lg"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${TEAL})`, boxShadow: `0 0 20px ${TEAL}60` }}>
                NEXUS<br />CORE
              </div>
              {/* Connection lines */}
              {ORBIT_NODES.map((n, i) => {
                const rad = (n.angle * Math.PI) / 180;
                const r = 95;
                const x = 120 + r * Math.cos(rad);
                const y = 120 + r * Math.sin(rad);
                return (
                  <svg key={i} className="absolute inset-0 w-full h-full pointer-events-none">
                    <line x1="120" y1="120" x2={x} y2={y}
                      stroke={spin ? n.color : "#e5e7eb"} strokeWidth="1" strokeDasharray="3 3"
                      strokeOpacity={spin ? 0.5 : 0.2} />
                  </svg>
                );
              })}
              {/* Agent nodes */}
              {ORBIT_NODES.map((n, i) => {
                const rad = (n.angle * Math.PI) / 180;
                const r = 95;
                const x = 120 + r * Math.cos(rad) - 18;
                const y = 120 + r * Math.sin(rad) - 18;
                return (
                  <div key={i}
                    className={cn("absolute w-9 h-9 rounded-full flex items-center justify-center text-white text-[7px] font-bold text-center border-2 border-white/30 shadow-md transition-all duration-500",
                      spin ? "scale-100 opacity-100" : "scale-75 opacity-40")}
                    style={{ left: x, top: y, background: n.color, boxShadow: spin ? `0 0 12px ${n.color}80` : "none" }}>
                    {n.label}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            {state !== "idle" && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(progress.done / progress.total) * 100}%`, background: `linear-gradient(90deg, ${TEAL}, ${ACCENT})` }} />
                </div>
                <div className="text-[11px] text-muted-foreground text-center">
                  {progress.done} / {progress.total} enriched
                </div>
              </div>
            )}
          </div>

          {/* Fused report */}
          <div className="rounded-2xl border border-border/30 bg-card/50 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="font-semibold text-[14px]">Fused Report Preview</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold border" style={{ background: `${ACCENT}18`, borderColor: `${ACCENT}40`, color: ACCENT }}>◆ {state === "done" ? 94 : "—"}</span>
            </div>
            {state === "done" ? (
              <>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                  Saudi fintech (50–500 emp). <strong className="text-foreground">1,284 companies matched</strong>; 312 high-fit (ICP ≥ 0.7). 41 funding and hiring signals in 90 days; 7 SAMA-licensed fintechs prioritised. <strong className="text-foreground">268 verified executive contacts</strong>.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["NEXUS", "MASAAR", "PROSENGINE", "SIGNALS"].map((chip) => (
                    <span key={chip} className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
                      style={{ background: `${ACCENT}18`, borderColor: `${ACCENT}40`, color: ACCENT }}>{chip}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${TEAL}, ${ACCENT})` }}>
                    <ChevronRight className="w-3.5 h-3.5" /> Push top 50 to Genome
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-border/40 text-foreground/70 hover:bg-muted/40">Full report</button>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-muted-foreground py-6 text-center">
                {state === "idle" ? "Launch the swarm to generate a fused intelligence report." : "Generating fused report…"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
