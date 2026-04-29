import { motion } from 'framer-motion';
import { ScreenshotFrame, SceneCaption, CalloutPin } from '../ScreenshotFrame';

export function Scene5() {
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
          src="/marketing-demo-video/screenshots/segments.jpg"
          alt="Segments"
          duration={10}
          initialScale={1.02}
          finalScale={1.1}
          initialY="-2%"
          finalY="-6%"
        />

        <CalloutPin x="22%" y="56%" label="Plain English →" delay={1} color="primary" />
        <CalloutPin x="22%" y="78%" label="→ Live SQL filter" delay={2.5} color="secondary" />

        {/* Translation arrow badge */}
        <motion.div
          className="absolute z-30"
          style={{ left: '50%', top: '15%', transform: 'translateX(-50%)' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3.5, duration: 0.5 }}
        >
          <div
            className="rounded-full px-5 py-2 text-[14px] font-bold text-white shadow-xl flex items-center gap-2"
            style={{
              background: 'linear-gradient(90deg, rgba(184,160,200,0.97), rgba(136,184,176,0.97))',
            }}
          >
            <span className="text-base">✨</span> AI translates your intent
          </div>
        </motion.div>
      </div>

      <SceneCaption
        eyebrow="Step 4"
        title="Plain-English segments. Live data."
        delay={0.5}
      />
    </motion.div>
  );
}
