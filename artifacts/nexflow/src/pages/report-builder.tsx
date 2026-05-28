import { useEffect, useState } from "react";
import { BarChart3, Plus, Save, Play, Trash2, Filter } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

const ENTITIES = [
  { key: "contacts",  label: "Contacts",  fields: ["status", "lead_score", "country", "source", "owner_id"] },
  { key: "deals",     label: "Deals",     fields: ["stage", "value", "currency", "probability", "owner_id"] },
  { key: "companies", label: "Companies", fields: ["industry", "size", "country", "revenue"] },
  { key: "activities", label: "Activities", fields: ["type", "status", "owner_id"] },
];
const AGG = ["count", "sum", "avg", "min", "max"];

export default function ReportBuilderPage() {
  const [entity, setEntity] = useState(ENTITIES[1]);
  const [groupBy, setGroupBy] = useState("stage");
  const [agg, setAgg] = useState<"count" | "sum" | "avg">("sum");
  const [aggField, setAggField] = useState("value");
  const [results, setResults] = useState<{ key: string; count: number; sum: number; avg?: number }[]>([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setResults([]);
    try {
      const r = await apiFetch<any>(`/${entity.key}?limit=500`);
      const items: any[] = r[entity.key] ?? r.items ?? r.contacts ?? r.deals ?? r.companies ?? r.activities ?? [];
      const grouped: Record<string, { count: number; sum: number; values: number[] }> = {};
      for (const it of items) {
        const k = String(it[groupBy] ?? "—");
        if (!grouped[k]) grouped[k] = { count: 0, sum: 0, values: [] };
        grouped[k].count++;
        const v = Number(it[aggField]);
        if (!isNaN(v)) { grouped[k].sum += v; grouped[k].values.push(v); }
      }
      const out = Object.entries(grouped).map(([k, v]) => ({
        key: k, count: v.count, sum: v.sum,
        avg: v.values.length ? v.sum / v.values.length : 0,
      })).sort((a, b) => (agg === "count" ? b.count - a.count : b.sum - a.sum));
      setResults(out);
    } catch (err: any) {
      alert(err?.message ?? "Failed");
    } finally { setRunning(false); }
  }

  const max = Math.max(...results.map(r => agg === "count" ? r.count : agg === "avg" ? (r.avg ?? 0) : r.sum), 1);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Custom Report Builder</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">No-SQL query builder. Pick entity, group, aggregate — runs against your live data and renders instantly.</p>
        </div>
      </div>

      <div className="glass-panel p-4">
        <div className="grid grid-cols-5 gap-2">
          <Sel label="Entity" value={entity.key} onChange={(v) => { const e = ENTITIES.find(x => x.key === v)!; setEntity(e); setGroupBy(e.fields[0]); setAggField(e.fields.find(f => /value|score|revenue/.test(f)) ?? e.fields[0]); }} options={ENTITIES.map(e => ({ value: e.key, label: e.label }))}/>
          <Sel label="Group by" value={groupBy} onChange={setGroupBy} options={entity.fields.map(f => ({ value: f, label: f }))}/>
          <Sel label="Aggregate" value={agg} onChange={(v) => setAgg(v as any)} options={AGG.map(a => ({ value: a, label: a }))}/>
          <Sel label="Field" value={aggField} onChange={setAggField} options={entity.fields.map(f => ({ value: f, label: f }))}/>
          <button onClick={run} disabled={running} className="self-end flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg disabled:opacity-50">
            <Play className="w-3.5 h-3.5"/> {running ? "Running…" : "Run report"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">{agg.toUpperCase()} of <code className="px-1 bg-muted rounded">{aggField}</code> by <code className="px-1 bg-muted rounded">{groupBy}</code> · {results.length} groups</div>
          <div className="space-y-2">
            {results.map((r, i) => {
              const v = agg === "count" ? r.count : agg === "avg" ? r.avg ?? 0 : r.sum;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="font-semibold">{r.key}</div>
                    <div className="font-bold">{Math.round(v).toLocaleString()}</div>
                  </div>
                  <div className="h-3 bg-muted/40 rounded overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#B8A0C8] to-[#88B8B0]" style={{ width: `${(v / max) * 100}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!results.length && !running && <div className="glass-panel p-12 text-center text-sm text-muted-foreground">Configure your report above and click Run.</div>}
    </div>
  );
}

function Sel({ label, value, onChange, options }: any) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1.5 rounded border border-border/40 bg-transparent text-sm">
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
