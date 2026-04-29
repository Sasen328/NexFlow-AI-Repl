import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Clock, Moon, Sparkles, Languages } from 'lucide-react';

export function Scene6() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 8000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const recommendations = [
    { icon: Clock, label: 'Send time', value: '9:00 AM AST', color: 'text-blue-400' },
    { icon: Moon, label: 'Avoid', value: 'Friday prayer (12:00–14:00)', color: 'text-indigo-400' },
    { icon: Sparkles, label: 'Hook angle', value: 'Vision 2030 alignment', color: 'text-emerald-400' },
    { icon: Languages, label: 'Tone', value: 'Formal AR + EN', color: 'text-purple-400' },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8 }}
    >
      {/* Arabic Geometric Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] z-0" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />

      <div className="w-full max-w-6xl px-12 flex flex-col md:flex-row items-center gap-16 z-20">
        <div className="flex-1 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-[4vw] font-bold text-[#111827] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Cultural Intelligence
            </h2>
            <p className="text-[2vw] text-gray-600 mt-4 font-medium tracking-wide">
              Native to the GCC.
            </p>
          </motion.div>
        </div>

        <div className="flex-1 w-full relative">
          {/* Decorative aura */}
          <div className="absolute inset-0 bg-[var(--color-primary)] opacity-10 blur-[80px] rounded-full z-0" />
          
          <motion.div 
            className="dark-glass-card p-8 rounded-3xl border border-white/10 shadow-2xl bg-[#111827]/90 backdrop-blur-2xl relative z-10 w-full"
            initial={{ opacity: 0, x: 40 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            dir="rtl"
          >
            <div className="space-y-4">
              {recommendations.map((rec, i) => {
                const Icon = rec.icon;
                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: phase >= 2 ? i * 0.2 : 0 }}
                  >
                    <div className={`p-3 rounded-lg bg-white/5 ${rec.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-right ml-4">
                      <p className="text-white/60 text-sm font-medium mb-1" dir="ltr">{rec.label}</p>
                      <p className="text-white text-lg font-semibold" dir="ltr">{rec.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
