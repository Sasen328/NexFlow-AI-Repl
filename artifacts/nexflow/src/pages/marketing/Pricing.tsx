import { useState } from "react";
import { Link } from "wouter";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Cycle = "monthly" | "annual";

interface Plan {
  key: string;
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  unit: string;
  cta: string;
  ctaHref: string;
  featured?: boolean;
  accent: string;
  badge?: string;
  features: string[];
  limits?: string;
}

const PLANS: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    tagline: "For 1–5 reps testing the waters.",
    monthly: 0,
    annual: 0,
    unit: "free forever",
    cta: "Start Free",
    ctaHref: "/signup?plan=starter",
    accent: "#88B8B0",
    badge: "Free forever",
    limits: "Up to 5 seats · 1,000 contacts · 100 AI credits/mo",
    features: [
      "Full CRM (Pipeline, Deals, Contacts, Companies)",
      "Daily AI Briefing (5 insights/day)",
      "Up to 50 calls/mo with transcription",
      "1 active marketing sequence",
      "Email support",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    tagline: "For 6–25 reps. Most teams pick this.",
    monthly: 539,
    annual: 449,
    unit: "SAR / seat / month",
    cta: "Start 14-day trial",
    ctaHref: "/signup?plan=growth",
    accent: "#B8A0C8",
    featured: true,
    badge: "Most popular",
    features: [
      "Everything in Starter, no contact / AI limits",
      "Power Dialer + AI Voice Agent (basic)",
      "Conversation Intelligence + AI Coach",
      "Bulk enrichment (1K credits/seat/mo)",
      "Marketing AI Strategy Builder + multi-channel",
      "Cultural Intelligence (Khaleeji + RTL)",
      "Workflows + Lead Routing",
      "Priority Arabic + English support",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "25+ reps. Regulated industries. Custom contract.",
    monthly: 1079,
    annual: 899,
    unit: "SAR / seat / month",
    cta: "Talk to sales",
    ctaHref: "/signup?plan=enterprise",
    accent: "#C0A0B8",
    badge: "KSA enterprise",
    features: [
      "Everything in Growth",
      "In-Kingdom data residency (KSA / UAE region)",
      "Advanced AI Voice Agent (custom Khaleeji models)",
      "Account Hub (ABM) + Forecasting AI + Health Scores",
      "Custom workflow approvals + SLA timers",
      "SSO (SAML, Okta, Azure AD), audit logs, PDPL pack",
      "Named CSM + quarterly business review",
      "Migration & onboarding from Salesforce/HubSpot",
    ],
  },
  {
    key: "sovereign",
    name: "Sovereign",
    tagline: "PIF / regulated giants. Single-tenant on-prem.",
    monthly: null,
    annual: null,
    unit: "Custom pricing",
    cta: "Contact us",
    ctaHref: "/signup?plan=sovereign",
    accent: "#C8A880",
    badge: "On-NCA cloud",
    features: [
      "Everything in Enterprise",
      "Single-tenant deployment in NCA-compliant zone",
      "Dedicated GPU pool for AI Workforce",
      "Custom fine-tuned voice + LLM on customer data",
      "On-prem connectors (SAP S/4, Oracle, Aramco SLAs)",
      "Source-code escrow + 99.95% SLA",
    ],
  },
];

const ADDONS = [
  { name: "Extra AI Credits", price: "SAR 199", unit: "per 1,000 credits", desc: "Voice transcription, enrichment lookups, AI-drafted email" },
  { name: "Advanced Sandbox", price: "SAR 1,499", unit: "/month",          desc: "Full-data clone for testing workflows + integrations"      },
  { name: "Migration Service", price: "SAR 14,900", unit: "one-time",      desc: "We migrate your Salesforce / HubSpot / Zoho data in"      },
  { name: "Implementation Lead", price: "SAR 4,990", unit: "/month",       desc: "Dedicated KSA-based CSM for your rollout"                  },
];

const FAQ = [
  { q: "Can I switch plans later?", a: "Yes. Upgrade or downgrade anytime — billing prorates automatically." },
  { q: "What is an AI credit?", a: "1 credit ≈ 1 enrichment lookup, 1 minute of voice transcription, or 1 LLM-drafted email. Unused credits roll over within an annual term." },
  { q: "Do you offer discounts for non-profits / startups?", a: "Yes — 50% off Growth for verified KSA/GCC startups in their first 3 years and registered non-profits." },
  { q: "Is data really stored in KSA?", a: "On Enterprise and Sovereign tiers, yes — your data is processed and stored in-Kingdom. Starter and Growth use a UAE region by default." },
  { q: "What about Arabic support?", a: "Bilingual at the schema level. Every UI surface, AI prompt, and dashboard speaks Arabic and English natively, RTL by default." },
];

