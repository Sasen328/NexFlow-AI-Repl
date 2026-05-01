/**
 * /api/engines/* — Intelligence Engines REST surface.
 *
 *   POST  /masaar/run            — runs full Masaar CR-lookup pipeline
 *   POST  /person-intel/run      — runs ProsEngine Person Intelligence
 *   POST  /company-intel/run     — runs ProsEngine Company Intelligence
 *   POST  /lead-finder/run       — runs Lead Finder by company name (NEW)
 *   GET   /runs                  — recent run history (filter ?engine=)
 *   GET   /runs/:id              — full run row
 *   PATCH /runs/:id              — { saved?, tags?, notes? }
 *   DELETE /runs/:id             — delete a saved/historical run
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { db, engine_runs } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  runMasaarPipeline,
  runPersonIntel,
  runCompanyIntel,
  findLeadsByCompany,
} from "../lib/engines/index.js";

const router: IRouter = Router();

// ─────────────────────── helpers ──────────────────────────────

async function persistRun(opts: {
  engine: string;
  title: string;
  input: Record<string, unknown>;
  report: Record<string, unknown> | null;
  sourcesUsed: string[];
  durationMs: number;
  status: "ok" | "error";
  error?: string | null;
}): Promise<string> {
  const [row] = await db.insert(engine_runs).values({
    engine: opts.engine,
    title: opts.title.slice(0, 200),
    input: opts.input,
    report: opts.report ?? null,
    sources_used: opts.sourcesUsed,
    duration_ms: opts.durationMs,
    status: opts.status,
    error: opts.error ?? null,
  }).returning({ id: engine_runs.id });
  return row.id;
}

function runHandler<TInput>(opts: {
  engine: string;
  schema: z.ZodType<TInput>;
  titleOf: (input: TInput) => string;
  exec: (input: TInput) => Promise<{ report: any; sourcesUsed: string[] }>;
}) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = opts.schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const started = Date.now();
    try {
      const { report, sourcesUsed } = await opts.exec(parsed.data);
      const durationMs = Date.now() - started;
      const id = await persistRun({
        engine: opts.engine,
        title: opts.titleOf(parsed.data),
        input: parsed.data as unknown as Record<string, unknown>,
        report,
        sourcesUsed,
        durationMs,
        status: "ok",
      });
      res.json({ id, durationMs, sourcesUsed, report });
    } catch (e: any) {
      const durationMs = Date.now() - started;
      req.log?.error({ err: e, engine: opts.engine }, "engine run failed");
      const id = await persistRun({
        engine: opts.engine,
        title: opts.titleOf(parsed.data),
        input: parsed.data as unknown as Record<string, unknown>,
        report: null,
        sourcesUsed: [],
        durationMs,
        status: "error",
        error: e?.message ?? String(e),
      }).catch(() => "");
      res.status(500).json({ id, error: e?.message ?? "engine run failed" });
    }
  };
}

// Special-case the Masaar runner since its return shape is the report itself
function masaarRunHandler() {
  return async (req: Request, res: Response): Promise<void> => {
    const schema = z.object({
      crNumber: z.string().regex(/^\d{10}$/).optional(),
      nameAr: z.string().optional(),
      nameEn: z.string().optional(),
    }).refine((d) => d.crNumber || d.nameAr || d.nameEn, {
      message: "Provide crNumber or nameEn or nameAr",
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const started = Date.now();
    const titleOf = (rep?: any) =>
      parsed.data.crNumber
        ? `CR ${parsed.data.crNumber}${rep?.parsed?.nameEn ? " · " + rep.parsed.nameEn : ""}`
        : (parsed.data.nameEn ?? parsed.data.nameAr ?? "Masaar lookup");
    try {
      const report = await runMasaarPipeline(parsed.data);
      const durationMs = Date.now() - started;
      const sourcesUsed = Object.entries(report.sources)
        .filter(([, v]) => (v as { ok: boolean })?.ok)
        .map(([k]) => k);
      const id = await persistRun({
        engine: "masaar",
        title: titleOf(report),
        input: parsed.data as Record<string, unknown>,
        report: report as unknown as Record<string, unknown>,
        sourcesUsed,
        durationMs,
        status: "ok",
      });
      res.json({ id, durationMs, sourcesUsed, report });
    } catch (e: any) {
      const durationMs = Date.now() - started;
      req.log?.error({ err: e }, "Masaar pipeline failed");
      const id = await persistRun({
        engine: "masaar",
        title: titleOf(),
        input: parsed.data as Record<string, unknown>,
        report: null,
        sourcesUsed: [],
        durationMs,
        status: "error",
        error: e?.message ?? String(e),
      }).catch(() => "");
      res.status(500).json({ id, error: e?.message ?? "Masaar pipeline failed" });
    }
  };
}

/**
 * Reject URLs that point at private/internal addresses. Lightweight SSRF guard
 * for the user-supplied URLs that flow into our scrapers (LinkedIn URL,
 * company website, etc).
 */
