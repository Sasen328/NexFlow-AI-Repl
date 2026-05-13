const base = import.meta.env.BASE_URL;

const timeline = [
  {
    time: "7:30 AM",
    color: "bg-lavender",
    textColor: "text-lavender",
    title: "AI Daily Brief arrives",
    detail: "3 hot leads flagged. Voice Agent qualified 4 prospects overnight. Khalid / Aramco renewal now URGENT — proposal expires Friday.",
    auto: true,
  },
  {
    time: "9:00 AM",
    color: "bg-rose",
    textColor: "text-rose",
    title: "Power Dialer: pre-call brief for Khalid",
    detail: "Score 82 · Buying-Now intent. Talking points: 3 pain signals detected, last 4 call topics summarised, stakeholder map loaded.",
    auto: true,
  },
  {
    time: "9:08 AM",
    color: "bg-sand",
    textColor: "text-[#b8860b]",
    title: "LiveCoachPanel fires mid-call",
    detail: '"Budget objection detected." Suggested response appears instantly. Competitor mention (Salesforce) triggers a counter-argument card.',
    auto: true,
  },
  {
    time: "9:22 AM",
    color: "bg-seafoam",
    textColor: "text-seafoam",
    title: "1-click post-call panel",
    detail: "Call note logged + follow-up task + 3-day reminder + Arabic WhatsApp draft sent — all in one tap before moving to the next call.",
    auto: true,
  },
  {
    time: "11:30 AM",
    color: "bg-lavender",
    textColor: "text-lavender",
    title: "Business card scan at GITEX booth",
    detail: "Card photo → 5-agent AI pipeline → fully enriched, ICP-scored lead in 30 seconds. No manual entry.",
    auto: true,
  },
  {
    time: "2:00 PM",
    color: "bg-rose",
    textColor: "text-rose",
    title: "Forgotten lead resurfaces",
    detail: "Ma'aden Metals — 94 days silent. Just raised SAR 75M Series B (Wamda signal). AI adds to Power Dialer queue automatically.",
    auto: true,
  },
  {
    time: "4:30 PM",
    color: "bg-seafoam",
    textColor: "text-seafoam",
    title: "Quote sent with Tap payment link",
    detail: "SAR-priced proposal generated, Tap payment link embedded. Customer pays online → deal auto-closes in pipeline.",
    auto: false,
  },
];

export default function RoleSalesTeam() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-25 blur-[6vw] bg-sand" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-20 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>24 · Role view — Sales Rep</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[14vh] grid grid-cols-12 gap-[2.4vw]">
        <div className="col-span-4">
          <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-sand">For the Sales Rep</div>
          <h2 className="mt-[1vh] font-display font-extrabold text-[3.6vw] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]">
            One screen for the whole day.
          </h2>
          <p className="mt-[2vh] font-serif italic text-[1.35vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Wake up to a ranked priority list. Every action is already prepared — pre-call brief, mid-call coaching, post-call WhatsApp, forgotten lead alerts — without opening a second tab.
          </p>
          <div className="mt-[2.4vh] space-y-[1.2vh] text-[1vw] text-ink/80">
            <div className="flex gap-[0.8vw]"><span className="text-rose font-bold">→</span><span>Voice Agent qualified 4 leads <em>while you slept</em>.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-seafoam font-bold">→</span><span>Post-call WhatsApp fires automatically in Arabic within 5 minutes.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-lavender font-bold">→</span><span>Business card → enriched lead in 30 seconds at any event.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-sand font-bold">→</span><span>Forgotten leads resurface only when a real buying signal fires.</span></div>
          </div>

          <div className="mt-[2.4vh] rounded-[0.8vw] bg-ink/5 border border-ink/10 px-[1vw] py-[0.9vh]">
            <div className="text-[0.75vw] uppercase tracking-[0.14em] font-semibold text-ink/50 mb-[0.4vh]">Today's AI impact</div>
            <div className="grid grid-cols-2 gap-[0.8vw] text-[0.9vw]">
              <div><span className="font-bold text-seafoam text-[1.2vw]">4</span> <span className="text-ink/65">leads qualified overnight</span></div>
              <div><span className="font-bold text-rose text-[1.2vw]">7</span> <span className="text-ink/65">WhatsApps auto-sent</span></div>
              <div><span className="font-bold text-lavender text-[1.2vw]">2</span> <span className="text-ink/65">cards enriched</span></div>
              <div><span className="font-bold text-sand text-[1.2vw]">1</span> <span className="text-ink/65">forgotten lead resurfaced</span></div>
            </div>
          </div>
        </div>

        <div className="col-span-8">
          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] h-full">
            <div className="flex items-center justify-between text-[0.82vw] uppercase tracking-[0.2em] font-semibold text-ink/50 mb-[1.6vh]">
              <span>Khalid Al-Otaibi · Senior Sales Executive · Today</span>
              <div className="flex items-center gap-[0.6vw]">
                <span className="w-[0.6vw] h-[0.6vw] rounded-full bg-seafoam" />
                <span className="text-seafoam">NexFlow handled 73% automatically</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[3.4vw] top-0 bottom-0 w-[0.12vw] bg-ink/10" />
              <div className="space-y-[1.1vh]">
                {timeline.map(({ time, color, textColor, title, detail, auto }) => (
                  <div key={time} className="flex gap-[1.2vw] items-start">
                    <div className="w-[2.6vw] text-right flex-shrink-0">
                      <span className={`text-[0.78vw] font-semibold ${textColor}`}>{time}</span>
                    </div>
                    <div className={`w-[1.6vw] h-[1.6vw] rounded-full ${color} flex-shrink-0 flex items-center justify-center z-10 relative`}>
                      {auto && <span className="text-white text-[0.55vw] font-bold">AI</span>}
                    </div>
                    <div className="flex-1 rounded-[0.6vw] bg-bg px-[0.9vw] py-[0.7vh]">
                      <div className="flex items-center justify-between gap-[0.6vw]">
                        <div className="font-display font-bold text-[0.95vw] leading-tight">{title}</div>
                        {auto && (
                          <span className="text-[0.62vw] uppercase tracking-[0.14em] font-semibold text-seafoam bg-seafoam/10 rounded-full px-[0.5vw] py-[0.2vh] flex-shrink-0">Auto</span>
                        )}
                      </div>
                      <div className="text-[0.82vw] text-ink/65 mt-[0.2vh] leading-snug">{detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