export default function PricingPage() {
  const [cycle, setCycle] = useState<Cycle>("annual");

  return (
    <div className="space-y-16 pb-12 pt-12">
      {/* Hero */}
      <section className="px-4 max-w-[1000px] mx-auto text-center">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#C8A880] mb-3">Pricing plan</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 leading-[1.1]">
          SAR-priced. Per seat. <span className="bg-gradient-to-r from-[#B8A0C8] to-[#C8A880] bg-clip-text text-transparent">AI included.</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Four plans. Each fully featured for its segment — no Marketing-Hub vs Sales-Hub vs Service-Hub balkanization.
        </p>

        {/* Annual / Monthly toggle */}
        <div className="inline-flex items-center gap-1 mt-7 p-1 rounded-xl border border-border/40 bg-muted/20">
          <button
            onClick={() => setCycle("annual")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
              cycle === "annual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Annual <span className="text-[10px] uppercase tracking-wider text-[#88B8B0] ml-1">save 17%</span>
          </button>
          <button
            onClick={() => setCycle("monthly")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
              cycle === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Monthly
          </button>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 max-w-[1300px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((p) => {
            const price = cycle === "annual" ? p.annual : p.monthly;
            const isCustom = price === null;
            const isFree = price === 0;
            return (
              <div
                key={p.key}
                className={cn(
                  "rounded-2xl p-6 border flex flex-col",
                  p.featured ? "border-2 shadow-xl" : "border-border/40",
                  "glass-card",
                )}
                style={p.featured ? { borderColor: p.accent } : undefined}
              >
                {p.badge && (
                  <div
                    className="self-start px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 text-white"
                    style={{ background: p.featured
                      ? `linear-gradient(135deg,${p.accent},#B8A0C8)`
                      : p.accent }}
                  >
                    {p.badge}
                  </div>
                )}
                <div className="text-xl font-black">{p.name}</div>
                <div className="text-xs text-muted-foreground mb-4 min-h-[2.25rem]">{p.tagline}</div>

                <div className="mb-1">
                  {isCustom ? (
                    <div className="text-3xl font-black">Let's talk</div>
                  ) : isFree ? (
                    <div className="text-3xl font-black">Free</div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black tabular-nums">SAR&nbsp;{price}</span>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5">{p.unit}</div>
                </div>

                {p.limits && (
                  <div className="text-[11px] text-muted-foreground mt-3 mb-4 italic">{p.limits}</div>
                )}

                <Link href={p.ctaHref}>
                  <button
                    className={cn(
                      "w-full mt-3 mb-4 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5",
                      p.featured ? "text-white shadow-lg" : "border border-border/60 hover:bg-muted/40",
                    )}
                    style={p.featured ? { background: `linear-gradient(135deg,${p.accent},#88B8B0)` } : undefined}
                  >
                    {p.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>

                <div className="flex-1 border-t border-border/30 pt-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
                    What's included
                  </div>
                  <ul className="space-y-2">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px]">
                        <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: p.accent }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add-ons */}
      <section className="px-4 max-w-[1100px] mx-auto">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#88B8B0] mb-2 text-center">Add-ons & customization</div>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-6">Optional extras — added to any plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ADDONS.map((a, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border border-border/30 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold">{a.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.desc}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-base font-black tabular-nums">{a.price}</div>
                <div className="text-[10px] text-muted-foreground">{a.unit}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 max-w-[900px] mx-auto">
        <div className="text-[10px] font-black tracking-[0.25em] uppercase text-[#B8A0C8] mb-2 text-center">FAQ</div>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-6">Common questions</h2>
        <div className="space-y-2">
          {FAQ.map((f, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border border-border/30">
              <div className="text-sm font-bold mb-1">{f.q}</div>
              <div className="text-sm text-muted-foreground">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 max-w-[900px] mx-auto">
        <div className="rounded-3xl p-10 text-center border border-border/30"
          style={{ background: "linear-gradient(135deg,#B8A0C815,#88B8B015,#C8A88015)" }}
        >
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-[#B8A0C8]" />
          <h3 className="text-2xl sm:text-3xl font-black mb-3">Still deciding?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
            Start free for 5 seats — no credit card, no time limit. Upgrade only when you outgrow it.
          </p>
          <Link href="/signup?plan=starter">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold shadow-lg"
              style={{ background: "linear-gradient(135deg,#B8A0C8,#88B8B0)" }}
            >
              Start free <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      <p className="text-center text-[11px] text-muted-foreground px-4">
        Prices in SAR. USD shown indicatively at SAR 3.75 / USD. Annual term with monthly billing available on request.
      </p>
    </div>
  );
}
