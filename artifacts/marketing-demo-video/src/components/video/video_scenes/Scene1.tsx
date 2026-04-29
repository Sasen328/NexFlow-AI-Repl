import { motion } from 'framer-motion';
import { ScreenshotFrame, SceneCaption, AnimatedCursor } from '../ScreenshotFrame';

export function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center z-10 p-[3vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Eyebrow label */}
      <motion.div
        className="absolute top-[6vh] left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div
          className="px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-[0.3em] text-white"
          style={{
            background:
              'linear-gradient(90deg, rgba(184,160,200,1), rgba(136,184,176,1), rgba(200,168,128,1))',
          }}
        >
          NexFlow CRM · Marketing
        </div>
      </motion.div>

      <div className="relative w-[78vw] max-w-[1500px]">
        <ScreenshotFrame
          src="/marketing-demo-video/screenshots/home.jpg"
          alt="NexFlow home"
          duration={10}
          initialScale={1.05}
          finalScale={1.18}
          initialY="0%"
          finalY="-3%"
        />
        {/* Animated cursor moves to the Marketing tab in the top nav */}
        <AnimatedCursor
          fromX="20%"
          fromY="80%"
          toX="48%"
          toY="9%"
          delay={3}
          duration={3}
        />
        {/* Highlight ring on Marketing tab */}
        <motion.div
          className="absolute z-30 pointer-events-none rounded-xl"
          style={{
            left: '38%',
            top: '5%',
            width: '14%',
            height: '6%',
            border: '3px solid rgba(184,160,200,0.95)',
            boxShadow: '0 0 0 8px rgba(184,160,200,0.18), 0 0 30px rgba(184,160,200,0.5)',
          }}
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 5.6, duration: 0.5 }}
        />
      </div>

      <SceneCaption
        eyebrow="Day in the life"
        title="A marketer's day in NexFlow"
        delay={0.6}
      />
    </motion.div>
  );
}
