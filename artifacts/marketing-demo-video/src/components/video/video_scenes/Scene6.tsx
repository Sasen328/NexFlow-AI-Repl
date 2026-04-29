import { motion } from 'framer-motion';
import { ScreenshotFrame, SceneCaption, CalloutPin } from '../ScreenshotFrame';
import { Mail, MessageCircle, Linkedin, Phone, Globe } from 'lucide-react';

export function Scene6() {
  const channels = [
    { Icon: Mail, label: 'Email', color: 'rgba(184,160,200,0.95)' },
    { Icon: MessageCircle, label: 'WhatsApp', color: 'rgba(136,184,176,0.95)' },
    { Icon: Linkedin, label: 'LinkedIn', color: 'rgba(200,168,128,0.95)' },
    { Icon: Phone, label: 'Voice AI', color: 'rgba(184,160,200,0.95)' },
    { Icon: Globe, label: 'SMS', color: 'rgba(136,184,176,0.95)' },
  ];

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
          src="/marketing-demo-video/screenshots/sequences.jpg"
          alt="Sequences"
          duration={10}
          initialScale={1.02}
          finalScale={1.1}
          initialY="0%"
          finalY="-3%"
        />

        <CalloutPin x="62%" y="32%" label="35% reply rate" delay={1.4} color="secondary" />
        <CalloutPin x="80%" y="32%" label="100% AI-localised" delay={2.6} color="accent" />

        {/* Channel orchestration bar */}
        <motion.div
          className="absolute z-30 left-[5%] bottom-[8%]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 0.5 }}
        >
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl"
            style={{
              background: 'rgba(26,21,48,0.94)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(184,160,200,0.3)',
            }}
          >
            <div className="text-[11px] uppercase tracking-wider text-white/60 font-bold mr-2">
              Cadence
            </div>
            {channels.map(({ Icon, label, color }, i) => (
              <motion.div
                key={label}
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 4.4 + i * 0.2,
                  duration: 0.35,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                {i > 0 && <div className="w-3 h-px bg-white/30" />}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md"
                  style={{ background: color }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <SceneCaption
        eyebrow="Step 5"
        title="Multi-step cadences across every channel"
        delay={0.5}
      />
    </motion.div>
  );
}
