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
  const { step } = useWizard();

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
                className={[
                  "absolute left-[17px] top-8 w-0.5 h-5 transition-all duration-500",
                  done ? "bg-violet-400" : "bg-slate-200",
                ].join(" ")}
              />
            )}
            <div className={[
              "flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-200",
              active ? "bg-violet-50" : "hover:bg-slate-50",
            ].join(" ")}>
              <div className={[
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                done   ? "bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md shadow-violet-200" : "",
                active ? "bg-gradient-to-br from-violet-600 to-violet-800 text-white ring-4 ring-violet-100 shadow-md shadow-violet-300" : "",
                future ? "bg-slate-100 text-slate-400 border border-slate-200" : "",
              ].join(" ")}>
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : n}
              </div>
              <div className="min-w-0">
                <p className={[
                  "text-sm font-semibold leading-tight",
                  active  ? "text-violet-800" : done ? "text-slate-700" : "text-slate-400",
                ].join(" ")}>
                  {label}
                </p>
                <p className={[
                  "text-[10px] mt-0.5",
                  active ? "text-violet-500" : done ? "text-slate-400" : "text-slate-300",
                ].join(" ")}>
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
