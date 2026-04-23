import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  pgEnum,
  jsonb,
  primaryKey,
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
  "web_visit",
  "email_open",
  "email_click",
  "form_submit",
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

export const propertyObjectEnum = pgEnum("property_object", [
  "contact",
  "company",
  "deal",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "text",
  "long_text",
  "number",
  "date",
  "boolean",
  "select",
  "multiselect",
  "url",
  "email",
  "phone",
]);

export const automationTriggerEnum = pgEnum("automation_trigger", [
  "stage_change",
  "activity_completed",
  "signal_received",
  "no_answer",
  "form_submitted",
  "score_threshold",
  "schedule",
  "campaign_open",
]);

export const campaignChannelEnum = pgEnum("campaign_channel", [
  "email",
  "whatsapp",
  "sms",
  "linkedin",
  "voice",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "scheduled",
  "running",
  "paused",
  "completed",
]);

export const insightSeverityEnum = pgEnum("insight_severity", [
  "info",
  "opportunity",
  "warning",
  "critical",
]);

// ── Users (Contact Owners / Reps) ──────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatar_url: text("avatar_url"),
  role: text("role").default("rep"),
  timezone: text("timezone").default("UTC"),
  active: boolean("active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ── Tables ─────────────────────────────────────────────────────────────────
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  domain: text("domain"),
  industry: text("industry"),
  size: companySizeEnum("size"),
  country: text("country"),
  city: text("city"),
  revenue: integer("revenue"),
  logo_url: text("logo_url"),
  linkedin_url: text("linkedin_url"),
  website: text("website"),
  description: text("description"),
  tags: text("tags").array(),
  owner_id: uuid("owner_id").references(() => users.id),
  intelligence: jsonb("intelligence"),
  intelligence_updated_at: timestamp("intelligence_updated_at"),
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
  owner_id: uuid("owner_id").references(() => users.id),
  lead_score: doublePrecision("lead_score").default(0),
  status: contactStatusEnum("status").default("new").notNull(),
  avatar_url: text("avatar_url"),
  linkedin_url: text("linkedin_url"),
  notes: text("notes"),
  tags: text("tags").array(),
  source: text("source"),
  source_campaign_id: uuid("source_campaign_id"),
  utm_source: text("utm_source"),
  utm_medium: text("utm_medium"),
  utm_campaign: text("utm_campaign"),
  best_call_time: text("best_call_time"),
  last_engaged_at: timestamp("last_engaged_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  title: text("title").notNull(),
  contact_id: uuid("contact_id").references(() => contacts.id),
  company_id: uuid("company_id").references(() => companies.id),
  owner_id: uuid("owner_id").references(() => users.id),
  stage: dealStageEnum("stage").default("lead").notNull(),
  value: integer("value").default(0),
  currency: text("currency").default("USD"),
  probability: doublePrecision("probability").default(0),
  expected_close_date: timestamp("expected_close_date"),
  notes: text("notes"),
  tags: text("tags").array(),
  stage_changed_at: timestamp("stage_changed_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  contact_id: uuid("contact_id").references(() => contacts.id),
  deal_id: uuid("deal_id").references(() => deals.id),
  owner_id: uuid("owner_id").references(() => users.id),
  type: activityTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  status: activityStatusEnum("status").default("pending").notNull(),
  metadata: jsonb("metadata"),
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
  owner_id: uuid("owner_id").references(() => users.id),
  direction: callDirectionEnum("direction").default("outbound"),
  status: callStatusEnum("status").default("scheduled").notNull(),
  duration_seconds: integer("duration_seconds"),
  recording_url: text("recording_url"),
  transcript: text("transcript"),
  sentiment_score: doublePrecision("sentiment_score"),
  call_score: doublePrecision("call_score"),
  outcome: text("outcome"),
  coaching_notes: text("coaching_notes"),
  ai_insights: jsonb("ai_insights"),
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

// ── Custom Properties (HubSpot-style) ───────────────────────────────────────
export const custom_properties = pgTable("custom_properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  object_type: propertyObjectEnum("object_type").notNull(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  type: propertyTypeEnum("type").notNull(),
  description: text("description"),
  options: jsonb("options"),
  required: boolean("required").default(false),
  display_order: integer("display_order").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const custom_property_values = pgTable("custom_property_values", {
  id: uuid("id").primaryKey().defaultRandom(),
  property_id: uuid("property_id").references(() => custom_properties.id, { onDelete: "cascade" }).notNull(),
  entity_id: uuid("entity_id").notNull(),
  value: text("value"),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// ── Static Lists & Saved Views ──────────────────────────────────────────────
export const static_lists = pgTable("static_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  description: text("description"),
  object_type: propertyObjectEnum("object_type").default("contact").notNull(),
  owner_id: uuid("owner_id").references(() => users.id),
  member_count: integer("member_count").default(0),
  color: text("color").default("#88B8B0"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const static_list_members = pgTable("static_list_members", {
  list_id: uuid("list_id").references(() => static_lists.id, { onDelete: "cascade" }).notNull(),
  entity_id: uuid("entity_id").notNull(),
  added_at: timestamp("added_at").defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.list_id, t.entity_id] }),
}));

export const saved_views = pgTable("saved_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  object_type: propertyObjectEnum("object_type").notNull(),
  filters: jsonb("filters").notNull(),
  columns: jsonb("columns"),
  is_shared: boolean("is_shared").default(false),
  owner_id: uuid("owner_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ── Dashboards & Reports ────────────────────────────────────────────────────
export const dashboards = pgTable("dashboards", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  description: text("description"),
  layout: jsonb("layout"),
  filters: jsonb("filters"),
  owner_id: uuid("owner_id").references(() => users.id),
  is_shared: boolean("is_shared").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const dashboard_widgets = pgTable("dashboard_widgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  dashboard_id: uuid("dashboard_id").references(() => dashboards.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  config: jsonb("config").notNull(),
  position: integer("position").default(0),
  width: text("width").default("md"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ── Automations ─────────────────────────────────────────────────────────────
export const automation_rules = pgTable("automation_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  description: text("description"),
  trigger: automationTriggerEnum("trigger").notNull(),
  trigger_config: jsonb("trigger_config"),
  conditions: jsonb("conditions"),
  actions: jsonb("actions").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  run_count: integer("run_count").default(0),
  last_run_at: timestamp("last_run_at"),
  owner_id: uuid("owner_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const automation_runs = pgTable("automation_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  rule_id: uuid("rule_id").references(() => automation_rules.id, { onDelete: "cascade" }).notNull(),
  entity_id: uuid("entity_id"),
  entity_type: text("entity_type"),
  status: text("status").notNull(),
  result: jsonb("result"),
  ran_at: timestamp("ran_at").defaultNow().notNull(),
});

// ── Marketing Campaigns ─────────────────────────────────────────────────────
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  channel: campaignChannelEnum("channel").notNull(),
  status: campaignStatusEnum("status").default("draft").notNull(),
  subject: text("subject"),
  content: text("content"),
  audience_filter: jsonb("audience_filter"),
  audience_count: integer("audience_count").default(0),
  sent_count: integer("sent_count").default(0),
  opened_count: integer("opened_count").default(0),
  clicked_count: integer("clicked_count").default(0),
  replied_count: integer("replied_count").default(0),
  converted_count: integer("converted_count").default(0),
  utm_source: text("utm_source"),
  utm_medium: text("utm_medium"),
  utm_campaign: text("utm_campaign"),
  scheduled_at: timestamp("scheduled_at"),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  owner_id: uuid("owner_id").references(() => users.id),
  ai_generated: boolean("ai_generated").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const campaign_recipients = pgTable("campaign_recipients", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaign_id: uuid("campaign_id").references(() => campaigns.id, { onDelete: "cascade" }).notNull(),
  contact_id: uuid("contact_id").references(() => contacts.id, { onDelete: "cascade" }).notNull(),
  status: text("status").default("pending"),
  sent_at: timestamp("sent_at"),
  opened_at: timestamp("opened_at"),
  clicked_at: timestamp("clicked_at"),
  replied_at: timestamp("replied_at"),
});

// ── AI Agents (user-built) ──────────────────────────────────────────────────
export const ai_agents = pgTable("ai_agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").default("Bot"),
  system_prompt: text("system_prompt").notNull(),
  model: text("model").default("openai/gpt-4o-mini"),
  tools: jsonb("tools"),
  trigger_type: text("trigger_type").default("manual"),
  schedule_cron: text("schedule_cron"),
  enabled: boolean("enabled").default(true).notNull(),
  run_count: integer("run_count").default(0),
  last_run_at: timestamp("last_run_at"),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const ai_agent_runs = pgTable("ai_agent_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  agent_id: uuid("agent_id").references(() => ai_agents.id, { onDelete: "cascade" }).notNull(),
  input: text("input"),
  output: text("output"),
  status: text("status").default("completed"),
  duration_ms: integer("duration_ms"),
  ran_at: timestamp("ran_at").defaultNow().notNull(),
});

// ── AI Insights (daily / situational) ───────────────────────────────────────
export const ai_insights = pgTable("ai_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: text("org_id").notNull().default("default"),
  category: text("category").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  severity: insightSeverityEnum("severity").default("info").notNull(),
  related_entity_id: uuid("related_entity_id"),
  related_entity_type: text("related_entity_type"),
  metadata: jsonb("metadata"),
  generated_at: timestamp("generated_at").defaultNow().notNull(),
});

// ── Insert Schemas & Types ──────────────────────────────────────────────────
const omitTimestamps = { id: true, created_at: true, updated_at: true } as const;

export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertCompanySchema = createInsertSchema(companies).omit(omitTimestamps);
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export const insertContactSchema = createInsertSchema(contacts).omit(omitTimestamps);
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

export const insertDealSchema = createInsertSchema(deals).omit(omitTimestamps);
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, created_at: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export const insertSignalSchema = createInsertSchema(signals).omit({ id: true, created_at: true });
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;

export const insertSegmentSchema = createInsertSchema(segments).omit(omitTimestamps);
export type InsertSegment = z.infer<typeof insertSegmentSchema>;
export type Segment = typeof segments.$inferSelect;

export const insertCallSchema = createInsertSchema(calls).omit({ id: true, created_at: true });
export type InsertCall = z.infer<typeof insertCallSchema>;
export type CallRecord = typeof calls.$inferSelect;

export const insertScriptSchema = createInsertSchema(scripts).omit(omitTimestamps);
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scripts.$inferSelect;

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, created_at: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type CustomProperty = typeof custom_properties.$inferSelect;
export type CustomPropertyValue = typeof custom_property_values.$inferSelect;
export type StaticList = typeof static_lists.$inferSelect;
export type SavedView = typeof saved_views.$inferSelect;
export type Dashboard = typeof dashboards.$inferSelect;
export type DashboardWidget = typeof dashboard_widgets.$inferSelect;
export type AutomationRule = typeof automation_rules.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type AiAgent = typeof ai_agents.$inferSelect;
export type AiInsight = typeof ai_insights.$inferSelect;
