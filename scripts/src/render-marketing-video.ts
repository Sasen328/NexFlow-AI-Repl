/**
 * Server-side renderer for the NexFlow marketing demo video.
 *
 * The browser-based MediaRecorder approach (getDisplayMedia from inside the
 * workspace iframe) is unreliable: when the share-tab picker steals focus,
 * the iframe's setTimeout (used by useVideoPlayer for scene advancement) gets
 * throttled and scenes never advance — producing a 90s video with only the
 * first frame.
 *
 * This script renders the video deterministically:
 *   1. Launches headless Chromium via Playwright at 1280×720, 30fps
 *   2. Opens the running marketing-demo-video dev server (the standalone
 *      route renders <VideoTemplate /> with no controls)
 *   3. Records the page with Playwright's built-in video capture
 *   4. Generates an ambient warm-pad audio track with ffmpeg
 *   5. Muxes audio + video into final MP4 (H.264 + AAC)
 *   6. Writes the file to the marketing-demo-video public/ folder so it can
 *      be downloaded directly
 *
 * Run with:  pnpm --filter @workspace/scripts run render-video
 */

import { chromium } from 'playwright';
import { mkdir, rm, writeFile, readdir, rename } from 'node:fs/promises';
import { existsSync, createReadStream, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

// page.evaluate / page.waitForFunction callbacks execute inside the browser,
// where `document` exists. Our scripts tsconfig only ships the node lib so we
// declare an ambient stand-in to keep the typechecker happy.
declare const document: any;

const VIDEO_DURATION_SECONDS = 90; // matches the 90s investor-cut runtime
const VIEWPORT = { width: 1280, height: 720 };

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const TMP_DIR = path.join(REPO_ROOT, '.local/tmp/render-video');
const OUT_DIR = path.join(REPO_ROOT, 'artifacts/marketing-demo-video/public/exports');
const OUT_FILE = path.join(OUT_DIR, 'nexflow-marketing-demo.mp4');
const VIDEO_APP_DIR = path.join(REPO_ROOT, 'artifacts/marketing-demo-video');
const VIDEO_DIST_DIR = path.join(VIDEO_APP_DIR, 'dist/public');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
};

function logStep(step: string, detail?: string): void {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${step}${detail ? `: ${detail}` : ''}`);
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    logStep('ffmpeg', args.join(' '));
    const child = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'warning', ...args], {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

/**
 * Synthesize a warm ambient pad similar to the in-app generator: a 220Hz root
 * with overtones at 330, 440, and 660Hz, with a slow LFO on amplitude. We
 * build it via ffmpeg's sine source + amix + tremolo filter.
 */
async function buildAmbientAudio(durationSeconds: number, outFile: string): Promise<void> {
  const args: string[] = [
    '-f', 'lavfi', '-i', `sine=frequency=220:duration=${durationSeconds}`,
    '-f', 'lavfi', '-i', `sine=frequency=330:duration=${durationSeconds}`,
    '-f', 'lavfi', '-i', `sine=frequency=440:duration=${durationSeconds}`,
    '-f', 'lavfi', '-i', `sine=frequency=660:duration=${durationSeconds}`,
    '-filter_complex',
    [
      // Mix the four sine waves with descending weights for a warm pad
      '[0]volume=0.55[a0]',
      '[1]volume=0.35[a1]',
      '[2]volume=0.25[a2]',
      '[3]volume=0.18[a3]',
      '[a0][a1][a2][a3]amix=inputs=4:normalize=0[mix]',
      // Apply gentle tremolo (slow LFO on amplitude) for a "breathing" feel.
      // ffmpeg's tremolo filter requires f >= 0.1, so 0.12 is the slowest
      // breathy pulse we can use.
      '[mix]tremolo=f=0.12:d=0.18[treml]',
      // Add a soft fade in/out and lowpass to smooth harshness
      '[treml]lowpass=f=1500,afade=t=in:st=0:d=2,afade=t=out:st=' +
        (durationSeconds - 2) + ':d=2,volume=0.45[out]',
    ].join(';'),
    '-map', '[out]', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le',
    outFile,
  ];
  await runFfmpeg(args);
}

function buildSiteIfMissing(): Promise<void> {
  if (existsSync(path.join(VIDEO_DIST_DIR, 'index.html'))) {
    logStep('Using existing build', VIDEO_DIST_DIR);
    return Promise.resolve();
  }
  logStep('Building marketing-demo-video site');
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['--filter', '@workspace/marketing-demo-video', 'run', 'build'], {
      stdio: ['ignore', 'inherit', 'inherit'],
      cwd: REPO_ROOT,
      // The video artifact's vite.config.ts requires PORT and BASE_PATH at
      // build time so asset URLs are prefixed correctly. We use the same
      // values the production deployment uses.
      env: { ...process.env, PORT: '19255', BASE_PATH: '/marketing-demo-video/' },
    });
    child.on('error', reject);
    child.on('exit', (c) => (c === 0 ? resolve() : reject(new Error(`build exit ${c}`))));
  });
}

function startStaticServer(rootDir: string, basePath: string): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let url = req.url ?? '/';
      // Strip query string
      const qIdx = url.indexOf('?');
      if (qIdx >= 0) url = url.slice(0, qIdx);
      // Strip leading basePath
      if (basePath !== '/' && url.startsWith(basePath)) {
        url = url.slice(basePath.length);
        if (!url.startsWith('/')) url = '/' + url;
      }
      // Default to index.html
      let filePath = path.join(rootDir, url);
      try {
        const s = statSync(filePath);
        if (s.isDirectory()) filePath = path.join(filePath, 'index.html');
      } catch {
        // SPA fallback
        filePath = path.join(rootDir, 'index.html');
      }
      try {
        const s = statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME[ext] ?? 'application/octet-stream',
          'Content-Length': s.size,
          'Cache-Control': 'no-store',
        });
        createReadStream(filePath).pipe(res);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      const url = `http://127.0.0.1:${port}${basePath}`;
      logStep('Static server started', url);
      resolve({
        url,
        close: () => new Promise<void>((res2) => server.close(() => res2())),
      });
    });
  });
}

