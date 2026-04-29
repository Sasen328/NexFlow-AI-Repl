import { Link } from "wouter";
import { useDashboards, useCreate, useDelete, useDuplicateDashboard, useDashboardBuilder, apiFetch } from "@/hooks/useApi";
import {
  Plus, LayoutDashboard, Sparkles, Copy, Trash2, Loader2, Wand2,
  BarChart3, TrendingUp, Users, Phone, Target, DollarSign,
  CheckCircle2, ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    label: "CEO Weekly View",
    icon: TrendingUp,
    color: "#B8A0C8",
    description: "Pipeline value, revenue won, conversion funnel, top reps",
    prompt: "CEO weekly view: pipeline value, won this month, top reps, conversion funnel",
  },
  {
    label: "SDR Daily Standup",
    icon: Phone,
    color: "#88B8B0",
    description: "Calls completed, signals, contacts engaged, leaderboard",
    prompt: "SDR daily standup: calls completed, signals new, contacts engaged, leaderboard",
  },
  {
    label: "Quarter Review",
    icon: BarChart3,
    color: "#C8A880",
    description: "Deals won by week, stage conversion ratios, lost reasons",
    prompt: "Quarter review: deals won by week, stage conversion ratios, lost reasons",
  },
  {
    label: "Marketing ROI",
    icon: Target,
    color: "#90B8B8",
    description: "Campaign performance, pipeline influenced, cost per lead",
    prompt: "Marketing ROI: campaign performance, pipeline influenced, cost per lead by channel",
  },
  {
    label: "Revenue Forecast",
    icon: DollarSign,
    color: "#C0A0B8",
    description: "Best/commit/worst case scenarios, deal health, churn risk",
    prompt: "Revenue forecast: Q2 best case, commit and worst case, deals at risk, churn alerts",
  },
  {
    label: "Relationship Health",
    icon: Users,
    color: "#B8B880",
    description: "Engagement decay, last contacted, response rates by rep",
    prompt: "Relationship health: contacts not contacted in 14d, avg response rate, engagement decay by rep",
  },
];

const BUILD_STEPS = [
  "Analysing your requirements…",
  "Selecting optimal widget types…",
  "Configuring metrics and data sources…",
  "Assembling dashboard layout…",
  "Finalising…",
];

