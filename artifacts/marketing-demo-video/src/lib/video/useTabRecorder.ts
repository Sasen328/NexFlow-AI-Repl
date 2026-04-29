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

export function useTabRecorder(): UseTabRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);

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
    setStatus('idle');
    setProgress(0);
  }, [cleanup]);

  const start = useCallback(
    async ({ durationMs, audioUrl, onStart }: StartOptions) => {
      setErrorMessage(null);
      setStatus('preparing');
      setProgress(0);

      try {
        // 1. Ask user to share this tab
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: 30,
          },
          audio: false,
        });
        displayStreamRef.current = displayStream;

        // 2. Build a fresh audio source from the WAV blob URL → MediaStreamDestination
        const audioCtx = new AudioContext();
        audioCtxRef.current = audioCtx;
        const resp = await fetch(audioUrl);
        const arrayBuf = await resp.arrayBuffer();
        const audioBuf = await audioCtx.decodeAudioData(arrayBuf);

        const dest = audioCtx.createMediaStreamDestination();
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuf;
        source.loop = true;

        const gain = audioCtx.createGain();
        gain.gain.value = 0.55;
        source.connect(gain);
        gain.connect(dest);

        audioSourceRef.current = source;

        // 3. Combine display video + injected audio into one stream
        const combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ]);

        // 4. If user revokes the tab share, abort cleanly
        displayStream.getVideoTracks()[0]?.addEventListener('ended', () => {
          if (status === 'recording') cancel();
        });

        // 5. Record
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
          setStatus('finalizing');
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
          setStatus('idle');
          setProgress(1);
        };

        // 6. Kick off — start audio + recorder, then signal video to restart
        source.start(0);
        recorder.start(250);
        setStatus('recording');
        onStart?.();

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
        setStatus('error');
        cleanup();
      }
    },
    [cancel, cleanup, status],
  );

  return { status, progress, errorMessage, start, cancel };
}
