import { useState } from "react";
import { useWizard } from "./context";
import type { SetupPath } from "./types";
import logo from "@/assets/logo_mark.png";

const PATHS: { id: SetupPath; emoji: string; title: string; subtitle: string; bullets: string[]; cta: string }[] = [
  {
    id: "managed",
    emoji: "🛠️",
    title: "NexFlow sets it up for you",
    subtitle: "Our implementation team handles everything — configuration, migration, integrations, and training.",
    bullets: [
      "Dedicated implementation manager",
      "Data migration from your current CRM",
      "Custom pipeline & workflow configuration",
      "Team training sessions",
      "30-day hypercare post-launch",
    ],
    cta: "Start managed setup",
  },
  {
    id: "self",
    emoji: "⚙️",
    title: "Set it up yourself",
    subtitle: "You configure the workspace using our guided setup wizard. Best for technical teams comfortable with CRM administration.",
    bullets: [
      "Step-by-step configuration guide",
      "AI-assisted field mapping",
      "Migration templates & documentation",
      "Standard support included",
      "Upgrade to managed anytime",
    ],
    cta: "Start self-service setup",
  },
];

export default function Landing() {
  const { startSession, saving, error } = useWizard();
  const [selected, setSelected] = useState<SetupPath | null>(null);

  const handleStart = async () => {
    if (!selected) return;
    await startSession(selected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 py-6 border-b border-slate-200/60 bg-white/70 backdrop-blur-sm">
        <img src={logo} alt="NexFlow" className="h-8 w-8" />
        <span className="font-bold text-lg tracking-tight text-slate-900">NexFlow</span>
        <span className="ml-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">Enterprise Setup</span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 mb-6">
            ✦ Trusted by 200+ GCC enterprises
          </div>
          <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Welcome to your<br />
            <span className="text-indigo-600">NexFlow workspace</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed">
            Answer a few questions and we'll configure your CRM, generate a tailored proposal,
            and have your team up and running in days — not months.
          </p>
        </div>

        {/* Path cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-10">
          {PATHS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={[
                "text-left rounded-2xl border-2 p-7 transition-all duration-200 focus:outline-none",
                selected === p.id
                  ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100"
                  : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md",
              ].join(" ")}
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="text-3xl">{p.emoji}</span>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg leading-snug">{p.title}</h2>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed">{p.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-indigo-500 font-bold">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              {selected === p.id && (
                <div className="mt-5 flex items-center gap-2 text-indigo-600 text-sm font-semibold">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </span>
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!selected || saving}
          className={[
            "px-10 py-4 rounded-xl font-bold text-base transition-all",
            selected && !saving
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5"
              : "bg-slate-200 text-slate-400 cursor-not-allowed",
          ].join(" ")}
        >
          {saving ? "Starting…" : selected ? PATHS.find((p) => p.id === selected)!.cta : "Select an option above"}
        </button>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Takes 10–15 minutes · No credit card required · Proposal sent instantly
        </p>
      </div>
    </div>
  );
}
