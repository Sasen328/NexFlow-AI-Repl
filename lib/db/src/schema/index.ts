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
  index,
  real,
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

// ── Investor data-room access log ──────────────────────────────────────────
// Logs every passcode attempt and every successful document download from
// the private investor landing page so the founders can see who has been
// engaging with the materials. Stored as a flat append-only table.
export const investor_access_log = pgTable(
  "investor_access_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ts: timestamp("ts").defaultNow().notNull(),
    // "auth_success" | "auth_failure" | "download" | "view"
    action: text("action").notNull(),
    // Slug of the document being downloaded (only for "download")
    doc_slug: text("doc_slug"),
    // Coarse client info — IP from x-forwarded-for and trimmed user agent
    ip: text("ip"),
    user_agent: text("user_agent"),
    // Whether the action was authorised at the time it happened
    success: boolean("success").default(true).notNull(),
  },
  (t) => ({
    // The /access-log endpoint and any future audit query orders by ts DESC.
    tsIdx: index("investor_access_log_ts_idx").on(t.ts),
  }),
);

export type InvestorAccessLogEntry = typeof investor_access_log.$inferSelect;

// ── Enrichment Sources orchestrator ────────────────────────────────────────
// Configuration row per data source (Hunter, Apollo, Lusha, MAGNiTT,
// Wathiq, Tadawul, Public Web Scraper, Python Scraper, etc). API keys are
// stored encrypted via APP-side AES-GCM (or, for now, plain-text in the
// dev env) — never returned in plain-text from GET routes (only the
// "is_set" flag is exposed). Priority orders the waterfall.
export const enrichment_sources = pgTable("enrichment_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Stable machine key e.g. "hunter", "apollo", "lusha", "magnitt", "web_scraper"
  source_key: text("source_key").notNull().unique(),
  // Display name e.g. "Hunter.io"
  name: text("name").notNull(),
  // "api" | "scraper" | "gov_registry" | "exchange" | "ai_scraper"
  kind: text("kind").notNull(),
  // Whether the source is enabled in the waterfall
  enabled: boolean("enabled").default(true).notNull(),
  // Priority — lower runs first. Sources with the same priority run in parallel.
  priority: integer("priority").default(50).notNull(),
  // Encrypted-at-rest API key blob (for now: plain JSON in dev). Never return
  // this in API responses; expose only `key_set: boolean`.
  api_key_cipher: text("api_key_cipher"),
  // Free-form per-source config (rate limit, region preferences, account id, etc.)
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  // Last time the test endpoint was hit and what it returned
  last_test_ok: boolean("last_test_ok"),
  last_test_message: text("last_test_message"),
  last_test_at: timestamp("last_test_at"),
  // Cumulative usage counters (cheap snapshot — full audit is enrichment_runs)
  total_calls: integer("total_calls").default(0).notNull(),
  total_fields_filled: integer("total_fields_filled").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// One row per source-call inside a waterfall run. Used to display per-field
// source attribution badges in the UI ("email · Hunter", "phone · Lusha").
export const enrichment_runs = pgTable(
  "enrichment_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Optional grouping id so multiple source-calls share one waterfall run
    waterfall_id: uuid("waterfall_id"),
    source_key: text("source_key").notNull(),
    // Which lead/contact/company this row was enriching (free-form: not all
    // runs map to a saved row yet)
    target_kind: text("target_kind"), // "contact" | "company" | "seed"
    target_id: text("target_id"),
    seed: jsonb("seed").$type<Record<string, unknown>>(),
    // List of fields this source filled, e.g. ["email","linkedin_url"]
    fields_filled: jsonb("fields_filled").$type<string[]>().default([]).notNull(),
    // Raw enrichment payload returned by the source (capped to 25KB upstream)
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    // Approx USD cost of this call (0 for scrapers, vendor-priced for APIs)
    cost_usd: doublePrecision("cost_usd").default(0).notNull(),
    duration_ms: integer("duration_ms").default(0).notNull(),
    status: text("status").notNull(), // "ok" | "miss" | "error" | "skipped"
    error: text("error"),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    waterfallIdx: index("enrichment_runs_waterfall_idx").on(t.waterfall_id),
    sourceIdx: index("enrichment_runs_source_idx").on(t.source_key),
    createdIdx: index("enrichment_runs_created_idx").on(t.created_at),
  }),
);

