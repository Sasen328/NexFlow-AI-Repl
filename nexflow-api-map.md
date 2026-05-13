# NexFlow — Full API & Service Cost Map

> **Stack**: React + Vite (frontend) · Hono / Express (API server) · PostgreSQL · Clerk · OpenRouter (LLM proxy)
> **Market**: GCC B2B — Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman
> **Last updated**: May 2026

---

## Summary totals by category

| # | Category | Min / mo | Typical / mo | Notes |
|---|---|---|---|---|
| 1 | AI & LLM | $0 | $80–400 | Scales with usage; free tiers cover dev |
| 2 | Data Enrichment — Free Layer | $0 | $0 | Public APIs + scrapers |
| 3 | Data Enrichment — Paid Layer | $0 | $200–800 | Pay-per-enrichment; only on key sources |
| 4 | Auth & Identity | $0 | $0–25 | Clerk free to 10K MAU |
| 5 | Communication — Email | $0 | $20–100 | Resend or SendGrid |
| 6 | Communication — WhatsApp | $0 | $50–500 | Meta WABA or Twilio; per-message |
| 7 | Communication — SMS | $0 | $20–100 | Twilio/AWS SNS |
| 8 | Telephony & Call Intelligence | $0 | $100–600 | Twilio Voice + transcription |
| 9 | Compliance & Sanctions | $0 | $0–200 | Free public APIs; paid for World-Check |
| 10 | Infrastructure | $20 | $50–300 | DB + hosting |
| 11 | Scraping Engine | $0 | $0–50 | Playwright / Crawl4AI (compute only) |
| 12 | Storage & Media | $0 | $5–30 | Object storage for recordings / uploads |
| 13 | Maps & Geolocation | $0 | $0–50 | Google Maps MCP (GCC office lookup) |
| 14 | Analytics & BI | $0 | $0–200 | Internal dashboards; optional Metabase |
| 15 | Saudi / GCC Gov Registries | $0 | $0–100 | Mostly free; Wathiq requires registration |
| — | **TOTAL ESTIMATE** | **$20** | **$525–2,655** | Production at modest scale |

---

## 1 — AI & LLM

| Service | Purpose in NexFlow | Model(s) used | Cost tier | Priority |
|---|---|---|---|---|
| **OpenRouter** (aggregator) | Single proxy endpoint for all LLM calls. Routes to Claude, Gemini, Perplexity, DeepSeek, Kimi with automatic fallback | All below | Free account + pay-per-token | P0 — critical |
| **Perplexity Sonar** (via OpenRouter) | AI Search connector (priority 5): resolves fuzzy/Arabic company names to official domains; news seeder web search | `perplexity/sonar` | $1/1M tokens (~$0.001/call) | P0 |
| **Gemini 2.5 Flash** (via OpenRouter or direct) | AI Extractor (priority 12): HTML → structured fields; Vision OCR for business card scanner; TTS primary voice engine | `google/gemini-2.5-flash` | $0.15/1M in · $0.60/1M out (~$0.0005/call) | P0 |
| **DeepSeek-V3** (via OpenRouter free tier) | Synthesis waterfall step 1 in AI Composer; news seeder synthesis; cheapest LLM option | `deepseek/deepseek-chat-v3-0324:free` | Free within daily limits · $0.014/1M tokens paid | P0 |
| **Claude Sonnet 4** (via OpenRouter) | AI Composer final pass (synthesis); business card validation agent; post-call AI summaries; coaching; marketing copy | `anthropic/claude-sonnet-4.6` | $3/1M in · $15/1M out (~$0.003/enrichment call) | P0 |
| **GPT-4o-mini** (via OpenRouter) | Lead finder second-pass synthesis; JSON fallback in enrichment; TTS fallback via OpenAI direct | `openai/gpt-4o-mini` | $0.15/1M in · $0.60/1M out | P1 |
| **Kimi K2** (via OpenRouter) | Long-context research agent (128k window); deep autonomous enrichment for complex company intel | `moonshotai/kimi-k2` | ~$0.15/1M in | P2 |
| **Whisper** (via OpenAI integration) | Call transcription for Power Dialer and Calls & Transcripts tab | `whisper-1` | $0.006/min audio | P1 |
| **OpenAI TTS** (direct — fallback) | TTS fallback when Gemini TTS fails; Power Dialer AI Voice Agent voice output | `gpt-4o-mini-tts` | $0.015/1M chars | P2 |

