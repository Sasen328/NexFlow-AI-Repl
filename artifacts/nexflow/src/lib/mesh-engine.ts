/**
 * ME() — Standalone pixel-level sine-noise mesh canvas engine
 * Design System spec §2.1–2.3
 *
 * Self-contained, no external dependencies.
 * DO NOT import or modify LivingMesh.tsx — this is a parallel utility.
 */

export const QPULSE_COLS: number[][] = [
  [184, 160, 200],
  [136, 184, 176],
  [200, 168, 128],
  [192, 160, 184],
  [152, 128, 184],
];

const SC = 5;
const BG = 248;
const MX = 0.05;

function computeFields(
  nx: number,
  ny: number,
  t: number,
  mt: number
): [number, number] {
  switch (mt) {
    case 0: {
      const u =
        Math.sin(nx * 4 + t) * 0.35 +
        Math.sin(ny * 3.5 - t * 0.7) * 0.25 +
        Math.sin((nx + ny) * 3.2 + t * 1.1) * 0.2 +
        Math.sin(nx * 6 - t * 0.4) * 0.1 +
        Math.sin(ny * 7 + t * 0.9) * 0.1;
      const v =
        Math.sin(ny * 5 + t * 0.9) * 0.4 +
        Math.sin(nx * 3 + t) * 0.3 +
        Math.sin((nx - ny) * 3 - t * 0.6) * 0.2 +
        Math.sin(nx * 2 + ny * 4 + t * 0.8) * 0.1;
      return [u, v];
    }
    case 1: {
      const u =
        Math.sin(nx * 2 + t * 0.5) * 0.4 +
        Math.sin(ny * 1.5 - t * 0.3) * 0.35 +
        Math.sin((nx + ny) * 1 + t * 0.4) * 0.25;
      const v =
        Math.sin(ny * 2.5 + t * 0.4) * 0.45 +
        Math.sin(nx * 1.8 + t * 0.5) * 0.35 +
        Math.sin((nx - ny) * 1.2 + t * 0.3) * 0.2;
      return [u, v];
    }
    case 2: {
      const u =
        Math.sin(nx * 3 + ny * 2 + t) * 0.4 +
        Math.sin(nx * 2 - ny * 3 - t * 0.8) * 0.3 +
        Math.sin(nx * 5 + t * 0.7) * 0.2 +
        Math.sin(ny * 4 - t * 0.9) * 0.1;
      const v =
        Math.sin(nx * 4 - ny + t * 1.1) * 0.4 +
        Math.sin(ny * 4 + nx + t * 0.7) * 0.35 +
        Math.sin((nx + ny) * 5 - t * 0.8) * 0.25;
      return [u, v];
    }
    case 3: {
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const r = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const u =
        Math.sin(r * 10 - t * 2) * 0.4 +
        Math.sin(r * 7 + t * 1.5) * 0.3 +
        Math.sin(r * 13 - t * 2.5) * 0.2 +
        Math.cos(angle * 3 + t) * 0.1;
      const v =
        Math.sin(r * 8 + t * 1.2) * 0.4 +
        Math.cos(angle * 4 - t * 0.8) * 0.35 +
        Math.sin(r * 11 + angle * 2 + t * 1.6) * 0.25;
      return [u, v];
    }
    case 4:
    default: {
      const u =
        Math.sin(nx * 8 + t * 2) * 0.35 +
        Math.sin(ny * 6 - t * 1.5) * 0.25 +
        Math.sin((nx + ny) * 7 + t * 1.8) * 0.2 +
        Math.sin(nx * 10 - ny * 4 + t * 2.2) * 0.1 +
        Math.sin(ny * 9 + t * 1.6) * 0.1;
      const v =
        Math.sin(ny * 9 + t * 1.7) * 0.35 +
        Math.sin(nx * 5 + t * 2.1) * 0.3 +
        Math.sin((nx - ny) * 8 - t * 1.9) * 0.2 +
        Math.sin(nx * 11 + ny * 6 - t * 2.3) * 0.15;
      return [u, v];
    }
  }
}

