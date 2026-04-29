const base = import.meta.env.BASE_URL;

export default function PainZohoOthers() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] left-[10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-mist" />
        <div className="absolute bottom-[-15vh] right-[10vw] w-[50vw] h-[50vw] rounded-full opacity-25 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>06 · Pain in Zoho · Pipedrive · Freshworks</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <div className="text-[1vw] tracking-[0.3em] uppercase font-semibold text-mist mb-[1vh]">The "good enough" tier · combined revenue ≈ $2.3B</div>
        <h2 className="font-display font-extrabold text-[3.4vw] leading-[1.02] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          Cheap to buy. Painful to live in once the team grows past spreadsheets.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[30vh] bottom-[6vh] grid grid-cols-3 gap-[1.4vw]">
        {[
          { v: "Zoho", rev: "$1.3B FY24 (private)", pains: ["50+ disconnected products with overlapping data models — Zoho One is a license bundle, not a unified app.", "Zia AI is template-driven, not generative — no real conversation intel.", "Arabic UI is partial; templates and reports require manual RTL work."] },
          { v: "Pipedrive", rev: "$169M FY23 (Vista-owned)", pains: ["Pipeline-only mental model — marketing, support, and intelligence live in third-party tools.", "AI is wishlist-tier: a basic email summarizer, no agents, no voice.", "No native MENA presence, no Arabic, USD billing only."] },
          { v: "Freshworks (Freshsales)", rev: "$720M FY24", pains: ["CRM is a side product to support / IT ticketing — roadmap energy goes elsewhere.", "Freddy AI is opt-in add-on credits, not core.", "GCC localization limited to translated strings and INR-anchored pricing."] },
        ].map(({ v, rev, pains }) => (
          <div key={v} className="rounded-[1.2vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
            <div className="font-display font-extrabold text-[2vw] leading-tight">{v}</div>
            <div className="mt-[0.4vh] text-[0.85vw] uppercase tracking-[0.2em] text-ink/55 font-semibold">{rev}</div>
            <ul className="mt-[1.5vh] space-y-[1vh] text-[0.95vw] leading-snug text-ink/80">
              {pains.map((p, i) => (
                <li key={i} className="flex gap-[0.6vw]">
                  <span className="text-rose font-bold flex-shrink-0">×</span>
                  <span className="[text-wrap:pretty]">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="absolute bottom-[2vh] left-[6vw] right-[6vw] text-[0.85vw] text-ink/55 italic">
        NexFlow's response → one platform, one bill, one identity for every team — no SKU lottery, no module-stitching consultancy required.
      </div>
    </div>
  );
}
