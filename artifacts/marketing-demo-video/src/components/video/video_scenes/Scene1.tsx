import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center px-12 z-20">
        <motion.h1 
          className="text-[5vw] font-bold text-[#111827] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Your funnel has leaks.
        </motion.h1>
        <motion.p 
          className="text-[2vw] text-gray-500 mt-4"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          Leads are stuck. Campaigns are scattered across 6 tools.
        </motion.p>
      </div>

      <motion.div 
        className="mt-16 relative w-[40vw] h-[30vh] border-x-4 border-b-4 border-gray-300 rounded-b-[4rem] overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gray-100/50" />
        
        {/* Avatars piling up */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 bg-[var(--color-primary)] rounded-full opacity-80"
            initial={{ y: -50, x: 50 + (i * 20 % 300) }}
            animate={phase >= 3 ? { 
              y: 150 - (i * 5),
              x: 100 + (i * 30 % 200) + Math.sin(i)*20
            } : { y: -50 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              delay: phase >= 3 ? i * 0.1 : 0 
            }}
          />
        ))}

        {/* Warning blink */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}