**Estimated LLM cost at 500 enrichments/mo + 200 calls transcribed**: ~$80–180/mo

---

## 2 — Data Enrichment — Free / No-Key Layer

| Priority | Source | Purpose | Cost | Key needed |
|---|---|---|---|---|
| 8 | **Compliance Screening** (custom connector) | OFAC SDN · UN Consolidated · EU FSF sanctions check + Maroof · CMA · SAMA · ZATCA · Najiz Saudi screening | Free | No |
| 10 | **Public Web Scraper** (Cheerio + Playwright) | Company About/Contact/Careers pages, press releases, RSS; fills domain, description, logo, LinkedIn | Free (compute) | No |
| 15 | **Python AI Scraper (Crawl4AI)** | JS-heavy pages; extracts tech stack, hiring, description via AI-powered crawl | Free (sidecar service) | No |
| 16 | **News Seeder** (Perplexity → DeepSeek) | Live web search for funding/M&A/hiring signals → `news_recent` + `intent_signals` | ~$0.002/call | No |
| 18 | **GLEIF** | LEI lookup — authoritative for Saudi Aramco, STC, QNB, any GCC corp with international financing | Free | No |
| 28 | **OpenCorporates** | 200M+ companies across 130+ jurisdictions; KSA, UAE, Qatar, Bahrain, Kuwait, Oman included | Free (50/day) · optional key | Optional |
| 32 | **Wikidata** | Open knowledge graph — founded year, headcount, HQ, Arabic labels for GCC companies | Free | No |
| 34 | **Clearbit Logo CDN** | Company logo by domain — clean PNG/SVG for CRM UI | Free | No |
| 36 | **GitHub Org** | Hiring signals, open issues, Twitter handle — best for tech/fintech/AI GCC startups | Free · optional PAT | Optional |
| 38 | **Wappalyzer** | Tech stack fingerprint — detects GCC payment rails (Tap, PayTabs, HyperPay, Mada) | Free (local run) | No |
| 60 | **Email Permutator** | Generates statistically likely email patterns from name + domain; marks as unverified | Free | No |

**Free layer monthly cost**: $0

---

## 3 — Data Enrichment — Paid APIs

### 3A — GCC-Native Paid Sources

| Priority | Source | Purpose | Cost tier | Key label |
|---|---|---|---|---|
| 22 | **MAGNiTT** | GCC + MENA startup funding rounds, amounts, investors — covers deals Crunchbase misses | Subscription (contact sales) | `MAGNITT_API_KEY` |
| 23 | **Dhow** | "The Middle East's Apollo" — GCC B2B contacts, Arabic names, Gulf phones, WhatsApp IDs, CR-linked profiles | Subscription (SAR pricing) | `DHOW_API_KEY` |
| 24 | **Wathiq (KSA MoC)** | Authoritative KSA CR lookup: ownership, legal status, ISIC activity, city/region | Free registration · API access fee | `WATHIQ_APP_ID` |
| 26 | **Tadawul / DFM / ADX** | Saudi Exchange + Dubai + Abu Dhabi public disclosures; top-6 GCC ticker hard-coded fallback | Free | No |
| 27 | **Decypha** | All 6 GCC exchanges: revenue, EBITDA, board, ownership, analyst reports, ESG | Subscription | `DECYPHA_API_KEY` |
| 29 | **Argaam** | Saudi Tadawul filings + Arabic corporate news (earnings, board changes, dividends, M&A, bankruptcy) | Freemium / Pro subscription | `ARGAAM_API_KEY` |
| 31 | **Wamda** | MENA startup ecosystem: deals, investor profiles, founder backgrounds; complements MAGNiTT | Contact sales | `WAMDA_API_KEY` |