// 24-hour scraper response cache so we don't re-fetch the same URL repeatedly
export const scraper_cache = pgTable(
  "scraper_cache",
  {
    // Hash of (url + mode)
    cache_key: text("cache_key").primaryKey(),
    url: text("url").notNull(),
    mode: text("mode").notNull(), // "cheerio" | "playwright" | "crawl4ai" | "bs4"
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    fetched_at: timestamp("fetched_at").defaultNow().notNull(),
  },
  (t) => ({
    fetchedIdx: index("scraper_cache_fetched_idx").on(t.fetched_at),
  }),
);

export type EnrichmentSource = typeof enrichment_sources.$inferSelect;
export type EnrichmentRun = typeof enrichment_runs.$inferSelect;
export type ScraperCacheRow = typeof scraper_cache.$inferSelect;

// ─────────────────────────────────────────────────────────────────────
// Intelligence Engines — Masaar (Saudi CR), ProsEngine (Person/Company),
// Lead Finder (find people at a company by name)
// ─────────────────────────────────────────────────────────────────────
export const engine_runs = pgTable(
  "engine_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engine: text("engine").notNull(), // "masaar" | "person_intel" | "company_intel" | "lead_finder"
    title: text("title").notNull(),   // human label e.g. "CR 1010123456" or "STC · Riyadh"
    input: jsonb("input").$type<Record<string, unknown>>().notNull(),
    report: jsonb("report").$type<Record<string, unknown>>(),
    sources_used: jsonb("sources_used").$type<string[]>().default([]).notNull(),
    duration_ms: integer("duration_ms").default(0).notNull(),
    status: text("status").notNull().default("pending"), // "pending" | "ok" | "error"
    error: text("error"),
    saved: boolean("saved").default(false).notNull(),
    tags: text("tags"),
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    engineIdx: index("engine_runs_engine_idx").on(t.engine),
    createdIdx: index("engine_runs_created_idx").on(t.created_at),
    savedIdx: index("engine_runs_saved_idx").on(t.saved),
  }),
);

export type EngineRun = typeof engine_runs.$inferSelect;

// ─────────────────────────────────────────────────────────────────────
// ProsEngine — Saved Person Intelligence Reports
// ─────────────────────────────────────────────────────────────────────
export const prosengine_research = pgTable(
  "prosengine_research",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    personName: text("person_name").notNull(),
    company: text("company"),
    title: text("title"),
    linkedinUrl: text("linkedin_url"),
    sellerContext: text("seller_context"),
    intelligenceGoals: text("intelligence_goals"),
    knownFacts: text("known_facts"),
    report: jsonb("report").$type<Record<string, unknown>>().notNull(),
    tags: text("tags"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index("prosengine_research_name_idx").on(t.personName),
    createdIdx: index("prosengine_research_created_idx").on(t.createdAt),
  }),
);

export type ProsengineResearch = typeof prosengine_research.$inferSelect;

// ─────────────────────────────────────────────────────────────────────
// Company Intel — Saved Company Intelligence Reports
// ─────────────────────────────────────────────────────────────────────
export const company_intel_research = pgTable(
  "company_intel_research",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    companyName: text("company_name").notNull(),
    crNumber: text("cr_number"),
    city: text("city"),
    website: text("website"),
    sellerContext: text("seller_context"),
    intelligenceGoals: text("intelligence_goals"),
    knownFacts: text("known_facts"),
    report: jsonb("report").$type<Record<string, unknown>>().notNull(),
    tags: text("tags"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index("company_intel_research_name_idx").on(t.companyName),
    createdIdx: index("company_intel_research_created_idx").on(t.createdAt),
  }),
);

