const base = import.meta.env.BASE_URL;

const TIERS = [
  {
    name: "Starter",
    tag: "For 1–5 reps",
    sar: "Free",
    usd: "$0",
    note: "Forever-free. Up to 5 seats, 1,000 contacts, 100 AI credits/mo.",
    inc: ["Full CRM (Pipeline, Deals, Contacts, Companies)", "Daily AI Briefing (5 insights/day)", "Up to 50 calls/mo with transcription", "1 active marketing sequence", "Email support"],
    color: "bg-mist",
    accent: "text-mist",
  },
  {
    name: "Growth",
    tag: "For 6–25 reps",
    sar: "SAR 449",
    usd: "≈ $120",
    perSeat: true,
    note: "Per seat / month, billed annually. Most teams start here.",
    inc: ["Everything in Starter, no limits on contacts or AI", "Power Dialer + AI Voice Agent (basic)", "Conversation Intelligence + AI Coach", "Bulk enrichment (1K credits/seat/mo)", "Marketing AI Strategy Builder + multi-channel", "Cultural Intelligence (Khaleeji + RTL templates)", "Workflows + Lead Routing", "Priority Arabic + English support"],
    color: "bg-seafoam",
    accent: "text-seafoam",
    featured: true,
  },
  {
    name: "Enterprise",
    tag: "For 25+ reps · regulated",
    sar: "SAR 899",
    usd: "≈ $240",
    perSeat: true,
    note: "Per seat / month, custom contract. Built for KSA enterprise.",
    inc: ["Everything in Growth", "In-Kingdom data residency (KSA / UAE region)", "Advanced AI Voice Agent (custom Khaleeji models)", "Account Hub (ABM) + Forecasting AI + Health Scores", "Custom workflow approvals + SLA timers", "SSO (SAML, Okta, Azure AD), audit logs, PDPL pack", "Named CSM + quarterly business review", "Migration & onboarding from Salesforce / HubSpot included"],
    color: "bg-lavender",
    accent: "text-lavender",
  },
  {
    name: "Sovereign",
    tag: "For PIF / regulated giants",
    sar: "Custom",
    usd: "Custom",
    note: "Single-tenant, on-NCA-compliant cloud, dedicated AI runtime.",
    inc: ["Everything in Enterprise", "Single-tenant deployment in customer NCA-compliant zone", "Dedicated GPU pool for AI Workforce", "Custom fine-tuned voice + LLM on customer data", "On-prem connectors (SAP S/4, Oracle, Aramco SLAs)", "Source-code escrow + 99.95% SLA"],
    color: "bg-ink",
    accent: "text-ink",
    dark: true,
  },
];

export default function PricingModel() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-sand" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>26 · Pricing model</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <h2 className="font-display font-extrabold text-[3.2vw] leading-[1.04] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          SAR-priced. Per seat. AI included. No SKU lottery.
        </h2>
        <p className="mt-[1vh] font-serif italic text-[1.05vw] leading-snug text-ink/75 max-w-[72vw] [text-wrap:pretty]">
          Four plans. Each one fully featured for its segment — no Marketing-Hub vs Sales-Hub vs Service-Hub vs Operations-Hub balkanization.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[6vh] grid grid-cols-4 gap-[1.2vw]">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-[1vw] border p-[1.4vw] flex flex-col ${tier.dark ? "bg-ink text-bg border-ink" : "bg-white/85 border-ink/10"} ${tier.featured ? "shadow-[0_30px_80px_-20px_rgba(136,184,176,0.55)] ring-2 ring-seafoam" : ""}`}
          >
            {tier.featured && (
              <div className="absolute -top-[1.4vh] left-1/2 -translate-x-1/2 px-[0.9vw] py-[0.4vh] rounded-full bg-seafoam text-white text-[0.7vw] uppercase tracking-[0.22em] font-bold">
                Most teams pick this
              </div>
            )}
            <div className="flex items-center gap-[0.6vw]">
              <span className={`w-[1.1vw] h-[1.1vw] rotate-45 rounded-[0.2vw] ${tier.color}`} />
              <span className={`font-display font-extrabold text-[1.5vw] leading-none ${tier.dark ? "text-bg" : ""}`}>{tier.name}</span>
            </div>
            <div className={`mt-[0.6vh] text-[0.78vw] uppercase tracking-[0.2em] font-bold ${tier.dark ? "text-bg/55" : "text-ink/55"}`}>{tier.tag}</div>

            <div className="mt-[1.5vh] flex items-baseline gap-[0.6vw]">
              <span className={`font-display font-extrabold text-[2.4vw] leading-none ${tier.dark ? "text-bg" : ""}`}>{tier.sar}</span>
              {tier.perSeat && <span className={`text-[0.85vw] ${tier.dark ? "text-bg/55" : "text-ink/55"}`}>/seat/mo</span>}
            </div>
            <div className={`mt-[0.2vh] text-[0.85vw] ${tier.dark ? "text-bg/55" : "text-ink/55"}`}>{tier.usd}{tier.perSeat ? " · USD equivalent" : ""}</div>
            <div className={`mt-[0.8vh] text-[0.75vw] leading-snug italic ${tier.dark ? "text-bg/65" : "text-ink/60"} [text-wrap:pretty]`}>{tier.note}</div>

            <div className={`mt-[1.4vh] pt-[1vh] border-t ${tier.dark ? "border-bg/20" : "border-ink/10"} flex-1`}>
              <ul className="space-y-[0.7vh] text-[0.78vw] leading-snug">
                {tier.inc.map((line) => (
                  <li key={line} className="flex gap-[0.5vw]">
                    <span className={`flex-shrink-0 font-bold ${tier.dark ? "text-seafoam" : "text-seafoam"}`}>✓</span>
                    <span className={tier.dark ? "text-bg/85" : "text-ink/80"}>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-[1.4vh] left-[6vw] right-[6vw] text-[0.78vw] text-ink/55 italic">
        AI credits = 1 credit ≈ 1 enrichment lookup, 1 minute of voice transcription, or 1 LLM-drafted email. Unused credits roll over within annual term. SAR pricing fixed at contract; USD shown indicatively at SAR 3.75 / USD.
      </div>
    </div>
  );
}
