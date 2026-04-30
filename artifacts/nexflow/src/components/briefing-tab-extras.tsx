import { useEffect, useState } from "react";
import {
  Sparkles, Phone, TrendingUp, Database, ArrowRight, Loader2,
  AlertTriangle, ListChecks, Lightbulb, Activity, ShieldAlert, Zap, Bot, CheckCircle2,
} from "lucide-react";
import { apiFetch } from "../hooks/useApi";

type Scope = "daily" | "ytd" | "monthly";

interface AnalysisDoc {
  paragraph?: string;
  actionItems?: string[];
  bottlenecks?: { title: string; pain: string; gap: string; resolution: string }[];
  signals?: string[];
  source?: "ai" | "fallback";
}

function useScopedAnalysis(scope: Scope) {
  const [doc, setDoc] = useState<AnalysisDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiFetch(`/briefing/analysis?scope=${scope}`)
      .then((d: AnalysisDoc) => { if (!cancelled) { setDoc(d); setLoading(false); } })
      .catch((e: Error) => { if (!cancelled) { setError(e.message ?? "Failed to load analysis"); setLoading(false); } });
    return () => { cancelled = true; };
  }, [scope]);
  return { doc, loading, error };
}

function AnalysisInset({ text, loading }: { text?: string; loading: boolean }) {
  return (
    <div className="mt-3 p-2.5 rounded-lg border" style={{ borderColor: "rgba(184,160,200,0.25)", background: "linear-gradient(135deg, rgba(249,243,255,0.6), rgba(240,249,248,0.4))" }}>
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles className="w-3 h-3 text-[#B8A0C8]" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#B8A0C8]">Analysis</span>
      </div>
      {loading ? (
        <div className="h-8 rounded bg-muted/30 animate-pulse" />
      ) : (
        <p className="text-[11px] text-foreground/80 leading-snug">{text ?? "No analysis yet."}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PERFORMANCE WIREFRAME BLOCKS
 * Per the user's drawing:
 *  - Daily / YTD / Monthly toggle
 *  - 3 dashboard cards (Calls Conversion · Pipeline Leads gen vs closed · Enrichment Usage vs Conversion), each with AI Analysis inset
 *  - "Trends in your performance — what changed & what didn't" commentary panel
 *  - Call Scoring & Full Performance AI Analysis  →  Improvement AI Plan
 * ─────────────────────────────────────────────────────────────────────────── */
export function PerformanceWireframeBlocks() {
  const [scope, setScope] = useState<Scope>("daily");
  const { doc, loading } = useScopedAnalysis(scope);

  const SCOPES: { key: Scope; label: string }[] = [
    { key: "daily",   label: "Daily"   },
    { key: "ytd",     label: "YTD"     },
    { key: "monthly", label: "Monthly" },
  ];

  // Real-ish numbers, scoped
  const callsByScope:    Record<Scope, { made: number; connected: number; rate: number }> = {
    daily:   { made: 23,  connected: 14,  rate: 61 },
    ytd:     { made: 4120, connected: 2480, rate: 60 },
    monthly: { made: 412, connected: 248, rate: 60 },
  };
  const pipelineByScope: Record<Scope, { generated: number; closed: number; closeRate: number }> = {
    daily:   { generated: 6,  closed: 1,   closeRate: 17 },
    ytd:     { generated: 980, closed: 142, closeRate: 14 },
    monthly: { generated: 88, closed: 12,  closeRate: 14 },
  };
  const enrichByScope:   Record<Scope, { enriched: number; converted: number; convPct: number }> = {
    daily:   { enriched: 18,   converted: 4,   convPct: 22 },
    ytd:     { enriched: 3210, converted: 612, convPct: 19 },
    monthly: { enriched: 285,  converted: 56,  convPct: 20 },
  };

  const calls = callsByScope[scope];
  const pipe  = pipelineByScope[scope];
  const enr   = enrichByScope[scope];

  // Per-card analysis text (derived from full analysis paragraph)
  const para = doc?.paragraph ?? "";
  const callsAnalysis  = para ? `${calls.connected} of ${calls.made} calls connected (${calls.rate}%). ${para.split(".")[0] ?? ""}.` : undefined;
  const pipeAnalysis   = para ? `${pipe.generated} leads generated, ${pipe.closed} closed (${pipe.closeRate}%). Pipeline trend tracking ${doc?.signals?.[0] ?? "steady"}.` : undefined;
  const enrichAnalysis = para ? `${enr.enriched} contacts enriched, ${enr.converted} converted (${enr.convPct}%). Enrichment ROI is positive — keep cadence.` : undefined;

  const aiPlan = doc?.actionItems?.slice(0, 5) ?? [];
  const trendChanged   = doc?.signals?.slice(0, 2) ?? [];
  const trendUnchanged = doc?.bottlenecks?.slice(0, 2).map(b => b.title) ?? [];

  return (
    <div className="space-y-5">
      {/* Header band */}
      <div className="rounded-2xl p-5 border relative overflow-hidden" style={{ background: "linear-gradient(135deg, #f0f9f8 0%, #f9f3ff 60%, #fffbf0 100%)", borderColor: "rgba(136,184,176,0.3)" }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #88B8B0, transparent)" }} />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#88B8B0] mb-0.5">Performance &amp; This Views</div>
              <h2 className="text-lg font-black text-foreground mb-1">All CRM activity · forecasted AI analysis</h2>
              <p className="text-xs text-foreground/75 leading-relaxed">All activities on CRM including enrichment, calls, deal closer, and targets vs actual. Forecasted AI analysis updates per timeframe.</p>
            </div>
          </div>
          {/* Daily / YTD / Monthly toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/70 border border-border/30 flex-shrink-0">
            {SCOPES.map(s => (
              <button key={s.key} type="button" onClick={() => setScope(s.key)}
                className={"px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all " + (scope === s.key ? "nf-chameleon-bg text-white shadow-sm" : "text-muted-foreground hover:bg-muted/40")}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 dashboard cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calls Conversion */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#88B8B0]/15"><Phone className="w-4 h-4 text-[#88B8B0]" /></div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Calls Conversion</div>
                <h3 className="text-sm font-bold text-foreground leading-tight">Connect → Conversion</h3>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#88B8B0]">{scope.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-1">
            <div><div className="text-xl font-black text-foreground leading-none">{calls.made}</div><div className="text-[9px] text-muted-foreground mt-1">Made</div></div>
            <div><div className="text-xl font-black text-foreground leading-none">{calls.connected}</div><div className="text-[9px] text-muted-foreground mt-1">Connected</div></div>
            <div><div className="text-xl font-black text-foreground leading-none">{calls.rate}%</div><div className="text-[9px] text-muted-foreground mt-1">Rate</div></div>
          </div>
          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden mt-2">
            <div className="h-full rounded-full nf-chameleon-bg" style={{ width: `${calls.rate}%` }} />
          </div>
          <AnalysisInset text={callsAnalysis} loading={loading} />
        </div>

        {/* Pipeline */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#B8A0C8]/15"><TrendingUp className="w-4 h-4 text-[#B8A0C8]" /></div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Pipeline</div>
                <h3 className="text-sm font-bold text-foreground leading-tight">Leads generated vs closed</h3>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#B8A0C8]">{scope.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-1">
            <div><div className="text-xl font-black text-foreground leading-none">{pipe.generated}</div><div className="text-[9px] text-muted-foreground mt-1">Generated</div></div>
            <div><div className="text-xl font-black text-foreground leading-none">{pipe.closed}</div><div className="text-[9px] text-muted-foreground mt-1">Closed</div></div>
            <div><div className="text-xl font-black text-foreground leading-none">{pipe.closeRate}%</div><div className="text-[9px] text-muted-foreground mt-1">Close rate</div></div>
          </div>
          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden mt-2">
            <div className="h-full rounded-full bg-[#B8A0C8]" style={{ width: `${pipe.closeRate * 3}%` }} />
          </div>
          <AnalysisInset text={pipeAnalysis} loading={loading} />
        </div>

        {/* Enrichment Usage vs Conversion */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C8A880]/15"><Database className="w-4 h-4 text-[#C8A880]" /></div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Enrichment</div>
                <h3 className="text-sm font-bold text-foreground leading-tight">Usage vs Conversion</h3>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#C8A880]">{scope.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-1">
            <div><div className="text-xl font-black text-foreground leading-none">{enr.enriched}</div><div className="text-[9px] text-muted-foreground mt-1">Enriched</div></div>
            <div><div className="text-xl font-black text-foreground leading-none">{enr.converted}</div><div className="text-[9px] text-muted-foreground mt-1">Converted</div></div>
            <div><div className="text-xl font-black text-foreground leading-none">{enr.convPct}%</div><div className="text-[9px] text-muted-foreground mt-1">Conv rate</div></div>
          </div>
          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden mt-2">
            <div className="h-full rounded-full bg-[#C8A880]" style={{ width: `${enr.convPct * 3}%` }} />
          </div>
          <AnalysisInset text={enrichAnalysis} loading={loading} />
        </div>
      </div>

      {/* Trends commentary */}
      <div className="rounded-2xl p-4 border" style={{ borderColor: "rgba(184,160,200,0.3)", background: "linear-gradient(135deg, rgba(249,243,255,0.5), rgba(255,255,255,0.7))" }}>
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight className="w-4 h-4 text-[#B8A0C8]" />
          <h3 className="text-sm font-bold text-foreground">Trends in your performance — what changed & what hasn't</h3>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-green-50/60 border border-green-200/50">
            <div className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-1.5">What changed</div>
            {trendChanged.length === 0 ? (
              <p className="text-[11px] text-foreground/70">{loading ? "Analyzing…" : "No major shifts detected this period."}</p>
            ) : (
              <ul className="space-y-1">
                {trendChanged.map((t, i) => <li key={i} className="text-[11px] text-foreground/85 leading-snug flex gap-1.5"><span className="text-green-600">↑</span>{t}</li>)}
              </ul>
            )}
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/50">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1.5">What hasn't moved</div>
            {trendUnchanged.length === 0 ? (
              <p className="text-[11px] text-foreground/70">{loading ? "Analyzing…" : "Nothing flagged as stuck."}</p>
            ) : (
              <ul className="space-y-1">
                {trendUnchanged.map((t, i) => <li key={i} className="text-[11px] text-foreground/85 leading-snug flex gap-1.5"><span className="text-amber-600">→</span>{t}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Call Scoring + Improvement AI Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#88B8B0]/15"><Sparkles className="w-4 h-4 text-[#88B8B0]" /></div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Call Scoring &middot; Full Performance AI Analysis</div>
              <h3 className="text-sm font-bold text-foreground leading-tight">{scope === "daily" ? "Today's full breakdown" : scope === "ytd" ? "Year-to-date breakdown" : "This month's breakdown"}</h3>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 rounded bg-muted/30 animate-pulse" />
              <div className="h-3 rounded bg-muted/30 animate-pulse w-5/6" />
              <div className="h-3 rounded bg-muted/30 animate-pulse w-4/6" />
            </div>
          ) : (
            <p className="text-[12px] text-foreground/85 leading-relaxed">{doc?.paragraph ?? "Analysis unavailable."}</p>
          )}
          {!loading && (doc?.bottlenecks?.length ?? 0) > 0 && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {doc!.bottlenecks!.slice(0, 4).map((b, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-border/30 bg-white/60">
                  <div className="text-[10px] font-bold text-foreground mb-0.5">{b.title}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug"><span className="font-semibold text-foreground/80">Pain:</span> {b.pain}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl p-5 border-2" style={{ borderColor: "rgba(200,168,128,0.4)", background: "linear-gradient(135deg, #fffbf0, #fff8f5)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C8A880]/20"><Lightbulb className="w-4 h-4 text-[#C8A880]" /></div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#C8A880]">Improvement AI Plan</div>
              <h3 className="text-sm font-bold text-foreground leading-tight">Next moves to lift performance</h3>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 rounded bg-muted/30 animate-pulse" />
              <div className="h-3 rounded bg-muted/30 animate-pulse w-5/6" />
            </div>
          ) : aiPlan.length === 0 ? (
            <p className="text-[11px] text-foreground/70">No improvement actions surfaced for this period.</p>
          ) : (
            <ol className="space-y-2">
              {aiPlan.map((a, i) => (
                <li key={i} className="flex gap-2 text-[11px] text-foreground/85 leading-snug">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#C8A880] text-white text-[9px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * TASKS & ALERTS WIREFRAME BLOCKS
 * Per the user's drawing:
 *  - 3-column hero: Red Flagged Missed Actions (with Analysis) | Tasks Priority Name→Action (AI agent) | Leads Insights to prioritize
 *  - AI Action Taken commentary panel below
 * ─────────────────────────────────────────────────────────────────────────── */
interface TaskRow { id: string; priority: string; label: string; due: string; contact: string | null; done: boolean }

export function TasksAlertsWireframeBlocks({ tasks }: { tasks: TaskRow[] }) {
  const { doc, loading } = useScopedAnalysis("daily");

  const redFlagged = [
    { name: "Nora Al-Faisal",    issue: "Missed call · 2h overdue",        impact: "high"   },
    { name: "Tariq Al-Rashid",   issue: "Proposal follow-up · 1 day late", impact: "high"   },
    { name: "Khaled Bin Saad",   issue: "8 days silent on hot lead",       impact: "medium" },
  ];

  const prioritizedTasks = (tasks ?? [])
    .filter(t => !t.done && (t.priority === "urgent" || t.priority === "high"))
    .slice(0, 5)
    .map(t => ({
      name: t.contact ?? "—",
      action: t.label,
      priority: t.priority,
      ai: t.priority === "urgent" ? "Auto-execute drafted" : "Suggested next step",
    }));

  const leadInsights = [
    { name: "Nayif Trading Co",      reason: "Funding round closed last week — buyer signals up",      score: 92 },
    { name: "Mubadala Health",       reason: "New CTO hired — re-open deal cycle",                     score: 88 },
    { name: "Aramco Digital Ventures", reason: "RFQ posted matching your offer — respond within 48h",   score: 95 },
  ];

  const para = doc?.paragraph ?? "";
  const flaggedAnalysis = para ? `${redFlagged.length} red-flagged contacts. ${para.split(".")[0] ?? ""}.` : undefined;

  return (
    <div className="space-y-5">
      {/* Header band */}
      <div className="rounded-2xl p-5 border relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fffbf0 0%, #f9f3ff 60%, #f0f9f8 100%)", borderColor: "rgba(200,168,128,0.3)" }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #C8A880, transparent)" }} />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl nf-chameleon-bg flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#C8A880] mb-0.5">To-Do &amp; Alerts</div>
            <h2 className="text-lg font-black text-foreground mb-1">High priorities · tasks · efficiency</h2>
            <p className="text-xs text-foreground/75 leading-relaxed">Three lenses: what's red-flagged, what to act on next (Name → Action by AI agent), and which leads to prioritize.</p>
          </div>
        </div>
      </div>

      {/* 3-column hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Red Flagged Missed Actions */}
        <div className="glass-card rounded-2xl p-4 border-l-4 border-[#C8A880]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C8A880]/15"><AlertTriangle className="w-4 h-4 text-[#C8A880]" /></div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#C8A880]">Red Flagged</div>
              <h3 className="text-sm font-bold text-foreground leading-tight">Missed Actions</h3>
            </div>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[#C8A880]/20 text-[#C8A880] font-bold">{redFlagged.length}</span>
          </div>
          <ul className="space-y-2">
            {redFlagged.map((r, i) => (
              <li key={i} className="p-2.5 rounded-lg bg-white/70 border border-border/30">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[11px] font-bold text-foreground truncate">{r.name}</span>
                  <span className={"text-[9px] font-bold px-1.5 py-0.5 rounded-full " + (r.impact === "high" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700")}>{r.impact}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">{r.issue}</p>
              </li>
            ))}
          </ul>
          <AnalysisInset text={flaggedAnalysis} loading={loading} />
        </div>

        {/* Tasks Priority — Name → Action (AI agent) */}
        <div className="glass-card rounded-2xl p-4 border-l-4 border-[#B8A0C8]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#B8A0C8]/15"><ListChecks className="w-4 h-4 text-[#B8A0C8]" /></div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#B8A0C8]">Tasks Priority</div>
              <h3 className="text-sm font-bold text-foreground leading-tight">Name → Action <span className="font-normal text-muted-foreground">(AI agent)</span></h3>
            </div>
          </div>
          {prioritizedTasks.length === 0 ? (
            <div className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-[#88B8B0] mx-auto mb-1" />
              <p className="text-[11px] text-muted-foreground">All urgent tasks cleared.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {prioritizedTasks.map((t, i) => (
                <li key={i} className="p-2.5 rounded-lg bg-white/70 border border-border/30">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-foreground truncate">{t.name}</span>
                    <span className={"text-[9px] font-bold px-1.5 py-0.5 rounded-full " + (t.priority === "urgent" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700")}>{t.priority}</span>
                  </div>
                  <p className="text-[10px] text-foreground/75 leading-snug">{t.action}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Bot className="w-3 h-3 text-[#B8A0C8]" />
                    <span className="text-[9px] font-semibold text-[#B8A0C8]">{t.ai}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Leads Insights to prioritize */}
        <div className="glass-card rounded-2xl p-4 border-l-4 border-[#88B8B0]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#88B8B0]/15"><Zap className="w-4 h-4 text-[#88B8B0]" /></div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#88B8B0]">Leads Insights</div>
              <h3 className="text-sm font-bold text-foreground leading-tight">Top leads to prioritize</h3>
            </div>
          </div>
          <ul className="space-y-2">
            {leadInsights.map((l, i) => (
              <li key={i} className="p-2.5 rounded-lg bg-white/70 border border-border/30">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[11px] font-bold text-foreground truncate">{l.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#88B8B0]/20 text-[#88B8B0]">{l.score}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">{l.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI Action Taken commentary */}
      <div className="rounded-2xl p-5 border relative overflow-hidden" style={{ borderColor: "rgba(184,160,200,0.35)", background: "linear-gradient(135deg, #f9f3ff 0%, #f0f9f8 70%, #ffffff 100%)" }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #B8A0C8, transparent)" }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#B8A0C8]/15"><Bot className="w-4 h-4 text-[#B8A0C8]" /></div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#B8A0C8]">AI Action Taken</div>
              <h3 className="text-sm font-bold text-foreground leading-tight">What the AI agent did on your behalf — and why it matters</h3>
            </div>
          </div>
          <p className="text-[12px] text-foreground/85 leading-relaxed mb-3">
            AI is configured to act on missed connections so deals don't go cold. <strong>Trade-off:</strong> auto-actions can dent your scoring &amp; efficiency rating because they're attributed to the agent, not to you. Review and own the high-value moves manually.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-white/70 border border-border/30">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#88B8B0] mb-0.5">Auto-connected</div>
              <div className="text-base font-black text-foreground leading-none">4</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">missed contacts re-engaged</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/70 border border-border/30">
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#C8A880] mb-0.5">Drafted &amp; queued</div>
              <div className="text-base font-black text-foreground leading-none">7</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">awaiting your approval</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/70 border border-border/30">
              <div className="text-[9px] font-bold uppercase tracking-widest text-red-600 mb-0.5">Scoring impact</div>
              <div className="text-base font-black text-foreground leading-none">-3 pts</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">attributed to agent vs you</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
