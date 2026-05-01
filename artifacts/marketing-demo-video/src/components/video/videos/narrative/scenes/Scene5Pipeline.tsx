import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

const STAGES = [
  { en: 'Discovery',   ar: 'اكتشاف',   tint: '#B8A0C8' },
  { en: 'Demo',        ar: 'عرض',       tint: '#90B8B8' },
  { en: 'Proposal',    ar: 'عرض سعر',   tint: '#B8B880' },
  { en: 'Negotiation', ar: 'تفاوض',     tint: '#C0A0B8' },
  { en: 'Closed-Won',  ar: 'مغلق-فوز',  tint: '#88B8B0' },
];

export function Scene5Pipeline() {
  const [phase, setPhase] = useState(0);
  const value = useMotionValue(0);
  const display = useTransform(value, (v) => {
    const n = Math.round(v);
    return n.toLocaleString('en-US');
  });

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200), // pipeline rail draws
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setPhase(4), 5400),
      setTimeout(() => setPhase(5), 7800),
      setTimeout(() => setPhase(6), 10500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase >= 1) {
      const controls = animate(value, 1250000, { duration: 9.5, ease: [0.22, 1, 0.36, 1] });
      return () => controls.stop();
    }
    return undefined;
  }, [phase, value]);

  const activeStage = Math.max(0, Math.min(STAGES.length - 1, phase - 1));

  return (
    <motion.div
      className="absolute inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center">
        <div className="text-[10px] uppercase tracking-[0.4em] opacity-50">05 · The Pipeline</div>
        <div
          className="text-[12px] mt-1 opacity-45"
          dir="rtl"
          style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        >
          خط المبيعات
        </div>
      </div>

      {/* Pipeline rail */}
      <div className="absolute left-[6vw] right-[6vw] top-[24vh]">
        <div className="relative h-[2px] rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #B8A0C8, #90B8B8, #B8B880, #C0A0B8, #88B8B0)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${(activeStage / (STAGES.length - 1)) * 100}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          {STAGES.map((s, i) => {
            const reached = i <= activeStage;
            return (
              <div
                key={i}
                className="absolute -translate-x-1/2"
                style={{ left: `${(i / (STAGES.length - 1)) * 100}%`, top: '-12px' }}
              >
                <motion.div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: reached ? s.tint : 'rgba(255,255,255,0.12)',
                    boxShadow: reached ? `0 0 18px ${s.tint}` : 'none',
                  }}
                  animate={{ scale: i === activeStage ? [1, 1.25, 1] : 1 }}
                  transition={{ duration: 0.7, repeat: i === activeStage ? Infinity : 0, ease: 'easeInOut' }}
                >
                  <div className="w-2 h-2 rounded-full bg-white/90" />
                </motion.div>
                <div
                  className="absolute top-9 left-1/2 -translate-x-1/2 text-center"
                  style={{ minWidth: 110 }}
                >
                  <div
                    className="text-[12px] font-semibold whitespace-nowrap"
                    style={{ color: reached ? s.tint : 'rgba(255,255,255,0.45)' }}
                  >
                    {s.en}
                  </div>
                  <div
                    className="text-[10px] opacity-60 whitespace-nowrap"
                    dir="rtl"
                    style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
                  >
                    {s.ar}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline value ticker — bottom */}
      <motion.div
        className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <div className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2">
          Pipeline value · <span dir="rtl" style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>قيمة الصفقة</span>
        </div>
        <div className="flex items-baseline gap-3 justify-center">
          <span
            className="text-[28px] opacity-70"
            style={{ fontFamily: 'Fraunces, serif' }}
            dir="rtl"
          >
            ر.س
          </span>
          <motion.span
            className="text-[88px] font-black leading-none tabular-nums"
            style={{
              fontFamily: 'Fraunces, serif',
              background: 'linear-gradient(135deg, #88B8B0, #C8A880)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {display}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}
