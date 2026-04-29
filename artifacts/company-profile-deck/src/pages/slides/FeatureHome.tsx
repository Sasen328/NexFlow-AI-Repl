const base = import.meta.env.BASE_URL;

export default function FeatureHome() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] right-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>15 · Feature deep-dive · Home & Command Center</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <div className="text-[1vw] tracking-[0.3em] uppercase font-semibold text-lavender mb-[1vh]">Module 01 · Home</div>
        <h2 className="font-display font-extrabold text-[3.6vw] leading-[0.96] tracking-[-0.02em] max-w-[68vw] [text-wrap:balance]">
          Open NexFlow, see what to do today. Not a dashboard — a daily briefing.
        </h2>
      </div>

      <div className="absolute left-[6vw] top-[30vh] bottom-[6vh] w-[52vw]">
        <div className="rounded-[1vw] overflow-hidden border border-ink/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] bg-white">
          <img src={`${base}screenshots/home.jpg`} crossOrigin="anonymous" alt="NexFlow Command Center home page" className="w-full h-auto block" />
        </div>
        <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.2em] text-ink/55 italic">
          Live screenshot · Command Center / Today's briefing
        </div>
      </div>

      <div className="absolute right-[6vw] top-[30vh] bottom-[6vh] w-[33vw] flex flex-col gap-[1.4vh]">
        {[
          { n: "01", t: "Daily AI briefing", d: "Generated nightly from yesterday's calls, emails, deal moves, and signals — written in plain language by the LLM, with citations back to the source records." },
          { n: "02", t: "4 KPI tiles", d: "Calls today, AI-completed conversations, active leads, deals at risk — re-computed in real time, drillable down to the underlying records." },
          { n: "03", t: "Re-engagement queue", d: "Surfaces leads silent ≥90 days who triggered an external signal (funding, hiring, news) — with one-tap re-score and outreach drafts." },
          { n: "04", t: "Tasks · Insights · AI Assistant", d: "Sub-tabs for the rep's open tasks, the day's AI insights (stalled deals, anomalies), and a chat surface for conversational queries against the workspace." },
        ].map(({ n, t, d }) => (
          <div key={n} className="rounded-[0.8vw] bg-white/80 border border-ink/10 p-[1.2vw]">
            <div className="flex items-baseline gap-[0.8vw]">
              <span className="font-display font-extrabold text-[1.5vw] text-lavender">{n}</span>
              <span className="font-bold text-[1.1vw]">{t}</span>
            </div>
            <p className="mt-[0.5vh] text-[0.88vw] leading-snug text-ink/75 [text-wrap:pretty]">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
