export default function Financials() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-olive" />
        <div className="absolute bottom-[-20vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-seafoam" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>09 · Financials</span>
        <span>Three-year plan, fully reconciled to model</span>
      </div>

      <div className="absolute left-[6vw] top-[14vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[4.6vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[80vw]">
          From $4.3M ARR to $178M ARR in 36 months — at 80%+ gross margin.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh]">
        <div className="bg-ink/8 rounded-[1.2vw] overflow-hidden">
          <div className="grid grid-cols-4 text-[0.9vw] tracking-[0.22em] uppercase font-bold text-ink/65 px-[1.5vw] py-[1.4vh] border-b border-ink/15">
            <div>Metric</div>
            <div className="text-right">Year 1</div>
            <div className="text-right">Year 2</div>
            <div className="text-right">Year 3</div>
          </div>
          <div className="grid grid-cols-4 text-[1.15vw] px-[1.5vw] py-[1.4vh] border-b border-ink/10">
            <div className="font-semibold">Paying customers (year-end)</div>
            <div className="text-right tabular-nums">1,200</div>
            <div className="text-right tabular-nums">6,200</div>
            <div className="text-right tabular-nums">19,200</div>
          </div>
          <div className="grid grid-cols-4 text-[1.15vw] px-[1.5vw] py-[1.4vh] border-b border-ink/10">
            <div className="font-semibold">Paying seats (year-end)</div>
            <div className="text-right tabular-nums">6,000</div>
            <div className="text-right tabular-nums">43,400</div>
            <div className="text-right tabular-nums">192,000</div>
          </div>
          <div className="grid grid-cols-4 text-[1.15vw] px-[1.5vw] py-[1.4vh] border-b border-ink/10">
            <div className="font-semibold">Blended ARPU (per seat / mo)</div>
            <div className="text-right tabular-nums">$59.10</div>
            <div className="text-right tabular-nums">$69.75</div>
            <div className="text-right tabular-nums">$77.40</div>
          </div>
          <div className="grid grid-cols-4 text-[1.15vw] px-[1.5vw] py-[1.4vh] border-b border-ink/10">
            <div className="font-semibold">ARR (year-end)</div>
            <div className="text-right tabular-nums">$4.26M</div>
            <div className="text-right tabular-nums">$36.33M</div>
            <div className="text-right tabular-nums">$178.33M</div>
          </div>
          <div className="grid grid-cols-4 text-[1.15vw] px-[1.5vw] py-[1.4vh] border-b border-ink/10">
            <div className="font-semibold">Recognized revenue</div>
            <div className="text-right tabular-nums">$1.68M</div>
            <div className="text-right tabular-nums">$19.72M</div>
            <div className="text-right tabular-nums">$110.66M</div>
          </div>
          <div className="grid grid-cols-4 text-[1.15vw] px-[1.5vw] py-[1.4vh] border-b border-ink/10">
            <div className="font-semibold">Gross margin</div>
            <div className="text-right tabular-nums">77%</div>
            <div className="text-right tabular-nums">79%</div>
            <div className="text-right tabular-nums">81%</div>
          </div>
          <div className="grid grid-cols-4 text-[1.15vw] px-[1.5vw] py-[1.4vh] border-b border-ink/10">
            <div className="font-semibold">EBITDA</div>
            <div className="text-right tabular-nums">$1.23M</div>
            <div className="text-right tabular-nums">$15.42M</div>
            <div className="text-right tabular-nums">$89.23M</div>
          </div>
          <div className="grid grid-cols-4 text-[1.2vw] px-[1.5vw] py-[1.6vh] bg-lavender/25">
            <div className="font-bold">Net income</div>
            <div className="text-right tabular-nums font-bold">$0.98M</div>
            <div className="text-right tabular-nums font-bold">$12.34M</div>
            <div className="text-right tabular-nums font-bold">$71.38M</div>
          </div>
        </div>
        <p className="mt-[1.5vh] text-[0.95vw] text-ink/60 italic">All figures reconcile line-for-line with the NexFlow financial model (USD, fiscal calendar).</p>
      </div>
    </div>
  );
}
