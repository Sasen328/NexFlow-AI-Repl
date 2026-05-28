// §11A — Harvest source registry API.
// Endpoints:
//   GET    /api/sources?category=&engine=
//   POST   /api/sources
//   PATCH  /api/sources/:id
//   DELETE /api/sources/:id
//   POST   /api/sources/:id/test

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { harvest_sources, source_enforcement } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const router = Router();
const p = (x: string | string[]): string => Array.isArray(x) ? x[0] : x;

router.get("/sources", async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await db.select().from(harvest_sources)
      .where(category ? eq(harvest_sources.category, category) : undefined as any);
    res.json({ sources: rows });
  } catch (err: any) {
    res.status(500).json({ error: "query_failed", message: err?.message });
  }
});

const createSchema = z.object({
  label:      z.string().min(1),
  url:        z.string().optional(),
  type:       z.enum(["rss", "sitemap", "api", "web", "pdf", "gov-registry"]).default("web"),
  category:   z.string().default("custom"),
  language:   z.enum(["ar", "en", "both"]).default("both"),
  credibility:z.enum(["primary", "secondary", "inferred"]).default("secondary"),
  trustWeight:z.number().int().min(0).max(100).default(65),
  countries:  z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
});

router.post("/sources", async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "validation_failed", issues: parsed.error.issues }); return; }
  try {
    const [row] = await db.insert(harvest_sources).values({
      ...parsed.data,
      visibility: "user",
      countries:  parsed.data.countries  ?? [],
      industries: parsed.data.industries ?? [],
    } as any).returning();
    res.json({ ok: true, source: row });
  } catch (err: any) {
    res.status(500).json({ error: "insert_failed", message: err?.message });
  }
});

router.patch("/sources/:id", async (req: Request, res: Response) => {
  const id = parseInt(p(req.params.id), 10);
  if (!id) { res.status(400).json({ error: "bad_id" }); return; }
  try {
    const [row] = await db.update(harvest_sources)
      .set(req.body as any)
      .where(eq(harvest_sources.id, id))
      .returning();
    res.json({ ok: true, source: row });
  } catch (err: any) {
    res.status(500).json({ error: "update_failed", message: err?.message });
  }
});

router.delete("/sources/:id", async (req: Request, res: Response) => {
  const id = parseInt(p(req.params.id), 10);
  if (!id) { res.status(400).json({ error: "bad_id" }); return; }
  try {
    await db.delete(harvest_sources)
      .where(and(eq(harvest_sources.id, id), eq(harvest_sources.visibility, "user")));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: "delete_failed", message: err?.message });
  }
});

router.post("/sources/:id/test", async (req: Request, res: Response) => {
  const id = parseInt(p(req.params.id), 10);
  if (!id) { res.status(400).json({ error: "bad_id" }); return; }
  try {
    const [src] = await db.select().from(harvest_sources).where(eq(harvest_sources.id, id));
    if (!src) { res.status(404).json({ error: "not_found" }); return; }
    if (!src.url) { res.json({ ok: true, reachable: false, message: "no URL configured" }); return; }
    const axios = (await import("axios")).default;
    const start = Date.now();
    try {
      await axios.head(src.url, { timeout: 8000 });
      const latencyMs = Date.now() - start;
      await db.update(harvest_sources)
        .set({ status: "ok", lastSynced: new Date() } as any)
        .where(eq(harvest_sources.id, id));
      res.json({ ok: true, reachable: true, latencyMs });
    } catch {
      await db.update(harvest_sources)
        .set({ status: "down" } as any)
        .where(eq(harvest_sources.id, id));
      res.json({ ok: false, reachable: false, message: "unreachable" });
    }
  } catch (err: any) {
    res.status(500).json({ error: "test_failed", message: err?.message });
  }
});

// GET /api/sources/enforcement?engine=lead-factory
router.get("/sources/enforcement", async (req: Request, res: Response) => {
  try {
    const engine = req.query.engine as string | undefined;
    const rows = await db.select().from(source_enforcement)
      .where(engine ? eq(source_enforcement.engineName, engine) : undefined as any);
    res.json({ enforcement: rows });
  } catch (err: any) {
    res.status(500).json({ error: "query_failed", message: err?.message });
  }
});

export default router;
