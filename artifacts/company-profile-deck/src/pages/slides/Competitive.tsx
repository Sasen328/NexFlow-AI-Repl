const base = import.meta.env.BASE_URL;

export default function Competitive() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[20vw] w-[60vw] h-[60vw] rounded-full opacity-30 blur-[6vw] bg-mist" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[40vw] h-[40vw] rounded-full opacity-25 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>07 · Competitive landscape</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[4.4vw] leading-[0.96] tracking-[-0.02em] max-w-[68vw] [text-wrap:balance]">
          Where NexFlow stands against global and local players.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[7vh] rounded-[1.4vw] bg-white/75 border border-ink/10 overflow-hidden">
        <div className="grid grid-cols-12 px-[1.4vw] py-[1.4vh] bg-ink text-bg text-[0.78vw] uppercase tracking-[0.18em] font-semibold">
          <div className="col-span-2">Capability</div>
          <div className="col-span-2 text-center">NexFlow</div>
          <div className="col-span-2 text-center">Salesforce</div>
          <div className="col-span-2 text-center">HubSpot</div>
          <div className="col-span-1 text-center">Zoho</div>
          <div className="col-span-1 text-center">Pipedrive</div>
          <div className="col-span-2 text-center">Local GCC startups</div>
        </div>
        <div className="divide-y divide-ink/10 text-[0.95vw]">
          <div className="grid grid-cols-12 px-[1.4vw] py-[1.5vh] items-center">
            <div className="col-span-2 font-semibold">GCC-native, true Arabic / RTL</div>
            <div className="col-span-2 text-center font-bold text-seafoam">Native</div>
            <div className="col-span-2 text-center text-ink/65">Translated</div>
            <div className="col-span-2 text-center text-ink/65">Translated</div>
            <div className="col-span-1 text-center text-ink/65">Partial</div>
            <div className="col-span-1 text-center text-ink/65">No</div>
            <div className="col-span-2 text-center text-ink/65">Native</div>
          </div>
          <div className="grid grid-cols-12 px-[1.4vw] py-[1.5vh] items-center bg-bg/60">
            <div className="col-span-2 font-semibold">AI baked into the schema</div>
            <div className="col-span-2 text-center font-bold text-seafoam">Native</div>
            <div className="col-span-2 text-center text-ink/65">Add-on</div>
            <div className="col-span-2 text-center text-ink/65">Add-on</div>
            <div className="col-span-1 text-center text-ink/65">Limited</div>
            <div className="col-span-1 text-center text-ink/65">Limited</div>
            <div className="col-span-2 text-center text-ink/65">Wrappers</div>
          </div>
          <div className="grid grid-cols-12 px-[1.4vw] py-[1.5vh] items-center">
            <div className="col-span-2 font-semibold">In-Kingdom data residency</div>
            <div className="col-span-2 text-center font-bold text-seafoam">Default</div>
            <div className="col-span-2 text-center text-ink/65">Enterprise</div>
            <div className="col-span-2 text-center text-ink/65">No</div>
            <div className="col-span-1 text-center text-ink/65">No</div>
            <div className="col-span-1 text-center text-ink/65">No</div>
            <div className="col-span-2 text-center text-ink/65">Sometimes</div>
          </div>
          <div className="grid grid-cols-12 px-[1.4vw] py-[1.5vh] items-center bg-bg/60">
            <div className="col-span-2 font-semibold">Bundled marketing + calls + enrichment</div>
            <div className="col-span-2 text-center font-bold text-seafoam">Included</div>
            <div className="col-span-2 text-center text-ink/65">Add-ons</div>
            <div className="col-span-2 text-center text-ink/65">Tier-gated</div>
            <div className="col-span-1 text-center text-ink/65">Modules</div>
            <div className="col-span-1 text-center text-ink/65">Add-ons</div>
            <div className="col-span-2 text-center text-ink/65">CRM only</div>
          </div>
          <div className="grid grid-cols-12 px-[1.4vw] py-[1.5vh] items-center">
            <div className="col-span-2 font-semibold">SAR pricing &amp; mid-market plans</div>
            <div className="col-span-2 text-center font-bold text-seafoam">Yes</div>
            <div className="col-span-2 text-center text-ink/65">No</div>
            <div className="col-span-2 text-center text-ink/65">No</div>
            <div className="col-span-1 text-center text-ink/65">Partial</div>
            <div className="col-span-1 text-center text-ink/65">No</div>
            <div className="col-span-2 text-center text-ink/65">Yes</div>
          </div>
          <div className="grid grid-cols-12 px-[1.4vw] py-[1.5vh] items-center bg-bg/60">
            <div className="col-span-2 font-semibold">Real free plan for SMBs</div>
            <div className="col-span-2 text-center font-bold text-seafoam">Yes</div>
            <div className="col-span-2 text-center text-ink/65">No</div>
            <div className="col-span-2 text-center text-ink/65">Yes</div>
            <div className="col-span-1 text-center text-ink/65">No</div>
            <div className="col-span-1 text-center text-ink/65">No</div>
            <div className="col-span-2 text-center text-ink/65">Rare</div>
          </div>
          <div className="grid grid-cols-12 px-[1.4vw] py-[1.5vh] items-center">
            <div className="col-span-2 font-semibold">Mid-market depth &amp; product roadmap velocity</div>
            <div className="col-span-2 text-center font-bold text-seafoam">High</div>
            <div className="col-span-2 text-center text-ink/65">High</div>
            <div className="col-span-2 text-center text-ink/65">High</div>
            <div className="col-span-1 text-center text-ink/65">Med</div>
            <div className="col-span-1 text-center text-ink/65">Med</div>
            <div className="col-span-2 text-center text-ink/65">Low / early</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[2.2vh] left-[6vw] right-[6vw] text-[0.8vw] text-ink/50 italic">
        Local GCC startups column reflects the early-stage Arabic-first CRM cohort (e.g. Salla CRM-style add-ons, Misraj, regional Zoho-clones) — narrow in scope, often single-module, and yet to ship a unified AI-native platform.
      </div>
    </div>
  );
}
