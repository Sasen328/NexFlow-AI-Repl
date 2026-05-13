import {
  LayoutGrid, PhoneCall, Sparkles, Megaphone, Bot, Brain,
  TrendingUp, FileText, Globe, Check,
} from "lucide-react";
import { useWizard } from "../context";
import { MODULES } from "../types";

const MODULE_ICONS: Record<string, React.ReactNode> = {
  core:             <LayoutGrid className="w-5 h-5 text-white" />,
  dialer:           <PhoneCall className="w-5 h-5 text-white" />,
  enrichment:       <Sparkles className="w-5 h-5 text-white" />,
  marketing:        <Megaphone className="w-5 h-5 text-white" />,
  "voice-agents":   <Bot className="w-5 h-5 text-white" />,
  intelligence:     <Brain className="w-5 h-5 text-white" />,
  forecasting:      <TrendingUp className="w-5 h-5 text-white" />,
  cpq:              <FileText className="w-5 h-5 text-white" />,
  "website-tracking":<Globe className="w-5 h-5 text-white" />,
};

const CATEGORIES = ["Foundation", "Engagement", "Data", "Growth", "Intelligence", "Revenue"];

export default function Step3Features() {
  const { answers, updateAnswers } = useWizard();

  const toggle = (id: string) => {
    if (id === "core") return;
    const mods = answers.enabledModules.includes(id)
      ? answers.enabledModules.filter((m) => m !== id)
      : [...answers.enabledModules, id];
    updateAnswers({ enabledModules: mods });
  };

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    modules: MODULES.filter((m) => m.category === cat),
  })).filter((g) => g.modules.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Features & Tools</h2>
        <p className="text-slate-500 mt-1">
          Select the modules your team needs. Core CRM is always included — add-ons update your estimate instantly.
        </p>
      </div>

      {grouped.map(({ category, modules }) => (
        <div key={category}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{category}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modules.map((mod) => {
              const selected = answers.enabledModules.includes(mod.id);
              return (
                <button
                  key={mod.id}
                  onClick={() => toggle(mod.id)}
                  disabled={mod.required}
                  className={[
                    "relative text-left p-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none group overflow-hidden",
                    selected && mod.required  ? "border-violet-200 bg-violet-50/60 cursor-default" : "",
                    selected && !mod.required ? "border-violet-500 bg-white shadow-lg shadow-violet-100 hover:shadow-violet-200" : "",
                    !selected                 ? "border-slate-200 bg-white hover:border-violet-300 hover:shadow-md hover:shadow-violet-50" : "",
                  ].join(" ")}
                >
                  {selected && !mod.required && (
                    <div className="absolute inset-0 pointer-events-none opacity-5" style={{ background: "linear-gradient(135deg, #7C3AED, #0D9488)" }} />
                  )}

                  {mod.required ? (
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-violet-600 bg-violet-100 rounded-full px-2 py-0.5 tracking-wide">
                      INCLUDED
                    </span>
                  ) : selected ? (
                    <span className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}>
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </span>
                  ) : null}

                  {mod.popular && !selected && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                      Popular
                    </span>
                  )}

                  <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center shadow-sm bg-gradient-to-br ${mod.colorClass}`}>
                    {MODULE_ICONS[mod.id]}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 pr-8">{mod.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{mod.desc}</p>

                  <span className={[
                    "inline-block text-xs font-semibold px-2.5 py-1 rounded-lg",
                    selected ? "text-violet-700 bg-violet-100" : "text-slate-500 bg-slate-100",
                  ].join(" ")}>
                    {mod.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-start gap-3 bg-gradient-to-r from-violet-50 to-teal-50 border border-violet-200 rounded-xl p-4">
        <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          <strong className="text-slate-900">Not sure what to pick?</strong> Our AI will recommend the ideal module stack based on your industry, team size, and lead volume once you complete the wizard.
        </p>
      </div>
    </div>
  );
}
