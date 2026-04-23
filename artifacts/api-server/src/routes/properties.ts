import { Router } from "express";
import { db } from "@workspace/db";
import { custom_properties, custom_property_values } from "@workspace/db";
import { and, eq, asc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { object_type } = req.query as Record<string, string>;
    const where = object_type ? eq(custom_properties.object_type, object_type as any) : undefined;
    const props = await db.select().from(custom_properties).where(where as any).orderBy(asc(custom_properties.display_order));
    res.json({ properties: props, total: props.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/", async (req, res) => {
  try {
    const [p] = await db.insert(custom_properties).values({ ...req.body, org_id: "default" }).returning();
    res.status(201).json(p);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.delete(custom_properties).where(eq(custom_properties.id, req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/values/:entityId", async (req, res) => {
  try {
    const vals = await db.select().from(custom_property_values).where(eq(custom_property_values.entity_id, req.params.entityId));
    res.json({ values: vals });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

router.post("/values", async (req, res) => {
  try {
    const { property_id, entity_id, value } = req.body;
    // upsert
    const existing = await db.select().from(custom_property_values).where(and(eq(custom_property_values.property_id, property_id), eq(custom_property_values.entity_id, entity_id)));
    if (existing[0]) {
      const [updated] = await db.update(custom_property_values).set({ value, updated_at: new Date() }).where(eq(custom_property_values.id, existing[0].id)).returning();
      return res.json(updated);
    }
    const [created] = await db.insert(custom_property_values).values({ property_id, entity_id, value }).returning();
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Failed" });
  }
});

export default router;
