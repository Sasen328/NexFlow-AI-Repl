import { useState } from "react";
import { useWizard } from "./context";
import type { SetupPath } from "./types";
import logo from "@/assets/logo_mark.png";
import logoFull from "@/assets/logo_full.png";

const PATHS: {
  id: SetupPath;
  title: string;
  subtitle: string;
  bullets: string[];
  cta: string;
  badge?: string;
  accentClass: string;
  borderClass: string;
  bgClass: string;
}[] = [
  {
    id: "managed",
    title: "NexFlow sets it up for you",
    subtitle: "Our implementation team handles everything — configuration, data migration, integrations, and team training.",
    bullets: [
      "Dedicated implementation manager",
      "Full data migration from your current CRM",
      "Custom pipeline & workflow configuration",
      "Live team training sessions",
      "30-day hypercare post-launch",
    ],
    cta: "Start managed setup",
    badge: "Recommended",
    accentClass: "text-violet-400",
    borderClass: "border-violet-500",
    bgClass: "bg-violet-500/10",
  },
  {
    id: "self",
    title: "Set it up yourself",
    subtitle: "Configure your workspace with our guided wizard. Best for technical teams comfortable with CRM administration.",
    bullets: [
      "Step-by-step configuration guide",
      "AI-assisted field mapping",
      "Migration templates & documentation",
      "Standard support included",
      "Upgrade to managed anytime",
    ],
    cta: "Start self-service setup",
    accentClass: "text-teal-400",
    borderClass: "border-teal-500",
    bgClass: "bg-teal-500/10",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Landing() {
  const { startSession, saving, error } = useWizard();
  const [selected, setSelected] = useState<SetupPath | null>(null);

  const handleStart = async () => {
    if (!selected) return;
    await startSession(selected);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0d0b1a 0%, #140d2e 40%, #0a1628 100%)" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 20% 10%, rgba(124,58,237,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 90%, rgba(13,148,136,0.12) 0%, transparent 50%)",
        }}
      />

      <div className="relative border-b border-white/10 backdrop-blur-sm px-8 py-5 flex items-center justify-between">
        <img src={logoFull} alt="NexFlow" className="h-8 object-contain" onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
        }} />
        <div className="hidden items-center gap-2">
          <img src={logo} alt="NexFlow" className="h-7 w-7" />
          <span className="font-bold text-lg text-white tracking-tight">NexFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-violet-300 bg-violet-500/20 border border-violet-500/40 px-3 py-1 rounded-full">
            Enterprise Setup
          </span>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mb-14">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-60" style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)" }} />
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-800 flex items-center justify-center shadow-2xl shadow-violet-900/50">
                <img src={logo} alt="NexFlow" className="h-12 w-12 object-contain" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            Trusted by 200+ GCC enterprises
          </div>

          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Welcome to your
            <span className="block mt-1" style={{ background: "linear-gradient(90deg, #a78bfa, #34d399, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              NexFlow workspace
            </span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Answer a few questions and we'll configure your AI-native CRM, generate a tailored proposal, and have your team running in days — not months.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl mb-10">
          {PATHS.map((p) => {
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={[
                  "relative text-left rounded-2xl border-2 p-7 transition-all duration-300 focus:outline-none overflow-hidden",
                  isSelected ? `${p.borderClass} ${p.bgClass} shadow-2xl` : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20",
                ].join(" ")}
              >
                {p.badge && (
                  <span className="absolute top-4 right-4 text-xs font-bold text-violet-300 bg-violet-500/20 border border-violet-400/40 rounded-full px-2.5 py-1">
                    {p.badge}
                  </span>
                )}

                {isSelected && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${p.id === "managed" ? "rgba(124,58,237,0.08)" : "rgba(13,148,136,0.06)"}, transparent 70%)` }}
                  />
                )}

                <h2 className="font-bold text-white text-lg leading-snug mb-2 pr-20">{p.title}</h2>
                <p className="text-white/50 text-sm mb-5 leading-relaxed">{p.subtitle}</p>

                <ul className="space-y-2.5">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-white/70">
                      <CheckIcon className={`w-4 h-4 flex-shrink-0 ${p.accentClass}`} />
                      {b}
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <div className={`mt-6 flex items-center gap-2 text-sm font-semibold ${p.accentClass}`}>
                    <span className={`w-2 h-2 rounded-full ${p.id === "managed" ? "bg-violet-400" : "bg-teal-400"}`} />
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!selected || saving}
          className={[
            "relative px-12 py-4 rounded-2xl font-bold text-base transition-all duration-300 overflow-hidden",
            selected && !saving
              ? "text-white shadow-2xl shadow-violet-900/60 hover:-translate-y-0.5 hover:shadow-violet-800/80"
              : "bg-white/10 text-white/30 cursor-not-allowed border border-white/10",
          ].join(" ")}
          style={selected && !saving ? { background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" } : undefined}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Starting your workspace…
            </span>
          ) : selected ? (
            PATHS.find((p) => p.id === selected)!.cta + " →"
          ) : (
            "Select an option above"
          )}
        </button>

        <p className="mt-6 text-xs text-white/30 text-center">
          Takes 10–15 minutes · No credit card required · Proposal generated instantly
        </p>

        <div className="mt-12 flex items-center gap-8 text-xs text-white/25">
          {["PDPL Compliant", "In-Kingdom Data Residency", "ISO 27001 Aligned", "SOC 2 Type II"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-teal-500/60" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
