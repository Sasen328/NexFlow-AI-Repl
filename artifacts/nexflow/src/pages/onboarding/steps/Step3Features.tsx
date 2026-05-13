import { useWizard } from "../context";
import { MODULES } from "../types";

export default function Step3Features() {
  const { answers, updateAnswers } = useWizard();

  const toggle = (id: string) => {
    if (id === "core") return; // core is always included
    const mods = answers.enabledModules.includes(id)
      ? answers.enabledModules.filter((m) => m !== id)
      : [...answers.enabledModules, id];
    updateAnswers({ enabledModules: mods });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Features & Tools</h2>
        <p className="text-slate-500 mt-1">Select the modules your team needs. Core CRM is always included. Add-ons are reflected instantly in your estimate.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULES.map((mod) => {
          const selected = answers.enabledModules.includes(mod.id);
          return (
            <button
              key={mod.id}
              onClick={() => toggle(mod.id)}
              disabled={mod.required}
              className={[
                "relative text-left p-4 rounded-2xl border-2 transition-all focus:outline-none group",
                selected && mod.required  ? "border-indigo-300 bg-indigo-50 cursor-default" : "",
                selected && !mod.required ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100 hover:shadow-lg" : "",
                !selected ? "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm" : "",
              ].join(" ")}
            >
              {mod.required && (
                <span className="absolute top-3 right-3 text-xs font-bold text-indigo-600 bg-indigo-100 rounded-full px-2 py-0.5">
                  Included
                </span>
              )}
              {!mod.required && selected && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              )}
              <div className="text-2xl mb-2">{mod.emoji}</div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{mod.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">{mod.desc}</p>
              <span className={[
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                selected ? "text-indigo-700 bg-indigo-100" : "text-slate-500 bg-slate-100",
              ].join(" ")}>
                {mod.price}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
        <strong className="text-slate-800">💡 Not sure?</strong> You can add or remove modules anytime after setup. Your proposal will include our recommended stack based on your company size and industry.
      </div>
    </div>
  );
}
