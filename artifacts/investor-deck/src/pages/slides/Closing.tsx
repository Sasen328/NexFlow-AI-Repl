const base = import.meta.env.BASE_URL;

export default function Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[20vh] -left-[10vw] w-[70vw] h-[70vw] rounded-full opacity-50 blur-[6vw] bg-lavender" />
        <div className="absolute top-[10vh] right-[-15vw] w-[55vw] h-[55vw] rounded-full opacity-50 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-20vh] left-[15vw] w-[60vw] h-[60vw] rounded-full opacity-45 blur-[6vw] bg-sand" />
        <div className="absolute bottom-[-10vh] right-[-5vw] w-[50vw] h-[50vw] rounded-full opacity-40 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] flex items-center gap-[1.2vw]">
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="NexFlow mark" className="w-[5vw] h-[5vw]" />
        <span className="font-display font-extrabold text-[1.4vw] tracking-[0.32em] uppercase">NexFlow</span>
      </div>

      <div className="absolute top-[6vh] right-[6vw] text-right text-[1.05vw] tracking-[0.22em] uppercase font-medium opacity-70">
        14 · Thank you
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[34vh]">
        <div className="text-[1.15vw] tracking-[0.3em] uppercase font-semibold text-ink/70 mb-[3vh]">
          Join us at the start of the GCC's CRM
        </div>
        <h1 className="font-display font-extrabold text-[8.5vw] leading-[0.92] tracking-[-0.03em] [text-wrap:balance]">
          Where revenue learns to flow.
        </h1>
      </div>

      <div className="absolute bottom-[10vh] left-[6vw] right-[6vw] grid grid-cols-3 gap-[2vw] text-[1.15vw] text-ink/80">
        <div>
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-ink/55">Contact</div>
          <div className="mt-[1vh] font-semibold">founders@nexflow.sa</div>
        </div>
        <div>
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-ink/55">Materials</div>
          <div className="mt-[1vh] font-semibold">Deep-dive · Feasibility · 3-yr plan</div>
        </div>
        <div>
          <div className="text-[0.85vw] tracking-[0.28em] uppercase font-bold text-ink/55">Round</div>
          <div className="mt-[1vh] font-semibold">$100K SAFE · $1.5M pre-money · open</div>
        </div>
      </div>
    </div>
  );
}
