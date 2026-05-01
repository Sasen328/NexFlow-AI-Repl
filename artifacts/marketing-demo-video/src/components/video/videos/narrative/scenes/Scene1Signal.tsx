import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1Signal() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),  // ticker rolls in
      setTimeout(() => setPhase(2), 1800), // headline locks
      setTimeout(() => setPhase(3), 3500), // dot detaches
      setTimeout(() => setPhase(4), 5200), // signal feed appears
      setTimeout(() => setPhase(5), 6800), // exit prep
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background — Riyadh skyline silhouette */}
      <SkylineSilhouette />

      {/* Scene label */}
      <div className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center">
        <motion.div
          className="text-[10px] uppercase tracking-[0.4em] opacity-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          01 · The Signal
        </motion.div>
        <motion.div
          className="text-[12px] mt-1 opacity-40"
          dir="rtl"
          style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          الإشارة
        </motion.div>
      </div>

      {/* Reuters-style ticker */}
      <motion.div
        className="absolute left-0 right-0 top-[36vh] h-[120px] flex items-center"
        style={{
          background:
            'linear-gradient(90deg, rgba(31,26,36,0.6), rgba(184,184,128,0.18) 40%, rgba(184,184,128,0.18) 60%, rgba(31,26,36,0.6))',
          borderTop: '1px solid rgba(184,184,128,0.35)',
          borderBottom: '1px solid rgba(184,184,128,0.35)',
          backdropFilter: 'blur(6px)',
        }}
        initial={{ x: '-100%' }}
        animate={{ x: phase >= 1 ? '0%' : '-100%' }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-8 px-10 w-full">
          <div
            className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ background: '#B8B880', color: '#1F1A24' }}
          >
            MENA Wire · Live
          </div>

          <motion.div
            className="flex items-baseline gap-6 flex-1"
            animate={{ x: phase >= 2 ? 0 : 30, opacity: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="text-[28px] font-semibold tracking-tight"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              ACME Industries closes Series B · Riyadh
            </div>
          </motion.div>

          {/* The glowing dot */}
          <motion.div
            className="relative shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: phase >= 2 ? 1 : 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <motion.div
              className="w-4 h-4 rounded-full"
              style={{ background: '#B8B880', boxShadow: '0 0 24px #B8B880' }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Arabic mirror line */}
      <motion.div
        className="absolute left-0 right-0 top-[calc(36vh+120px+12px)] text-center text-[18px] opacity-80"
        dir="rtl"
        style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: phase >= 2 ? 0.85 : 0, y: phase >= 2 ? 0 : 8 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        أكمي تُتم الجولة B في الرياض
      </motion.div>

      {/* Detaching dot — travels from ticker to NexFlow signal feed */}
      <motion.div
        className="absolute w-4 h-4 rounded-full z-30"
        style={{ background: '#B8B880', boxShadow: '0 0 36px #B8B880, 0 0 80px #C8A88066' }}
        initial={{ left: '92vw', top: 'calc(36vh + 60px)', opacity: 0 }}
        animate={
          phase >= 3
            ? {
                left: ['92vw', '50vw', '20vw'],
                top: ['calc(36vh + 60px)', '60vh', '70vh'],
                opacity: [0, 1, 1],
                scale: [1, 1.4, 1],
              }
            : { opacity: 0, left: '92vw', top: 'calc(36vh + 60px)' }
        }
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* trailing arc — drawn line from ticker to feed */}
      <svg
        className="absolute inset-0 z-20 pointer-events-none"
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 1760 450 Q 1200 700 380 760"
          fill="none"
          stroke="#B8B880"
          strokeWidth="1.6"
          strokeDasharray="6 8"
          opacity={0.7}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
      </svg>

      {/* NexFlow signal feed (lower-left) */}
      <motion.div
        className="absolute left-[6vw] bottom-[12vh] w-[34vw] min-w-[360px] max-w-[520px] rounded-2xl p-4 z-25"
        style={{
          background: 'rgba(250,247,244,0.06)',
          border: '1px solid rgba(184,160,200,0.35)',
          backdropFilter: 'blur(8px)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase >= 4 ? 1 : 0, y: phase >= 4 ? 0 : 20 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#B8B880', boxShadow: '0 0 10px #B8B880' }}
          />
          <div className="text-[11px] uppercase tracking-[0.25em] opacity-70">
            NexFlow · Signals
          </div>
          <div className="ml-auto text-[10px] opacity-50">just now</div>
        </div>
        <FeedRow tint="#B8B880" label="Funding · Series B" sub="ACME Industries · ر.س 1.2B" delay={4.4} phase={phase} />
        <FeedRow tint="#88B8B0" label="Hiring spike" sub="4 SDR roles · LinkedIn" delay={4.7} phase={phase} />
        <FeedRow tint="#C8A880" label="Tech budget +40%" sub="ACME · annual report" delay={5.0} phase={phase} />
      </motion.div>
    </motion.div>
  );
}

function FeedRow({
  tint, label, sub, delay, phase,
}: { tint: string; label: string; sub: string; delay: number; phase: number }) {
  const visible = phase >= 4;
  return (
    <motion.div
      className="flex items-center gap-3 py-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -10 }}
      transition={{ duration: 0.5, delay: visible ? delay - 4.4 : 0 }}
    >
      <div className="w-1 h-8 rounded-full" style={{ background: tint }} />
      <div>
        <div className="text-[13px] font-semibold">{label}</div>
        <div className="text-[11px] opacity-60">{sub}</div>
      </div>
    </motion.div>
  );
}

function SkylineSilhouette() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full"
      style={{ height: '32vh', opacity: 0.4 }}
      viewBox="0 0 1920 400"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="skygrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F1A24" stopOpacity="0" />
          <stop offset="100%" stopColor="#15111A" stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <path
        d="M0 400 V 280 L 80 270 L 100 260 L 130 250 L 160 250 L 200 230 L 240 220 L 260 210 L 290 195 L 320 180 L 360 175 L 400 165
           L 440 145 L 470 125 L 510 105 L 540 88 L 580 80 L 620 80 L 660 95 L 700 110 L 740 125 L 780 140 L 820 145 L 860 138 L 900 130
           L 940 120 L 990 110 L 1040 100 L 1080 95 L 1120 100 L 1170 95 L 1210 75 L 1250 60 L 1290 50 L 1330 60 L 1370 80 L 1410 100
           L 1460 130 L 1500 145 L 1540 165 L 1580 180 L 1620 195 L 1660 215 L 1700 230 L 1740 245 L 1780 255 L 1820 265 L 1860 275
           L 1920 280 V 400 Z"
        fill="url(#skygrad)"
      />
      {/* Kingdom Tower hint */}
      <path d="M1290 50 L 1310 50 L 1305 30 L 1300 25 L 1295 30 Z" fill="#15111A" opacity="0.95" />
    </svg>
  );
}
