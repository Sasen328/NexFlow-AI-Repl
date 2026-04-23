import { useDeals } from "@/hooks/useApi";
import { Plus, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  lead: { label: "Lead", color: "text-[#90B8B8]", bg: "bg-[#90B8B8]/10" },
  qualified: { label: "Qualified", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/10" },
  proposal: { label: "Proposal", color: "text-[#B8A0C8]", bg: "bg-[#B8A0C8]/10" },
  negotiation: { label: "Negotiation", color: "text-[#C8A880]", bg: "bg-[#C8A880]/10" },
  closed_won: { label: "Won", color: "text-[#88B8B0]", bg: "bg-[#88B8B0]/20" },
  closed_lost: { label: "Lost", color: "text-destructive", bg: "bg-destructive/10" },
};

function ProbabilityBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#88B8B0" : pct >= 50 ? "#B8B880" : "#C0A0B8";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted/60 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-muted-foreground w-8">{pct}%</span>
    </div>
  );
}

export default function DealsPage() {
  const { data, isLoading } = useDeals();
  const deals = data?.deals ?? [];

  const stageGroups: Record<string, any[]> = {};
  for (const stage of STAGES) stageGroups[stage] = [];
  for (const deal of deals) {
    const stage = deal.stage ?? "lead";
    if (stageGroups[stage]) stageGroups[stage].push(deal);
  }

  const total = deals.filter((d: any) => !["closed_won", "closed_lost"].includes(d.stage))
    .reduce((acc: number, d: any) => acc + (d.value ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            ${(total / 100).toLocaleString()} in active pipeline
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl nf-chameleon-bg text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const cfg = STAGE_CONFIG[stage];
          const stageDeals = stageGroups[stage] ?? [];
          const stageTotal = stageDeals.reduce((acc: number, d: any) => acc + (d.value ?? 0), 0);
          return (
            <div key={stage} className="flex-shrink-0 w-72">
              <div className={cn("flex items-center justify-between px-3 py-2 rounded-xl mb-3", cfg.bg)}>
                <span className={cn("text-xs font-semibold", cfg.color)}>{cfg.label}</span>
                <span className="text-xs text-muted-foreground">{stageDeals.length} · ${(stageTotal / 100).toLocaleString()}</span>
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  Array(2).fill(0).map((_, i) => <div key={i} className="glass-card rounded-xl p-4 h-28 animate-pulse" />)
                ) : stageDeals.length === 0 ? (
                  <div className="glass-card rounded-xl p-4 text-center text-xs text-muted-foreground border border-dashed border-border/30">
                    No deals
                  </div>
                ) : (
                  stageDeals.map((d: any) => (
                    <div key={d.id} className="glass-card rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group">
                      <div className="font-semibold text-sm text-foreground group-hover:text-[#B8A0C8] transition-colors line-clamp-2 mb-2">
                        {d.title}
                      </div>
                      <div className="flex items-center gap-1 text-[#88B8B0] font-bold text-sm mb-3">
                        <DollarSign className="w-3.5 h-3.5" />
                        {((d.value ?? 0) / 100).toLocaleString()} {d.currency ?? "USD"}
                      </div>
                      <ProbabilityBar pct={d.probability ?? 0} />
                      {d.contact && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <div className="w-4 h-4 rounded-full nf-chameleon-bg flex items-center justify-center text-white text-[8px] font-bold">
                            {d.contact.firstName?.[0]}
                          </div>
                          {d.contact.firstName} {d.contact.lastName}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
