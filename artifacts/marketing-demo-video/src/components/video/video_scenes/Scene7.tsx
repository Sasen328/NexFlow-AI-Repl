import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function Counter({ from, to, format, duration = 2 }: { from: number, to: number, format: (n: number) => string, duration?: number }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let start = from;
    const end = to;
    const startTime = performance.now();
    
    const animateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(start + (end - start) * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };
    requestAnimationFrame(animateCount);
  }, [from, to, duration]);

  return <>{format(count)}</>;
}

export function Scene7() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500), // stats appear
      setTimeout(() => setPhase(3), 10000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const stats = [
    { label: "Open rate", value: 47, format: (n: number) => `${Math.round(n)}%` },
    { label: "Reply rate", value: 18, format: (n: number) => `${Math.round(n)}%` },
    { label: "Pipeline added", value: 284000, format: (n: number) => `$${Math.round(n).toLocaleString()}` },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-6xl px-12 flex flex-col md:flex-row items-center gap-20">
        
        {/* Funnel SVG */}
        <div className="flex-1 flex justify-center relative h-[60vh]">
          <motion.div 
            className="w-full h-full relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 1 }}
          >
            <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="none">
              <defs>
                <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path 
                d="M 0,0 L 400,0 L 280,200 L 280,400 L 120,400 L 120,200 Z" 
                fill="url(#funnelGrad)"
                stroke="white"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
              
              {/* Particle flow */}
              {phase >= 1 && Array.from({ length: 20 }).map((_, i) => (
                <motion.circle
                  key={i}
                  r="6"
                  fill="white"
                  initial={{ cy: -20, cx: 200 + (Math.random() * 200 - 100) }}
                  animate={{ 
                    cy: [0, 200, 400, 620], 
                    cx: [
                      200 + (Math.random() * 200 - 100), 
                      200 + (Math.random() * 80 - 40),
                      200 + (Math.random() * 40 - 20),
                      200 + (Math.random() * 40 - 20)
                    ],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "linear"
                  }}
                />
              ))}
            </svg>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-10">
          <motion.h2 
            className="text-[4vw] font-bold text-[#111827] leading-tight mb-8"
            style={{ fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, x: 30 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8 }}
          >
            Pipeline, unstuck.
          </motion.h2>

          <div className="space-y-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="glass-card bg-white/70 p-6 rounded-2xl border border-white shadow-lg"
                initial={{ opacity: 0, x: 30 }}
                animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.6, delay: phase >= 2 ? i * 0.2 : 0 }}
              >
                <p className="text-gray-500 font-medium mb-1 text-lg">{stat.label}</p>
                <div className="text-5xl font-black text-[var(--color-primary)]" style={{ fontFamily: 'var(--font-display)' }}>
                  {phase >= 2 ? <Counter from={0} to={stat.value} format={stat.format} duration={2.5} /> : '0'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
