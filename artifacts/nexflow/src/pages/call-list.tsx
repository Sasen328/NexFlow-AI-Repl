import { useCallList } from "@/hooks/useApi";
import { Link } from "wouter";
import { Phone, Sparkles, Flame, Snowflake, RotateCw, TrendingUp, Clock } from "lucide-react";

const CATEGORY_META: Record<string, { icon: any; color: string; label: string; desc: string }> = {
  hot: { icon: Flame, color: "#C8A880", label: "Hot", desc: "High intent, recent engagement" },
  warm: { icon: Sparkles, color: "#B8A0C8", label: "Warm", desc: "Active in pipeline" },
  retry: { icon: RotateCw, color: "#90B8B8", label: "Retry", desc: "No answer recently — try again" },
  cold: { icon: Snowflake, color: "#88B8B0", label: "Cold", desc: "Lower priority but worth a touch" },
};

export default function CallListPage() {
  const { data, isLoading } = useCallList();

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Phone className="w-6 h-6 text-[#B8A0C8]" /> Today's Call List
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">{data?.date} · AI-prioritized by intent score, recency, and signal velocity.</p>
        </div>
        <div className="text-xs text-muted-foreground">{data?.total ?? 0} contacts queued</div>
      </div>

      {data?.ai_recommendation && (
        <div className="glass-card rounded-2xl p-4 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#B8A0C8] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground/90">{data.ai_recommendation}</div>
          </div>
        </div>
      )}

      {isLoading ? <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-32 glass-card rounded-2xl animate-pulse" />)}</div> : (
        <div className="space-y-5">
          {(["hot","warm","retry","cold"] as const).map(cat => {
            const items = data?.categories?.[cat] ?? [];
            if (!items.length) return null;
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Icon className="w-4 h-4" style={{ color: meta.color }} />
                  <h2 className="font-bold text-foreground text-sm uppercase tracking-wide">{meta.label}</h2>
                  <span className="text-xs text-muted-foreground">· {items.length} · {meta.desc}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {items.map((c: any) => (
                    <Link key={c.id} href={`/contacts/${c.id}`}>
                      <div className="glass-card rounded-2xl p-4 hover:shadow-md cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full nf-chameleon-bg text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {c.first_name?.[0]}{c.last_name?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-foreground text-sm truncate">{c.first_name} {c.last_name}</div>
                              <div className="text-xs font-bold" style={{ color: meta.color }}>{Math.round(c.priority_score)}</div>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{c.title} · {c.company_name}</div>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                              {c.deal_value && <span className="flex items-center gap-1 text-[#88B8B0]"><TrendingUp className="w-3 h-3" />${c.deal_value.toLocaleString()}</span>}
                              {c.best_call_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.best_call_time}</span>}
                              {c.owner_name && <span>· {c.owner_name}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
