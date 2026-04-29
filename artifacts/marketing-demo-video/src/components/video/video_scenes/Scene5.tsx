import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Mail, MessageCircle, Linkedin, Instagram, Twitter, Globe, Music, Send } from 'lucide-react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000), // lights up pills
      setTimeout(() => setPhase(3), 4500), // shoots lines
      setTimeout(() => setPhase(4), 7000), // caption
      setTimeout(() => setPhase(5), 8500), // out
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const platforms = [
    { icon: Mail, label: 'Email', angle: 0 },
    { icon: MessageCircle, label: 'WhatsApp', angle: 51.4 },
    { icon: Linkedin, label: 'LinkedIn', angle: 102.8 },
    { icon: Instagram, label: 'Instagram', angle: 154.2 },
    { icon: Twitter, label: 'X', angle: 205.6 },
    { icon: Globe, label: 'Google Ads', angle: 257 },
    { icon: Music, label: 'TikTok', angle: 308.4 },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative w-full h-[60vh] flex items-center justify-center mt-[-5vh]">
        {/* Center Hub */}
        <motion.div 
          className="glass-card p-8 rounded-full border border-white/40 shadow-2xl bg-white/60 backdrop-blur-xl z-20 flex flex-col items-center justify-center w-48 h-48 relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={phase >= 1 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Send className="w-10 h-10 text-[var(--color-primary)] mb-2" />
          <span className="font-bold text-gray-800 text-lg">Publish Hub</span>
          
          {/* Subtle pulse */}
          <motion.div
            className="absolute inset-0 border-2 border-[var(--color-primary)] rounded-full"
            animate={phase >= 3 ? { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] } : { scale: 1, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Orbiting Platforms */}
        {platforms.map((plat, i) => {
          const radius = 250; // px
          const rad = (plat.angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          const Icon = plat.icon;

          return (
            <div key={i} className="absolute top-1/2 left-1/2" style={{ transform: `translate(${x}px, ${y}px)` }}>
              {/* Connecting Line */}
              <svg className="absolute top-1/2 left-1/2 w-0 h-0 overflow-visible z-0 pointer-events-none">
                {phase >= 3 && (
                  <motion.line
                    x1="0" y1="0"
                    x2={-x} y2={-y}
                    stroke="var(--color-secondary)"
                    strokeWidth="3"
                    strokeDasharray="5 5"
                    initial={{ strokeDashoffset: 100, opacity: 0 }}
                    animate={{ strokeDashoffset: 0, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                  />
                )}
              </svg>

              {/* Node */}
              <motion.div
                className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={phase >= 2 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: phase >= 2 ? i * 0.15 : 0 }}
              >
                <Icon className="w-7 h-7 text-gray-600" />
                
                {/* Active glow */}
                <motion.div
                  className="absolute inset-0 bg-[var(--color-secondary)] rounded-full z-[-1]"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={phase >= 3 ? { opacity: [0, 0.4, 0], scale: [1, 1.4, 1] } : { opacity: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                />
              </motion.div>
            </div>
          );
        })}
      </div>

      <motion.div 
        className="text-center px-12 z-20 mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-[4vw] font-bold text-[#111827] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Publish once. Reach everywhere.
        </h1>
      </motion.div>
    </motion.div>
  );
}
