const base = import.meta.env.BASE_URL;

export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[20vh] left-[-10vw] w-[60vw] h-[60vw] rounded-full opacity-35 blur-[6vw] bg-rose" />
        <div className="absolute bottom-[-10vh] right-[-5vw] w-[45vw] h-[45vw] rounded-full opacity-30 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>03 · The problem</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[16vh]">
        <h2 className="font-display font-extrabold text-[5vw] leading-[0.96] tracking-[-0.02em] max-w-[68vw] [text-wrap:balance]">
          The CRMs the Gulf uses today were never built for the Gulf.
        </h2>
        <p className="mt-[3vh] font-serif italic text-[1.8vw] leading-snug text-ink/75 max-w-[64vw] [text-wrap:pretty]">
          They translate the UI, but they don't translate the work — and revenue teams pay for that mismatch every day.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh] grid grid-cols-3 gap-[2vw]">
        <div className="rounded-[1.6vw] bg-white/70 border border-ink/10 p-[2vw]">
          <div className="font-display font-extrabold text-[3.4vw] leading-none text-rose">01</div>
          <div className="mt-[1.6vh] font-display font-bold text-[1.6vw] leading-tight">Built for Western workflows</div>
          <p className="mt-[1.4vh] text-[1.15vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Salesforce, HubSpot, and Pipedrive assume English-first pipelines, weekday rhythms, and direct outreach norms that don't fit GCC reality.
          </p>
        </div>
        <div className="rounded-[1.6vw] bg-white/70 border border-ink/10 p-[2vw]">
          <div className="font-display font-extrabold text-[3.4vw] leading-none text-sand">02</div>
          <div className="mt-[1.6vh] font-display font-bold text-[1.6vw] leading-tight">Arabic is an afterthought</div>
          <p className="mt-[1.4vh] text-[1.15vw] leading-snug text-ink/75 [text-wrap:pretty]">
            RTL is bolted on. Arabic search is brittle. Bilingual records, Hijri dates, and Gulf naming conventions are unsupported or ugly.
          </p>
        </div>
        <div className="rounded-[1.6vw] bg-white/70 border border-ink/10 p-[2vw]">
          <div className="font-display font-extrabold text-[3.4vw] leading-none text-seafoam">03</div>
          <div className="mt-[1.6vh] font-display font-bold text-[1.6vw] leading-tight">Sovereignty &amp; cost</div>
          <p className="mt-[1.4vh] text-[1.15vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Data leaves the region. Per-seat pricing is dollar-denominated and add-on heavy. Mid-market teams either overpay or quietly run on spreadsheets.
          </p>
        </div>
      </div>
    </div>
  );
}
