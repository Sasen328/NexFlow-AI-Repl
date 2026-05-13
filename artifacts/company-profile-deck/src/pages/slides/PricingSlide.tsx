const base = import.meta.env.BASE_URL;

export default function PricingSlide() {
  const tiers = [
    {
      name: "Starter", price: "SAR 299", per: "/seat/month", color: "border-mist", accent: "bg-mist",
      tagline: "For growing teams who need CRM + WhatsApp from day one.",
      includes: ["CRM Core (pipeline, contacts, deals)", "WhatsApp Business inbox", "Email + basic sequences", "AI Daily Briefing", "Up to 10 seats", "Saudi data residency"],
      notIncluded: ["Power Dialer", "AI Voice Agents", "Enrichment Engine", "Campaign Builder"],
    },
    {
      name: "Growth", price: "SAR 699", per: "/seat/month", color: "border-seafoam", accent: "bg-seafoam",
      tagline: "Full CRM + Call Center + Marketing for scaling revenue teams.",
      includes: ["Everything in Starter", "Power Dialer (3 modes)", "Conversation Intelligence", "AI Campaign Builder (7 channels)", "Post-call automation", "ICP scoring + Forgotten Leads", "Cultural Intelligence Engine", "Up to 100 seats"],
      notIncluded: ["AI Voice Agents (add-on)", "Intelligence Engines"],
    },
    {
      name: "Enterprise", price: "SAR 1,299", per: "/seat/month", color: "border-sand", accent: "bg-sand",
      tagline: "All three engines. Arabic AI Voice. 16-agent research. Sovereign deployment.",
      includes: ["Everything in Growth", "AI Voice Agents — 6 Arabic dialects", "All 4 Intelligence Engines (Masaar, Person, Company, Lead Finder)", "CEO Situation Room", "Multi-office dashboards", "KSA PDPL redaction + compliance pack", "Mada / Tap / HyperPay Quote-to-Cash", "Custom AI Playbooks", "White-glove onboarding", "Unlimited seats"],
      notIncluded: [],
    },
  ];

  const addons = [
    { name: "AI Voice Agent calls", price: "SAR 0.45/min" },
    { name: "Enrichment credits", price: "SAR 2.50/contact" },
    { name: "Intelligence Engine run", price: "SAR 35/run" },
    { name: "Business Card scan", price: "SAR 1.20/card" },
    { name: "WhatsApp broadcast", price: "SAR 0.08/message" },
    { name: "Mada payment processing", price: "1.0% (lowest in market)" },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-20 blur-[6vw] bg-sand" />
        <div className="absolute bottom-[-10vh] left-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-18 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Pricing · SAR-anchored · All-in</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          SAR-priced. No USD volatility. No add-on stack.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">Three tiers. One schema. AI included at every level. 60–80% cheaper than Salesforce equivalent with add-ons.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[27vh] bottom-[4vh]">
        <div className="grid grid-cols-3 gap-[1.2vw] mb-[1.2vh]">
          {tiers.map((t, i) => (
            <div key={i} className={`rounded-[1.2vw] bg-white/72 border-2 ${t.color} p-[1.3vw] flex flex-col`}>
              <div className="flex items-start justify-between mb-[0.5vh]">
                <span className="font-display font-extrabold text-[1.5vw]">{t.name}</span>
                <div className="text-right">
                  <span className="font-display font-extrabold text-[1.8vw] leading-none">{t.price}</span>
                  <span className="text-[0.78vw] text-ink/50 block">{t.per}</span>
                </div>
              </div>
              <p className="text-[0.82vw] text-ink/60 mb-[0.8vh] italic">{t.tagline}</p>
              <ul className="space-y-[0.3vh] flex-1">
                {t.includes.map((item, j) => (
                  <li key={j} className="flex gap-[0.5vw] items-start">
                    <span className={`mt-[0.3vh] w-[0.55vw] h-[0.55vw] rounded-full ${t.accent} flex-shrink-0`} />
                    <span className="text-[0.82vw] text-ink/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="rounded-[1vw] bg-ink/4 border border-ink/8 px-[1.4vw] py-[0.8vh]">
          <div className="text-[0.78vw] uppercase tracking-[0.18em] font-semibold text-ink/50 mb-[0.5vh]">Usage add-ons</div>
          <div className="grid grid-cols-6 gap-[1vw]">
            {addons.map((a, i) => (
              <div key={i}>
                <div className="font-display font-semibold text-[0.88vw]">{a.price}</div>
                <div className="text-[0.75vw] text-ink/50">{a.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
