export default function Traction() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>07 · Traction & milestones</span>
        <span>Year-1 plan, from MVP to ARR</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[5.4vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[78vw]">
          MVP shipped. 20 design-partner interviews. First paying seats inside Q+2.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="border-l-[0.4vh] border-seafoam pl-[1.4vw]">
          <div className="text-[0.8vw] tracking-[0.28em] uppercase font-bold text-seafoam">Now</div>
          <div className="mt-[1vh] font-display font-bold text-[1.5vw] leading-tight">MVP live</div>
          <p className="mt-[0.8vh] text-[1.05vw] leading-relaxed text-ink/70">Web + mobile, bilingual core, WhatsApp inbox, AI copilot v1 — all shipped pre-funding.</p>
        </div>
        <div className="border-l-[0.4vh] border-lavender pl-[1.4vw]">
          <div className="text-[0.8vw] tracking-[0.28em] uppercase font-bold text-lavender">Months 1–3</div>
          <div className="mt-[1vh] font-display font-bold text-[1.5vw] leading-tight">20 design-partner interviews</div>
          <p className="mt-[0.8vh] text-[1.05vw] leading-relaxed text-ink/70">Phase-1 plan from the feasibility study; weekly product feedback loop with GCC operators.</p>
        </div>
        <div className="border-l-[0.4vh] border-sand pl-[1.4vw]">
          <div className="text-[0.8vw] tracking-[0.28em] uppercase font-bold text-sand">Months 4–6</div>
          <div className="mt-[1vh] font-display font-bold text-[1.5vw] leading-tight">10 paid beta customers</div>
          <p className="mt-[0.8vh] text-[1.05vw] leading-relaxed text-ink/70">Phase-2 launch: Product Hunt + HN Show HN + LinkedIn MENA sponsored, per the marketing plan.</p>
        </div>
        <div className="border-l-[0.4vh] border-rose pl-[1.4vw]">
          <div className="text-[0.8vw] tracking-[0.28em] uppercase font-bold text-rose">Y1 exit</div>
          <div className="mt-[1vh] font-display font-bold text-[1.5vw] leading-tight">1,200 customers · $4.26M ARR</div>
          <p className="mt-[0.8vh] text-[1.05vw] leading-relaxed text-ink/70">Per the model: 150/250/350/450 quarterly cohorts at 5 seats avg, $59.10 blended ARPU.</p>
        </div>
      </div>
    </div>
  );
}
