const base = import.meta.env.BASE_URL;

export default function Feasibility() {
  const dimensions = [
    {
      title: "Technical", score: 9, color: "bg-seafoam", bar: "w-[90%]",
      points: [
        "Full-stack monorepo in production — React, Node, PostgreSQL, 4 AI providers",
        "16-agent parallel research pipeline live and tested",
        "4 AI intelligence engines (Masaar, Person Intel, Company Intel, Lead Finder)",
        "5-agent business card scanner running in production",
        "Call redaction, post-call automation, WhatsApp bot — all shipped",
      ]
    },
    {
      title: "Market", score: 8, color: "bg-sand", bar: "w-[80%]",
      points: [
        "$3.4B GCC CRM market, <18% SMB penetration — massive whitespace",
        "Vision 2030 and D33 mandates accelerating enterprise digitisation",
        "Salesforce / HubSpot price fatigue in GCC is well-documented",
        "WhatsApp B2B channel dominant — no global CRM serves it natively",
        "Arabic-first regulation creating compliance urgency for local vendors",
      ]
    },
    {
      title: "Operational", score: 8, color: "bg-lavender", bar: "w-[80%]",
      points: [
        "Product built, not wireframed — 28-slide deck is live product demonstrations",
        "5 demo personas showing real role-specific AI briefings",
        "Persona-aware Command Center, CEO Situation Room, per-role daily briefing",
        "Saudi PDPL compliance (call redaction, IBAN/Iqama redaction) built in",
        "In-Kingdom data residency architecture designed from day one",
      ]
    },
    {
      title: "Risk", score: 7, color: "bg-rose", bar: "w-[70%]",
      points: [
        "AI provider dependency: mitigated by 4-provider waterfall (OpenAI/Anthropic/Gemini/Perplexity)",
        "Competition: Salesforce has resources but not GCC-native data. Zoho has Arabic but no AI depth.",
        "Regulatory: NexFlow's KSA PDPL posture is a moat, not a risk — we built it in first.",
        "Sales cycle: enterprise B2B in GCC is 60–120 days. Managed via AI-powered sequence engine.",
        "FX: SAR-priced, SAR-settled. Dollar risk to AI API costs only — manageable margin lever.",
      ]
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] left-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-22 blur-[6vw] bg-seafoam" />
        <div className="absolute bottom-[-10vh] right-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-20 blur-[6vw] bg-lavender" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Feasibility · Analysis</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          Technical readiness: 9/10. Product is live, not planned.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">Every feature described in this deck ships in the running application today. Feasibility is demonstrated, not projected.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[28vh] bottom-[4vh] grid grid-cols-2 gap-[1.2vw]">
        {dimensions.map((d, i) => (
          <div key={i} className="rounded-[1.2vw] bg-white/72 border border-ink/8 p-[1.4vw]">
            <div className="flex items-center justify-between mb-[0.8vh]">
              <span className="font-display font-extrabold text-[1.4vw]">{d.title} Feasibility</span>
              <span className={`font-display font-extrabold text-[2vw] ${d.color.replace('bg-', 'text-')}`}>{d.score}/10</span>
            </div>
            <div className="w-full h-[0.5vh] bg-ink/10 rounded-full mb-[1.2vh]">
              <div className={`h-full ${d.bar} ${d.color} rounded-full`} />
            </div>
            <ul className="space-y-[0.5vh]">
              {d.points.map((p, j) => (
                <li key={j} className="flex gap-[0.6vw] items-start">
                  <span className={`mt-[0.3vh] w-[0.6vw] h-[0.6vw] rounded-full ${d.color} flex-shrink-0`} />
                  <span className="text-[0.85vw] leading-snug text-ink/75">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
