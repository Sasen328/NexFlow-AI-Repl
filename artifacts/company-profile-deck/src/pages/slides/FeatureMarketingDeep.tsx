const base = import.meta.env.BASE_URL;

export default function FeatureMarketingDeep() {
  const features = [
    { color: "bg-rose", name: "Marketing Dashboard", desc: "AI 3-up analysis: Winning / Pain / How-to-Win. KPI tiles. Hot Lead Alerts strip with Call/Email/WhatsApp CTAs. Cultural Intelligence alert banner." },
    { color: "bg-sand", name: "AI Campaign Builder — 6 steps", desc: "Real AI: generates key messages + 7 per-channel variants (LinkedIn/X/Instagram/Facebook/WhatsApp/Email/SMS — each in the correct tone). Per-output Refresh re-runs the AI." },
    { color: "bg-seafoam", name: "Cultural Intelligence Toggle", desc: "Injects Khaleeji aesthetic, Arabic-first copy, Sun–Wed optimal timing. AI-generated campaign visual per campaign. GCC tone built into every channel variant." },
    { color: "bg-lavender", name: "Campaign Performance", desc: "7 KPIs, ROI strip, hot-lead URGENT banner, AI improvement suggestions with Re-analyse button. Campaign dropdown selector for multi-campaign view." },
    { color: "bg-mist", name: "Sequences & Audiences", desc: "Multi-touch cadences: email → LinkedIn → AI Voice Call → WhatsApp. Audience segmentation. Lazy-loads existing cadence and template libraries." },
    { color: "bg-olive", name: "Web Forms + AI Form Creator", desc: "AI drafts form fields from a brief. Predictive Analysis card: health grade, predicted open/conversion rate, pricing and channel suggestions." },
    { color: "bg-rose", name: "Attribution", desc: "Revenue attribution across 7 channels. Deal-level attribution trace: which campaign touched this contact, which step converted." },
    { color: "bg-sand", name: "Campaign Publishing", desc: "7 channels, datetime schedule, publish flow. Posts to API. Results synthesised for end-to-end demo flow." },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[15vh] right-[-8vw] w-[50vw] h-[50vw] rounded-full opacity-25 blur-[6vw] bg-rose" />
        <div className="absolute bottom-[-10vh] left-[-6vw] w-[40vw] h-[40vw] rounded-full opacity-22 blur-[6vw] bg-sand" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>Engine 04 · Marketing</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13vh]">
        <h2 className="font-display font-extrabold text-[3.8vw] leading-[0.96] tracking-[-0.02em]">
          Marketing Engine — AI-native. GCC-tuned. 7 channels.
        </h2>
        <p className="mt-[0.8vh] font-serif italic text-[1.4vw] text-ink/65">From brief to 7 bilingual channel variants in one AI builder — with Cultural Intelligence baked in at every step.</p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[27vh] bottom-[4vh] grid grid-cols-4 grid-rows-2 gap-[1vw]">
        {features.map((f, i) => (
          <div key={i} className="rounded-[1vw] bg-white/72 border border-ink/8 p-[1.3vw] flex flex-col gap-[0.5vh]">
            <div className="flex items-center gap-[0.6vw]">
              <span className={`w-[0.8vw] h-[0.8vw] rounded-full ${f.color} flex-shrink-0`} />
              <span className="font-display font-bold text-[1.05vw] leading-tight">{f.name}</span>
            </div>
            <p className="text-[0.88vw] leading-snug text-ink/72 [text-wrap:pretty]">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