### 3B — Global Paid Sources

| Priority | Source | Purpose | Cost tier | Key label |
|---|---|---|---|---|
| 20 | **Hunter.io** | Email finder + verifier; domain → email patterns | $0.005/lookup · $34+/mo | `HUNTER_API_KEY` |
| 25 | **Apollo.io** | Best Western coverage of GCC enterprise contacts — email, phone, title, company | $0.04/lookup · $49+/mo | `APOLLO_API_KEY` |
| 30 | **Lusha** | Email + phone; decent GCC executive coverage | $0.08/lookup · $49+/mo | `LUSHA_API_KEY` |
| 40 | **Crunchbase** | Company funding rounds, investors (funded startups) | Free tier (limited) · $299+/mo | `CRUNCHBASE_USER_KEY` |
| 45 | **RocketReach** | Email + phone enrichment; low GCC coverage but useful for cross-border | $0.05/lookup | `ROCKETREACH_API_KEY` |
| 48 | **FullContact** | Person identity graph from email/phone; resolves phone → full profile; `phone_confidence` scoring | $0.05–0.15/lookup | `FULLCONTACT_API_KEY` |
| 50 | **People Data Labs (PDL)** | B2B contact + company data; medium GCC coverage | $0.10/lookup | `PDL_API_KEY` |
| 52 | **D&B Direct+** | Company firmographics; regional registrar partnerships → KSA + UAE CR numbers | Enterprise | `DUNS_API_KEY` |
| 55 | **Breeze Intelligence** | HubSpot Breeze (ex-Clearbit) company enrichment by domain | $0.005/lookup | `BREEZE_API_KEY` |
| 57 | **Bombora Intent** | B2B intent surge scores — which companies are researching your category | Enterprise | `BOMBORA_API_KEY` |
| 65 | **Clay** | Multi-source waterfall fallback; 50+ sources behind one credit | Credits-based (~$0.05/enriched row) | `CLAY_API_KEY` |

### 3C — SaaS Stubs (registered, disabled by default — activate when ready)

| Source | Purpose | Cost | Key label |
|---|---|---|---|
| ZoomInfo | Company + contact; large enterprise DB | $15K+/yr | `ZOOMINFO_API_KEY` |
| Cognism | GDPR-compliant contact; strong EMEA | Subscription | `COGNISM_API_KEY` |
| Proxycurl | ToS-safe LinkedIn profile data | ~$0.01/lookup | `PROXYCURL_API_KEY` |
| Seamless.AI | AI contact finder | Free · $147+/mo | `SEAMLESS_API_KEY` |
| Kaspr | EU LinkedIn-derived contacts | €49+/mo | `KASPR_API_KEY` |
| SignalHire | Email + phone + LinkedIn | $49+/mo | `SIGNALHIRE_API_KEY` |
| Datanyze | Tech stack by domain | $29+/mo (legacy) | `DATANYZE_API_KEY` |
| Lead411 | B2B contact + intent | $99+/mo | `LEAD411_API_KEY` |
| Prospeo | Email finder + verifier | Pay-per-use · $39+/mo | `PROSPEO_API_KEY` |
| SalesIntel | Human-verified US-strong data | Subscription | `SALESINTEL_API_KEY` |
| Swordfish | Mobile phone specialist | $99+/mo | `SWORDFISH_API_KEY` |

**Paid enrichment cost (500 enrichments/mo, mixed sources)**: ~$200–800/mo

---

## 4 — Authentication & Identity

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Clerk** | User auth (sign-in/sign-up), session management, persona switching, JWT tokens, OAuth providers | Free to 10K MAU · $25+/mo thereafter | P0 — critical |
| **Clerk Organizations** | Multi-tenant workspace isolation (future: per-company NexFlow instances) | Included in Clerk plan | P2 |

