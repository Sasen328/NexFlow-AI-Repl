import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';
import { SceneAllTools } from './video_scenes/SceneAllTools';
import {
  SceneHook,
  ScenePain1,
  ScenePain2,
  ScenePain3,
  ScenePain4,
  SceneReveal,
} from './video_scenes/ScenesPainPoints';
import { useEffect } from 'react';

export const SCENE_DURATIONS = {
  sceneHook: 5000,
  scenePain1: 4500,
  scenePain2: 4500,
  scenePain3: 4500,
  scenePain4: 4500,
  sceneReveal: 4000,
  scene2: 8000,
  scene3: 8000,
  scene4: 6000,
  scene5: 6000,
  scene6: 6000,
  scene7: 7000,
  sceneAllTools: 13000,
  scene8: 9000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  sceneHook: SceneHook,
  scenePain1: ScenePain1,
  scenePain2: ScenePain2,
  scenePain3: ScenePain3,
  scenePain4: ScenePain4,
  sceneReveal: SceneReveal,
  scene2: Scene2,
  scene3: Scene3,
  scene4: Scene4,
  scene5: Scene5,
  scene6: Scene6,
  scene7: Scene7,
  sceneAllTools: SceneAllTools,
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

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(
    /_r[12]$/,
    '',
  ) as keyof typeof SCENE_DURATIONS;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F8F5F0]">
      {/* Persistent mesh background — stays mounted across scenes */}
      <div className="absolute inset-0 mesh-bg z-0" />

      <AnimatePresence initial={false} mode="wait">
        {SceneComponent &&
          (() => {
            const C = SceneComponent;
            return <C key={currentSceneKey} />;
          })()}
      </AnimatePresence>
    </div>
  );
}
