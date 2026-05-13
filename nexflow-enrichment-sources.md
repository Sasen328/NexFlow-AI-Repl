# NexFlow — Enrichment Waterfall: All Sources
**Complete reference: every existing source + new recommended additions**
Version 1.0 · May 2026 · Internal

---

## Table of Contents

1. [How the Waterfall Works](#1-how-the-waterfall-works)
2. [All Existing Sources (Live in Codebase)](#2-all-existing-sources-live-in-codebase)
3. [New Sources to Add — Requested](#3-new-sources-to-add--requested)
4. [New Sources to Add — Recommended Additions](#4-new-sources-to-add--recommended-additions)
5. [GCC-Specific Data Sources (Deep List)](#5-gcc-specific-data-sources-deep-list)
6. [Full Priority Order & Cost Summary](#6-full-priority-order--cost-summary)
7. [Integration Checklist](#7-integration-checklist)

---

## 1. How the Waterfall Works

### Core Principle
The waterfall runs all enabled sources in priority order (lowest number = runs first). Each source fills fields that aren't yet filled. Once a field is filled by a higher-priority source, lower-priority sources skip that field and move on. Every run is logged with: source used, fields filled, time taken, and cost in USD.

### Flow Diagram
```
Seed input (name + company / email / domain / CR number)
    ↓
[Priority 5]   Perplexity → finds official company domain
    ↓
[Priority 10]  Web Scraper → Cheerio + Playwright scrape
    ↓
[Priority 12]  Gemini Extractor → HTML → structured fields
    ↓
[Priority 18]  GLEIF → legal entity + LEI for large corps
    ↓
[Priority 20]  Hunter.io → email finder + verifier
    ↓
[Priority 22]  MAGNiTT → GCC startup funding data
    ↓
[Priority 24]  Wathiq → KSA Ministry of Commerce CR lookup
    ↓
[Priority 25]  Apollo.io → person + company match
    ↓
[Priority 26]  Tadawul/DFM/ADX → GCC exchange disclosures
    ↓
[Priority 28]  OpenCorporates → 200M+ jurisdictions
    ↓
[Priority 30]  Lusha → direct-dial mobile + work email
    ↓
[Priority 32]  Wikidata → structured knowledge graph
    ↓
[Priority 34]  Clearbit Logo → company logo by domain
    ↓
[Priority 36]  GitHub Org → tech/hiring signals
    ↓
[Priority 38]  Wappalyzer → tech stack fingerprint
    ↓
[Priority 40]  Crunchbase → funding + firmographics
    ↓
[Priority 45]  RocketReach → LinkedIn-derived contact
    ↓
[Priority 50]  People Data Labs → 3B-record graph
    ↓
[Priority 60]  Email Permutator → fallback email guess
    ↓
[Priority 70+] SaaS Stubs (ZoomInfo, Cognism, etc.) → plug key to activate
    ↓
[LAST]         Claude Composer → polishes description + news + hiring signal
    ↓
Result: every field tagged with source, cost, and timing
```

### Field Types the Waterfall Fills

| Category | Fields |
|---|---|
| Person | first_name, last_name, full_name, title, seniority, email, email_verified, phone, linkedin_url, twitter_handle |
| Company | company_name, company_domain, company_description, company_industry, company_country, company_size, company_founded_year, company_revenue, company_funding, company_tech_stack, company_logo_url, company_cr_number, company_isin |
| Signals | news_recent, hiring_signals |

---

## 2. All Existing Sources (Live in Codebase)

### Group A — AI Orchestration (No key needed)

#### AI Search — Perplexity
- **Priority:** 5
- **Key required:** No (uses OpenRouter env vars)
- **What it does:** Uses Perplexity Sonar to find the official company domain from fuzzy or Arabic company names. Replaces the old DuckDuckGo HTML scrape. Especially good at resolving Arabic-script names to their official English-domain equivalent.
- **Fields:** `company_domain`
- **Cost:** ~$0.001/lookup
- **GCC coverage:** High — Arabic company names resolved correctly
- **Docs:** https://openrouter.ai/perplexity/sonar

#### AI Extractor — Gemini Flash
- **Priority:** 12
- **Key required:** No (uses OpenRouter env vars)
- **What it does:** Fetches the company's homepage, strips HTML, feeds up to 12,000 characters to Gemini 2.5 Flash, and extracts structured fields. Far better than regex. Handles messy Arabic/bilingual pages. Prompt-injection hardened.
- **Fields:** company_name, company_description, company_industry, company_country, company_size, company_founded_year, company_tech_stack, linkedin_url, twitter_handle
- **Cost:** ~$0.0005/page
- **GCC coverage:** High
- **Docs:** https://openrouter.ai/google/gemini-2.5-flash

#### AI Composer — Claude 3.5 Sonnet
- **Priority:** Last (runs after every other source)
- **Key required:** No (uses OpenRouter env vars)
- **What it does:** Final synthesis pass. Takes every field filled by upstream sources and writes: a polished 2–3 sentence company narrative, a one-line news/funding signal, a one-line hiring posture signal. Doesn't add new facts — it improves quality of existing data.
- **Fields:** company_description (improved), news_recent, hiring_signals
- **Cost:** ~$0.003/run
- **GCC coverage:** High — GCC-context prompt

---

### Group B — Free Scrapers (No key needed)

#### Public Web Scraper
- **Priority:** 10
- **Key required:** No
- **What it does:** Cheerio (fast HTML parse) + Playwright (JS-rendered pages). Scrapes company About, Contact, Careers, and press release pages. Also pulls RSS feeds and public funding announcements.
- **Fields:** company_domain, company_description, company_logo_url, company_industry, company_country, email, linkedin_url, twitter_handle, company_tech_stack
- **Cost:** Free
- **Rate:** ~30 req/min (single IP)
- **GCC coverage:** Global

#### Python AI Scraper (Crawl4AI)
- **Priority:** 15
- **Key required:** No
- **What it does:** Separate Python sidecar (artifacts/enrichment-scraper) running Crawl4AI + BeautifulSoup for AI-powered structured extraction from messy or heavily JS-rendered pages that Cheerio can't handle. Disabled by default — enable when the sidecar is running.
- **Fields:** company_description, company_industry, company_size, company_tech_stack, news_recent, hiring_signals
- **Cost:** Free (compute only)
- **GCC coverage:** Global

---

### Group C — Open Data (Free public APIs, no key)

#### GLEIF — Global Legal Entity Identifier Foundation
- **Priority:** 18
- **Key required:** No
- **What it does:** Every company with international banking needs an LEI. Authoritative for: Saudi Aramco, Emirates NBD, ADNOC, STC, QNB, and any GCC corp with international financing. Returns official legal name, country, and LEI number.
- **Fields:** company_name, company_country, company_isin, company_founded_year
- **Cost:** Free
- **GCC coverage:** High — all major GCC corporations are registered
- **Docs:** https://www.gleif.org/en/lei-data/gleif-api

#### OpenCorporates
- **Priority:** 28
- **Key required:** No (optional token for higher rate)
- **What it does:** 200M+ companies across 130+ jurisdictions. GCC jurisdictions included: UAE Federal, DIFC, ADGM, KSA, Qatar, Bahrain, Kuwait, Oman. Returns CR number, founded date, company status (active/dissolved), registered address.
- **Fields:** company_name, company_cr_number, company_country, company_founded_year, company_industry
- **Cost:** Free (~50/day), paid for higher volume
- **GCC coverage:** High
- **Docs:** https://opencorporates.com/api_accounts/new

#### Wikidata
- **Priority:** 32
- **Key required:** No
- **What it does:** Open structured knowledge graph. Best for well-known public companies. Fills founded year, headcount band, official website, headquarters city. Handles Arabic labels for GCC companies.
- **Fields:** company_name, company_description, company_country, company_size, company_founded_year, company_domain
- **Cost:** Free
- **GCC coverage:** Medium (large public companies only)
- **Docs:** https://www.wikidata.org/wiki/Wikidata:Data_access

#### Clearbit Logo CDN
- **Priority:** 34
- **Key required:** No
- **What it does:** Free company logo lookup by domain. Returns a clean PNG/SVG logo URL instantly. Falls back gracefully when domain is unknown. Useful for making the CRM UI look polished.
- **Fields:** company_logo_url
- **Cost:** Free
- **GCC coverage:** High (any company with a domain)
- **Docs:** https://clearbit.com/logo

#### GitHub Org / User
- **Priority:** 36
- **Key required:** No (optional PAT for higher rate limit)
- **What it does:** Looks up the company as a GitHub organisation. Particularly useful for tech companies, fintech, AI startups — detects hiring signals from open issues and job listings in repos. Also gets Twitter handle and official site.
- **Fields:** company_description, company_country, twitter_handle, company_domain, company_founded_year, hiring_signals
- **Cost:** Free (60/hr unauthenticated, 5,000/hr with PAT)
- **GCC coverage:** Medium (tech/fintech/AI companies)

#### Wappalyzer (Tech Stack)
- **Priority:** 38
- **Key required:** No
- **What it does:** Open-source tech stack fingerprinting run locally against the company homepage. Detects: CRM platforms (Salesforce, HubSpot), analytics (GA4, Mixpanel), payment processors (Tap, PayTabs, HyperPay, Mada — GCC-specific), marketing tools, frameworks. GCC payment processor detection is unique.
- **Fields:** company_tech_stack
- **Cost:** Free (local run)
- **GCC coverage:** High — GCC payment rails fingerprinted
- **Docs:** https://github.com/wappalyzer/wappalyzer

#### Email Permutator
- **Priority:** 60
- **Key required:** No
- **What it does:** When no source found an email, generates the most statistically likely pattern: first.last@domain, flast@domain, firstl@domain. Marks as unverified. Hunter or Prospeo can validate downstream if needed.
- **Fields:** email, email_verified (always false — unverified)
- **Cost:** Free (local)
- **GCC coverage:** Medium

---

### Group D — GCC-Native APIs (Need key)

#### MAGNiTT
- **Priority:** 22
- **Key required:** Yes (Bearer Token — contact sales)
- **What it does:** Dubai-based GCC + MENA startup intelligence platform. Best-in-class for funding rounds in KSA, UAE, Egypt, Jordan that Crunchbase misses entirely. Returns total funding, last round type + amount + date, industry, headcount, country.
- **Fields:** company_name, company_domain, company_industry, company_funding, company_size, company_country, company_founded_year, company_description
- **Cost:** Subscription (contact sales)
- **GCC coverage:** High — purpose-built for GCC/MENA
- **Docs:** https://magnitt.com/contact
- **Region badge:** 🇦🇪 GCC + MENA

#### Wathiq — KSA Ministry of Commerce
- **Priority:** 24
- **Key required:** Yes (App ID — register at wathiq.business.sa)
- **What it does:** Authoritative KSA commercial registration lookup. Given a 10-digit CR number in the seed, returns: official Arabic/English legal name, CR status (active/suspended/cancelled), ISIC activity (industry), city/region. Mandatory for KSA enterprise sales — companies must verify CR before signing with government entities.
- **Fields:** company_name, company_cr_number, company_country, company_industry, company_founded_year
- **Cost:** Free (registration required)
- **GCC coverage:** KSA only — authoritative
- **Docs:** https://wathiq.business.sa/
- **Region badge:** 🇸🇦 KSA

#### Tadawul / DFM / ADX — GCC Stock Exchanges
- **Priority:** 26
- **Key required:** No (public disclosures)
- **What it does:** Saudi Exchange (Tadawul), Dubai Financial Market (DFM), and Abu Dhabi Securities Exchange (ADX) public disclosure scraping. Authoritative for any GCC-listed corporation's: revenue, sector, leadership, ISIN. Hard-coded fallback for top 6 GCC tickers (Aramco, Al Rajhi, STC, Emaar, Etisalat, FAB) so demos work even without live exchange connectivity.
- **Fields:** company_name, company_isin, company_industry, company_revenue, company_country, company_size, company_description
- **Cost:** Free
- **GCC coverage:** High — all listed GCC corporations
- **Docs:** https://www.saudiexchange.sa/
- **Region badge:** 🇸🇦🇦🇪 GCC exchanges

---

### Group E — Paid API Connectors (Need key, enabled by default)

#### Hunter.io
- **Priority:** 20
- **Key required:** Yes
- **What it does:** Email finder (name + domain → email) and domain search (domain → org metadata). Verifies emails via SMTP. Strong on Western corporations, decent for large GCC enterprise with international presence.
- **Fields:** email, email_verified, first_name, last_name, title, company_domain, linkedin_url, twitter_handle, phone
- **Cost:** 50 free/month · $34+/month paid
- **GCC coverage:** Medium
- **Docs:** https://hunter.io/api-keys

#### Apollo.io
- **Priority:** 25
- **Key required:** Yes
- **What it does:** Largest Western contact database with 20–30M MENA contacts. Best single source for KSA/UAE enterprise filtering by title + company + domain. Returns full person match: name, email, phone, title, seniority, LinkedIn, and company firmographics in one call.
- **Fields:** email, phone, first_name, last_name, title, seniority, linkedin_url, company_name, company_domain, company_industry, company_size, company_funding, company_tech_stack
- **Cost:** Free (200 credits) · $49+/month paid
- **GCC coverage:** High — best Western coverage for GCC
- **Docs:** https://app.apollo.io/#/settings/integrations/api

#### Lusha
- **Priority:** 30
- **Key required:** Yes
- **What it does:** Direct-dial mobile numbers + work emails. GDPR-compliant. High accuracy on EU/US execs posted to GCC roles. Useful for reaching C-suite who maintain EU/US LinkedIn profiles but are based in GCC.
- **Fields:** email, phone, linkedin_url, first_name, last_name, title, seniority, company_name, company_domain
- **Cost:** 5 free/month · $39+/month paid
- **GCC coverage:** Medium
- **Docs:** https://www.lusha.com/business/api/

#### Crunchbase
- **Priority:** 40
- **Key required:** Yes (User Key)
- **What it does:** Funding rounds + investor data for global startups. Two-step: autocomplete to find entity UUID, then fetch full profile. Coverage skewed to VC-backed startups — misses most Tadawul/DFM-listed firms (use those exchange connectors instead for listed companies). Good for MENA/GCC startups that raised internationally.
- **Fields:** company_name, company_domain, company_industry, company_funding, company_size, company_founded_year, company_description, company_logo_url
- **Cost:** Basic free (200 req/day) · Pro $49/month
- **GCC coverage:** Low-medium (funded startups only)
- **Docs:** https://data.crunchbase.com/docs/getting-started

#### RocketReach
- **Priority:** 45
- **Key required:** Yes
- **What it does:** LinkedIn-derived contact database. Takes LinkedIn URL, email, or name + company and returns contact data. Weaker GCC coverage but useful for cross-checking Western execs at GCC subsidiaries of multinationals.
- **Fields:** email, phone, linkedin_url, title, company_name, company_domain
- **Cost:** Trial available · $39+/month paid
- **GCC coverage:** Low
- **Docs:** https://rocketreach.co/api

#### People Data Labs (PDL)
- **Priority:** 50
- **Key required:** Yes
- **What it does:** 3 billion record graph — person + company enrichment. Decent GCC coverage and very rich firmographics. Takes email, LinkedIn, phone, or name + company. Returns comprehensive person profile + employer data.
- **Fields:** email, phone, linkedin_url, title, seniority, first_name, last_name, company_name, company_domain, company_industry, company_size, company_revenue, company_tech_stack
- **Cost:** Free trial · usage-based paid ($0.10/match)
- **GCC coverage:** Medium
- **Docs:** https://docs.peopledatalabs.com/docs/quickstart

---

### Group F — SaaS Stubs (Registered, disabled by default — plug API key to activate)

| Source | Fields | GCC Coverage | Pricing | Docs |
|---|---|---|---|---|
| **ZoomInfo** | Company name, industry, size, revenue | Medium | Enterprise $15K+/yr | https://api-docs.zoominfo.com/ |
| **Cognism** | Company name, industry, headcount, LinkedIn | Medium (EMEA strong) | Subscription (sales-led) | https://docs.cognism.com/ |
| **Seamless.AI** | Email, phone, title, LinkedIn | Low | Free tier · $147+/mo | https://api.seamless.ai/ |
| **Kaspr** | Email, phone, title | Low | €49+/mo | https://www.kaspr.io/api |
| **Datanyze (ZoomInfo)** | Tech stack, company size | Medium | $29+/mo | https://www.datanyze.com/ |
| **SignalHire** | Email, phone, LinkedIn | Medium | $49+/mo | https://www.signalhire.com/api |
| **Proxycurl (LinkedIn)** | LinkedIn URL, title, company, country | High | ~$0.01/lookup | https://nubela.co/proxycurl/docs |
| **Lead411** | Company name, industry, size, revenue | Low | Subscription | https://www.lead411.com/ |
| **Prospeo** | Email + verified status | Medium | Pay-per-use | https://prospeo.io/ |
| **Clearbit (deprecated)** | Company name, industry, size, logo | Low | Acquired by HubSpot | https://clearbit.com/ |
| **SalesIntel** | Company name, headcount, revenue | Low | Subscription | https://salesintel.io/ |
| **Swordfish** | Work email, mobile phone | Medium | Pay-per-use | https://swordfish.ai/ |

---

### Group G — Manual Only (No public API — shown in UI, never auto-run)

| Source | Why manual only |
|---|---|
| **LinkedIn Sales Navigator** | Browser extension + manual export only. No programmatic API. |
| **Adapt.io** | No public REST API exists. |
| **LeadGibbon** | Chrome extension only. No public API. |
| **Explorium** | Enterprise data platform — no self-serve API. |
| **Vibe Prospecting** | No public API. |

---

## 3. New Sources to Add — Requested

### Dhow
- **What it is:** Dhow (dhow.io) is a GCC-native B2B data intelligence platform focused on MENA company and contact data, built specifically for Gulf markets. Positioned as the "Middle East's Apollo" — Arabic company names, Gulf phone numbers, WhatsApp IDs, CR-linked profiles.
- **Why add it:** Direct competitor to Apollo but with GCC-native coverage that Apollo misses. Dhow's database includes SMBs in Riyadh, Jeddah, Dubai, Abu Dhabi that global providers don't have. Arabic names handled correctly.
- **Suggested priority:** 23 (right after MAGNiTT, before Wathiq)
- **Fields to target:** email, phone, whatsapp_number, title, company_name, company_cr_number, company_industry, company_country, company_size
- **Integration approach:** REST API — contact dhow.io for API access. No public docs yet.
- **Cost estimate:** Subscription (GCC-focused pricing, SAR-denominated)
- **GCC coverage:** Very High — purpose-built
- **Key required:** Yes
- **Region badge:** 🇸🇦🇦🇪 GCC-native

---

### DeepSeek
- **What it is:** DeepSeek is a Chinese AI lab's family of language models (DeepSeek-V3, DeepSeek-R1) competitive with GPT-4o and Claude at significantly lower cost. Available via API at api.deepseek.com.
- **Why add it:** Not a data source — an AI provider to add to the waterfall's AI layer. DeepSeek-V3 is ~10–20× cheaper than GPT-4o for the same output quality. Can be used as:
  - An additional synthesis model in the `synthesizeJson` waterfall (after Gemini, Claude, GPT)
  - A fallback LLM for the AI Composer step
  - A cheaper model for the Email Permutator logic
- **Suggested use:** Add as priority 4 in the synthesizeJson waterfall — try DeepSeek-V3 first (cheapest), fall back to Gemini → Claude → GPT if it fails.
- **Models:** DeepSeek-V3 (reasoning + generation), DeepSeek-R1 (chain-of-thought)
- **Cost:** ~$0.07/1M input tokens (vs GPT-4o at $2.50/1M) — 36× cheaper
- **API:** https://api.deepseek.com (OpenAI-compatible SDK)
- **Key required:** Yes (DEEPSEEK_API_KEY)
- **Docs:** https://api-docs.deepseek.com/

---

### PitchBook
- **What it is:** PitchBook is the leading global financial data platform for private equity, venture capital, and M&A data. Covers 3.7M+ companies, 900K+ investors, 1.5M+ deals. Industry-standard for institutional-grade funding intelligence.
- **Why add it for NexFlow:** GCC PE/VC activity is significant and often not on Crunchbase. PitchBook covers: Saudi Aramco Ventures (SAV), ADQ, Mubadala, STC Ventures, stc pay investments, Jabal Omar, and other GCC sovereign/corporate investors. Ideal for enterprise sales into investment banks, PE firms, and large family offices.
- **Fields to target:** company_funding, company_investors, company_revenue, company_valuation, company_founded_year, company_industry, company_size
- **GCC coverage:** Medium-High (large companies and VC-backed startups)
- **Cost:** Enterprise subscription ($20K+/year) — API access requires Data License
- **Key required:** Yes (API key + Data License agreement)
- **Docs:** https://pitchbook.com/data/api
- **Region badge:** Global (GCC PE/VC improving)

---

### Decypha
- **What it is:** Decypha (decypha.com) is a MENA-focused financial data and analytics platform covering GCC-listed companies, financial statements, ownership structures, board members, analyst reports, and market data. Built for the MENA institutional finance market.
- **Why add it:** The single best source for financial data on GCC-listed companies. Decypha covers Tadawul, DFM, ADX, Boursa Kuwait, Bahrain Bourse, Muscat Stock Exchange — all 6 GCC exchanges with structured financial data (revenue, EBITDA, net profit, debt, ownership). Far deeper than the Tadawul scraper connector.
- **What it returns:**
  - Company financials: revenue, EBITDA, net profit (3-year history)
  - Board members + ownership structure
  - Analyst ratings and consensus price targets
  - Sector benchmarks and peer comparisons
  - ESG scores (GCC-specific criteria)
  - Dividend history
- **Fields to target:** company_name, company_revenue, company_size, company_industry, company_isin, company_description, company_country
- **Suggested priority:** 27 (between Tadawul connector and OpenCorporates)
- **GCC coverage:** Very High — purpose-built for GCC listed markets
- **Cost:** Subscription (contact sales — decypha.com)
- **Key required:** Yes (API key via enterprise subscription)
- **Docs:** https://decypha.com/
- **Region badge:** 🇸🇦🇦🇪🇶🇦🇰🇼🇧🇭🇴🇲 All 6 GCC markets

---

## 4. New Sources to Add — Recommended Additions

### Argaam — Saudi Financial News & Data
- **What it is:** Argaam (argaam.com) is Saudi Arabia's leading Arabic financial news and data platform. Covers Tadawul-listed companies with Arabic-first financial data, CEO interviews, earnings releases, and regulatory filings.
- **Why add it:** Already used as a buying-signal source in NexFlow's Signals engine. Should also be wired into the waterfall as a data source for company fundamentals. Argaam has structured data for all Tadawul companies in Arabic including: financial results, board changes, dividend announcements, and M&A filings.
- **Fields:** company_name, company_revenue, company_industry, company_description, news_recent
- **Suggested priority:** 29
- **Cost:** Subscription / contact commercial team (argaam.com/en/contact)
- **Key required:** Yes
- **GCC coverage:** Very High — KSA listed companies
- **Region badge:** 🇸🇦 KSA Tadawul

---

### Wamda — MENA Startup Ecosystem
- **What it is:** Wamda (wamda.com) is the MENA region's leading startup ecosystem platform — news, funding rounds, investor profiles, accelerator programs. Already used in NexFlow's buying-signals engine.
- **Why add it to the waterfall:** Should also enrich company profiles for MENA startups. Wamda covers rounds that MAGNiTT may miss and includes qualitative profiles and founder backgrounds.
- **Fields:** company_description, company_funding, company_founded_year, company_industry, news_recent
- **Suggested priority:** 31
- **Cost:** Contact commercial team (wamda.com)
- **Key required:** Yes
- **GCC coverage:** High — MENA focus
- **Region badge:** 🇦🇪🇸🇦 MENA

---

### MoCI — Saudi Ministry of Commerce
- **What it is:** Saudi Ministry of Commerce (mci.gov.sa) public data portal. Beyond the Wathiq CR lookup, MoCI also publishes: new company registrations (daily feed), license renewals, sector statistics, and foreign investment approvals.
- **Why add it:** The MoCI daily new-registration feed is a buying-signal goldmine — companies registered in the last 30 days are in setup mode and actively buying software. Can seed the Forgotten Leads and Buying Signals engines directly.
- **Fields:** company_name, company_cr_number, company_country, company_industry, company_founded_year
- **Suggested priority:** 25 (parallel to Wathiq)
- **Cost:** Free (public data) / paid API via Wathiq
- **Key required:** Yes (via Wathiq App ID)
- **GCC coverage:** KSA only — authoritative
- **Region badge:** 🇸🇦 KSA

---

### Clearbit Enrichment (HubSpot — new version)
- **What it is:** Clearbit was acquired by HubSpot. The new Breeze Intelligence API (formerly Clearbit) offers company + person enrichment from HubSpot's data layer. 200M+ contacts, 20M+ companies.
- **Why add it:** The legacy Clearbit connector in the waterfall uses the deprecated endpoint. The new Breeze Intelligence API has better coverage and is still accessible with an API key.
- **Fields:** company_name, company_description, company_industry, company_size, company_revenue, company_tech_stack, company_logo_url, email, title
- **Suggested priority:** 55 (replaces the deprecated `clearbit` stub)
- **Cost:** Pay-per-record (~$0.005)
- **Key required:** Yes
- **Docs:** https://knowledge.hubspot.com/reports/breeze-intelligence
- **GCC coverage:** Medium

---

### FullContact
- **What it is:** FullContact is a person enrichment API using the "Resolve" identity graph — matches email, phone, name, or social handle to a full person profile + employer + LinkedIn.
- **Why add it:** Strong on mobile phone → person resolution, which is useful for GCC where WhatsApp phone numbers are often the only seed data you have. Can resolve a phone number to a full name + company + title.
- **Fields:** first_name, last_name, full_name, title, company_name, linkedin_url, twitter_handle, email
- **Suggested priority:** 48
- **Cost:** Pay-per-match ($0.05–0.15)
- **Key required:** Yes
- **Docs:** https://docs.fullcontact.com/
- **GCC coverage:** Medium (strong on phone → person)

---

### Clay (Claygent / Clay Tables)
- **What it is:** Clay (clay.com) is a data enrichment platform that waterfalls across 75+ data providers including Apollo, PDL, Hunter, Clearbit, and LinkedIn. Think of it as a waterfall-of-waterfalls. It also has "Claygent" — an AI research agent that browses the web and returns structured data.
- **Why add it:** Clay's API (Table API) allows you to submit a row and get back enriched fields from their full 75-source waterfall — without managing each vendor relationship yourself. Essentially outsources the multi-source enrichment problem to Clay. Excellent for cold-start before NexFlow's own waterfall sources are all configured.
- **Fields:** All person + company fields
- **Suggested priority:** 65 (fallback after all primary sources run)
- **Cost:** Credits-based ($149+/month)
- **Key required:** Yes
- **Docs:** https://clay.com/developers
- **GCC coverage:** Medium (depends on their source mix)

---

### Dun & Bradstreet (D&B)
- **What it is:** Dun & Bradstreet is the world's largest B2B commercial data provider. 500M+ business records including SMBs. D-U-N-S numbers are used as the global standard business identifier. Particularly strong for: company credit risk, corporate family trees (parent/subsidiary), and global HQ relationships.
- **Why add it for GCC:** Many GCC enterprises (especially holding groups like SABIC, Almarai, Saudi Telecom) have complex subsidiary structures. D&B's corporate hierarchy data is essential for account-based selling. D&B covers Saudi, UAE, Kuwait, Bahrain, Oman, Qatar with local registrar integrations.
- **Fields:** company_name, company_size, company_revenue, company_industry, company_country, company_founded_year, company_description
- **Suggested priority:** 52
- **Cost:** Enterprise subscription (contact sales)
- **Key required:** Yes (D&B Direct+ API)
- **Docs:** https://directplus.dnb.com/
- **GCC coverage:** High — D&B has regional registrar partnerships
- **Region badge:** Global · GCC registrar integration

---

### Bombora — Intent Data
- **What it is:** Bombora provides B2B intent data — which companies are actively researching specific topics right now, based on content consumption across 5,000+ B2B sites. "Company Surge" shows a score (0–100) for how much more a company is researching a topic vs baseline.
- **Why add it:** Intent data is the missing signal in the NexFlow waterfall. If a company has a Surge score of 80+ for "CRM software" or "sales automation", they're in an active buying cycle. This is more actionable than any firmographic.
- **Fields:** hiring_signals (repurposed as intent signals), news_recent
- **Suggested priority:** 57
- **Cost:** Enterprise subscription
- **Key required:** Yes
- **Docs:** https://bombora.com/
- **GCC coverage:** Low-Medium (MENA coverage growing)

---

### Crunchbase Pro (upgrade from Basic)
- **What it is:** Crunchbase Pro / Enterprise offers significantly more data than the Basic free tier already integrated. Pro adds: full funding history (not just last round), all investor names, board members, acquisition history, technology signals, employee headcount growth charts.
- **Why upgrade:** The current Crunchbase connector uses the Basic API (200 req/day free). Pro removes rate limits and adds investment-grade data needed for the CEO Situation Room and Investor Deck use cases.
- **Fields:** company_funding (full history), company_investors, company_size (with growth trend), company_description (enriched)
- **Current connector:** Already built — just swap the API key for a Pro key
- **Cost:** Pro $49/month · Enterprise custom
- **Key required:** Yes (same connector, Pro key)
- **Docs:** https://data.crunchbase.com/docs

---

## 5. GCC-Specific Data Sources (Deep List)

Additional GCC-native sources worth evaluating for future connectors:

### Government & Regulatory Registries

| Source | Country | What it covers | URL |
|---|---|---|---|
| **Wathiq** | 🇸🇦 KSA | CR number, legal name, status, directors | wathiq.business.sa |
| **MoCI (Saudi)** | 🇸🇦 KSA | Company registrations, license renewals | mci.gov.sa |
| **MISA (Saudi)** | 🇸🇦 KSA | Foreign investment licenses, sector approvals | misa.gov.sa |
| **DED (Dubai)** | 🇦🇪 UAE | Dubai Economic Department trade license | ded.ae |
| **MOEC (Abu Dhabi)** | 🇦🇪 UAE | Abu Dhabi trade license lookup | moec.gov.ae |
| **DIFC (Dubai)** | 🇦🇪 UAE | DIFC-registered companies and funds | difc.ae |
| **ADGM (Abu Dhabi)** | 🇦🇪 UAE | Abu Dhabi Global Market entities | adgm.com |
| **QFCRA (Qatar)** | 🇶🇦 Qatar | QFC-registered companies | qfc.qa |
| **CIPA (Kuwait)** | 🇰🇼 Kuwait | Kuwait commercial registry | cipa.gov.kw |
| **MOCI (Bahrain)** | 🇧🇭 Bahrain | Bahrain commercial registry | sijilat.com.bh |
| **ITA (Oman)** | 🇴🇲 Oman | Oman investment and company registry | investinoman.com |

### Stock Exchanges

| Source | Market | What it covers | URL |
|---|---|---|---|
| **Saudi Exchange (Tadawul)** | 🇸🇦 KSA | 200+ listed companies, financial disclosures | saudiexchange.sa |
| **DFM (Dubai)** | 🇦🇪 UAE | Dubai Financial Market listings | dfm.ae |
| **ADX (Abu Dhabi)** | 🇦🇪 UAE | Abu Dhabi Securities Exchange | adx.ae |
| **Boursa Kuwait** | 🇰🇼 Kuwait | Kuwait Exchange listings | boursakuwait.com.kw |
| **Bahrain Bourse** | 🇧🇭 Bahrain | Bahrain Exchange listings | bahrainbourse.com |
| **Muscat Stock Exchange** | 🇴🇲 Oman | Oman Exchange listings | msx.om |

### Financial Data & News

| Source | Coverage | What it covers | URL |
|---|---|---|---|
| **Decypha** | All GCC | Financials, board, ownership, analyst reports | decypha.com |
| **Argaam** | 🇸🇦 KSA | Arabic financial news, Tadawul filings | argaam.com |
| **Mubasher** | GCC + MENA | Financial news, data, market info | mubasher.info |
| **Zawya (LSEG)** | GCC + MENA | Financial news, M&A, deals, company profiles | zawya.com |
| **MENA Treasury** | GCC | Bond issuances, sukuk, debt capital markets | — |
| **Wamda** | MENA | Startup funding, ecosystem news | wamda.com |
| **MAGNiTT** | GCC + MENA | Startup + VC intelligence | magnitt.com |
| **Saned Partners** | 🇸🇦 KSA | Saudi IP, patents, trademark registry | — |

### People & Contact (GCC-Specific)

| Source | Coverage | What it covers | URL |
|---|---|---|---|
| **Dhow** | GCC | B2B contacts, Arabic names, WhatsApp IDs | dhow.io |
| **LinkedIn (Proxycurl)** | Global | Profile data — ToS-safe GCC executive lookup | nubela.co |
| **Bayt.com** | GCC | Job postings, hiring signals, salary benchmarks | bayt.com |
| **GulfTalent** | GCC | Executive search, hiring signals | gulftalent.com |
| **Naukrigulf** | GCC | Job listings, company hiring activity | naukrigulf.com |

---

## 6. Full Priority Order & Cost Summary

| Priority | Source | Key? | Cost/call | GCC Coverage | Status |
|---|---|---|---|---|---|
| 5 | AI Search (Perplexity) | No | $0.001 | High | ✅ Live |
| 10 | Public Web Scraper | No | Free | Global | ✅ Live |
| 12 | AI Extractor (Gemini) | No | $0.0005 | High | ✅ Live |
| 15 | Python AI Scraper | No | Free | Global | ✅ Live (off) |
| 18 | GLEIF LEI | No | Free | High | ✅ Live |
| 20 | Hunter.io | Yes | $0.005 | Medium | ✅ Live |
| 22 | MAGNiTT | Yes | Subscription | Very High | ✅ Live |
| 23 | **Dhow** | Yes | TBD | Very High | 🔲 To build |
| 24 | Wathiq (KSA) | Yes | Free | KSA only | ✅ Live |
| 25 | Apollo.io | Yes | $0.04 | High | ✅ Live |
| 26 | Tadawul / DFM / ADX | No | Free | High | ✅ Live |
| 27 | **Decypha** | Yes | Subscription | Very High | 🔲 To build |
| 28 | OpenCorporates | No | Free | High | ✅ Live |
| 29 | **Argaam** | Yes | Subscription | KSA high | 🔲 To build |
| 30 | Lusha | Yes | $0.08 | Medium | ✅ Live |
| 31 | **Wamda** | Yes | TBD | GCC high | 🔲 To build |
| 32 | Wikidata | No | Free | Medium | ✅ Live |
| 34 | Clearbit Logo CDN | No | Free | High | ✅ Live |
| 36 | GitHub Org | No | Free | Medium | ✅ Live |
| 38 | Wappalyzer | No | Free | High | ✅ Live |
| 40 | Crunchbase | Yes | Free/paid | Low-Medium | ✅ Live |
| 45 | RocketReach | Yes | $0.05 | Low | ✅ Live |
| 48 | **FullContact** | Yes | $0.10 | Medium | 🔲 To build |
| 50 | People Data Labs | Yes | $0.10 | Medium | ✅ Live |
| 52 | **D&B Direct+** | Yes | Enterprise | High | 🔲 To build |
| 55 | **Breeze Intelligence** | Yes | $0.005 | Medium | 🔲 To build |
| 57 | **Bombora Intent** | Yes | Enterprise | Low-Medium | 🔲 To build |
| 60 | Email Permutator | No | Free | Global | ✅ Live |
| 65 | **Clay (fallback)** | Yes | Credits | Medium | 🔲 To build |
| 70–90 | SaaS Stubs (12 sources) | Yes | Varies | Low-Medium | ✅ Registered |
| Last | AI Composer (Claude) | No | $0.003 | High | ✅ Live |

**Note on DeepSeek:** Not a data source — an AI model. Add to the synthesizeJson waterfall as cheapest LLM option (priority 1 in AI fallback chain, before Gemini → Claude → GPT). Cost: ~$0.007/1M tokens.

**Note on PitchBook:** Enterprise subscription + Data License required. Recommended for Stage 2 (after Series A) when institutional investor data becomes a sales priority.

---

## 7. Integration Checklist

### Immediately Actionable (APIs exist today, just need keys)

| Source | Action | Effort |
|---|---|---|
| Apollo.io | Add `APOLLO_API_KEY` to secrets | 30 min |
| Hunter.io | Add `HUNTER_API_KEY` to secrets | 30 min |
| Lusha | Add `LUSHA_API_KEY` to secrets | 30 min |
| Crunchbase | Add `CRUNCHBASE_USER_KEY` to secrets | 30 min |
| People Data Labs | Add `PDL_API_KEY` to secrets | 30 min |
| DeepSeek | Add `DEEPSEEK_API_KEY`, add to AI chain | 2 hours |
| Wathiq | Register at wathiq.business.sa, add App ID | 1 day |
| MAGNiTT | Contact sales@magnitt.com for API token | 1 week |

### Build Required (Connector code needed)

| Source | Effort | Priority |
|---|---|---|
| **Dhow** | 4 hours (once API is available) | High |
| **Decypha** | 4 hours (once API is available) | High |
| **Argaam** | 3 hours | High |
| **Wamda** | 3 hours | Medium |
| **FullContact** | 2 hours | Medium |
| **D&B Direct+** | 6 hours | Medium |
| **Breeze Intelligence** | 3 hours (replaces deprecated Clearbit) | Low |
| **Clay (fallback)** | 4 hours | Low |
| **Bombora** | 5 hours | Low |

### Enterprise Sales Required (Long procurement cycles)

| Source | Timeline | Notes |
|---|---|---|
| **PitchBook** | 4–8 weeks | Data License agreement required |
| **ZoomInfo** | 2–4 weeks | Enterprise contract |
| **D&B Direct+** | 2–4 weeks | Enterprise contract |

---

*NexFlow Enrichment — Internal Technical Reference*
*Riyadh · Khobar · Dubai · Confidential · 2026*