---

## 5 — Communication — Email

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Resend** | Transactional email: post-call AI summaries, sequence emails, follow-up automations, web form notifications | Free 3K emails/mo · $20/mo for 50K | P0 |
| **SendGrid** (alternative) | High-volume campaign sending if Resend throughput insufficient | $20+/mo | P2 |

---

## 6 — Communication — WhatsApp

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Meta WhatsApp Business API (WABA)** | Native WhatsApp sending: post-call AI drafts, sequence messages, campaign publishing, hot-lead CTAs | Free (approved templates) · $0.004–0.09/conversation by country | P0 |
| **Twilio WhatsApp** | WABA reseller — faster onboarding vs. direct Meta; same per-message pricing + Twilio margin | $0.005–0.10/conversation | P1 |
| **360dialog** (alternative BSP) | GCC-optimized WABA Business Solution Provider; preferred for KSA/UAE enterprise accounts | Contact sales | P2 |

---

## 7 — Communication — SMS

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Twilio SMS** | Campaign SMS publishing, sequence steps, OTP fallback | $0.0079/msg (US) · $0.02–0.05/msg (GCC) | P1 |
| **AWS SNS** | Bulk SMS at lower cost for high volumes; less GCC carrier coverage than Twilio | $0.0046/msg | P2 |
| **Unifonic** | Saudi-native CPaaS — best KSA SMS delivery rates and DLT compliance | Contact sales (SAR pricing) | P1 for KSA |

---

## 8 — Telephony & Call Intelligence

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Twilio Voice** | Power Dialer PSTN calls: outbound dialing, call recording, webhooks for live transcript streaming | $0.014/min (outbound US) · $0.05–0.08/min (GCC) | P0 |
| **Twilio Programmable Voice** | Auto-dial mode, AI Agent mode inbound/outbound routing, voicemail detection | Included in Twilio Voice | P0 |
| **OpenAI Whisper** (via integration) | Real-time call transcription → live coaching panel, objection detection, post-call summaries | $0.006/min audio | P0 |
| **Twilio Media Streams** | Live audio stream from Twilio call → WebSocket → Whisper for real-time transcript | Included in Twilio Voice | P0 |
| **ElevenLabs** (optional) | Higher-quality Arabic TTS for AI Voice Agent — more natural Gulf-Arabic accent than Gemini | $5+/mo · $0.30/1K chars | P2 |
| **AssemblyAI** (alternative transcription) | Higher accuracy transcription with Arabic support + speaker diarization | $0.012/min · $0.006/min Nano | P2 |
| **LiveKit** (optional) | WebRTC SFU for browser-based softphone in Power Dialer (replaces Twilio Client SDK) | $0.05/GB · Free self-host | P2 |

**Telephony cost (1,000 calls/mo, avg 5 min)**: ~$250–500/mo

---

## 9 — Compliance & Sanctions Screening

| Layer | Service | Purpose | Cost | Key needed |
|---|---|---|---|---|
| **L1 — Saudi Native** | **Maroof.sa** | Ministry of Commerce commercial complaints registry | Free | No |
| **L1 — Saudi Native** | **CMA** (cma.org.sa) | Capital Market Authority enforcement actions, fines | Free | No |
| **L2 — International** | **OFAC SDN** (ofac.treasury.gov) | US Treasury Specially Designated Nationals list — REST API | Free | No |
| **L2 — International** | **UN Security Council** (scsanctions.un.org) | UN consolidated sanctions list — XML bulk | Free | No |
| **L2 — International** | **EU FSF** (webgate.ec.europa.eu) | EU Financial Sanctions File — XML bulk | Free | No |
| **L3 — Saudi Banking/Courts** | **SAMA** (sama.gov.sa) | Central Bank warnings and unlicensed entity flags | Free | No |
| **L3 — Saudi Banking/Courts** | **ZATCA** (zatca.gov.sa) | Tax Authority violations and penalties | Free | No |
| **L3 — Saudi Banking/Courts** | **Najiz** (najiz.sa) | Ministry of Justice court judgments portal | Free (full API needs credentials) | Optional |
| **L4 — Paid / PEP** | **Refinitiv World-Check** | 400+ global watchlists: PEP, sanctions, adverse media | Enterprise subscription | Yes |
| **L4 — Paid / PEP** | **ComplyAdvantage** | AI-driven AML: adverse media, PEP, real-time monitoring | $500+/mo | Yes |
| **L4 — Paid / PEP** | **Dow Jones Risk** | Structured adverse media + PEP screening (used by major Saudi banks) | Subscription | Yes |

