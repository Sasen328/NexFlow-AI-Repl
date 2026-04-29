const base = import.meta.env.BASE_URL;

export default function RoleSalesManager() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-25 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>10 · Role view — Sales Manager</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[15vh] grid grid-cols-12 gap-[2.4vw]">
        <div className="col-span-7">
          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw]">
            <div className="flex items-center justify-between text-[0.9vw] uppercase tracking-[0.22em] font-semibold text-ink/55">
              <span>Team — Riyadh Mid-Market</span>
              <span>This week</span>
            </div>

            <div className="mt-[2vh] grid grid-cols-3 gap-[1.4vw]">
              <div className="rounded-[1vw] bg-bg p-[1.2vw]">
                <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">Quota attainment</div>
                <div className="mt-[0.6vh] font-display font-extrabold text-[2.4vw] leading-none">71%</div>
                <div className="mt-[0.4vh] text-[0.95vw] text-seafoam font-semibold">+6pts vs last week</div>
              </div>
              <div className="rounded-[1vw] bg-bg p-[1.2vw]">
                <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">Avg deal cycle</div>
                <div className="mt-[0.6vh] font-display font-extrabold text-[2.4vw] leading-none">38 days</div>
                <div className="mt-[0.4vh] text-[0.95vw] text-lavender font-semibold">−4 vs last quarter</div>
              </div>
              <div className="rounded-[1vw] bg-bg p-[1.2vw]">
                <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">At-risk deals</div>
                <div className="mt-[0.6vh] font-display font-extrabold text-[2.4vw] leading-none">7</div>
                <div className="mt-[0.4vh] text-[0.95vw] text-rose font-semibold">SAR 4.2M exposure</div>
              </div>
            </div>

            <div className="mt-[2.2vh] rounded-[1vw] bg-bg p-[1.4vw]">
              <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">Rep-by-rep coaching signals</div>
              <div className="mt-[1.2vh] grid grid-cols-4 gap-[0.8vw] text-[1vw]">
                <div className="rounded-[0.6vw] bg-white p-[0.9vw]">
                  <div className="font-semibold">Faisal A.</div>
                  <div className="text-ink/65 text-[0.9vw]">Discovery talk-time low</div>
                  <div className="mt-[0.6vh] text-seafoam font-semibold text-[0.9vw]">Replay 3 calls</div>
                </div>
                <div className="rounded-[0.6vw] bg-white p-[0.9vw]">
                  <div className="font-semibold">Reem H.</div>
                  <div className="text-ink/65 text-[0.9vw]">3 deals stalled &gt;14d</div>
                  <div className="mt-[0.6vh] text-lavender font-semibold text-[0.9vw]">Suggest unblock</div>
                </div>
                <div className="rounded-[0.6vw] bg-white p-[0.9vw]">
                  <div className="font-semibold">Tariq M.</div>
                  <div className="text-ink/65 text-[0.9vw]">High win-rate, low volume</div>
                  <div className="mt-[0.6vh] text-sand font-semibold text-[0.9vw]">Lift quota</div>
                </div>
                <div className="rounded-[0.6vw] bg-white p-[0.9vw]">
                  <div className="font-semibold">Lina K.</div>
                  <div className="text-ink/65 text-[0.9vw]">Pricing pushback rising</div>
                  <div className="mt-[0.6vh] text-rose font-semibold text-[0.9vw]">Joint call</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-5">
          <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-seafoam">For the Sales Manager</div>
          <h2 className="mt-[1.2vh] font-display font-extrabold text-[4.2vw] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]">
            Coach the team, not the spreadsheet.
          </h2>
          <p className="mt-[3vh] font-serif italic text-[1.55vw] leading-snug text-ink/80 [text-wrap:pretty]">
            Pipeline coverage, capacity, and conversion in one view — with AI flagging which rep needs which conversation this week.
          </p>
          <ul className="mt-[3vh] space-y-[1.4vh] text-[1.15vw] text-ink/85">
            <li className="flex gap-[1vw]"><span className="text-lavender font-bold">→</span><span>Per-rep pipeline coverage and aging-stage exposure.</span></li>
            <li className="flex gap-[1vw]"><span className="text-lavender font-bold">→</span><span>AI-generated coaching cards: who, what to do, why now.</span></li>
            <li className="flex gap-[1vw]"><span className="text-lavender font-bold">→</span><span>Deal-level call replays with bilingual transcript search.</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
