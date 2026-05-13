const base = import.meta.env.BASE_URL;

const reps = [
  { name: "Khalid A.", attain: 94, target: 100, deals: 8, signal: "Lifting quota — high win-rate, low volume", signalColor: "text-seafoam", barColor: "bg-seafoam" },
  { name: "Tariq M.", attain: 83, target: 100, deals: 6, signal: "On track — 3 deals in final stage", signalColor: "text-seafoam", barColor: "bg-seafoam" },
  { name: "Reem H.", attain: 71, target: 100, deals: 5, signal: "3 deals stalled >14d — suggest unblock conversation", signalColor: "text-[#b8860b]", barColor: "bg-sand" },
  { name: "Faisal A.", attain: 58, target: 100, deals: 7, signal: "Discovery talk-time low — replay 3 calls this week", signalColor: "text-[#b8860b]", barColor: "bg-sand" },
  { name: "Lina K.", attain: 34, target: 100, deals: 4, signal: "Pricing pushback rising — schedule joint call", signalColor: "text-rose", barColor: "bg-rose" },
];

export default function RoleSalesManager() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-22 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-18 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>23 · Role view — Sales Manager</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[14vh] grid grid-cols-12 gap-[2.4vw]">
        <div className="col-span-7">
          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw]">
            <div className="flex items-center justify-between text-[0.82vw] uppercase tracking-[0.2em] font-semibold text-ink/50 mb-[1.8vh]">
              <span>Team — Riyadh Mid-Market · This week</span>
              <span className="text-seafoam">AI coaching signals active</span>
            </div>

            <div className="grid grid-cols-3 gap-[1.2vw] mb-[2vh]">
              <div className="rounded-[0.9vw] bg-bg p-[1.1vw]">
                <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-ink/50">Quota attainment</div>
                <div className="mt-[0.4vh] font-display font-extrabold text-[2.2vw] leading-none">68%</div>
                <div className="mt-[0.3vh] text-[0.85vw] text-seafoam font-semibold">+9pts vs last week</div>
              </div>
              <div className="rounded-[0.9vw] bg-bg p-[1.1vw]">
                <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-ink/50">At-risk deals</div>
                <div className="mt-[0.4vh] font-display font-extrabold text-[2.2vw] leading-none">7</div>
                <div className="mt-[0.3vh] text-[0.85vw] text-rose font-semibold">SAR 4.2M exposure</div>
              </div>
              <div className="rounded-[0.9vw] bg-bg p-[1.1vw]">
                <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-ink/50">Avg deal cycle</div>
                <div className="mt-[0.4vh] font-display font-extrabold text-[2.2vw] leading-none">38d</div>
                <div className="mt-[0.3vh] text-[0.85vw] text-lavender font-semibold">−4d vs Q2</div>
              </div>
            </div>

            <div className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/45 mb-[1.2vh]">Rep attainment · AI coaching signal</div>
            <div className="space-y-[1.1vh]">
              {reps.map(({ name, attain, deals, signal, signalColor, barColor }) => (
                <div key={name} className="rounded-[0.8vw] bg-bg px-[1.1vw] py-[0.9vh]">
                  <div className="flex items-center gap-[1vw]">
                    <div className="w-[5vw] flex-shrink-0">
                      <div className="font-semibold text-[0.95vw]">{name}</div>
                      <div className="text-[0.78vw] text-ink/50">{deals} deals open</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-[0.3vh]">
                        <div className="text-[0.7vw] text-ink/45 uppercase tracking-[0.12em]">Attainment</div>
                        <div className={`text-[0.85vw] font-bold ${signalColor}`}>{attain}%</div>
                      </div>
                      <div className="h-[0.7vh] rounded-full bg-ink/10 overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${attain}%` }} />
                      </div>
                    </div>
                    <div className={`text-[0.78vw] max-w-[12vw] leading-snug ${signalColor} font-medium text-right flex-shrink-0`}>{signal}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-5">
          <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-seafoam">For the Sales Manager</div>
          <h2 className="mt-[0.8vh] font-display font-extrabold text-[3.4vw] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]">
            Coach the team, not the spreadsheet.
          </h2>
          <p className="mt-[2vh] font-serif italic text-[1.35vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Pipeline coverage, rep-by-rep signals, and at-risk deals in one view — with AI telling you who needs which conversation this week, and why.
          </p>
          <div className="mt-[2.4vh] space-y-[1.2vh] text-[1vw] text-ink/80">
            <div className="flex gap-[0.8vw]"><span className="text-lavender font-bold">→</span><span>Per-rep attainment bars with AI-generated coaching action per rep.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-lavender font-bold">→</span><span>Deal aging — which deals have been stuck in stage for 14+ days.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-lavender font-bold">→</span><span>Bilingual call replay with transcript search — prep for a coaching session in 4 minutes.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-lavender font-bold">→</span><span>Conversation intelligence: talk/listen ratio and objection frequency per rep.</span></div>
          </div>

          <div className="mt-[2.4vh] rounded-[0.8vw] bg-ink/5 border border-ink/10 px-[1vw] py-[0.9vh]">
            <div className="text-[0.75vw] uppercase tracking-[0.14em] font-semibold text-ink/50 mb-[0.5vh]">This week's AI-generated manager actions</div>
            <div className="space-y-[0.5vh] text-[0.88vw] text-ink/75">
              <div className="flex gap-[0.5vw]"><span className="text-rose font-bold flex-shrink-0">1.</span><span>Joint call with Lina K. on Riyad Bank — pricing objection pattern detected across 3 calls.</span></div>
              <div className="flex gap-[0.5vw]"><span className="text-sand font-bold flex-shrink-0">2.</span><span>Share Faisal A.'s last 3 discovery calls with team — talk-time benchmark below 32%.</span></div>
              <div className="flex gap-[0.5vw]"><span className="text-seafoam font-bold flex-shrink-0">3.</span><span>Review 7 at-risk deals above SAR 500K before Wednesday QBR.</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