**Compliance cost**: $0 for free layers · $500–2,000/mo for paid PEP/AML

---

## 10 — Infrastructure & Database

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **PostgreSQL** (Replit built-in / Neon) | Primary database: contacts, deals, activities, enrichment results, call logs, campaigns | Free (Replit) · $20+/mo (Neon prod) | P0 |
| **Neon** (serverless PostgreSQL) | Production DB with branching for migrations; autoscales | $20+/mo · $0.10/compute-hour | P0 for prod |
| **Drizzle ORM** | Type-safe schema + migrations over PostgreSQL | Open source — free | P0 |
| **Replit** (hosting — dev) | Development environment + preview deployment | Free / $20+/mo | P0 |
| **Vercel** (recommended for prod) | Frontend hosting for Next.js 15 / React Vite; edge CDN; preview deploys | Free hobby · $20+/mo Pro | P0 for prod |
| **Railway / Render** (alternative) | Hono API server hosting; auto-deploy from git | $5+/mo · $20+/mo Pro | P1 |
| **Redis** (Upstash) | Rate limiting, session cache, enrichment job queue, real-time pub/sub for Power Dialer | Free tier · $10+/mo | P1 |
| **BullMQ** (job queue) | Background enrichment waterfall jobs, email sequence scheduling, campaign publishing queue | Open source; needs Redis | P1 |
| **Cloudflare** (CDN + DNS) | DNS, WAF, DDoS protection, caching for API routes | Free · $20+/mo Pro | P1 |

---

## 11 — Scraping Engine

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Cheerio** | HTML scraping for company About/Contact/Careers pages | Open source — free | P0 |
| **Playwright** | Headless browser for JS-heavy GCC sites (Aamaly, Bluepages KSA, SaudiCEOs, Najiz) | Open source — free (compute only) | P0 |
| **Crawl4AI** (Python sidecar) | AI-powered structured extraction — enrichment-scraper artifact | Open source — free | P1 |
| **BeautifulSoup4** | HTML parsing in Python sidecar | Open source — free | P1 |
| **Bright Data** (optional proxies) | Residential proxy rotation for sites that block data-center IPs (Maroof, LinkedIn) | $10+/mo · $8/GB | P2 |
| **Oxylabs** (alternative) | GCC residential proxies for Wathiq, Najiz scraping | $99+/mo | P2 |
| **ScrapingBee** (alternative) | Managed scraping with JS rendering; simpler than self-hosting Playwright | $49+/mo · $0.001/call | P2 |

---

## 12 — File & Media Storage

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Replit Object Storage** (App Storage) | Call recordings, business card images, CSV lead uploads, campaign assets | Free 1GB · $0.03/GB/mo | P0 |
| **AWS S3** (alternative) | Production object storage with lifecycle policies for call recording compliance | $0.023/GB · $0.005/10K requests | P1 |
| **Cloudflare R2** (alternative) | S3-compatible; no egress fees; better for GCC latency | $0.015/GB · Free egress | P1 |

---

