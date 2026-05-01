import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DiamondMark } from '../Template';

export function Scene6Payoff() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),  // gold wash
      setTimeout(() => setPhase(2), 1200), // tagline
      setTimeout(() => setPhase(3), 4500), // lockup
      setTimeout(() => setPhase(4), 7500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gold wash */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 1.4 }}
        style={{
          background:
            'radial-gradient(80% 60% at 50% 50%, rgba(200,168,128,0.28), rgba(200,168,128,0.04) 50%, transparent 75%)',
        }}
      />

      {/* Subtle gold particles drifting up */}
      {phase >= 1 && (
        <>
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[3px] h-[3px] rounded-full"
              style={{
                background: '#C8A880',
                left: `${(i * 53) % 100}%`,
                top: '100%',
                boxShadow: '0 0 8px #C8A880',
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -800 - (i % 5) * 60, opacity: [0, 0.85, 0] }}
              transition={{
                duration: 5 + (i % 4) * 1.2,
                repeat: Infinity,
                delay: i * 0.18,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}

      {/* Tagline (top) */}
      <motion.div
        className="absolute top-[16vh] left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 20 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="text-[44px] leading-tight font-medium tracking-tight"
          dir="rtl"
          style={{
            fontFamily: '"IBM Plex Sans Arabic", sans-serif',
            background: 'linear-gradient(90deg, #C8A880, #B8A0C8, #88B8B0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          من الإشارة إلى التوقيع
        </div>
        <div
          className="text-[40px] leading-tight font-semibold mt-2"
          style={{
            fontFamily: 'Fraunces, serif',
            background: 'linear-gradient(90deg, #B8A0C8, #88B8B0, #C8A880)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          From signal to signature.
        </div>
        <div className="mt-3 text-[16px] opacity-75 tracking-[0.05em]">
          The Gulf's revenue OS · <span dir="rtl" style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>نظام الإيرادات للخليج</span>
        </div>
      </motion.div>

      {/* Final NexFlow lockup — diamond mark + wordmark */}
      <motion.div
        className="absolute bottom-[14vh] left-1/2 -translate-x-1/2 flex items-center gap-5"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: phase >= 3 ? 1 : 0, scale: phase >= 3 ? 1 : 0.85 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          animate={{ rotate: [0, 6, 0, -6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <DiamondMark size={96} />
        </motion.div>
        <div>
          <div
            className="text-[64px] leading-none font-black tracking-tight"
            style={{
              fontFamily: 'Fraunces, serif',
              background: 'linear-gradient(90deg, #B8A0C8, #88B8B0, #C8A880)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            NexFlow
          </div>
          <div className="text-[12px] uppercase tracking-[0.32em] opacity-70 mt-1">
            Orchestrating supreme market clarity
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
