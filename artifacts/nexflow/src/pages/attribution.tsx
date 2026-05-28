import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { apiFetch } from "@/hooks/useApi";

const PALETTE = ["#B8A0C8", "#88B8B0", "#C8A880", "#C0A0B8", "#90B8B8", "#B8B880"];

export default function AttributionPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState<"first_touch" | "last_touch" | "linear">("linear");

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const r = await apiFetch("/attribution");
      setData(r);
    } finally { setLoading(false); }
  }

  const channels = data?.channels ?? [];
  const sources = data?.sources ?? [];
  const totalChannelRev = channels.reduce((s: number, c: any) => s + (c[`${model}_revenue`] ?? 0), 0) || 1;
  const maxChannel = Math.max(...channels.map((c: any) => c[`${model}_revenue`] ?? 0), 1);
  const maxSource = Math.max(...sources.map((s: any) => s.revenue ?? 0), 1);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold tracking-tight">Multi-Touch Attribution</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase border border-[#88B8B0]/30">Live</span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Which channels actually drive revenue? Compare first-touch, last-touch, and linear models across activities & UTM sources.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/40 rounded-lg p-0.5">
            {(["first_touch", "last_touch", "linear"] as const).map(m => (
              <button key={m} onClick={() => setModel(m)} className={`px-3 py-1.5 rounded text-xs font-bold ${model === m ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>{m.replace("_", " ")}</button>
            ))}
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading && "animate-spin"}`}/> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="WON DEALS" value={data?.won_deals ?? "—"} accent="#88B8B0"/>
        <Stat label="TOTAL REVENUE" value={data?.total_revenue ? `$${(data.total_revenue/1000).toFixed(1)}K` : "—"} accent="#B8A0C8"/>
        <Stat label="ATTRIBUTED CHANNELS" value={channels.length} accent="#C8A880"/>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">Revenue by channel · {model.replace("_", "-")}</div>
          {loading ? <div className="py-8 text-center text-xs text-muted-foreground">Computing…</div> :
           channels.length === 0 ? <div className="py-8 text-center text-xs text-muted-foreground">No channel data yet.</div> :
           <div className="space-y-2">
            {channels.map((c: any, i: number) => {
              const revenue = c[`${model}_revenue`] ?? 0;
              const pct = (revenue / totalChannelRev) * 100;
              return (
                <div key={c.channel}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="font-semibold">{c.channel}</div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>{c.events} events</span>
                      <span className="font-bold text-foreground">${(revenue/1000).toFixed(1)}K</span>
                      <span className="w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted/40 rounded overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${(revenue / maxChannel) * 100}%`, background: PALETTE[i % PALETTE.length] }}/>
                  </div>
                </div>
              );
            })}
           </div>
          }
        </div>

        <div className="glass-panel p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase mb-3">Revenue by source / UTM</div>
          {loading ? <div className="py-8 text-center text-xs text-muted-foreground">Computing…</div> :
           sources.length === 0 ? <div className="py-8 text-center text-xs text-muted-foreground">No source data yet.</div> :
           <div className="space-y-2">
            {sources.map((s: any, i: number) => (
              <div key={s.source}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="font-semibold">{s.source}</div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{s.contacts} contacts</span>
                    <span>{s.won_deals} won</span>
                    <span className="font-bold text-foreground">${(s.revenue/1000).toFixed(1)}K</span>
                  </div>
                </div>
                <div className="h-3 bg-muted/40 rounded overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${(s.revenue / maxSource) * 100}%`, background: PALETTE[i % PALETTE.length] }}/>
                </div>
              </div>
            ))}
           </div>
          }
        </div>
      </div>

      <div className="glass-panel p-3 text-xs text-muted-foreground flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#B8A0C8] mt-0.5"/>
        <span><b className="text-foreground">Models:</b> first-touch credits the first activity, last-touch credits the closing activity, linear splits credit equally. Numbers compute from your live activities, contacts, and won deals.</span>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: any) {
  return (
    <div className="glass-panel p-3">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ color: accent }}>{value}</div>
    </div>
  );
}
