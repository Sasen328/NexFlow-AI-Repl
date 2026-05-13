import { useWizard } from "../context";

const STEPS = [
  { n: 1, label: "Company & Branding" },
  { n: 2, label: "Your Team" },
  { n: 3, label: "Features & Tools" },
  { n: 4, label: "Volume & Budget" },
  { n: 5, label: "Integrations" },
  { n: 6, label: "Contact Details" },
];

export function StepProgress() {
  const { step } = useWizard();

  return (
    <nav className="flex flex-col gap-1">
      {STEPS.map(({ n, label }) => {
        const done    = n < step;
        const active  = n === step;
        const future  = n > step;
        return (
          <div key={n} className="flex items-center gap-3 py-2 px-3 rounded-xl transition-colors
            ${active ? 'bg-indigo-50' : ''}">
            <div className={[
              "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              done   ? "bg-indigo-600 text-white"              : "",
              active ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "",
              future ? "bg-slate-100 text-slate-400"           : "",
            ].join(" ")}>
              {done ? "✓" : n}
            </div>
            <span className={[
              "text-sm font-medium",
              active ? "text-indigo-700" : done ? "text-slate-600" : "text-slate-400",
            ].join(" ")}>
              {label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
