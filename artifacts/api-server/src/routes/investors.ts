import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { createReadStream, statSync, existsSync } from "node:fs";
import path from "node:path";
import { db, investor_access_log } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

// ── Configuration ──────────────────────────────────────────────────────────
const COOKIE_NAME = "investor_access";
const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h
const PASSCODE = process.env["INVESTOR_PASSCODE"] ?? "";
const SIGNING_SECRET = process.env["SESSION_SECRET"] ?? "";

// Documents the data-room exposes. Files are read from <repoRoot>/docs/investor.
// Add new entries here to expose more material later.
interface InvestorDoc {
  slug: string;
  filename: string;
  title: string;
  subtitle: string;
  kind: "pdf" | "pptx" | "md" | "xlsx";
}

const DOCS: InvestorDoc[] = [
  {
    slug: "highlevel-deck",
    filename: "01-investor-highlevel.pdf",
    title: "Investor Pitch Deck",
    subtitle: "High-level overview of NexFlow, market & opportunity",
    kind: "pdf",
  },
  {
    slug: "highlevel-deck-pptx",
    filename: "01-investor-highlevel.pptx",
    title: "Pitch Deck — Editable (.pptx)",
    subtitle: "Same deck in PowerPoint format",
    kind: "pptx",
  },
  {
    slug: "deep-dive",
    filename: "02-investor-deep-dive.pdf",
    title: "Investor Deep Dive",
    subtitle: "Detailed product, GTM, and competitive analysis",
    kind: "pdf",
  },
  {
    slug: "feasibility",
    filename: "03-feasibility-study.pdf",
    title: "Feasibility Study",
    subtitle: "GCC market sizing, regulatory and operational feasibility",
    kind: "pdf",
  },
  {
    slug: "financial-plan",
    filename: "04-three-year-financial-plan.pdf",
    title: "3-Year Financial Plan",
    subtitle: "Revenue, cost, headcount and unit-economics projections",
    kind: "pdf",
  },
];

// docs/investor lives at the repo root. From the built api-server bundle the
// CWD when starting via the workflow is the api-server package directory, so
// we resolve four levels up to reach the repo root robustly.
function docsRoot(): string {
  // Prefer an absolute path computed from the current working directory.
  // When the workflow starts the server from the api-server folder, four
  // segments up lands on the repo root.
  return path.resolve(process.cwd(), "..", "..", "docs", "investor");
}

// ── Cookie signing ────────────────────────────────────────────────────────
// Cookie value format:  <issuedAtMs>.<hex hmac>
// HMAC = HMAC-SHA256(SESSION_SECRET, "investor:" + issuedAtMs)
function signCookie(issuedAtMs: number): string {
  const mac = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(`investor:${issuedAtMs}`)
    .digest("hex");
  return `${issuedAtMs}.${mac}`;
}

function verifyCookie(value: string | undefined): boolean {
  if (!value || !SIGNING_SECRET) return false;
  const [issuedAtRaw, mac] = value.split(".");
  if (!issuedAtRaw || !mac) return false;
  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > COOKIE_MAX_AGE_MS) return false;
  const expected = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(`investor:${issuedAt}`)
    .digest("hex");
  // Constant-time comparison
  const a = Buffer.from(mac, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isAuthed(req: Request): boolean {
  // cookie-parser populates req.cookies
  const c = (req as Request & { cookies?: Record<string, string> }).cookies;
  return verifyCookie(c?.[COOKIE_NAME]);
}

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (isAuthed(req)) {
    next();
    return;
  }
  res.status(401).json({ error: "unauthenticated" });
}

