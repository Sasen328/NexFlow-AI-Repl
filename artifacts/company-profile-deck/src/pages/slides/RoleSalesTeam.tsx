const base = import.meta.env.BASE_URL;

export default function RoleSalesTeam() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-sand" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-25 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>11 · Role view — Sales Team</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[15vh] grid grid-cols-12 gap-[2.4vw]">
        <div className="col-span-5">
          <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-sand">For the Sales Team</div>
          <h2 className="mt-[1.2vh] font-display font-extrabold text-[4.2vw] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]">
            One screen for the whole day.
          </h2>
          <p className="mt-[3vh] font-serif italic text-[1.55vw] leading-snug text-ink/80 [text-wrap:pretty]">
            Sellers wake up to a prioritized list, not an empty pipeline view. Every action they need to take is already on the page — in the language they prefer.
          </p>
          <ul className="mt-[3vh] space-y-[1.4vh] text-[1.15vw] text-ink/85">
            <li className="flex gap-[1vw]"><span className="text-rose font-bold">→</span><span>AI-prioritized "today" list with a written reason for each item.</span></li>
            <li className="flex gap-[1vw]"><span className="text-rose font-bold">→</span><span>One click to call, log, or reply on WhatsApp — no app switching.</span></li>
            <li className="flex gap-[1vw]"><span className="text-rose font-bold">→</span><span>Auto-drafted bilingual follow-up emails after every meeting.</span></li>
          </ul>
        </div>

        <div className="col-span-7">
          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw]">
            <div className="flex items-center justify-between text-[0.9vw] uppercase tracking-[0.22em] font-semibold text-ink/55">
              <span>Today · 12 priorities</span>
              <span>AI-ranked</span>
            </div>

            <div className="mt-[2vh] space-y-[1.2vh]">
              <div className="rounded-[1vw] bg-bg p-[1.2vw] flex items-center gap-[1.2vw]">
                <div className="w-[3vw] h-[3vw] rotate-45 bg-rose rounded-[0.4vw] flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-display font-bold text-[1.35vw] leading-tight">Call Khalid — Aramco renewal at risk</div>
                  <div className="text-[1vw] text-ink/65 mt-[0.4vh]">No reply in 9 days · proposal expires Friday · win-rate dropped 18%.</div>
                </div>
                <div className="text-[0.9vw] uppercase tracking-[0.18em] font-semibold text-rose">Now</div>
              </div>
              <div className="rounded-[1vw] bg-bg p-[1.2vw] flex items-center gap-[1.2vw]">
                <div className="w-[3vw] h-[3vw] rotate-45 bg-lavender rounded-[0.4vw] flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-display font-bold text-[1.35vw] leading-tight">Send Stc proposal — discovery wrapped yesterday</div>
                  <div className="text-[1vw] text-ink/65 mt-[0.4vh]">Bilingual draft ready · pricing pre-approved · 3 stakeholders identified.</div>
                </div>
                <div className="text-[0.9vw] uppercase tracking-[0.18em] font-semibold text-lavender">10:30</div>
              </div>
              <div className="rounded-[1vw] bg-bg p-[1.2vw] flex items-center gap-[1.2vw]">
                <div className="w-[3vw] h-[3vw] rotate-45 bg-seafoam rounded-[0.4vw] flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-display font-bold text-[1.35vw] leading-tight">Reply on WhatsApp — Sara from Ma'aden</div>
                  <div className="text-[1vw] text-ink/65 mt-[0.4vh]">Asked about implementation timeline · suggested reply drafted in Arabic.</div>
                </div>
                <div className="text-[0.9vw] uppercase tracking-[0.18em] font-semibold text-seafoam">11:15</div>
              </div>
              <div className="rounded-[1vw] bg-bg p-[1.2vw] flex items-center gap-[1.2vw]">
                <div className="w-[3vw] h-[3vw] rotate-45 bg-sand rounded-[0.4vw] flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-display font-bold text-[1.35vw] leading-tight">Demo prep — Riyad Bank, 2 PM</div>
                  <div className="text-[1vw] text-ink/65 mt-[0.4vh]">Account brief, last 4 calls summarized, and stakeholder map ready in one tab.</div>
                </div>
                <div className="text-[0.9vw] uppercase tracking-[0.18em] font-semibold text-sand">13:30</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
