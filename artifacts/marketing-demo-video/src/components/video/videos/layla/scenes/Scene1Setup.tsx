import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1Setup() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 3000),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-[6vw]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Eyebrow */}
      <motion.div
        className="absolute top-[10vh] left-1/2 -translate-x-1/2 text-[0.85vw] tracking-[0.6em] uppercase"
        style={{ color: 'rgba(184,160,200,0.85)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.6 }}
      >
        NexFlow Voice · مساعد المبيعات
      </motion.div>

      {/* Title block – Arabic + English */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ top: '14vh' }}
      >
        <motion.div
          dir="rtl"
          className="leading-none"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 600,
            fontSize: '5vw',
            color: '#F1ECF4',
            letterSpacing: '-0.01em',
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          تعرّف على ليلى
        </motion.div>
        <motion.div
          className="mt-[0.6vw]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: '2.4vw',
            color: 'rgba(241,236,244,0.7)',
            letterSpacing: '0.02em',
            fontStyle: 'italic',
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6 }}
        >
          Meet Layla
        </motion.div>
      </div>

      {/* Subtitle below the waveform */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ bottom: '18vh', maxWidth: '60vw' }}
        initial={{ opacity: 0, y: 18 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.7 }}
      >
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 300,
            fontSize: '1.6vw',
            color: 'rgba(241,236,244,0.92)',
            letterSpacing: '0.005em',
          }}
        >
          Native Khaleeji Arabic. Trained on the Gulf B2B sales motion.
        </div>
        <div
          dir="rtl"
          className="mt-[0.5vw]"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 400,
            fontSize: '1.05vw',
            color: 'rgba(184,160,200,0.75)',
          }}
        >
          عربية خليجية أصيلة · مدرَّبة على مبيعات B2B في الخليج
        </div>
      </motion.div>

      {/* Slow drifting accent dot to keep frames moving */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '0.8vw',
          height: '0.8vw',
          background: '#88B8B0',
          left: '12vw',
          bottom: '12vh',
          boxShadow: '0 0 20px #88B8B0',
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '0.6vw',
          height: '0.6vw',
          background: '#C8A880',
          right: '14vw',
          top: '24vh',
          boxShadow: '0 0 20px #C8A880',
        }}
        animate={{ x: [0, -20, 0], y: [0, 16, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
