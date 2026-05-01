import { motion } from 'framer-motion';

export function Scene3Position() {
  return (
    <motion.div
      key="position"
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      style={{ background: '#1F1A24' }}
    >
      {/* Drifting palette wash */}
      <motion.div
        className="absolute"
        style={{
          inset: 0,
          background:
            'radial-gradient(60% 60% at 30% 30%, rgba(184,160,200,0.22), transparent 60%), radial-gradient(60% 60% at 75% 70%, rgba(200,168,128,0.18), transparent 60%), radial-gradient(50% 50% at 80% 20%, rgba(136,184,176,0.18), transparent 60%)',
          filter: 'blur(20px)',
        }}
        initial={{ scale: 1, opacity: 0.9 }}
        animate={{ scale: [1, 1.06, 1.02], opacity: [0.9, 1, 0.95] }}
        transition={{ duration: 6, ease: 'easeInOut' }}
      />

      {/* Arabic huge typography */}
      <motion.div
        dir="rtl"
        style={{
          fontFamily:
            "'IBM Plex Sans Arabic', 'Tajawal', 'Noto Sans Arabic', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: '12vw',
          lineHeight: 0.95,
          color: '#F1ECF5',
          letterSpacing: '-0.01em',
        }}
        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        نكسفلو
      </motion.div>

      {/* Divider */}
      <motion.div
        style={{
          marginTop: '1.4vh',
          marginBottom: '1.4vh',
          height: 2,
          background:
            'linear-gradient(90deg, transparent, #B8A0C8, #88B8B0, #C8A880, transparent)',
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '36vmin', opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* English wordmark */}
      <motion.div
        style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontWeight: 600,
          fontSize: '8vw',
          lineHeight: 0.95,
          color: '#F1ECF5',
          letterSpacing: '-0.02em',
        }}
        initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
      >
        NexFlow
      </motion.div>

      {/* Tagline pair */}
      <motion.div
        style={{
          marginTop: '4vh',
          textAlign: 'center',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            color: 'rgba(232,225,239,0.92)',
            fontSize: '1.7vw',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          AI-native revenue. Built for the Gulf.
        </div>
        <div
          dir="rtl"
          style={{
            marginTop: '0.8vh',
            color: 'rgba(200,168,128,0.95)',
            fontSize: '1.7vw',
            fontWeight: 500,
            fontFamily:
              "'IBM Plex Sans Arabic', 'Tajawal', 'Noto Sans Arabic', system-ui, sans-serif",
          }}
        >
          ذكاء اصطناعي للإيرادات. صُمّم للخليج.
        </div>
      </motion.div>

      {/* Subtle ambient orbiting dot for continuous motion */}
      <motion.div
        className="absolute"
        style={{
          width: '0.6vw',
          height: '0.6vw',
          borderRadius: '50%',
          background: '#B8A0C8',
          boxShadow: '0 0 20px rgba(184,160,200,0.9)',
          top: '50%',
          left: '50%',
        }}
        initial={{ x: '-20vw', y: '-15vh', opacity: 0 }}
        animate={{
          x: ['-22vw', '24vw', '-22vw'],
          y: ['-16vh', '18vh', '-16vh'],
          opacity: [0, 0.9, 0.9],
        }}
        transition={{ duration: 6, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
