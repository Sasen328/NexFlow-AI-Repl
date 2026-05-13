import { useEffect, useState } from "react";
import { apiFetch } from "@/hooks/useApi";
import logo from "@/assets/logo_mark.png";
import { CheckCircle, Circle, ArrowRight, Users, Rocket, Download, Phone } from "lucide-react";

interface TenantConfig {
  slug: string;
  companyName: string;
  setupPath: string;
  enabledModules: string[];
  status: string;
}

const DONE_STEPS = [
  { icon: <CheckCircle className="w-4 h-4" />, label: "Workspace provisioned",      sub: "Your tenant configuration is saved & encrypted" },
  { icon: <CheckCircle className="w-4 h-4" />, label: "Modules activated",           sub: "Features configured and ready to use" },
  { icon: <CheckCircle className="w-4 h-4" />, label: "Pipeline structure applied",  sub: "Sales stages and workflows configured" },
  { icon: <CheckCircle className="w-4 h-4" />, label: "Brand identity saved",        sub: "Your colours and logo are applied to the workspace" },
];

export default function SetupComplete() {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [pulse, setPulse] = useState(0);
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("s");

  useEffect(() => {
    if (!sessionId) return;
    apiFetch(`/setup/sessions/${sessionId}/config`)
      .then((d: TenantConfig) => setConfig(d))
      .catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => p + 1), 1200);
    return () => clearInterval(t);
  }, []);

  const isManaged = config?.setupPath === "managed";

  const NEXT_STEPS = isManaged
    ? [
        { icon: <Phone className="w-4 h-4" />,   label: "Implementation kickoff call", sub: "Your dedicated manager will reach out within 1 business day" },
        { icon: <Users className="w-4 h-4" />,   label: "Team invitations",            sub: "They'll invite your team once the workspace is configured" },
        { icon: <Rocket className="w-4 h-4" />,  label: "Go live",                     sub: "Your full NexFlow workspace goes live — typically in 2–3 weeks" },
      ]
    : [
        { icon: <Users className="w-4 h-4" />,    label: "Invite your team",            sub: "Send invitations to your colleagues from the Workspace settings" },
        { icon: <Download className="w-4 h-4" />, label: "Import your data",            sub: "Upload your contacts and companies from the Enrichment Engine" },
        { icon: <Rocket className="w-4 h-4" />,   label: "Go live",                     sub: "Start making calls, logging activities and closing deals" },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-white flex flex-col">
      <div className="border-b border-slate-200/60 bg-white/90 backdrop-blur-sm px-6 py-4 flex items-center gap-3 shadow-sm">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-md shadow-violet-200">
          <img src={logo} alt="NexFlow" className="h-5 w-5 object-contain" />
        </div>
        <span className="font-bold text-slate-900">NexFlow Setup</span>
        <span className="ml-2 text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
          Complete ✓
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-xl mb-12">
          <div className="relative inline-flex items-center justify-center mb-8">
            <div
              className="absolute w-28 h-28 rounded-full opacity-20 animate-ping"
              style={{ background: "radial-gradient(circle, #7C3AED, transparent)", animationDuration: "2.5s" }}
            />
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl shadow-violet-300"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" }}
            >
              <CheckCircle className="w-10 h-10" />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            {config?.companyName ? `${config.companyName}'s workspace is ready` : "Your workspace is ready"}
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            {isManaged
              ? "Your proposal is approved. Our implementation team will contact you within one business day."
              : "Your workspace is configured and ready. Enter it now to start inviting your team."}
          </p>
        </div>

        <div className="w-full max-w-lg space-y-5 mb-10">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Completed</p>
            <div className="space-y-3">
              {DONE_STEPS.map(({ icon, label, sub }, i) => (
                <div key={label} className="flex items-start gap-3" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What's next</p>
            <div className="space-y-3">
              {NEXT_STEPS.map(({ icon, label, sub }, i) => (
                <div key={label} className="flex items-start gap-3">
                  <div className={[
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                    pulse > i ? "bg-gradient-to-br from-violet-500 to-violet-700 text-white" : "bg-slate-100 text-slate-400",
                  ].join(" ")}>
                    {pulse > i ? <CheckCircle className="w-3.5 h-3.5" /> : icon}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold transition-colors ${pulse > i ? "text-slate-900" : "text-slate-500"}`}>{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {config && (
            <div
              className="rounded-2xl p-5 border"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(13,148,136,0.06) 100%)", borderColor: "rgba(124,58,237,0.2)" }}
            >
              <p className="text-xs font-bold text-violet-700 uppercase tracking-widest mb-3">Workspace configuration</p>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                {[
                  ["Workspace ID",    config.slug],
                  ["Modules enabled", `${config.enabledModules?.length ?? "—"} features`],
                  ["Setup type",      isManaged ? "NexFlow Managed" : "Self-service"],
                  ["Status",          "Active"],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <span className="text-violet-600 font-medium">{k}</span>
                    <span className="font-mono text-slate-700 bg-white/60 rounded px-1.5 py-0.5">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {isManaged ? (
            <div className="text-center bg-white border border-slate-200 rounded-2xl px-8 py-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                <Phone className="w-5 h-5 text-violet-600" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Your implementation manager will reach out to</p>
              <p className="text-sm font-bold text-violet-700">Schedule your kickoff call</p>
            </div>
          ) : (
            <a
              href="/home"
              className="flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-base shadow-2xl shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 transition-all"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" }}
            >
              Enter your workspace
              <ArrowRight className="w-5 h-5" />
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
