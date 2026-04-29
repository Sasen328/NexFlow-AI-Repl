# NexFlow CRM

## Overview
NexFlow is an AI-native B2B CRM designed to streamline sales and marketing operations. It leverages artificial intelligence across various features to enhance efficiency, automate tasks, and provide actionable insights. The project aims to deliver a comprehensive CRM solution with capabilities ranging from lead management and marketing automation to advanced analytics and AI-powered sales tools. Its core purpose is to provide businesses with an intelligent platform to manage customer relationships, optimize sales pipelines, and drive growth. Key capabilities include a Workflow Builder, AI Sales Playbooks, Multi-Touch Attribution, AI-powered lead enrichment, and a robust reporting suite.

## User Preferences
I prefer iterative development with clear, concise communication. Before making any major architectural changes or introducing new dependencies, please ask for my approval. Ensure that all new features are well-documented and follow established coding standards. I appreciate detailed explanations for complex implementations.

## Recent Changes (April 29, 2026)

- **Marketing demo video artifact:** new `artifacts/marketing-demo-video/` (preview path `/marketing-demo-video/`) — a 90-second animated walkthrough of NexFlow's marketing module with 8 scenes (funnel-leak hook → AI marketing assistant → AI content/email/image/video generation → audience builder → multi-platform publishing → GCC cultural intelligence → results & re-flow → brand lockup). Uses framer-motion, persistent chameleon mesh background, ambient Web Audio synth pad, and the standard scene-controls bar (jump/lock/progress) when iframed. Marketing-only — no other tabs shown. Total `SCENE_DURATIONS` = 90,000ms.
- **Navigation overhaul:** replaced left `Sidebar` with horizontal `TopBar` (`artifacts/nexflow/src/components/layout/TopBar.tsx`). Eight grouped sections (Home, Sales, Call Center, Marketing, Automation, AI Hub, Insights, Data) each open a click-triggered mega-dropdown with all tools shown as tile cards. ARIA semantics (`aria-haspopup`, `aria-expanded`, `aria-controls`, `role="menu"`); closes on outside click, route change, or Escape. Includes mobile burger overlay and avatar dropdown linking to `/account-settings`.
- **Account Settings hub:** new `/account-settings` and `/account-settings/:section` routes (`artifacts/nexflow/src/pages/account-settings.tsx`) consolidate all admin pages (settings, permissions, custom properties, trust-center, public-trust, capabilities, migration) into a single tabbed page with grouped side nav (ACCOUNT / DATA & FIELDS / SECURITY & TRUST / PLATFORM) and a search filter. Uses lazy-loaded existing pages. Public trust shows a "open in new tab" link instead of being embedded since it's a customer-facing page. Invalid section keys redirect to `/account-settings/settings`.
- **Contact profile Properties card:** new "PROPERTIES" panel on contact-profile overview tab (`artifacts/nexflow/src/pages/contact-profile.tsx`) shows Contact Owner (with avatar + email), Lead Stage (colored pill), Lead Score (number + progress bar), Company link, Title, Tags, Last Engaged date, Created/Updated dates.
- **API contact owner data:** `GET /api/contacts/:id` now `leftJoin`s the `users` table to return `owner_id`, `owner_name`, `owner_email`, plus `company_industry` and `last_engaged_at` (`artifacts/api-server/src/routes/contacts.ts`).
- **Layout:** `App.tsx` switched from `flex` row (sidebar) to `flex-col` (topbar) with `max-w-[1600px]` centered main; removed `collapsed` state.

## System Architecture
NexFlow is built as a pnpm monorepo, separating the frontend and backend.
-   **Frontend**: React + Vite, styled with Tailwind CSS and shadcn/ui. It provides a modern, responsive user interface with a default light mode featuring a pastel mesh gradient and glassmorphism cards. A dark mode toggle is also available.
-   **Backend**: Express 5 serving RESTful APIs. It handles business logic, data interactions, and integrations with AI services.
-   **Database**: PostgreSQL, managed with Drizzle ORM for schema definition and migrations.
-   **Validation**: Zod for data validation, integrated with Drizzle.
-   **API Codegen**: Orval is used to generate typed API hooks from an OpenAPI specification, ensuring type safety between frontend and backend.
-   **Monorepo Structure**:
    -   `artifacts/nexflow/`: React + Vite frontend.
    -   `artifacts/api-server/`: Express API backend.
    -   `lib/db/`: Drizzle schema and migrations.
    -   `lib/api-spec/`: OpenAPI specification and Orval codegen.
    -   `lib/api-zod/`: Generated Zod schemas.
-   **Key Features and Implementations**:
    -   **AI Integration**: Extensive use of AI for features like Sales Playbooks, Lead Enrichment, Smart Lists, Dashboard Generation, Marketing Intelligence, Call Recording Redaction, Activity Capture parsing, and AI Voice Agents. AI calls include graceful degradation and fallbacks.
    -   **CRM Modules**: Comprehensive modules for Contacts, Companies, Deals, Signals, Activities, Calls, Marketing Campaigns, and Sales Scripts.
    -   **Customization**: Support for custom properties, static lists, and saved views.
    -   **Reporting & Analytics**: AI Dashboard Generator, Custom Report Builder, and a dedicated analytics module with AI-powered insights and briefings.
    -   **Mobile Support**: Mobile application developed with Expo, featuring live data consumption and mobile mutations for call logging and deal progression.
    -   **Data Seeding**: An `autoSeed` mechanism ensures the production database is populated with sample data on cold-starts, with an admin endpoint for manual re-seeding.
    -   **Brand System**: "NexFlow Full Blend" with a chameleon color palette, living mesh animations, and glassmorphism design elements.

## External Dependencies
-   **AI Services**: OpenRouter (primary), OpenAI (fallback) for various AI-powered features.
-   **Email Service**: Resend for email sending, including tracking pixels.
-   **Payment Gateways**: Mada, Tap, HyperPay, PayTabs (for Quote-to-Cash feature - noted as needing external API).
-   **Messaging Platforms**: WhatsApp Business (Meta/Twilio/Infobip - for WhatsApp Business feature - noted as needing external API).
-   **Image Generation**: gpt-image-1, DALL-E 3 (for AI hero image generation).