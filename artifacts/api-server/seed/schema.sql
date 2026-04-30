--
-- PostgreSQL database dump
--


-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: activity_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_status AS ENUM (
    'pending',
    'completed',
    'cancelled'
);


--
-- Name: activity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_type AS ENUM (
    'call',
    'email',
    'whatsapp',
    'meeting',
    'note',
    'task',
    'web_visit',
    'email_open',
    'email_click',
    'form_submit'
);


--
-- Name: automation_trigger; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.automation_trigger AS ENUM (
    'stage_change',
    'activity_completed',
    'signal_received',
    'no_answer',
    'form_submitted',
    'score_threshold',
    'schedule',
    'campaign_open'
);


--
-- Name: call_direction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.call_direction AS ENUM (
    'inbound',
    'outbound'
);


--
-- Name: call_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.call_status AS ENUM (
    'scheduled',
    'in_progress',
    'completed',
    'missed',
    'failed'
);


--
-- Name: campaign_channel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.campaign_channel AS ENUM (
    'email',
    'whatsapp',
    'sms',
    'linkedin',
    'voice'
);


--
-- Name: campaign_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.campaign_status AS ENUM (
    'draft',
    'scheduled',
    'running',
    'paused',
    'completed'
);


--
-- Name: company_size; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.company_size AS ENUM (
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
);


--
-- Name: contact_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contact_status AS ENUM (
    'new',
    'active',
    'qualified',
    'unqualified',
    'customer'
);


--
-- Name: deal_stage; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.deal_stage AS ENUM (
    'lead',
    'qualified',
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost'
);


--
-- Name: insight_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.insight_severity AS ENUM (
    'info',
    'opportunity',
    'warning',
    'critical'
);


--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_type AS ENUM (
    'signal',
    'deal',
    'call',
    'task',
    'system',
    'ai'
);


--
-- Name: property_object; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.property_object AS ENUM (
    'contact',
    'company',
    'deal'
);


--
-- Name: property_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.property_type AS ENUM (
    'text',
    'long_text',
    'number',
    'date',
    'boolean',
    'select',
    'multiselect',
    'url',
    'email',
    'phone'
);


--
-- Name: script_language; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.script_language AS ENUM (
    'en',
    'ar',
    'both'
);


--
-- Name: script_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.script_type AS ENUM (
    'cold_call',
    'follow_up',
    'demo',
    'objection_handling',
    'closing'
);


--
-- Name: signal_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.signal_status AS ENUM (
    'new',
    'viewed',
    'actioned',
    'dismissed'
);


--
-- Name: signal_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.signal_type AS ENUM (
    'funding_round',
    'exec_move',
    'expansion',
    'hiring',
    'product_launch',
    'news',
    'social'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    contact_id uuid,
    deal_id uuid,
    type public.activity_type NOT NULL,
    title text NOT NULL,
    body text,
    status public.activity_status DEFAULT 'pending'::public.activity_status NOT NULL,
    scheduled_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    owner_id uuid,
    metadata jsonb
);


--
-- Name: ai_agent_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_agent_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    agent_id uuid NOT NULL,
    input text,
    output text,
    status text DEFAULT 'completed'::text,
    duration_ms integer,
    ran_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_agents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    description text,
    icon text DEFAULT 'Bot'::text,
    system_prompt text NOT NULL,
    model text DEFAULT 'openai/gpt-4o-mini'::text,
    tools jsonb,
    trigger_type text DEFAULT 'manual'::text,
    schedule_cron text,
    enabled boolean DEFAULT true NOT NULL,
    run_count integer DEFAULT 0,
    last_run_at timestamp without time zone,
    created_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_insights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_insights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    category text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    severity public.insight_severity DEFAULT 'info'::public.insight_severity NOT NULL,
    related_entity_id uuid,
    related_entity_type text,
    metadata jsonb,
    generated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: automation_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    description text,
    trigger public.automation_trigger NOT NULL,
    trigger_config jsonb,
    conditions jsonb,
    actions jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    run_count integer DEFAULT 0,
    last_run_at timestamp without time zone,
    owner_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: automation_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.automation_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rule_id uuid NOT NULL,
    entity_id uuid,
    entity_type text,
    status text NOT NULL,
    result jsonb,
    ran_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: calls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    contact_id uuid,
    direction public.call_direction DEFAULT 'outbound'::public.call_direction,
    status public.call_status DEFAULT 'scheduled'::public.call_status NOT NULL,
    duration_seconds integer,
    recording_url text,
    transcript text,
    sentiment_score double precision,
    call_score double precision,
    coaching_notes text,
    started_at timestamp without time zone,
    ended_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    owner_id uuid,
    outcome text,
    ai_insights jsonb
);


