const base = import.meta.env.BASE_URL;

export default function RoleCEO() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-25 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>09 · Role view — CEO</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[15vh] grid grid-cols-12 gap-[2.4vw]">
        <div className="col-span-5">
          <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-lavender">For the CEO</div>
          <h2 className="mt-[1.2vh] font-display font-extrabold text-[4.2vw] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]">
            Revenue health on one screen.
          </h2>
          <p className="mt-[3vh] font-serif italic text-[1.6vw] leading-snug text-ink/80 [text-wrap:pretty]">
            Stop asking your team to "pull the numbers." NexFlow assembles them, explains the deltas in plain language, and flags what needs your attention this week.
          </p>
          <ul className="mt-[3.4vh] space-y-[1.4vh] text-[1.2vw] text-ink/85">
            <li className="flex gap-[1vw]"><span className="text-seafoam font-bold">→</span><span>Live ARR, pipeline coverage, and forecast confidence by segment.</span></li>
            <li className="flex gap-[1vw]"><span className="text-seafoam font-bold">→</span><span>Bilingual narrative summaries — what changed, why, and what's at risk.</span></li>
            <li className="flex gap-[1vw]"><span className="text-seafoam font-bold">→</span><span>Alerts on slipped deals above a threshold, sent before the QBR — not after.</span></li>
          </ul>
        </div>

        <div className="col-span-7">
          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw]">
            <div className="flex items-center justify-between text-[0.9vw] uppercase tracking-[0.22em] font-semibold text-ink/55">
              <span>Executive overview · Q3</span>
              <span>Live</span>
            </div>
            <div className="mt-[2vh] grid grid-cols-3 gap-[1.4vw]">
              <div className="rounded-[1vw] bg-bg p-[1.2vw]">
                <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">ARR</div>
                <div className="mt-[0.8vh] font-display font-extrabold text-[2.6vw] leading-none">SAR 142M</div>
                <div className="mt-[0.6vh] text-[0.95vw] text-seafoam font-semibold">+8.4% QoQ</div>
              </div>
              <div className="rounded-[1vw] bg-bg p-[1.2vw]">
                <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">Forecast</div>
                <div className="mt-[0.8vh] font-display font-extrabold text-[2.6vw] leading-none">SAR 38M</div>
                <div className="mt-[0.6vh] text-[0.95vw] text-lavender font-semibold">82% confidence</div>
              </div>
              <div className="rounded-[1vw] bg-bg p-[1.2vw]">
                <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">Coverage</div>
                <div className="mt-[0.8vh] font-display font-extrabold text-[2.6vw] leading-none">3.4×</div>
                <div className="mt-[0.6vh] text-[0.95vw] text-sand font-semibold">Healthy</div>
              </div>
            </div>

            <div className="mt-[2.4vh] rounded-[1vw] bg-bg p-[1.4vw]">
              <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">Pipeline by segment</div>
              <div className="mt-[1.4vh] space-y-[1.2vh]">
                <div>
                  <div className="flex justify-between text-[1vw] font-semibold"><span>Enterprise · Riyadh</span><span>SAR 18M</span></div>
                  <div className="mt-[0.6vh] h-[0.9vh] rounded-full bg-ink/10 overflow-hidden"><div className="h-full bg-lavender" style={{ width: "82%" }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[1vw] font-semibold"><span>Mid-market · Eastern</span><span>SAR 11M</span></div>
                  <div className="mt-[0.6vh] h-[0.9vh] rounded-full bg-ink/10 overflow-hidden"><div className="h-full bg-seafoam" style={{ width: "62%" }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[1vw] font-semibold"><span>SMB · GCC-wide</span><span>SAR 9M</span></div>
                  <div className="mt-[0.6vh] h-[0.9vh] rounded-full bg-ink/10 overflow-hidden"><div className="h-full bg-sand" style={{ width: "48%" }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
