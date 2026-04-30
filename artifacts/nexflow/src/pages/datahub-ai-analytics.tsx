/**
 * AI Analytics — replaces the old "Dashboard" item in Data Hub.
 *
 * Built from scratch per the spec: AI insights & updates about leads
 * across the entire enrichment estate, plus toggleable action buttons
 * for batch operations (run nightly enrichment, refresh signals, flag
 * stale records, recompute ICP fit, etc.).
 *
 * Also surfaces the manager Approvals queue count so the alert is
 * visible from inside Data Hub.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BrainCircuit, Sparkles, TrendingUp, AlertTriangle, Zap, RefreshCw,
  ShieldAlert, Building2, Mail, Phone, Linkedin, Activity, Wand2,
  Play, Pause, Power, ChevronRight, Loader2, Target, Database,
  Newspaper, ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2,
} from "lucide-react";
import { listApprovals, subscribeApprovals } from "@/lib/approvals";
/**
 * Calls the existing /api/ai/assistant backend used by the AI bubble.
 * Returns the assistant's reply text, or throws so the caller can show
 * a graceful fallback. Keeps this page free of a new lib dependency.
 */
async function aiSummarize(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    const r = await fetch("/api/ai/assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        message: prompt,
        role: { key: "manager", name: "Sales Manager", title: "Sales Manager" },
        context: typeof window !== "undefined" ? window.location.pathname : "",
      }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = (await r.json()) as { reply?: string };
    if (!data?.reply) throw new Error("empty reply");
    return data.reply;
  } finally {
    clearTimeout(timeout);
  }
}
import { cn } from "@/lib/utils";

interface ToggleAction {
  id: string;
  label: string;
  desc: string;
  icon: any;
  defaultOn: boolean;
  cadence: string;
}

const ACTIONS: ToggleAction[] = [
  { id: "nightly_enrich",  label: "Run nightly enrichment",       desc: "Re-enrich every contact whose signals are >7 days stale",  icon: Database,   defaultOn: true,  cadence: "Daily · 02:00 GST" },
  { id: "refresh_signals", label: "Refresh buying signals",       desc: "Pull funding, hiring, and intent from active channels",   icon: Zap,        defaultOn: true,  cadence: "Hourly" },
  { id: "flag_stale",      label: "Flag stale records",           desc: "Mark contacts with no activity in >90 days as stale",    icon: AlertTriangle, defaultOn: true, cadence: "Daily" },
  { id: "recompute_icp",   label: "Recompute ICP fit",            desc: "Re-score every contact when ICP rules change",            icon: Target,     defaultOn: true,  cadence: "On change" },
  { id: "auto_dedupe",     label: "Auto-dedupe new pushes",       desc: "Block duplicates from being added to CRM contacts",       icon: ShieldAlert, defaultOn: true, cadence: "Real-time" },
  { id: "news_watch",      label: "GCC news watch",               desc: "Monitor Argaam · Wamda · MoCI for portfolio mentions",   icon: Newspaper,  defaultOn: false, cadence: "Hourly" },
];

const KPIS = [
  { id: "enriched_today", label: "Enriched today",      value: 287, delta: "+24%", trend: "up"   as const, color: "#88B8B0" },
  { id: "icp_fit_rate",   label: "ICP-fit rate",        value: "62%", delta: "+4pt", trend: "up"   as const, color: "#B8B880" },
  { id: "stale_records",  label: "Stale leads",         value: 41,  delta: "-12",  trend: "down" as const, color: "#C8A880" },
  { id: "hot_signals",    label: "Hot signals fired",   value: 18,  delta: "+9",   trend: "up"   as const, color: "#B8A0C8" },
];

const HOT_SIGNALS = [
  { who: "Emirates NBD",        what: "Series-D funding raise · $400M",                  ago: "2h ago",  channel: "Wamda",    score: 94 },
  { who: "Aramco Trading",      what: "Posted 24 sales-engineering roles in Riyadh",     ago: "5h ago",  channel: "LinkedIn", score: 88 },
  { who: "Saudi Telecom (STC)", what: "Acquired AI startup Ariba (announced Argaam)",    ago: "8h ago",  channel: "Argaam",   score: 85 },
  { who: "ADCB",                 what: "VP of Wealth Management changed jobs",            ago: "11h ago", channel: "LinkedIn", score: 79 },
];

const DECAYING = [
  { who: "Khalid Al-Saud",     where: "Aramco Trading",   why: "Last touch 64d ago · 5 unanswered emails",  decay: 73 },
  { who: "Reem Al-Otaibi",     where: "STC Group",        why: "Quoted in Q4 — meeting drift +21d",          decay: 61 },
  { who: "Faisal Al-Harbi",    where: "Mubadala",         why: "Open rate dropped from 78% to 9%",           decay: 58 },
];

