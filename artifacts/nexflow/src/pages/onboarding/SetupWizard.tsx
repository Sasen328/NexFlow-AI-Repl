import { lazy, Suspense } from "react";
import { useWizard } from "./context";
import { StepProgress } from "./components/StepProgress";
import { LivePricing } from "./components/LivePricing";
import logo from "@/assets/logo_mark.png";

const STEPS = [
  lazy(() => import("./steps/Step1Company")),
  lazy(() => import("./steps/Step2Team")),
  lazy(() => import("./steps/Step3Features")),
  lazy(() => import("./steps/Step4Volume")),
  lazy(() => import("./steps/Step5Preferences")),
  lazy(() => import("./steps/Step6Contact")),
];

const STEP_LABELS = [
  "Company & Branding",
  "Your Team",
  "Features & Tools",
  "Volume & Budget",
  "Integrations",
  "Contact Details",
];

function StepFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#B8A0C8", borderTopColor: "transparent" }} />
    </div>
  );
}

export default function SetupWizard() {
  const { step, totalSteps, goNext, goBack, saving, error, answers, sessionId } = useWizard();

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#B8A0C8", borderTopColor: "transparent" }} />
          <p className="text-muted-foreground text-sm">Loading your workspace session…</p>
        </div>
      </div>
    );
  }

  const StepComponent = STEPS[step - 1];

  const canProceed = (() => {
    if (step === 1) return answers.companyName.trim().length > 0 && answers.industry.length > 0;
    if (step === 6) return answers.contactName.trim().length > 0 && answers.contactEmail.includes("@");
    return true;
  })();

  const progressPct = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle mesh background */}
      <div className="nf-mesh-node n1" style={{ opacity: 0.2 }} />
      <div className="nf-mesh-node n3" style={{ opacity: 0.15 }} />

      {/* Header */}
      <div className="relative z-10 border-b border-border/60 bg-card/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg nf-chameleon-bg flex items-center justify-center shadow-md">
            <img src={logo} alt="NexFlow" className="h-5 w-5 object-contain brightness-0 invert" />
          </div>
          <div>
            <span className="font-bold text-foreground text-sm">NexFlow Setup</span>
            <p className="text-xs text-muted-foreground">{STEP_LABELS[step - 1]}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop step dots */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={[
                    "h-1.5 rounded-full transition-all duration-500",
                    i < step ? "w-8" : "bg-border w-5",
                  ].join(" ")}
                  style={i < step ? { background: "#B8A0C8" } : undefined}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Step {step} of {totalSteps}</span>
          </div>

          {/* Mobile circle progress */}
          <div className="sm:hidden">
            <div className="relative h-8 w-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="13" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle
                  cx="16" cy="16" r="13" fill="none" stroke="#B8A0C8" strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 13}`}
                  strokeDashoffset={`${2 * Math.PI * 13 * (1 - progressPct / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color: "#B8A0C8" }}>{step}/{totalSteps}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Left sidebar — step progress */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <StepProgress />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-muted">
              <div
                className="h-1 rounded-full transition-all duration-700 nf-chameleon-bg"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="p-6 sm:p-8">
              <Suspense fallback={<StepFallback />}>
                <StepComponent />
              </Suspense>

              {error && (
                <div className="mt-6 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive flex items-center gap-2">
                  <span className="flex-shrink-0">⚠</span>
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:border-[#B8A0C8]/50 hover:text-[#B8A0C8] transition-all"
                >
                  ← Back
                </button>

                <button
                  onClick={goNext}
                  disabled={!canProceed || saving}
                  className={[
                    "flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                    canProceed && !saving
                      ? "nf-chameleon-bg text-white shadow-lg hover:-translate-y-0.5"
                      : "bg-muted text-muted-foreground cursor-not-allowed",
                  ].join(" ")}
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : step === totalSteps ? (
                    "Generate Proposal →"
                  ) : (
                    "Continue →"
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right sidebar — live pricing */}
        <aside className="hidden xl:block w-64 flex-shrink-0">
          <LivePricing />
        </aside>
      </div>
    </div>
  );
}
