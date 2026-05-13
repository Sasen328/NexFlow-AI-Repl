/**
 * CAPTCHA human-resolution endpoints.
 *
 * GET  /api/captcha/pending       — returns all pending CAPTCHAs (token + screenshot + hint)
 * POST /api/captcha/resolve/:token — submit the human-typed code
 * POST /api/captcha/dismiss/:token — skip / give up on a CAPTCHA
 */

import { Router } from "express";
import { captchaQueue } from "../lib/captcha-queue.js";

const router = Router();

router.get("/pending", (_req, res) => {
  res.json({ items: captchaQueue.getPending() });
});

router.post("/resolve/:token", (req, res) => {
  const { token } = req.params;
  const { code } = req.body as { code?: string };

  if (!code || typeof code !== "string" || code.trim().length === 0) {
    res.status(400).json({ error: "code is required" });
    return;
  }

  const ok = captchaQueue.resolve(token, code.trim());
  if (!ok) {
    res.status(404).json({ error: "Token not found or already resolved" });
    return;
  }

  res.json({ ok: true });
});

router.post("/dismiss/:token", (req, res) => {
  const { token } = req.params;
  const ok = captchaQueue.dismiss(token);
  res.json({ ok });
});

export default router;
