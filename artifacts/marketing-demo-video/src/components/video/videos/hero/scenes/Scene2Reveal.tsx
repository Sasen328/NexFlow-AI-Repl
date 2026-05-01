import { motion } from 'framer-motion';
import { DiamondMark } from '../DiamondMark';

export function Scene2Reveal() {
  const word = 'NexFlow';
  return (
    <motion.div
      key="reveal"
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      style={{ background: '#1F1A24' }}
    >
      {/* Ambient sweeping light */}
      <motion.div
        className="absolute"
        style={{
          width: '95vmax',
          height: '95vmax',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(184,160,200,0.25), rgba(200,168,128,0.10) 40%, transparent 65%)',
          filter: 'blur(70px)',
        }}
        initial={{ x: '-5%', y: '-10%', scale: 1 }}
        animate={{ x: ['-5%', '6%', '0%'], y: ['-10%', '4%', '-2%'], scale: [1, 1.12, 1.05] }}
        transition={{ duration: 5.5, ease: 'easeInOut' }}
      />

      {/* Faceted diamond assembling */}
      <div style={{ position: 'relative', marginTop: '-2vh' }}>
        <DiamondMark
          size="38vmin"
          facetDelay={0.55}
          facetDuration={1.2}
          animateAssemble
        />
      </div>

      {/* Wordmark tracking in */}
      <div
        style={{
          marginTop: '3vh',
          display: 'flex',
          alignItems: 'baseline',
          overflow: 'hidden',
        }}
      >
        {word.split('').map((c, i) => (
          <motion.span
            key={i}
            style={{
              display: 'inline-block',
              fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
              fontWeight: 600,
              fontSize: '7vw',
              lineHeight: 1,
              color: '#F1ECF5',
              letterSpacing: '-0.02em',
            }}
            initial={{ opacity: 0, y: 30, letterSpacing: '0.4em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
            transition={{
              duration: 0.9,
              delay: 2.4 + i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {c}
          </motion.span>
        ))}
      </div>

      <motion.div
        style={{
          marginTop: '1.6vh',
          height: 1,
          background:
            'linear-gradient(90deg, transparent, rgba(184,160,200,0.7), rgba(136,184,176,0.7), rgba(200,168,128,0.7), transparent)',
        }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '38vmin', opacity: 1 }}
        transition={{ duration: 1.2, delay: 3.4, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}
