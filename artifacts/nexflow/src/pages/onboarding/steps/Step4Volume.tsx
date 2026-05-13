import { useWizard } from "../context";
import { LEAD_VOLUMES, BUDGET_RANGES, TIMELINES } from "../types";
import { Zap } from "lucide-react";

const CREDIT_BUNDLES = [
  { value: 1000,  label: "1,000 credits",  price: "SAR 50/mo",  note: "~100 contact enrichments", tag: "" },
  { value: 5000,  label: "5,000 credits",  price: "SAR 200/mo", note: "~500 contact enrichments", tag: "Popular" },
  { value: 25000, label: "25,000 credits", price: "SAR 800/mo", note: "~2,500 contact enrichments", tag: "Best value" },
];

function OptionGrid<T extends string | number>({
  label, hint, options, value, onChange,
}: {
  label: string;
  hint?: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-3">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(({ value: v, label: l }) => (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            className="px-4 py-2 rounded-xl border text-sm font-medium transition-all bg-card"
            style={value === v
              ? { borderColor: "#B8A0C8", color: "#B8A0C8", background: "rgba(184,160,200,0.08)" }
              : undefined}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Step4Volume() {
  const { answers, updateAnswers } = useWizard();
  const enrichmentEnabled = answers.enabledModules.includes("enrichment");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Volume & Budget</h2>
        <p className="text-muted-foreground mt-1">Help us understand your scale so we can right-size your plan.</p>
      </div>

      <OptionGrid
        label="Monthly lead volume"
        options={LEAD_VOLUMES}
        value={answers.monthlyLeadVolume}
        onChange={(v) => updateAnswers({ monthlyLeadVolume: v })}
      />

      {enrichmentEnabled && (
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Enrichment credit bundle</label>
          <p className="text-xs text-muted-foreground mb-3">1 credit = 1 enrichment signal (email, phone, company data, etc.)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CREDIT_BUNDLES.map(({ value, label, price, note, tag }) => {
              const selected = answers.enrichmentCreditsMonthly === value;
              return (
                <button
                  key={value}
                  onClick={() => updateAnswers({ enrichmentCreditsMonthly: value })}
                  className="relative text-left px-4 py-4 rounded-xl border-2 transition-all bg-card"
                  style={selected
                    ? { borderColor: "#B8A0C8", background: "rgba(184,160,200,0.06)", boxShadow: "0 4px 12px rgba(184,160,200,0.15)" }
                    : undefined}
                >
                  {tag && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                      {tag}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5" style={{ color: selected ? "#B8A0C8" : "var(--muted-foreground)" }} />
                    <p className="text-sm font-bold text-foreground">{label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">{note}</p>
                  <p className="text-xs font-bold" style={{ color: selected ? "#B8A0C8" : "var(--muted-foreground)" }}>{price}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <OptionGrid
        label="Monthly budget range"
        hint="Helps us tailor our recommendations — you're not committing to anything yet."
        options={BUDGET_RANGES}
        value={answers.budgetRangeSAR}
        onChange={(v) => updateAnswers({ budgetRangeSAR: v })}
      />

      <OptionGrid
        label="Preferred go-live timeline"
        options={TIMELINES}
        value={answers.timeline}
        onChange={(v) => updateAnswers({ timeline: v })}
      />
    </div>
  );
}
