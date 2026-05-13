/**
 * CaptchaAlert — floating modal that appears whenever the enrichment engine
 * hits a CAPTCHA it cannot solve automatically.
 *
 * • Polls /api/captcha/pending every 4 seconds
 * • Shows the full-page screenshot so you can spot the CAPTCHA
 * • You type the code → POST /api/captcha/resolve/:token
 * • The browser fills it in and continues automatically — no action needed on your end
 */

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/hooks/useApi";

interface PendingCaptcha {
  token: string;
  screenshotB64: string;
  hint: string;
  createdAt: number;
}

export function CaptchaAlert() {
  const [items, setItems] = useState<PendingCaptcha[]>([]);
  const [current, setCurrent] = useState<PendingCaptcha | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Poll every 4 s
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const data: any = await apiFetch("/captcha/pending");
        if (alive) setItems(data?.items ?? []);
      } catch { /* ignore network errors */ }
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Pick the oldest pending item
  useEffect(() => {
    if (items.length === 0) { setCurrent(null); return; }
    const oldest = [...items].sort((a, b) => a.createdAt - b.createdAt)[0];
    setCurrent((prev) => (prev?.token === oldest.token ? prev : oldest));
    setCode("");
    setError("");
  }, [items]);

  // Focus input when modal opens
  useEffect(() => {
    if (current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [current?.token]);

  if (!current) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) { setError("Please type the code you see in the image."); return; }
    setSubmitting(true);
    setError("");
    try {
      await apiFetch(`/captcha/resolve/${current.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      setItems((prev) => prev.filter((i) => i.token !== current.token));
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      await apiFetch(`/captcha/dismiss/${current.token}`, { method: "POST" });
    } catch { /* ignore */ }
    setItems((prev) => prev.filter((i) => i.token !== current.token));
  };

  const elapsed = Math.floor((Date.now() - current.createdAt) / 1000);
  const expiresIn = Math.max(0, 600 - elapsed);
  const mm = Math.floor(expiresIn / 60);
  const ss = String(expiresIn % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center text-xl">🔒</div>
            <div>
              <p className="font-semibold text-sm text-foreground">CAPTCHA Verification Needed</p>
              <p className="text-xs text-muted-foreground">{current.hint}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            Expires {mm}:{ss}
          </span>
        </div>

        {/* Screenshot — shows the page with the CAPTCHA */}
        <div className="relative bg-muted/20 border-b border-border overflow-auto" style={{ maxHeight: 280 }}>
          <img
            src={`data:image/png;base64,${current.screenshotB64}`}
            alt="Website screenshot — find the CAPTCHA code in this image"
            className="w-full object-cover object-top"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent py-3 px-4">
            <p className="text-white text-xs text-center">
              Find the verification code in the image above and type it below
            </p>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          <label className="text-sm font-medium text-foreground">
            Type the CAPTCHA code exactly as shown:
          </label>
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. A3kP7"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base font-mono tracking-[0.3em] text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
            autoComplete="off"
            spellCheck={false}
            disabled={submitting}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="flex-1 rounded-lg bg-primary text-primary-foreground text-sm font-semibold py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit & Continue Automatically"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              disabled={submitting}
              className="rounded-lg border border-border px-4 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              Skip
            </button>
          </div>

          {items.length > 1 && (
            <p className="text-xs text-center text-muted-foreground">
              {items.length - 1} more CAPTCHA{items.length > 2 ? "s" : ""} queued after this
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
