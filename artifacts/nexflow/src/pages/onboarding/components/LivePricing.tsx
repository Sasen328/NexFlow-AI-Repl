import { useWizard } from "../context";
import { formatSAR } from "../pricing";

export function LivePricing() {
  const { pricing, setupPath } = useWizard();
  const { lines, totalMonthly, setupFee, timelineWeeks, annualTotal } = pricing;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base font-bold text-slate-900">Live Estimate</span>
        <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">updates as you answer</span>
      </div>

      <div className="space-y-2 mb-4">
        {lines.map((l) => (
          <div key={l.name} className="flex justify-between items-start gap-2">
            <div>
              <p className="text-sm font-medium text-slate-700">{l.name}</p>
              <p className="text-xs text-slate-400">{l.unit}</p>
            </div>
            <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">
              {formatSAR(l.monthly)}/mo
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-700">Monthly total</span>
          <span className="text-base font-bold text-indigo-600">{formatSAR(totalMonthly)}/mo</span>
        </div>

        {setupFee > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Setup fee (one-time)</span>
            <span className="font-medium text-slate-700">{formatSAR(setupFee)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Est. year 1 total</span>
          <span className="font-medium text-slate-700">{formatSAR(annualTotal)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">Setup timeline</span>
          <span className="font-medium text-slate-700">~{timelineWeeks} weeks</span>
        </div>
      </div>

      {setupPath === "managed" && (
        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
          <p className="text-xs font-medium text-indigo-700">✦ Managed setup includes</p>
          <ul className="mt-1.5 space-y-1">
            {["Dedicated impl. manager", "Data migration", "Team training", "30-day hypercare"].map((b) => (
              <li key={b} className="text-xs text-indigo-600 flex items-center gap-1.5">
                <span>✓</span>{b}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400 text-center">
        Final pricing confirmed in your proposal
      </p>
    </div>
  );
}
