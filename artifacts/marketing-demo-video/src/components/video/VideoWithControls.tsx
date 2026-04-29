import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Download, Loader2, Repeat, Volume2, VolumeX } from 'lucide-react';
import VideoTemplate, { SCENE_DURATIONS } from './VideoTemplate';
import { useSceneControls } from '@/lib/video/useSceneControls';
import { useAmbientAudio } from '@/lib/video/useAmbientAudio';
import { useTabRecorder } from '@/lib/video/useTabRecorder';

const PROGRESS_TICK_MS = 60;

interface ControlBarProps {
  visible: boolean;
  collapsed: boolean;
  locked: boolean;
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  tick: number;
  onToggleLock: () => void;
  onJumpTo: (index: number) => void;
  onToggleCollapsed: () => void;
}

function ProgressSegments({
  sceneKeys,
  activeIndex,
  activeDuration,
  tick,
  onJumpTo,
}: {
  sceneKeys: string[];
  activeIndex: number;
  activeDuration: number;
  tick: number;
  onJumpTo: (index: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const start = performance.now();
    const id = window.setInterval(() => {
      setElapsed(performance.now() - start);
    }, PROGRESS_TICK_MS);
    return () => window.clearInterval(id);
  }, [tick]);

  const progress = activeDuration > 0 ? Math.min(1, elapsed / activeDuration) : 0;

  return (
    <div className="flex-1 flex items-center gap-1.5">
      {sceneKeys.map((key, i) => {
        const isActive = i === activeIndex;
        const fill = isActive ? progress * 100 : 0;
        return (
          <button
            key={key}
            onClick={() => onJumpTo(i)}
            className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-4 hover:bg-white/25 transition-all relative min-h-[12px]"
            aria-label={`Jump to scene ${i + 1}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <div
              className="absolute inset-y-0 left-0 bg-white/90 rounded-full transition-[width] duration-100"
              style={{ width: `${fill}%` }}
            />
          </button>
        );
      })}
    </div>
  );
}

function ControlBar({
  visible,
  collapsed,
  locked,
  sceneKeys,
  activeIndex,
  activeDuration,
  tick,
  onToggleLock,
  onJumpTo,
  onToggleCollapsed,
}: ControlBarProps) {
  return (
    <div
      className={`flex items-center gap-3 bg-black/50 backdrop-blur-sm px-5 py-4 transition-all duration-200 ease-out ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      <button
        onClick={onToggleLock}
        className={`w-14 h-14 flex items-center justify-center transition-colors rounded-lg shrink-0 ${
          locked
            ? 'text-white bg-white/15 hover:bg-white/25'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        title={locked ? 'Loop current scene: on' : 'Loop current scene: off'}
        aria-label={locked ? 'Loop current scene: on' : 'Loop current scene: off'}
        aria-pressed={locked}
      >
        <Repeat className="w-8 h-8" />
      </button>

      <div className="w-px self-stretch bg-white/15" aria-hidden="true" />

      <ProgressSegments
        sceneKeys={sceneKeys}
        activeIndex={activeIndex}
        activeDuration={activeDuration}
        tick={tick}
        onJumpTo={onJumpTo}
      />

      <div className="text-xl text-white/60 font-mono tabular-nums shrink-0">
        {activeIndex + 1}/{sceneKeys.length}
      </div>

      <button
        onClick={onToggleCollapsed}
        className="w-14 h-14 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded-lg shrink-0"
        title={collapsed ? 'Show controls' : 'Hide controls'}
        aria-label={collapsed ? 'Show controls' : 'Hide controls'}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronUp className="w-10 h-10" /> : <ChevronDown className="w-10 h-10" />}
      </button>
    </div>
  );
}

function PreRenderedDownloadButton() {
  // Vite serves /public at the BASE_URL root, so a build artifact under
  // public/exports is reachable from the browser at <BASE_URL>exports/...
  const href = `${import.meta.env.BASE_URL}exports/nexflow-marketing-demo.mp4`;
  return (
    <div className="absolute top-5 right-[470px] z-50 flex flex-col items-end gap-2 max-w-[420px]">
      <a
        href={href}
        download="nexflow-marketing-demo.mp4"
        className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full backdrop-blur-md transition-all hover:scale-105 cursor-pointer no-underline"
        style={{
          background: 'linear-gradient(90deg, rgba(45,30,60,0.95), rgba(72,52,88,0.95))',
          boxShadow: '0 10px 30px rgba(45,30,60,0.36)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
        aria-label="Download pre-rendered MP4"
      >
        <Download className="w-5 h-5 text-white" />
        <span className="text-[13px] font-semibold text-white tracking-wide">
          Download MP4 · 90s · with audio
        </span>
      </a>
      <div
        className="px-3 py-1.5 rounded-lg text-[11px] text-white/95 max-w-[300px] text-right leading-snug"
        style={{
          background: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        Server-rendered investor cut · 26 MB · plays everywhere
      </div>
    </div>
  );
}

function RecorderButton({
  status,
  progress,
  errorMessage,
  totalSeconds,
  onRecord,
  onCancel,
}: {
  status: 'idle' | 'preparing' | 'recording' | 'finalizing' | 'error';
  progress: number;
  errorMessage: string | null;
  totalSeconds: number;
  onRecord: () => void;
  onCancel: () => void;
}) {
  const isBusy = status === 'preparing' || status === 'recording' || status === 'finalizing';
  const remaining = Math.max(0, Math.ceil(totalSeconds - progress * totalSeconds));

  let label = `Download MP4 · ${totalSeconds}s`;
  if (status === 'preparing') label = 'Pick this tab to share…';
  else if (status === 'recording') label = `Recording… ${remaining}s left`;
  else if (status === 'finalizing') label = 'Saving file…';
  else if (status === 'error') label = 'Try again';

  return (
    <div className="absolute top-5 right-44 z-50 flex flex-col items-end gap-2 max-w-[420px]">
      <button
        onClick={isBusy ? onCancel : onRecord}
        className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
        style={{
          background:
            status === 'recording'
              ? 'linear-gradient(90deg, #C24A4A, #9C3838)'
              : 'linear-gradient(90deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))',
          boxShadow: '0 10px 30px rgba(45,30,60,0.28)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
        aria-label={label}
      >
        {status === 'preparing' || status === 'finalizing' ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : status === 'recording' ? (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
        ) : (
          <Download className="w-5 h-5 text-white" />
        )}
        <span className="text-[13px] font-semibold text-white tracking-wide">{label}</span>
      </button>

      {status === 'recording' && (
        <div
          className="w-[280px] h-1.5 bg-white/30 rounded-full overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full bg-white/95 transition-[width] duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {status === 'error' && errorMessage && (
        <div
          className="px-3 py-2 rounded-lg text-[12px] text-white max-w-[300px] text-right"
          style={{
            background: 'rgba(156,56,56,0.92)',
            boxShadow: '0 6px 18px rgba(156,56,56,0.3)',
          }}
        >
          {errorMessage}
        </div>
      )}

      {status === 'idle' && (
        <div
          className="px-3 py-1.5 rounded-lg text-[11px] text-white/95 max-w-[300px] text-right leading-snug"
          style={{
            background: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          You'll be asked to share <b>this tab</b> · audio is included
        </div>
      )}
    </div>
  );
}

function SoundToggle({
  enabled,
  muted,
  onToggle,
}: {
  enabled: boolean;
  muted: boolean;
  onToggle: () => void;
}) {
  const showHint = !enabled;
  return (
    <button
      onClick={onToggle}
      className="absolute top-5 right-5 z-50 group flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full backdrop-blur-md transition-all hover:scale-105"
      style={{
        background: showHint
          ? 'linear-gradient(90deg, rgba(184,160,200,0.95), rgba(136,184,176,0.95))'
          : 'rgba(17, 24, 39, 0.65)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.18)',
        border: '1px solid rgba(255,255,255,0.25)',
      }}
      aria-label={!enabled ? 'Enable sound' : muted ? 'Unmute' : 'Mute'}
      aria-pressed={enabled && !muted}
    >
      {!enabled || muted ? (
        <VolumeX className="w-5 h-5 text-white" />
      ) : (
        <Volume2 className="w-5 h-5 text-white" />
      )}
      <span className="text-[13px] font-semibold text-white tracking-wide">
        {!enabled ? 'Tap for sound' : muted ? 'Sound off' : 'Sound on'}
      </span>
    </button>
  );
}

export default function VideoWithControls() {
  const isIframed = typeof window !== 'undefined' && window.self !== window.top;

  const {
    sceneKeys,
    activeIndex,
    locked,
    mountKey,
    tick,
    durations,
    activeDuration,
    onSceneChange,
    jumpTo,
    toggleLock,
  } = useSceneControls(SCENE_DURATIONS);

  const {
    enabled: audioEnabled,
    muted: audioMuted,
    enable: enableAudio,
    toggleMute,
    audioRef,
    audioUrl,
  } = useAmbientAudio();

  const recorder = useTabRecorder();
  const totalDurationMs = useMemo(
    () => Object.values(SCENE_DURATIONS).reduce((a, b) => a + b, 0),
    [],
  );

  const handleRecord = useCallback(() => {
    if (recorder.status === 'recording' || recorder.status === 'preparing') return;
    void recorder.start({
      durationMs: totalDurationMs,
      audioUrl,
      onStart: () => {
        // Reset video timeline to scene 1 the moment recording starts
        jumpTo(0);
        // Also mute the on-page audio so we don't double-play (recorder injects its own)
        const el = audioRef.current;
        if (el) el.muted = true;
      },
    });
  }, [recorder, totalDurationMs, audioUrl, jumpTo, audioRef]);

  const sensorRef = useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tapPinned, setTapPinned] = useState(false);

  const handlePointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') setHovering(true);
  }, []);
  const handlePointerLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') setHovering(false);
  }, []);
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse') return;
      if (collapsed) setTapPinned(true);
    },
    [collapsed],
  );
  const handleToggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      if (!c) {
        setHovering(false);
        setTapPinned(false);
      }
      return !c;
    });
  }, []);

  useEffect(() => {
    if (!(collapsed && tapPinned)) return;
    const onDocPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      const sensor = sensorRef.current;
      if (sensor && !sensor.contains(e.target as Node)) setTapPinned(false);
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [collapsed, tapPinned]);

  const handleSoundToggle = useCallback(() => {
    if (!audioEnabled) {
      void enableAudio();
    } else {
      toggleMute();
    }
  }, [audioEnabled, enableAudio, toggleMute]);

  const barVisible = !collapsed || hovering || tapPinned;

  // Export path: clean video for the recorder, no controls, no audio button
  if (!isIframed) return <VideoTemplate />;

  return (
    <div className="relative w-full h-screen">
      <VideoTemplate
        key={mountKey}
        durations={durations}
        loop
        onSceneChange={onSceneChange}
      />

      {/* Hidden audio element — autoplays muted, auto-unmutes on first user gesture */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{ display: 'none' }}
      />

      <SoundToggle
        enabled={audioEnabled}
        muted={audioMuted}
        onToggle={handleSoundToggle}
      />

      {/* Pre-rendered MP4 download button (primary, reliable path) */}
      <PreRenderedDownloadButton />

      {/* Real in-browser recorder button (secondary "re-record live" path) */}
      <RecorderButton
        status={recorder.status}
        progress={recorder.progress}
        errorMessage={recorder.errorMessage}
        totalSeconds={Math.round(totalDurationMs / 1000)}
        onRecord={handleRecord}
        onCancel={recorder.cancel}
      />

      <div
        ref={sensorRef}
        className="absolute bottom-0 left-0 right-0 z-50 flex flex-col justify-end"
        style={{ height: '25%' }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <div className="flex-1 w-full" aria-hidden="true" />
        <ControlBar
          visible={barVisible}
          collapsed={collapsed}
          locked={locked}
          sceneKeys={sceneKeys}
          activeIndex={activeIndex}
          activeDuration={activeDuration}
          tick={tick}
          onToggleLock={toggleLock}
          onJumpTo={jumpTo}
          onToggleCollapsed={handleToggleCollapsed}
        />
      </div>
    </div>
  );
}
