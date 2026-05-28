import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import logo from "@/assets/logo_mark.png";
import { CheckCircle, ArrowRight, Palette, Building2, Globe, Rocket } from "lucide-react";

interface TenantConfig {
  companyName: string;
  companyNameAr?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  logoBase64?: string | null;
  enabledModules: string[];
  tabStructure?: string[];
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

const COUNTDOWN_SECS = 4;

export default function SetupComplete() {
  const [, navigate] = useLocation();
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECS);

  // Read saved tenant config on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nf:tenant_config");
      if (raw) setConfig(JSON.parse(raw) as TenantConfig);
    } catch { /* ignore */ }
  }, []);

  // Countdown → auto-navigate to /home
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/home");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  const primary   = config?.primaryColor   ?? "#B8A0C8";
  const secondary = config?.secondaryColor ?? "#88B8B0";
  const accent    = config?.accentColor    ?? "#C8A880";

  const progressPct = ((COUNTDOWN_SECS - countdown) / COUNTDOWN_SECS) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Mesh */}
      <div className="nf-mesh-node n1" style={{ opacity: 0.2 }} />
      <div className="nf-mesh-node n2" style={{ opacity: 0.15 }} />

      {/* Header */}
      <div className="relative z-10 border-b border-border/60 bg-card/90 backdrop-blur-sm px-6 py-4 flex items-center gap-3 shadow-sm">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center shadow-md"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
          <img src={logo} alt="NexFlow" className="h-5 w-5 object-contain brightness-0 invert" />
        </div>
        <span className="font-bold text-foreground">NexFlow Setup</span>
        <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
          style={{ color: secondary, background: `${secondary}18`, borderColor: `${secondary}40` }}>
          Complete ✓
        </span>
      </div>

      {/* Auto-redirect progress bar */}
      <div className="relative z-10 h-1 bg-muted">
        <div
          className="h-1 transition-all duration-1000 ease-linear"
          style={{
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${primary}, ${secondary})`,
          }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl space-y-5">

          {/* Big checkmark */}
          <div className="text-center mb-8">
            <div className="relative inline-flex items-center justify-center mb-5">
              <div
                className="absolute w-28 h-28 rounded-full opacity-20 animate-ping"
                style={{ background: `radial-gradient(circle, ${primary}, transparent)`, animationDuration: "2s" }}
              />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` }}
              >
                <CheckCircle className="w-10 h-10" />
              </div>
            </div>

            {config?.logoBase64 && (
              <div className="flex justify-center mb-3">
                <img src={config.logoBase64} alt="Company logo" className="h-10 object-contain rounded-lg" />
              </div>
            )}

            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              {config?.companyName ? `${config.companyName}'s workspace is live` : "Your workspace is live"}
            </h1>
            {config?.companyNameAr && (
              <p className="text-lg text-muted-foreground mb-2" dir="rtl">{config.companyNameAr}</p>
            )}
            <p className="text-muted-foreground">
              All your settings have been applied. Entering your workspace now…
            </p>
          </div>

          {/* Brand preview */}
          {config && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" style={{ color: primary }} />
                Brand Identity Applied
              </p>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex gap-2">
                  {[primary, secondary, accent].map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-9 h-9 rounded-xl shadow-sm border border-white/20" style={{ background: c }} />
                      <span className="text-[9px] font-mono text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="flex-1 h-7 rounded-xl"
                  style={{ background: `linear-gradient(90deg, ${primary}, ${secondary}, ${accent})` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {config.industry && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="w-3 h-3" />{config.industry}
                  </div>
                )}
                {config.countries?.length > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Globe className="w-3 h-3" />{config.countries.join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modules activated */}
          {config?.enabledModules?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                {config.enabledModules.length} Modules Activated
              </p>
              <div className="flex flex-wrap gap-2">
                {config.enabledModules.map((id) => (
                  <span key={id}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                    style={{ color: primary, background: `${primary}12`, borderColor: `${primary}30` }}>
                    <CheckCircle className="w-3 h-3" />
                    {MODULE_LABELS[id] ?? id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Auto-redirect CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate("/home")}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:-translate-y-0.5 transition-all"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              <Rocket className="w-5 h-5" />
              Enter workspace now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Redirecting automatically in <span className="font-bold tabular-nums" style={{ color: primary }}>{countdown}s</span>
            {config?.slug && (
              <> · Workspace ID: <span className="font-mono">{config.slug}</span></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