export type CompanyIntelResearch = typeof company_intel_research.$inferSelect;

// ─────────────────────────────────────────────────────────────────────
// Lead Lists — AI-generated or manually curated lists of leads
// ─────────────────────────────────────────────────────────────────────
export const lead_lists = pgTable(
  "lead_lists",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: text("name").notNull(),
    criteria: text("criteria"),
    status: text("status").notNull().default("pending"), // "pending" | "running" | "done" | "error"
    totalFound: integer("total_found").default(0).notNull(),
    sourcesSearched: text("sources_searched"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    nameIdx: index("lead_lists_name_idx").on(t.name),
    createdIdx: index("lead_lists_created_idx").on(t.createdAt),
  }),
);

export type LeadList = typeof lead_lists.$inferSelect;

// ─────────────────────────────────────────────────────────────────────
// Lead List Items — individual leads within a list
// ─────────────────────────────────────────────────────────────────────
export const lead_list_items = pgTable(
  "lead_list_items",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    listId: integer("list_id").notNull().references(() => lead_lists.id, { onDelete: "cascade" }),
    personName: text("person_name"),
    personTitle: text("person_title"),
    biography: text("biography"),
    linkedin: text("linkedin"),
    companyName: text("company_name"),
    source: text("source"),
    sourceId: text("source_id"),
    matchScore: integer("match_score").default(0),
    aiScore: integer("ai_score").default(0),
    aiReasoning: text("ai_reasoning"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    listIdx: index("lead_list_items_list_idx").on(t.listId),
    createdIdx: index("lead_list_items_created_idx").on(t.createdAt),
  }),
);

export type LeadListItem = typeof lead_list_items.$inferSelect;

// ── Enterprise Setup Portal ─────────────────────────────────────────────────

export const setup_sessions = pgTable("setup_sessions", {
  id:         uuid("id").primaryKey(),
  setup_path: text("setup_path").notNull().default("managed"),
  status:     text("status").notNull().default("draft"),
  answers:    jsonb("answers").notNull().default({}),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const setup_proposals = pgTable("setup_proposals", {
  id:         uuid("id").primaryKey(),
  session_id: uuid("session_id").notNull().references(() => setup_sessions.id, { onDelete: "cascade" }),
  version:    integer("version").notNull().default(1),
  content:    jsonb("content").notNull().default({}),
  pricing:    jsonb("pricing").notNull().default({}),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  sessionIdx: index("setup_proposals_session_idx").on(t.session_id),
}));

export const tenant_configs = pgTable("tenant_configs", {
  id:              uuid("id").primaryKey(),
  session_id:      uuid("session_id").notNull().references(() => setup_sessions.id),
  slug:            text("slug").notNull().unique(),
  company_name:    text("company_name").notNull().default(""),
  company_name_ar: text("company_name_ar").default(""),
  setup_path:      text("setup_path").notNull().default("managed"),
  enabled_modules: jsonb("enabled_modules").notNull().default([]),
  tab_structure:   jsonb("tab_structure").notNull().default([]),
  branding:        jsonb("branding").notNull().default({}),
  pipeline_stages: jsonb("pipeline_stages"),
  status:          text("status").notNull().default("active"),
  created_at:      timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  slugIdx:    index("tenant_configs_slug_idx").on(t.slug),
  sessionIdx: index("tenant_configs_session_idx").on(t.session_id),
}));

export type SetupSession  = typeof setup_sessions.$inferSelect;
export type SetupProposal = typeof setup_proposals.$inferSelect;
export type TenantConfig  = typeof tenant_configs.$inferSelect;

// ── Masar Company Database (Doc 2) ──────────────────────────────────────────

