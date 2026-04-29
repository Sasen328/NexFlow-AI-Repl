const base = import.meta.env.BASE_URL;

export default function Difference() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] left-[35vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-15vh] left-[-10vw] w-[45vw] h-[45vw] rounded-full opacity-30 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>04 · What we do differently</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[15vh]">
        <h2 className="font-display font-extrabold text-[5vw] leading-[0.96] tracking-[-0.02em] max-w-[72vw] [text-wrap:balance]">
          Four founding pillars.
        </h2>
        <p className="mt-[2vh] font-serif italic text-[1.7vw] leading-snug text-ink/75 max-w-[60vw] [text-wrap:pretty]">
          Every product decision in NexFlow comes back to these four ideas.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[7vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="rounded-[1.4vw] bg-white/70 border border-ink/10 p-[1.8vw]">
          <div className="w-[3.6vw] h-[3.6vw] rotate-45 bg-lavender rounded-[0.4vw]" />
          <div className="mt-[2vh] text-[0.9vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Pillar 01</div>
          <div className="mt-[0.6vh] font-display font-extrabold text-[1.7vw] leading-tight">GCC-native, not GCC-translated</div>
          <p className="mt-[1.4vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Arabic-first records, true RTL throughout, Hijri and Gregorian side by side, and Gulf naming &amp; address conventions modeled in the data layer.
          </p>
        </div>
        <div className="rounded-[1.4vw] bg-white/70 border border-ink/10 p-[1.8vw]">
          <div className="w-[3.6vw] h-[3.6vw] rotate-45 bg-seafoam rounded-[0.4vw]" />
          <div className="mt-[2vh] text-[0.9vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Pillar 02</div>
          <div className="mt-[0.6vh] font-display font-extrabold text-[1.7vw] leading-tight">AI-native by design</div>
          <p className="mt-[1.4vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            Every record carries a forecast, a next best action, and a written explanation — bilingual reasoning baked into the schema, not bolted on.
          </p>
        </div>
        <div className="rounded-[1.4vw] bg-white/70 border border-ink/10 p-[1.8vw]">
          <div className="w-[3.6vw] h-[3.6vw] rotate-45 bg-sand rounded-[0.4vw]" />
          <div className="mt-[2vh] text-[0.9vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Pillar 03</div>
          <div className="mt-[0.6vh] font-display font-extrabold text-[1.7vw] leading-tight">One platform, eight modules</div>
          <p className="mt-[1.4vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            CRM, marketing, calls, enrichment, and analytics live in one schema — no per-module licensing, no integration tax, no quiet data drift.
          </p>
        </div>
        <div className="rounded-[1.4vw] bg-white/70 border border-ink/10 p-[1.8vw]">
          <div className="w-[3.6vw] h-[3.6vw] rotate-45 bg-mist rounded-[0.4vw]" />
          <div className="mt-[2vh] text-[0.9vw] uppercase tracking-[0.22em] font-semibold text-ink/55">Pillar 04</div>
          <div className="mt-[0.6vh] font-display font-extrabold text-[1.7vw] leading-tight">Sovereign &amp; affordable</div>
          <p className="mt-[1.4vh] text-[1.05vw] leading-snug text-ink/75 [text-wrap:pretty]">
            In-Kingdom data residency, SAR-aware pricing, and packaging built around mid-market reality — not enterprise add-on stacks.
          </p>
        </div>
      </div>
    </div>
  );
}
