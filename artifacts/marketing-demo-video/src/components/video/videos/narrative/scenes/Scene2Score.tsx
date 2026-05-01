import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

const CHIPS: { en: string; ar: string; tint: string }[] = [
  { en: 'New CFO · 3 weeks ago', ar: 'مدير مالي جديد · قبل ٣ أسابيع', tint: '#B8A0C8' },
  { en: 'Hiring 4 SDRs', ar: 'توظيف ٤ مندوبي مبيعات', tint: '#88B8B0' },
  { en: 'Tech budget +40%', ar: 'ميزانية التقنية ٤٠٪+', tint: '#C8A880' },
];

export function Scene2Score() {
  const [phase, setPhase] = useState(0);
  const score = useMotionValue(0);
  const display = useTransform(score, (v) => Math.round(v).toString());

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),  // ring + label
      setTimeout(() => setPhase(2), 800),  // start counting
      setTimeout(() => setPhase(3), 3200), // chips
      setTimeout(() => setPhase(4), 6400),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase >= 2) {
      const controls = animate(score, 94, { duration: 2.4, ease: [0.22, 1, 0.36, 1] });
      return () => controls.stop();
    }
    return undefined;
  }, [phase, score]);

  return (
    <motion.div
      className="absolute inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center">
        <div className="text-[10px] uppercase tracking-[0.4em] opacity-50">02 · The Score</div>
        <div
          className="text-[12px] mt-1 opacity-45"
          dir="rtl"
          style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        >
          النتيجة
        </div>
      </div>

      {/* Score ring on left */}
      <div className="absolute left-[12vw] top-1/2 -translate-y-1/2">
        <ScoreRing phase={phase} display={display} />
      </div>

      {/* Chips column on right */}
      <div className="absolute right-[8vw] top-1/2 -translate-y-1/2 w-[26vw] min-w-[280px] max-w-[420px] space-y-3">
        {CHIPS.map((c, i) => {
          const visible = phase >= 3;
          return (
            <motion.div
              key={i}
              className="rounded-xl px-4 py-3"
              style={{
                background: `linear-gradient(90deg, ${c.tint}22, ${c.tint}08)`,
                border: `1px solid ${c.tint}55`,
                boxShadow: `0 6px 24px ${c.tint}22`,
              }}
              initial={{ opacity: 0, x: 30, scale: 0.96 }}
              animate={visible ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 30, scale: 0.96 }}
              transition={{ duration: 0.5, delay: visible ? i * 0.25 : 0, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 rounded-full" style={{ background: c.tint }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold leading-tight">{c.en}</div>
                  <div
                    className="text-[12px] opacity-75 leading-tight mt-0.5"
                    dir="rtl"
                    style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
                  >
                    {c.ar}
                  </div>
                </div>
                <div className="text-[11px] font-bold opacity-80" style={{ color: c.tint }}>
                  +{[18, 22, 24][i]}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* The dot landing on the card — incoming from upper-right corner of frame */}
      <motion.div
        className="absolute w-4 h-4 rounded-full z-30"
        style={{ background: '#B8B880', boxShadow: '0 0 28px #B8B880' }}
        initial={{ left: '90vw', top: '12vh', opacity: 1, scale: 1.2 }}
        animate={{
          left: ['90vw', '50vw'],
          top: ['12vh', '50vh'],
          opacity: [1, 0],
          scale: [1.2, 0.4],
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}

function ScoreRing({ phase, display }: { phase: number; display: any }) {
  const size = 280;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B8A0C8" />
            <stop offset="50%" stopColor="#88B8B0" />
            <stop offset="100%" stopColor="#C8A880" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: phase >= 2 ? c * (1 - 0.94) : c }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[11px] uppercase tracking-[0.3em] opacity-60">AI Score</div>
        <motion.div
          className="text-[88px] font-black leading-none"
          style={{
            fontFamily: 'Fraunces, serif',
            background: 'linear-gradient(135deg, #B8A0C8, #88B8B0, #C8A880)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {display}
        </motion.div>
        <div
          className="text-[12px] opacity-60 mt-1"
          dir="rtl"
          style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        >
          درجة الذكاء الاصطناعي
        </div>
      </div>
    </div>
  );
}
