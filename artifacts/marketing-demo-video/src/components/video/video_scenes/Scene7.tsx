import { motion } from 'framer-motion';
import { ScreenshotFrame, SceneCaption, CalloutPin } from '../ScreenshotFrame';

export function Scene7() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 p-[3vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative w-[78vw] max-w-[1500px]">
        <ScreenshotFrame
          src="/marketing-demo-video/screenshots/cultural-intelligence.jpg"
          alt="Cultural Intelligence"
          duration={12}
          initialScale={1.02}
          finalScale={1.12}
          initialY="0%"
          finalY="-4%"
        />

        <CalloutPin
          x="22%"
          y="22%"
          label="Eid Al-Adha alert"
          delay={1.2}
          color="accent"
        />
        <CalloutPin
          x="50%"
          y="73%"
          label="AI recommends timing & tone"
          delay={3}
          color="secondary"
        />

        {/* Floating "GCC native" stamp top right */}
        <motion.div
          className="absolute z-30"
          style={{ right: '5%', top: '8%' }}
          initial={{ opacity: 0, rotate: -10, scale: 0.7 }}
          animate={{ opacity: 1, rotate: -8, scale: 1 }}
          transition={{ delay: 4.5, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div
            className="px-5 py-3 rounded-xl text-white font-bold text-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(184,160,200,0.97), rgba(136,184,176,0.97))',
              border: '2px dashed rgba(255,255,255,0.5)',
            }}
          >
            <div className="text-[11px] uppercase tracking-[0.2em] opacity-90">Only on</div>
            <div className="text-[20px] leading-tight">NexFlow</div>
          </div>
        </motion.div>

        {/* Arabic geometric overlay (subtle) */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ delay: 1, duration: 2 }}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><path d='M40 0 L80 40 L40 80 L0 40 Z M40 20 L60 40 L40 60 L20 40 Z' stroke='%23B8A0C8' fill='none' stroke-width='1'/></svg>\")",
          }}
        />
      </div>

      <SceneCaption
        eyebrow="Why NexFlow"
        title="Cultural Intelligence — native to the GCC"
        delay={0.5}
      />
    </motion.div>
  );
}
