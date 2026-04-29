import { AnimatePresence, motion } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';
import { useEffect, useRef } from 'react';

export const SCENE_DURATIONS = {
  scene1: 10000,
  scene2: 12000,
  scene3: 15000,
  scene4: 12000,
  scene5: 10000,
  scene6: 10000,
  scene7: 12000,
  scene8: 9000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  scene1: Scene1,
  scene2: Scene2,
  scene3: Scene3,
  scene4: Scene4,
  scene5: Scene5,
  scene6: Scene6,
  scene7: Scene7,
  scene8: Scene8,
};

interface VideoTemplateProps {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
}

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: VideoTemplateProps = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx: AudioContext = new AudioCtx();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.06;
    masterGain.connect(ctx.destination);

    const makePad = (freq: number, detune = 0) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 6;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      lfo.start();
      return { osc, lfo };
    };

    const voices = [makePad(220), makePad(277.18, 4), makePad(329.63, -4)];

    const resume = () => {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    };
    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });

    return () => {
      voices.forEach((v) => {
        try {
          v.osc.stop();
          v.lfo.stop();
        } catch {}
      });
      ctx.close().catch(() => {});
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
  }, []);

  const baseSceneKey = currentSceneKey.replace(
    /_r[12]$/,
    '',
  ) as keyof typeof SCENE_DURATIONS;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F8F5F0]">
      {/* Persistent mesh background */}
      <div className="absolute inset-0 mesh-bg z-0" />

      {/* Persistent chameleon abstract elements */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full opacity-30 blur-3xl"
        style={{ background: 'var(--color-primary)' }}
        animate={{
          x: ['-20vw', '40vw', '10vw', '-20vw'],
          y: ['-10vh', '30vh', '60vh', '-10vh'],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[35vw] h-[35vw] rounded-full opacity-30 blur-3xl right-0 bottom-0"
        style={{ background: 'var(--color-secondary)' }}
        animate={{
          x: ['10vw', '-50vw', '20vw', '10vw'],
          y: ['10vh', '-20vh', '-50vh', '10vh'],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      />

      <AnimatePresence initial={false} mode="wait">
        {SceneComponent && (() => {
          const C = SceneComponent;
          return <C key={currentSceneKey} />;
        })()}
      </AnimatePresence>
    </div>
  );
}