--
-- Name: campaign_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaign_recipients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    status text DEFAULT 'pending'::text,
    sent_at timestamp without time zone,
    opened_at timestamp without time zone,
    clicked_at timestamp without time zone,
    replied_at timestamp without time zone
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    channel public.campaign_channel NOT NULL,
    status public.campaign_status DEFAULT 'draft'::public.campaign_status NOT NULL,
    subject text,
    content text,
    audience_filter jsonb,
    audience_count integer DEFAULT 0,
    sent_count integer DEFAULT 0,
    opened_count integer DEFAULT 0,
    clicked_count integer DEFAULT 0,
    replied_count integer DEFAULT 0,
    converted_count integer DEFAULT 0,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    scheduled_at timestamp without time zone,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    owner_id uuid,
    ai_generated boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    domain text,
    industry text,
    size public.company_size,
    country text,
    revenue integer,
    logo_url text,
    linkedin_url text,
    website text,
    description text,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    city text,
    owner_id uuid,
    intelligence jsonb,
    intelligence_updated_at timestamp without time zone
);


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    title text,
    company_id uuid,
    lead_score double precision DEFAULT 0,
    status public.contact_status DEFAULT 'new'::public.contact_status NOT NULL,
    avatar_url text,
    linkedin_url text,
    notes text,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    owner_id uuid,
    source text,
    source_campaign_id uuid,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    best_call_time text,
    last_engaged_at timestamp without time zone
);


--
-- Name: custom_properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_properties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    object_type public.property_object NOT NULL,
    name text NOT NULL,
    label text NOT NULL,
    type public.property_type NOT NULL,
    description text,
    options jsonb,
    required boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: custom_property_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_property_values (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    value text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dashboard_widgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboard_widgets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dashboard_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    config jsonb NOT NULL,
    "position" integer DEFAULT 0,
    width text DEFAULT 'md'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dashboards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    description text,
    layout jsonb,
    filters jsonb,
    owner_id uuid,
    is_shared boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: deals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    title text NOT NULL,
    contact_id uuid,
    company_id uuid,
    stage public.deal_stage DEFAULT 'lead'::public.deal_stage NOT NULL,
    value integer DEFAULT 0,
    currency text DEFAULT 'USD'::text,
    probability double precision DEFAULT 0,
    expected_close_date timestamp without time zone,
    notes text,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    owner_id uuid,
    stage_changed_at timestamp without time zone DEFAULT now()
);


