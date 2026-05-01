import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CHIPS = [
  { label: 'Budget', value: 'Confirmed · SAR 240K', color: '#88B8B0', x: '18vw', y: '22vh' },
  { label: 'Pain', value: 'Legacy CRM', color: '#C0A0B8', x: '70vw', y: '20vh' },
  { label: 'Authority', value: 'VP Sales', color: '#B8A0C8', x: '14vw', y: '60vh' },
  { label: 'Next', value: 'Demo · Tue 3:00pm', color: '#C8A880', x: '74vw', y: '62vh' },
];

export function Scene4Intel() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 1900),
      setTimeout(() => setPhase(4), 2700),
      setTimeout(() => setPhase(5), 5400), // chips fly in
      setTimeout(() => setPhase(6), 7400), // deal card reveal
      setTimeout(() => setPhase(7), 9000), // amount counter
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  const dealCenter = { x: '50vw', y: '52vh' };

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Eyebrow */}
      <motion.div
        className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-[0.85vw] tracking-[0.6em] uppercase"
        style={{ color: 'rgba(184,160,200,0.85)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Intelligence · الذكاء
      </motion.div>

      {/* Chips — appear, hover, then fly to deal card */}
      {CHIPS.map((c, i) => {
        const appeared = phase >= 1 + i;
        const fly = phase >= 5;
        return (
          <motion.div
            key={c.label}
            className="absolute rounded-full backdrop-blur-md"
            style={{
              left: c.x,
              top: c.y,
              padding: '0.7vw 1.3vw',
              background: `${c.color}22`,
              border: `1px solid ${c.color}`,
              boxShadow: `0 8px 30px ${c.color}40, inset 0 0 20px ${c.color}22`,
            }}
            initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
            animate={
              fly
                ? {
                    opacity: 0,
                    scale: 0.3,
                    x: `calc(${dealCenter.x} - ${c.x})`,
                    y: `calc(${dealCenter.y} - ${c.y} + 4vh)`,
                  }
                : appeared
                ? { opacity: 1, scale: 1, x: 0, y: 0 }
                : { opacity: 0, scale: 0.4, x: 0, y: 0 }
            }
            transition={{
              duration: fly ? 0.9 : 0.6,
              ease: [0.16, 1, 0.3, 1],
              type: fly ? 'tween' : 'spring',
              stiffness: 220,
              damping: 18,
            }}
          >
            <div className="flex items-center gap-[0.7vw]">
              <span
                className="rounded-full"
                style={{
                  width: '0.6vw',
                  height: '0.6vw',
                  background: c.color,
                  boxShadow: `0 0 16px ${c.color}`,
                }}
              />
              <span
                className="text-[0.75vw] uppercase tracking-[0.35em]"
                style={{ color: c.color }}
              >
                {c.label}
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '1.1vw',
                  color: '#F1ECF4',
                }}
              >
                {c.value}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Opportunity Created deal card */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-3xl p-[1.8vw] backdrop-blur-md text-center"
        style={{
          translateX: '-50%',
          translateY: '-50%',
          width: '34vw',
          background:
            'linear-gradient(135deg, rgba(184,160,200,0.2), rgba(136,184,176,0.15), rgba(200,168,128,0.15))',
          border: '1.5px solid rgba(184,160,200,0.5)',
          boxShadow:
            '0 40px 100px rgba(184,160,200,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
        initial={{ opacity: 0, scale: 0.7, y: '0%' }}
        animate={
          phase >= 6
            ? { opacity: 1, scale: 1, y: '0%' }
            : { opacity: 0, scale: 0.7 }
        }
        transition={{
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
          type: 'spring',
          stiffness: 180,
          damping: 18,
        }}
      >
        <motion.div
          className="text-[0.75vw] uppercase tracking-[0.5em]"
          style={{ color: '#88B8B0' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          Opportunity Created · فرصة جديدة
        </motion.div>
        <div
          className="mt-[0.8vw]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 500,
            fontSize: '2.2vw',
            color: '#F1ECF4',
          }}
        >
          Tharwah Logistics
        </div>
        <div
          dir="rtl"
          className="mt-[0.2vw]"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontSize: '1.1vw',
            color: 'rgba(241,236,244,0.65)',
          }}
        >
          ثروة للخدمات اللوجستية
        </div>

        <div className="mt-[1.3vw] flex items-baseline justify-center gap-[0.5vw]">
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '0.9vw',
              color: '#C8A880',
            }}
          >
            SAR
          </span>
          <motion.span
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: '3.2vw',
              color: '#F1ECF4',
            }}
            initial={{ opacity: 0 }}
            animate={phase >= 7 ? { opacity: 1 } : { opacity: 0 }}
          >
            240,000
          </motion.span>
        </div>

        <div
          className="mt-[1vw] inline-flex items-center gap-[0.6vw] px-[1vw] py-[0.4vw] rounded-full"
          style={{
            background: 'rgba(136,184,176,0.18)',
            border: '1px solid rgba(136,184,176,0.5)',
          }}
        >
          <motion.span
            className="rounded-full"
            style={{
              width: '0.5vw',
              height: '0.5vw',
              background: '#88B8B0',
              boxShadow: '0 0 12px #88B8B0',
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span
            className="text-[0.85vw] uppercase tracking-[0.3em]"
            style={{ color: '#88B8B0' }}
          >
            Stage · Demo Scheduled
          </span>
        </div>
      </motion.div>

      {/* Concentric pulse rings around the deal card on reveal */}
      {[0, 1, 2].map((r) => (
        <motion.div
          key={r}
          className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
          style={{
            translateX: '-50%',
            translateY: '-50%',
            width: '34vw',
            height: '20vw',
            border: '1px solid rgba(184,160,200,0.5)',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={
            phase >= 6
              ? { opacity: [0, 0.6, 0], scale: [0.9, 1.4, 1.7] }
              : { opacity: 0 }
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: r * 0.6,
            ease: 'easeOut',
          }}
        />
      ))}
    </motion.div>
  );
}
