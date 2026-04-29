import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Activity, TrendingUp, AlertCircle, Heart, Zap, Calendar, Users, ArrowRight, RefreshCw } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

type Item = {
  contact_id: string; name: string; email: string|null; title: string|null; company: string|null;
  score: number; bucket: { label: string; color: string };
  days_since_engaged: number|null; activity_30d: number; meetings_30d: number; has_open_deal: boolean;
};

type Summary = { total: number; healthy: number; stable: number; at_risk: number; critical: number; avg: number };

export default function HealthScoresPage() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<Item[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const r = await apiFetch<{ items: Item[]; summary: Summary }>("/health-scores");
      setItems(r.items ?? []);
      setSummary(r.summary ?? null);
    } finally { setLoading(false); }
  }

  const filtered = filter === "all" ? items : items.filter(i => i.bucket.label === filter);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><Heart className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Customer Health Scores</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Real-time health computed from engagement, activity, deals, and meetings — refreshed on each page load.</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")}/> Recompute
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <Stat label="ACTIVE CUSTOMERS" value={summary?.total ?? "—"} accent="#B8A0C8" onClick={() => setFilter("all")} active={filter === "all"}/>
        <Stat label="HEALTHY 75+" value={summary?.healthy ?? "—"} accent="#88B8B0" onClick={() => setFilter("healthy")} active={filter === "healthy"}/>
        <Stat label="STABLE 50-74" value={summary?.stable ?? "—"} accent="#B8B880" onClick={() => setFilter("stable")} active={filter === "stable"}/>
        <Stat label="AT RISK 25-49" value={summary?.at_risk ?? "—"} accent="#C8A880" onClick={() => setFilter("at risk")} active={filter === "at risk"}/>
        <Stat label="CRITICAL <25" value={summary?.critical ?? "—"} accent="#C0A0B8" onClick={() => setFilter("critical")} active={filter === "critical"}/>
      </div>

      <div className="glass-panel p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
          <div className="text-sm font-bold">Customer accounts ({filtered.length}) {filter !== "all" && <span className="text-muted-foreground font-normal">· filtered: {filter}</span>}</div>
          <div className="text-xs text-muted-foreground">Avg health: <span className="font-bold text-foreground">{summary?.avg ?? "—"}</span></div>
        </div>
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Computing scores…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No accounts match this filter.</div>
        ) : (
          <div className="divide-y divide-border/30">
            {filtered.map((it) => (
              <button key={it.contact_id} onClick={() => navigate(`/contacts/${it.contact_id}`)} className="w-full px-4 py-2.5 hover:bg-muted/40 transition flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0" style={{ background: `${it.bucket.color}15`, color: it.bucket.color, border: `2px solid ${it.bucket.color}40` }}>
                  {it.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold truncate">{it.name}</div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${it.bucket.color}20`, color: it.bucket.color }}>{it.bucket.label}</span>
                    {it.has_open_deal && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#B8A0C8]/15 text-[#B8A0C8] font-semibold">Active deal</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{it.title} · {it.company ?? "—"}</div>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Activity className="w-3 h-3"/> {it.activity_30d}/30d</div>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {it.meetings_30d} meetings</div>
                  <div className="flex items-center gap-1"><Zap className="w-3 h-3"/> {it.days_since_engaged !== null ? `${it.days_since_engaged}d ago` : "never"}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground"/>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-3 text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#B8A0C8] mt-0.5"/>
        <span><b className="text-foreground">Scoring formula:</b> baseline 50 + engagement recency (±30) + activity volume (max +20) + meetings (max +15) + active deal (+10) + won deal (+5). Capped 0-100.</span>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, onClick, active }: any) {
  return (
    <button onClick={onClick} className={cn("glass-panel p-3 text-left transition", active && "ring-2")} style={{ ...(active ? { boxShadow: `0 0 0 2px ${accent}60` } : {}) }}>
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</div>
    </button>
  );
}