## 13 — Maps & Geolocation

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Google Maps Platform** (MCP) | GCC office location lookup, company address validation, territory mapping for sales reps | Free $200/mo credit · then $0.005/lookup | P1 |
| **Google Geocoding API** | Convert company addresses (Arabic + English) to lat/long for territory assignment | $0.005/request (within free credit) | P1 |
| **Mapbox** (alternative) | Offline-capable territory maps; better Arabic RTL label support than Google Maps | Free 50K loads/mo · $5+/mo | P2 |

---

## 14 — Analytics & Reporting

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Internal dashboards** (Recharts + React) | CRM KPI tiles, campaign performance, call analytics — all built-in | $0 | P0 |
| **PostHog** | Product analytics: feature usage, funnel analysis, session replay for sales coaching | Free to 1M events/mo · $450+/mo | P1 |
| **Metabase** (optional) | SQL-based BI dashboards for management reporting beyond the built-in views | Open source self-host ($0) · Cloud $500+/mo | P2 |
| **Mixpanel** (optional) | Advanced user-level event tracking for AI feature adoption | Free to 20M events · $28+/mo | P2 |

---

## 15 — Saudi & GCC Government Registries

| Source | URL | What it provides | Cost | Access |
|---|---|---|---|---|
| **Wathiq (KSA MoC)** | wathiq.business.sa | Official CR lookup: ownership, legal name AR/EN, ISIC activity, city | Free registration · API fee | Govt portal |
| **MoCI** | mci.gov.sa | New company registrations (daily feed), license renewals, foreign investment approvals | Free | Research |
| **MISA** | misa.gov.sa | Foreign investment licenses, sector approvals | Free | Research |
| **Etimad** | etimad.sa | Government contracts, tender awards, supplier lists from all Saudi ministries | Free | Research |
| **GASTAT Open Data** | data.gov.sa | 1,000+ Saudi datasets: company registrations, economic statistics, sector data | Free | REST API |
| **Tadawul / CMA** | saudiexchange.sa / cma.org.sa | Listed company disclosures, board changes, M&A (mandatory filings) | Free | Research |
| **Bluepages KSA** | api-old.bluepages.com.sa | Saudi business directory: CR data, addresses, ISIC codes — unofficial API bypass | Free | Bypass |
| **Aamaly (أعمالى)** | aamaly.com | Arabic-name-first Saudi business directory; CR verification | Free | Playwright |
| **SaudiCEOs / SaudiBODs** | saudiceos.com / saudibods.com | Saudi executive + board member directories by company and sector | Free | Playwright |
| **SCOPA (Saudi Chambers)** | scopa.org.sa | Chamber of Commerce member directories; membership = wealth/credibility signal | Free | Research |
| **RCJY** | rcjy.gov.sa | Jubail & Yanbu industrial complex: project lists, contractor registries | Free | Research |

---

## 16 — Business Media & News (Monitoring)

| Source | Language | What it provides | Cost | Recommended use |
|---|---|---|---|---|
| **Argaam** | Arabic | Real-time Tadawul disclosures, earnings, exec changes, M&A | Freemium | Daily RSS monitor |
| **Arab News** | English | Saudi M&A, project awards, Vision 2030 contracts | Free | Daily RSS |
| **Zawya (LSEG)** | EN/AR | MENA M&A, project finance, PE/VC deals | Subscription | Weekly research |
| **Mubasher** | AR/EN | Corporate actions, deal announcements, board changes | Freemium | Daily monitor |
| **CNBC Arabia** | Arabic | CEO interviews, deal announcements, project launches | Free | Video signals |
| **Al Arabiya Aswaq** | Arabic | Saudi market news, exec profiles, government project news | Free | Daily monitor |
| **Forbes Middle East** | English | Saudi Rich List, billionaire rankings, top company lists | Free | HNW signals |
| **Wamda** | English | MENA startup deals, exits, founder profiles | Free | SME signals |
| **Al Eqtisadiah** | Arabic | Business deals, exec interviews, regulatory changes | Free | Long-form analysis |

---

## 17 — AI Intelligence Engines (Internal)

