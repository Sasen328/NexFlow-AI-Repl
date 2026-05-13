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
      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SetupWizard() {
  const { step, totalSteps, goNext, goBack, saving, error, answers, sessionId } = useWizard();

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d0b1a 0%, #140d2e 40%, #0a1628 100%)" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Loading your workspace session…</p>
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

  const progressPct = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-white">
      <div className="border-b border-slate-200/60 bg-white/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-md shadow-violet-200">
            <img src={logo} alt="NexFlow" className="h-5 w-5 object-contain" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">NexFlow Setup</span>
            <p className="text-xs text-slate-400">{STEP_LABELS[step - 1]}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={[
                    "h-1.5 rounded-full transition-all duration-500",
                    i < step ? "bg-violet-600 w-8" : "bg-slate-200 w-5",
                  ].join(" ")}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400">Step {step} of {totalSteps}</span>
          </div>
          <div className="sm:hidden">
            <div className="relative h-8 w-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="13" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="16" cy="16" r="13" fill="none" stroke="#7C3AED" strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 13}`}
                  strokeDashoffset={`${2 * Math.PI * 13 * (1 - progressPct / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-violet-700">{step}/{totalSteps}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <StepProgress />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-1 bg-slate-100">
              <div
                className="h-1 rounded-full transition-all duration-700"
                style={{ width: `${(step / totalSteps) * 100}%`, background: "linear-gradient(90deg, #7C3AED, #0D9488)" }}
              />
            </div>

            <div className="p-6 sm:p-8">
              <Suspense fallback={<StepFallback />}>
                <StepComponent />
              </Suspense>

              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                  <span className="w-4 h-4 text-red-500 flex-shrink-0">⚠</span>
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-all"
                >
                  ← Back
                </button>

                <button
                  onClick={goNext}
                  disabled={!canProceed || saving}
                  className={[
                    "flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                    canProceed && !saving
                      ? "text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed",
                  ].join(" ")}
                  style={canProceed && !saving ? { background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" } : undefined}
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

        <aside className="hidden xl:block w-64 flex-shrink-0">
          <LivePricing />
        </aside>
      </div>
    </div>
  );
}
