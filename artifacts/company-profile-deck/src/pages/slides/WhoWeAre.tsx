const base = import.meta.env.BASE_URL;

export default function WhoWeAre() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-40 blur-[6vw] bg-mist" />
        <div className="absolute bottom-[-20vh] left-[-15vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>02 · Who we are</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[18vh] grid grid-cols-12 gap-[2vw]">
        <div className="col-span-7">
          <h2 className="font-display font-extrabold text-[5.4vw] leading-[0.96] tracking-[-0.02em] [text-wrap:balance]">
            Built in the Gulf, for how the Gulf actually sells.
          </h2>
          <p className="mt-[4vh] font-serif italic text-[1.9vw] leading-snug text-ink/80 max-w-[42vw] [text-wrap:pretty]">
            NexFlow was founded by GCC operators who spent a decade running revenue teams on tools that were never designed for this region — and decided to build the alternative.
          </p>

          <div className="mt-[5vh] grid grid-cols-2 gap-x-[2vw] gap-y-[2.4vh] max-w-[44vw]">
            <div>
              <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Headquarters</div>
              <div className="text-[1.55vw] font-semibold mt-[0.4vh]">Riyadh, KSA</div>
            </div>
            <div>
              <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Founded</div>
              <div className="text-[1.55vw] font-semibold mt-[0.4vh]">2026</div>
            </div>
            <div>
              <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Aligned with</div>
              <div className="text-[1.55vw] font-semibold mt-[0.4vh]">Vision 2030 · NTP</div>
            </div>
            <div>
              <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Data residency</div>
              <div className="text-[1.55vw] font-semibold mt-[0.4vh]">In-Kingdom by default</div>
            </div>
          </div>
        </div>

        <div className="col-span-5 flex flex-col justify-center">
          <div className="rounded-[2vw] bg-white/55 backdrop-blur-sm border border-ink/10 p-[3vw]">
            <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-seafoam">Mandate</div>
            <p className="mt-[2vh] font-display font-bold text-[2.1vw] leading-tight tracking-tight [text-wrap:balance]">
              Give every Gulf revenue team a CRM that thinks in Arabic, plans in Hijri, and respects how relationships are actually built.
            </p>
            <div className="mt-[3vh] flex items-center gap-[1vw]">
              <span className="inline-block w-[1vw] h-[1vw] rounded-[0.25vw] bg-lavender" />
              <span className="inline-block w-[1vw] h-[1vw] rounded-[0.25vw] bg-rose" />
              <span className="inline-block w-[1vw] h-[1vw] rounded-[0.25vw] bg-seafoam" />
              <span className="inline-block w-[1vw] h-[1vw] rounded-[0.25vw] bg-sand" />
              <span className="inline-block w-[1vw] h-[1vw] rounded-[0.25vw] bg-mist" />
              <span className="inline-block w-[1vw] h-[1vw] rounded-[0.25vw] bg-olive" />
              <span className="ml-[1vw] text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Chameleon DNA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
