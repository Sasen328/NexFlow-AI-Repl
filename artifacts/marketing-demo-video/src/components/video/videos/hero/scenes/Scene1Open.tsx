import { motion } from 'framer-motion';

export function Scene1Open() {
  return (
    <motion.div
      key="open"
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
      style={{ background: '#1F1A24' }}
    >
      {/* Slow drifting ambient glow */}
      <motion.div
        className="absolute"
        style={{
          width: '80vmax',
          height: '80vmax',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(184,160,200,0.20), rgba(136,184,176,0.07) 40%, transparent 65%)',
          filter: 'blur(60px)',
        }}
        initial={{ x: '-10%', y: '-5%', scale: 0.95 }}
        animate={{ x: ['-10%', '8%', '-4%'], y: ['-5%', '6%', '-2%'], scale: [0.95, 1.08, 1] }}
        transition={{ duration: 4.2, ease: 'easeInOut' }}
      />

      {/* Single faint facet of the diamond mark */}
      <div
        style={{
          position: 'relative',
          width: '60vmin',
          height: '60vmin',
          zIndex: 2,
        }}
      >
        <svg viewBox="0 0 1024 1024" width="100%" height="100%" style={{ display: 'block' }}>
          <defs>
            <linearGradient
              id="hf1"
              x1="0"
              y1="0"
              x2="1024"
              y2="1024"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#B8A0C8" />
              <stop offset="50%" stopColor="#88B8B0" />
              <stop offset="100%" stopColor="#C8A880" />
            </linearGradient>
          </defs>
          <motion.rect
            x="196"
            y="196"
            width="632"
            height="632"
            rx="54"
            ry="54"
            transform="rotate(45 512 512)"
            fill="none"
            stroke="url(#hf1)"
            strokeWidth="14"
            initial={{ opacity: 0.06 }}
            animate={{ opacity: [0.06, 0.28, 0.22] }}
            transition={{ duration: 4, ease: 'easeOut' }}
          />
        </svg>

        {/* Light sweep — angled gradient bar that travels across the facet */}
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: '-20%',
              bottom: '-20%',
              width: '40%',
              background:
                'linear-gradient(105deg, rgba(255,255,255,0) 0%, rgba(232,225,239,0.9) 45%, rgba(184,160,200,0.95) 50%, rgba(232,225,239,0.9) 55%, rgba(255,255,255,0) 100%)',
              filter: 'blur(6px)',
              transform: 'rotate(20deg)',
            }}
            initial={{ left: '-60%' }}
            animate={{ left: ['-60%', '120%', '120%'] }}
            transition={{ duration: 4, ease: [0.55, 0, 0.45, 1], times: [0, 0.7, 1] }}
          />
        </motion.div>
      </div>

      {/* Eyebrow whisper */}
      <motion.div
        className="absolute"
        style={{
          bottom: '8vh',
          color: 'rgba(232,225,239,0.65)',
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: '0.85vw',
          letterSpacing: '0.55em',
          textTransform: 'uppercase',
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: [0, 0.85, 0.85], y: 0 }}
        transition={{ duration: 3.5, delay: 1.2, times: [0, 0.5, 1] }}
      >
        A new revenue OS · for the Gulf
      </motion.div>
    </motion.div>
  );
}
