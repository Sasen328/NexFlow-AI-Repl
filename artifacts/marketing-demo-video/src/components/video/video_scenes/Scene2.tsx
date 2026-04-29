import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ScreenshotFrame, SceneCaption, CalloutPin } from '../ScreenshotFrame';

export function Scene2() {
  const fullPrompt = "Re-engage 247 leads stuck in 'Engaged' stage";
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setTyped(fullPrompt.slice(0, i));
        if (i >= fullPrompt.length) clearInterval(interval);
      }, 55);
    }, 2200);
    return () => clearTimeout(start);
  }, []);

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
          src="/marketing-demo-video/screenshots/marketing-assistant.jpg"
          alt="Marketing AI Assistant"
          duration={12}
          initialScale={1.02}
          finalScale={1.08}
        />

        <CalloutPin x="83%" y="38%" label="AI suggests prompts" delay={1.2} color="primary" />

        {/* Typed prompt floating above input */}
        <motion.div
          className="absolute left-[5%] right-[18%] bottom-[16%] z-30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.4 }}
        >
          <div
            className="rounded-xl px-5 py-3 text-[18px] font-medium text-white shadow-2xl flex items-center gap-2"
            style={{
              background: 'linear-gradient(90deg, rgba(26,21,48,0.96), rgba(45,35,75,0.96))',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(184,160,200,0.4)',
            }}
          >
            <span className="text-[rgb(200,168,128)] mr-1">›</span>
            <span>{typed}</span>
            <motion.span
              className="inline-block w-[2px] h-[20px] bg-white ml-0.5"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* AI thinking bubble appears after typing */}
        <motion.div
          className="absolute left-[5%] right-[18%] top-[35%] z-30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 9.5, duration: 0.5 }}
        >
          <div
            className="rounded-xl px-5 py-4 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(184,160,200,0.97), rgba(136,184,176,0.97))',
              color: 'white',
            }}
          >
            <div className="text-[12px] uppercase tracking-wider opacity-80 mb-1 font-bold">
              ✨ AI is generating your strategy
            </div>
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-white/90"
                  animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <SceneCaption eyebrow="Step 1" title="Ask AI for a marketing strategy" delay={0.5} />
    </motion.div>
  );
}
