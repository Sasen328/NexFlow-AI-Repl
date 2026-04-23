import { useDailyInsights, useInsights } from "@/hooks/useApi";
import { Sparkles, AlertTriangle, TrendingUp, Info, Flame } from "lucide-react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const SEVERITY: any = {
  critical: { color: "#C8A880", bg: "bg-[#C8A880]/10", border: "border-[#C8A880]/30", icon: AlertTriangle },
  warning: { color: "#C8A880", bg: "bg-[#C8A880]/10", border: "border-[#C8A880]/30", icon: AlertTriangle },
  opportunity: { color: "#88B8B0", bg: "bg-[#88B8B0]/10", border: "border-[#88B8B0]/30", icon: TrendingUp },
  info: { color: "#90B8B8", bg: "bg-[#90B8B8]/10", border: "border-[#90B8B8]/30", icon: Info },
};

export default function InsightsPage() {
  const qc = useQueryClient();
  const { data: today } = useDailyInsights();
  const { data: history } = useInsights();

  useEffect(() => {
    // ensure today's insights are fresh
    qc.invalidateQueries({ queryKey: ["insights"] });
  }, [today]);

  const todayItems = today?.insights ?? [];
  const allItems = history?.insights ?? [];

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Sparkles className="w-6 h-6 text-[#B8A0C8]" /> Daily Insights</h1>
        <p className="text-muted-foreground text-sm mt-0.5">AI-curated briefing combining pipeline data, market context, and rep behavior.</p>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-[#C8A880]" /> Today's Briefing
        </h2>
        {!todayItems.length ? (
          <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">Generating today's briefing…</div>
        ) : (
          <div className="space-y-3">
            {todayItems.map((i: any) => {
              const meta = SEVERITY[i.severity] ?? SEVERITY.info;
              const Icon = meta.icon;
              return (
                <div key={i.id} className={"glass-card rounded-2xl p-4 border " + meta.border + " " + meta.bg}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.color + "30", color: meta.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-sm">{i.title}</h3>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-bold">{i.category}</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">{i.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">History</h2>
        <div className="space-y-2">
          {allItems.filter((i: any) => !todayItems.find((t: any) => t.id === i.id)).slice(0, 30).map((i: any) => (
            <div key={i.id} className="glass-card rounded-xl p-3 text-xs flex items-center gap-3">
              <span className="text-muted-foreground w-20 flex-shrink-0">{new Date(i.generated_at).toLocaleDateString()}</span>
              <span className="font-medium text-foreground flex-1">{i.title}</span>
              <span className="text-muted-foreground capitalize">{i.severity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
