import { motion } from 'framer-motion';
import { StatusBar } from '../Phone';

const notifs = [
  {
    tag: 'Signal',
    tone: '#88B8B0',
    ar: 'تم رصد إشارة قوية: ARAMCO Digital',
    en: 'Strong signal detected · ARAMCO Digital',
    meta: 'now',
  },
  {
    tag: 'Renewal',
    tone: '#C8A880',
    ar: 'تنبيه تجديد: e& Enterprise — ٢٢ يومًا',
    en: 'Renewal due · e& Enterprise · 22 days',
    meta: '2m',
  },
  {
    tag: 'Layla',
    tone: '#B8A0C8',
    ar: 'ليلى لخّصت ٤ مكالمات اليوم',
    en: 'Layla summarised 4 calls today',
    meta: '5m',
  },
  {
    tag: 'Pipeline',
    tone: '#B8B880',
    ar: 'صفقة STC Pay تقدّمت إلى Proposal',
    en: 'STC Pay moved to Proposal',
    meta: '8m',
  },
];

export function SceneNotifs() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, #0c0810 0%, #1a1322 60%, #2a1c34 100%)',
      }}
    >
      <StatusBar tone="light" />

      {/* Lockscreen time */}
      <div className="absolute top-[58px] left-0 right-0 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[12px] text-white/60 uppercase tracking-[0.28em]"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          Tuesday · 09:41
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-white text-[64px] font-light leading-none mt-1 tabular-nums"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          9:41
        </motion.div>
      </div>

      {/* Notification stack */}
      <div className="absolute top-[230px] left-0 right-0 px-3 space-y-2">
        {notifs.map((n, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 280,
              damping: 26,
              delay: 0.25 + i * 0.32,
            }}
            className="rounded-2xl px-3 py-2.5 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: `0 6px 24px rgba(0,0,0,0.35), inset 0 0 0 1px ${n.tone}33`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${n.tone}, ${n.tone}aa)`,
                  boxShadow: `0 4px 12px ${n.tone}66`,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L13.6 8.6L20.5 9.2L15.2 13.7L17 20.5L12 16.7L7 20.5L8.8 13.7L3.5 9.2L10.4 8.6L12 2Z"
                    fill="#fff"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div
                    className="text-[10px] uppercase tracking-[0.16em] font-bold"
                    style={{ color: n.tone, fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    NexFlow · {n.tag}
                  </div>
                  <div className="text-[9.5px] text-white/45 tabular-nums">{n.meta}</div>
                </div>
                <div
                  dir="rtl"
                  className="text-[12.5px] text-white font-semibold mt-0.5 leading-snug"
                  style={{ fontFamily: 'Tajawal, sans-serif' }}
                >
                  {n.ar}
                </div>
                <div
                  className="text-[10.5px] text-white/65 mt-0.5 leading-snug"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {n.en}
                </div>
              </div>
            </div>

            {/* Tone shimmer */}
            <motion.div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(110deg, transparent 40%, ${n.tone}33 50%, transparent 60%)`,
              }}
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.6,
                delay: 0.5 + i * 0.32,
                ease: 'easeOut',
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
