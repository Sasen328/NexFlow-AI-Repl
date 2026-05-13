const base = import.meta.env.BASE_URL;

export default function FeatureEnrichmentDeep() {
  const engines = [
    { name: "Masaar — Saudi CR", time: "~5s", agents: "1 engine", desc: "Real-time Saudi Commercial Registry: CR number, legal name, establishment date, license type, registered directors. Mandatory in KSA enterprise sales. No global CRM offers this." },
    { name: "Person Intel", time: "76–90s", agents: "16 agents", desc: "Perplexity ×9, Gemini ×5, Claude ×1, GPT-4o-mini ×1 in parallel. Full intelligence dossier per person — social, professional, signal, network. Synthesis via Gemini → Claude → GPT waterfall." },
    { name: "Company Intel", time: "~45s", agents: "Multi-agent", desc: "Deep company dive: funding, team, tech stack, buying signals, news, CR data, financials. Sourced from web crawls + GCC-specific databases." },
    { name: "Lead Finder", time: "~30s", agents: "10 agents", desc: "10 parallel agents + Cheerio/Playwright web crawls. Aggressive synthesis with 0-leads retry pass. Generates net-new leads from a target persona + market brief." },
  ];

  const tools = [
    { name: "Prospecting", desc: "Search by company OR person. 15 signal types: Contact, Profile, Company, Buying Signals, Social. Per-row Enrich + bulk Enrich-All." },
    { name: "GCC Buying Signals", desc: "Wamda, MoCI filings, Argaam, Reuters Arabic, PR Newswire, LinkedIn, X, custom RSS. Not Crunchbase. Not ZoomInfo." },
    { name: "Business Card Scanner", desc: "5-agent pipeline: Gemini Vision OCR → Claude validation → Perplexity search → website scraper → GPT-4o-mini ICP scoring. Photo → enriched lead in ~30s." },
    { name: "Bulk Enrichment", desc: "Upload list → auto-dedup → 5-question config wizard → queue for enrichment. Waterfall source picker." },
    { name: "Deduplication", desc: "Built-in, runs at upload stage. Fuzzy match on name, company, phone, email." },
    { name: "Search History", desc: "Full history of every Prospecting, Company, Person, List, and Card scan — re-run or delete." },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-25 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-10vh] right-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-22 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Engine 03 · Enrichment</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          Enrichment Engine — 4 AI pipelines. GCC-first data.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">Intelligence sources that don't exist in any Western enrichment tool — built for the GCC data landscape.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[26vh] bottom-[4vh]">
        <div className="grid grid-cols-4 gap-[1vw] mb-[1.2vh]">
          {engines.map((e, i) => (
            <div key={i} className="rounded-[1vw] bg-seafoam/15 border border-seafoam/30 p-[1.2vw] flex flex-col gap-[0.4vh]">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-[1.05vw] leading-tight">{e.name}</span>
                <span className="text-[0.78vw] bg-seafoam/30 rounded-full px-[0.6vw] py-[0.15vh] font-semibold text-seafoam">{e.time}</span>
              </div>
              <div className="text-[0.78vw] text-ink/50 font-semibold uppercase tracking-[0.12em]">{e.agents}</div>
              <p className="text-[0.88vw] leading-snug text-ink/72 [text-wrap:pretty]">{e.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-[1vw]">
          {tools.map((t, i) => (
            <div key={i} className="rounded-[1vw] bg-white/72 border border-ink/8 p-[1.2vw] flex flex-col gap-[0.4vh]">
              <div className="font-display font-bold text-[1.05vw] leading-tight">{t.name}</div>
              <p className="text-[0.88vw] leading-snug text-ink/72 [text-wrap:pretty]">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
