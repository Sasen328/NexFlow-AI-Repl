const base = import.meta.env.BASE_URL;

export default function GccExclusive() {
  const items = [
    { color: "bg-rose", label: "Saudi Commercial Registry", desc: "Masaar engine pulls CR number, legal name, directors, license type in real-time. Mandatory in KSA enterprise sales. No global CRM knows this source exists." },
    { color: "bg-lavender", label: "Arabic AI Voice — 6 dialects", desc: "Layla (Gulf), Faisal (KSA), Noor (bilingual), Reem (Levantine), Omar (Egyptian), Adam (EN). Autonomous calls. Einstein Agentforce is English-only and a paid add-on." },
    { color: "bg-seafoam", label: "16-agent person research", desc: "Perplexity ×9, Gemini ×5, Claude ×1, GPT ×1 in parallel. Full intelligence dossier in 76–90 seconds. No CRM in the world ships this." },
    { color: "bg-sand", label: "GCC buying signals", desc: "Wamda, MoCI filings, Argaam, Reuters Arabic, PR Newswire. A completely different data universe from ZoomInfo, Clearbit, or Apollo." },
    { color: "bg-mist", label: "Cultural Intelligence Engine", desc: "Ramadan blackouts + pre-Ramadan GOLD window + Eid + National Days + Fri/Sat weekend. Per-country, per-event: optimal timing, messaging themes, contacts affected %" },
    { color: "bg-olive", label: "Post-call WhatsApp in 5 min", desc: "After no-answer, voicemail, or AI Agent handoff — AI drafts a context-aware Arabic/English WhatsApp and fires it automatically. Nobody does this." },
    { color: "bg-rose", label: "KSA PDPL call redaction", desc: "Auto-redacts Saudi IBAN (SA04...), Iqama numbers, credit cards, SSN from transcripts. No global CRM has these regex patterns." },
    { color: "bg-lavender", label: "GCC payment rails baked in", desc: "Tap, HyperPay, Mada (1% fee — lowest in market), PayTabs, Stripe. Multi-currency: SAR, AED, QAR, KWD, BHD, OMR. Quote-to-cash closes deals in region." },
    { color: "bg-seafoam", label: "Forgotten Leads + signal trigger", desc: "Resurfaces 90-day-silent contacts only when a real GCC buying signal fires — not just a timer. ICP score + signal score combined. No equivalent exists." },
    { color: "bg-sand", label: "CEO Situation Room", desc: "Multi-office dashboard (Dubai/Riyadh/Doha/Kuwait/Manama/Muscat). Revenue vs target per office, strategic initiatives, news signals affecting accounts, untaken action ledger." },
    { color: "bg-mist", label: "Business Card → enriched lead in 30s", desc: "5-agent pipeline: Gemini Vision OCR → Claude validation → Perplexity search → website scraper → GPT-4o-mini ICP scoring. Built for Saudi majlis meetings and GITEX booths." },
    { color: "bg-olive", label: "AI Playbooks per persona × country", desc: "Generated playbooks for CIO in Saudi Government vs CFO in UAE Banking vs CMO in Qatar Retail. Not generic templates — role × industry × country × deal size matrix." },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] right-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-25 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-10vh] left-[-8vw] w-[40vw] h-[40vw] rounded-full opacity-20 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>06 · GCC-exclusive layer</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em] max-w-[72vw] [text-wrap:balance]">
          12 capabilities no single competitor can match.
        </h2>
        <p className="mt-[1vh] font-serif italic text-[1.4vw] text-ink/65 max-w-[62vw]">
          Not roadmap items. Not integrations. Native, shipped, running in production today.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[4vh] grid grid-cols-4 grid-rows-3 gap-[1vw]">
        {items.map((item, i) => (
          <div key={i} className="rounded-[1vw] bg-white/70 border border-ink/8 p-[1.2vw] flex flex-col gap-[0.5vh]">
            <div className="flex items-center gap-[0.6vw]">
              <span className={`w-[0.9vw] h-[0.9vw] rounded-full ${item.color} flex-shrink-0`} />
              <span className="font-display font-bold text-[1.05vw] leading-tight">{item.label}</span>
            </div>
            <p className="text-[0.88vw] leading-snug text-ink/72 [text-wrap:pretty]">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
