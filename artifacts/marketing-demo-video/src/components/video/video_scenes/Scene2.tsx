import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);
  const text = "Re-engage 247 leads stuck in 'Engaged' stage";

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000), // Typing starts
      setTimeout(() => setPhase(3), 5000), // AI responds
      setTimeout(() => setPhase(4), 10500), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-[60vw] glass-card rounded-[2rem] p-8 flex flex-col gap-6 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-gray-200/50 pb-4">
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">AI</div>
          <h2 className="text-[1.5vw] font-semibold">Marketing Assistant</h2>
        </div>

        <div className="flex flex-col gap-6 h-[40vh] overflow-hidden">
          {/* User message */}
          <motion.div 
            className="self-end bg-[var(--color-foreground)] text-white px-6 py-4 rounded-2xl rounded-tr-sm max-w-[80%]"
            initial={{ opacity: 0, x: 20 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          >
            <p className="text-[1.2vw]">
              {phase >= 2 ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 2, ease: "linear" }}
                >
                  {text}
                </motion.span>
              ) : ""}
            </p>
          </motion.div>

          {/* AI Response */}
          {phase >= 3 && (
            <motion.div 
              className="self-start glass-card px-6 py-4 rounded-2xl rounded-tl-sm max-w-[80%]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring" }}
            >
              <p className="text-[1.2vw] font-medium mb-2">I've generated a 3-step strategy:</p>
              <ul className="list-disc pl-5 text-[1vw] text-gray-700 flex flex-col gap-2">
                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Drafting bilingual email sequence</motion.li>
                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>Generating custom Riyadh skyline hero image</motion.li>
                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>Preparing WhatsApp fallback</motion.li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