function isSafePublicUrl(raw: string | undefined): boolean {
  if (!raw) return true; // optional field
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local")) return false;
    if (host === "0.0.0.0" || host === "::1") return false;
    // IPv4 private ranges
    if (/^127\./.test(host)) return false;
    if (/^10\./.test(host)) return false;
    if (/^192\.168\./.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
    if (/^169\.254\./.test(host)) return false; // link-local incl AWS metadata
    return true;
  } catch { return false; }
}

const safeUrl = z.string().url().refine(isSafePublicUrl, { message: "URL must point to a public host" });

/**
 * Fire-and-poll handler. Inserts a "pending" engine_run, returns { jobId } in
 * < 100 ms, then runs the engine in the background and updates the row.
 * The client polls GET /runs/:jobId until status !== "pending".
 */
function startHandler<TInput>(opts: {
  engine: string;
  schema: z.ZodType<TInput>;
  titleOf: (input: TInput) => string;
  exec: (input: TInput) => Promise<{ report: any; sourcesUsed: string[] }>;
}) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = opts.schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const input = parsed.data;
    // Insert pending row immediately so the client can poll
    const [{ id: jobId }] = await db
      .insert(engine_runs)
      .values({
        engine: opts.engine,
        title: opts.titleOf(input),
        input: input as unknown as Record<string, unknown>,
        report: null,
        sources_used: [],
        duration_ms: 0,
        status: "pending",
      })
      .returning({ id: engine_runs.id });

    // Respond immediately
    res.status(202).json({ jobId });

    // Run engine in background — never awaited by the request
    const started = Date.now();
    opts
      .exec(input)
      .then(async ({ report, sourcesUsed }) => {
        await db
          .update(engine_runs)
          .set({
            report,
            sources_used: sourcesUsed,
            duration_ms: Date.now() - started,
            status: "ok",
            updated_at: new Date(),
          })
          .where(eq(engine_runs.id, jobId));
      })
      .catch(async (e: any) => {
        await db
          .update(engine_runs)
          .set({
            duration_ms: Date.now() - started,
            status: "error",
            error: e?.message ?? "engine run failed",
            updated_at: new Date(),
          })
          .where(eq(engine_runs.id, jobId));
      });
  };
}

// ─────────────────────── routes ──────────────────────────────

router.post("/masaar/run", masaarRunHandler());

router.post(
  "/person-intel/run",
  runHandler({
    engine: "person_intel",
    schema: z.object({
      name: z.string().min(2),
      company: z.string().optional(),
      title: z.string().optional(),
      linkedinUrl: safeUrl.optional(),
      websiteUrl: safeUrl.optional(),
      country: z.string().optional(),
      knownFacts: z.string().optional(),
      sellerContext: z.object({
        companyName: z.string().optional(),
        product: z.string().optional(),
        objectives: z.array(z.string()).optional(),
      }).optional(),
    }),
    titleOf: (i) => `${i.name}${i.company ? " · " + i.company : ""}`,
    exec: (i) => runPersonIntel(i),
  }),
);

router.post(
  "/company-intel/run",
  runHandler({
    engine: "company_intel",
    schema: z.object({
      companyName: z.string().min(2),
      website: safeUrl.optional(),
      crNumber: z.string().regex(/^\d{10}$/).optional(),
      city: z.string().optional(),
      knownFacts: z.string().optional(),
      sellerContext: z.object({
        companyName: z.string().optional(),
        product: z.string().optional(),
        objectives: z.array(z.string()).optional(),
      }).optional(),
    }),
    titleOf: (i) => `${i.companyName}${i.city ? " · " + i.city : ""}`,
    exec: (i) => runCompanyIntel(i),
  }),
);

