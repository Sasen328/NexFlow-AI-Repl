import { useEffect, useState } from "react";
import logo from "@/assets/logo_mark.png";
import { CheckCircle, ArrowRight, Users, Rocket, Download, Phone, Palette, Building2, Globe } from "lucide-react";

interface TenantConfig {
  companyName: string;
  companyNameAr?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  logoBase64?: string | null;
  enabledModules: string[];
  countries: string[];
  industry: string;
  crNumber?: string;
  companyWebsite?: string;
  setupPath: string;
  slug: string;
  approvedAt: string;
}

const MODULE_LABELS: Record<string, string> = {
  core:              "Core CRM",
  dialer:            "Power Dialer",
  enrichment:        "Enrichment Engine",
  marketing:         "Marketing Suite",
  "voice-agents":    "AI Voice Agents",
  intelligence:      "Intelligence Engines",
  forecasting:       "Forecasting & Analytics",
  cpq:               "Quotes & CPQ",
  "website-tracking":"Website Tracking",
};

export default function SetupComplete() {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    // Read the wizard choices that were saved to localStorage on approval
    try {
      const raw = localStorage.getItem("nf:tenant_config");
      if (raw) {
        const parsed: TenantConfig = JSON.parse(raw);
        setConfig(parsed);

        // Apply the company's chosen brand color to the document so the
        // completion page actually REFLECTS their choice
        if (parsed.primaryColor) {
          document.documentElement.style.setProperty("--nf-tenant-primary", parsed.primaryColor);
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => p + 1), 1100);
    return () => clearInterval(t);
  }, []);

  const isManaged = config?.setupPath === "managed";
  const primary   = config?.primaryColor ?? "#B8A0C8";
  const secondary = config?.secondaryColor ?? "#88B8B0";
  const accent    = config?.accentColor ?? "#C8A880";

  const DONE_STEPS = [
    { label: "Workspace provisioned",     sub: "Your tenant configuration is saved & encrypted" },
    { label: "Modules activated",         sub: `${config?.enabledModules?.length ?? "—"} features configured and ready` },
    { label: "Brand identity applied",    sub: `Your colour palette and logo saved to workspace` },
    { label: "Pipeline structure ready",  sub: "Sales stages and workflows configured" },
  ];

  const NEXT_STEPS = isManaged
    ? [
        { icon: <Phone className="w-4 h-4" />,  label: "Implementation kickoff call", sub: "Your dedicated manager will reach out within 1 business day" },
        { icon: <Users className="w-4 h-4" />,  label: "Team invitations",            sub: "They'll invite your team once the workspace is configured" },
        { icon: <Rocket className="w-4 h-4" />, label: "Go live",                     sub: "Your full NexFlow workspace goes live — typically in 2–3 weeks" },
      ]
    : [
        { icon: <Users className="w-4 h-4" />,    label: "Invite your team",   sub: "Send invitations to your colleagues from Workspace settings" },
        { icon: <Download className="w-4 h-4" />, label: "Import your data",   sub: "Upload contacts and companies from the Enrichment Engine" },
        { icon: <Rocket className="w-4 h-4" />,   label: "Go live",            sub: "Start making calls, logging activities and closing deals" },
      ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle mesh */}
      <div className="nf-mesh-node n1" style={{ opacity: 0.2 }} />
      <div className="nf-mesh-node n2" style={{ opacity: 0.15 }} />

      {/* Header */}
      <div className="relative z-10 border-b border-border/60 bg-card/90 backdrop-blur-sm px-6 py-4 flex items-center gap-3 shadow-sm">
        <div className="h-8 w-8 rounded-lg nf-chameleon-bg flex items-center justify-center shadow-md">
          <img src={logo} alt="NexFlow" className="h-5 w-5 object-contain brightness-0 invert" />
        </div>
        <span className="font-bold text-foreground">NexFlow Setup</span>
        <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
          style={{ color: "#88B8B0", background: "rgba(136,184,176,0.1)", borderColor: "rgba(136,184,176,0.3)" }}>
          Complete ✓
        </span>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">

        {/* Big checkmark — uses company's chosen brand color */}
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div
              className="absolute w-28 h-28 rounded-full opacity-25 animate-ping"
              style={{ background: `radial-gradient(circle, ${primary}, transparent)`, animationDuration: "2.5s" }}
            />
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${primary} 0%, ${primary}cc 100%)` }}
            >
              <CheckCircle className="w-10 h-10" />
            </div>
          </div>

          {/* Company logo (if uploaded) */}
          {config?.logoBase64 && (
            <div className="flex justify-center mb-4">
              <img src={config.logoBase64} alt="Company logo" className="h-10 object-contain rounded-lg" />
            </div>
          )}

          <h1 className="text-3xl font-extrabold text-foreground mb-3">
            {config?.companyName ? `${config.companyName}'s workspace is ready` : "Your workspace is ready"}
          </h1>
          {config?.companyNameAr && (
            <p className="text-lg text-muted-foreground mb-2" dir="rtl">{config.companyNameAr}</p>
          )}
          <p className="text-muted-foreground leading-relaxed">
            {isManaged
              ? "Your proposal is approved. Our implementation team will contact you within one business day."
              : "Your workspace is configured and ready. Enter it now to start inviting your team."}
          </p>
        </div>

        <div className="space-y-5">

          {/* Brand preview — what the user actually chose */}
          {config && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" style={{ color: primary }} />
                Your Brand Identity
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-2">
                  {[primary, secondary, accent].map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl shadow-sm border border-white/20" style={{ background: c }} />
                      <span className="text-[9px] font-mono text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 h-8 rounded-xl nf-chameleon-bg opacity-80" style={
                  config.primaryColor !== "#B8A0C8" ?
                  { background: `linear-gradient(90deg, ${primary}, ${secondary}, ${accent})`, opacity: 1 } :
                  undefined
                } />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {config.industry && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    {config.industry}
                  </div>
                )}
                {config.countries?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="w-3 h-3" />
                    {config.countries.join(", ")}
                  </div>
                )}
                {config.crNumber && (
                  <div className="text-muted-foreground">CR: <span className="font-mono">{config.crNumber}</span></div>
                )}
                {config.companyWebsite && (
                  <div className="text-muted-foreground truncate">{config.companyWebsite}</div>
                )}
              </div>
            </div>
          )}

          {/* Activated modules */}
          {config?.enabledModules?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                {config.enabledModules.length} Modules Activated
              </p>
              <div className="flex flex-wrap gap-2">
                {config.enabledModules.map((id) => (
                  <span key={id} className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                    style={{ color: primary, background: `${primary}12`, borderColor: `${primary}30` }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: primary }} />
                    {MODULE_LABELS[id] ?? id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Completed steps */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Completed</p>
            <div className="space-y-3">
              {DONE_STEPS.map(({ label, sub }, i) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white"
                    style={{ background: `linear-gradient(135deg, ${secondary}, #6aaa9e)` }}>
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next steps — with animated pulse-in */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">What's next</p>
            <div className="space-y-3">
              {NEXT_STEPS.map(({ icon, label, sub }, i) => (
                <div key={label} className="flex items-start gap-3">
                  <div className={[
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-500",
                  ].join(" ")}
                    style={pulse > i
                      ? { background: `linear-gradient(135deg, ${primary}, ${primary}aa)`, color: "white" }
                      : { background: "var(--muted)", color: "var(--muted-foreground)" }
                    }>
                    {pulse > i ? <CheckCircle className="w-3.5 h-3.5" /> : icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold transition-colors"
                      style={{ color: pulse > i ? "var(--foreground)" : "var(--muted-foreground)" }}>
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {isManaged ? (
            <div className="text-center bg-card border border-border rounded-2xl px-8 py-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${primary}15` }}>
                <Phone className="w-5 h-5" style={{ color: primary }} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">Your implementation manager will reach out to</p>
              <p className="text-sm font-bold" style={{ color: primary }}>Schedule your kickoff call</p>
            </div>
          ) : (
            <a
              href="/home"
              className="flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:-translate-y-0.5 transition-all nf-chameleon-bg"
            >
              Enter your workspace
              <ArrowRight className="w-5 h-5" />
            </a>
          )}
        </div>

        <p className="mt-6 text-xs text-muted-foreground text-center max-w-sm mx-auto">
          A copy of your proposal has been saved. Your workspace ID: <span className="font-mono">{config?.slug ?? "—"}</span>
        </p>
      </div>
    </div>
  );
}
