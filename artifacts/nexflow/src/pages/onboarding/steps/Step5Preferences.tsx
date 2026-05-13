import { useWizard } from "../context";
import { INTEGRATIONS_LIST } from "../types";

const SUPPORT_LEVELS = [
  { value: "standard",  label: "Standard",   desc: "Email support, 48h response" },
  { value: "priority",  label: "Priority",   desc: "WhatsApp + email, 4h response" },
  { value: "dedicated", label: "Dedicated",  desc: "Named CSM, 1h response, quarterly reviews" },
];

export default function Step5Preferences() {
  const { answers, updateAnswers } = useWizard();

  const toggleIntegration = (id: string) => {
    const next = answers.integrations.includes(id)
      ? answers.integrations.filter((i) => i !== id)
      : [...answers.integrations, id];
    updateAnswers({ integrations: next });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Integrations & Preferences</h2>
        <p className="text-slate-500 mt-1">All integrations are handled by NexFlow's backend — no API keys for your team to manage.</p>
      </div>

      {/* Integrations */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Which systems do you want to connect?</label>
        <p className="text-xs text-slate-400 mb-3">Select all that apply. We'll configure the backend connections during setup.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INTEGRATIONS_LIST.map(({ id, label, emoji }) => {
            const active = answers.integrations.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleIntegration(id)}
                className={[
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-all text-left",
                  active
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300",
                ].join(" ")}
              >
                <span className="text-base">{emoji}</span>
                <span className="text-xs font-medium">{label}</span>
                {active && <span className="ml-auto text-indigo-500 text-xs font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Training */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Do you want team training sessions?</label>
        <div className="flex gap-3">
          {[
            { v: true,  label: "Yes — include training", desc: "Live sessions for admins + end users" },
            { v: false, label: "No — self-onboard",      desc: "We'll use in-app guides and docs" },
          ].map(({ v, label, desc }) => (
            <button
              key={String(v)}
              onClick={() => updateAnswers({ trainingNeeded: v })}
              className={[
                "flex-1 text-left px-4 py-3 rounded-xl border transition-all",
                answers.trainingNeeded === v
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Support level */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Ongoing support level</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUPPORT_LEVELS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => updateAnswers({ supportLevel: value })}
              className={[
                "text-left px-4 py-3.5 rounded-xl border-2 transition-all",
                answers.supportLevel === value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-indigo-300",
              ].join(" ")}
            >
              <p className="text-sm font-bold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500 mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Integration note */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
        <strong>🔒 Zero API key management for your team.</strong> Every integration listed above is handled through NexFlow's shared backend infrastructure. Your IT team doesn't need to generate or manage any API credentials.
      </div>
    </div>
  );
}