router.post(
  "/lead-finder/run",
  runHandler({
    engine: "lead_finder",
    schema: z.object({
      companyName: z.string().min(2),
      website: safeUrl.optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      rolesWanted: z.array(z.string()).optional(),
      count: z.number().int().min(1).max(25).optional(),
    }),
    titleOf: (i) => `${i.companyName}${i.count ? " · " + i.count + " leads" : ""}`,
    exec: (i) => findLeadsByCompany(i),
  }),
);

// ─── async /start routes (fire-and-poll, avoids 30s proxy timeout) ───

const personIntelSchema = z.object({
  name: z.string().min(2),
  company: z.string().optional(),
  title: z.string().optional(),
  linkedinUrl: safeUrl.optional(),
  websiteUrl: safeUrl.optional(),
  country: z.string().optional(),
  knownFacts: z.string().optional(),
  sellerContext: z.object({
    companyName: z.string().optional(),
    product: z.string().optional(),
    objectives: z.array(z.string()).optional(),
  }).optional(),
});

const companyIntelSchema = z.object({
  companyName: z.string().min(2),
  website: safeUrl.optional(),
  crNumber: z.string().regex(/^\d{10}$/).optional(),
  city: z.string().optional(),
  knownFacts: z.string().optional(),
  sellerContext: z.object({
    companyName: z.string().optional(),
    product: z.string().optional(),
    objectives: z.array(z.string()).optional(),
  }).optional(),
});

const leadFinderSchema = z.object({
  companyName: z.string().min(2),
  website: safeUrl.optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  rolesWanted: z.array(z.string()).optional(),
  count: z.number().int().min(1).max(25).optional(),
});

router.post(
  "/person-intel/start",
  startHandler({
    engine: "person_intel",
    schema: personIntelSchema,
    titleOf: (i) => `${i.name}${i.company ? " · " + i.company : ""}`,
    exec: (i) => runPersonIntel(i),
  }),
);

router.post(
  "/company-intel/start",
  startHandler({
    engine: "company_intel",
    schema: companyIntelSchema,
    titleOf: (i) => `${i.companyName}${i.city ? " · " + i.city : ""}`,
    exec: (i) => runCompanyIntel(i),
  }),
);

router.post(
  "/lead-finder/start",
  startHandler({
    engine: "lead_finder",
    schema: leadFinderSchema,
    titleOf: (i) => `${i.companyName}${i.count ? " · " + i.count + " leads" : ""}`,
    exec: (i) => findLeadsByCompany(i),
  }),
);

// ─── history ───
router.get("/runs", async (req, res) => {
  const engine = typeof req.query.engine === "string" ? req.query.engine : null;
  const savedOnly = req.query.saved === "1" || req.query.saved === "true";
  const limit = Math.min(100, Number(req.query.limit ?? 50) || 50);
  try {
    let q = db
      .select({
        id: engine_runs.id,
        engine: engine_runs.engine,
        title: engine_runs.title,
        sources_used: engine_runs.sources_used,
        duration_ms: engine_runs.duration_ms,
        status: engine_runs.status,
        error: engine_runs.error,
        saved: engine_runs.saved,
        tags: engine_runs.tags,
        notes: engine_runs.notes,
        created_at: engine_runs.created_at,
      })
      .from(engine_runs)
      .orderBy(desc(engine_runs.created_at))
      .$dynamic();
    if (engine) q = q.where(eq(engine_runs.engine, engine));
    if (savedOnly) q = q.where(eq(engine_runs.saved, true));
    const rows = await q.limit(limit);
    res.json({ rows });
  } catch (e: any) {
    req.log?.error({ err: e }, "engine_runs list failed");
    res.status(500).json({ error: e?.message ?? "list failed" });
  }
});

router.get("/runs/:id", async (req, res): Promise<void> => {
  try {
    const [row] = await db.select().from(engine_runs).where(eq(engine_runs.id, req.params.id)).limit(1);
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ row });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "fetch failed" });
  }
});

router.patch("/runs/:id", async (req, res): Promise<void> => {
  const schema = z.object({
    saved: z.boolean().optional(),
    tags: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  try {
    const [row] = await db
      .update(engine_runs)
      .set({ ...parsed.data, updated_at: new Date() } as any)
      .where(eq(engine_runs.id, req.params.id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ row });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "update failed" });
  }
});

router.delete("/runs/:id", async (req, res) => {
  try {
    await db.delete(engine_runs).where(eq(engine_runs.id, req.params.id));
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "delete failed" });
  }
});

export default router;
