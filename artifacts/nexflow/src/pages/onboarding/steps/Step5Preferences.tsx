import { useWizard } from "../context";
import { INTEGRATIONS_LIST } from "../types";
import { Shield, Check } from "lucide-react";

const SUPPORT_LEVELS = [
  { value: "standard",  label: "Standard",   desc: "Email support · 48h response", tag: "" },
  { value: "priority",  label: "Priority",   desc: "WhatsApp + email · 4h response", tag: "Popular" },
  { value: "dedicated", label: "Dedicated",  desc: "Named CSM · 1h response · quarterly reviews", tag: "Enterprise" },
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
        <p className="text-slate-500 mt-1">All integrations are managed by NexFlow — no API keys for your team to configure.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Which systems do you want to connect?</label>
        <p className="text-xs text-slate-400 mb-3">Select all that apply. We configure the backend connections during setup.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INTEGRATIONS_LIST.map(({ id, label, emoji }) => {
            const active = answers.integrations.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleIntegration(id)}
                className={[
                  "flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-sm transition-all text-left",
                  active
                    ? "border-violet-500 bg-violet-50 text-violet-700 font-medium"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-300",
                ].join(" ")}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{emoji}</span>
                <span className="text-xs font-medium flex-1">{label}</span>
                {active && <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Team training sessions</label>
        <div className="flex gap-3">
          {[
            { v: true,  label: "Yes — include training", desc: "Live sessions for admins + end users" },
            { v: false, label: "No — self-onboard",      desc: "Use in-app guides and documentation" },
          ].map(({ v, label, desc }) => (
            <button
              key={String(v)}
              onClick={() => updateAnswers({ trainingNeeded: v })}
              className={[
                "flex-1 text-left px-4 py-3.5 rounded-xl border-2 transition-all",
                answers.trainingNeeded === v
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-200 bg-white hover:border-violet-300",
              ].join(" ")}
            >
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Ongoing support level</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUPPORT_LEVELS.map(({ value, label, desc, tag }) => {
            const selected = answers.supportLevel === value;
            return (
              <button
                key={value}
                onClick={() => updateAnswers({ supportLevel: value })}
                className={[
                  "relative text-left px-4 py-4 rounded-xl border-2 transition-all",
                  selected ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-white hover:border-violet-300",
                ].join(" ")}
              >
                {tag && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                    {tag}
                  </span>
                )}
                <p className={`text-sm font-bold mb-1 ${selected ? "text-violet-800" : "text-slate-900"}`}>{label}</p>
                <p className="text-xs text-slate-500 leading-relaxed pr-12">{desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 bg-gradient-to-r from-teal-50 to-violet-50 border border-teal-200 rounded-xl p-4">
        <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-teal-800">
          <strong className="font-semibold">Zero credential management for your team.</strong> Every integration runs through NexFlow's shared secure backend — your IT team never needs to generate or rotate API keys.
        </div>
      </div>
    </div>
  );
}
