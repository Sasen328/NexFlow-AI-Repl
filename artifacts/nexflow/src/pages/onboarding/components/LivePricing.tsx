import { useWizard } from "../context";
import { formatSAR } from "../pricing";
import { TrendingUp, Check } from "lucide-react";

export function LivePricing() {
  const { pricing, setupPath } = useWizard();
  const { lines, totalMonthly, setupFee, timelineWeeks, annualTotal } = pricing;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-6 shadow-sm">
      <div className="px-5 py-4 border-b border-border" style={{ background: "rgba(184,160,200,0.05)" }}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" style={{ color: "#B8A0C8" }} />
          <span className="text-sm font-bold text-foreground">Live Estimate</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">Updates as you answer</p>
      </div>

      <div className="p-5">
        <div className="space-y-2.5 mb-4">
          {lines.map((l) => (
            <div key={l.name} className="flex justify-between items-start gap-2">
              <div>
                <p className="text-xs font-semibold text-foreground">{l.name}</p>
                <p className="text-[10px] text-muted-foreground">{l.unit}</p>
              </div>
              <span className="text-xs font-bold text-foreground whitespace-nowrap">
                {formatSAR(l.monthly)}/mo
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3.5 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">Monthly total</span>
            <span className="text-base font-extrabold" style={{ color: "#B8A0C8" }}>{formatSAR(totalMonthly)}/mo</span>
          </div>

          {setupFee > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Setup fee (one-time)</span>
              <span className="font-semibold text-foreground">{formatSAR(setupFee)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Est. year 1 total</span>
            <span className="font-semibold text-foreground">{formatSAR(annualTotal)}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Setup timeline</span>
            <span className="font-semibold" style={{ color: "#88B8B0" }}>~{timelineWeeks} weeks</span>
          </div>
        </div>

        {setupPath === "managed" && (
          <div className="mt-4 rounded-xl p-3 border" style={{ background: "rgba(184,160,200,0.06)", borderColor: "rgba(184,160,200,0.25)" }}>
            <p className="text-[10px] font-bold mb-2 uppercase tracking-wide" style={{ color: "#B8A0C8" }}>✦ Managed setup includes</p>
            <ul className="space-y-1.5">
              {["Dedicated impl. manager", "Full data migration", "Team training sessions", "30-day hypercare"].map((b) => (
                <li key={b} className="text-[10px] flex items-center gap-1.5" style={{ color: "#B8A0C8" }}>
                  <Check className="w-2.5 h-2.5 flex-shrink-0" style={{ color: "#B8A0C8" }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-3 text-[10px] text-muted-foreground text-center">
          Final pricing confirmed in your proposal
        </p>
      </div>
    </div>
  );
}