| Engine | API services used | Typical runtime | Cost/run |
|---|---|---|---|
| **Masaar** (KSA CR lookup) | Playwright (Wathiq scrape) + Gemini extraction | ~10s | ~$0.001 |
| **Person Intel (ProsEngine)** | Perplexity ×9 · Gemini ×5 · Claude ×1 · GPT-4o-mini ×1 + LinkedIn/website crawls | 76–90s | ~$0.05–0.10 |
| **Company Intel** | Perplexity ×6 · Gemini ×4 · Claude ×1 + web crawls | ~45s | ~$0.03–0.06 |
| **Lead Finder** | Perplexity ×5 · Gemini ×3 · GPT-4o-mini ×2 + Cheerio/Playwright crawls | ~30s | ~$0.02–0.05 |
| **Business Card Scanner** | Gemini Vision (OCR) → Claude (validation) → Perplexity (live search) → Cheerio → GPT-4o-mini (scoring) | ~15s | ~$0.015 |

---

## 18 — Marketing & Campaign Tools

| Category | Service | Purpose | Cost tier | Priority |
|---|---|---|---|---|
| **Email sending** | Resend | Sequence emails, campaign delivery | $0–$20+/mo | P0 |
| **WhatsApp** | Meta WABA / Twilio | Campaign WhatsApp messages, post-call follow-ups | Per-message | P0 |
| **Social publishing** (LinkedIn) | LinkedIn Marketing API | Campaign publishing to LinkedIn (OAuth required) | Free API · ad spend separate | P1 |
| **Social publishing** (X/Twitter) | X API v2 | Campaign publishing to X | Free (1,500 tweets/mo) · $100+/mo Basic | P2 |
| **Social publishing** (Instagram/FB) | Meta Graph API | Campaign publishing to Instagram + Facebook | Free API · ad spend separate | P1 |
| **Image generation** | DALL-E 3 / Stability AI | Campaign visual generation in AI Builder | $0.040/image (DALL-E) · $0.01 (Stability) | P1 |
| **URL shortening** | Bitly / Short.io | Campaign link tracking with click analytics | Free · $29+/mo | P2 |
| **Web forms** | Internal (React) + Resend | AI Form Creator + form submission notifications | $0 | P0 |

---

## 19 — Developer & Monitoring Tools

| Service | Purpose | Cost tier | Priority |
|---|---|---|---|
| **Pino** (structured logging) | API server request logs, enrichment waterfall traces | Open source — free | P0 |
| **Sentry** | Error tracking and performance monitoring across API + frontend | Free 5K errors/mo · $26+/mo | P1 |
| **Uptime Robot** | Uptime monitoring for API server and enrichment scraper | Free 50 monitors · $7+/mo | P1 |
| **GitHub Actions** | CI/CD pipeline: typecheck, build, deploy | Free 2K min/mo (public) · $4/mo (private) | P1 |
| **Doppler / Infisical** | Secrets management across environments (dev/prod) | Free · $6+/mo | P1 |

---

## 20 — Recommended Activation Sequence

| Phase | Focus | Estimated cost |
|---|---|---|
| **Phase 1 — MVP** | Clerk + Resend + OpenRouter (AI LLM) + PostgreSQL + Public web scraper + Compliance free layer | $0–20/mo |
| **Phase 2 — Enrichment** | Add Hunter.io + Apollo.io + GLEIF + OpenCorporates + News Seeder | $50–200/mo |
| **Phase 3 — Calling** | Add Twilio Voice + Whisper transcription + WhatsApp WABA | $150–500/mo |
| **Phase 4 — GCC-Native** | Activate Dhow + Decypha + Argaam + Wathiq | $300–1,000/mo |
| **Phase 5 — Scale** | Add Bombora intent + D&B + Clay fallback + PEP/compliance paid tier | $1,000+/mo |

---

*Prices as of May 2026. GCC-specific pricing (WhatsApp, SMS, Voice) varies by carrier and country. All costs in USD unless noted.*
