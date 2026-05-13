/**
 * StealthBrowser — Human-like browser automation with anti-detection.
 *
 * Handles:
 *   • Anti-fingerprinting (navigator.webdriver, plugins, canvas noise, WebGL)
 *   • Human behaviour (Bézier mouse paths, gaussian typing delays, scroll chunks)
 *   • Session persistence (saves/restores cookies + localStorage per domain)
 *   • CAPTCHA auto-solving via Claude Vision API
 *   • Saudi Arabia locale (ar-SA, Asia/Riyadh timezone)
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ?? "",
});

// ══════════════════════════════════════════════════════════════════
// 1. STEALTH JS — injected into every page before scripts run
// ══════════════════════════════════════════════════════════════════

export const STEALTH_JS = `
(function() {
  try { Object.defineProperty(navigator, 'webdriver', { get: () => undefined, configurable: true }); } catch(e) {}

  try {
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const arr = [
          { name: 'Chrome PDF Plugin',  filename: 'internal-pdf-viewer',            description: 'Portable Document Format' },
          { name: 'Chrome PDF Viewer',  filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
          { name: 'Native Client',      filename: 'internal-nacl-plugin',            description: '' },
        ];
        arr.refresh = () => {}; arr.item = (i) => arr[i]; arr.namedItem = (n) => arr.find(p => p.name === n) || null;
        return arr;
      },
    });
  } catch(e) {}

  try { Object.defineProperty(navigator, 'languages', { get: () => ['ar-SA', 'ar', 'en-US', 'en'] }); } catch(e) {}

  try {
    if (!window.chrome) {
      window.chrome = { runtime: {}, loadTimes: function() { return {}; }, csi: function() { return {}; }, app: { isInstalled: false } };
    }
  } catch(e) {}

  try {
    const origQuery = window.navigator.permissions.query.bind(window.navigator.permissions);
    window.navigator.permissions.query = (params) =>
      params.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission, onchange: null })
        : origQuery(params);
  } catch(e) {}

  try {
    const getParam = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(param) {
      if (param === 37445) return 'Intel Inc.';
      if (param === 37446) return 'Intel Iris OpenGL Engine';
      return getParam.call(this, param);
    };
  } catch(e) {}

  try {
    const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
      const ctx = this.getContext('2d');
      if (ctx && this.width > 0 && this.height > 0) {
        const img = ctx.getImageData(0, 0, Math.min(this.width, 10), Math.min(this.height, 10));
        for (let i = 0; i < img.data.length; i += 4) { img.data[i] ^= (Math.random() * 3) | 0; img.data[i+1] ^= (Math.random() * 3) | 0; }
        ctx.putImageData(img, 0, 0);
      }
      return origToDataURL.call(this, type, quality);
    };
  } catch(e) {}

  try {
    const origNow = performance.now.bind(performance);
    performance.now = () => Math.floor(origNow() * 100) / 100 + Math.random() * 0.01;
  } catch(e) {}
})();
`;

// ══════════════════════════════════════════════════════════════════
// 2. HUMAN BEHAVIOUR — realistic mouse, typing, scrolling
// ══════════════════════════════════════════════════════════════════

export class HumanBehavior {
  static bezierPoint(t: number, pts: [number, number][]): [number, number] {
    let tmp = pts.map((p) => [...p] as [number, number]);
    while (tmp.length > 1) {
      tmp = tmp.slice(0, -1).map((_, i) => [
        tmp[i][0] * (1 - t) + tmp[i + 1][0] * t,
        tmp[i][1] * (1 - t) + tmp[i + 1][1] * t,
      ] as [number, number]);
    }
    return tmp[0];
  }

  static generatePath(from: [number, number], to: [number, number]): [number, number][] {
    const dx = to[0] - from[0]; const dy = to[1] - from[1];
    const cx1: [number, number] = [from[0] + dx * 0.25 + (Math.random() - 0.5) * 80, from[1] + dy * 0.25 + (Math.random() - 0.5) * 80];
    const cx2: [number, number] = [from[0] + dx * 0.75 + (Math.random() - 0.5) * 80, from[1] + dy * 0.75 + (Math.random() - 0.5) * 80];
    const steps = 18 + Math.floor(Math.random() * 18);
    return Array.from({ length: steps + 1 }, (_, i) => this.bezierPoint(i / steps, [from, cx1, cx2, to]));
  }

  static typingDelay(): number {
    const u = 1 - Math.random(); const v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    let ms = 90 + z * 35;
    if (Math.random() < 0.04) ms += 250 + Math.random() * 450;
    if (Math.random() < 0.015) ms += 500 + Math.random() * 600;
    return Math.max(28, ms);
  }

  static async idle(minMs = 600, maxMs = 2800): Promise<void> {
    await new Promise((r) => setTimeout(r, minMs + Math.random() * (maxMs - minMs)));
  }

  static scrollChunks(total: number): number[] {
    const chunks: number[] = []; let rem = total;
    while (rem > 0) { const c = Math.min(rem, 80 + Math.floor(Math.random() * 240)); chunks.push(c); rem -= c; }
    return chunks;
  }
}

// ══════════════════════════════════════════════════════════════════
// 3. SESSION MANAGER — cookie + localStorage persistence
// ══════════════════════════════════════════════════════════════════

export class SessionManager {
  private dir: string;

  constructor(dir = ".agent_sessions") {
    this.dir = path.resolve(process.cwd(), dir);
    fs.mkdirSync(this.dir, { recursive: true });
  }

  private fp(domain: string): string {
    return path.join(this.dir, `${domain.replace(/[^a-z0-9]/gi, "_").slice(0, 80)}.json`);
  }

  async save(ctx: BrowserContext, domain: string): Promise<void> {
    try { fs.writeFileSync(this.fp(domain), JSON.stringify(await ctx.storageState(), null, 2)); } catch { /* ignore */ }
  }

  load(domain: string): object | undefined {
    const p = this.fp(domain);
    if (!fs.existsSync(p)) return undefined;
    try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return undefined; }
  }

  clear(domain: string): void {
    try { fs.unlinkSync(this.fp(domain)); } catch { /* ignore */ }
  }
}

