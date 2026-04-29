const base = import.meta.env.BASE_URL;

export default function WhereWeStand() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>11 · Where we stand</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <h2 className="font-display font-extrabold text-[3.6vw] leading-[1.02] tracking-[-0.02em] max-w-[72vw] [text-wrap:balance]">
          The 2×2 nobody else is sitting in.
        </h2>
        <p className="mt-[1vh] font-serif italic text-[1.1vw] leading-snug text-ink/75 max-w-[60vw] [text-wrap:pretty]">
          Plotted on the two axes that matter for GCC buyers: how local the product actually is, and how AI-native the architecture actually is.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[6vh]">
        <div className="relative w-full h-full rounded-[1.4vw] bg-white/70 border border-ink/10 overflow-hidden">
          {/* Axes */}
          <div className="absolute left-[12%] right-[6%] top-1/2 -translate-y-1/2 h-px bg-ink/30" />
          <div className="absolute top-[8%] bottom-[12%] left-1/2 -translate-x-1/2 w-px bg-ink/30" />
          {/* Axis labels */}
          <div className="absolute right-[6%] top-1/2 -translate-y-1/2 translate-x-[2%] -translate-y-[180%] text-[0.9vw] uppercase tracking-[0.22em] font-bold text-ink/55">More local · GCC-native</div>
          <div className="absolute left-[12%] top-1/2 -translate-y-1/2 -translate-x-[2%] translate-y-[60%] text-[0.9vw] uppercase tracking-[0.22em] font-bold text-ink/55">Global / generic</div>
          <div className="absolute left-1/2 top-[8%] -translate-x-1/2 -translate-y-[60%] text-[0.9vw] uppercase tracking-[0.22em] font-bold text-ink/55">AI-native architecture</div>
          <div className="absolute left-1/2 bottom-[12%] -translate-x-1/2 translate-y-[80%] text-[0.9vw] uppercase tracking-[0.22em] font-bold text-ink/55">CRM with AI bolted on</div>

          {/* Quadrant labels */}
          <div className="absolute top-[10%] left-[14%] text-[0.78vw] uppercase tracking-[0.2em] text-ink/35">Generic · AI-native</div>
          <div className="absolute top-[10%] right-[8%] text-[0.78vw] uppercase tracking-[0.2em] text-ink/35 text-right">Local · AI-native ← <span className="text-seafoam font-bold">our wedge</span></div>
          <div className="absolute bottom-[14%] left-[14%] text-[0.78vw] uppercase tracking-[0.2em] text-ink/35">Generic · legacy</div>
          <div className="absolute bottom-[14%] right-[8%] text-[0.78vw] uppercase tracking-[0.2em] text-ink/35 text-right">Local · legacy</div>

          {/* Players */}
          {[
            { name: "Salesforce",       x: "30%", y: "62%", color: "#5DA0E5" },
            { name: "Microsoft D365",   x: "32%", y: "70%", color: "#7CC0BB" },
            { name: "HubSpot",          x: "38%", y: "44%", color: "#E08A6B" },
            { name: "Zoho",             x: "34%", y: "78%", color: "#C9A55C" },
            { name: "Pipedrive",        x: "28%", y: "82%", color: "#9CB890" },
            { name: "Freshworks",       x: "30%", y: "78%", color: "#B89AC8" },
            { name: "Local Zoho-clones",x: "76%", y: "75%", color: "#C8A4B8" },
            { name: "NexFlow",          x: "82%", y: "20%", color: "#88B8B0", us: true },
          ].map(({ name, x, y, color, us }) => (
            <div
              key={name}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: x, top: y }}
            >
              <div
                className={`rounded-full ${us ? "w-[2.4vw] h-[2.4vw] ring-[0.4vw] ring-seafoam/30" : "w-[1.4vw] h-[1.4vw]"}`}
                style={{ background: color }}
              />
              <div className={`mt-[0.6vh] text-[0.85vw] font-bold whitespace-nowrap ${us ? "text-seafoam font-display text-[1.2vw]" : "text-ink/75"}`}>
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
