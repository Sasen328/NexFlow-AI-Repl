import { motion } from 'framer-motion';
import { TOOLS } from '../Template';

const START_POS = [
  { x: '-28vw', y: '-20vh' },
  { x: '26vw', y: '-22vh' },
  { x: '30vw', y: '14vh' },
  { x: '-26vw', y: '18vh' },
  { x: '0vw', y: '24vh' },
];

const COLLAPSE_T = 0.8; // seconds when cards arrive at center
const DIAMOND_T = 1.4; // diamond starts revealing

export function Scene3Collapse() {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    >
      {/* Caption */}
      <motion.div
        className="absolute top-[8vh] left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 6, times: [0, 0.1, 0.7, 1], ease: 'easeInOut' }}
      >
        <div
          className="text-white text-[2.4vw] font-light"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Five tools. <span style={{ color: '#88B8B0' }}>One platform.</span>
        </div>
        <div
          className="mt-1 text-[1.2vw] opacity-80"
          dir="rtl"
          style={{
            color: '#d8cce0',
            fontFamily: "'IBM Plex Sans Arabic', system-ui",
          }}
        >
          خمس أدوات. منصة واحدة.
        </div>
      </motion.div>

      {/* Cards collapse to center */}
      {TOOLS.map((tool, i) => (
        <motion.div
          key={tool.key}
          className="absolute rounded-2xl"
          style={{
            width: '14vw',
            height: '8vh',
            background: `linear-gradient(135deg, ${tool.color}55, ${tool.color}18)`,
            border: `1px solid ${tool.color}88`,
            boxShadow: `0 0 40px ${tool.color}66`,
          }}
          initial={{
            x: START_POS[i].x,
            y: START_POS[i].y,
            opacity: 1,
            scale: 1,
            rotate: i * 8 - 16,
          }}
          animate={{
            x: ['0vw'],
            y: ['0vh'],
            opacity: [1, 1, 0],
            scale: [1, 0.2, 0.05],
            rotate: [i * 8 - 16, 360 + i * 30, 720],
          }}
          transition={{
            duration: COLLAPSE_T + 0.3,
            times: [0, 0.7, 1],
            ease: [0.7, 0, 0.3, 1],
          }}
          // Animate from start position toward center
          custom={i}
        >
          <div
            className="absolute inset-0 flex items-center px-3 text-white text-[0.9vw] font-semibold"
          >
            {tool.en}
          </div>
        </motion.div>
      ))}

      {/* Initial position trick: use motion divs that slide from start to center */}
      {TOOLS.map((tool, i) => (
        <motion.div
          key={`trail-${tool.key}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '8vw',
            height: '8vw',
            background: `radial-gradient(circle, ${tool.color}, transparent 70%)`,
            filter: 'blur(20px)',
            mixBlendMode: 'screen',
          }}
          initial={{
            x: START_POS[i].x,
            y: START_POS[i].y,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: '0vw',
            y: '0vh',
            opacity: [0, 0.9, 0.6, 0],
            scale: [0.5, 1.2, 1.6, 0.4],
          }}
          transition={{
            duration: COLLAPSE_T + 0.6,
            times: [0, 0.4, 0.7, 1],
            ease: [0.65, 0, 0.35, 1],
            delay: i * 0.04,
          }}
        />
      ))}

      {/* Implosion shockwave */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '4vw',
          height: '4vw',
          border: '2px solid #B8A0C8',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 0.5, 8], opacity: [0, 1, 0] }}
        transition={{
          duration: 1.4,
          times: [0, 0.4, 1],
          ease: 'easeOut',
          delay: COLLAPSE_T + 0.1,
        }}
      />
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '4vw',
          height: '4vw',
          border: '2px solid #C8A880',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 0.5, 6], opacity: [0, 0.7, 0] }}
        transition={{
          duration: 1.6,
          times: [0, 0.4, 1],
          ease: 'easeOut',
          delay: COLLAPSE_T + 0.25,
        }}
      />

      {/* Bright flash at impact */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,250,235,0.85), transparent 35%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 0.6,
          times: [0, 0.3, 1],
          delay: COLLAPSE_T,
          ease: 'easeOut',
        }}
      />

      {/* Diamond reveal — built from the brand mark assembled facet by facet */}
      <motion.div
        className="absolute"
        style={{ width: '34vw', height: '34vw' }}
        initial={{ scale: 0.2, opacity: 0, rotate: -45 }}
        animate={{ scale: [0.2, 1.15, 1], opacity: [0, 1, 1], rotate: [-45, 5, 0] }}
        transition={{
          duration: 2.2,
          times: [0, 0.55, 1],
          ease: [0.16, 1, 0.3, 1],
          delay: DIAMOND_T,
        }}
      >
        <DiamondAbsorb />
      </motion.div>

      {/* Continuous gentle aura on the diamond after it forms */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '40vw',
          height: '40vw',
          background:
            'radial-gradient(circle, rgba(184,160,200,0.35), transparent 60%)',
          filter: 'blur(40px)',
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: [0, 0.8, 0.6, 0.8],
          scale: [0.6, 1, 1.05, 1],
        }}
        transition={{
          duration: 5,
          delay: DIAMOND_T + 0.6,
          ease: 'easeInOut',
          times: [0, 0.3, 0.6, 1],
        }}
      />
    </motion.div>
  );
}

/**
 * Animated diamond facets — 4 nested rotated squares, each tinted by a brand color
 * matching one of the 5 tools (5th color tints the center dot).
 */
function DiamondAbsorb() {
  const facetColors = ['#B8A0C8', '#90B8B8', '#C8A880', '#C0A0B8'];
  const sizes = [100, 75, 50, 28]; // % of container
  return (
    <div className="relative w-full h-full">
      {sizes.map((sz, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{
            width: `${sz}%`,
            height: `${sz}%`,
            marginLeft: `-${sz / 2}%`,
            marginTop: `-${sz / 2}%`,
            border: `${3 - i * 0.4}px solid ${facetColors[i]}`,
            borderRadius: `${10 - i}%`,
            transform: 'rotate(45deg)',
            boxShadow: `0 0 30px ${facetColors[i]}88, inset 0 0 20px ${facetColors[i]}55`,
          }}
          initial={{ opacity: 0, scale: 0.4, rotate: 45 }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: [45, 45 + (i % 2 === 0 ? 10 : -10), 45],
          }}
          transition={{
            opacity: { duration: 0.6, delay: 0.15 * i },
            scale: { duration: 0.8, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] },
            rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 },
          }}
        />
      ))}
      {/* Center dot — 5th tool color (olive/highlight) */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: '6%',
          height: '6%',
          marginLeft: '-3%',
          marginTop: '-3%',
          background:
            'radial-gradient(circle, #B8B880, #88B8B0)',
          boxShadow: '0 0 24px #B8B880, 0 0 60px #88B8B055',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.6, 1], opacity: 1 }}
        transition={{
          duration: 0.7,
          delay: 0.7,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
    </div>
  );
}
