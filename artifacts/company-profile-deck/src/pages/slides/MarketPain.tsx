const base = import.meta.env.BASE_URL;

export default function MarketPain() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-rose" />
        <div className="absolute bottom-[-15vh] left-[5vw] w-[45vw] h-[45vw] rounded-full opacity-30 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>05 · Market pain points</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[14vh]">
        <h2 className="font-display font-extrabold text-[4.4vw] leading-[0.96] tracking-[-0.02em] max-w-[68vw] [text-wrap:balance]">
          What Gulf revenue teams actually struggle with — and how NexFlow answers it.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[33vh] bottom-[7vh]">
        <div className="grid grid-cols-12 gap-x-[2vw] py-[1.2vh] border-b border-ink/15 text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-ink/55">
          <div className="col-span-5">Pain point</div>
          <div className="col-span-7">NexFlow response</div>
        </div>
        <div className="grid grid-cols-12 gap-x-[2vw] py-[2.4vh] border-b border-ink/10 items-start">
          <div className="col-span-5 font-display font-bold text-[1.6vw] leading-tight">English-only pipelines &amp; broken Arabic search</div>
          <div className="col-span-7 text-[1.25vw] leading-snug text-ink/80 [text-wrap:pretty]">Bilingual record fields, normalized Arabic search with diacritic and dialect tolerance, and full RTL layouts at parity with LTR.</div>
        </div>
        <div className="grid grid-cols-12 gap-x-[2vw] py-[2.4vh] border-b border-ink/10 items-start">
          <div className="col-span-5 font-display font-bold text-[1.6vw] leading-tight">Manual data entry eats seller time</div>
          <div className="col-span-7 text-[1.25vw] leading-snug text-ink/80 [text-wrap:pretty]">AI capture from calls, WhatsApp, and email auto-creates contacts, deals, and next steps — sellers approve, they don't transcribe.</div>
        </div>
        <div className="grid grid-cols-12 gap-x-[2vw] py-[2.4vh] border-b border-ink/10 items-start">
          <div className="col-span-5 font-display font-bold text-[1.6vw] leading-tight">Forecasts that nobody trusts</div>
          <div className="col-span-7 text-[1.25vw] leading-snug text-ink/80 [text-wrap:pretty]">Per-deal AI win-rate, written rationale, and a leading indicator score — managers see why a number moved, not just that it did.</div>
        </div>
        <div className="grid grid-cols-12 gap-x-[2vw] py-[2.4vh] border-b border-ink/10 items-start">
          <div className="col-span-5 font-display font-bold text-[1.6vw] leading-tight">Per-seat pricing locks teams out</div>
          <div className="col-span-7 text-[1.25vw] leading-snug text-ink/80 [text-wrap:pretty]">SAR-anchored tiers, a real free plan, and bundled modules — full stack instead of seven add-ons.</div>
        </div>
        <div className="grid grid-cols-12 gap-x-[2vw] py-[2.4vh] items-start">
          <div className="col-span-5 font-display font-bold text-[1.6vw] leading-tight">Data leaving the region</div>
          <div className="col-span-7 text-[1.25vw] leading-snug text-ink/80 [text-wrap:pretty]">In-Kingdom data residency, regional compliance posture, and an architecture designed for sovereign deployment from day one.</div>
        </div>
      </div>
    </div>
  );
}
