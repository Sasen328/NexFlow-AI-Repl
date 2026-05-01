import { motion } from 'framer-motion';
import { DiamondMark } from '../Template';

const FEATURES = [
  { en: 'Voice Agents', ar: 'وكلاء صوتيون', color: '#B8A0C8', detail: 'Layla · Saif · Noura' },
  { en: 'Pipeline', ar: 'خط الصفقات', color: '#88B8B0', detail: 'Live deal velocity' },
  { en: 'Outreach', ar: 'التواصل', color: '#C8A880', detail: 'Email · WhatsApp · SMS' },
  { en: 'AI Briefings', ar: 'إحاطات الذكاء', color: '#C0A0B8', detail: 'Daily, in your dialect' },
  { en: 'Analytics', ar: 'التحليلات', color: '#B8B880', detail: 'Forecast · Attribution' },
];

export function Scene4Win() {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex items-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Diamond on left, slowly rotating */}
      <motion.div
        className="absolute"
        style={{ width: '28vw', height: '28vw', left: '6vw', top: '50%', marginTop: '-14vw' }}
        initial={{ scale: 1.05, opacity: 0.95, rotate: 0 }}
        animate={{ scale: [1.05, 1, 1.05], rotate: [0, 8, 0], opacity: 1 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <DiamondMark />
        {/* Glow */}
        <div
          className="absolute inset-[-15%] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(184,160,200,0.4), transparent 65%)',
            filter: 'blur(40px)',
            zIndex: -1,
          }}
        />
      </motion.div>

      {/* Eyebrow + headline */}
      <motion.div
        className="absolute top-[8vh] left-[42vw]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="text-white/55 uppercase tracking-[0.4em] text-[0.85vw]">
          NexFlow · Built for the Gulf
        </div>
        <div
          className="mt-2 text-white text-[2.2vw] font-light leading-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          One platform. <span style={{ color: '#88B8B0' }}>Five superpowers.</span>
        </div>
        <div
          className="mt-1 text-[1.05vw] opacity-80"
          dir="rtl"
          style={{
            color: '#d8cce0',
            fontFamily: "'IBM Plex Sans Arabic', system-ui",
          }}
        >
          منصة واحدة. خمس قدرات.
        </div>
      </motion.div>

      {/* Stacked feature rows expanding from diamond */}
      <div
        className="absolute"
        style={{
          left: '42vw',
          top: '50%',
          transform: 'translateY(-46%)',
          width: '50vw',
          marginTop: '4vh',
        }}
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.en}
            className="relative mb-[1.4vh]"
            initial={{ opacity: 0, x: -80, scaleX: 0.4 }}
            animate={{ opacity: 1, x: 0, scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.5 + i * 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ transformOrigin: 'left center' }}
          >
            <div
              className="rounded-xl flex items-center px-5"
              style={{
                height: '8.5vh',
                background: `linear-gradient(90deg, ${f.color}30, ${f.color}10 60%, transparent)`,
                border: `1px solid ${f.color}55`,
                boxShadow: `inset 4px 0 0 ${f.color}, 0 12px 30px -16px ${f.color}55`,
              }}
            >
              <div
                className="w-[1vw] h-[1vw] rounded-full mr-4 shrink-0"
                style={{
                  background: f.color,
                  boxShadow: `0 0 14px ${f.color}`,
                }}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="text-white text-[1.5vw] font-semibold leading-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {f.en}
                </div>
                <div
                  className="mt-1 opacity-70 text-[0.85vw]"
                  style={{ color: '#e8dff0' }}
                >
                  {f.detail}
                </div>
              </div>
              <div
                className="text-[1.4vw] ml-4 shrink-0"
                dir="rtl"
                style={{
                  color: f.color,
                  fontFamily: "'IBM Plex Sans Arabic', system-ui",
                  fontWeight: 600,
                }}
              >
                {f.ar}
              </div>
            </div>
            {/* Connector line back to diamond */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: '-7vw',
                top: '50%',
                width: '7vw',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${f.color}99)`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.4 + i * 0.32,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Continuous ambient particles around diamond */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '0.6vw',
            height: '0.6vw',
            background: ['#B8A0C8', '#88B8B0', '#C8A880', '#C0A0B8', '#B8B880'][i],
            left: '20vw',
            top: '50%',
            boxShadow: '0 0 10px currentColor',
          }}
          animate={{
            x: [0, Math.cos((i / 5) * Math.PI * 2) * 180, 0],
            y: [0, Math.sin((i / 5) * Math.PI * 2) * 180, 0],
            opacity: [0.2, 0.9, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}
    </motion.div>
  );
}
