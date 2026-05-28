import { useWizard } from "../context";
import { Check } from "lucide-react";

const STEPS = [
  { n: 1, label: "Company & Branding", desc: "Identity + CR" },
  { n: 2, label: "Your Team",          desc: "Seats + migration" },
  { n: 3, label: "Features & Tools",   desc: "Module selection" },
  { n: 4, label: "Volume & Budget",    desc: "Scale + timeline" },
  { n: 5, label: "Integrations",       desc: "Connections + support" },
  { n: 6, label: "Contact Details",    desc: "Proposal delivery" },
];

export function StepProgress() {
  const { step, answers } = useWizard();

  const primary   = answers.primaryColor   || "#B8A0C8";
  const secondary = answers.secondaryColor || "#C0A0B8";

  return (
    <nav className="flex flex-col gap-0.5">
      {STEPS.map(({ n, label, desc }, i) => {
        const done   = n < step;
        const active = n === step;
        const future = n > step;

        return (
          <div key={n} className="relative">
            {i < STEPS.length - 1 && (
              <div
                className="absolute left-[17px] top-8 w-0.5 h-5 transition-all duration-500"
                style={{ background: done ? primary : "var(--border)" }}
              />
            )}
            <div
              className="flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-200"
              style={active ? { background: `${primary}12` } : undefined}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={
                  done   ? { background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: "white", boxShadow: `0 2px 8px ${primary}40` } :
                  active ? { background: `linear-gradient(135deg, ${primary}, ${secondary})`, color: "white", boxShadow: `0 2px 8px ${primary}50`, outline: `4px solid ${primary}25` } :
                  undefined
                }
              >
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : (
                  <span className={future ? "text-muted-foreground" : "text-white"}>{n}</span>
                )}
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold leading-tight"
                  style={{ color: active ? primary : done ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {label}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: active ? `${primary}cc` : done ? "var(--muted-foreground)" : "var(--border)" }}
                >
                  {desc}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