export const masar_companies = pgTable("masar_companies", {
  id:               integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nameEn:           text("name_en"),
  nameAr:           text("name_ar"),
  crNumber:         text("cr_number"),
  legalForm:        text("legal_form"),
  city:             text("city"),
  industry:         text("industry"),
  phone:            text("phone"),
  email:            text("email"),
  website:          text("website"),
  address:          text("address"),
  paidUpCapital:    text("paid_up_capital"),
  foundingYear:     integer("founding_year"),
  employees:        integer("employees"),
  revenue:          text("revenue"),
  ownerName:        text("owner_name"),
  ownerNameAr:      text("owner_name_ar"),
  ownerTitle:       text("owner_title"),
  keyExecutives:    text("key_executives"),
  shareholders:     text("shareholders"),
  board:            text("board"),
  description:      text("description"),
  marketPositioning: text("market_positioning"),
  sourceId:         text("source_id"),
  sourceUrl:        text("source_url"),
  enrichmentStatus: text("enrichment_status").default("pending"),
  enrichmentScore:  integer("enrichment_score").default(0),
  isValidated:      boolean("is_validated").default(false),
  isDuplicate:      boolean("is_duplicate").default(false),
  crmContactId:     text("crm_contact_id"),
  crmCompanyId:     text("crm_company_id"),
  rawData:          jsonb("raw_data"),
  createdAt:        timestamp("created_at").defaultNow(),
  updatedAt:        timestamp("updated_at").defaultNow(),
}, (t) => ({
  crIdx:      index("masar_companies_cr_idx").on(t.crNumber),
  nameIdx:    index("masar_companies_name_idx").on(t.nameEn),
  sourceIdx:  index("masar_companies_source_idx").on(t.sourceId),
  statusIdx:  index("masar_companies_status_idx").on(t.enrichmentStatus),
}));

export const masar_harvest_jobs = pgTable("masar_harvest_jobs", {
  id:                 integer("id").primaryKey().generatedByDefaultAsIdentity(),
  jobId:              text("job_id").unique().notNull(),
  sourceIds:          jsonb("source_ids").default([]),
  status:             text("status").default("pending"),
  progress:           integer("progress").default(0),
  companiesHarvested: integer("companies_harvested").default(0),
  companiesTotal:     integer("companies_total").default(0),
  error:              text("error"),
  startedAt:          timestamp("started_at"),
  completedAt:        timestamp("completed_at"),
  createdAt:          timestamp("created_at").defaultNow(),
});

export const masar_custom_sources = pgTable("masar_custom_sources", {
  id:                 integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name:               text("name").notNull(),
  nameAr:             text("name_ar"),
  url:                text("url").notNull(),
  category:           text("category").notNull(),
  description:        text("description"),
  estimatedCompanies: integer("estimated_companies").default(0),
  isActive:           boolean("is_active").default(true),
  createdAt:          timestamp("created_at").defaultNow(),
});

export type MasarCompany      = typeof masar_companies.$inferSelect;
export type MasarHarvestJob   = typeof masar_harvest_jobs.$inferSelect;
export type MasarCustomSource = typeof masar_custom_sources.$inferSelect;

// ── AI Database Builder (Doc 4) ───────────────────────────────────────────

