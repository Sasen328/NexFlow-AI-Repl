const base = import.meta.env.BASE_URL;

export default function RoleMarketing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[20vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-olive" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-25 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>12 · Role view — Marketing</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[15vh] grid grid-cols-12 gap-[2.4vw]">
        <div className="col-span-7">
          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw]">
            <div className="flex items-center justify-between text-[0.9vw] uppercase tracking-[0.22em] font-semibold text-ink/55">
              <span>Active campaigns</span>
              <span>Last 30 days</span>
            </div>

            <div className="mt-[2vh] grid grid-cols-3 gap-[1.4vw]">
              <div className="rounded-[1vw] bg-bg p-[1.2vw]">
                <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">MQLs</div>
                <div className="mt-[0.6vh] font-display font-extrabold text-[2.4vw] leading-none">2,418</div>
                <div className="mt-[0.4vh] text-[0.95vw] text-seafoam font-semibold">+18% MoM</div>
              </div>
              <div className="rounded-[1vw] bg-bg p-[1.2vw]">
                <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">Pipeline sourced</div>
                <div className="mt-[0.6vh] font-display font-extrabold text-[2.4vw] leading-none">SAR 9.4M</div>
                <div className="mt-[0.4vh] text-[0.95vw] text-lavender font-semibold">62% attributable</div>
              </div>
              <div className="rounded-[1vw] bg-bg p-[1.2vw]">
                <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">CAC payback</div>
                <div className="mt-[0.6vh] font-display font-extrabold text-[2.4vw] leading-none">7.2 mo</div>
                <div className="mt-[0.4vh] text-[0.95vw] text-sand font-semibold">Within target</div>
              </div>
            </div>

            <div className="mt-[2.2vh] rounded-[1vw] bg-bg p-[1.4vw]">
              <div className="text-[0.85vw] uppercase tracking-[0.18em] font-semibold text-ink/55">Top journeys</div>
              <div className="mt-[1.4vh] space-y-[1.2vh]">
                <div>
                  <div className="flex justify-between text-[1vw] font-semibold"><span>Vision 2030 SMB · WhatsApp + Email</span><span>SAR 3.1M</span></div>
                  <div className="mt-[0.5vh] h-[0.8vh] rounded-full bg-ink/10 overflow-hidden"><div className="h-full bg-olive" style={{ width: "78%" }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[1vw] font-semibold"><span>Mid-market activation · Webinar series</span><span>SAR 2.4M</span></div>
                  <div className="mt-[0.5vh] h-[0.8vh] rounded-full bg-ink/10 overflow-hidden"><div className="h-full bg-rose" style={{ width: "61%" }} /></div>
                </div>
                <div>
                  <div className="flex justify-between text-[1vw] font-semibold"><span>Enterprise nurture · LinkedIn + Email</span><span>SAR 1.8M</span></div>
                  <div className="mt-[0.5vh] h-[0.8vh] rounded-full bg-ink/10 overflow-hidden"><div className="h-full bg-lavender" style={{ width: "47%" }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-5">
          <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-olive">For Marketing</div>
          <h2 className="mt-[1.2vh] font-display font-extrabold text-[4.2vw] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]">
            Campaigns that pay back, segment by segment.
          </h2>
          <p className="mt-[3vh] font-serif italic text-[1.55vw] leading-snug text-ink/80 [text-wrap:pretty]">
            Bilingual journeys across email, WhatsApp, and SMS — with attribution wired straight into the pipeline so every spend ties back to closed revenue.
          </p>
          <ul className="mt-[3vh] space-y-[1.4vh] text-[1.15vw] text-ink/85">
            <li className="flex gap-[1vw]"><span className="text-seafoam font-bold">→</span><span>Audience segments built off live CRM data — no nightly export.</span></li>
            <li className="flex gap-[1vw]"><span className="text-seafoam font-bold">→</span><span>Multi-touch attribution down to SAR per closed deal.</span></li>
            <li className="flex gap-[1vw]"><span className="text-seafoam font-bold">→</span><span>AI content drafting in Arabic and English, brand-tone-aware.</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
