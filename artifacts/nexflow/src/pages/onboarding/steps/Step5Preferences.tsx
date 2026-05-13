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
        <h2 className="text-2xl font-bold text-foreground">Integrations & Preferences</h2>
        <p className="text-muted-foreground mt-1">All integrations are managed by NexFlow — no API keys for your team to configure.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-1">Which systems do you want to connect?</label>
        <p className="text-xs text-muted-foreground mb-3">Select all that apply. We configure the backend connections during setup.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INTEGRATIONS_LIST.map(({ id, label, emoji }) => {
            const active = answers.integrations.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleIntegration(id)}
                className="flex items-center gap-2.5 px-3 py-3 rounded-xl border-2 text-sm transition-all text-left bg-card"
                style={active
                  ? { borderColor: "#B8A0C8", color: "#B8A0C8", background: "rgba(184,160,200,0.08)", fontWeight: 500 }
                  : undefined}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{emoji}</span>
                <span className="text-xs font-medium flex-1">{label}</span>
                {active && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#B8A0C8" }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Team training sessions</label>
        <div className="flex gap-3">
          {[
            { v: true,  label: "Yes — include training", desc: "Live sessions for admins + end users" },
            { v: false, label: "No — self-onboard",      desc: "Use in-app guides and documentation" },
          ].map(({ v, label, desc }) => (
            <button
              key={String(v)}
              onClick={() => updateAnswers({ trainingNeeded: v })}
              className="flex-1 text-left px-4 py-3.5 rounded-xl border-2 transition-all bg-card"
              style={answers.trainingNeeded === v
                ? { borderColor: "#B8A0C8", background: "rgba(184,160,200,0.06)" }
                : undefined}
            >
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Ongoing support level</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUPPORT_LEVELS.map(({ value, label, desc, tag }) => {
            const selected = answers.supportLevel === value;
            return (
              <button
                key={value}
                onClick={() => updateAnswers({ supportLevel: value })}
                className="relative text-left px-4 py-4 rounded-xl border-2 transition-all bg-card"
                style={selected
                  ? { borderColor: "#B8A0C8", background: "rgba(184,160,200,0.06)" }
                  : undefined}
              >
                {tag && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                    {tag}
                  </span>
                )}
                <p className="text-sm font-bold mb-1" style={{ color: selected ? "#B8A0C8" : "var(--foreground)" }}>{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed pr-12">{desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl p-4 border"
        style={{ background: "rgba(136,184,176,0.06)", borderColor: "rgba(136,184,176,0.25)" }}>
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#88B8B0" }} />
        <div className="text-sm" style={{ color: "#5a9690" }}>
          <strong className="font-semibold">Zero credential management for your team.</strong> Every integration runs through NexFlow's shared secure backend — your IT team never needs to generate or rotate API keys.
        </div>
      </div>
    </div>
  );
}