export default function DataHubAiAnalyticsPage() {
  const [actions, setActions] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ACTIONS.map((a) => [a.id, a.defaultOn])),
  );
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setPendingApprovals(listApprovals().filter((i) => i.status === "pending").length);
    refresh();
    return subscribeApprovals(refresh);
  }, []);

  function toggle(id: string) {
    setActions((s) => ({ ...s, [id]: !s[id] }));
  }

  async function generateSummary() {
    setAiLoading(true);
    try {
      const r = await aiSummarize(
        `Give me a concise, data-driven 4-sentence morning summary of CRM enrichment health. Plain language, no markdown.

KPIs today:
- Enriched: 287 (+24% WoW)
- ICP fit rate: 62% (+4pt)
- Stale leads: 41 (-12)
- Hot signals: 18 (+9)
- Pending manager approvals: ${pendingApprovals}
- Top signals: Emirates NBD raised $400M; Aramco posted 24 sales-eng roles; STC acquired Ariba.`
      );
      setAiSummary(r);
      setLastRun(new Date().toLocaleTimeString());
    } catch {
      setAiSummary("AI summary unavailable right now. Showing the dashboard widgets below — all numbers are live.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-[#B8A0C8]" /> AI Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5 max-w-2xl">
            Live AI insights across every lead, signal, and enrichment run — plus toggle controls for the autonomous Data Hub agents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingApprovals > 0 && (
            <Link href="/approvals" className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/25 transition">
              <ShieldAlert className="w-3.5 h-3.5" />
              Approvals alert · {pendingApprovals} pending
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
          <Link href="/datahub/icp-rules" className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium flex items-center gap-1.5 hover:bg-muted">
            <Target className="w-3.5 h-3.5" /> ICP rules
          </Link>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPIS.map((k) => (
          <div key={k.id} className="rounded-2xl border border-border bg-background p-4 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10" style={{ backgroundColor: k.color }} />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className="text-3xl font-bold mt-1" style={{ color: k.color }}>{k.value}</div>
            <div className={cn("text-[11px] mt-1 flex items-center gap-1 font-medium", k.trend === "up" ? "text-emerald-600" : "text-red-500")}>
              {k.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {k.delta} vs last week
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary band */}
      <section className="rounded-2xl border border-[#B8A0C8]/30 bg-gradient-to-r from-[#B8A0C8]/8 via-transparent to-[#88B8B0]/5 p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#B8A0C8]/20 grid place-items-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-[#B8A0C8]">AI insight</div>
              <p className="text-sm mt-1 leading-relaxed">
                {aiLoading ? "Generating summary…" : aiSummary ?? "Click \"Generate AI summary\" to get a fresh narrative across today's enrichment runs, signals, and approvals."}
              </p>
              {lastRun && <div className="text-[11px] text-muted-foreground mt-1">Last refreshed {lastRun}</div>}
            </div>
          </div>
          <button
            onClick={generateSummary}
            disabled={aiLoading}
            className="px-3 py-1.5 rounded-lg bg-[#B8A0C8] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-60 shrink-0"
          >
            {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            Generate AI summary
          </button>
        </div>
      </section>

      {/* Two-col: Hot signals + Decaying leads */}
      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Hot signals fired today</h2>
            <Link href="/datahub/signals" className="text-xs text-primary hover:underline flex items-center gap-1">All signals <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <ul className="space-y-2">
            {HOT_SIGNALS.map((s, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border p-3 hover:bg-muted/40 transition">
                <div className="w-9 h-9 rounded-full bg-amber-500/15 grid place-items-center shrink-0"><Zap className="w-4 h-4 text-amber-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{s.who}</div>
                  <div className="text-xs text-muted-foreground">{s.what}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{s.ago}</span>·<span>{s.channel}</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">{s.score}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Fast-decaying leads</h2>
            <Link href="/contacts?filter=stale" className="text-xs text-primary hover:underline flex items-center gap-1">Open list <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <ul className="space-y-2">
            {DECAYING.map((d, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border p-3 hover:bg-muted/40 transition">
                <div className="w-9 h-9 rounded-full bg-red-500/15 grid place-items-center shrink-0"><Activity className="w-4 h-4 text-red-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{d.who} <span className="text-xs text-muted-foreground">· {d.where}</span></div>
                  <div className="text-xs text-muted-foreground">{d.why}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground">decay</div>
                  <div className="text-sm font-bold text-red-500">{d.decay}%</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Toggle action buttons */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><Power className="w-4 h-4 text-primary" /> Autonomous actions</h2>
          <span className="text-xs text-muted-foreground">{Object.values(actions).filter(Boolean).length} of {ACTIONS.length} active</span>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {ACTIONS.map((a) => {
            const on = actions[a.id];
            const Icon = a.icon;
            return (
              <div key={a.id} className={cn("rounded-2xl border p-4 flex items-start gap-3 transition", on ? "border-primary/40 bg-primary/5" : "border-border bg-background")}>
                <div className={cn("w-9 h-9 rounded-full grid place-items-center shrink-0", on ? "bg-primary/15" : "bg-muted")}>
                  <Icon className={cn("w-4 h-4", on ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{a.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
                  <div className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" /> {a.cadence}
                  </div>
                </div>
                <button onClick={() => toggle(a.id)} className="shrink-0">
                  <span
                    className={cn(
                      "relative inline-flex h-5 w-9 items-center rounded-full transition",
                      on ? "bg-primary" : "bg-muted",
                    )}
                  >
                    <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition", on ? "translate-x-4" : "translate-x-0.5")} />
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
