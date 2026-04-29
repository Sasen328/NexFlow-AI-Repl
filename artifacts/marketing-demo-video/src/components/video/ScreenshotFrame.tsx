import { motion } from 'framer-motion';

interface ScreenshotFrameProps {
  src: string;
  alt?: string;
  className?: string;
  initialScale?: number;
  finalScale?: number;
  initialX?: string;
  finalX?: string;
  initialY?: string;
  finalY?: string;
  duration?: number;
  delay?: number;
}

/**
 * Renders a real NexFlow screenshot inside a glass-card chrome frame
 * with a subtle Ken Burns motion (zoom + pan) for cinematic feel.
 */
export function ScreenshotFrame({
  src,
  alt = '',
  className = '',
  initialScale = 1.0,
  finalScale = 1.08,
  initialX = '0%',
  finalX = '0%',
  initialY = '0%',
  finalY = '0%',
  duration = 10,
  delay = 0,
}: ScreenshotFrameProps) {
  return (
    <motion.div
      className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/40 ${className}`}
      style={{
        boxShadow:
          '0 25px 70px -10px rgba(80, 60, 110, 0.25), 0 10px 30px -5px rgba(80, 60, 110, 0.15)',
      }}
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* fake browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-b from-white/95 to-white/85 border-b border-black/5">
        <div className="w-3 h-3 rounded-full bg-[#FF6058]" />
        <div className="w-3 h-3 rounded-full bg-[#FFBE2F]" />
        <div className="w-3 h-3 rounded-full bg-[#28CA42]" />
        <div className="ml-4 flex-1 h-6 rounded-md bg-black/5 flex items-center px-3 text-[11px] text-black/40 font-mono">
          nexflow.app
        </div>
      </div>
      <div className="relative w-full overflow-hidden bg-[#F8F5F0]" style={{ aspectRatio: '16/9' }}>
        <motion.img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover object-top select-none pointer-events-none"
          draggable={false}
          initial={{ scale: initialScale, x: initialX, y: initialY }}
          animate={{ scale: finalScale, x: finalX, y: finalY }}
          transition={{ duration, delay, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

/**
 * A floating callout pin that points at part of a screenshot.
 * x/y are percentages of the parent container.
 */
export function CalloutPin({
  x,
  y,
  label,
  delay = 0,
  color = 'primary',
}: {
  x: string;
  y: string;
  label: string;
  delay?: number;
  color?: 'primary' | 'secondary' | 'accent';
}) {
  const bg = {
    primary: 'rgb(184, 160, 200)',
    secondary: 'rgb(136, 184, 176)',
    accent: 'rgb(200, 168, 128)',
  }[color];
  return (
    <motion.div
      className="absolute z-30 pointer-events-none"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.4 }}
      transition={{ delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <div className="relative">
        <div
          className="w-5 h-5 rounded-full shadow-lg"
          style={{ background: bg, boxShadow: `0 0 0 6px ${bg}33, 0 0 0 14px ${bg}1a` }}
        />
        <motion.div
          className="absolute top-0 left-0 w-5 h-5 rounded-full"
          style={{ background: bg }}
          animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-semibold text-white shadow-lg"
          style={{ background: 'rgba(17, 24, 39, 0.92)', backdropFilter: 'blur(8px)' }}
        >
          {label}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Big bottom-anchored caption strip. Used by every scene for consistency.
 */
export function SceneCaption({
  eyebrow,
  title,
  delay = 0.3,
}: {
  eyebrow?: string;
  title: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute left-0 right-0 bottom-[6vh] z-20 flex flex-col items-center px-12 text-center pointer-events-none"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {eyebrow && (
        <div
          className="mb-3 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-white"
          style={{
            background:
              'linear-gradient(90deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))',
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        className="text-[3.6vw] leading-[1.05] font-bold text-[#1a1530] max-w-[80vw] drop-shadow-sm"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
      >
        {title}
      </h2>
    </motion.div>
  );
}

/**
 * Animated mouse cursor that travels to a target position then "clicks".
 */
export function AnimatedCursor({
  fromX,
  fromY,
  toX,
  toY,
  delay = 0,
  duration = 1.4,
}: {
  fromX: string;
  fromY: string;
  toX: string;
  toY: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className="absolute z-40 pointer-events-none"
      style={{ width: 28, height: 28 }}
      initial={{ opacity: 0, left: fromX, top: fromY }}
      animate={{
        opacity: [0, 1, 1, 1],
        left: [fromX, fromX, toX, toX],
        top: [fromY, fromY, toY, toY],
        scale: [1, 1, 1, 0.85, 1],
      }}
      transition={{
        duration,
        delay,
        times: [0, 0.05, 0.7, 0.85, 1],
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5 3 L5 22 L10 17 L13 24 L16 23 L13 16 L20 16 Z"
          fill="white"
          stroke="#1a1530"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
