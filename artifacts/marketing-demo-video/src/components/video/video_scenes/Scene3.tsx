import { motion } from 'framer-motion';
import { ScreenshotFrame, SceneCaption, CalloutPin } from '../ScreenshotFrame';

export function Scene3() {
  const channels = ['Email', 'WhatsApp', 'LinkedIn', 'SMS', 'Voice AI'];

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
          src="/marketing-demo-video/screenshots/campaigns.jpg"
          alt="Marketing Intelligence campaign builder"
          duration={15}
          initialScale={1.02}
          finalScale={1.12}
          initialY="0%"
          finalY="-2%"
        />

        <CalloutPin x="32%" y="32%" label="$4.2M pipeline influenced" delay={1.5} color="secondary" />
        <CalloutPin x="50%" y="62%" label="Pick channels & budget" delay={3} color="primary" />
        <CalloutPin x="50%" y="86%" label="AI builds full strategy" delay={5} color="accent" />

        {/* Floating channel chips badge that pop in sequentially top-right */}
        <motion.div
          className="absolute top-[8%] right-[3%] z-30 flex flex-col items-end gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 7 }}
        >
          <div
            className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ background: 'rgba(26,21,48,0.92)' }}
          >
            5 channels selected
          </div>
          <div className="flex flex-wrap gap-1.5 max-w-[260px] justify-end">
            {channels.map((c, i) => (
              <motion.div
                key={c}
                className="px-2.5 py-1 rounded-full text-[12px] font-semibold text-white shadow-md"
                style={{
                  background:
                    i % 3 === 0
                      ? 'rgba(184,160,200,0.95)'
                      : i % 3 === 1
                        ? 'rgba(136,184,176,0.95)'
                        : 'rgba(200,168,128,0.95)',
                }}
                initial={{ opacity: 0, scale: 0.6, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: 7.3 + i * 0.18,
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                {c}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <SceneCaption
        eyebrow="Step 2"
        title="Multi-channel campaigns, AI-orchestrated"
        delay={0.5}
      />
    </motion.div>
  );
}
