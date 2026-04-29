const base = import.meta.env.BASE_URL;

export default function PainHubSpot() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-sand" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[50vw] h-[50vw] rounded-full opacity-25 blur-[6vw] bg-seafoam" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>05 · Pain in HubSpot</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <div className="text-[1vw] tracking-[0.3em] uppercase font-semibold text-sand mb-[1vh]">The marketing-led suite · ~$2.63B revenue (FY24)</div>
        <h2 className="font-display font-extrabold text-[3.2vw] leading-[1.02] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          Beautiful for SMB marketing — brittle the moment a GCC sales team grows past 10 reps.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[32vh] bottom-[6vh] grid grid-cols-2 gap-[1.4vw]">
        {[
          { p: "Tier-gating that punishes growth", d: "Workflow steps, custom properties, calling minutes, sequences, and AI credits are all metered per tier. Teams hit a wall at exactly the moment they're ready to scale.", n: "NexFlow's plans scale on seats, not feature gates. Workflows, sequences, AI, and calling are all unlimited within fair-use." },
          { p: "Contact-tier billing trap", d: "HubSpot bills on marketing contacts. Run two campaigns through a 50K-contact GCC database and the price doubles overnight — even on contacts you never actually touched.", n: "NexFlow bills on active workspace seats. Your enrichment and contact volume isn't a hidden meter waiting to bill you." },
          { p: "Calls bolted on, not native", d: "Calling is a thin wrapper over third-party providers. Power Dialer is enterprise-only, and conversation intelligence is a separate Sales Hub add-on with another price.", n: "NexFlow ships native cloud telephony, AI Voice Agent, and conversation intelligence in every paid tier — no upsell." },
          { p: "Arabic & GCC: an afterthought", d: "Translated UI, Western date formats by default, no Hijri, weak RTL handling in templates, and zero tooling for Khaleeji dialect or Arabic name parsing.", n: "NexFlow is GCC-native: Hijri-aware calendars, Khaleeji conversational AI, Saudi/UAE phone format validation, and RTL templates by default." },
        ].map(({ p, d, n }) => (
          <div key={p} className="rounded-[1.2vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
            <div className="font-display font-extrabold text-[1.7vw] leading-tight text-sand">{p}</div>
            <p className="mt-[1vh] text-[1.05vw] leading-snug text-ink/80 [text-wrap:pretty]">{d}</p>
            <div className="mt-auto pt-[1.2vh] border-t border-ink/10 text-[1vw] leading-snug">
              <span className="font-bold text-seafoam">NexFlow → </span>
              <span className="text-ink/80">{n}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
