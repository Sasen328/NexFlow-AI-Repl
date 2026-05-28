# ScrapeGraphAI (L4 — LLM schema extraction) [planned]

- **Layer/tier:** L4. Natural-language-schema → structured rows from any fetched page.
- **Role bindings:** PowerScraper L4 (`scrapegraph-client.ts`); **Data Seeder HARVEST phase** (`/api/prosengine/seed/harvest`).
- **Env vars:** `SCRAPEGRAPH_API_KEY` (or self-host); falls back to Gemini-driven extraction.
- **How:** give it a schema in plain words ("company name, website, city, contact") + page → returns `{records:[...]}`. Used after L1–L3 obtain HTML.
- **Cost:** API-metered (or LLM token cost if self-hosted via Nexus extraction tier).
- **Escalate when:** extraction empty → retry with crawl4ai full-stack crawl, then regex.
- **Fallback:** ScrapeGraphAI → crawl4ai → Cheerio+regex.
- **Notes:** the structured-extraction backbone of the rebuilt Data Seeder.