/**
 * Start a mesh canvas engine.
 *
 * @param canvas - The target HTMLCanvasElement
 * @param cols   - Array of 5 [r,g,b] colour stops
 * @param speed  - t-increment per frame (0.0005 background / 0.012 button / 0.018 swatch)
 * @param seed   - Phase offset; use different seeds to avoid synchrony between canvases
 * @param motionType - 0=Rolling Waves, 1=Slow Drift, 2=Diagonal, 3=Radial, 4=Fast Swirl
 * @returns { s() start, x() stop }
 */
export function ME(
  canvas: HTMLCanvasElement,
  cols: number[][],
  speed: number,
  seed: number,
  motionType: number
): { s(): void; x(): void } {
  let t = seed * 0.1;
  let rafId = 0;
  let running = false;
  let cw = 0;
  let ch = 0;

  const tmp = document.createElement("canvas");
  const tmpCtx = tmp.getContext("2d")!;
  const ctx = canvas.getContext("2d")!;

  function resize() {
    cw = canvas.width = canvas.offsetWidth || canvas.width || 1;
    ch = canvas.height = canvas.offsetHeight || canvas.height || 1;
  }

  const ro = new ResizeObserver(() => {
    resize();
  });
  ro.observe(canvas);
  resize();

  const nc = cols.length;

  function frame() {
    if (!running) return;
    t += speed;

    const sw = Math.max(1, Math.ceil(cw / SC));
    const sh = Math.max(1, Math.ceil(ch / SC));

    if (tmp.width !== sw || tmp.height !== sh) {
      tmp.width = sw;
      tmp.height = sh;
    }

    const imageData = tmpCtx.createImageData(sw, sh);
    const data = imageData.data;

    for (let py = 0; py < sh; py++) {
      for (let px = 0; px < sw; px++) {
        const nx = px / sw;
        const ny = py / sh;

        const [u, v] = computeFields(nx, ny, t, motionType);

        const b1 = (u + 1) / 2;
        const b2 = (v + 1) / 2;

        const fi1 = b1 * (nc - 1);
        const ci0 = Math.floor(fi1) % nc;
        const ci1 = (ci0 + 1) % nc;
        const cf1 = fi1 - Math.floor(fi1);

        const fi2 = b2 * (nc - 1);
        const ci2 = Math.floor(fi2) % nc;
        const ci3 = (ci2 + 1) % nc;
        const cf2 = fi2 - Math.floor(fi2);

        const c0 = cols[ci0];
        const c1 = cols[ci1];
        const c2 = cols[ci2];
        const c3 = cols[ci3];

        const r0 = c0[0] * (1 - cf1) + c1[0] * cf1;
        const g0 = c0[1] * (1 - cf1) + c1[1] * cf1;
        const b0 = c0[2] * (1 - cf1) + c1[2] * cf1;

        const r1 = c2[0] * (1 - cf2) + c3[0] * cf2;
        const g1 = c2[1] * (1 - cf2) + c3[1] * cf2;
        const b1v = c2[2] * (1 - cf2) + c3[2] * cf2;

        const blend = (b1 + b2) * 0.5;

        const rr = Math.round((r0 * (1 - blend * 0.6) + r1 * blend * 0.6) * (1 - MX) + BG * MX);
        const gg = Math.round((g0 * (1 - blend * 0.6) + g1 * blend * 0.6) * (1 - MX) + BG * MX);
        const bb = Math.round((b0 * (1 - blend * 0.6) + b1v * blend * 0.6) * (1 - MX) + BG * MX);

        const idx = (py * sw + px) * 4;
        data[idx]     = Math.min(255, Math.max(0, rr));
        data[idx + 1] = Math.min(255, Math.max(0, gg));
        data[idx + 2] = Math.min(255, Math.max(0, bb));
        data[idx + 3] = 255;
      }
    }

    tmpCtx.putImageData(imageData, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(tmp, 0, 0, cw, ch);

    rafId = requestAnimationFrame(frame);
  }

  return {
    s() {
      if (running) return;
      running = true;
      resize();
      rafId = requestAnimationFrame(frame);
    },
    x() {
      running = false;
      cancelAnimationFrame(rafId);
      ro.disconnect();
    },
  };
}