// ── Audit helper ───────────────────────────────────────────────────────────
function clientIp(req: Request): string {
  const fwd = req.header("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.ip ?? "";
}

async function recordEvent(
  req: Request,
  action: string,
  success: boolean,
  docSlug?: string,
): Promise<void> {
  try {
    await db.insert(investor_access_log).values({
      action,
      success,
      doc_slug: docSlug ?? null,
      ip: clientIp(req).slice(0, 64) || null,
      user_agent: (req.header("user-agent") ?? "").slice(0, 256) || null,
    });
  } catch (err) {
    // Logging must never break the user-facing flow
    req.log?.warn({ err }, "investor_access_log insert failed");
  }
}

// ── Schemas ────────────────────────────────────────────────────────────────
const AuthBody = z.object({
  passcode: z.string().min(1).max(256),
});

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /investors/session — is the current visitor authed?
router.get("/session", (req, res) => {
  res.json({ authenticated: isAuthed(req) });
});

// POST /investors/auth — submit passcode. Sets HMAC-signed httpOnly cookie.
router.post("/auth", async (req, res) => {
  const parsed = AuthBody.safeParse(req.body);
  if (!parsed.success) {
    await recordEvent(req, "auth_failure", false);
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  if (!PASSCODE || !SIGNING_SECRET) {
    req.log?.error(
      { hasPasscode: !!PASSCODE, hasSecret: !!SIGNING_SECRET },
      "investor data-room is not configured",
    );
    res.status(503).json({
      error: "not_configured",
      message:
        "Investor data-room is not yet configured. The administrator must set INVESTOR_PASSCODE and SESSION_SECRET.",
    });
    return;
  }

  // Constant-time string comparison
  const submitted = Buffer.from(parsed.data.passcode);
  const expected = Buffer.from(PASSCODE);
  const ok =
    submitted.length === expected.length &&
    crypto.timingSafeEqual(submitted, expected);

  if (!ok) {
    await recordEvent(req, "auth_failure", false);
    // Light delay to dampen brute-force attempts
    await new Promise((r) => setTimeout(r, 300));
    res.status(401).json({ error: "invalid_passcode" });
    return;
  }

  const value = signCookie(Date.now());
  res.cookie(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.secure || req.header("x-forwarded-proto") === "https",
    path: "/",
    maxAge: COOKIE_MAX_AGE_MS,
  });

  await recordEvent(req, "auth_success", true);
  res.json({ authenticated: true });
});

// POST /investors/logout — clear the cookie
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ authenticated: false });
});

// GET /investors/documents — gated metadata about what's available
router.get("/documents", requireAuth, (_req, res) => {
  const root = docsRoot();
  const items = DOCS.map((d) => {
    const full = path.join(root, d.filename);
    let bytes: number | null = null;
    try {
      bytes = statSync(full).size;
    } catch {
      bytes = null;
    }
    return {
      slug: d.slug,
      title: d.title,
      subtitle: d.subtitle,
      kind: d.kind,
      filename: d.filename,
      bytes,
    };
  });
  res.json({ documents: items });
});

// GET /investors/download/:slug — stream gated PDF/file
router.get("/download/:slug", requireAuth, async (req, res) => {
  const slug = req.params.slug;
  const doc = DOCS.find((d) => d.slug === slug);
  if (!doc) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const root = docsRoot();
  const full = path.join(root, doc.filename);
  // Defence-in-depth: guarantee we don't escape docsRoot
  if (!full.startsWith(root + path.sep)) {
    res.status(400).json({ error: "bad_path" });
    return;
  }
  if (!existsSync(full)) {
    res.status(404).json({ error: "missing_file" });
    return;
  }

  await recordEvent(req, "download", true, doc.slug);

  const contentType = (() => {
    switch (doc.kind) {
      case "pdf":
        return "application/pdf";
      case "pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "md":
        return "text/markdown; charset=utf-8";
    }
  })();

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", String(statSync(full).size));
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${doc.filename}"`,
  );
  createReadStream(full).pipe(res);
});

// GET /investors/access-log — gated; recent activity for the founders
router.get("/access-log", requireAuth, async (_req, res) => {
  const rows = await db
    .select()
    .from(investor_access_log)
    .orderBy(desc(investor_access_log.ts))
    .limit(50);
  res.json({ entries: rows });
});

export default router;
