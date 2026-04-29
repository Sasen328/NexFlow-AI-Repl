export default function ReturnsExit() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-20vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>12 · Returns & Exit</span>
        <span>Pre-seed economics</span>
      </div>

      <div className="absolute left-[6vw] top-[14vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[4.6vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[80vw]">
          Three exit scenarios. <span className="text-ink/65">~89x to ~200x MOIC</span> after realistic dilution.
        </h2>
        <p className="mt-[2vh] font-serif italic text-[1.45vw] leading-snug max-w-[68vw] text-ink/75 [text-wrap:pretty]">
          Reported MOIC range follows the feasibility study: $100K SAFE diluted ~10x through Series A/B/C to ~0.625% at exit. The undiluted cap-table figure (no dilution) is shown alongside for completeness.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[6vh]">
        <div className="bg-ink/8 rounded-[1.2vw] overflow-hidden">
          <div className="grid grid-cols-6 text-[0.85vw] tracking-[0.22em] uppercase font-bold text-ink/65 px-[1.5vw] py-[1.4vh] border-b border-ink/15">
            <div>Scenario</div>
            <div className="text-right">Y3 ARR</div>
            <div className="text-right">Multiple</div>
            <div className="text-right">Exit value</div>
            <div className="text-right">MOIC (diluted)</div>
            <div className="text-right">MOIC (undiluted)</div>
          </div>
          <div className="grid grid-cols-6 text-[1.05vw] px-[1.5vw] py-[1.5vh] border-b border-ink/10">
            <div className="font-semibold">Conservative — regional acquisition</div>
            <div className="text-right tabular-nums">$178M</div>
            <div className="text-right tabular-nums">8x</div>
            <div className="text-right tabular-nums">$1.43B</div>
            <div className="text-right tabular-nums font-bold text-seafoam">~89x</div>
            <div className="text-right tabular-nums text-ink/55">~891x</div>
          </div>
          <div className="grid grid-cols-6 text-[1.05vw] px-[1.5vw] py-[1.5vh] border-b border-ink/10">
            <div className="font-semibold">Base — strategic acquisition</div>
            <div className="text-right tabular-nums">$178M</div>
            <div className="text-right tabular-nums">12x</div>
            <div className="text-right tabular-nums">$2.14B</div>
            <div className="text-right tabular-nums font-bold text-seafoam">~134x</div>
            <div className="text-right tabular-nums text-ink/55">~1,337x</div>
          </div>
          <div className="grid grid-cols-6 text-[1.1vw] px-[1.5vw] py-[1.7vh] bg-lavender/25">
            <div className="font-bold">Upside — Tadawul IPO / global SaaS multiple</div>
            <div className="text-right tabular-nums font-bold">$178M</div>
            <div className="text-right tabular-nums font-bold">18x</div>
            <div className="text-right tabular-nums font-bold">$3.21B</div>
            <div className="text-right tabular-nums font-bold text-ink">~200x</div>
            <div className="text-right tabular-nums text-ink/55">~2,006x</div>
          </div>
        </div>
        <p className="mt-[1.2vh] text-[0.85vw] text-ink/60 italic">Diluted MOIC assumes pre-seed stake diluted ~10x through subsequent Series A/B/C rounds (industry-standard for a SaaS company growing from $4M ARR to $178M ARR). Undiluted figures come straight from the financial model's Valuation tab.</p>
      </div>
    </div>
  );
}