export default function DashboardsPage() {
  const { data, isLoading, refetch } = useDashboards();
  const create = useCreate("/dashboards", ["dashboards"]);
  const dup = useDuplicateDashboard();
  const del = useDelete((id: string) => `/dashboards/${id}`, ["dashboards"]);
  const builder = useDashboardBuilder();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [lastBuilt, setLastBuilt] = useState<string | null>(null);

  useEffect(() => {
    if (!aiBusy) return;
    setBuildStep(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i < BUILD_STEPS.length) setBuildStep(i);
      else clearInterval(iv);
    }, 700);
    return () => clearInterval(iv);
  }, [aiBusy]);

  const dashboards = data?.dashboards ?? [];

  async function buildWithAi() {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    try {
      const spec = await builder.mutateAsync(aiPrompt);
      const dash = await apiFetch(`/dashboards`, { method: "POST", body: JSON.stringify({ name: spec.name ?? "AI Dashboard", description: spec.description ?? aiPrompt }) });
      let pos = 0;
      for (const w of (spec.widgets ?? [])) {
        await apiFetch(`/dashboards/${dash.id}/widgets`, {
          method: "POST",
          body: JSON.stringify({ type: w.type, title: w.title, config: w.config ?? {}, width: w.width ?? "md", position: pos++ }),
        });
      }
      qc.invalidateQueries({ queryKey: ["dashboards"] });
      setLastBuilt(spec.name ?? "AI Dashboard");
      setAiPrompt("");
      refetch();
    } finally { setAiBusy(false); }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#B8A0C8]" /> Dashboards
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">AI-assembled dashboards with live metrics, funnels, and leaderboards</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Dashboard
        </button>
      </div>

      {/* AI Dashboard Builder — full card */}
      <div className="glass-card rounded-2xl p-6 border border-[#B8A0C8]/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B8A0C8] to-[#88B8B0] flex items-center justify-center shadow-sm">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">AI Dashboard Generator</h3>
            <p className="text-xs text-muted-foreground">Describe what you need in plain language — AI assembles a full dashboard with widgets, metrics, and data</p>
          </div>
        </div>

        {/* Template chips */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {TEMPLATES.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.label} onClick={() => setAiPrompt(t.prompt)}
                className={cn("p-3 rounded-xl border text-left transition-all",
                  aiPrompt === t.prompt
                    ? "border-transparent shadow-sm"
                    : "border-border/30 bg-muted/20 hover:bg-muted/40")}
                style={aiPrompt === t.prompt ? { background: `${t.color}15`, borderColor: `${t.color}40` } : {}}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5" style={{ color: t.color }} />
                  <span className="text-xs font-semibold text-foreground">{t.label}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{t.description}</div>
              </button>
            );
          })}
        </div>

        {/* Custom prompt */}
        <div className="mb-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Or describe your own</label>
          <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
            placeholder="e.g. VP Sales view with UAE pipeline breakdown, top 5 deals at risk, team call activity, and MTD revenue vs target"
            rows={2} className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#B8A0C8]/40 resize-none" />
        </div>

        {/* Build state */}
        {aiBusy ? (
          <div className="p-4 rounded-xl bg-[#B8A0C8]/10 border border-[#B8A0C8]/20">
            <div className="space-y-2">
              {BUILD_STEPS.map((s, i) => (
                <div key={i} className={cn("flex items-center gap-2 text-xs transition-all",
                  i < buildStep ? "text-[#88B8B0]" : i === buildStep ? "text-foreground font-medium" : "text-muted-foreground/40")}>
                  {i < buildStep ? <CheckCircle2 className="w-3 h-3 text-[#88B8B0] flex-shrink-0" /> :
                   i === buildStep ? <Loader2 className="w-3 h-3 animate-spin text-[#B8A0C8] flex-shrink-0" /> :
                   <div className="w-3 h-3 rounded-full border border-muted-foreground/20 flex-shrink-0" />}
                  {s}
                </div>
              ))}
            </div>
          </div>
        ) : lastBuilt ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#88B8B0]/10 border border-[#88B8B0]/20 mb-3">
            <CheckCircle2 className="w-4 h-4 text-[#88B8B0] flex-shrink-0" />
            <div className="flex-1 text-sm text-foreground">
              Dashboard <span className="font-semibold">"{lastBuilt}"</span> created successfully
            </div>
            <button onClick={() => setLastBuilt(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>
        ) : null}

        {!aiBusy && (
          <button onClick={buildWithAi} disabled={!aiPrompt.trim()}
            className="w-full py-2.5 rounded-xl nf-chameleon-bg text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all">
            <Sparkles className="w-4 h-4" /> Generate Dashboard with AI
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dashboard grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array(3).fill(0).map((_, i) => <div key={i} className="h-36 glass-card rounded-2xl animate-pulse" />)
          : dashboards.length === 0
          ? (
            <div className="col-span-full glass-card rounded-2xl p-10 text-center">
              <LayoutDashboard className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">No dashboards yet</p>
              <button onClick={() => { setAiPrompt(TEMPLATES[0].prompt); }} className="text-xs text-[#B8A0C8] hover:underline">
                Try "CEO Weekly View" above →
              </button>
            </div>
          )
          : dashboards.map((d: any) => (
            <DashboardCard key={d.id} d={d}
              onDuplicate={() => dup.mutate(d.id)}
              onDelete={() => { if (confirm(`Delete "${d.name}"?`)) del.mutate(d.id); }}
            />
          ))
        }
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">New Dashboard</h3>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Dashboard name"
              className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none focus:border-[#B8A0C8]" />
            <div className="flex gap-2 mt-5 justify-end">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm text-muted-foreground">Cancel</button>
              <button onClick={() => create.mutate({ name, description: "Custom dashboard" }, { onSuccess: () => { setShowNew(false); setName(""); } })}
                disabled={!name} className="px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ d, onDuplicate, onDelete }: any) {
  const updated = d.updated_at ? new Date(d.updated_at).toLocaleDateString() : "—";
  return (
    <div className="glass-card rounded-2xl p-5 hover:shadow-md group relative h-full transition-all hover:-translate-y-0.5">
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onDuplicate(); }}
          className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground" title="Duplicate">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
          className="p-1.5 rounded-lg bg-muted/60 hover:bg-[#C8A880]/20 text-muted-foreground hover:text-[#C8A880]" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <Link href={`/dashboards/${d.id}`}>
        <div className="cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#B8A0C8]/15 text-[#B8A0C8] flex items-center justify-center mb-3">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="font-bold text-foreground">{d.name}</div>
          <p className="text-xs text-muted-foreground mt-1 mb-3 line-clamp-2 min-h-[2rem]">{d.description}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            <span>Updated {updated}</span>
            {d.is_shared && <span className="px-1.5 py-0.5 rounded bg-[#88B8B0]/15 text-[#88B8B0] font-bold">SHARED</span>}
          </div>
        </div>
      </Link>
    </div>
  );
}
