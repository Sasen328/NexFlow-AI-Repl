import { useState } from "react";
import {
  TrendingUp, Target, DollarSign, Users, ChevronDown, Sparkles,
  ArrowUpRight, ArrowDownRight, BarChart3, Calendar, Filter,
  CheckCircle2, AlertCircle, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Forecast categories — Salesforce-inspired
const CATEGORIES = [
  { key: "closed",  label: "Closed Won", color: "#88B8B0", value: 1_840_000, weight: 1.00 },
  { key: "commit",  label: "Commit",     color: "#B8A0C8", value: 2_100_000, weight: 0.85 },
  { key: "best",    label: "Best Case",  color: "#C8A880", value: 3_200_000, weight: 0.55 },
  { key: "pipeline",label: "Pipeline",   color: "#C0A0B8", value: 5_400_000, weight: 0.20 },
];

const QUOTA = 4_500_000;

const REPS = [
  { id: "u1", name: "Khalid Al-Sayed",    role: "VP Sales · KSA",        avatar: "KS", quota: 1_200_000, closed: 580_000,  commit: 720_000,  best: 980_000,  pipeline: 1_650_000, attainment: 108 },
  { id: "u2", name: "Layla Hussain",       role: "AE · UAE",              avatar: "LH", quota: 950_000,  closed: 420_000,  commit: 510_000,  best: 760_000,  pipeline: 1_380_000, attainment: 98 },
  { id: "u3", name: "Omar Farouq",         role: "AE · Qatar/Bahrain",    avatar: "OF", quota: 800_000,  closed: 312_000,  commit: 380_000,  best: 540_000,  pipeline: 980_000,   attainment: 87 },
  { id: "u4", name: "Reem Al-Saud",        role: "Senior AE · Banking",   avatar: "RS", quota: 850_000,  closed: 380_000,  commit: 320_000,  best: 580_000,  pipeline: 760_000,   attainment: 82 },
  { id: "u5", name: "Tariq Bin-Salem",     role: "AE · Oman/Kuwait",      avatar: "TB", quota: 700_000,  closed: 148_000,  commit: 170_000,  best: 340_000,  pipeline: 630_000,   attainment: 45 },
];

const TRENDS = [
  { week: "W14", actual: 280_000, forecast: 320_000 },
  { week: "W15", actual: 410_000, forecast: 380_000 },
  { week: "W16", actual: 360_000, forecast: 420_000 },
  { week: "W17", actual: 520_000, forecast: 480_000 },
  { week: "W18", actual: 470_000, forecast: 510_000 },
  { week: "W19", actual: null,    forecast: 580_000 },
  { week: "W20", actual: null,    forecast: 620_000 },
];

export default function ForecastingPage() {
  const [period, setPeriod] = useState("Q2 2026");

  const totalCommitted = CATEGORIES[0].value + CATEGORIES[1].value;
  const weightedForecast = CATEGORIES.reduce((s, c) => s + c.value * c.weight, 0);
  const attainment = Math.round((totalCommitted / QUOTA) * 100);
  const totalPipeline = CATEGORIES[3].value;
  const coverage = (CATEGORIES.slice(1).reduce((s,c)=>s+c.value,0) / Math.max(QUOTA - CATEGORIES[0].value, 1)).toFixed(1);

  const maxTrend = Math.max(...TRENDS.map((t) => Math.max(t.actual ?? 0, t.forecast)));

  return (
    <div className="max-w-[1500px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-7 h-7 text-[#88B8B0]" />
            <h1 className="text-3xl font-black text-foreground">Forecasting</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Pipeline → Best Case → Commit → Closed Won waterfall. Manager rollup, weighted forecast, AI variance analysis, and per-rep attainment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/40 text-foreground text-sm font-semibold hover:bg-muted/40">
            <Calendar className="w-4 h-4" />
            {period}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/40 text-foreground text-sm font-semibold hover:bg-muted/40">
            <Filter className="w-4 h-4" />
            All teams
          </button>
        </div>
      </div>

      {/* Big number panel */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-[#88B8B0]/10 to-transparent">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-4">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Quota Attainment · {period}</div>
            <div className="flex items-baseline gap-2">
              <div className="text-5xl font-black" style={{ color: attainment >= 100 ? "#88B8B0" : attainment >= 80 ? "#C8A880" : "#C0A0B8" }}>
                {attainment}%
              </div>
              {attainment >= 100 ? (
                <div className="flex items-center gap-1 text-xs font-bold text-[#88B8B0]">
                  <ArrowUpRight className="w-3 h-3" /> on track
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-[#C8A880]">
                  <AlertCircle className="w-3 h-3" /> {100 - attainment}pp gap
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ${(totalCommitted/1000).toFixed(0)}K committed of ${(QUOTA/1000).toFixed(0)}K quota
            </div>
            {/* Quota bar */}
            <div className="mt-3 h-2.5 rounded-full bg-muted/40 overflow-hidden">
              <div className="h-full" style={{ width: `${Math.min(attainment, 100)}%`, background: `linear-gradient(90deg, #88B8B0 0%, #B8A0C8 100%)` }} />
            </div>
          </div>

          <div className="col-span-8">
            {/* Waterfall */}
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3">Forecast Waterfall</div>
            <div className="grid grid-cols-4 gap-3">
              {CATEGORIES.map((c, i) => (
                <div key={c.key} className="relative">
                  <div className="rounded-xl p-3" style={{ background: `${c.color}15`, border: `1px solid ${c.color}40` }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: c.color }}>
                        {c.key === "closed" ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <DollarSign className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md" style={{ background: `${c.color}25`, color: c.color }}>
                        {Math.round(c.weight * 100)}%
                      </span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{c.label}</div>
                    <div className="text-xl font-black" style={{ color: c.color }}>${(c.value/1_000_000).toFixed(2)}M</div>
                  </div>
                  {i < CATEGORIES.length - 1 && (
                    <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="text-muted-foreground">
                <span className="font-bold text-foreground">${(weightedForecast/1_000_000).toFixed(2)}M</span> weighted forecast · coverage ratio <span className="font-bold text-[#88B8B0]">{coverage}×</span> (healthy {">"}3×)
              </div>
              <div className="flex items-center gap-1 text-[#B8A0C8] font-bold">
                <Sparkles className="w-3 h-3" /> AI confidence: 84%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: trend + AI */}
      <div className="grid grid-cols-12 gap-6">
        {/* Trend chart */}
        <div className="col-span-8">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Forecast vs Actual · weekly</h3>
                <p className="text-xs text-muted-foreground">Last 5 weeks · projected next 2</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#88B8B0]" /><span className="text-muted-foreground">Actual</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#B8A0C8] opacity-50" /><span className="text-muted-foreground">Forecast</span></div>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3 h-44 px-2">
              {TRENDS.map((t) => {
                const fH = (t.forecast / maxTrend) * 100;
                const aH = t.actual ? (t.actual / maxTrend) * 100 : 0;
                return (
                  <div key={t.week} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-[9px] text-muted-foreground font-mono">
                      {t.actual ? `$${(t.actual/1000).toFixed(0)}K` : `~$${(t.forecast/1000).toFixed(0)}K`}
                    </div>
                    <div className="w-full flex items-end gap-1 h-32">
                      <div
                        className="flex-1 rounded-t-md bg-[#B8A0C8]/40 border border-[#B8A0C8]/60"
                        style={{ height: `${fH}%` }}
                        title={`Forecast: $${t.forecast.toLocaleString()}`}
                      />
                      {t.actual !== null && (
                        <div
                          className="flex-1 rounded-t-md bg-[#88B8B0]"
                          style={{ height: `${aH}%` }}
                          title={`Actual: $${t.actual.toLocaleString()}`}
                        />
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold">{t.week}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI variance commentary */}
        <div className="col-span-4">
          <div className="glass-card rounded-2xl p-5 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">AI Forecast Analysis</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-[#88B8B0]/10 border border-[#88B8B0]/30">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0]" />
                  <span className="font-bold text-[#88B8B0] text-xs">ON TRACK</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  You are projected to hit <b>108% of quota</b> based on current commit + 50% of best case conversion historical avg.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#C8A880]/10 border border-[#C8A880]/30">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-[#C8A880]" />
                  <span className="font-bold text-[#C8A880] text-xs">RISK FLAGGED</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Tariq Bin-Salem at <b>45% attainment</b> — 2 deals stuck in proposal stage 21+ days. Recommend manager 1-on-1 this week.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/30">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3.5 h-3.5 text-[#B8A0C8]" />
                  <span className="font-bold text-[#B8A0C8] text-xs">PUSH TO COMMIT</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  3 best-case deals worth <b>$580K</b> show buyer-side momentum (calls + WhatsApp activity). High-confidence to graduate.
                </p>
                <button className="mt-2 text-[10px] font-bold text-[#B8A0C8] hover:underline flex items-center gap-1">
                  Review deals <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rep rollup */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border/30 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Forecast by rep</h3>
            <p className="text-xs text-muted-foreground">{REPS.length} sellers · {period}</p>
          </div>
          <button className="flex items-center gap-1 text-xs text-[#B8A0C8] font-semibold hover:underline">
            <BarChart3 className="w-3.5 h-3.5" /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-5 py-2.5 font-bold">Rep</th>
                <th className="text-right px-3 py-2.5 font-bold">Quota</th>
                <th className="text-right px-3 py-2.5 font-bold text-[#88B8B0]">Closed</th>
                <th className="text-right px-3 py-2.5 font-bold text-[#B8A0C8]">Commit</th>
                <th className="text-right px-3 py-2.5 font-bold text-[#C8A880]">Best Case</th>
                <th className="text-right px-3 py-2.5 font-bold text-[#C0A0B8]">Pipeline</th>
                <th className="text-right px-3 py-2.5 font-bold">Attainment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {REPS.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
                        {r.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">{r.name}</div>
                        <div className="text-[10px] text-muted-foreground">{r.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right px-3 py-3 text-xs text-foreground/70">${(r.quota/1000).toFixed(0)}K</td>
                  <td className="text-right px-3 py-3 text-xs font-semibold text-[#88B8B0]">${(r.closed/1000).toFixed(0)}K</td>
                  <td className="text-right px-3 py-3 text-xs font-semibold text-[#B8A0C8]">${(r.commit/1000).toFixed(0)}K</td>
                  <td className="text-right px-3 py-3 text-xs font-semibold text-[#C8A880]">${(r.best/1000).toFixed(0)}K</td>
                  <td className="text-right px-3 py-3 text-xs text-[#C0A0B8]">${(r.pipeline/1000).toFixed(0)}K</td>
                  <td className="text-right px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div className="h-full" style={{ width: `${Math.min(r.attainment,100)}%`, background: r.attainment >= 100 ? "#88B8B0" : r.attainment >= 80 ? "#C8A880" : "#C0A0B8" }} />
                      </div>
                      <span className={cn("text-xs font-black w-10 text-right",
                        r.attainment >= 100 ? "text-[#88B8B0]" : r.attainment >= 80 ? "text-[#C8A880]" : "text-[#C0A0B8]"
                      )}>
                        {r.attainment}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
