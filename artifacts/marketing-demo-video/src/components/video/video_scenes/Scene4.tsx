import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';

export function Scene4() {
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000), // filters appear
      setTimeout(() => {
        setPhase(3);
        // Animate counter
        let start = 0;
        const end = 1847;
        const duration = 2000;
        const startTime = performance.now();
        
        const animateCount = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // easeOutExpo
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setCount(Math.floor(start + (end - start) * easeProgress));
          if (progress < 1) {
            requestAnimationFrame(animateCount);
          }
        };
        requestAnimationFrame(animateCount);
      }, 5000), // counter animates
      setTimeout(() => setPhase(4), 10500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const filters = [
    "Industry: Fintech",
    "Country: KSA 🇸🇦",
    "Lead stage: Engaged",
    "Last activity > 14d"
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-4xl px-8 flex flex-col md:flex-row gap-12 items-center">
        
        <div className="flex-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[3vw] font-bold text-[#111827] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Pinpoint your audience
            </h2>
          </motion.div>

          <motion.div 
            className="dark-glass-card p-6 rounded-2xl border border-white/20 shadow-xl bg-[#111827]/80 backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6 text-white/80 pb-4 border-b border-white/10">
              <Filter className="w-5 h-5" />
              <span className="font-medium tracking-wide">Build Segment</span>
            </div>
            
            <div className="space-y-3">
              {filters.map((filter, i) => (
                <motion.div
                  key={i}
                  className="bg-white/10 border border-white/5 rounded-lg px-4 py-3 text-white/90 text-sm font-medium"
                  initial={{ opacity: 0, x: -20 }}
                  animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: phase >= 2 ? i * 0.3 : 0 }}
                >
                  {filter}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 1, type: "spring" }}
          >
            {/* Glowing background behind counter */}
            <div className="absolute inset-0 bg-[var(--color-primary)] opacity-20 blur-[60px] rounded-full" />
            
            <div className="text-center relative z-10">
              <h3 
                className="text-[8vw] font-black leading-none chameleon-gradient text-transparent bg-clip-text"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {count.toLocaleString()}
              </h3>
              <motion.p 
                className="text-[1.5vw] text-gray-600 mt-2 font-medium tracking-wide uppercase"
                initial={{ opacity: 0 }}
                animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Live segment count
              </motion.p>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
