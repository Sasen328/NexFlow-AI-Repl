import { motion } from 'framer-motion';
import {
  PALETTE,
  DISPLAY_FONT,
  SANS_FONT,
  ARABIC_FONT,
} from './_shared';

export function ScenePayoff() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Animated diamond chameleon mark — large, faceted */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
        animate={{
          scale: [0.6, 1.05, 1],
          opacity: 1,
          rotate: 0,
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], times: [0, 0.7, 1] }}
        className="relative"
        style={{ width: 180, height: 180 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          <img
            src={`${import.meta.env.BASE_URL}tutorial/logo_mark.svg`}
            alt=""
            width={180}
            height={180}
            style={{ display: 'block' }}
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(184,160,200,0.55), transparent 60%)',
            filter: 'blur(30px)',
          }}
          animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Arabic headline (first, RTL) */}
      <motion.div
        dir="rtl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: ARABIC_FONT,
          fontWeight: 700,
          fontSize: '5vw',
          color: '#fff',
          marginTop: '3vh',
          lineHeight: 1,
        }}
      >
        أنت جاهز.
      </motion.div>

      {/* English headline */}
      <motion.div
        initial={{ opacity: 0, y: 24, letterSpacing: '0.2em' }}
        animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
        transition={{ delay: 0.85, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: '7vw',
          color: '#fff',
          marginTop: '0.5vh',
          lineHeight: 1,
          background:
            'linear-gradient(90deg, #FAF7F4, #B8A0C8 30%, #88B8B0 60%, #C8A880 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        You're ready.
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.7 }}
        className="text-center mt-6"
      >
        <div
          style={{
            fontFamily: SANS_FONT,
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          Built for revenue teams across the Gulf
        </div>
        <div
          dir="rtl"
          style={{
            fontFamily: ARABIC_FONT,
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.55)',
            marginTop: 6,
            fontWeight: 500,
          }}
        >
          مصمّم لفِرق الإيرادات في الخليج
        </div>
      </motion.div>

      {/* Wordmark lockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.7 }}
        className="flex items-center gap-3 mt-9 px-6 py-3 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(184,160,200,0.35)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            background:
              'conic-gradient(from 45deg, #B8A0C8, #88B8B0, #C8A880, #B8A0C8)',
            clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
          }}
        />
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            color: '#fff',
            fontSize: 22,
            letterSpacing: '-0.01em',
          }}
        >
          NexFlow
        </span>
        <span
          style={{
            width: 1,
            height: 16,
            background: 'rgba(255,255,255,0.25)',
          }}
        />
        <span
          style={{
            fontFamily: SANS_FONT,
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.18em',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          KSA · UAE
        </span>
      </motion.div>

      {/* Slow drifting accent shapes for continuous motion */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 8,
            height: 8,
            background: [PALETTE.lavender, PALETTE.sage, PALETTE.gold, PALETTE.rose][i],
            left: `${15 + i * 22}%`,
            top: `${[18, 78, 25, 72][i]}%`,
            filter: 'blur(0.5px)',
            boxShadow: '0 0 14px currentColor',
          }}
          animate={{
            y: [0, -16, 0, 12, 0],
            opacity: [0.4, 0.85, 0.4],
          }}
          transition={{
            duration: 4 + i * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}
