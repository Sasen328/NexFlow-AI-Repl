import { motion } from 'framer-motion';

export function Scene8() {
  const tools = [
    'Marketing AI',
    'Campaigns',
    'Sequences',
    'Audiences',
    'Segments',
    'Web Forms',
    'Cultural Intelligence',
    'Templates',
  ];

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 px-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Tools list pops in chips - top half */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 max-w-[80vw] mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {tools.map((t, i) => (
          <motion.div
            key={t}
            className="px-5 py-2.5 rounded-full text-[15px] font-semibold backdrop-blur-md shadow-md"
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(184,160,200,0.4)',
              color: '#1a1530',
            }}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.5 + i * 0.08,
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            {t}
          </motion.div>
        ))}
      </motion.div>

      {/* Big NexFlow wordmark with chameleon gradient */}
      <motion.h1
        className="text-[10vw] leading-[0.95] font-bold relative"
        style={{
          fontFamily: 'var(--font-display)',
          background:
            'linear-gradient(90deg, #B8A0C8, #88B8B0 35%, #C8A880 70%, #B8A0C8)',
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.03em',
        }}
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          opacity: { delay: 1.6, duration: 0.7 },
          scale: { delay: 1.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          y: { delay: 1.6, duration: 0.7 },
          backgroundPosition: { duration: 6, repeat: Infinity, ease: 'linear' },
        }}
      >
        NexFlow
      </motion.h1>

      {/* Tagline */}
      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.6 }}
      >
        <div className="text-[2.2vw] font-medium text-[#1a1530] leading-tight">
          Marketing that moves.
        </div>
        <div className="text-[1.5vw] font-medium text-[#1a1530]/70 mt-2">
          Native to the GCC. Powered by AI.
        </div>
      </motion.div>

      {/* Subtle CTA */}
      <motion.div
        className="absolute bottom-[8vh] left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.6 }}
      >
        <div
          className="px-6 py-2 rounded-full text-[12px] uppercase tracking-[0.3em] font-bold text-white"
          style={{
            background:
              'linear-gradient(90deg, rgba(184,160,200,1), rgba(136,184,176,1), rgba(200,168,128,1))',
          }}
        >
          nexflow.app
        </div>
      </motion.div>
    </motion.div>
  );
}
