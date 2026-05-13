import { useWizard } from "../context";
import { formatSAR } from "../pricing";
import { TrendingUp, Check } from "lucide-react";

export function LivePricing() {
  const { pricing, setupPath } = useWizard();
  const { lines, totalMonthly, setupFee, timelineWeeks, annualTotal } = pricing;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden sticky top-6 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100" style={{ background: "linear-gradient(135deg, #7C3AED08 0%, #0D948808 100%)" }}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-bold text-slate-900">Live Estimate</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Updates as you answer</p>
      </div>

      <div className="p-5">
        <div className="space-y-2.5 mb-4">
          {lines.map((l) => (
            <div key={l.name} className="flex justify-between items-start gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-700">{l.name}</p>
                <p className="text-[10px] text-slate-400">{l.unit}</p>
              </div>
              <span className="text-xs font-bold text-slate-800 whitespace-nowrap">
                {formatSAR(l.monthly)}/mo
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">Monthly total</span>
            <span className="text-base font-extrabold text-violet-700">{formatSAR(totalMonthly)}/mo</span>
          </div>

          {setupFee > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Setup fee (one-time)</span>
              <span className="font-semibold text-slate-700">{formatSAR(setupFee)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Est. year 1 total</span>
            <span className="font-semibold text-slate-700">{formatSAR(annualTotal)}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Setup timeline</span>
            <span className="font-semibold text-teal-700">~{timelineWeeks} weeks</span>
          </div>
        </div>

        {setupPath === "managed" && (
          <div className="mt-4 rounded-xl p-3 border border-violet-200" style={{ background: "linear-gradient(135deg, #7C3AED0D 0%, #0D94880D 100%)" }}>
            <p className="text-[10px] font-bold text-violet-700 mb-2 uppercase tracking-wide">✦ Managed setup includes</p>
            <ul className="space-y-1.5">
              {["Dedicated impl. manager", "Full data migration", "Team training sessions", "30-day hypercare"].map((b) => (
                <li key={b} className="text-[10px] text-violet-700 flex items-center gap-1.5">
                  <Check className="w-2.5 h-2.5 text-violet-500 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-3 text-[10px] text-slate-400 text-center">
          Final pricing confirmed in your proposal
        </p>
      </div>
    </div>
  );
}
