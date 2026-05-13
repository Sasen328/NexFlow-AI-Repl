import { useEffect, useState } from "react";
import { useWizard } from "./context";
import { formatSAR } from "./pricing";
import logo from "@/assets/logo_mark.png";

export default function ProposalView() {
  const { proposal, proposalLoading, generateProposal, approveProposal, saving, error, answers, pricing, sessionId, setupPath } = useWizard();
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    if (!proposal && !proposalLoading && sessionId) {
      generateProposal();
    }
  }, [sessionId]);

  if (proposalLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" style={{ borderWidth: 3 }} />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Building your proposal</h2>
          <p className="text-slate-500 text-sm">Our AI is analysing your requirements and generating a tailored proposal for {answers.companyName || "your company"}…</p>
          <div className="mt-6 space-y-2">
            {["Analysing company profile", "Mapping feature requirements", "Calculating ROI projections", "Generating implementation timeline"].map((t, i) => (
              <div key={t} className="flex items-center gap-3 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Could not generate proposal.</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button onClick={generateProposal} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    setApproving(true);
    await approveProposal();
    setApproving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={logo} alt="NexFlow" className="h-7 w-7" />
          <span className="font-bold text-slate-900">Your NexFlow Proposal</span>
          <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">v{proposal.version}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateProposal}
            disabled={proposalLoading}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            ↺ Regenerate
          </button>
          <button
            onClick={handleApprove}
            disabled={approving || saving}
            className={[
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              !approving ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200" : "bg-slate-200 text-slate-400",
            ].join(" ")}
          >
            {approving ? "Processing…" : "Approve & Launch →"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Cover */}
        <div
          className="rounded-3xl p-10 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${answers.primaryColor} 0%, ${answers.primaryColor}cc 100%)` }}
        >
          {answers.logoBase64 && (
            <img src={answers.logoBase64} alt="Company logo" className="h-12 mb-6 object-contain brightness-0 invert opacity-90" />
          )}
          <p className="text-sm font-medium opacity-80 mb-2">Enterprise CRM Proposal</p>
          <h1 className="text-4xl font-extrabold mb-3">{answers.companyName || "Your Company"}</h1>
          <p className="opacity-80 text-sm">{answers.industry} · {answers.countries.join(", ")}</p>
          <div className="mt-8 flex flex-wrap gap-6">
            <div>
              <p className="text-xs opacity-70">Monthly investment</p>
              <p className="text-2xl font-bold">{formatSAR(pricing.totalMonthly)}/mo</p>
            </div>
            {pricing.setupFee > 0 && (
              <div>
                <p className="text-xs opacity-70">Setup fee</p>
                <p className="text-2xl font-bold">{formatSAR(pricing.setupFee)}</p>
              </div>
            )}
            <div>
              <p className="text-xs opacity-70">Go-live timeline</p>
              <p className="text-2xl font-bold">~{pricing.timelineWeeks} weeks</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center text-sm">📋</span>
            Executive Summary
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{proposal.executiveSummary}</p>
        </section>

        {/* Module Breakdown */}
        <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <span className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center text-sm">⚙️</span>
            Your Module Stack
          </h2>
          <div className="space-y-4">
            {pricing.lines.map((line) => {
              const rationale = proposal.moduleRationale?.[line.name];
              return (
                <div key={line.name} className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-900 text-sm">{line.name}</p>
                      <span className="text-sm font-bold text-indigo-700">{formatSAR(line.monthly)}/mo</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{line.unit}</p>
                    {rationale && <p className="text-xs text-slate-600 leading-relaxed">{rationale}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ROI Projection */}
        {proposal.roiProjection?.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">📈</span>
              Projected Impact
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {proposal.roiProjection.map(({ metric, value }) => (
                <div key={metric} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                  <p className="text-xl font-extrabold text-emerald-700">{value}</p>
                  <p className="text-xs text-emerald-600 mt-1">{metric}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Implementation Phases */}
        {proposal.implementationPhases?.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-sm">🗓️</span>
              Implementation Roadmap
            </h2>
            <div className="space-y-4">
              {proposal.implementationPhases.map((phase, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    {i < proposal.implementationPhases.length - 1 && (
                      <div className="w-0.5 bg-indigo-200 flex-1 mt-1" style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900 text-sm">{phase.phase}</p>
                      <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{phase.weeks}</span>
                    </div>
                    <ul className="space-y-1">
                      {phase.tasks.map((t) => (
                        <li key={t} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="text-indigo-400 mt-0.5 flex-shrink-0">·</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Investment Summary */}
        <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <span className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center text-sm">💰</span>
            Investment Summary
          </h2>
          <div className="space-y-2 mb-4">
            {pricing.lines.map((l) => (
              <div key={l.name} className="flex justify-between text-sm">
                <span className="text-slate-600">{l.name} <span className="text-slate-400 text-xs">({l.unit})</span></span>
                <span className="font-medium text-slate-800">{formatSAR(l.monthly)}/mo</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between font-bold text-base">
              <span className="text-slate-900">Monthly total</span>
              <span className="text-indigo-700">{formatSAR(pricing.totalMonthly)}/mo</span>
            </div>
            {pricing.setupFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">One-time setup fee</span>
                <span className="font-medium text-slate-800">{formatSAR(pricing.setupFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Year 1 total investment</span>
              <span className="font-semibold text-slate-800">{formatSAR(pricing.annualTotal)}</span>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        {proposal.nextSteps?.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center text-sm">🚀</span>
              Next Steps
            </h2>
            <ol className="space-y-3">
              {proposal.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* CTA */}
        <div className="bg-indigo-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-extrabold mb-2">Ready to get started?</h3>
          <p className="opacity-80 text-sm mb-6">
            {setupPath === "managed"
              ? "Approve this proposal and our team will reach out within one business day."
              : "Approve this proposal and your workspace will be provisioned immediately."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleApprove}
              disabled={approving}
              className="px-8 py-3 bg-white text-indigo-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-lg"
            >
              {approving ? "Processing…" : "Approve & Launch Workspace"}
            </button>
            <button
              onClick={generateProposal}
              disabled={proposalLoading}
              className="px-8 py-3 border border-white/30 text-white font-medium rounded-xl hover:bg-white/10 transition-all"
            >
              ↺ Make changes & regenerate
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