async function recordPage(outDir: string, targetUrl: string): Promise<string> {
  logStep('Launching headless Chromium');
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: outDir, size: VIEWPORT },
    // Forbid bypassing CSP / animations
    reducedMotion: 'no-preference',
    colorScheme: 'light',
  });

  const page = await context.newPage();

  // Capture browser console so we can debug if something goes wrong
  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error' || t === 'warning') {
      console.log(`  [browser ${t}]`, msg.text());
    }
  });
  page.on('pageerror', (err) => console.log('  [browser exception]', err.message));

  logStep('Navigating', targetUrl);
  // Use 'load' instead of 'networkidle' — networkidle never fires for SPAs
  // that keep open connections (HMR, websocket, etc).
  await page.goto(targetUrl, { waitUntil: 'load', timeout: 30_000 });
  logStep('Page loaded');

  // Wait for the React app to mount (its root element should have at least
  // one child). 5s is generous for a static build.
  await page
    .waitForFunction(
      () => {
        const root = document.getElementById('root') ?? document.body;
        return !!(root && root.firstElementChild);
      },
      undefined,
      { timeout: 10_000 },
    )
    .catch(() => logStep('WARN: app mount check timed out, continuing anyway'));
  logStep('App mounted');

  // Force the page to remain "visible" so requestAnimationFrame is not throttled
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: false });
    Object.defineProperty(document, 'hidden', { value: false, writable: false });
  });

  // Hard-reload the page so React mounts fresh and the scene timeline starts
  // from t=0 *exactly* when our recording window starts. Without this the
  // 1.5s settle + chromium boot drifts the timeline and we'd capture the
  // first frames of the next loop instead of the final frame of scene 12.
  await page.reload({ waitUntil: 'load', timeout: 15_000 });
  await page
    .waitForFunction(
      () => {
        const root = document.getElementById('root') ?? document.body;
        return !!(root && root.firstElementChild);
      },
      undefined,
      { timeout: 5_000 },
    )
    .catch(() => logStep('WARN: app remount check timed out, continuing anyway'));
  // Re-apply visibility hint after reload
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: false });
    Object.defineProperty(document, 'hidden', { value: false, writable: false });
  });

  logStep(`Recording for ${VIDEO_DURATION_SECONDS}s`);
  await page.waitForTimeout(VIDEO_DURATION_SECONDS * 1000);

  logStep('Closing context (finalizing video)');
  await page.close();
  await context.close();
  await browser.close();
  logStep('Browser closed');

  // Playwright writes a randomly-named .webm into outDir. Find and return it.
  const files = await readdir(outDir);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error(`Playwright did not produce a webm file in ${outDir}`);
  return path.join(outDir, webm);
}

async function main(): Promise<void> {
  // Clean tmp + ensure output dir exists
  if (existsSync(TMP_DIR)) await rm(TMP_DIR, { recursive: true, force: true });
  await mkdir(TMP_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  // 0. Build the marketing-demo-video site (skipped if already built) and
  //    serve it from a private static server so we are immune to the dev
  //    server restarting underneath us during the long recording window.
  await buildSiteIfMissing();
  const server = await startStaticServer(VIDEO_DIST_DIR, '/marketing-demo-video/');

  let silentVideo: string;
  try {
    // 1. Record the silent video via headless Chromium
    silentVideo = await recordPage(TMP_DIR, server.url);
    logStep('Silent video captured', silentVideo);
  } finally {
    await server.close();
  }

  // 2. Synthesize the ambient audio track at the same length
  const ambientAudio = path.join(TMP_DIR, 'ambient.wav');
  await buildAmbientAudio(VIDEO_DURATION_SECONDS, ambientAudio);

  // 3. Mux video + audio into final MP4 (H.264 + AAC). We re-encode video
  //    because the source is VP8/9 webm; H.264 ensures broad playback (Twitter,
  //    LinkedIn, Keynote, QuickTime, etc.).
  await runFfmpeg([
    '-i', silentVideo,
    '-i', ambientAudio,
    // ultrafast keeps the encode well within the bash command-window budget;
    // file is larger but still under ~15 MB for 90s @ 720p.
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '22', '-pix_fmt', 'yuv420p',
    '-vf', `scale=${VIEWPORT.width}:${VIEWPORT.height},fps=30`,
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
    '-shortest',
    '-movflags', '+faststart',
    OUT_FILE,
  ]);

  // Also write a copy with a date suffix so older versions remain available
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const stampedCopy = path.join(OUT_DIR, `nexflow-marketing-demo-${stamp}.mp4`);
  await rename(silentVideo, path.join(TMP_DIR, 'silent.webm')); // tidy
  // copy is cheap because we already wrote OUT_FILE
  await runFfmpeg(['-i', OUT_FILE, '-c', 'copy', stampedCopy]);

  // Tiny manifest so the public download page can list the latest export
  await writeFile(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(
      { latest: 'nexflow-marketing-demo.mp4', stamp, durationSeconds: VIDEO_DURATION_SECONDS - 1 },
      null,
      2,
    ),
  );

  logStep('Done', OUT_FILE);
}

main().catch((err) => {
  console.error('[render-video] failed:', err);
  process.exit(1);
});
