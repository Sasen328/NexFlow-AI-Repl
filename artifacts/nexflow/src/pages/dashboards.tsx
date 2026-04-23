import { Link } from "wouter";
import { useDashboards, useCreate, useDelete, useDuplicateDashboard, useDashboardBuilder, apiFetch } from "@/hooks/useApi";
import { Plus, LayoutDashboard, Sparkles, Copy, Trash2, Loader2, Wand2 } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const TEMPLATES = [
  "CEO weekly view: pipeline value, won this month, top reps, conversion funnel",
  "SDR daily standup: calls completed, signals new, contacts engaged, leaderboard",
  "Quarter review: deals won by week, stage conversion ratios, lost reasons",
];

export default function DashboardsPage() {
  const { data, isLoading } = useDashboards();
  const create = useCreate("/dashboards", ["dashboards"]);
  const dup = useDuplicateDashboard();
  const del = useDelete((id: string) => `/dashboards/${id}`, ["dashboards"]);
  const builder = useDashboardBuilder();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  const dashboards = data?.dashboards ?? [];

  async function buildWithAi() {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    try {
      const spec = await builder.mutateAsync(aiPrompt);
      const dash = await apiFetch(`/dashboards`, { method: "POST", body: JSON.stringify({ name: spec.name, description: spec.description }) });
      let pos = 0;
      for (const w of (spec.widgets ?? [])) {
        await apiFetch(`/dashboards/${dash.id}/widgets`, {
          method: "POST",
          body: JSON.stringify({ type: w.type, title: w.title, config: w.config ?? {}, width: w.width ?? "md", position: pos++ }),
        });
      }
      qc.invalidateQueries({ queryKey: ["dashboards"] });
      setAiPrompt("");
    } finally { setAiBusy(false); }
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboards</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Custom dashboards composed of metrics, funnels, leaderboards, time-series, and live charts.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> New Dashboard
        </button>
      </div>

      {/* AI quick-build */}
      <div className="glass-card rounded-2xl p-5 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-4 h-4 text-[#B8A0C8]" />
          <h3 className="font-bold text-foreground text-sm">AI Dashboard Builder</h3>
          <span className="text-xs text-muted-foreground">— describe what you want; AI assembles widgets.</span>
        </div>
        <textarea
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          placeholder="e.g. Quarterly executive view with pipeline value, deals won by week, conversion funnel, and top performing reps."
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-background/60 border border-border/40 text-sm outline-none mb-2 resize-none"
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map(t => (
              <button key={t} onClick={() => setAiPrompt(t)} className="text-[11px] px-2 py-1 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground">
                {t.split(":")[0]}
              </button>
            ))}
          </div>
          <button
            onClick={buildWithAi}
            disabled={!aiPrompt.trim() || aiBusy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg nf-chameleon-bg text-white text-xs font-semibold disabled:opacity-50"
          >
            {aiBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Build dashboard
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-36 glass-card rounded-2xl animate-pulse" />) :
          dashboards.length === 0 ? (
            <div className="col-span-full text-center text-sm text-muted-foreground py-10 glass-card rounded-2xl">
              No dashboards yet. Try the AI builder above or create one manually.
            </div>
          ) : dashboards.map((d: any) => (
            <DashboardCard key={d.id} d={d} onDuplicate={() => dup.mutate(d.id)} onDelete={() => { if (confirm(`Delete "${d.name}"?`)) del.mutate(d.id); }} />
          ))
        }
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md bg-background" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">New dashboard</h3>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Dashboard name" className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none" />
            <div className="flex gap-2 mt-5 justify-end">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={() => create.mutate({ name, description: "Custom dashboard" }, { onSuccess: () => { setShowNew(false); setName(""); } })} disabled={!name} className="px-4 py-2 rounded-lg nf-chameleon-bg text-white text-sm font-semibold disabled:opacity-50">Create</button>
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
    <div className="glass-card rounded-2xl p-5 hover:shadow-md group relative h-full">
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDuplicate(); }} className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground" title="Duplicate">
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg bg-muted/60 hover:bg-[#C8A880]/20 text-muted-foreground hover:text-[#C8A880]" title="Delete">
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
