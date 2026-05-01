import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { PhoneFrame } from './Phone';
import { SceneOpen, PhoneScreenOpen } from './scenes/SceneOpen';
import { SceneBriefing } from './scenes/SceneBriefing';
import { SceneVoice } from './scenes/SceneVoice';
import { SceneNotifs } from './scenes/SceneNotifs';
import { PhoneScreenPayoff, PayoffTagline } from './scenes/ScenePayoff';

export const SCENE_DURATIONS = {
  open: 4500,
  briefing: 7000,
  voice: 7000,
  notifs: 6500,
  payoff: 5000,
};

const SCENE_KEYS = Object.keys(SCENE_DURATIONS);

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;900&display=swap';

interface VideoTemplateProps {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
}

/** Phone position / rotation per scene — gives the device a continuous arc */
const phonePose: Record<
  string,
  { x: string; y: string; scale: number; rotateY: number; rotateX: number; rotateZ: number }
> = {
  open: { x: '0vw', y: '0vh', scale: 1, rotateY: -22, rotateX: 12, rotateZ: -6 },
  briefing: { x: '-22vw', y: '0vh', scale: 1.05, rotateY: 14, rotateX: 4, rotateZ: -2 },
  voice: { x: '20vw', y: '0vh', scale: 1.05, rotateY: -16, rotateX: 6, rotateZ: 3 },
  notifs: { x: '-18vw', y: '0vh', scale: 1.05, rotateY: 18, rotateX: -2, rotateZ: -1 },
  payoff: { x: '22vw', y: '0vh', scale: 1.1, rotateY: -8, rotateX: 2, rotateZ: 0 },
};

const sceneGlow: Record<string, string> = {
  open: 'rgba(184,160,200,0.55)',
  briefing: 'rgba(184,160,200,0.55)',
  voice: 'rgba(136,184,176,0.55)',
  notifs: 'rgba(200,168,128,0.55)',
  payoff: 'rgba(184,160,200,0.6)',
};

function PhoneScreen({ sceneKey }: { sceneKey: string }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {sceneKey === 'open' && (
        <motion.div
          key="screen-open"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <PhoneScreenOpen />
        </motion.div>
      )}
      {sceneKey === 'briefing' && (
        <motion.div
          key="screen-briefing"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <SceneBriefing />
        </motion.div>
      )}
      {sceneKey === 'voice' && (
        <motion.div
          key="screen-voice"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <SceneVoice />
        </motion.div>
      )}
      {sceneKey === 'notifs' && (
        <motion.div
          key="screen-notifs"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <SceneNotifs />
        </motion.div>
      )}
      {sceneKey === 'payoff' && (
        <motion.div
          key="screen-payoff"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <PhoneScreenPayoff />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: VideoTemplateProps = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  // Inject Google Fonts (Plus Jakarta + Tajawal)
  useEffect(() => {
    const id = 'mobile-video-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  const baseSceneKey = SCENE_KEYS.includes(currentSceneKey)
    ? currentSceneKey
    : SCENE_KEYS[0];

  const pose = phonePose[baseSceneKey];
  const glow = sceneGlow[baseSceneKey];

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 30% 30%, #2a1c34 0%, #1a1024 40%, #0c0810 100%)',
      }}
    >
      {/* Persistent chameleon ambient palette */}
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '70vmax',
          height: '70vmax',
          left: '-15vmax',
          top: '-15vmax',
          background:
            'radial-gradient(circle, rgba(184,160,200,0.45), transparent 65%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: ['0vw', '8vw', '0vw'],
          y: ['0vh', '6vh', '0vh'],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '60vmax',
          height: '60vmax',
          right: '-15vmax',
          bottom: '-15vmax',
          background:
            'radial-gradient(circle, rgba(136,184,176,0.38), transparent 65%)',
          filter: 'blur(70px)',
        }}
        animate={{
          x: ['0vw', '-6vw', '0vw'],
          y: ['0vh', '-5vh', '0vh'],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '40vmax',
          height: '40vmax',
          right: '10vmax',
          top: '10vmax',
          background:
            'radial-gradient(circle, rgba(200,168,128,0.28), transparent 65%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: ['0vw', '4vw', '0vw'],
          y: ['0vh', '4vh', '0vh'],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Persistent corner brand mark (open + close already feature it large; this is a quiet always-on signature) */}
      <motion.div
        aria-hidden
        className="absolute top-6 left-6 z-30 flex items-center gap-2"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 0.85, x: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <img
          src={`${import.meta.env.BASE_URL}mobile/logo_mark_hires.svg`}
          alt=""
          style={{
            width: 28,
            height: 28,
            filter: 'drop-shadow(0 2px 8px rgba(184,160,200,0.5))',
          }}
        />
        <span
          className="text-[11px] uppercase tracking-[0.32em] text-white/70"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
        >
          NexFlow
        </span>
      </motion.div>

      {/* SceneOpen background "luxury reveal" lives behind the phone only on open */}
      <AnimatePresence initial={false} mode="wait">
        {baseSceneKey === 'open' && (
          <motion.div
            key="open-bg"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SceneOpen />
          </motion.div>
        )}
        {baseSceneKey === 'payoff' && (
          <motion.div
            key="payoff-tagline"
            className="absolute inset-0 flex items-center justify-center pl-[6vw]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full max-w-[1300px] mx-auto flex items-center justify-start pl-[8vw]">
              <PayoffTagline />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PERSISTENT phone — never unmounts, transforms by currentScene */}
      <div
        className="absolute inset-0 flex items-center justify-center z-20"
        style={{ perspective: '1600px' }}
      >
        <motion.div
          animate={{
            x: pose.x,
            y: pose.y,
            scale: pose.scale,
            rotateY: pose.rotateY,
            rotateX: pose.rotateX,
            rotateZ: pose.rotateZ,
          }}
          initial={{
            x: '0vw',
            y: '20vh',
            scale: 0.7,
            rotateY: -40,
            rotateX: 25,
            rotateZ: -10,
          }}
          transition={{
            type: 'spring',
            stiffness: 60,
            damping: 18,
            mass: 1.2,
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Continuous gentle drift on top of scene pose */}
          <motion.div
            animate={{
              y: [0, -10, 0, 8, 0],
              rotateZ: [0, 1.2, 0, -1.2, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <PhoneFrame glow={glow}>
              <PhoneScreen sceneKey={baseSceneKey} />
            </PhoneFrame>
          </motion.div>
        </motion.div>
      </div>

      {/* Soft floor light under phone for product-photo feel */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 bottom-[6vh] rounded-full pointer-events-none z-10"
        style={{
          width: 520,
          height: 80,
          background:
            'radial-gradient(ellipse, rgba(184,160,200,0.4), transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.55, 0.75, 0.55] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
