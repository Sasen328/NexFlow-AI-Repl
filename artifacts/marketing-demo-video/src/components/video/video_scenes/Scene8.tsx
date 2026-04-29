import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene8() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 8500), // Clean static frame hold
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#111827]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video 
          src={`${import.meta.env.BASE_URL}videos/abstract-bg.mp4`}
          className="w-full h-full object-cover opacity-15"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Subtle overlay gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-[#111827] opacity-80" />
      </div>

      <div className="z-10 flex flex-col items-center text-center">
        <motion.div
          className="relative overflow-hidden p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <h1 
            className="text-[10vw] font-black leading-none chameleon-gradient text-transparent bg-clip-text relative z-10"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            NexFlow
          </h1>
          
          {/* Shimmer sweep effect */}
          {phase >= 2 && phase < 3 && (
            <motion.div
              className="absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] z-20 pointer-events-none mix-blend-overlay"
              initial={{ left: '-100%' }}
              animate={{ left: '200%' }}
              transition={{ duration: 2, ease: "easeInOut", repeat: 1, repeatDelay: 3 }}
            />
          )}
        </motion.div>

        <motion.p
          className="text-[2vw] text-gray-300 mt-6 font-medium tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Marketing that moves. Native to the GCC. Powered by AI.
        </motion.p>
      </div>

    </motion.div>
  );
}