export const builder_companies = pgTable("builder_companies", {
  id:               integer("id").primaryKey().generatedByDefaultAsIdentity(),
  nameEn:           text("name_en").notNull(),
  nameAr:           text("name_ar"),
  crNumber:         text("cr_number"),
  legalForm:        text("legal_form"),
  city:             text("city"),
  industry:         text("industry"),
  phone:            text("phone"),
  email:            text("email"),
  website:          text("website"),
  address:          text("address"),
  foundingYear:     integer("founding_year"),
  employeeCount:    integer("employee_count"),
  revenue:          text("revenue"),
  ownerName:        text("owner_name"),
  ownerNameAr:      text("owner_name_ar"),
  ownerTitle:       text("owner_title"),
  keyExecutives:    text("key_executives"),
  shareholders:     text("shareholders"),
  description:      text("description"),
  marketPositioning: text("market_positioning"),
  sourceId:         text("source_id"),
  sourceUrl:        text("source_url"),
  enrichmentStatus: text("enrichment_status").default("pending"),
  enrichmentScore:  integer("enrichment_score").default(0),
  isValidated:      boolean("is_validated").default(false),
  isDuplicate:      boolean("is_duplicate").default(false),
  crmContactId:     text("crm_contact_id"),
  crmCompanyId:     text("crm_company_id"),
  rawData:          jsonb("raw_data"),
  createdAt:        timestamp("created_at").defaultNow(),
  updatedAt:        timestamp("updated_at").defaultNow(),
}, (t) => ({
  crIdx:     index("builder_companies_cr_idx").on(t.crNumber),
  nameIdx:   index("builder_companies_name_idx").on(t.nameEn),
  sourceIdx: index("builder_companies_source_idx").on(t.sourceId),
  statusIdx: index("builder_companies_status_idx").on(t.enrichmentStatus),
  dupIdx:    index("builder_companies_dup_idx").on(t.isDuplicate),
}));

export const builder_jobs = pgTable("builder_jobs", {
  id:                 integer("id").primaryKey().generatedByDefaultAsIdentity(),
  jobId:              text("job_id").unique().notNull(),
  type:               text("type").default("builder_harvest"),
  status:             text("status").default("pending"),
  sourceIds:          jsonb("source_ids").default([]),
  sourcesTotal:       integer("sources_total").default(0),
  companiesHarvested: integer("companies_harvested").default(0),
  progress:           integer("progress").default(0),
  error:              text("error"),
  startedAt:          timestamp("started_at"),
  completedAt:        timestamp("completed_at"),
  createdAt:          timestamp("created_at").defaultNow(),
});

export const builder_custom_sources = pgTable("builder_custom_sources", {
  id:                 integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name:               text("name").notNull(),
  nameAr:             text("name_ar"),
  url:                text("url").notNull(),
  category:           text("category").notNull(),
  description:        text("description"),
  estimatedCompanies: integer("estimated_companies").default(0),
  createdAt:          timestamp("created_at").defaultNow(),
});

export type BuilderCompany      = typeof builder_companies.$inferSelect;
export type BuilderJob          = typeof builder_jobs.$inferSelect;
export type BuilderCustomSource = typeof builder_custom_sources.$inferSelect;

// ── Prospecting / Website Intel (Doc 3 §6) ────────────────────────────────

export const prospecting_jobs = pgTable("prospecting_jobs", {
  id:                   integer("id").primaryKey().generatedByDefaultAsIdentity(),
  targetUrl:            text("target_url").notNull(),
  status:               text("status").default("scanning"),
  settings:             jsonb("settings"),
  scanSummary:          jsonb("scan_summary"),
  scanResult:           jsonb("scan_result"),
  pagesScanned:         integer("pages_scanned").default(0),
  totalCompaniesFound:  integer("total_companies_found").default(0),
  totalEnriched:        integer("total_enriched").default(0),
  error:                text("error"),
  completedAt:          timestamp("completed_at"),
  updatedAt:            timestamp("updated_at").defaultNow(),
  createdAt:            timestamp("created_at").defaultNow(),
}, (t) => ({
  statusIdx:  index("prospecting_jobs_status_idx").on(t.status),
  createdIdx: index("prospecting_jobs_created_idx").on(t.createdAt),
}));

export const prospecting_results = pgTable("prospecting_results", {
  id:               integer("id").primaryKey().generatedByDefaultAsIdentity(),
  jobId:            integer("job_id").notNull().references(() => prospecting_jobs.id, { onDelete: "cascade" }),
  companyData:      jsonb("company_data"),
  enrichmentStatus: text("enrichment_status").default("pending"),
  sourceUrl:        text("source_url"),
  pushedToCrm:      boolean("pushed_to_crm").default(false),
  crmContactId:     text("crm_contact_id"),
  crmCompanyId:     text("crm_company_id"),
  createdAt:        timestamp("created_at").defaultNow(),
}, (t) => ({
  jobIdx: index("prospecting_results_job_idx").on(t.jobId),
}));

