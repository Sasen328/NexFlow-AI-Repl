import { useState } from "react";
import {
  Shield, Lock, KeyRound, Globe, FileCheck, Clock, Users, Eye, Download,
  CheckCircle2, AlertTriangle, ChevronRight, Server, Database, Award,
  Activity, Fingerprint, ScrollText, Building2, Settings2, ExternalLink, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COMPLIANCE = [
  { code: "SOC 2 Type II", status: "certified",  expiry: "Jan 2027",  scope: "Security, Availability, Confidentiality", color: "#88B8B0", icon: Shield },
  { code: "ISO 27001",     status: "certified",  expiry: "Mar 2027",  scope: "Information Security Management",         color: "#88B8B0", icon: Award },
  { code: "ISO 27701",     status: "certified",  expiry: "Mar 2027",  scope: "Privacy Information Management",          color: "#88B8B0", icon: Lock },
  { code: "GDPR",          status: "compliant",  expiry: "Continuous",scope: "EU data subject rights",                  color: "#B8A0C8", icon: Globe },
  { code: "KSA PDPL",      status: "compliant",  expiry: "Continuous",scope: "Saudi Personal Data Protection Law",      color: "#B8A0C8", icon: Globe },
  { code: "UAE PDPL",      status: "compliant",  expiry: "Continuous",scope: "UAE Federal Data Protection Law",         color: "#B8A0C8", icon: Globe },
  { code: "HIPAA",         status: "available",  expiry: "On request",scope: "US healthcare data (BAA)",                color: "#C8A880", icon: FileCheck },
  { code: "PCI DSS",       status: "in_progress",expiry: "Q3 2026",   scope: "Payment card data handling",              color: "#C8A880", icon: KeyRound },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  certified:   { bg: "bg-[#88B8B0]/15", text: "text-[#88B8B0]", label: "CERTIFIED" },
  compliant:   { bg: "bg-[#B8A0C8]/15", text: "text-[#B8A0C8]", label: "COMPLIANT" },
  available:   { bg: "bg-[#C8A880]/15", text: "text-[#C8A880]", label: "AVAILABLE" },
  in_progress: { bg: "bg-[#B8B880]/15", text: "text-[#B8B880]", label: "IN PROGRESS" },
};

const REGIONS = [
  { region: "KSA",    primary: "Riyadh (STC Cloud)",    secondary: "Jeddah",    flag: "🇸🇦", residency: true,  rto: "15 min", rpo: "5 min" },
  { region: "UAE",    primary: "Dubai (G42 Cloud)",     secondary: "Abu Dhabi", flag: "🇦🇪", residency: true,  rto: "15 min", rpo: "5 min" },
  { region: "Qatar",  primary: "Doha (Ooredoo)",        secondary: "Doha-2",    flag: "🇶🇦", residency: true,  rto: "30 min", rpo: "5 min" },
  { region: "Bahrain",primary: "Manama (AWS me-south-1)",secondary: "Manama-2", flag: "🇧🇭", residency: true,  rto: "15 min", rpo: "5 min" },
  { region: "EU",     primary: "Frankfurt",             secondary: "Dublin",    flag: "🇪🇺", residency: true,  rto: "15 min", rpo: "5 min" },
  { region: "US",     primary: "us-east-1",             secondary: "us-west-2", flag: "🇺🇸", residency: false, rto: "30 min", rpo: "5 min" },
];

const SSO_PROVIDERS = [
  { name: "Microsoft Entra ID (Azure AD)", icon: "M",  status: "configured", users: 84, color: "#88B8B0" },
  { name: "Okta",                          icon: "O",  status: "configured", users: 12, color: "#88B8B0" },
  { name: "Google Workspace",              icon: "G",  status: "available",  users: 0,  color: "#C8A880" },
  { name: "OneLogin",                      icon: "1",  status: "available",  users: 0,  color: "#C8A880" },
  { name: "Custom SAML 2.0",               icon: "S",  status: "available",  users: 0,  color: "#C8A880" },
  { name: "SCIM 2.0 provisioning",         icon: "✦",  status: "configured", users: 96, color: "#88B8B0" },
];

const AUDIT_LOG = [
  { id: "1", time: "today 10:32",  user: "admin@nexflow.ai",       action: "Granted role 'Sales Manager' to f.khalid@nexflow.ai", risk: "low" },
  { id: "2", time: "today 09:15",  user: "system",                 action: "PDPL data export completed for user req-4821",     risk: "low" },
  { id: "3", time: "today 08:00",  user: "system",                 action: "Daily encrypted backup completed (4.2 GB)",        risk: "low" },
  { id: "4", time: "yesterday",    user: "a.rashidi@nexflow.ai",   action: "API key 'analytics-prod' rotated",                 risk: "medium" },
  { id: "5", time: "yesterday",    user: "system",                 action: "Failed login attempt blocked (5 attempts)",        risk: "high" },
  { id: "6", time: "2 days ago",   user: "m.alotaibi@nexflow.ai",  action: "Bulk export of 2,400 contacts",                    risk: "medium" },
  { id: "7", time: "2 days ago",   user: "admin@nexflow.ai",       action: "MFA policy updated: TOTP required for all roles", risk: "low" },
  { id: "8", time: "3 days ago",   user: "system",                 action: "Pen-test by Bishop Fox completed — 0 critical",    risk: "low" },
];

const RISK_STYLE: Record<string, string> = {
  low:    "bg-[#88B8B0]/15 text-[#88B8B0]",
  medium: "bg-[#C8A880]/15 text-[#C8A880]",
  high:   "bg-[#C0A0B8]/15 text-[#C0A0B8]",
};

const SECURITY_CONTROLS = [
  { label: "AES-256 encryption at rest",         enabled: true, icon: Lock },
  { label: "TLS 1.3 in transit (mTLS available)",enabled: true, icon: Shield },
  { label: "Field-level encryption for PII",     enabled: true, icon: Fingerprint },
  { label: "Row-level security per tenant",      enabled: true, icon: Database },
  { label: "Role-based access control (RBAC)",   enabled: true, icon: KeyRound },
  { label: "Multi-factor authentication (MFA)",  enabled: true, icon: Fingerprint },
  { label: "IP allow-listing",                   enabled: true, icon: Server },
  { label: "Session recording for admin actions",enabled: true, icon: Eye },
  { label: "Customer-managed encryption keys (CMEK)", enabled: false, icon: KeyRound },
  { label: "BYO Cloud (single-tenant)",          enabled: false, icon: Server },
];

const RETENTION = [
  { type: "Call recordings",    period: "90 days",    deletion: "auto" },
  { type: "Call transcripts",   period: "2 years",    deletion: "auto" },
  { type: "Email content",      period: "7 years",    deletion: "manual" },
  { type: "Activity logs",      period: "1 year",     deletion: "auto" },
  { type: "Audit logs",         period: "7 years",    deletion: "manual" },
  { type: "Backups",            period: "30 days rolling", deletion: "auto" },
  { type: "Deleted contacts",   period: "30 days soft delete", deletion: "auto" },
];

export default function TrustCenterPage() {
  const [tab, setTab] = useState<"overview" | "compliance" | "data" | "access" | "audit">("overview");

  return (
    <div className="p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Trust Center</h1>
            <span className="px-2 py-0.5 rounded-md bg-[#88B8B0]/15 text-[#88B8B0] text-[10px] font-bold uppercase tracking-wide">
              Enterprise Ready
            </span>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Compliance, data residency, security controls, and audit trail. Procurement-grade trust documentation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border/40 hover:bg-muted/50 transition">
            <Download className="w-3.5 h-3.5" /> Export trust pack (PDF)
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white nf-chameleon-bg shadow-sm">
            <ExternalLink className="w-3.5 h-3.5" /> Public trust page
          </button>
        </div>
      </div>

      {/* Trust score banner */}
      <div className="glass-panel rounded-xl p-4 border border-[#88B8B0]/30 bg-gradient-to-r from-[#88B8B0]/10 to-transparent">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="rgba(180,180,200,0.15)" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="#88B8B0" strokeWidth="3" strokeDasharray="94, 100" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-black text-[#88B8B0]">94</div>
              <div className="text-[8px] text-muted-foreground uppercase font-bold tracking-wide">trust</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-base font-bold">Excellent · enterprise procurement ready</div>
            <div className="text-xs text-muted-foreground mt-1">
              All Tier-1 certifications current. 8 out of 10 advanced controls enabled. Last 3rd-party penetration test passed with 0 critical findings (Bishop Fox, March 2026).
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-[10px] text-[#88B8B0] font-semibold">
                <CheckCircle2 className="w-3 h-3" /> SOC 2 current
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#88B8B0] font-semibold">
                <CheckCircle2 className="w-3 h-3" /> ISO 27001 current
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#88B8B0] font-semibold">
                <CheckCircle2 className="w-3 h-3" /> KSA PDPL ready
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#C8A880] font-semibold">
                <AlertTriangle className="w-3 h-3" /> 1 medium-risk audit event (24h)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/30">
        {([
          { k: "overview",   label: "Overview",         icon: Activity },
          { k: "compliance", label: "Compliance",       icon: Award },
          { k: "data",       label: "Data residency",   icon: Globe },
          { k: "access",     label: "Access & SSO",     icon: KeyRound },
          { k: "audit",      label: "Audit log",        icon: ScrollText },
        ] as const).map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition",
              isActive ? "border-[#B8A0C8] text-[#B8A0C8]" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 glass-panel rounded-xl p-4">
            <div className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#88B8B0]" /> Security controls
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SECURITY_CONTROLS.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className={cn("flex items-center gap-2.5 p-2.5 rounded-lg border",
                    c.enabled ? "border-[#88B8B0]/30 bg-[#88B8B0]/5" : "border-border/30 bg-muted/20"
                  )}>
                    <Icon className={cn("w-4 h-4 flex-shrink-0", c.enabled ? "text-[#88B8B0]" : "text-muted-foreground")} />
                    <span className={cn("text-xs font-semibold flex-1", c.enabled ? "" : "text-muted-foreground")}>{c.label}</span>
                    {c.enabled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#88B8B0] flex-shrink-0" />
                    ) : (
                      <button className="text-[10px] font-bold text-[#B8A0C8] hover:underline">Enable</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-4 space-y-3">
            <div className="glass-panel rounded-xl p-3.5">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Data retention
              </div>
              <div className="space-y-1.5">
                {RETENTION.map((r) => (
                  <div key={r.type} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-muted/40">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{r.type}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {r.deletion === "auto" ? "Auto-purge" : "Manual purge"}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-[#B8A0C8]">{r.period}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-xl p-3.5 border border-[#B8A0C8]/30 bg-[#B8A0C8]/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#B8A0C8]" />
                <div className="text-xs font-bold">AI privacy guarantees</div>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#88B8B0] flex-shrink-0 mt-0.5" /><span>Your data never trains foundation models</span></div>
                <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#88B8B0] flex-shrink-0 mt-0.5" /><span>Zero-retention with OpenAI / Anthropic / Gemini</span></div>
                <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#88B8B0] flex-shrink-0 mt-0.5" /><span>Inference logs purged after 30 days</span></div>
                <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#88B8B0] flex-shrink-0 mt-0.5" /><span>PII redaction before LLM calls (toggleable)</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "compliance" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {COMPLIANCE.map((c) => {
            const Icon = c.icon;
            const ss = STATUS_STYLE[c.status];
            return (
              <div key={c.code} className="glass-panel rounded-xl p-4 hover:shadow-md transition cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}20`, color: c.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold", ss.bg, ss.text)}>{ss.label}</span>
                </div>
                <div className="text-sm font-bold">{c.code}</div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{c.scope}</div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
                  <div className="text-[10px] text-muted-foreground">Valid until</div>
                  <div className="text-[10px] font-bold text-foreground/80">{c.expiry}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "data" && (
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 glass-panel rounded-xl p-4">
            <div className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#B8A0C8]" /> Regional data residency
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {REGIONS.map((r) => (
                <div key={r.region} className="p-3 rounded-lg border border-border/40 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{r.flag}</span>
                      <div>
                        <div className="text-sm font-bold">{r.region}</div>
                        <div className="text-[10px] text-muted-foreground">Primary: {r.primary}</div>
                      </div>
                    </div>
                    {r.residency && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#88B8B0]/15 text-[#88B8B0]">
                        IN-COUNTRY
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-border/30">
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase">Failover</div>
                      <div className="text-[10px] font-semibold">{r.secondary}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase">RTO</div>
                      <div className="text-[10px] font-semibold text-[#B8A0C8]">{r.rto}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase">RPO</div>
                      <div className="text-[10px] font-semibold text-[#B8A0C8]">{r.rpo}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "access" && (
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-7 glass-panel rounded-xl p-4">
            <div className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#B8A0C8]" /> SSO & identity providers
            </div>
            <div className="space-y-2">
              {SSO_PROVIDERS.map((p) => (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-muted/30">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: p.color }}>{p.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {p.users > 0 ? `${p.users} users provisioned` : "Not configured"}
                    </div>
                  </div>
                  {p.status === "configured" ? (
                    <>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#88B8B0]/15 text-[#88B8B0]">ACTIVE</span>
                      <button className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"><Settings2 className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <button className="px-2.5 py-1 rounded-md text-[10px] font-bold text-white nf-chameleon-bg">Configure</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-5 glass-panel rounded-xl p-4">
            <div className="text-sm font-bold mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#B8A0C8]" /> Access policies
            </div>
            <div className="space-y-2">
              {[
                { label: "MFA required for all roles",      on: true,  desc: "TOTP or hardware key" },
                { label: "IP allow-list",                   on: true,  desc: "12 ranges configured" },
                { label: "Session timeout (8h idle)",       on: true,  desc: "Re-auth required" },
                { label: "Password rotation (90d)",         on: true,  desc: "Min 14 chars, MFA exempt" },
                { label: "Just-in-time admin access",       on: false, desc: "Temporary privilege grants" },
                { label: "Anomalous login detection",       on: true,  desc: "AI flags travel + device shifts" },
                { label: "Field-level permissions",         on: true,  desc: "Hide salary, contracts" },
                { label: "Approval workflows on >$50k discount", on: false, desc: "Manager sign-off" },
              ].map((p) => (
                <div key={p.label} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{p.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{p.desc}</div>
                  </div>
                  <div className={cn("relative w-8 h-4 rounded-full transition", p.on ? "bg-[#88B8B0]" : "bg-muted")}>
                    <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition", p.on ? "left-4" : "left-0.5")} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "audit" && (
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold flex items-center gap-1.5">
              <ScrollText className="w-4 h-4 text-[#B8A0C8]" /> Audit log <span className="text-[10px] text-muted-foreground font-normal">last 30 days</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 rounded-md text-[10px] font-semibold border border-border/40 hover:bg-muted/50">Filter</button>
              <button className="px-2 py-1 rounded-md text-[10px] font-semibold border border-border/40 hover:bg-muted/50 flex items-center gap-1">
                <Download className="w-3 h-3" /> CSV
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {AUDIT_LOG.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/40 border-b border-border/20">
                <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold w-16 text-center flex-shrink-0", RISK_STYLE[a.risk])}>{a.risk.toUpperCase()}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{a.action}</div>
                  <div className="text-[10px] text-muted-foreground">{a.user}</div>
                </div>
                <div className="text-[10px] text-muted-foreground w-24 text-right flex-shrink-0">{a.time}</div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
