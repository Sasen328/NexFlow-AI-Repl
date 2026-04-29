export default function Competition() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-mist" />
        <div className="absolute bottom-[-20vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-35 blur-[6vw] bg-rose" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>08 · Competition & Moat</span>
        <span>Where the giants cannot follow</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] right-[6vw]">
        <h2 className="font-display font-extrabold text-[5vw] leading-[0.96] tracking-[-0.025em] [text-wrap:balance] max-w-[78vw]">
          Salesforce, HubSpot, and Zoho cannot become Saudi.
        </h2>
        <p className="mt-[2vh] font-serif italic text-[1.65vw] leading-snug max-w-[68vw] text-ink/75 [text-wrap:pretty]">
          They will compete on logos and price. We compete on geography, language, and trust — three moats they cannot retrofit.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh]">
        <div className="bg-ink/8 rounded-[1.2vw] overflow-hidden">
          <div className="grid grid-cols-5 text-[0.9vw] tracking-[0.22em] uppercase font-bold text-ink/65 px-[1.5vw] py-[1.4vh] border-b border-ink/15">
            <div>Capability</div>
            <div className="text-center">Salesforce</div>
            <div className="text-center">HubSpot</div>
            <div className="text-center">Zoho</div>
            <div className="text-center bg-lavender/30 rounded-md py-[0.4vh]">NexFlow</div>
          </div>
          <div className="grid grid-cols-5 text-[1.15vw] px-[1.5vw] py-[1.6vh] border-b border-ink/10">
            <div className="font-semibold">Arabic-native UI & search</div>
            <div className="text-center text-ink/55">Bolted on</div>
            <div className="text-center text-ink/55">Partial</div>
            <div className="text-center text-ink/55">Partial</div>
            <div className="text-center font-bold text-seafoam">Native</div>
          </div>
          <div className="grid grid-cols-5 text-[1.15vw] px-[1.5vw] py-[1.6vh] border-b border-ink/10">
            <div className="font-semibold">WhatsApp as first-class channel</div>
            <div className="text-center text-ink/55">No</div>
            <div className="text-center text-ink/55">Add-on</div>
            <div className="text-center text-ink/55">Add-on</div>
            <div className="text-center font-bold text-seafoam">Core</div>
          </div>
          <div className="grid grid-cols-5 text-[1.15vw] px-[1.5vw] py-[1.6vh] border-b border-ink/10">
            <div className="font-semibold">KSA data residency by default</div>
            <div className="text-center text-ink/55">Roadmap</div>
            <div className="text-center text-ink/55">No</div>
            <div className="text-center text-ink/55">No</div>
            <div className="text-center font-bold text-seafoam">Default</div>
          </div>
          <div className="grid grid-cols-5 text-[1.15vw] px-[1.5vw] py-[1.6vh]">
            <div className="font-semibold">Hijri / prayer-time / ZATCA logic</div>
            <div className="text-center text-ink/55">No</div>
            <div className="text-center text-ink/55">No</div>
            <div className="text-center text-ink/55">No</div>
            <div className="text-center font-bold text-seafoam">Built in</div>
          </div>
        </div>
      </div>
    </div>
  );
}