export const export_history = pgTable("export_history", {
  id:          integer("id").primaryKey().generatedByDefaultAsIdentity(),
  jobId:       integer("job_id"),
  format:      text("format"),
  filename:    text("filename"),
  recordCount: integer("record_count").default(0),
  fileSize:    integer("file_size").default(0),
  createdAt:   timestamp("created_at").defaultNow(),
});

export type ProspectingJob    = typeof prospecting_jobs.$inferSelect;
export type ProspectingResult = typeof prospecting_results.$inferSelect;
export type ExportHistory     = typeof export_history.$inferSelect;

// ══════════════════════════════════════════════════════════════════════════════
// §11 — Enrichment Engine Tables (Harvest Sources · Lead Genome · Lead Factory)
// ══════════════════════════════════════════════════════════════════════════════

// ── §11A — Harvest source registry ───────────────────────────────────────────
export const harvest_sources = pgTable("harvest_sources", {
  id:                 integer("id").primaryKey().generatedByDefaultAsIdentity(),
  label:              text("label").notNull(),
  url:                text("url"),
  type:               text("type").notNull().default("web"),
  category:           text("category").notNull().default("custom"),
  language:           text("language").notNull().default("both"),
  countries:          jsonb("countries").$type<string[]>().default([]),
  industries:         jsonb("industries").$type<string[]>().default([]),
  credibility:        text("credibility").notNull().default("secondary"),
  trustWeight:        integer("trust_weight").notNull().default(65),
  enabled:            boolean("enabled").notNull().default(true),
  visibility:         text("visibility").notNull().default("system"),
  requiredForEngines: jsonb("required_for_engines").$type<string[]>().default([]),
  lastSynced:         timestamp("last_synced"),
  status:             text("status").notNull().default("ok"),
  createdAt:          timestamp("created_at").defaultNow(),
});

export const source_enforcement = pgTable("source_enforcement", {
  id:           integer("id").primaryKey().generatedByDefaultAsIdentity(),
  engineName:   text("engine_name").notNull(),
  requiredIds:  jsonb("required_ids").$type<number[]>().default([]),
  excludedIds:  jsonb("excluded_ids").$type<number[]>().default([]),
  updatedAt:    timestamp("updated_at").defaultNow(),
});

export type HarvestSource     = typeof harvest_sources.$inferSelect;
export type SourceEnforcement = typeof source_enforcement.$inferSelect;

// ── §11B — Lead Genome bucket (lightweight enrichment lead) ───────────────────
export const enrich_leads = pgTable("enrich_leads", {
  id:           integer("id").primaryKey().generatedByDefaultAsIdentity(),
  companyId:    integer("company_id"),
  firstName:    text("first_name"),
  lastName:     text("last_name"),
  firstNameAr:  text("first_name_ar"),
  lastNameAr:   text("last_name_ar"),
  title:        text("title"),
  titleAr:      text("title_ar"),
  email:        text("email"),
  phone:        text("phone"),
  linkedinUrl:  text("linkedin_url"),
  twitterUrl:   text("twitter_url"),
  department:   text("department"),
  seniority:    text("seniority"),
  notes:        text("notes"),
  status:       text("status").notNull().default("new"),
  createdAt:    timestamp("created_at").defaultNow(),
  updatedAt:    timestamp("updated_at").defaultNow(),
});

export type EnrichLead = typeof enrich_leads.$inferSelect;

