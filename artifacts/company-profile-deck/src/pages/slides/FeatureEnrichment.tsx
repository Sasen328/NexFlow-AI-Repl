const base = import.meta.env.BASE_URL;

export default function FeatureEnrichment() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-olive" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>19 · Feature deep-dive · Enrichment</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <div className="text-[0.95vw] tracking-[0.3em] uppercase font-semibold text-olive mb-[0.8vh]">Module 04 · Enrichment</div>
        <h2 className="font-display font-extrabold text-[2.6vw] leading-[1.06] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          A Clay-style waterfall — but pre-wired for GCC data sources, not US LinkedIn-only ones.
        </h2>
      </div>

      <div className="absolute right-[6vw] top-[30vh] bottom-[36vh] w-[52vw]">
        <div className="rounded-[1vw] overflow-hidden border border-ink/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] bg-white">
          <img src={`${base}screenshots/enrichment.jpg`} crossOrigin="anonymous" alt="NexFlow Sourcing & Enrichment screen" className="w-full h-auto block" />
        </div>
        <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.2em] text-ink/55 italic">
          Live screenshot · Bulk Enrichment / Discover Prospects
        </div>
      </div>

      <div className="absolute left-[6vw] top-[26vh] bottom-[36vh] w-[35vw] flex flex-col gap-[1.2vh]">
        {[
          { t: "Filter by GCC reality", d: "Region, industry, seniority, headcount, intent — but the source set is LinkedIn + Lusha + Apollo + Crunchbase + Wamda + local registries (Saudi MoCI, UAE chamber data)." },
          { t: "Match-score with provenance", d: "Each prospect shows a match % and the providers that contributed (\"via Lusha + Crunchbase\") so users can audit data origin — required under PDPL." },
          { t: "Single-shot Quick Enrich", d: "Paste a domain or LinkedIn URL → AI fans out across providers, picks the best record per field, returns a unified person + company profile in <8 seconds." },
          { t: "Buying Signals layer", d: "Continuous polling on funding, hiring, news, exec moves, RFP postings (Etimad, ADGM) — auto-creates tasks against matched accounts." },
          { t: "Card Scanner", d: "Scan a paper business card from a Riyadh event — OCR + AI extracts and dedupes into the contact graph in 4 seconds." },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-[0.7vw] bg-white/80 border border-ink/10 p-[0.9vw]">
            <div className="font-bold text-[0.95vw] text-olive">{t}</div>
            <p className="mt-[0.3vh] text-[0.8vw] leading-snug text-ink/75 [text-wrap:pretty]">{d}</p>
          </div>
        ))}
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[6vh] h-[26vh] rounded-[1vw] bg-ink text-bg p-[1.4vw]">
        <div className="text-[0.85vw] uppercase tracking-[0.22em] font-bold text-bg/55 mb-[1.2vh]">The waterfall · how a single email lookup actually runs</div>
        <div className="grid grid-cols-5 gap-[0.8vw] h-[16vh]">
          {[
            { n: "1", t: "Lusha", d: "GCC mobile + work email coverage best-in-class for KSA/UAE." },
            { n: "2", t: "Apollo", d: "Fallback for verified work emails + intent score." },
            { n: "3", t: "Hunter", d: "Pattern-match domain emails when direct match fails." },
            { n: "4", t: "Crunchbase", d: "Company size, funding, exec moves layered on." },
            { n: "5", t: "AI synth", d: "LLM merges provider rows, picks best-confidence per field, writes provenance." },
          ].map(({ n, t, d }) => (
            <div key={n} className="flex flex-col p-[0.8vw] rounded-[0.4vw] bg-bg/10 border border-bg/15">
              <div className="text-[0.75vw] uppercase tracking-[0.18em] font-bold text-seafoam">Step {n}</div>
              <div className="mt-[0.5vh] font-bold text-[1.05vw]">{t}</div>
              <div className="mt-[0.4vh] text-[0.78vw] text-bg/70 leading-snug [text-wrap:pretty]">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
