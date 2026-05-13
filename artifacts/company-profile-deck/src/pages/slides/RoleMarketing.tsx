const base = import.meta.env.BASE_URL;

const builderSteps = [
  { n: "01", label: "Define goal", detail: "Activate Vision 2030-aligned SMBs in KSA + UAE", color: "bg-lavender", textColor: "text-lavender" },
  { n: "02", label: "Audience", detail: "2,418 contacts · SMB · CRM decision-makers", color: "bg-seafoam", textColor: "text-seafoam" },
  { n: "03", label: "Cultural Intel ON", detail: "Khaleeji tone · Arabic-first copy · Sun–Wed 9–11 AM", color: "bg-sand", textColor: "text-[#b8860b]" },
  { n: "04", label: "AI generates", detail: "7 channel variants: LinkedIn, X, IG, FB, WhatsApp, Email, SMS", color: "bg-rose", textColor: "text-rose" },
  { n: "05", label: "Review + Edit", detail: "WhatsApp ✓ · Email edited · LinkedIn approved · IG ✓", color: "bg-lavender", textColor: "text-lavender" },
  { n: "06", label: "Publish + Track", detail: "Scheduled Sun 9AM · Attribution wired to pipeline live", color: "bg-seafoam", textColor: "text-seafoam" },
];

export default function RoleMarketing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[20vw] w-[55vw] h-[55vw] rounded-full opacity-22 blur-[6vw] bg-olive" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-18 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>25 · Role view — Marketing</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[14vh] grid grid-cols-12 gap-[2.4vw]">
        <div className="col-span-7">
          <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.8vw]">
            <div className="flex items-center justify-between text-[0.82vw] uppercase tracking-[0.2em] font-semibold text-ink/50 mb-[1.6vh]">
              <span>AI Campaign Builder · Reem Al-Qahtani · Head of Marketing</span>
              <span className="text-seafoam">6-step · ~4 minutes end to end</span>
            </div>

            <div className="space-y-[0.9vh]">
              {builderSteps.map(({ n, label, detail, color, textColor }, i) => (
                <div key={n} className="flex items-center gap-[1.2vw]">
                  <div className={`w-[2.2vw] h-[2.2vw] rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-[0.75vw]">{n}</span>
                  </div>
                  {i < builderSteps.length - 1 && (
                    <div className="absolute" style={{ display: "none" }} />
                  )}
                  <div className="flex-1 rounded-[0.7vw] bg-bg px-[1vw] py-[0.75vh] flex items-center justify-between gap-[1vw]">
                    <div className={`font-display font-bold text-[1vw] flex-shrink-0 ${textColor}`}>{label}</div>
                    <div className="text-[0.88vw] text-ink/65 leading-snug text-right">{detail}</div>
                  </div>
                  {i < builderSteps.length - 1 && (
                    <div className={`text-[0.8vw] font-bold ${textColor} flex-shrink-0`}>→</div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-[1.8vh] rounded-[0.9vw] bg-ink/5 border border-ink/10 p-[1.2vw]">
              <div className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/50 mb-[1vh]">Campaign performance · last 30 days · 3 active campaigns</div>
              <div className="grid grid-cols-3 gap-[1.2vw] mb-[1.2vh]">
                <div>
                  <div className="font-display font-extrabold text-[1.8vw] leading-none">2,418</div>
                  <div className="text-[0.8vw] text-seafoam font-semibold">MQLs · +18% MoM</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-[1.8vw] leading-none">SAR 9.4M</div>
                  <div className="text-[0.8vw] text-lavender font-semibold">Pipeline sourced · 62% attr.</div>
                </div>
                <div>
                  <div className="font-display font-extrabold text-[1.8vw] leading-none">7.2 mo</div>
                  <div className="text-[0.8vw] text-sand font-semibold">CAC payback · within target</div>
                </div>
              </div>
              <div className="space-y-[0.6vh]">
                {[
                  { name: "Vision 2030 SMB · WhatsApp + Email", rev: "SAR 3.1M", pct: 78, color: "bg-olive" },
                  { name: "Mid-market activation · Webinar series", rev: "SAR 2.4M", pct: 61, color: "bg-rose" },
                  { name: "Enterprise nurture · LinkedIn + Email", rev: "SAR 1.8M", pct: 47, color: "bg-lavender" },
                ].map(({ name, rev, pct, color }) => (
                  <div key={name}>
                    <div className="flex justify-between text-[0.85vw] font-semibold mb-[0.2vh]"><span>{name}</span><span>{rev}</span></div>
                    <div className="h-[0.6vh] rounded-full bg-ink/10 overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-5">
          <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-olive">For Marketing</div>
          <h2 className="mt-[0.8vh] font-display font-extrabold text-[3.4vw] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]">
            From brief to 7-channel campaign in 4 minutes.
          </h2>
          <p className="mt-[2vh] font-serif italic text-[1.35vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Describe the goal. AI builds the campaign — all 7 channels, Khaleeji tone, Arabic-first copy, and optimal GCC timing. Cultural Intelligence suppresses Ramadan blackouts automatically.
          </p>
          <div className="mt-[2.2vh] space-y-[1.1vh] text-[1vw] text-ink/80">
            <div className="flex gap-[0.8vw]"><span className="text-seafoam font-bold">→</span><span>7 per-channel variants generated: LinkedIn / X / IG / FB / WhatsApp / Email / SMS — each in the right tone.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-seafoam font-bold">→</span><span>Cultural Intelligence toggle: Khaleeji aesthetic, Arabic-first, Sun–Wed 9–11 AM optimal windows.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-olive font-bold">→</span><span>AI-generated campaign visual included. Per-output Refresh regenerates any single channel.</span></div>
            <div className="flex gap-[0.8vw]"><span className="text-olive font-bold">→</span><span>Attribution wired straight into pipeline — every SAR of spend ties back to closed revenue.</span></div>
          </div>

          <div className="mt-[2.2vh] rounded-[0.8vw] bg-ink/5 border border-ink/10 px-[1vw] py-[0.9vh]">
            <div className="text-[0.72vw] uppercase tracking-[0.14em] font-semibold text-ink/50 mb-[0.5vh]">What AI generates vs what human approves</div>
            <div className="grid grid-cols-2 gap-[0.6vw] text-[0.85vw]">
              <div className="rounded-[0.5vw] bg-seafoam/10 px-[0.7vw] py-[0.5vh]">
                <div className="font-semibold text-seafoam text-[0.75vw] uppercase tracking-[0.12em] mb-[0.2vh]">AI generates</div>
                <div className="text-ink/65 leading-snug">All 7 channel copies · key messages · campaign visual · schedule · audience segment</div>
              </div>
              <div className="rounded-[0.5vw] bg-rose/10 px-[0.7vw] py-[0.5vh]">
                <div className="font-semibold text-rose text-[0.75vw] uppercase tracking-[0.12em] mb-[0.2vh]">Human approves</div>
                <div className="text-ink/65 leading-snug">Brand tone check · final budget · one-click publish or per-channel edit</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
