import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { useEffect } from 'react';
import { Scene1Setup } from './scenes/Scene1Setup';
import { Scene2CallOpen } from './scenes/Scene2CallOpen';
import { Scene3CallMid } from './scenes/Scene3CallMid';
import { Scene4Intel } from './scenes/Scene4Intel';
import { Scene5Payoff } from './scenes/Scene5Payoff';
import { Waveform } from './scenes/Waveform';

export const SCENE_DURATIONS = {
  setup: 6000,
  callOpen: 10000,
  callMid: 10000,
  intel: 12000,
  payoff: 7000,
};

interface VideoTemplateProps {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
}

const SCENES: Record<string, React.ComponentType> = {
  setup: Scene1Setup,
  callOpen: Scene2CallOpen,
  callMid: Scene3CallMid,
  intel: Scene4Intel,
  payoff: Scene5Payoff,
};

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300..800&display=swap';

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: VideoTemplateProps = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    if (document.querySelector(`link[data-layla-fonts]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    link.setAttribute('data-layla-fonts', 'true');
    document.head.appendChild(link);
  }, []);

  const Scene = SCENES[currentSceneKey] ?? Scene1Setup;

  // Persistent waveform position/scale per scene
  const waveformPos: Record<
    string,
    { x: string; y: string; scale: number; opacity: number; width: string }
  > = {
    setup: { x: '0vw', y: '0vh', scale: 1, opacity: 1, width: '40vw' },
    callOpen: { x: '-26vw', y: '0vh', scale: 0.8, opacity: 0.95, width: '36vw' },
    callMid: { x: '-26vw', y: '0vh', scale: 0.8, opacity: 0.95, width: '36vw' },
    intel: { x: '0vw', y: '32vh', scale: 0.45, opacity: 0.55, width: '40vw' },
    payoff: { x: '0vw', y: '0vh', scale: 0.7, opacity: 0.35, width: '40vw' },
  };
  const wf = waveformPos[currentSceneKey] ?? waveformPos.setup;

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, #2A2230 0%, #1F1A24 55%, #161219 100%)',
        fontFamily: "'Inter', sans-serif",
        color: '#F1ECF4',
      }}
    >
      {/* Persistent ambient layers */}
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '70vw',
          height: '70vw',
          left: '-15vw',
          top: '-25vw',
          background:
            'radial-gradient(circle, rgba(184,160,200,0.28), transparent 65%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, 40, -10, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute rounded-full pointer-events-none"
        style={{
          width: '55vw',
          height: '55vw',
          right: '-15vw',
          bottom: '-20vw',
          background:
            'radial-gradient(circle, rgba(136,184,176,0.22), transparent 65%)',
          filter: 'blur(70px)',
        }}
        animate={{ x: [0, -30, 20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Persistent diamond mark in top-right corner */}
      <motion.img
        src={`${import.meta.env.BASE_URL}layla/logo_mark_hires.svg`}
        alt=""
        className="absolute pointer-events-none select-none"
        style={{
          top: '4vh',
          right: '4vh',
          width: '5vw',
          height: '5vw',
          opacity: 0.55,
        }}
        animate={{
          rotate: [0, 360],
          scale: currentSceneKey === 'payoff' ? 1.4 : 1,
        }}
        transition={{
          rotate: { duration: 24, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
        }}
      />

      {/* Persistent waveform — moves between scenes */}
      <motion.div
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{ translateX: '-50%', translateY: '-50%' }}
        animate={{
          x: wf.x,
          y: wf.y,
          scale: wf.scale,
          opacity: wf.opacity,
        }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <Waveform width={wf.width} sceneKey={currentSceneKey} />
      </motion.div>

      <AnimatePresence initial={false} mode="wait">
        <Scene key={currentSceneKey} />
      </AnimatePresence>

      {/* Persistent footer wordmark hint */}
      <div
        className="absolute bottom-[3vh] left-1/2 -translate-x-1/2 text-[0.7vw] tracking-[0.5em] uppercase"
        style={{ color: 'rgba(241,236,244,0.35)' }}
      >
        NexFlow · AI Voice · Layla
      </div>
    </div>
  );
}
