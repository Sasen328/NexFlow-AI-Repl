import { useCallback, useRef, useState } from 'react';

export type RecorderStatus =
  | 'idle'
  | 'preparing'
  | 'recording'
  | 'finalizing'
  | 'error';

interface StartOptions {
  durationMs: number;
  audioUrl: string;
  onStart?: () => void;
}

interface UseTabRecorderReturn {
  status: RecorderStatus;
  progress: number;
  errorMessage: string | null;
  start: (opts: StartOptions) => Promise<void>;
  cancel: () => void;
}

function pickMime(): { mime: string; ext: string } {
  const candidates: Array<{ mime: string; ext: string }> = [
    { mime: 'video/mp4;codecs=avc1,mp4a.40.2', ext: 'mp4' },
    { mime: 'video/mp4', ext: 'mp4' },
    { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
    { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
    { mime: 'video/webm', ext: 'webm' },
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c.mime)) {
      return c;
    }
  }
  return { mime: '', ext: 'webm' };
}

/**
 * Builds an audio MediaStream from a WAV blob URL by decoding it through an
 * AudioContext. Returns null if decoding fails so the caller can fall back to
 * a synthesized oscillator-based stream.
 */
async function buildDecodedAudioStream(
  audioCtx: AudioContext,
  audioUrl: string,
): Promise<{ source: AudioBufferSourceNode; stream: MediaStream } | null> {
  try {
    const resp = await fetch(audioUrl);
    if (!resp.ok) return null;
    const arrayBuf = await resp.arrayBuffer();
    const audioBuf = await audioCtx.decodeAudioData(arrayBuf.slice(0));
    const dest = audioCtx.createMediaStreamDestination();
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuf;
    source.loop = true;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.55;
    source.connect(gain);
    gain.connect(dest);
    return { source, stream: dest.stream };
  } catch (err) {
    console.warn('[recorder] decodeAudioData failed, will use oscillator fallback:', err);
    return null;
  }
}

/**
 * Synthesized fallback ambient: warm pad built from oscillators. Always works
 * because it doesn't rely on decoding any external file.
 */
