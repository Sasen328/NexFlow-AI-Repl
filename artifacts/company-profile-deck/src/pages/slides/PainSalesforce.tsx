const base = import.meta.env.BASE_URL;

export default function PainSalesforce() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-rose" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[50vw] h-[50vw] rounded-full opacity-25 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>04 · Pain in Salesforce</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <div className="text-[1vw] tracking-[0.3em] uppercase font-semibold text-rose mb-[1vh]">The incumbent · ~$34.9B revenue (FY25)</div>
        <h2 className="font-display font-extrabold text-[3.2vw] leading-[1.02] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          Powerful — but priced, configured, and English-built for the wrong customer in the GCC.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[32vh] bottom-[6vh] grid grid-cols-2 gap-[1.4vw]">
        {[
          { p: "Cost & TCO explosion", d: "Sales Cloud Enterprise lists at ~$165/user/mo before Service, Marketing, CPQ, Einstein, and the obligatory consultancy bill. A 50-rep GCC team easily clears $500K/yr fully-loaded." , n: "NexFlow bundles CRM + calls + marketing + enrichment under one SAR price — no add-on tax, no per-feature SKU sprawl." },
          { p: "12–18 month implementations", d: "Standard Salesforce rollouts in the region take 3–6 months minimum and routinely stretch past a year, gated on certified consultants billing in USD.", n: "NexFlow ships pre-wired for GCC sales motions. Live in 14 days, not 14 months — with bilingual onboarding included." },
          { p: "Translated, not native, Arabic", d: "Right-to-left layouts break, Hijri calendars are missing, and Arabic name parsing (Al-, bin, ibn, double surnames) routinely misclassifies decision-makers.", n: "NexFlow is bilingual at the schema level: every field, AI prompt, and dashboard speaks Arabic and English natively, RTL by default." },
          { p: "AI is an upsell, not the system", d: "Einstein, Agentforce, and Data Cloud are separately priced add-ons that customers must wire up themselves on top of an existing Sales Cloud license.", n: "NexFlow's AI Workforce — voice agent, briefing, scoring, forecasting — is included in every plan. Not an add-on, the system itself." },
        ].map(({ p, d, n }) => (
          <div key={p} className="rounded-[1.2vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
            <div className="font-display font-extrabold text-[1.7vw] leading-tight text-rose">{p}</div>
            <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/80 [text-wrap:pretty]">{d}</p>
            <div className="mt-auto pt-[1.2vh] border-t border-ink/10 text-[1vw] leading-snug">
              <span className="font-bold text-seafoam">NexFlow → </span>
              <span className="text-ink/80">{n}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