// ══════════════════════════════════════════════════════════════════
// 4. CLAUDE VISION CAPTCHA SOLVER
// ══════════════════════════════════════════════════════════════════

export interface CaptchaSolveResult {
  code: string;
  confidence: "high" | "medium" | "low" | "failed";
  reasoning: string;
}

export async function solveCaptchaWithVision(
  screenshotB64: string,
  hint = "Saudi government portal",
): Promise<CaptchaSolveResult> {
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: screenshotB64 } },
          { type: "text", text: `You are looking at a screenshot of a ${hint}. Find the CAPTCHA verification code. It is usually 4-8 distorted letters/numbers in a box. Arabic numerals (٠١٢٣٤٥٦٧٨٩) or Latin (0-9, a-z, A-Z). Respond in JSON: {"code":"...","confidence":"high|medium|low|failed","reasoning":"..."}. If no CAPTCHA visible, set code="" and confidence="failed".` },
        ],
      }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as CaptchaSolveResult;
    return { code: "", confidence: "failed", reasoning: "JSON parse failed" };
  } catch (err) {
    return { code: "", confidence: "failed", reasoning: String(err) };
  }
}

// ══════════════════════════════════════════════════════════════════
// 5. MAIN STEALTH BROWSER
// ══════════════════════════════════════════════════════════════════

const VIEWPORTS = [
  { width: 1920, height: 1080 }, { width: 1536, height: 864 },
  { width: 1440, height: 900 },  { width: 1366, height: 768 },
  { width: 1280, height: 800 },
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
];

export class StealthBrowser {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  public page: Page | null = null;
  private domain: string = "";
  private sessions = new SessionManager();
  private logFn: (msg: string) => void;

  constructor(logFn: (msg: string) => void = () => { /* no-op */ }) {
    this.logFn = logFn;
  }

