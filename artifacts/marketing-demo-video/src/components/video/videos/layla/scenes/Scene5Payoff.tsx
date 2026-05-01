import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5Payoff() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1300),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4500),
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
      {/* Hero diamond chameleon mark */}
      <motion.img
        src={`${import.meta.env.BASE_URL}layla/logo_mark_hires.svg`}
        alt=""
        className="absolute"
        style={{
          width: '14vw',
          height: '14vw',
          top: '14vh',
          left: '50%',
          translateX: '-50%',
        }}
        initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
        animate={
          phase >= 1
            ? { opacity: 1, scale: 1, rotate: 0 }
            : { opacity: 0, scale: 0.6, rotate: -30 }
        }
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Pulsing halo */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '22vw',
          height: '22vw',
          top: '10vh',
          left: '50%',
          translateX: '-50%',
          background:
            'radial-gradient(circle, rgba(184,160,200,0.4), transparent 65%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [0.9, 1.15, 0.95, 1.1, 0.9] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* AR + EN tagline */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ top: '46vh' }}
      >
        <motion.div
          dir="rtl"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 600,
            fontSize: '4.4vw',
            color: '#F1ECF4',
            lineHeight: 1.05,
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          ليلى تعمل بينما تنام
        </motion.div>
        <motion.div
          className="mt-[0.6vw]"
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: '2.4vw',
            color: 'rgba(241,236,244,0.85)',
          }}
          initial={{ opacity: 0, y: 14 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={{ duration: 0.6 }}
        >
          Layla works while you sleep.
        </motion.div>
      </div>

      {/* Powered by NexFlow lockup */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 text-center"
        style={{ bottom: '12vh' }}
        initial={{ opacity: 0, y: 12 }}
        animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="text-[0.85vw] uppercase tracking-[0.6em]"
          style={{ color: 'rgba(241,236,244,0.55)' }}
        >
          Powered by
        </div>
        <div
          className="mt-[0.5vw] nf-chameleon-text"
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: '3vw',
            background:
              'linear-gradient(90deg, #B8A0C8, #88B8B0, #C8A880, #C0A0B8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          NexFlow
        </div>
      </motion.div>

      {/* Drifting accents to keep frames alive */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '0.6vw',
          height: '0.6vw',
          background: '#88B8B0',
          left: '20vw',
          top: '30vh',
          boxShadow: '0 0 20px #88B8B0',
        }}
        animate={{ x: [0, 40, 0], y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '0.5vw',
          height: '0.5vw',
          background: '#C8A880',
          right: '22vw',
          top: '38vh',
          boxShadow: '0 0 20px #C8A880',
        }}
        animate={{ x: [0, -30, 0], y: [0, 24, 0], opacity: [0.4, 0.95, 0.4] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
