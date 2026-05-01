import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const QUESTIONS = [
  { en: 'How are you tracking pipeline post-funding?', ar: 'كيف تتابعون خط المبيعات بعد التمويل؟' },
  { en: 'Where is the new SDR team focusing first?',   ar: 'أين سيركز فريق المبيعات الجديد أولاً؟' },
  { en: 'What CRM moves with you to the next stage?',  ar: 'أي نظام CRM ينتقل معكم للمرحلة التالية؟' },
];

export function Scene3Briefing() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),  // morning gradient washes in
      setTimeout(() => setPhase(2), 1000), // briefing card slides
      setTimeout(() => setPhase(3), 2400), // opener
      setTimeout(() => setPhase(4), 4200), // questions
      setTimeout(() => setPhase(5), 8500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Morning light wash */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 1.2 }}
        style={{
          background:
            'radial-gradient(120% 80% at 20% 100%, rgba(200,168,128,0.22) 0%, rgba(192,160,184,0.10) 35%, transparent 70%)',
        }}
      />

      <div className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center">
        <div className="text-[10px] uppercase tracking-[0.4em] opacity-50">03 · The Briefing</div>
        <div
          className="text-[12px] mt-1 opacity-45"
          dir="rtl"
          style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        >
          الموجز الصباحي
        </div>
      </div>

      {/* Daily Briefing card on left */}
      <motion.div
        className="absolute left-[6vw] top-1/2 -translate-y-1/2 w-[40vw] min-w-[440px] max-w-[620px] rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(250,247,244,0.97), rgba(245,240,236,0.93))',
          color: 'hsl(270,25%,20%)',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,160,200,0.2)',
        }}
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, x: phase >= 2 ? 0 : -60 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ background: 'linear-gradient(90deg, #B8A0C8, #88B8B0, #C8A880)' }}
        >
          <div>
            <div
              className="text-[18px] font-semibold text-white"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Daily Briefing · Noura
            </div>
            <div
              className="text-[12px] text-white/80"
              dir="rtl"
              style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
            >
              موجز الصباح · نورة
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/85">
            06:42 AM · Riyadh
          </div>
        </div>

        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.25em] opacity-60 mb-1">
            Account context
          </div>
          <div className="text-[14px] mb-4 opacity-85">
            ACME Industries closed Series B (ر.س 1.2B). New CFO Faisal Al-Otaibi.
            Hiring 4 SDRs · tech budget +40%.
          </div>

          {/* Recommended opener (Arabic-first) */}
          <motion.div
            className="rounded-xl p-3 mb-4"
            style={{ background: 'rgba(200,168,128,0.10)', border: '1px solid rgba(200,168,128,0.4)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 8 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[10px] uppercase tracking-[0.22em] opacity-60 mb-1">
              Recommended opener · Arabic
            </div>
            <div
              className="text-[18px] leading-relaxed"
              dir="rtl"
              style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif', fontWeight: 500 }}
            >
              صباح الخير فيصل، مبروك إغلاق الجولة. أعرف وقتك ضيق — دقيقتين فقط.
            </div>
            <div className="text-[12px] opacity-65 mt-1">
              "Good morning Faisal, congrats on the close. I know you're busy — just two minutes."
            </div>
          </motion.div>

          <div className="text-[10px] uppercase tracking-[0.25em] opacity-60 mb-2">
            Discovery questions
          </div>
          <div className="space-y-2">
            {QUESTIONS.map((q, i) => {
              const visible = phase >= 4;
              return (
                <motion.div
                  key={i}
                  className="flex gap-3 items-start rounded-lg p-2"
                  style={{ background: 'rgba(184,160,200,0.08)' }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                  transition={{ duration: 0.45, delay: visible ? i * 0.35 : 0 }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: '#B8A0C8', color: 'white' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium leading-tight">{q.en}</div>
                    <div
                      className="text-[12px] opacity-70 leading-tight mt-0.5"
                      dir="rtl"
                      style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
                    >
                      {q.ar}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Noura avatar bubble — abstract Khaleeji female silhouette */}
      <motion.div
        className="absolute right-[12vw] top-[22vh]"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0.85 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <NouraBadge />
      </motion.div>
    </motion.div>
  );
}

function NouraBadge() {
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="text-[14px] font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
          Noura · Sales rep
        </div>
        <div
          className="text-[12px] opacity-65"
          dir="rtl"
          style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        >
          نورة · مندوبة مبيعات
        </div>
      </div>
      <svg width="68" height="68" viewBox="0 0 68 68">
        <defs>
          <linearGradient id="nouraGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C0A0B8" />
            <stop offset="100%" stopColor="#B8A0C8" />
          </linearGradient>
        </defs>
        <circle cx="34" cy="34" r="32" fill="url(#nouraGrad)" />
        {/* abaya silhouette */}
        <path
          d="M34 22 a8 8 0 0 1 8 8 v2 a8 8 0 0 1 -16 0 v-2 a8 8 0 0 1 8 -8 z M18 60 q0 -16 16 -18 q16 2 16 18 z"
          fill="rgba(31,26,36,0.85)"
        />
      </svg>
    </div>
  );
}
