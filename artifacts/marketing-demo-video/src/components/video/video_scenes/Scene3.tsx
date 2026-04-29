import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500), // English
      setTimeout(() => setPhase(2), 2500), // Arabic
      setTimeout(() => setPhase(3), 5000), // Image
      setTimeout(() => setPhase(4), 13500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center gap-8 px-12 z-10"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-1/2 flex flex-col gap-6">
        <motion.h2 
          className="text-[3vw] font-bold text-[#111827] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          From brief to creative in seconds.
        </motion.h2>
        
        <div className="flex gap-4">
          {/* English Email */}
          <motion.div 
            className="flex-1 glass-card rounded-2xl p-6 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          >
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-4" />
            <div className="h-2 w-full bg-gray-200 rounded mb-2" />
            <div className="h-2 w-5/6 bg-gray-200 rounded mb-2" />
            <div className="h-2 w-4/6 bg-gray-200 rounded" />
          </motion.div>

          {/* Arabic Email */}
          <motion.div 
            className="flex-1 glass-card rounded-2xl p-6 shadow-lg text-right"
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            dir="rtl"
          >
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-4 mr-0 ml-auto" />
            <div className="h-2 w-full bg-gray-200 rounded mb-2" />
            <div className="h-2 w-5/6 bg-gray-200 rounded mb-2 mr-0 ml-auto" />
            <div className="h-2 w-4/6 bg-gray-200 rounded mr-0 ml-auto" />
          </motion.div>
        </div>
      </div>

      {/* Image Gen */}
      <motion.div 
        className="w-1/2 h-[60vh] rounded-[2rem] overflow-hidden shadow-2xl relative bg-gray-200"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      >
        {phase >= 3 && (
          <motion.img 
            src={`${import.meta.env.BASE_URL}images/riyadh-skyline.png`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 2 }}
          />
        )}
        {phase < 3 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
