const base = import.meta.env.BASE_URL;

const COMPETITORS: { name: string; rev: number; label: string; tag: string; color: string }[] = [
  { name: "Salesforce",   rev: 34900, label: "$34.9B",  tag: "FY25 · NYSE: CRM", color: "#5DA0E5" },
  { name: "Microsoft Dynamics 365", rev: 6500, label: "$6.5B+", tag: "Dynamics 365 sales/service est.", color: "#7CC0BB" },
  { name: "HubSpot",      rev: 2630,  label: "$2.63B",  tag: "FY24 · NYSE: HUBS", color: "#E08A6B" },
  { name: "Zoho (private)", rev: 1300, label: "$1.3B",  tag: "FY24 disclosed", color: "#C9A55C" },
  { name: "Freshworks",   rev: 720,   label: "$720M",   tag: "FY24 · NASDAQ: FRSH", color: "#B89AC8" },
  { name: "Pipedrive",    rev: 169,   label: "$169M",   tag: "FY23 (Vista PE)", color: "#9CB890" },
  { name: "Insightly / Nimble / etc.", rev: 90, label: "$50–90M", tag: "Long-tail SMB CRMs", color: "#C8A4B8" },
];

const MAX = 35000;

export default function CompetitorRevenue() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[50vw] h-[50vw] rounded-full opacity-25 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>10 · Competitor revenue · 2024–2025</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <h2 className="font-display font-extrabold text-[3vw] leading-[1.04] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          A $46B addressable wallet sits with seven incumbents — and zero are GCC-native.
        </h2>
        <p className="mt-[1vh] font-serif italic text-[1.1vw] leading-snug text-ink/75 max-w-[60vw] [text-wrap:pretty]">
          Public filings &amp; analyst disclosures, indexed to USD millions per most recent reported fiscal year.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[55vw] top-[30vh] bottom-[8vh] flex flex-col gap-[1.4vh]">
        {COMPETITORS.map(({ name, rev, label, tag, color }) => {
          const widthPct = Math.max((rev / MAX) * 100, 1.5);
          return (
            <div key={name} className="flex items-center gap-[1vw]">
              <div className="w-[14vw] flex-shrink-0 text-right">
                <div className="font-bold text-[0.95vw] leading-tight">{name}</div>
                <div className="text-[0.7vw] uppercase tracking-[0.16em] text-ink/55">{tag}</div>
              </div>
              <div className="flex-1 h-[3.2vh] rounded-[0.4vw] bg-white/60 border border-ink/10 overflow-hidden relative">
                <div className="h-full rounded-[0.4vw]" style={{ width: `${widthPct}%`, background: color }} />
                <div className="absolute right-[0.6vw] top-1/2 -translate-y-1/2 font-display font-extrabold text-[1.1vw] text-ink/85">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute right-[6vw] top-[32vh] bottom-[8vh] w-[44vw] rounded-[1.4vw] bg-ink text-bg p-[2vw] flex flex-col">
        <div className="text-[0.85vw] uppercase tracking-[0.22em] font-bold text-bg/55">Where NexFlow stands today</div>
        <div className="mt-[1.5vh] font-display font-extrabold text-[3.2vw] leading-[0.96] [text-wrap:balance]">
          A founding-team product. Pre-revenue. Unfair starting position.
        </div>
        <div className="mt-[2vh] grid grid-cols-2 gap-[1.4vw] text-[0.95vw] leading-snug">
          {[
            { k: "Local incorporation", v: "KSA-resident entity, in-Kingdom data residency from day one." },
            { k: "Bilingual schema", v: "Arabic + English at the data-model level — not a translation layer." },
            { k: "AI Workforce included", v: "Voice agent, briefing, scoring, forecasting bundled in every plan." },
            { k: "SAR-priced & local-billed", v: "Mid-market plans aligned to GCC budgets, not USD list prices." },
          ].map(({ k, v }) => (
            <div key={k}>
              <div className="font-bold text-bg uppercase tracking-[0.16em] text-[0.78vw]">{k}</div>
              <div className="mt-[0.3vh] text-bg/75 [text-wrap:pretty]">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-[1.4vh] border-t border-bg/20 text-[0.85vw] text-bg/55 italic">
          We don't need to displace Salesforce globally. Capturing 1% of GCC SAM = $21M ARR — well inside Y5 reach.
        </div>
      </div>

      <div className="absolute bottom-[2vh] left-[6vw] right-[6vw] text-[0.78vw] text-ink/55 italic">
        Sources: Salesforce 10-K FY25; HubSpot 10-K FY24; Freshworks 10-K FY24; Zoho self-reported 2024; Pipedrive Vista disclosures 2023; Microsoft segment estimates from BoA &amp; Wedbush 2024.
      </div>
    </div>
  );
}
