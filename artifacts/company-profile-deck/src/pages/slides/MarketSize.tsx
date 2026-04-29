const base = import.meta.env.BASE_URL;

export default function MarketSize() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>09 · Market size & opportunity</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <h2 className="font-display font-extrabold text-[3.4vw] leading-[1.02] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          A $97B global category. A $2.1B GCC SAM. Almost zero local-built supply.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[20vh] grid grid-cols-3 gap-[1.6vw]">
        {[
          { tag: "TAM", val: "$96.7B", year: "Global CRM software, 2025", note: "Gartner sizes the worldwide CRM software market at ~$96.7B in 2025, growing 13.6% YoY. Sales-cloud sub-segment alone is ~$36B.", color: "bg-lavender" },
          { tag: "SAM", val: "$2.10B", year: "GCC + wider MENA, 2025", note: "MENA CRM software is sized at ~$2.1B in 2025 (IMARC, Mordor) with the GCC accounting for >70% of regional spend, growing ~17% YoY.", color: "bg-seafoam" },
          { tag: "SOM", val: "$210M", year: "5-yr realistic capture", note: "We target ~10% of the GCC SAM by Y5 — concentrated in Saudi Arabia, UAE, Bahrain, Kuwait, Qatar mid-market & enterprise." , color: "bg-sand" },
        ].map(({ tag, val, year, note, color }) => (
          <div key={tag} className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw] flex flex-col">
            <div className="flex items-center gap-[0.8vw]">
              <span className={`w-[1.6vw] h-[1.6vw] rotate-45 ${color} rounded-[0.25vw]`} />
              <span className="text-[0.9vw] uppercase tracking-[0.22em] font-bold text-ink/60">{tag}</span>
            </div>
            <div className="mt-[1.5vh] font-display font-extrabold text-[5vw] leading-none">{val}</div>
            <div className="mt-[0.6vh] text-[0.95vw] font-semibold text-ink/65">{year}</div>
            <p className="mt-[1.5vh] text-[1vw] leading-snug text-ink/80 [text-wrap:pretty]">{note}</p>
          </div>
        ))}
      </div>

      <div className="absolute bottom-[5vh] left-[6vw] right-[6vw] grid grid-cols-4 gap-[1.4vw]">
        {[
          { k: "KSA Vision 2030", v: "$1.3T non-oil GDP target by 2030 — every PIF-portfolio company is digitizing customer ops." },
          { k: "B2B SaaS adoption", v: "GCC SaaS market growing ~20% CAGR — fastest globally outside SE Asia." },
          { k: "PDPL & data residency", v: "Saudi PDPL (Sept 2024) plus UAE PDPL push regulated industries to in-Kingdom CRM." },
          { k: "Local-build mandate", v: "PIF, Aramco, Etisalat all requiring KSA-incorporated software vendors for new procurement." },
        ].map(({ k, v }) => (
          <div key={k} className="text-[0.85vw] leading-snug">
            <div className="font-bold text-ink uppercase tracking-[0.18em] text-[0.78vw] mb-[0.4vh]">{k}</div>
            <div className="text-ink/70 [text-wrap:pretty]">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