function buildOscillatorAudioStream(audioCtx: AudioContext): {
  stop: () => void;
  stream: MediaStream;
} {
  const dest = audioCtx.createMediaStreamDestination();
  const master = audioCtx.createGain();
  master.gain.value = 0.18;
  master.connect(dest);

  // Warm chord: 220Hz root with overtones at fifth, octave
  const partials = [
    { freq: 220, amp: 0.55 },
    { freq: 220 * 1.5, amp: 0.35 },
    { freq: 440, amp: 0.25 },
    { freq: 660, amp: 0.18 },
  ];

  const oscs: OscillatorNode[] = [];
  for (const p of partials) {
    const o = audioCtx.createOscillator();
    o.type = 'sine';
    o.frequency.value = p.freq;
    const g = audioCtx.createGain();
    g.gain.value = p.amp;
    o.connect(g);
    g.connect(master);
    o.start();
    oscs.push(o);
  }

  // Gentle LFO on master amplitude for "breathing" feel
  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.09;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.08;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();

  return {
    stream: dest.stream,
    stop: () => {
      try {
        for (const o of oscs) o.stop();
        lfo.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

export function useTabRecorder(): UseTabRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const oscStopRef = useRef<(() => void) | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const statusRef = useRef<RecorderStatus>('idle');

  const setStatusBoth = useCallback((s: RecorderStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const cleanup = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    try {
      audioSourceRef.current?.stop();
    } catch {
      /* already stopped */
    }
    audioSourceRef.current = null;
    if (oscStopRef.current) {
      oscStopRef.current();
      oscStopRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    if (displayStreamRef.current) {
      displayStreamRef.current.getTracks().forEach((t) => t.stop());
      displayStreamRef.current = null;
    }
    recorderRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    try {
      recorderRef.current?.stop();
    } catch {
      /* noop */
    }
    cleanup();
    setStatusBoth('idle');
    setProgress(0);
  }, [cleanup, setStatusBoth]);

  const start = useCallback(
    async ({ durationMs, audioUrl, onStart }: StartOptions) => {
      setErrorMessage(null);
      setStatusBoth('preparing');
      setProgress(0);

      // ── Critical: create the AudioContext SYNCHRONOUSLY inside the click
      // handler, then resume it before any await. Many browsers (Safari,
      // mobile Chrome) require this to keep the audio context unlocked.
      let audioCtx: AudioContext;
      try {
        const Ctx =
          (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
            .AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) throw new Error('AudioContext not supported in this browser');
        audioCtx = new Ctx();
        audioCtxRef.current = audioCtx;
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
      } catch (err) {
        const e = err as Error;
        setErrorMessage(`Audio init failed: ${e.message ?? 'unknown'}`);
        setStatusBoth('error');
        return;
      }

      try {
        // 1. Ask user to share this tab
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30 },
          audio: false,
        });
        displayStreamRef.current = displayStream;

        // 2. Try to decode the WAV; if it fails, fall back to oscillator.
        const decoded = await buildDecodedAudioStream(audioCtx, audioUrl);
        let audioStream: MediaStream;
        if (decoded) {
          audioSourceRef.current = decoded.source;
          audioStream = decoded.stream;
        } else {
          const osc = buildOscillatorAudioStream(audioCtx);
          oscStopRef.current = osc.stop;
          audioStream = osc.stream;
        }

        // 3. Combine display video + injected audio into one stream
        const audioTracks = audioStream.getAudioTracks();
        if (audioTracks.length === 0) {
          console.warn('[recorder] no audio tracks available — exporting silent video');
        }
        const combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...audioTracks,
        ]);

        // 4. If user revokes the tab share, abort cleanly (use ref to avoid closure bug)
        displayStream.getVideoTracks()[0]?.addEventListener('ended', () => {
          if (statusRef.current === 'recording' || statusRef.current === 'preparing') {
            cancel();
          }
        });

        // 5. Build the recorder
        const { mime, ext } = pickMime();
        const recorder = new MediaRecorder(
          combinedStream,
          mime ? { mimeType: mime, videoBitsPerSecond: 4_500_000 } : undefined,
        );
        recorderRef.current = recorder;
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          setStatusBoth('finalizing');
          const blob = new Blob(chunks, { type: mime || 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          a.href = url;
          a.download = `nexflow-marketing-demo-${stamp}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 30_000);
          cleanup();
          setStatusBoth('idle');
          setProgress(1);
        };

        // 6. Signal video to remount/restart at scene 0 BEFORE we begin recording.
        //    onStart calls jumpTo(0) which bumps mountKey → triggers a fresh
        //    VideoTemplate mount on next paint.
        onStart?.();

        // 7. Wait two animation frames so React has flushed the remount and
        //    the new VideoTemplate has painted scene 0 before the recorder
        //    starts capturing frames. This is what fixes the "only first
        //    scene" bug — without it we sometimes captured stale frames.
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });

        // 8. Start audio source + recorder
        if (audioSourceRef.current) {
          try {
            audioSourceRef.current.start(0);
          } catch (err) {
            console.warn('[recorder] audio source start failed:', err);
          }
        }
        try {
          recorder.start(250);
        } catch (err) {
          throw new Error(`MediaRecorder.start failed: ${(err as Error).message}`);
        }
        setStatusBoth('recording');

        const startedAt = performance.now();
        progressTimerRef.current = window.setInterval(() => {
          const p = Math.min(1, (performance.now() - startedAt) / durationMs);
          setProgress(p);
        }, 100);

        stopTimerRef.current = window.setTimeout(() => {
          try {
            recorder.stop();
          } catch {
            /* already stopped */
          }
        }, durationMs);
      } catch (err) {
        const e = err as Error;
        setErrorMessage(
          e?.name === 'NotAllowedError'
            ? 'Screen-share permission was denied. Click "Record MP4" again and choose this tab.'
            : e?.message || 'Recording failed to start.',
        );
        setStatusBoth('error');
        cleanup();
      }
    },
    [cancel, cleanup, setStatusBoth],
  );

  return { status, progress, errorMessage, start, cancel };
}