  async start(domain: string): Promise<Page> {
    this.domain = domain;
    const viewport = VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const savedSession = this.sessions.load(domain);

    let executablePath: string | undefined;
    try {
      const { execSync } = await import("child_process");
      const found = execSync("which chromium 2>/dev/null || which chromium-browser 2>/dev/null || echo ''", { encoding: "utf-8" }).trim();
      if (found) executablePath = found;
    } catch { /* fall through to bundled Playwright Chromium */ }

    this.browser = await chromium.launch({
      headless: true,
      executablePath,
      args: [
        "--no-sandbox", "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled", "--disable-infobars",
        "--disable-dev-shm-usage", "--disable-web-security",
        "--no-first-run", "--disable-default-apps", "--lang=ar-SA",
        `--window-size=${viewport.width},${viewport.height}`,
      ],
    });

    this.context = await this.browser.newContext({
      userAgent, viewport, locale: "ar-SA", timezoneId: "Asia/Riyadh",
      extraHTTPHeaders: {
        "Accept-Language": "ar-SA,ar;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache", "Pragma": "no-cache",
        "Sec-Fetch-Dest": "document", "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none", "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      ...(savedSession ? { storageState: savedSession as Parameters<typeof this.browser.newContext>[0]["storageState"] } : {}),
    });

    await this.context.addInitScript(STEALTH_JS);
    this.page = await this.context.newPage();
    this.logFn(savedSession ? `Restored session for ${domain}` : `Starting fresh stealth session for ${domain}`);
    return this.page;
  }

  async goto(url: string, opts: { waitUntil?: "networkidle" | "domcontentloaded" | "load"; timeout?: number } = {}): Promise<void> {
    if (!this.page) throw new Error("Browser not started — call start() first");
    await this.page.goto(url, { waitUntil: opts.waitUntil ?? "networkidle", timeout: opts.timeout ?? 45000 });
    await HumanBehavior.idle(800, 2400);
  }

  async humanType(selector: string, text: string): Promise<boolean> {
    if (!this.page) return false;
    try {
      const el = await this.page.$(selector);
      if (!el) return false;
      await el.click();
      await HumanBehavior.idle(150, 400);
      await this.page.keyboard.selectAll();
      await this.page.keyboard.press("Backspace");
      await HumanBehavior.idle(80, 200);
      for (const ch of text) {
        await this.page.keyboard.type(ch);
        await new Promise((r) => setTimeout(r, HumanBehavior.typingDelay()));
      }
      return true;
    } catch { return false; }
  }

  async humanClick(selector: string): Promise<boolean> {
    if (!this.page) return false;
    try {
      const el = await this.page.$(selector);
      if (!el) return false;
      const box = await el.boundingBox();
      if (!box) { await el.click(); return true; }
      const tx = box.x + box.width * 0.5 + (Math.random() - 0.5) * 4;
      const ty = box.y + box.height * 0.5 + (Math.random() - 0.5) * 4;
      const from: [number, number] = [Math.random() * 600 + 200, Math.random() * 300 + 100];
      for (const [x, y] of HumanBehavior.generatePath(from, [tx, ty])) {
        await this.page.mouse.move(x, y);
        await new Promise((r) => setTimeout(r, 8 + Math.random() * 16));
      }
      await HumanBehavior.idle(80, 280);
      await this.page.mouse.click(tx, ty);
      return true;
    } catch { return false; }
  }

  async fillFirst(selectors: string[], value: string): Promise<boolean> {
    if (!this.page) return false;
    for (const sel of selectors) {
      try {
        const el = await this.page.$(sel);
        if (el && await this.humanType(sel, value)) return true;
      } catch { /* try next */ }
    }
    try {
      return await this.page.evaluate((v) => {
        const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("input[type='text'], input:not([type])"));
        const vis = inputs.filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
        if (vis[0]) { vis[0].value = v; vis[0].dispatchEvent(new Event("input", { bubbles: true })); return true; }
        return false;
      }, value) as boolean;
    } catch { return false; }
  }

  async clickFirst(selectors: string[]): Promise<boolean> {
    for (const sel of selectors) { if (await this.humanClick(sel)) return true; }
    await this.page?.keyboard.press("Enter");
    return false;
  }

  async screenshot(full = false): Promise<string> {
    if (!this.page) return "";
    return (await this.page.screenshot({ type: "png", fullPage: full })).toString("base64");
  }

