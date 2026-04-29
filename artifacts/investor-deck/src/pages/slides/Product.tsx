const base = import.meta.env.BASE_URL;

export default function Product() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-olive" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>03 · Product</span>
        <span>One sentence, four pillars</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[5.2vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[80vw]">
          A bilingual, AI-native CRM that runs on Saudi soil.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="bg-ink text-bg rounded-[1.2vw] p-[1.8vw]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-lavender">Pillar 01</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.55vw] leading-tight">Bilingual AI Copilot</div>
          <p className="mt-[1vh] text-[1.05vw] leading-relaxed text-bg/80">Drafts, summaries, and call notes in Arabic and English — trained on regional sales language.</p>
        </div>
        <div className="bg-ink/8 rounded-[1.2vw] p-[1.8vw]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-seafoam">Pillar 02</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.55vw] leading-tight">WhatsApp-First Pipeline</div>
          <p className="mt-[1vh] text-[1.05vw] leading-relaxed text-ink/75">Conversations sync into the deal record automatically — no double entry, no lost context.</p>
        </div>
        <div className="bg-ink/8 rounded-[1.2vw] p-[1.8vw]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-sand">Pillar 03</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.55vw] leading-tight">Sovereign Hosting</div>
          <p className="mt-[1vh] text-[1.05vw] leading-relaxed text-ink/75">Deployed in KSA region with PDPL compliance and full data residency by default.</p>
        </div>
        <div className="bg-ink/8 rounded-[1.2vw] p-[1.8vw]">
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-rose">Pillar 04</div>
          <div className="mt-[1.2vh] font-display font-bold text-[1.55vw] leading-tight">Built for the Region</div>
          <p className="mt-[1vh] text-[1.05vw] leading-relaxed text-ink/75">Hijri calendar, prayer-time scheduling, ZATCA-aware quoting, and Gulf workflows out of the box.</p>
        </div>
      </div>

      <div className="absolute top-[6vh] right-[6vw] flex items-center gap-[1vw] opacity-0">
        <img src={`${base}logo_mark.svg`} alt="" className="w-[2vw] h-[2vw]" />
      </div>
    </div>
  );
}
