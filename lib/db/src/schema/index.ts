import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Enums ──────────────────────────────────────────────────────────────────
export const contactStatusEnum = pgEnum("contact_status", [
  "new",
  "active",
  "qualified",
  "unqualified",
  "customer",
]);

export const dealStageEnum = pgEnum("deal_stage", [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "call",
  "email",
  "whatsapp",
  "meeting",
  "note",
  "task",
]);

export const activityStatusEnum = pgEnum("activity_status", [
  "pending",
  "completed",
  "cancelled",
]);

export const signalTypeEnum = pgEnum("signal_type", [
  "funding_round",
  "exec_move",
  "expansion",
  "hiring",
  "product_launch",
  "news",
  "social",
]);

export const signalStatusEnum = pgEnum("signal_status", [
  "new",
  "viewed",
  "actioned",
  "dismissed",
]);

export const callStatusEnum = pgEnum("call_status", [
  "scheduled",
  "in_progress",
  "completed",
  "missed",
  "failed",
]);

export const callDirectionEnum = pgEnum("call_direction", [
  "inbound",
  "outbound",
]);

export const scriptTypeEnum = pgEnum("script_type", [
  "cold_call",
  "follow_up",
  "demo",
  "objection_handling",
  "closing",
]);

export const scriptLanguageEnum = pgEnum("script_language", [
  "en",
  "ar",
  "both",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "signal",
  "deal",
  "call",
  "task",
  "system",
  "ai",
]);

export const companySizeEnum = pgEnum("company_size", [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
]);

// ── Tables ─────────────────────────────────────────────────────────────────
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  domain: text("domain"),
  industry: text("industry"),
  size: companySizeEnum("size"),
  country: text("country"),
  revenue: integer("revenue"),
  logo_url: text("logo_url"),
  linkedin_url: text("linkedin_url"),
  website: text("website"),
  description: text("description"),
  tags: text("tags").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  company_id: uuid("company_id").references(() => companies.id),
  lead_score: doublePrecision("lead_score").default(0),
  status: contactStatusEnum("status").default("new").notNull(),
  avatar_url: text("avatar_url"),
  linkedin_url: text("linkedin_url"),
  notes: text("notes"),
  tags: text("tags").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  title: text("title").notNull(),
  contact_id: uuid("contact_id").references(() => contacts.id),
  company_id: uuid("company_id").references(() => companies.id),
  stage: dealStageEnum("stage").default("lead").notNull(),
  value: integer("value").default(0),
  currency: text("currency").default("USD"),
  probability: doublePrecision("probability").default(0),
  expected_close_date: timestamp("expected_close_date"),
  notes: text("notes"),
  tags: text("tags").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  contact_id: uuid("contact_id").references(() => contacts.id),
  deal_id: uuid("deal_id").references(() => deals.id),
  type: activityTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  status: activityStatusEnum("status").default("pending").notNull(),
  scheduled_at: timestamp("scheduled_at"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const signals = pgTable("signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  contact_id: uuid("contact_id").references(() => contacts.id),
  company_id: uuid("company_id").references(() => companies.id),
  type: signalTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  score: doublePrecision("score").default(0),
  status: signalStatusEnum("status").default("new").notNull(),
  source_url: text("source_url"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const segments = pgTable("segments", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  description: text("description"),
  filter_query: text("filter_query"),
  contact_count: integer("contact_count").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const calls = pgTable("calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  contact_id: uuid("contact_id").references(() => contacts.id),
  direction: callDirectionEnum("direction").default("outbound"),
  status: callStatusEnum("status").default("scheduled").notNull(),
  duration_seconds: integer("duration_seconds"),
  recording_url: text("recording_url"),
  transcript: text("transcript"),
  sentiment_score: doublePrecision("sentiment_score"),
  call_score: doublePrecision("call_score"),
  coaching_notes: text("coaching_notes"),
  started_at: timestamp("started_at"),
  ended_at: timestamp("ended_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const scripts = pgTable("scripts", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  type: scriptTypeEnum("type").notNull(),
  content: text("content").notNull(),
  language: scriptLanguageEnum("language").default("en"),
  tags: text("tags").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  title: text("title").notNull(),
  body: text("body"),
  type: notificationTypeEnum("type").notNull(),
  read: boolean("read").default(false).notNull(),
  entity_id: text("entity_id"),
  entity_type: text("entity_type"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ── Insert Schemas & Types ──────────────────────────────────────────────────
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  created_at: true,
});
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  created_at: true,
});
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;

export const insertSegmentSchema = createInsertSchema(segments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type InsertSegment = z.infer<typeof insertSegmentSchema>;
export type Segment = typeof segments.$inferSelect;

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  created_at: true,
});
export type InsertCall = z.infer<typeof insertCallSchema>;
export type CallRecord = typeof calls.$inferSelect;

export const insertScriptSchema = createInsertSchema(scripts).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