  async getContent(): Promise<string> {
    return this.page?.content() ?? "";
  }

  async scrollDown(pixels = 600): Promise<void> {
    if (!this.page) return;
    for (const chunk of HumanBehavior.scrollChunks(pixels)) {
      await this.page.mouse.wheel(0, chunk);
      await HumanBehavior.idle(60, 200);
    }
  }

  async detectChallenge(): Promise<"cloudflare" | "turnstile" | "recaptcha" | "hcaptcha" | null> {
    if (!this.page) return null;
    const c = await this.page.content();
    if (c.includes("challenge-running") || c.includes("cf-browser-verification")) return "cloudflare";
    if (c.includes("challenges.cloudflare.com") || c.includes("cf-turnstile")) return "turnstile";
    if (c.includes("recaptcha")) return "recaptcha";
    if (c.includes("hcaptcha")) return "hcaptcha";
    return null;
  }

  async waitForCloudflare(timeoutMs = 25000): Promise<boolean> {
    if (!this.page) return false;
    try {
      await this.page.waitForFunction(
        () => !document.querySelector("#challenge-running, #cf-challenge-running, .cf-browser-verification"),
        { timeout: timeoutMs }
      );
      await HumanBehavior.idle(1500, 3000);
      return true;
    } catch { return false; }
  }

  async saveSession(): Promise<void> {
    if (this.context && this.domain) await this.sessions.save(this.context, this.domain);
  }

  clearSession(): void { this.sessions.clear(this.domain); }

  isConnected(): boolean { return this.browser?.isConnected() ?? false; }

  async stop(): Promise<void> {
    await this.saveSession().catch(() => { /* ignore */ });
    try { await this.browser?.close(); } catch { /* ignore */ }
    this.browser = null; this.context = null; this.page = null;
  }
}

// ══════════════════════════════════════════════════════════════════
// 6. AUTO-CAPTCHA RESOLVER
// ══════════════════════════════════════════════════════════════════

export interface AutoCaptchaOptions {
  maxAttempts?: number;
  hint?: string;
  onAttempt?: (attempt: number, code: string, confidence: string) => void;
  onFallback?: () => Promise<string>;
}

export async function autoSolveCaptcha(
  browser: StealthBrowser,
  options: AutoCaptchaOptions = {},
): Promise<{ code: string; method: "ai" | "human" | "failed"; attempts: number }> {
  const maxAttempts = options.maxAttempts ?? 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const screenshot = await browser.screenshot();
    const result = await solveCaptchaWithVision(screenshot, options.hint ?? "Saudi government website");
    options.onAttempt?.(attempt, result.code, result.confidence);
    if (result.code && result.confidence !== "failed" && result.code.length >= 3) {
      return { code: result.code, method: "ai", attempts: attempt };
    }
    if (attempt < maxAttempts) await HumanBehavior.idle(1200, 2500);
  }
  if (options.onFallback) {
    const code = await options.onFallback();
    return { code, method: "human", attempts: maxAttempts };
  }
  return { code: "", method: "failed", attempts: maxAttempts };
}

// ══════════════════════════════════════════════════════════════════
// 7. CONVENIENCE: stealthFetch — one-shot page scrape with stealth
// ══════════════════════════════════════════════════════════════════

export async function stealthFetch(
  url: string,
  opts: { timeoutMs?: number; waitUntil?: "networkidle" | "domcontentloaded" | "load" } = {},
): Promise<{ ok: boolean; html: string; text: string; error?: string }> {
  const browser = new StealthBrowser();
  try {
    const hostname = new URL(url).hostname;
    await browser.start(hostname);
    await browser.goto(url, { waitUntil: opts.waitUntil ?? "networkidle", timeout: opts.timeoutMs ?? 30000 });
    const html = await browser.getContent();
    const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                     .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                     .replace(/<[^>]+>/g, " ")
                     .replace(/\s+/g, " ")
                     .trim();
    return { ok: text.length > 100, html, text };
  } catch (err: any) {
    return { ok: false, html: "", text: "", error: err?.message ?? String(err) };
  } finally {
    await browser.stop().catch(() => { /* ignore */ });
  }
}
