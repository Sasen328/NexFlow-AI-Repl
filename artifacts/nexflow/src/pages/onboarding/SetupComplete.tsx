import { useEffect, useState } from "react";
import { apiFetch } from "@/hooks/useApi";
import logo from "@/assets/logo_mark.png";

interface TenantConfig {
  slug: string;
  companyName: string;
  setupPath: string;
  enabledModules: string[];
  status: string;
}

export default function SetupComplete() {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("s");

  useEffect(() => {
    if (!sessionId) return;
    apiFetch(`/setup/sessions/${sessionId}/config`)
      .then((d: TenantConfig) => setConfig(d))
      .catch(() => {});
  }, [sessionId]);

  const CHECKLIST = [
    { done: true,  label: "Workspace provisioned",           sub: "Your tenant configuration is saved" },
    { done: true,  label: "Modules activated",               sub: `${config?.enabledModules?.length ?? "—"} features enabled` },
    { done: true,  label: "Pipeline structure applied",      sub: "Stages and workflows configured" },
    { done: false, label: "Team invitations",                sub: "Send invites to your team members" },
    { done: false, label: config?.setupPath === "managed" ? "Implementation kickoff call" : "Data import", sub: config?.setupPath === "managed" ? "We'll reach out within 1 business day" : "Upload your contacts and companies" },
    { done: false, label: "Go live 🎉",                     sub: "Your full NexFlow workspace goes live" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm px-6 py-4 flex items-center gap-3">
        <img src={logo} alt="NexFlow" className="h-7 w-7" />
        <span className="font-bold text-slate-900">NexFlow Setup</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Celebration */}
        <div className="text-center max-w-xl mb-12">
          <div className="text-6xl mb-5">🎉</div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            {config?.companyName ? `${config.companyName}'s workspace is ready` : "Your workspace is ready"}
          </h1>
          <p className="text-lg text-slate-500">
            {config?.setupPath === "managed"
              ? "Your proposal is approved. Our implementation team will contact you within one business day to kick off your setup."
              : "Your workspace has been configured and is ready for you to start inviting your team."}
          </p>
        </div>

        {/* Setup checklist */}
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Setup Progress</h2>
          <div className="space-y-3">
            {CHECKLIST.map(({ done, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <div className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400",
                ].join(" ")}>
                  {done ? "✓" : "○"}
                </div>
                <div>
                  <p className={["text-sm font-medium", done ? "text-slate-900" : "text-slate-500"].join(" ")}>{label}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What was configured */}
        {config && (
          <div className="w-full max-w-lg bg-indigo-50 border border-indigo-200 rounded-2xl p-5 mb-8">
            <h2 className="text-sm font-bold text-indigo-800 mb-3 uppercase tracking-wide">What's been configured</h2>
            <div className="grid grid-cols-2 gap-2 text-xs text-indigo-700">
              <span className="font-medium">Workspace ID</span>
              <span className="font-mono bg-white/60 rounded px-1.5 py-0.5">{config.slug}</span>
              <span className="font-medium">Modules enabled</span>
              <span>{config.enabledModules?.length} modules</span>
              <span className="font-medium">Setup type</span>
              <span>{config.setupPath === "managed" ? "NexFlow Managed" : "Self-service"}</span>
            </div>
          </div>
        )}

        {/* Next action */}
        <div className="flex flex-col sm:flex-row gap-3">
          {config?.setupPath === "managed" ? (
            <div className="text-center bg-white border border-slate-200 rounded-xl px-6 py-4 shadow-sm">
              <p className="text-sm font-medium text-slate-700 mb-1">Your implementation manager will reach out to:</p>
              <p className="text-sm font-bold text-indigo-700">Schedule your kickoff call</p>
            </div>
          ) : (
            <a
              href="/signin"
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg text-center"
            >
              Enter your workspace →
            </a>
          )}
        </div>

        <p className="mt-8 text-xs text-slate-400 text-center max-w-sm">
          A copy of your proposal has been saved. You can refer back to this page using your session link anytime.
        </p>
      </div>
    </div>
  );
}
