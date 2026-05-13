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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-6"
            style={{ borderColor: "#B8A0C8", borderTopColor: "transparent", borderWidth: 3 }} />
          <h2 className="text-xl font-bold text-foreground mb-2">Building your proposal</h2>
          <p className="text-muted-foreground text-sm">Our AI is analysing your requirements and generating a tailored proposal for {answers.companyName || "your company"}…</p>
          <div className="mt-6 space-y-2">
            {["Analysing company profile", "Mapping feature requirements", "Calculating ROI projections", "Generating implementation timeline"].map((t, i) => (
              <div key={t} className="flex items-center gap-3 text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-2.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#B8A0C8", animationDelay: `${i * 0.3}s` }} />
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Could not generate proposal.</p>
          {error && <p className="text-destructive text-sm mb-4">{error}</p>}
          <button onClick={generateProposal} className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold nf-chameleon-bg">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg nf-chameleon-bg flex items-center justify-center">
            <img src={logo} alt="NexFlow" className="h-4 w-4 object-contain brightness-0 invert" />
          </div>
          <span className="font-bold text-foreground">Your NexFlow Proposal</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">v{proposal.version}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateProposal}
            disabled={proposalLoading}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:border-[#B8A0C8]/50 hover:text-[#B8A0C8] transition-all"
          >
            ↺ Regenerate
          </button>
          <button
            onClick={handleApprove}
            disabled={approving || saving}
            className={[
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              !approving ? "nf-chameleon-bg text-white shadow-md hover:-translate-y-0.5" : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {approving ? "Processing…" : "Approve & Launch →"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Cover — uses the company's chosen brand color */}
        <div
          className="rounded-3xl p-10 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${answers.primaryColor} 0%, ${answers.primaryColor}bb 100%)` }}
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
        <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(184,160,200,0.15)" }}>📋</span>
            Executive Summary
          </h2>
          <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap">{proposal.executiveSummary}</p>
        </section>

        {/* Module Breakdown */}
        <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(184,160,200,0.15)" }}>⚙️</span>
            Your Module Stack
          </h2>
          <div className="space-y-4">
            {pricing.lines.map((line) => {
              const rationale = proposal.moduleRationale?.[line.name];
              return (
                <div key={line.name} className="flex gap-4 p-4 bg-muted/40 border border-border rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-foreground text-sm">{line.name}</p>
                      <span className="text-sm font-bold" style={{ color: "#B8A0C8" }}>{formatSAR(line.monthly)}/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{line.unit}</p>
                    {rationale && <p className="text-xs text-foreground/70 leading-relaxed">{rationale}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ROI Projection */}
        {proposal.roiProjection?.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(136,184,176,0.15)" }}>📈</span>
              Projected Impact
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {proposal.roiProjection.map(({ metric, value }: { metric: string; value: string }) => (
                <div key={metric} className="border border-border rounded-xl p-4 text-center" style={{ background: "rgba(136,184,176,0.06)" }}>
                  <p className="text-xl font-extrabold" style={{ color: "#88B8B0" }}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Implementation Roadmap */}
        {proposal.implementationPhases?.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(200,168,128,0.15)" }}>🗓️</span>
              Implementation Roadmap
            </h2>
            <div className="space-y-4">
              {proposal.implementationPhases.map((phase: any, i: number) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0 nf-chameleon-bg">
                      {i + 1}
                    </div>
                    {i < proposal.implementationPhases.length - 1 && (
                      <div className="w-0.5 flex-1 mt-1" style={{ background: "rgba(184,160,200,0.3)", minHeight: 24 }} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm">{phase.phase}</p>
                      <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{phase.weeks}</span>
                    </div>
                    <ul className="space-y-1">
                      {phase.tasks.map((t: string) => (
                        <li key={t} className="text-xs text-foreground/70 flex items-start gap-1.5">
                          <span className="mt-0.5 flex-shrink-0" style={{ color: "#B8A0C8" }}>·</span>{t}
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
        <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(200,168,128,0.15)" }}>💰</span>
            Investment Summary
          </h2>
          <div className="space-y-2 mb-4">
            {pricing.lines.map((l) => (
              <div key={l.name} className="flex justify-between text-sm">
                <span className="text-foreground/70">{l.name} <span className="text-muted-foreground text-xs">({l.unit})</span></span>
                <span className="font-medium text-foreground">{formatSAR(l.monthly)}/mo</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between font-bold text-base">
              <span className="text-foreground">Monthly total</span>
              <span style={{ color: "#B8A0C8" }}>{formatSAR(pricing.totalMonthly)}/mo</span>
            </div>
            {pricing.setupFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">One-time setup fee</span>
                <span className="font-medium text-foreground">{formatSAR(pricing.setupFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Year 1 total investment</span>
              <span className="font-semibold text-foreground">{formatSAR(pricing.annualTotal)}</span>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        {proposal.nextSteps?.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-7 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "rgba(184,160,200,0.15)" }}>🚀</span>
              Next Steps
            </h2>
            <ol className="space-y-3">
              {proposal.nextSteps.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 text-white nf-chameleon-bg">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* CTA — uses company's chosen brand color */}
        <div
          className="rounded-2xl p-8 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${answers.primaryColor} 0%, ${answers.primaryColor}cc 100%)` }}
        >
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
              className="px-8 py-3 bg-white font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg"
              style={{ color: answers.primaryColor }}
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
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
