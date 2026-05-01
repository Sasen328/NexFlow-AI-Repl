import { motion } from 'framer-motion';
import { DiamondMark } from '../Template';

export function Scene5Payoff() {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Subtle Riyadh skyline silhouette in the background */}
      <motion.svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{ height: '22vh' }}
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.18, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8A0C8" />
            <stop offset="100%" stopColor="#88B8B0" />
          </linearGradient>
        </defs>
        <path
          d="M0 220 L0 170 L60 170 L60 140 L100 140 L100 110 L140 110 L140 150 L200 150 L200 90 L240 90 L240 50 L260 50 L260 90 L290 90 L290 150 L340 150 L340 120 L390 120 L390 80 L430 80 L430 130 L470 130 L470 100 L520 100 L520 160 L560 160 L560 70 L590 30 L620 70 L620 160 L670 160 L670 120 L720 120 L720 90 L760 90 L760 140 L810 140 L810 100 L850 100 L850 60 L880 60 L880 100 L920 100 L920 150 L970 150 L970 120 L1020 120 L1020 80 L1060 80 L1060 140 L1110 140 L1110 110 L1160 110 L1160 160 L1200 160 L1200 220 Z"
          fill="url(#sky)"
        />
      </motion.svg>

      {/* Diamond + wordmark */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          style={{ width: '14vw', height: '14vw' }}
          animate={{ rotate: [0, 6, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <DiamondMark />
        </motion.div>
        <motion.div
          className="mt-4 nf-chameleon-text font-black tracking-tight"
          style={{
            fontSize: '5vw',
            fontFamily: "'Fraunces', 'Cormorant Garamond', serif",
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          NexFlow
        </motion.div>
      </motion.div>

      {/* English tagline */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9 }}
      >
        <div
          className="text-white text-[2vw] font-light leading-tight"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          One platform.{' '}
          <span style={{ color: '#88B8B0' }}>One subscription.</span>{' '}
          <span style={{ color: '#C8A880' }}>Built for the Gulf.</span>
        </div>
      </motion.div>

      {/* Arabic tagline */}
      <motion.div
        className="mt-3 text-center"
        dir="rtl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.2 }}
      >
        <div
          className="text-[1.6vw] font-medium"
          style={{
            color: '#e8dff0',
            fontFamily: "'IBM Plex Sans Arabic', 'Tajawal', system-ui",
          }}
        >
          منصة واحدة. اشتراك واحد.{' '}
          <span style={{ color: '#B8A0C8' }}>للخليج.</span>
        </div>
      </motion.div>

      {/* Underline shimmer */}
      <motion.div
        className="mt-6"
        style={{
          height: '2px',
          background:
            'linear-gradient(90deg, transparent, #B8A0C8, #88B8B0, #C8A880, transparent)',
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '24vw', opacity: 1 }}
        transition={{ duration: 1.4, delay: 1.5, ease: 'easeOut' }}
      />

      {/* Slow shimmering particles */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '4px',
            height: '4px',
            background: ['#B8A0C8', '#88B8B0', '#C8A880', '#C0A0B8', '#B8B880', '#90B8B8'][i],
            left: `${15 + i * 12}%`,
            top: `${20 + (i % 2) * 60}%`,
            boxShadow: '0 0 8px currentColor',
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 3 + (i % 3),
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}
