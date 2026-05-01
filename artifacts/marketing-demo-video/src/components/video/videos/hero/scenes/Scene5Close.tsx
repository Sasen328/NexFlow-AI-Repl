import { motion } from 'framer-motion';
import { DiamondMark } from '../DiamondMark';

export function Scene5Close() {
  return (
    <motion.div
      key="close"
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      style={{ background: '#1F1A24' }}
    >
      {/* Slow ambient drift */}
      <motion.div
        className="absolute"
        style={{
          width: '90vmax',
          height: '90vmax',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(184,160,200,0.22), rgba(136,184,176,0.10) 40%, rgba(200,168,128,0.06) 60%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        initial={{ x: '-2%', y: '-2%', scale: 1 }}
        animate={{ x: ['-2%', '4%', '-2%'], y: ['-2%', '3%', '-2%'], scale: [1, 1.06, 1] }}
        transition={{ duration: 5, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <DiamondMark
          size="26vmin"
          facetDelay={0.12}
          facetDuration={0.7}
          animateAssemble
        />
      </motion.div>

      <motion.div
        style={{
          marginTop: '3vh',
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          fontWeight: 600,
          fontSize: '6.5vw',
          lineHeight: 0.95,
          color: '#F1ECF5',
          letterSpacing: '-0.02em',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        NexFlow
      </motion.div>

      <motion.div
        style={{
          marginTop: '0.6vh',
          height: 1,
          background:
            'linear-gradient(90deg, transparent, rgba(184,160,200,0.7), rgba(136,184,176,0.7), rgba(200,168,128,0.7), transparent)',
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '32vmin', opacity: 1 }}
        transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        style={{
          marginTop: '2vh',
          textAlign: 'center',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            color: 'rgba(232,225,239,0.92)',
            fontSize: '1.5vw',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          AI-native revenue. Built for the Gulf.
        </div>
        <div
          dir="rtl"
          style={{
            marginTop: '0.6vh',
            color: 'rgba(200,168,128,0.95)',
            fontSize: '1.5vw',
            fontWeight: 500,
            fontFamily:
              "'IBM Plex Sans Arabic', 'Tajawal', 'Noto Sans Arabic', system-ui, sans-serif",
          }}
        >
          ذكاء اصطناعي للإيرادات. صُمّم للخليج.
        </div>
      </motion.div>

      {/* Subtle floating motes — keeps frames changing during the hold */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: '0.4vw',
            height: '0.4vw',
            borderRadius: '50%',
            background: ['#B8A0C8', '#88B8B0', '#C8A880', '#C0A0B8', '#B8B880'][i],
            top: `${20 + i * 12}%`,
            left: `${15 + i * 14}%`,
            opacity: 0.7,
            filter: 'blur(0.5px)',
          }}
          initial={{ y: 0, x: 0 }}
          animate={{
            y: [0, -20 - i * 5, 0],
            x: [0, 8 - i * 3, 0],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{ duration: 4 + i * 0.5, ease: 'easeInOut', repeat: Infinity }}
        />
      ))}
    </motion.div>
  );
}
