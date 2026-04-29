const base = import.meta.env.BASE_URL;

export default function FeatureCallsTranscripts() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-ink font-body">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-[10vh] left-[-10vw] w-[55vw] h-[55vw] rounded-full opacity-30 blur-[6vw] bg-mist" />
      </div>

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between text-[0.95vw] tracking-[0.22em] uppercase font-semibold text-ink/55">
        <span>18 · Feature deep-dive · How call notes flow back into the system</span>
        <img src={`${base}logo_mark.svg`} crossOrigin="anonymous" alt="" className="w-[2.4vw] h-[2.4vw] opacity-80" />
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[12vh]">
        <h2 className="font-display font-extrabold text-[3vw] leading-[1.04] tracking-[-0.02em] max-w-[80vw] [text-wrap:balance]">
          From "agent talking" to "deal updated" in under 30 seconds — with no manual logging.
        </h2>
      </div>

      <div className="absolute left-[6vw] top-[26vh] bottom-[28vh] w-[52vw]">
        <div className="rounded-[1vw] overflow-hidden border border-ink/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] bg-white">
          <img src={`${base}screenshots/calls.jpg`} crossOrigin="anonymous" alt="NexFlow Calls & Transcripts screen with Live AI Coach" className="w-full h-auto block" />
        </div>
        <div className="mt-[1.4vh] text-[0.78vw] uppercase tracking-[0.2em] text-ink/55 italic">
          Live screenshot · Calls & Transcripts / Live AI Coach panel
        </div>
      </div>

      <div className="absolute right-[6vw] top-[26vh] bottom-[28vh] w-[34vw] flex flex-col gap-[1.2vh]">
        {[
          { t: "AI score & coaching panel", d: "Each call gets an AI score (talk-ratio, discovery quality, objection handling) and a Live Coach surfaces opening, discovery, objection, and closing prompts in real time." },
          { t: "Bilingual transcription", d: "Audio is streamed to Whisper-large + a custom Khaleeji acoustic model — Arabic, Khaleeji dialect, English, and code-switching all handled in one pass." },
          { t: "Summary + structured extraction", d: "LLM extracts: deal value, decision-makers mentioned, next-step commitment, blockers, competitor names. Each one auto-fills the related CRM field." },
          { t: "Voice library & playbooks", d: "Top-performing snippets across the team are clipped into a searchable voice library — used to onboard new reps and feed the AI coaching prompts." },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-[0.7vw] bg-white/80 border border-ink/10 p-[1vw]">
            <div className="font-bold text-[0.95vw]">{t}</div>
            <p className="mt-[0.3vh] text-[0.82vw] leading-snug text-ink/75 [text-wrap:pretty]">{d}</p>
          </div>
        ))}
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[6vh] h-[18vh] rounded-[1vw] bg-ink text-bg p-[1.4vw]">
        <div className="text-[0.85vw] uppercase tracking-[0.22em] font-bold text-bg/55 mb-[1vh]">Pipeline · call hangs up → CRM updated</div>
        <div className="grid grid-cols-6 gap-[0.8vw] items-stretch h-[10vh]">
          {[
            { n: "1", t: "Audio captured", d: "Native cloud telephony stream + recording." },
            { n: "2", t: "Transcribe (~10s)", d: "Whisper + Khaleeji LM, bilingual." },
            { n: "3", t: "Diarize speakers", d: "Rep vs prospect channels split." },
            { n: "4", t: "LLM extract", d: "Summary + structured fields + sentiment." },
            { n: "5", t: "Write-back", d: "Deal updated, tasks created, notes attached." },
            { n: "6", t: "Coach + score", d: "AI score logged, coaching tips queued." },
          ].map(({ n, t, d }) => (
            <div key={n} className="flex flex-col p-[0.6vw] rounded-[0.4vw] bg-bg/10 border border-bg/15">
              <div className="text-[0.75vw] uppercase tracking-[0.18em] font-bold text-seafoam">Step {n}</div>
              <div className="mt-[0.4vh] font-bold text-[0.85vw]">{t}</div>
              <div className="mt-[0.2vh] text-[0.7vw] text-bg/70 leading-snug [text-wrap:pretty]">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
