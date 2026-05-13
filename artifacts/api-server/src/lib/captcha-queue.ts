/**
 * CaptchaQueue — in-memory store for human-assisted CAPTCHA resolution.
 *
 * Flow:
 *   1. Scraper calls captchaQueue.waitForHuman(screenshot, hint)
 *   2. Frontend polls GET /api/captcha/pending — sees the entry
 *   3. User types the code in the app
 *   4. Frontend POSTs to /api/captcha/resolve/:token
 *   5. waitForHuman() Promise resolves with the typed code
 *   6. Scraper fills the code into the page automatically
 *
 * Entries expire after 10 minutes to prevent memory leaks.
 */

import crypto from "crypto";

const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export interface PendingCaptcha {
  token: string;
  screenshotB64: string;    // PNG base64 — the full page screenshot
  hint: string;             // e.g. "MoCI company registry"
  createdAt: number;        // Date.now()
}

interface QueueEntry extends PendingCaptcha {
  resolve: (code: string) => void;
  reject: (err: Error) => void;
}

class CaptchaQueue {
  private entries = new Map<string, QueueEntry>();

  /**
   * Called by the stealth browser when Claude cannot solve the CAPTCHA.
   * Blocks until the user submits a code (or the entry expires).
   */
  waitForHuman(screenshotB64: string, hint = "website"): Promise<string> {
    const token = crypto.randomBytes(10).toString("hex");

    return new Promise<string>((resolve, reject) => {
      const entry: QueueEntry = {
        token, screenshotB64, hint,
        createdAt: Date.now(),
        resolve, reject,
      };
      this.entries.set(token, entry);

      // Auto-expire
      setTimeout(() => {
        if (this.entries.has(token)) {
          this.entries.delete(token);
          reject(new Error(`CAPTCHA token ${token} expired after 10 minutes`));
        }
      }, EXPIRY_MS);
    });
  }

  /** Returns all pending entries (without the resolve/reject callbacks). */
  getPending(): PendingCaptcha[] {
    const now = Date.now();
    const out: PendingCaptcha[] = [];
    for (const e of this.entries.values()) {
      if (now - e.createdAt < EXPIRY_MS) {
        out.push({ token: e.token, screenshotB64: e.screenshotB64, hint: e.hint, createdAt: e.createdAt });
      }
    }
    return out;
  }

  /** Called when the user submits a code. Returns true if the token was found. */
  resolve(token: string, code: string): boolean {
    const entry = this.entries.get(token);
    if (!entry) return false;
    this.entries.delete(token);
    entry.resolve(code);
    return true;
  }

  /** Dismiss without solving (user clicked skip). */
  dismiss(token: string): boolean {
    const entry = this.entries.get(token);
    if (!entry) return false;
    this.entries.delete(token);
    entry.reject(new Error("User dismissed CAPTCHA"));
    return true;
  }
}

// Singleton — shared across all routes and scrapers in this process
export const captchaQueue = new CaptchaQueue();
