import { CheckCircle2, AlertCircle, XCircle, Sparkles, ExternalLink, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";

type Status = "live" | "demo" | "needs-api";

type Feature = {
  name: string;
  href: string;
  status: Status;
  tier: 1 | 2 | 3 | 4 | 0;
  what: string;
  needs?: string;
};

const FEATURES: Feature[] = [
  // Tier 1
  { name: "Workflow Builder",            href: "/workflows",         status: "live",      tier: 1, what: "Visual node graph saved to automations table; AI prompt → JSON workflow." },
  { name: "Lead Routing & Round-Robin",  href: "/lead-routing",      status: "live",      tier: 1, what: "Rules saved to automations; configurable conditions; assignment dropdown." },
  { name: "Web Forms & Landing Pages",   href: "/web-forms",         status: "live",      tier: 1, what: "Form builder saves to views table; embed code; submissions create contacts via tracking endpoint." },
  { name: "Document Tracking",           href: "/document-tracking", status: "live",      tier: 1, what: "Tracking pixel + click router log opens/clicks as activities, refresh contact engagement." },
  { name: "Customer Health Scores",      href: "/health-scores",     status: "live",      tier: 1, what: "Computed live from engagement, activities, deals, meetings — backend route." },

  // Tier 2
  { name: "Business Card Scanner",       href: "/business-cards",    status: "live",      tier: 2, what: "GPT-4o Vision OCR via OpenRouter — bilingual extraction, dedup on email, saves to contacts." },
  { name: "Mobile Offline Mode",         href: "/mobile",            status: "demo",      tier: 2, what: "Expo mobile app exists; offline cache layer is roadmap.", needs: "Local SQLite + sync queue (Expo work)" },
  { name: "WhatsApp Business",           href: "/whatsapp",          status: "needs-api", tier: 2, what: "UI ready — bilingual chat, templates, bot handoff.", needs: "Meta WhatsApp Business API or Twilio/Infobip" },
  { name: "Templates Library",           href: "/templates",         status: "live",      tier: 2, what: "Existing templates page; Arabic-first templates included in sample data." },
  { name: "Quote-to-Cash",               href: "/quote-to-cash",     status: "needs-api", tier: 2, what: "End-to-end UI; provider list (Tap, HyperPay, PayTabs, Mada).", needs: "Provider OAuth/API keys" },

  // Tier 3
  { name: "Account Hub (ABM)",           href: "/accounts",          status: "live",      tier: 3, what: "Buying-committee map, engagement heatmap, AI insights — wired to companies + contacts + activities." },
  { name: "Multi-Touch Attribution",     href: "/attribution",       status: "live",      tier: 3, what: "First/last/linear models computed from activities + UTM source per won deal." },
  { name: "AI Sales Playbooks",          href: "/playbooks",         status: "live",      tier: 3, what: "AI generates persona-specific playbooks via OpenAI/OpenRouter; saved to ai_insights." },
  { name: "Custom Report Builder",       href: "/report-builder",    status: "live",      tier: 3, what: "No-SQL query builder; pick entity, group, aggregate — renders against live API." },
  { name: "Migration Tool",              href: "/migration",         status: "live",      tier: 3, what: "CSV upload with auto-mapping; row-by-row import to contacts. Native CRM connectors need OAuth." },

  // Tier 4
  { name: "Trust Center",                href: "/trust-center",      status: "live",      tier: 4, what: "Compliance dashboard — SOC 2, ISO 27001, KSA/UAE PDPL, data residency, SSO, audit log." },
  { name: "Public Trust Page",           href: "/public-trust",      status: "live",      tier: 4, what: "Procurement-shareable static page with certs, residency, document requests." },
  { name: "Call Recording Redaction",    href: "/call-redaction",    status: "live",      tier: 4, what: "Regex-based PCI/PII redaction (cards, IBANs, iqama, SSN, emails, phones) — backend endpoint." },
  { name: "Field Permissions & Approvals", href: "/permissions",     status: "demo",      tier: 4, what: "Per-role × per-field matrix UI is interactive and saves locally. Server-side enforcement on API routes is roadmap.", needs: "Backend RBAC middleware + role-aware Zod schemas" },
  { name: "Activity Capture (paste-AI)", href: "/activity-capture",  status: "live",      tier: 4, what: "Paste raw email/meeting/call → AI extracts entities, intent, next-step → logs activity." },
];

const STATUS_META: Record<Status, { label: string; color: string; icon: any }> = {
  "live":      { label: "100% functional",  color: "#88B8B0", icon: CheckCircle2 },
  "demo":      { label: "demo / preview",   color: "#C8A880", icon: AlertCircle  },
  "needs-api": { label: "needs external API", color: "#C0A0B8", icon: XCircle    },
};

export default function CapabilitiesPage() {
  const counts = {
    live: FEATURES.filter(f => f.status === "live").length,
    demo: FEATURES.filter(f => f.status === "demo").length,
    api:  FEATURES.filter(f => f.status === "needs-api").length,
  };

  return (
    <div className="p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-lg nf-chameleon-bg flex items-center justify-center"><Sparkles className="w-5 h-5 text-white"/></div>
          <h1 className="text-2xl font-bold tracking-tight">Capabilities & Roadmap</h1>
        </div>
        <p className="text-sm text-muted-foreground ml-11">Honest scorecard: what's 100% functional today, what's a working demo, and what needs external API connections to go live.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-[#88B8B0]"/><div className="text-sm font-bold">Functional today</div></div>
          <div className="text-3xl font-bold text-[#88B8B0] mt-2">{counts.live}</div>
          <div className="text-xs text-muted-foreground">Backed by live database & AI — no extra setup.</div>
        </div>
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-[#C8A880]"/><div className="text-sm font-bold">Demo / preview</div></div>
          <div className="text-3xl font-bold text-[#C8A880] mt-2">{counts.demo}</div>
          <div className="text-xs text-muted-foreground">UI works, partial backend — production needs more work.</div>
        </div>
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2"><XCircle className="w-5 h-5 text-[#C0A0B8]"/><div className="text-sm font-bold">Needs external API</div></div>
          <div className="text-3xl font-bold text-[#C0A0B8] mt-2">{counts.api}</div>
          <div className="text-xs text-muted-foreground">Connect a third-party provider to enable.</div>
        </div>
      </div>

      {[1, 2, 3, 4].map(tier => (
        <div key={tier} className="glass-panel p-0 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#B8A0C8]/15 text-[#B8A0C8] text-[10px] font-bold uppercase">Tier {tier}</span>
            <div className="text-sm font-bold">{["Revenue accelerators", "Mobile & GCC-specific", "Advanced intelligence", "Enterprise & compliance"][tier - 1]}</div>
          </div>
          <div className="divide-y divide-border/30">
            {FEATURES.filter(f => f.tier === tier).map(f => {
              const m = STATUS_META[f.status];
              const Icon = m.icon;
              return (
                <Link key={f.name} href={f.href} className="block px-4 py-3 hover:bg-muted/40">
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: m.color }}/>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold">{f.name}</div>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${m.color}20`, color: m.color }}>{m.label}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{f.what}</div>
                      {f.needs && <div className="text-[11px] text-[#C0A0B8] mt-0.5">↳ Requires: {f.needs}</div>}
                    </div>
                    <LinkIcon className="w-4 h-4 text-muted-foreground"/>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div className="glass-panel p-4">
        <div className="text-sm font-bold mb-2">External APIs that would unlock the demo features</div>
        <ul className="text-xs space-y-1 text-muted-foreground">
          <li>• <b className="text-foreground">WhatsApp Business</b> — Meta Business Platform API, or Twilio / Infobip / 360dialog as BSP.</li>
          <li>• <b className="text-foreground">Quote-to-Cash payments</b> — Tap (GCC), HyperPay (MENA), PayTabs (GCC+EG), Mada (KSA), or Stripe (global). Each = 1-2 hour OAuth integration.</li>
          <li>• <b className="text-foreground">Telephony</b> — Twilio, Vonage, or Retell for outbound voice / call recording. Already have Twilio integration available.</li>
          <li>• <b className="text-foreground">Native CRM importers</b> — Salesforce, HubSpot, Zoho, Pipedrive, Dynamics OAuth for one-click migration. CSV path is live now.</li>
          <li>• <b className="text-foreground">Email sync</b> — Gmail / Microsoft Graph for two-way email + calendar (today: paste-to-AI capture is live).</li>
          <li>• <b className="text-foreground">Enrichment</b> — Lusha, Crunchbase, ZoomInfo, BuiltWith for company & person enrichment.</li>
        </ul>
      </div>
    </div>
  );
}