--
-- Name: engine_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.engine_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    engine text NOT NULL,
    title text NOT NULL,
    input jsonb NOT NULL,
    report jsonb,
    sources_used jsonb DEFAULT '[]'::jsonb NOT NULL,
    duration_ms integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    error text,
    saved boolean DEFAULT false NOT NULL,
    tags text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: enrichment_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrichment_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    waterfall_id uuid,
    source_key text NOT NULL,
    target_kind text,
    target_id text,
    seed jsonb,
    fields_filled jsonb DEFAULT '[]'::jsonb NOT NULL,
    payload jsonb,
    cost_usd double precision DEFAULT 0 NOT NULL,
    duration_ms integer DEFAULT 0 NOT NULL,
    status text NOT NULL,
    error text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: enrichment_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enrichment_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_key text NOT NULL,
    name text NOT NULL,
    kind text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 50 NOT NULL,
    api_key_cipher text,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    last_test_ok boolean,
    last_test_message text,
    last_test_at timestamp without time zone,
    total_calls integer DEFAULT 0 NOT NULL,
    total_fields_filled integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: investor_access_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investor_access_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    action text NOT NULL,
    doc_slug text,
    ip text,
    user_agent text,
    success boolean DEFAULT true NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    title text NOT NULL,
    body text,
    type public.notification_type NOT NULL,
    read boolean DEFAULT false NOT NULL,
    entity_id text,
    entity_type text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: saved_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    object_type public.property_object NOT NULL,
    filters jsonb NOT NULL,
    columns jsonb,
    is_shared boolean DEFAULT false,
    owner_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: scraper_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scraper_cache (
    cache_key text NOT NULL,
    url text NOT NULL,
    mode text NOT NULL,
    payload jsonb,
    fetched_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: scripts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scripts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    type public.script_type NOT NULL,
    content text NOT NULL,
    language public.script_language DEFAULT 'en'::public.script_language,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: segments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.segments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    description text,
    filter_query text,
    contact_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: signals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    contact_id uuid,
    company_id uuid,
    type public.signal_type NOT NULL,
    title text NOT NULL,
    body text,
    score double precision DEFAULT 0,
    status public.signal_status DEFAULT 'new'::public.signal_status NOT NULL,
    source_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: static_list_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.static_list_members (
    list_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    added_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: static_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.static_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    description text,
    object_type public.property_object DEFAULT 'contact'::public.property_object NOT NULL,
    owner_id uuid,
    member_count integer DEFAULT 0,
    color text DEFAULT '#88B8B0'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id text DEFAULT 'default'::text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    avatar_url text,
    role text DEFAULT 'rep'::text,
    timezone text DEFAULT 'UTC'::text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: ai_agent_runs ai_agent_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_agent_runs
    ADD CONSTRAINT ai_agent_runs_pkey PRIMARY KEY (id);


--
-- Name: ai_agents ai_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_agents
    ADD CONSTRAINT ai_agents_pkey PRIMARY KEY (id);


--
-- Name: ai_insights ai_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_insights
    ADD CONSTRAINT ai_insights_pkey PRIMARY KEY (id);


--
-- Name: automation_rules automation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_rules
    ADD CONSTRAINT automation_rules_pkey PRIMARY KEY (id);


--
-- Name: automation_runs automation_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_runs
    ADD CONSTRAINT automation_runs_pkey PRIMARY KEY (id);


--
-- Name: calls calls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);


--
-- Name: campaign_recipients campaign_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_recipients
    ADD CONSTRAINT campaign_recipients_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: custom_properties custom_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_properties
    ADD CONSTRAINT custom_properties_pkey PRIMARY KEY (id);


--
-- Name: custom_property_values custom_property_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_property_values
    ADD CONSTRAINT custom_property_values_pkey PRIMARY KEY (id);


--
-- Name: dashboard_widgets dashboard_widgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_pkey PRIMARY KEY (id);


--
-- Name: dashboards dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT dashboards_pkey PRIMARY KEY (id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: engine_runs engine_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.engine_runs
    ADD CONSTRAINT engine_runs_pkey PRIMARY KEY (id);


--
-- Name: enrichment_runs enrichment_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrichment_runs
    ADD CONSTRAINT enrichment_runs_pkey PRIMARY KEY (id);


--
-- Name: enrichment_sources enrichment_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrichment_sources
    ADD CONSTRAINT enrichment_sources_pkey PRIMARY KEY (id);


--
-- Name: enrichment_sources enrichment_sources_source_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enrichment_sources
    ADD CONSTRAINT enrichment_sources_source_key_unique UNIQUE (source_key);


--
-- Name: investor_access_log investor_access_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investor_access_log
    ADD CONSTRAINT investor_access_log_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: saved_views saved_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_views
    ADD CONSTRAINT saved_views_pkey PRIMARY KEY (id);


--
-- Name: scraper_cache scraper_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scraper_cache
    ADD CONSTRAINT scraper_cache_pkey PRIMARY KEY (cache_key);


--
-- Name: scripts scripts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scripts
    ADD CONSTRAINT scripts_pkey PRIMARY KEY (id);


--
-- Name: segments segments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.segments
    ADD CONSTRAINT segments_pkey PRIMARY KEY (id);


--
-- Name: signals signals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signals
    ADD CONSTRAINT signals_pkey PRIMARY KEY (id);


--
-- Name: static_list_members static_list_members_list_id_entity_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_list_members
    ADD CONSTRAINT static_list_members_list_id_entity_id_pk PRIMARY KEY (list_id, entity_id);


--
-- Name: static_lists static_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_lists
    ADD CONSTRAINT static_lists_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: engine_runs_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX engine_runs_created_idx ON public.engine_runs USING btree (created_at);


--
-- Name: engine_runs_engine_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX engine_runs_engine_idx ON public.engine_runs USING btree (engine);


--
-- Name: engine_runs_saved_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX engine_runs_saved_idx ON public.engine_runs USING btree (saved);


--
-- Name: enrichment_runs_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrichment_runs_created_idx ON public.enrichment_runs USING btree (created_at);


--
-- Name: enrichment_runs_source_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrichment_runs_source_idx ON public.enrichment_runs USING btree (source_key);


--
-- Name: enrichment_runs_waterfall_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX enrichment_runs_waterfall_idx ON public.enrichment_runs USING btree (waterfall_id);


--
-- Name: investor_access_log_ts_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX investor_access_log_ts_idx ON public.investor_access_log USING btree (ts);


--
-- Name: scraper_cache_fetched_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX scraper_cache_fetched_idx ON public.scraper_cache USING btree (fetched_at);


--
-- Name: activities activities_contact_id_contacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_contact_id_contacts_id_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: activities activities_deal_id_deals_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_deal_id_deals_id_fk FOREIGN KEY (deal_id) REFERENCES public.deals(id);


--
-- Name: activities activities_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: ai_agent_runs ai_agent_runs_agent_id_ai_agents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_agent_runs
    ADD CONSTRAINT ai_agent_runs_agent_id_ai_agents_id_fk FOREIGN KEY (agent_id) REFERENCES public.ai_agents(id) ON DELETE CASCADE;


--
-- Name: ai_agents ai_agents_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_agents
    ADD CONSTRAINT ai_agents_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: automation_rules automation_rules_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_rules
    ADD CONSTRAINT automation_rules_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: automation_runs automation_runs_rule_id_automation_rules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.automation_runs
    ADD CONSTRAINT automation_runs_rule_id_automation_rules_id_fk FOREIGN KEY (rule_id) REFERENCES public.automation_rules(id) ON DELETE CASCADE;


--
-- Name: calls calls_contact_id_contacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_contact_id_contacts_id_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: calls calls_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: campaign_recipients campaign_recipients_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_recipients
    ADD CONSTRAINT campaign_recipients_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_recipients campaign_recipients_contact_id_contacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaign_recipients
    ADD CONSTRAINT campaign_recipients_contact_id_contacts_id_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: companies companies_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: contacts contacts_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: contacts contacts_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: custom_property_values custom_property_values_property_id_custom_properties_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_property_values
    ADD CONSTRAINT custom_property_values_property_id_custom_properties_id_fk FOREIGN KEY (property_id) REFERENCES public.custom_properties(id) ON DELETE CASCADE;


--
-- Name: dashboard_widgets dashboard_widgets_dashboard_id_dashboards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_widgets
    ADD CONSTRAINT dashboard_widgets_dashboard_id_dashboards_id_fk FOREIGN KEY (dashboard_id) REFERENCES public.dashboards(id) ON DELETE CASCADE;


--
-- Name: dashboards dashboards_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT dashboards_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: deals deals_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: deals deals_contact_id_contacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_contact_id_contacts_id_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: deals deals_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: saved_views saved_views_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_views
    ADD CONSTRAINT saved_views_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: signals signals_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signals
    ADD CONSTRAINT signals_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: signals signals_contact_id_contacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signals
    ADD CONSTRAINT signals_contact_id_contacts_id_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: static_list_members static_list_members_list_id_static_lists_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_list_members
    ADD CONSTRAINT static_list_members_list_id_static_lists_id_fk FOREIGN KEY (list_id) REFERENCES public.static_lists(id) ON DELETE CASCADE;


--
-- Name: static_lists static_lists_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.static_lists
    ADD CONSTRAINT static_lists_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--


