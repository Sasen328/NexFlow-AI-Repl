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
  accentHex: string;
}[] = [
  {
    id: "managed",
    title: "QPulse sets it up for you",
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
    accentHex: "#B8A0C8",
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
    accentHex: "#88B8B0",
  },
];

function CheckIcon({ color }: { color: string }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke={color} strokeOpacity="0.4" strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Living mesh — same as main app */}
      <div className="nf-mesh-node n1" />
      <div className="nf-mesh-node n2" />
      <div className="nf-mesh-node n3" />
      <div className="nf-mesh-node n4" />

      {/* Header */}
      <div className="relative z-10 border-b border-border/60 bg-card/80 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
        <img
          src={logoFull}
          alt="QPulse"
          className="h-7 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            const fb = document.createElement("div");
            fb.className = "flex items-center gap-2";
            fb.innerHTML = `<span class="font-bold text-foreground text-base">QPulse</span>`;
            (e.target as HTMLImageElement).parentElement?.appendChild(fb);
          }}
        />
        <span className="text-xs font-semibold px-3 py-1 rounded-full border"
          style={{ color: "#B8A0C8", background: "rgba(184,160,200,0.1)", borderColor: "rgba(184,160,200,0.3)" }}>
          Enterprise Setup
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">

        {/* Logo mark */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-2xl opacity-40 nf-chameleon-bg" />
            <div className="relative h-20 w-20 rounded-2xl nf-chameleon-bg flex items-center justify-center shadow-xl">
              <img src={logo} alt="NexFlow" className="h-12 w-12 object-contain brightness-0 invert nf-logo-mark" />
            </div>
          </div>
        </div>

        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-1.5 mb-6 border"
          style={{ color: "#88B8B0", background: "rgba(136,184,176,0.08)", borderColor: "rgba(136,184,176,0.25)" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#88B8B0" }} />
          Trusted by 200+ GCC enterprises
        </div>

        {/* Headline */}
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-5xl font-extrabold text-foreground leading-tight mb-4">
            Welcome to your
            <span className="block mt-1 nf-chameleon-text">QPulse workspace</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Answer a few questions and we'll configure your AI-native CRM, generate a tailored proposal, and have your team running in days — not months.
          </p>
        </div>

        {/* Path cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl mb-10">
          {PATHS.map((p) => {
            const isSelected = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={[
                  "relative text-left rounded-2xl border-2 p-7 transition-all duration-300 focus:outline-none overflow-hidden bg-card/80 backdrop-blur-sm",
                  isSelected ? "shadow-xl" : "border-border hover:border-border/80 hover:shadow-md",
                ].join(" ")}
                style={isSelected ? {
                  borderColor: p.accentHex,
                  boxShadow: `0 8px 32px ${p.accentHex}22`,
                } : undefined}
              >
                {p.badge && (
                  <span className="absolute top-4 right-4 text-xs font-bold rounded-full px-2.5 py-1"
                    style={{ color: "#B8A0C8", background: "rgba(184,160,200,0.12)", border: "1px solid rgba(184,160,200,0.3)" }}>
                    {p.badge}
                  </span>
                )}

                {isSelected && (
                  <div className="absolute inset-0 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(ellipse at top left, ${p.accentHex}0D, transparent 70%)` }} />
                )}

                <h2 className="font-bold text-foreground text-lg leading-snug mb-2 pr-20">{p.title}</h2>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{p.subtitle}</p>

                <ul className="space-y-2.5">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2.5 text-sm text-foreground/70">
                      <CheckIcon color={p.accentHex} />
                      {b}
                    </li>
                  ))}
                </ul>

                {isSelected && (
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold" style={{ color: p.accentHex }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: p.accentHex }} />
                    Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-5 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-xl px-5 py-3">
            {error}
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={handleStart}
          disabled={!selected || saving}
          className={[
            "relative px-12 py-4 rounded-2xl font-bold text-base transition-all duration-300 overflow-hidden",
            selected && !saving
              ? "nf-chameleon-bg text-white shadow-lg hover:-translate-y-0.5"
              : "bg-muted text-muted-foreground cursor-not-allowed border border-border",
          ].join(" ")}
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

        <p className="mt-5 text-xs text-muted-foreground text-center">
          Takes 10–15 minutes · No credit card required · Proposal generated instantly
        </p>

        {/* Compliance badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/60">
          {["PDPL Compliant", "In-Kingdom Data Residency", "ISO 27001 Aligned", "SOC 2 Type II"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#88B8B0]/60" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
