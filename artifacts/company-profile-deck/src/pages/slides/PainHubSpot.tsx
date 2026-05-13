const base = import.meta.env.BASE_URL;

export default function PainHubSpot() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-20 blur-[6vw] bg-sand" />
        <div className="absolute bottom-[-15vh] right-[-10vw] w-[50vw] h-[50vw] rounded-full opacity-18 blur-[6vw] bg-seafoam" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>05 · Pain in HubSpot</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[13.5vh]">
        <div className="text-[0.95vw] uppercase tracking-[0.22em] font-semibold text-sand">The marketing-led suite · ~$2.63B revenue FY24</div>
        <h2 className="mt-[0.6vh] font-display font-extrabold text-[3.6vw] leading-[0.96] tracking-[-0.02em] max-w-[76vw] [text-wrap:balance]">
          Great for inbound marketing.<br />Wrong toolset for GCC outbound sales.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[33vh] bottom-[5vh] grid grid-cols-4 gap-[1.6vw]">
        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw] mb-[1.4vh]">
            <div className="w-[2vw] h-[2vw] rounded-full bg-sand/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#b8860b] font-bold text-[0.85vw]">01</span>
            </div>
            <span className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/50">WhatsApp</span>
          </div>
          <div className="font-display font-extrabold text-[1.35vw] leading-tight">
            WhatsApp is the GCC's #1 sales channel. HubSpot needs a third-party integration for it.
          </div>
          <p className="mt-[1vh] text-[0.92vw] leading-snug text-ink/70 flex-1 [text-wrap:pretty]">
            HubSpot requires Twilio or 360Dialog for WhatsApp — manual Meta Business template approval, no shared inbox, no AI bot switching Arabic ↔ English mid-conversation, no post-call auto-draft.
          </p>
          <div className="mt-[1.2vh] pt-[1.2vh] border-t border-seafoam/30 bg-seafoam/5 rounded-[0.6vw] p-[0.8vw]">
            <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-seafoam mb-[0.4vh]">NexFlow</div>
            <div className="text-[0.88vw] text-ink/80 leading-snug">Native WhatsApp inbox, bilingual AI bot (auto-detects Arabic ↔ English), broadcast templates, Arabic quick-reply buttons, post-call automation wired directly to the dialer.</div>
          </div>
        </div>

        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw] mb-[1.4vh]">
            <div className="w-[2vw] h-[2vw] rounded-full bg-sand/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#b8860b] font-bold text-[0.85vw]">02</span>
            </div>
            <span className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/50">Buying Signals</span>
          </div>
          <div className="font-display font-extrabold text-[1.35vw] leading-tight">
            HubSpot reads TechCrunch. We read Argaam, Wamda, and MoCI filings.
          </div>
          <p className="mt-[1vh] text-[0.92vw] leading-snug text-ink/70 flex-1 [text-wrap:pretty]">
            HubSpot enrichment is powered by ZoomInfo and Clearbit — US-centric databases with thin GCC coverage. A Saudi company raising a Series B or filing a new Ministry of Commerce license won't appear.
          </p>
          <div className="mt-[1.2vh] pt-[1.2vh] border-t border-seafoam/30 bg-seafoam/5 rounded-[0.6vw] p-[0.8vw]">
            <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-seafoam mb-[0.4vh]">NexFlow</div>
            <div className="text-[0.88vw] text-ink/80 leading-snug">Monitors Wamda (MENA startups), Saudi Ministry of Commerce (MoCI) corporate filings, Argaam (Saudi financial news), Reuters Arabic, and custom RSS — all in real-time.</div>
          </div>
        </div>

        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw] mb-[1.4vh]">
            <div className="w-[2vw] h-[2vw] rounded-full bg-sand/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#b8860b] font-bold text-[0.85vw]">03</span>
            </div>
            <span className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/50">Cultural Intelligence</span>
          </div>
          <div className="font-display font-extrabold text-[1.35vw] leading-tight">
            Ramadan, Eid, and the Friday–Saturday week don't exist in HubSpot.
          </div>
          <p className="mt-[1vh] text-[0.92vw] leading-snug text-ink/70 flex-1 [text-wrap:pretty]">
            HubSpot campaigns schedule on Gregorian time with zero awareness of GCC cultural rhythm. A campaign blasting on Eid morning or the Friday afternoon prayer window actively damages brand trust.
          </p>
          <div className="mt-[1.2vh] pt-[1.2vh] border-t border-seafoam/30 bg-seafoam/5 rounded-[0.6vw] p-[0.8vw]">
            <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-seafoam mb-[0.4vh]">NexFlow</div>
            <div className="text-[0.88vw] text-ink/80 leading-snug">Per-country event calendar: Ramadan GOLD pre-window, Eid blackouts, 6 national days, prayer schedule, Sun–Wed work week. AI cultural advisor answers any GCC outreach question in real-time.</div>
          </div>
        </div>

        <div className="rounded-[1.4vw] bg-white/80 border border-ink/10 p-[1.6vw] flex flex-col">
          <div className="flex items-center gap-[0.8vw] mb-[1.4vh]">
            <div className="w-[2vw] h-[2vw] rounded-full bg-sand/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#b8860b] font-bold text-[0.85vw]">04</span>
            </div>
            <span className="text-[0.78vw] uppercase tracking-[0.16em] font-semibold text-ink/50">Power Dialer / Voice</span>
          </div>
          <div className="font-display font-extrabold text-[1.35vw] leading-tight">
            Power Dialer is Enterprise-only. Arabic AI Agent doesn't exist.
          </div>
          <p className="mt-[1vh] text-[0.92vw] leading-snug text-ink/70 flex-1 [text-wrap:pretty]">
            HubSpot calling is basic VOIP. Power Dialer requires Sales Hub Enterprise ($150/seat minimum). Conversation intelligence is a separate add-on. There are zero AI voice agents in any dialect of Arabic.
          </p>
          <div className="mt-[1.2vh] pt-[1.2vh] border-t border-seafoam/30 bg-seafoam/5 rounded-[0.6vw] p-[0.8vw]">
            <div className="text-[0.75vw] uppercase tracking-[0.16em] font-semibold text-seafoam mb-[0.4vh]">NexFlow</div>
            <div className="text-[0.88vw] text-ink/80 leading-snug">Power Dialer + AI Agent mode (Manual / Auto-Dial / Autonomous) + LiveCoachPanel (real-time objection detection) + post-call automation — in every paid tier.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
