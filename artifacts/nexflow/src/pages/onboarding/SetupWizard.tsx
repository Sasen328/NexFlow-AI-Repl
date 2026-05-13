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

function StepFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SetupWizard() {
  const { step, totalSteps, goNext, goBack, saving, error, answers, sessionId } = useWizard();

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your session…</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="NexFlow" className="h-7 w-7" />
          <span className="font-bold text-slate-900">NexFlow Setup</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={[
                  "h-1.5 w-8 rounded-full transition-all",
                  i < step ? "bg-indigo-600" : "bg-slate-200",
                ].join(" ")}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-500">
            Step {step} of {totalSteps}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Left: Step progress */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <StepProgress />
          </div>
        </aside>

        {/* Center: Step content */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <Suspense fallback={<StepFallback />}>
              <StepComponent />
            </Suspense>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                ← Back
              </button>

              <button
                onClick={goNext}
                disabled={!canProceed || saving}
                className={[
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  canProceed && !saving
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed",
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
        </main>

        {/* Right: Live pricing */}
        <aside className="hidden xl:block w-64 flex-shrink-0">
          <LivePricing />
        </aside>
      </div>
    </div>
  );
}
