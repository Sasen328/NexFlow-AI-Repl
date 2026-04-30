import { useState } from "react";
import {
  GitBranch, TrendingUp, Sparkles, AlertTriangle, ArrowRight, CheckCircle2,
  Zap, Target, Clock, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PipelinePage from "@/pages/pipeline";
import DealPipelinePage from "@/pages/deal-pipeline";

type Mode = "deals" | "leads";

const GAP_ITEMS = [
  {
    stage: "MQL → SAL1",
    gap: "41% conversion (team avg 35% ✓ — above benchmark)",
    status: "good",
    action: "Maintain current qualification criteria. Add urgency signal as MQL trigger.",
    color: "#88B8B0",
  },
  {
    stage: "SAL1 → SAL2",
    gap: "68% but 5 leads stalled >7 days with no meeting booked",
    status: "warn",
    action: "Trigger automated meeting-booking WhatsApp sequence for stalled SAL1s",
    color: "#C8A880",
  },
  {
    stage: "SAL2 → Deal",
    gap: "79% conversion — but avg time is 14 days vs 8-day target",
    status: "warn",
    action: "Send pre-meeting ROI brief to compress SAL2→Deal velocity to <10 days",
    color: "#B8A0C8",
  },
  {
    stage: "Deal → Won",
    gap: "34% — 3 deals stalled at negotiation stage for 21+ days",
    status: "risk",
    action: "Escalate: book multi-stakeholder call + send competitive positioning brief",
    color: "#C0A0B8",
  },
];

const AI_SUGGESTIONS = [
  { id: "s1", impact: "High",   body: "5 SAL1 leads have been idle 8+ days — trigger AI WhatsApp sequence now to book SAL2 meetings before they go cold.", cta: "Launch sequence" },
  { id: "s2", impact: "High",   body: "3 stalled deals: re-engage with executive sponsor intro. Deals with 3+ contacts close 2.4× faster in GCC.", cta: "Map stakeholders" },
  { id: "s3", impact: "Medium", body: "Top-of-funnel is strong (41% MQL→SAL1) — increase MQL volume by 30% to hit quarterly pipeline target.", cta: "Run enrichment" },
  { id: "s4", impact: "Low",    body: "SAL2→Deal velocity is slow. Pre-meeting ROI briefs have historically cut this from 14 to 8 days.", cta: "Generate brief" },
];

const IMPACT_COLOR: Record<string, string> = { High: "#C8A880", Medium: "#B8A0C8", Low: "#88B8B0" };

export default function LeadsPipelinePage() {
  const [mode, setMode] = useState<Mode>("deals");
  // Gap Analysis is opt-in (was on by default and dominated the view —
  // users wanted to land on the actual pipeline, not the AI commentary).
  const [showGap, setShowGap] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header + mode toggle */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline & Deals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Pre-SAL funnel analysis · AI gap identification · post-SAL deal stages.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGap(v => !v)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
              showGap ? "nf-chameleon-bg text-white border-transparent" : "border-border/40 text-muted-foreground hover:bg-muted/40")}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Gap Analysis
          </button>
          <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border/40">
            <ToggleBtn label="Deal Pipeline" icon={TrendingUp} active={mode === "deals"} onClick={() => setMode("deals")} />
            <ToggleBtn label="Lead Funnel"   icon={GitBranch}  active={mode === "leads"} onClick={() => setMode("leads")} />
          </div>
        </div>
      </div>

      {/* AI Gap Analysis Panel */}
      {showGap && (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(184,160,200,0.3)" }}>
          {/* AI summary band */}
          <div className="p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f9f3ff 0%, #f0f9f8 60%, #fffbf0 100%)" }}>
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8A0C8] mb-0.5">AI Pipeline Intelligence</div>
                <h2 className="text-base font-black text-foreground mb-1">Funnel Gap Analysis</h2>
                <p className="text-sm text-foreground/85 leading-relaxed">
                  Pipeline health is <span className="font-bold text-[#88B8B0]">moderate-positive</span>. MQL→SAL1 is above benchmark but 5 SAL1 leads are stalled and 3 deals are at risk of loss. Immediate priority: re-engage stalled SAL1s (highest revenue velocity impact) and escalate the 3 stuck deals before Friday.
                </p>
              </div>
            </div>
          </div>

          {/* Stage-by-stage gap rows */}
          <div className="divide-y divide-border/20 bg-white/60">
            {GAP_ITEMS.map((g, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                  g.status === "good" ? "bg-green-100" : g.status === "warn" ? "bg-[#C8A880]/15" : "bg-red-100")}>
                  {g.status === "good"
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : g.status === "warn"
                    ? <Clock className="w-4 h-4 text-[#C8A880]" />
                    : <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground" style={{ color: g.color }}>{g.stage}</div>
                  <div className="text-[11px] text-foreground/80 mt-0.5">{g.gap}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-start gap-1">
                    <Target className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: g.color }} />
                    <span>{g.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI suggestions */}
          <div className="p-4 bg-muted/10 border-t border-border/20">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">AI-Generated Improvement Actions</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {AI_SUGGESTIONS.map(s => (
                <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-border/20">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: `${IMPACT_COLOR[s.impact]}20`, color: IMPACT_COLOR[s.impact] }}>{s.impact}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-foreground/85 leading-relaxed">{s.body}</p>
                    <button type="button" className="text-[10px] font-bold mt-1.5 flex items-center gap-0.5" style={{ color: IMPACT_COLOR[s.impact] }}>
                      {s.cta} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pipeline / Funnel content */}
      {mode === "deals" ? <DealPipelinePage /> : <PipelinePage />}
    </div>
  );
}

function ToggleBtn({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
      active ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
