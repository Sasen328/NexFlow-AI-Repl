import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface WaveformProps {
  width: string;
  sceneKey: string;
}

const COLORS = ['#B8A0C8', '#C0A0B8', '#88B8B0', '#B8B880', '#C8A880'];

export function Waveform({ width, sceneKey }: WaveformProps) {
  const bars = useMemo(() => {
    const N = 48;
    return Array.from({ length: N }, (_, i) => {
      const center = N / 2;
      const dist = Math.abs(i - center) / center;
      const baseEnvelope = 1 - dist * 0.7;
      // pseudo-random phase per bar
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const phase = seed - Math.floor(seed);
      return {
        i,
        envelope: baseEnvelope,
        phase,
        color: COLORS[i % COLORS.length],
      };
    });
  }, []);

  return (
    <div
      className="relative flex items-end justify-center gap-[0.4vw]"
      style={{ width, height: '18vw' }}
    >
      {/* Glow halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '120%',
          height: '120%',
          left: '-10%',
          top: '-10%',
          background:
            'radial-gradient(circle, rgba(184,160,200,0.35), transparent 65%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [0.9, 1.08, 0.95, 1.05, 0.9] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {bars.map((b) => {
        const dur = 0.55 + b.phase * 0.5;
        const min = 8 + b.envelope * 6;
        const max = 14 + b.envelope * 90;
        return (
          <motion.div
            key={b.i}
            className="relative rounded-full"
            style={{
              width: '0.55vw',
              background: `linear-gradient(180deg, ${b.color}, rgba(184,160,200,0.4))`,
              boxShadow: `0 0 12px ${b.color}66`,
            }}
            initial={{ height: `${min}%` }}
            animate={{
              height: [
                `${min}%`,
                `${max}%`,
                `${min + 10}%`,
                `${max * 0.7}%`,
                `${min}%`,
              ],
            }}
            transition={{
              duration: dur,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: b.phase * 0.3,
            }}
          />
        );
      })}

      {/* Center axis line */}
      <div
        className="absolute left-0 right-0 top-1/2 h-[1px] -translate-y-1/2"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(184,160,200,0.45), transparent)',
        }}
      />
      {/* Hidden hint for sceneKey to ensure animation refresh */}
      <span className="hidden">{sceneKey}</span>
    </div>
  );
}
