import { motion } from 'framer-motion';
import { StatusBar } from '../Phone';

const transcript = [
  { who: 'layla', ar: 'صباح النور أستاذ خالد، معك ليلى من نكسفلو', en: '— hi Khalid, it’s Layla from NexFlow' },
  { who: 'khalid', ar: 'هلا والله، تفضلي', en: 'go ahead' },
  { who: 'layla', ar: 'بخصوص عرض أرامكو الرقمية، حابة أأكد الموعد الجاي', en: 're: ARAMCO Digital — confirming our slot' },
  { who: 'khalid', ar: 'تمام، الثلاثاء بعد الظهر مناسب', en: 'Tuesday afternoon works' },
  { who: 'layla', ar: 'ممتاز، رصدنا إشارة قوية من فريقهم التقني', en: 'we picked up a strong signal from their tech team' },
];

export function SceneVoice() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, #1a1024 0%, #2a1a36 60%, #3c2848 100%)',
      }}
    >
      <StatusBar tone="light" />

      {/* Caller header */}
      <div className="absolute top-[60px] left-0 right-0 px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[10px] uppercase tracking-[0.32em] text-[#B8A0C8]"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Live · NexFlow Voice Agent
        </motion.div>

        {/* Avatar with pulsing rings */}
        <div className="relative mt-3 w-[72px] h-[72px] flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ border: '1.5px solid rgba(184,160,200,0.5)' }}
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: [0.6, 1.6], opacity: [0.6, 0] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeOut',
              }}
            />
          ))}
          <div
            className="relative w-[64px] h-[64px] rounded-full flex items-center justify-center font-bold text-[22px] text-[#1F1A24]"
            style={{
              background: 'linear-gradient(135deg, #B8A0C8, #C0A0B8)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: '0 8px 22px rgba(184,160,200,0.45)',
            }}
          >
            ل
          </div>
        </div>

        <div
          className="mt-2 text-[15px] font-bold text-white"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Layla · ليلى
        </div>
        <motion.div
          className="text-[11px] text-[#B8A0C8] tabular-nums mt-0.5"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          02:14 · calling Khalid Al-Mutairi
        </motion.div>
      </div>

      {/* Transcript */}
      <div className="absolute top-[220px] bottom-[80px] left-0 right-0 px-4 overflow-hidden">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: -90 }}
          transition={{ duration: 6, ease: 'linear' }}
          className="space-y-2.5"
        >
          {transcript.map((t, i) => {
            const mine = t.who === 'layla';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: mine ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.55, duration: 0.4 }}
                className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className="max-w-[78%] rounded-2xl px-3 py-2"
                  style={{
                    background: mine
                      ? 'rgba(184,160,200,0.18)'
                      : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${mine ? 'rgba(184,160,200,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div
                    dir="rtl"
                    className="text-[12.5px] text-white font-medium leading-snug"
                    style={{ fontFamily: 'Tajawal, sans-serif' }}
                  >
                    {t.ar}
                  </div>
                  <div
                    className="text-[10px] text-white/55 mt-0.5 leading-snug"
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {t.en}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* AI co-pilot chip */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(184,160,200,0.4)',
        }}
        animate={{ scale: [1, 1.04, 1] }}
        initial={{ scale: 1 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.span
          className="block w-1.5 h-1.5 rounded-full"
          style={{ background: '#88B8B0' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <span
          className="text-[10px] text-white font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          AI is co-piloting
        </span>
      </motion.div>
    </div>
  );
}
