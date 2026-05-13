const base = import.meta.env.BASE_URL;

const offices = [
  { city: "Riyadh", country: "KSA", rev: "SAR 52M", target: 100, pct: 88, deals: 34, status: "amber", label: "+8% QoQ" },
  { city: "Dubai", country: "UAE", rev: "SAR 38M", target: 100, pct: 95, deals: 28, status: "green", label: "+14% QoQ" },
  { city: "Doha", country: "Qatar", rev: "SAR 14M", target: 100, pct: 72, deals: 12, status: "amber", label: "On track" },
  { city: "Kuwait City", country: "Kuwait", rev: "SAR 11M", target: 100, pct: 58, deals: 9, status: "red", label: "−3 reps gap" },
  { city: "Manama", country: "Bahrain", rev: "SAR 6M", target: 100, pct: 68, deals: 6, status: "amber", label: "New office" },
  { city: "Muscat", country: "Oman", rev: "SAR 8M", target: 100, pct: 104, deals: 7, status: "green", label: "+22% QoQ" },
];

const statusColor: Record<string, string> = {
  green: "bg-seafoam",
  amber: "bg-sand",
  red: "bg-rose",
};
const statusText: Record<string, string> = {
  green: "text-seafoam",
  amber: "text-[#b8860b]",
  red: "text-rose",
};

export default function RoleCEO() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-22 blur-[6vw] bg-lavender" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-18 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>22 · Role view — CEO</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[14vh] grid grid-cols-12 gap-[2.4vw]">
        <div className="col-span-4">
          <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-lavender">For the CEO</div>
          <h2 className="mt-[0.8vh] font-display font-extrabold text-[3.4vw] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]">
            Six GCC offices. One situation room.
          </h2>
          <p className="mt-[2vh] font-serif italic text-[1.35vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Live revenue vs target across every GCC office. Strategic initiative tracker. News signals affecting key accounts. And an AI that flags what needs your attention before your team does.
          </p>
          <div className="mt-[2.2vh] space-y-[1.1vh] text-[1vw] text-ink/80">
            <div className="flex gap-[0.8vw]"><span className="text-seafoam font-bold">→</span><span>ARR, pipeline coverage, and forecast confidence — by country, by segment.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-lavender font-bold">→</span><span>Bilingual executive narrative: what changed, why, what's at risk.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-rose font-bold">→</span><span>Slipped deals above threshold flagged before the board meeting.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-sand font-bold">→</span><span>News signals affecting named accounts — Vision 2030, oil price, regulatory.</span></div>
          </div>

          <div className="mt-[2.2vh] rounded-[0.8vw] bg-rose/5 border border-rose/20 px-[1vw] py-[0.9vh]">
            <div className="text-[0.72vw] uppercase tracking-[0.14em] font-semibold text-rose mb-[0.4vh]">CEO action required · this week</div>
            <div className="space-y-[0.5vh] text-[0.85vw] text-ink/75 leading-snug">
              <div className="flex gap-[0.5vw]"><span className="text-rose font-bold flex-shrink-0">!</span><span>Kuwait City: 3 open quota gaps → 2 enterprise deals at risk, SAR 6.4M.</span></div>
              <div className="flex gap-[0.5vw]"><span className="text-sand font-bold flex-shrink-0">!</span><span>Riyadh forecast confidence dropped 8pts — 4 deals pushed Q4.</span></div>
            </div>
          </div>
        </div>

        <div className="col-span-8">
          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw]">
            <div className="flex items-center justify-between text-[0.82vw] uppercase tracking-[0.2em] font-semibold text-ink/50 mb-[1.6vh]">
              <span>GCC Situation Room · Q3 · Live</span>
              <div className="flex items-center gap-[1.2vw] text-[0.75vw]">
                <span className="flex items-center gap-[0.4vw]"><span className="w-[0.7vw] h-[0.7vw] rounded-full bg-seafoam" />Exceeding</span>
                <span className="flex items-center gap-[0.4vw]"><span className="w-[0.7vw] h-[0.7vw] rounded-full bg-sand" />On track</span>
                <span className="flex items-center gap-[0.4vw]"><span className="w-[0.7vw] h-[0.7vw] rounded-full bg-rose" />At risk</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[1.2vw] mb-[1.8vh]">
              {offices.map(({ city, country, rev, pct, deals, status, label }) => (
                <div key={city} className="rounded-[1vw] bg-bg p-[1.1vw]">
                  <div className="flex items-center justify-between mb-[0.5vh]">
                    <div>
                      <div className="font-display font-bold text-[1.15vw] leading-tight">{city}</div>
                      <div className="text-[0.72vw] text-ink/50 uppercase tracking-[0.14em]">{country}</div>
                    </div>
                    <div className={`w-[0.9vw] h-[0.9vw] rounded-full ${statusColor[status]}`} />
                  </div>
                  <div className="font-display font-extrabold text-[1.6vw] leading-none mt-[0.4vh]">{rev}</div>
                  <div className={`text-[0.8vw] font-semibold mt-[0.2vh] ${statusText[status]}`}>{label}</div>
                  <div className="mt-[0.8vh] h-[0.6vh] rounded-full bg-ink/10 overflow-hidden">
                    <div
                      className={`h-full ${statusColor[status]} rounded-full`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="mt-[0.4vh] text-[0.72vw] text-ink/45">{deals} open deals · {pct}% of target</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-[1.2vw]">
              <div className="rounded-[0.9vw] bg-lavender/10 border border-lavender/20 p-[1vw]">
                <div className="text-[0.72vw] uppercase tracking-[0.14em] font-semibold text-lavender mb-[0.3vh]">Total ARR</div>
                <div className="font-display font-extrabold text-[2vw] leading-none">SAR 129M</div>
                <div className="text-[0.82vw] text-seafoam font-semibold mt-[0.3vh]">+11% QoQ</div>
              </div>
              <div className="rounded-[0.9vw] bg-ink/5 p-[1vw]">
                <div className="text-[0.72vw] uppercase tracking-[0.14em] font-semibold text-ink/50 mb-[0.3vh]">Forecast · Q3</div>
                <div className="font-display font-extrabold text-[2vw] leading-none">SAR 42M</div>
                <div className="text-[0.82vw] text-lavender font-semibold mt-[0.3vh]">79% confidence</div>
              </div>
              <div className="rounded-[0.9vw] bg-ink/5 p-[1vw]">
                <div className="text-[0.72vw] uppercase tracking-[0.14em] font-semibold text-ink/50 mb-[0.3vh]">Pipeline coverage</div>
                <div className="font-display font-extrabold text-[2vw] leading-none">3.2×</div>
                <div className="text-[0.82vw] text-sand font-semibold mt-[0.3vh]">Healthy · 2 offices below 2.5×</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
