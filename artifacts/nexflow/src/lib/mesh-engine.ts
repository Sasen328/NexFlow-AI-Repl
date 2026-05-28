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

/**
 * Four sine fields (u, v, w, q) sampled per pixel at different phases.
 * All four participate in the final colour blend for organic variation.
 */
function computeFields(
  nx: number,
  ny: number,
  t: number,
  mt: number
): [number, number, number, number] {
  switch (mt) {
    case 0: { // Rolling Waves — 7-harmonic sum
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
      const w =
        Math.sin(nx * 5.5 - ny * 2 + t * 1.3) * 0.45 +
        Math.sin((nx + ny) * 4 - t * 0.9) * 0.3 +
        Math.sin(ny * 6 + t * 1.1) * 0.25;
      const q =
        Math.sin(nx * 7 + ny * 3.5 - t * 0.8) * 0.4 +
        Math.sin((nx - ny) * 5 + t * 1.2) * 0.35 +
        Math.sin(nx * 3 - ny * 6 + t * 0.7) * 0.25;
      return [u, v, w, q];
    }
    case 1: { // Slow Deep Drift — 5-harmonic
      const u =
        Math.sin(nx * 2 + t * 0.5) * 0.4 +
        Math.sin(ny * 1.5 - t * 0.3) * 0.35 +
        Math.sin((nx + ny) * 1 + t * 0.4) * 0.25;
      const v =
        Math.sin(ny * 2.5 + t * 0.4) * 0.45 +
        Math.sin(nx * 1.8 + t * 0.5) * 0.35 +
        Math.sin((nx - ny) * 1.2 + t * 0.3) * 0.2;
      const w =
        Math.sin(nx * 3 + ny * 1.5 - t * 0.45) * 0.42 +
        Math.sin(ny * 2 + t * 0.38) * 0.33 +
        Math.sin((nx + ny) * 1.8 - t * 0.52) * 0.25;
      const q =
        Math.sin(nx * 1.3 - ny * 2.2 + t * 0.35) * 0.44 +
        Math.sin((nx - ny) * 1.6 + t * 0.42) * 0.32 +
        Math.sin(nx * 2.4 + t * 0.28) * 0.24;
      return [u, v, w, q];
    }
    case 2: { // Diagonal Sweep — sum + difference
      const u =
        Math.sin(nx * 3 + ny * 2 + t) * 0.4 +
        Math.sin(nx * 2 - ny * 3 - t * 0.8) * 0.3 +
        Math.sin(nx * 5 + t * 0.7) * 0.2 +
        Math.sin(ny * 4 - t * 0.9) * 0.1;
      const v =
        Math.sin(nx * 4 - ny + t * 1.1) * 0.4 +
        Math.sin(ny * 4 + nx + t * 0.7) * 0.35 +
        Math.sin((nx + ny) * 5 - t * 0.8) * 0.25;
      const w =
        Math.sin(nx * 4 + ny * 3 - t * 1.0) * 0.38 +
        Math.sin(nx * 6 - ny * 2 + t * 0.85) * 0.32 +
        Math.sin((nx + ny) * 3.5 + t * 0.95) * 0.3;
      const q =
        Math.sin(nx * 2.5 + ny * 4 - t * 0.75) * 0.42 +
        Math.sin(nx * 5 - ny * 3 + t * 1.05) * 0.28 +
        Math.sin((nx - ny) * 4.5 + t * 0.9) * 0.3;
      return [u, v, w, q];
    }
    case 3: { // Radial Pulse — distance from centre
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
      const w =
        Math.sin(r * 9 + angle * 2 - t * 1.8) * 0.42 +
        Math.cos(angle * 5 + t * 1.1) * 0.32 +
        Math.sin(r * 12 - angle * 3 + t * 2.2) * 0.26;
      const q =
        Math.sin(r * 6 + angle * 3 + t * 1.4) * 0.4 +
        Math.cos(angle * 6 - t * 0.9) * 0.34 +
        Math.sin(r * 14 + t * 2.4) * 0.26;
      return [u, v, w, q];
    }
    case 4:
    default: { // Fast Swirl — higher frequency harmonics
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
      const w =
        Math.sin(nx * 9 - ny * 5 + t * 2.3) * 0.38 +
        Math.sin((nx + ny) * 8 - t * 1.7) * 0.32 +
        Math.sin(nx * 12 + ny * 3 + t * 2.5) * 0.3;
      const q =
        Math.sin(nx * 7 + ny * 8 - t * 1.85) * 0.4 +
        Math.sin((nx - ny) * 9 + t * 2.1) * 0.3 +
        Math.sin(nx * 11 - ny * 7 + t * 2.4) * 0.3;
      return [u, v, w, q];
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

        const [u, v, w, q] = computeFields(nx, ny, t, motionType);

        // Four blending fields → [0,1] each
        const b1 = (u + 1) / 2;
        const b2 = (v + 1) / 2;
        const b3 = (w + 1) / 2;
        const b4 = (q + 1) / 2;

        // b1+b2 select primary colour pair
        const fi1 = b1 * (nc - 1);
        const ci0 = Math.floor(fi1) % nc;
        const ci1 = (ci0 + 1) % nc;
        const cf1 = fi1 - Math.floor(fi1);

        // b2+b3 select secondary colour pair
        const fi2 = b2 * (nc - 1);
        const ci2 = Math.floor(fi2) % nc;
        const ci3 = (ci2 + 1) % nc;
        const cf2 = fi2 - Math.floor(fi2);

        // w selects a tertiary accent stop
        const fi3 = b3 * (nc - 1);
        const ci4 = Math.floor(fi3) % nc;

        const c0 = cols[ci0];
        const c1 = cols[ci1];
        const c2 = cols[ci2];
        const c3 = cols[ci3];
        const c4 = cols[ci4];

        // Primary blend (b1-driven)
        const r0 = c0[0] * (1 - cf1) + c1[0] * cf1;
        const g0 = c0[1] * (1 - cf1) + c1[1] * cf1;
        const b0 = c0[2] * (1 - cf1) + c1[2] * cf1;

        // Secondary blend (b2-driven)
        const r1 = c2[0] * (1 - cf2) + c3[0] * cf2;
        const g1 = c2[1] * (1 - cf2) + c3[1] * cf2;
        const b1v = c2[2] * (1 - cf2) + c3[2] * cf2;

        // q (fourth field) drives mix weight between primary and secondary;
        // w (third field) adds a tertiary tint for organic depth
        const mixAB = b4 * 0.55;
        const tint  = b3 * 0.18;

        const rr = Math.round(((r0 * (1 - mixAB) + r1 * mixAB) * (1 - tint) + c4[0] * tint) * (1 - MX) + BG * MX);
        const gg = Math.round(((g0 * (1 - mixAB) + g1 * mixAB) * (1 - tint) + c4[1] * tint) * (1 - MX) + BG * MX);
        const bb = Math.round(((b0 * (1 - mixAB) + b1v * mixAB) * (1 - tint) + c4[2] * tint) * (1 - MX) + BG * MX);

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
