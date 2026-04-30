/**
 * Napkin AI integration — text → diagram / visual generator.
 *
 * Used by Marketing surfaces to turn a textual prompt (campaign concept,
 * dashboard analysis, report finding) into a shareable diagram image.
 *
 * Required env: NAPKIN_AI_API   (Bearer key)
 *
 * The real Napkin API (developer preview) is asynchronous and the file URLs
 * it returns require the same Authorization header to download — they are
 * NOT public. So we:
 *
 *   1. POST /v1/visual                       → { request_id, status }
 *   2. GET  /v1/visual/{request_id}/status   → poll until status="completed"
 *                                              then read generated_files[].url
 *   3. Re-write that authenticated upstream URL into a server-side proxy
 *      URL (`/api/napkin/file?u=<encoded>`) so the browser can <img src=…>
 *      it without ever needing the API key.
 *
 * Endpoint contract:
 *   POST /api/napkin/generate-visual
 *   body: { prompt: string, style?: string, format?: "png"|"svg", aspect_ratio?: string }
 *   resp: { url: string, format: string, id?: string }   on success
 *         { error: string, ai_disabled?: true }          on failure / missing key
 *
 *   GET /api/napkin/file?u=<encoded napkin url>
 *   resp: streams the binary image back, content-type preserved
 */
import { Router } from "express";
import { z } from "zod";

const router = Router();

const NAPKIN_BASE = "https://api.napkin.ai";
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 90_000;

const Body = z.object({
  prompt: z.string().min(4).max(2000),
  style: z.enum(["professional", "hand-drawn", "minimalist", "tech"]).optional(),
  format: z.enum(["png", "svg"]).optional(),
  aspect_ratio: z.string().max(16).optional(),
});

/**
 * SSRF guard for the file proxy. We only allow URLs of the form
 *   https://api.napkin.ai/v1/visual/<request-id>/file/<file-id>[suffix]
 * That is the exact shape the create→poll flow returns and is the only
 * thing we ever want to forward our Bearer token to.
 */
const NAPKIN_FILE_PATH_RE = /^\/v1\/visual\/[A-Za-z0-9_-]+\/file\/[A-Za-z0-9._-]+$/;
function isAllowedNapkinUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return false;
    if (u.hostname !== "api.napkin.ai") return false;
    return NAPKIN_FILE_PATH_RE.test(u.pathname);
  } catch {
    return false;
  }
}

router.post("/generate-visual", async (req, res) => {
  const apiKey = process.env.NAPKIN_AI_API;
  if (!apiKey) {
    return res.status(503).json({
      error: "Napkin AI not configured (NAPKIN_AI_API missing).",
      ai_disabled: true,
    });
  }

  const parsed = Body.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
  }
  const { prompt, style, format = "png" } = parsed.data;

  // `style` isn't a first-class Napkin field; fold it into visual_query so
  // the layout engine biases toward the requested aesthetic.
  const visualQuery = style ? `${style} flowchart` : "flowchart";

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  try {
    /* ── 1. Create the request ─────────────────────────────── */
    const createUpstream = await fetch(`${NAPKIN_BASE}/v1/visual`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: prompt,
        format,
        language: "en-US",
        variations: 1,
        visual_query: visualQuery,
        sort_strategy: "relevance",
      }),
    });

    const createText = await createUpstream.text();
    let createData: any = null;
    try { createData = createText ? JSON.parse(createText) : null; } catch { /* leave null */ }

    if (!createUpstream.ok) {
      req.log?.warn?.({ status: createUpstream.status, body: createText?.slice(0, 400) }, "napkin create failed");
      return res.status(502).json({
        error: createData?.error ?? `Napkin upstream returned ${createUpstream.status}`,
        upstream_status: createUpstream.status,
      });
    }

    const requestId: string | undefined = createData?.request_id ?? createData?.id;
    if (!requestId) {
      return res.status(502).json({ error: "Napkin upstream returned no request_id", raw: createData });
    }

    /* ── 2. Poll until completed (or timeout) ──────────────── */
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    let lastStatus: any = null;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const statusUpstream = await fetch(
        `${NAPKIN_BASE}/v1/visual/${encodeURIComponent(requestId)}/status`,
        { method: "GET", headers },
      );
      const statusText = await statusUpstream.text();
      try { lastStatus = statusText ? JSON.parse(statusText) : null; } catch { lastStatus = null; }

      if (!statusUpstream.ok) {
        req.log?.warn?.({ status: statusUpstream.status, body: statusText?.slice(0, 400) }, "napkin poll error");
        if (statusUpstream.status >= 400 && statusUpstream.status < 500) {
          return res.status(502).json({
            error: lastStatus?.error ?? `Napkin status returned ${statusUpstream.status}`,
            upstream_status: statusUpstream.status,
          });
        }
        continue;
      }

      const status = lastStatus?.status;
      if (status === "completed") {
        const file = (lastStatus?.generated_files ?? [])[0];
        const upstreamUrl: string | undefined = file?.url;
        if (!upstreamUrl) {
          return res.status(502).json({ error: "Napkin completed but returned no file URL", raw: lastStatus });
        }
        // Re-route through our auth-bearing proxy so the browser can render it.
        const proxied = `/api/napkin/file?u=${encodeURIComponent(upstreamUrl)}`;
        return res.json({
          url: proxied,
          format: file?.format ?? format,
          id: requestId,
        });
      }
      if (status === "failed") {
        return res.status(502).json({
          error: lastStatus?.error ?? "Napkin generation failed",
          raw: lastStatus,
        });
      }
      // else: "processing" — loop again
    }

    return res.status(504).json({
      error: "Napkin generation timed out",
      request_id: requestId,
      last_status: lastStatus?.status,
    });
  } catch (err: any) {
    req.log?.error?.({ err }, "napkin generate failed");
    return res.status(500).json({ error: err?.message ?? "Napkin request failed" });
  }
});

/**
 * Auth-bearing image proxy. Napkin's generated file URLs require the same
 * Bearer token to download, so we fetch them server-side and stream back.
 */
router.get("/file", async (req, res) => {
  const apiKey = process.env.NAPKIN_AI_API;
  if (!apiKey) return res.status(503).json({ error: "Napkin not configured" });

  const target = String(req.query.u ?? "");
  if (!target || !isAllowedNapkinUrl(target)) {
    return res.status(400).json({ error: "Invalid or disallowed upstream url" });
  }

  try {
    const upstream = await fetch(target, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({ error: `Upstream ${upstream.status}` });
    }
    const ct = upstream.headers.get("content-type") ?? "image/png";
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "private, max-age=600");
    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.end(buf);
  } catch (err: any) {
    req.log?.error?.({ err }, "napkin file proxy failed");
    return res.status(500).json({ error: err?.message ?? "Proxy failed" });
  }
});

export default router;
