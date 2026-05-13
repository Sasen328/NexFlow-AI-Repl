import { useWizard } from "../context";
import { LEAD_VOLUMES, BUDGET_RANGES, TIMELINES } from "../types";

const CREDIT_BUNDLES = [
  { value: 1000,  label: "1,000 credits",  price: "SAR 50/mo",  note: "~100 contact enrichments" },
  { value: 5000,  label: "5,000 credits",  price: "SAR 200/mo", note: "~500 contact enrichments" },
  { value: 25000, label: "25,000 credits", price: "SAR 800/mo", note: "~2,500 contact enrichments" },
];

export default function Step4Volume() {
  const { answers, updateAnswers } = useWizard();
  const enrichmentEnabled = answers.enabledModules.includes("enrichment");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Volume & Budget</h2>
        <p className="text-slate-500 mt-1">Help us understand your scale so we can right-size your plan.</p>
      </div>

      {/* Lead volume */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly lead volume</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LEAD_VOLUMES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateAnswers({ monthlyLeadVolume: value })}
              className={[
                "px-4 py-2.5 rounded-xl border text-sm font-medium transition-all text-center",
                answers.monthlyLeadVolume === value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Enrichment credits */}
      {enrichmentEnabled && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Enrichment credit bundle</label>
          <p className="text-xs text-slate-400 mb-3">1 credit = 1 enrichment signal pulled (email, phone, company data, etc.)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CREDIT_BUNDLES.map(({ value, label, price, note }) => (
              <button
                key={value}
                onClick={() => updateAnswers({ enrichmentCreditsMonthly: value })}
                className={[
                  "text-left px-4 py-3 rounded-xl border-2 transition-all",
                  answers.enrichmentCreditsMonthly === value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-indigo-300",
                ].join(" ")}
              >
                <p className="text-sm font-bold text-slate-900">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{note}</p>
                <p className="text-xs font-semibold text-indigo-600 mt-1.5">{price}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Budget range */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly budget range</label>
        <p className="text-xs text-slate-400 mb-3">Helps us tailor recommendations. You're not committing to anything yet.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUDGET_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateAnswers({ budgetRangeSAR: value })}
              className={[
                "px-4 py-2.5 rounded-xl border text-sm font-medium transition-all text-center",
                answers.budgetRangeSAR === value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred go-live timeline</label>
        <div className="flex flex-wrap gap-2">
          {TIMELINES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateAnswers({ timeline: value })}
              className={[
                "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                answers.timeline === value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
