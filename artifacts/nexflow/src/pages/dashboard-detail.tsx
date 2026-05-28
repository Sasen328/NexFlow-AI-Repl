import { useParams, Link } from "wouter";
import { useDashboardDetail, useWidgetData, useReportBuilder, useDelete, apiFetch, useUpdateWidget, useDashboardSummary } from "@/hooks/useApi";
import { ArrowLeft, Sparkles, X, Award, ChevronUp, ChevronDown, RefreshCw, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function DashboardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useDashboardDetail(id!);
  const reportBuilder = useReportBuilder();
  const updateWidget = useUpdateWidget(id!);
  const summary = useDashboardSummary();
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [showAi, setShowAi] = useState(false);
  const [pendingSpec, setPendingSpec] = useState<any>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [collected, setCollected] = useState<Record<string, any>>({});
  const delWidget = useDelete((wid) => `/dashboards/widgets/${wid}`, ["dashboards", id!]);

  if (!data) return <div className="h-32 glass-card rounded-2xl animate-pulse" />;

  const widgets = (data.widgets ?? []).slice().sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));

  async function addAiWidget() {
    if (!pendingSpec) return;
    await apiFetch(`/dashboards/${id}/widgets`, {
      method: "POST",
      body: JSON.stringify({
        type: pendingSpec.widget_type,
        title: pendingSpec.title,
        config: pendingSpec.config ?? {},
        position: widgets.length,
        width: "md",
      }),
    });
    setPendingSpec(null);
    setPrompt("");
    setShowAi(false);
    qc.invalidateQueries({ queryKey: ["dashboards", id] });
  }

  async function move(widget: any, dir: -1 | 1) {
    const idx = widgets.findIndex((w: any) => w.id === widget.id);
    const swap = widgets[idx + dir];
    if (!swap) return;
    await Promise.all([
      updateWidget.mutateAsync({ id: widget.id, position: swap.position ?? idx + dir }),
      updateWidget.mutateAsync({ id: swap.id, position: widget.position ?? idx }),
    ]);
  }

  async function runSummary() {
    const items = widgets.map((w: any) => ({ title: w.title, type: w.type, snapshot: collected[w.id] }));
    const r = await summary.mutateAsync(items);
    setAiSummary(r);
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <Link href="/dashboards"><div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"><ArrowLeft className="w-3 h-3" /> Back</div></Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTick(t => t + 1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-foreground text-xs font-semibold hover:bg-muted"
            title="Refresh all widgets"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh all
          </button>
          <button
            onClick={runSummary}
            disabled={summary.isPending || widgets.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 text-foreground text-xs font-semibold hover:bg-muted disabled:opacity-50"
          >
            {summary.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#B8A0C8]" />}
            AI summary
          </button>
          <button onClick={() => setShowAi(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold">
            <Sparkles className="w-4 h-4" /> Add widget with AI
          </button>
        </div>
      </div>

      {aiSummary && (
        <div className="glass-card rounded-2xl p-4 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#B8A0C8] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-foreground">{aiSummary.headline}</div>
                {(aiSummary.callouts ?? []).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {aiSummary.callouts.map((c: any, i: number) => (
                      <li key={i} className="text-xs flex items-center gap-1.5 text-foreground/80">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          c.tone === "good" ? "bg-[#88B8B0]" : c.tone === "warn" ? "bg-[#C8A880]" : "bg-[#90B8B8]"
                        )} />
                        {c.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button onClick={() => setAiSummary(null)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      {showAi && (
        <div className="glass-card rounded-2xl p-5 border border-[#B8A0C8]/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
            <h3 className="font-bold text-foreground text-sm">AI Report Builder</h3>
          </div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. Show me total pipeline value, OR: Top reps by won deals this month" rows={2} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/40 text-sm outline-none mb-3 resize-none" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowAi(false); setPendingSpec(null); }} className="px-3 py-2 rounded-lg text-xs text-muted-foreground">Cancel</button>
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
        {widgets.map((w: any, i: number) => (
          <Widget
            key={w.id}
            widget={w}
            refreshTick={refreshTick}
            className={widthClass(w)}
            onDelete={() => delWidget.mutate(w.id)}
            onMoveUp={i > 0 ? () => move(w, -1) : undefined}
            onMoveDown={i < widgets.length - 1 ? () => move(w, 1) : undefined}
            onSnapshot={(snap: any) => setCollected(prev => ({ ...prev, [w.id]: snap }))}
          />
        ))}
        {widgets.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">No widgets yet — use AI to add your first one above.</div>
        )}
      </div>
    </div>
  );
}

function widthClass(w: any) {
  if (w.width === "sm") return "md:col-span-1";
  if (w.width === "lg") return "md:col-span-2 lg:col-span-3";
  if (w.width === "full") return "md:col-span-2 lg:col-span-4";
  // legacy fallback by type
  if (w.type === "metric") return "md:col-span-1";
  if (w.type === "leaderboard" || w.type === "time_series") return "md:col-span-2";
  return "md:col-span-2 lg:col-span-4";
}

function Widget({ widget, className, onDelete, onMoveUp, onMoveDown, refreshTick, onSnapshot }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    apiFetch("/dashboards/widget-data", { method: "POST", body: JSON.stringify({ type: widget.type, config: widget.config }) })
      .then(d => { if (alive) { setData(d); onSnapshot?.(d); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [widget.id, refreshTick]);

  return (
    <div className={"glass-card rounded-2xl p-5 group relative " + className}>
      <div className="absolute top-3 right-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onMoveUp && <button onClick={onMoveUp} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60" title="Move up"><ChevronUp className="w-3.5 h-3.5" /></button>}
        {onMoveDown && <button onClick={onMoveDown} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60" title="Move down"><ChevronDown className="w-3.5 h-3.5" /></button>}
        <button onClick={onDelete} className="p-1 rounded text-muted-foreground hover:text-[#C8A880] hover:bg-muted/60" title="Delete"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2 pr-12">{widget.title}</div>
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
  if (type === "time_series") {
    return <TimeSeries data={data?.data ?? []} metric={data?.metric} />;
  }
  if (type === "stage_conversion" || type === "activity_timeline") {
    return (
      <div className="space-y-1.5 mt-2 text-xs">
        {(data?.data ?? []).slice(0, 8).map((row: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground capitalize truncate">{row.stage ?? row.day ?? row.type}</span>
            <span className="font-bold text-foreground">{row.count}</span>
          </div>
        ))}
      </div>
    );
  }
  return <pre className="text-xs text-muted-foreground overflow-auto max-h-32">{JSON.stringify(data, null, 2)}</pre>;
}

function TimeSeries({ data, metric }: any) {
  const series = data ?? [];
  const max = Math.max(...series.map((d: any) => Number(d.value ?? d.count) || 0), 1);
  if (series.length === 0) return <div className="text-xs text-muted-foreground py-2">No data in window.</div>;
  return (
    <div>
      <div className="flex items-end gap-1 h-24 mt-2">
        {series.map((d: any, i: number) => {
          const v = Number(d.value ?? d.count) || 0;
          const h = Math.max(4, (v / max) * 100);
          return (
            <div key={i} className="flex-1 group/bar relative">
              <div className="w-full nf-chameleon-bg rounded-t" style={{ height: `${h}%` }} />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-foreground opacity-0 group-hover/bar:opacity-100 whitespace-nowrap bg-background px-1.5 py-0.5 rounded shadow">
                {metric === "deals_won" && d.value ? `$${Number(d.value).toLocaleString()}` : v}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
        <span>{new Date(series[0].week).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        <span>{new Date(series[series.length - 1].week).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      </div>
    </div>
  );
}