// ── §11C — Lead Factory ───────────────────────────────────────────────────────
export const lead_factory_jobs = pgTable("lead_factory_jobs", {
  id:             integer("id").primaryKey().generatedByDefaultAsIdentity(),
  status:         text("status").notNull().default("pending"),
  inputMode:      text("input_mode").notNull().default("segment"),
  brief:          jsonb("brief"),
  targetCount:    integer("target_count").notNull().default(50),
  agentProgress:  jsonb("agent_progress"),
  totalDiscovered:integer("total_discovered").notNull().default(0),
  totalEnriched:  integer("total_enriched").notNull().default(0),
  totalValidated: integer("total_validated").notNull().default(0),
  totalPublished: integer("total_published").notNull().default(0),
  totalRejected:  integer("total_rejected").notNull().default(0),
  errorMessage:   text("error_message"),
  createdAt:      timestamp("created_at").defaultNow(),
  completedAt:    timestamp("completed_at"),
});

export const lead_factory_results = pgTable("lead_factory_results", {
  id:                  integer("id").primaryKey().generatedByDefaultAsIdentity(),
  jobId:               integer("job_id").notNull().references(() => lead_factory_jobs.id, { onDelete: "cascade" }),
  companyName:         text("company_name"),
  companyNameAr:       text("company_name_ar"),
  domain:              text("domain"),
  phone:               text("phone"),
  email:               text("email"),
  city:                text("city"),
  region:              text("region"),
  industry:            text("industry"),
  subIndustry:         text("sub_industry"),
  employeeCount:       text("employee_count"),
  revenue:             text("revenue"),
  crNumber:            text("cr_number"),
  entityType:          text("entity_type"),
  foundingYear:        text("founding_year"),
  ownerName:           text("owner_name"),
  keyExecutives:       jsonb("key_executives"),
  description:         text("description"),
  logoUrl:             text("logo_url"),
  linkedinUrl:         text("linkedin_url"),
  sourceUsed:          text("source_used"),
  rawData:             jsonb("raw_data"),
  enrichedData:        jsonb("enriched_data"),
  signalData:          jsonb("signal_data"),
  icpScore:            integer("icp_score"),
  priorityTier:        text("priority_tier"),
  buyingScore:         integer("buying_score"),
  riskScore:           integer("risk_score"),
  qualityScore:        real("quality_score"),
  validationStatus:    text("validation_status").notNull().default("pending"),
  validationReasons:   jsonb("validation_reasons"),
  isDuplicate:         boolean("is_duplicate").notNull().default(false),
  duplicateOf:         text("duplicate_of"),
  outreachEmail:       text("outreach_email"),
  outreachLinkedin:    text("outreach_linkedin"),
  outreachWhatsapp:    text("outreach_whatsapp"),
  openingAngle:        text("opening_angle"),
  culturalNote:        text("cultural_note"),
  conversationHook:    text("conversation_hook"),
  createdAt:           timestamp("created_at").defaultNow(),
}, (t) => ({
  jobIdx: index("lead_factory_results_job_idx").on(t.jobId),
}));

export const lead_fingerprints = pgTable("lead_fingerprints", {
  id:             integer("id").primaryKey().generatedByDefaultAsIdentity(),
  normalizedName: text("normalized_name"),
  domain:         text("domain"),
  email:          text("email"),
  phone:          text("phone"),
  linkedinSlug:   text("linkedin_slug"),
  fingerprint:    text("fingerprint").notNull(),
  sourceTable:    text("source_table"),
  sourceId:       integer("source_id"),
  createdAt:      timestamp("created_at").defaultNow(),
}, (t) => ({
  fpIdx:     index("lead_fingerprints_fp_idx").on(t.fingerprint),
  emailIdx:  index("lead_fingerprints_email_idx").on(t.email),
  domainIdx: index("lead_fingerprints_domain_idx").on(t.domain),
}));

export type LeadFactoryJob    = typeof lead_factory_jobs.$inferSelect;
export type LeadFactoryResult = typeof lead_factory_results.$inferSelect;
export type LeadFingerprint   = typeof lead_fingerprints.$inferSelect;
