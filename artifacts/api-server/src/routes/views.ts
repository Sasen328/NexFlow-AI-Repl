import { Router } from "express";
import { db } from "@workspace/db";
import { saved_views } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { object_type, type } = req.query as Record<string, string>;
    // Filter by object_type if it's a real schema enum. `type=form` is a
    // legacy alias from the web-forms page meaning "all forms" — we keep all.
    const where = object_type ? eq(saved_views.object_type, object_type as any) : undefined;
    const rows = await db.select().from(saved_views).where(where as any).orderBy(desc(saved_views.created_at));
    const filtered = type === "form"
      ? rows.filter((r: any) => (r.filters as any)?.view_type === "form")
      : rows;
    res.json({ views: filtered });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const b = req.body ?? {};
    // Map flexible client payloads (forms / saved-views) into schema columns.
    // `view_type` from form-builder UI is stored inside filters and we always
    // use a safe default for object_type since the enum is contact/company/deal.
    const filters =
      typeof b.filters === "object" && b.filters !== null
        ? { ...b.filters, view_type: b.view_type ?? b.filters?.view_type ?? "list" }
        : { view_type: b.view_type ?? "list", fields: b.fields ?? [] };
    const values = {
      name: String(b.name ?? "Untitled"),
      object_type: (b.object_type ?? "contact") as any,
      filters,
      columns: b.columns ?? null,
      is_shared: Boolean(b.is_shared ?? true),
      org_id: "default",
    };
    const [v] = await db.insert(saved_views).values(values).returning();
    res.status(201).json(v);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const b = req.body ?? {};
    const patch: Record<string, unknown> = {};
    if (b.name !== undefined) patch.name = String(b.name);
    if (b.object_type !== undefined) patch.object_type = b.object_type;
    if (b.filters !== undefined || b.view_type !== undefined || b.fields !== undefined) {
      patch.filters = {
        ...(typeof b.filters === "object" && b.filters !== null ? b.filters : {}),
        ...(b.view_type !== undefined ? { view_type: b.view_type } : {}),
        ...(b.fields !== undefined ? { fields: b.fields } : {}),
      };
    }
    if (b.columns !== undefined) patch.columns = b.columns;
    if (b.is_shared !== undefined) patch.is_shared = Boolean(b.is_shared);
    const [v] = await db.update(saved_views).set(patch).where(eq(saved_views.id, req.params.id)).returning();
    res.json(v);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(saved_views).where(eq(saved_views.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
