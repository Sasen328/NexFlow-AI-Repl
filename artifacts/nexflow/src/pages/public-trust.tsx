import { Shield, CheckCircle2, Globe, ExternalLink, Lock, Database, Server, FileText, Copy } from "lucide-react";

const CERTS = [
  { name: "SOC 2 Type II",   org: "AICPA",   year: "2025",  color: "#88B8B0" },
  { name: "ISO 27001",       org: "ISO",     year: "2025",  color: "#B8A0C8" },
  { name: "ISO 27701",       org: "ISO",     year: "2025",  color: "#C8A880" },
  { name: "GDPR",            org: "EU",      year: "ongoing", color: "#90B8B8" },
  { name: "KSA PDPL",        org: "SDAIA",   year: "2025",  color: "#C0A0B8" },
  { name: "UAE PDPL",        org: "UAE-DGA", year: "2025",  color: "#B8B880" },
];

const FACTS = [
  { label: "Uptime SLA",        value: "99.95%", icon: Server },
  { label: "Encryption at rest", value: "AES-256", icon: Lock },
  { label: "Encryption in transit", value: "TLS 1.3 / mTLS", icon: Lock },
  { label: "Pen test",          value: "Quarterly",       icon: Shield },
  { label: "Data residency",    value: "KSA · UAE · EU · US", icon: Globe },
  { label: "Bug bounty",        value: "Active · HackerOne", icon: Shield },
];

export default function PublicTrustPage() {
  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/public-trust`);
    alert("Public trust page link copied!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[#90B8B8]/5 to-background">
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Public-facing · share with procurement</div>
          <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50">
            <Copy className="w-3.5 h-3.5"/> Copy share link
          </button>
        </div>

        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl nf-chameleon-bg mb-4">
            <Shield className="w-8 h-8 text-white"/>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">NexFlow Trust & Security</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Built from day one for enterprise procurement. SOC 2 Type II, ISO 27001, KSA PDPL, and UAE PDPL — current and audited.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {CERTS.map(c => (
            <div key={c.name} className="glass-panel p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ background: `${c.color}20`, color: c.color }}>
                <CheckCircle2 className="w-6 h-6"/>
              </div>
              <div className="text-sm font-bold">{c.name}</div>
              <div className="text-[11px] text-muted-foreground">{c.org} · {c.year}</div>
              <button className="mt-2 text-[10px] font-bold uppercase px-2 py-1 rounded border border-border/40 hover:bg-muted/40 flex items-center gap-1 mx-auto">
                <FileText className="w-3 h-3"/> Audit report
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {FACTS.map(f => (
            <div key={f.label} className="glass-panel p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#88B8B0]/15 text-[#88B8B0] flex items-center justify-center"><f.icon className="w-5 h-5"/></div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase">{f.label}</div>
                <div className="text-sm font-bold">{f.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-panel p-5">
          <div className="text-sm font-bold mb-3 flex items-center gap-2"><Database className="w-4 h-4"/> Data residency</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { region: "🇸🇦 Saudi Arabia (Riyadh)", primary: true,  failover: "Jeddah" },
              { region: "🇦🇪 United Arab Emirates (Abu Dhabi)", primary: true,  failover: "Dubai" },
              { region: "🇶🇦 Qatar (Doha)",          primary: false, failover: "Riyadh" },
              { region: "🇧🇭 Bahrain (Manama)",      primary: false, failover: "Dubai" },
              { region: "🇪🇺 EU (Frankfurt)",        primary: true,  failover: "Dublin" },
              { region: "🇺🇸 US (Virginia)",          primary: true,  failover: "Oregon" },
            ].map(r => (
              <div key={r.region} className="flex items-center justify-between p-2 rounded border border-border/30">
                <div>
                  <div className="font-semibold">{r.region}</div>
                  <div className="text-[10px] text-muted-foreground">Failover: {r.failover}</div>
                </div>
                {r.primary && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#88B8B0]/15 text-[#88B8B0] font-bold">PRIMARY</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="text-sm font-bold mb-3">Documents available on request</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {["DPA (Data Processing Agreement)", "MSA (Master Services Agreement)", "Sub-processor list", "Pen test executive summary", "ISO 27001 certificate", "SOC 2 Type II report (NDA)", "GDPR compliance attestation", "KSA PDPL compliance brief"].map(d => (
              <div key={d} className="flex items-center justify-between p-2 rounded border border-border/30">
                <span>{d}</span>
                <button className="text-[#B8A0C8] flex items-center gap-1"><FileText className="w-3 h-3"/> Request</button>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4">
          Questions? Contact <a href="mailto:trust@nexflow.ai" className="text-[#B8A0C8] underline">trust@nexflow.ai</a> · Vulnerability disclosure: <a href="mailto:security@nexflow.ai" className="text-[#B8A0C8] underline">security@nexflow.ai</a>
        </div>
      </div>
    </div>
  );
}
