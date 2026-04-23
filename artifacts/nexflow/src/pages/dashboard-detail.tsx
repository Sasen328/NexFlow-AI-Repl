import { useParams, Link } from "wouter";
import { useDashboardDetail, useWidgetData, useReportBuilder, useDelete, apiFetch } from "@/hooks/useApi";
import { ArrowLeft, Sparkles, Plus, X, BarChart3, TrendingUp, Award, Activity as ActivityIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useDashboardDetail(id!);
  const widgetData = useWidgetData();
  const reportBuilder = useReportBuilder();
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [showAi, setShowAi] = useState(false);
  const [pendingSpec, setPendingSpec] = useState<any>(null);
  const delWidget = useDelete((wid) => `/dashboards/widgets/${wid}`, ["dashboards", id!]);

  if (!data) return <div className="h-32 glass-card rounded-2xl animate-pulse" />;

  async function addAiWidget() {
    if (!pendingSpec) return;
    await apiFetch(`/dashboards/${id}/widgets`, {
      method: "POST",
      body: JSON.stringify({
        type: pendingSpec.widget_type,
        title: pendingSpec.title,
        config: pendingSpec.config ?? {},
        position: (data.widgets?.length ?? 0),
        width: "md",
      }),
    });
    setPendingSpec(null);
    setPrompt("");
    setShowAi(false);
    qc.invalidateQueries({ queryKey: ["dashboards", id] });
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <Link href="/dashboards"><div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"><ArrowLeft className="w-3 h-3" /> Back</div></Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data.description}</p>
        </div>
        <button onClick={() => setShowAi(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
          <Sparkles className="w-4 h-4" /> Add with AI
        </button>
      </div>

      {showAi && (
        <div className="glass-card rounded-2xl p-5 border border-[#B8A0C8]/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
            <h3 className="font-bold text-foreground text-sm">AI Report Builder</h3>
          </div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. Show me total pipeline value, OR: Top reps by won deals this month" rows={2} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none mb-3" />
          <div className="flex gap-2">
            <button onClick={() => setShowAi(false)} className="px-3 py-2 rounded-lg text-xs text-muted-foreground">Cancel</button>
            <button onClick={() => reportBuilder.mutate(prompt, { onSuccess: setPendingSpec })} disabled={!prompt || reportBuilder.isPending} className="px-3 py-2 rounded-lg nf-chameleon-bg text-white text-xs font-semibold disabled:opacity-50">
              {reportBuilder.isPending ? "Generating…" : "Generate Spec"}
            </button>
          </div>
          {pendingSpec && (
            <div className="mt-3 p-3 rounded-lg bg-muted/40 text-xs">
              <div className="font-bold text-foreground">{pendingSpec.title}</div>
              <div className="text-muted-foreground mt-0.5">Type: {pendingSpec.widget_type} · {pendingSpec.explanation}</div>
              <button onClick={addAiWidget} className="mt-2 px-3 py-1.5 rounded-lg bg-[#88B8B0] text-white text-xs font-semibold">Add to dashboard</button>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
        {(data.widgets ?? []).map((w: any) => (
          <Widget key={w.id} widget={w} className={w.type === "metric" ? "md:col-span-1" : w.type === "leaderboard" ? "md:col-span-2" : "md:col-span-2 lg:col-span-4"} onDelete={() => delWidget.mutate(w.id)} />
        ))}
        {!(data.widgets ?? []).length && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">No widgets yet — use AI to add your first one above.</div>
        )}
      </div>
    </div>
  );
}

function Widget({ widget, className, onDelete }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/dashboards/widget-data", { method: "POST", body: JSON.stringify({ type: widget.type, config: widget.config }) })
      .then(setData).finally(() => setLoading(false));
  }, [widget.id]);

  return (
    <div className={"glass-card rounded-2xl p-5 group relative " + className}>
      <button onClick={onDelete} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[#C8A880]"><X className="w-3.5 h-3.5" /></button>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">{widget.title}</div>
      {loading ? <div className="h-12 bg-muted animate-pulse rounded" /> : <WidgetView type={widget.type} config={widget.config} data={data} />}
    </div>
  );
}

function WidgetView({ type, config, data }: any) {
  if (type === "metric") {
    const v = data?.value ?? 0;
    const display = config?.format === "currency" ? `$${Number(v).toLocaleString()}` : Number(v).toLocaleString();
    return <div className="text-3xl font-black nf-text-chameleon">{display}</div>;
  }
  if (type === "funnel" || type === "deal_stages") {
    const max = Math.max(...(data?.data ?? []).map((d: any) => d.count), 1);
    return (
      <div className="space-y-2 mt-2">
        {(data?.data ?? []).map((d: any) => (
          <div key={d.stage} className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground w-24 capitalize">{d.stage.replace("_", " ")}</div>
            <div className="flex-1 h-6 bg-muted/40 rounded-md overflow-hidden">
              <div className="h-full nf-chameleon-bg flex items-center justify-end px-2 text-white text-xs font-bold" style={{ width: `${Math.max(8, (d.count / max) * 100)}%` }}>{d.count}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (type === "leaderboard") {
    return (
      <div className="space-y-1.5 mt-2">
        {(data?.data ?? []).map((u: any, i: number) => (
          <div key={u.id} className="flex items-center gap-2 text-sm">
            <Award className={"w-4 h-4 " + (i === 0 ? "text-[#C8A880]" : i === 1 ? "text-[#90B8B8]" : "text-muted-foreground")} />
            <div className="flex-1 truncate">{u.name}</div>
            <div className="text-xs font-bold text-[#88B8B0]">${(u.won_value ?? 0).toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">{u.calls_completed} calls</div>
          </div>
        ))}
      </div>
    );
  }
  return <pre className="text-xs text-muted-foreground overflow-auto max-h-32">{JSON.stringify(data, null, 2)}</pre>;
}
