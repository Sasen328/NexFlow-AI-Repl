import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ScreenshotFrame, SceneCaption, CalloutPin } from '../ScreenshotFrame';

export function Scene4() {
  const [count, setCount] = useState(0);
  const target = 2168;

  useEffect(() => {
    const start = setTimeout(() => {
      const startTime = performance.now();
      const duration = 1800;
      const tick = () => {
        const elapsed = performance.now() - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setCount(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 2400);
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
          src="/marketing-demo-video/screenshots/audiences.jpg"
          alt="Audiences"
          duration={12}
          initialScale={1.02}
          finalScale={1.1}
        />

        <CalloutPin x="22%" y="33%" label="GCC enterprise · 1,240" delay={1.2} color="primary" />
        <CalloutPin x="71%" y="60%" label="Arabic-first · 538" delay={2.4} color="secondary" />

        {/* Floating live counter card */}
        <motion.div
          className="absolute z-30"
          style={{ left: '50%', top: '20%', transform: 'translateX(-50%)' }}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 4, duration: 0.5 }}
        >
          <div
            className="rounded-xl px-7 py-4 shadow-2xl text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(26,21,48,0.94), rgba(45,35,75,0.94))',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(184,160,200,0.4)',
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-[rgb(200,168,128)] font-bold mb-1">
              Live Audience Count
            </div>
            <div
              className="text-[44px] font-bold text-white leading-none tabular-nums"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {count.toLocaleString()}
            </div>
            <div className="text-[12px] text-white/60 mt-1">contacts targeted</div>
          </div>
        </motion.div>
      </div>

      <SceneCaption eyebrow="Step 3" title="Build audiences that convert" delay={0.5} />
    </motion.div>
  );
}
