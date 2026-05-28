# Crawl4AI (LLM-friendly crawler)

- **Layer/tier:** crawl + markdown extraction feeding LLM extraction (pairs with L4).
- **Role bindings:** Scout-side (`crawl4ai>=0.4.0` in `python-scout/requirements.txt`); **Data Seeder EVAL** (`/api/prosengine/seed/eval`, ≤25 pages); Masaar/Builder enrich.
- **Env vars:** `CRAWL4AI_API_KEY` (optional / self-host), `SCOUT_URL`.
- **How:** crawls a site → clean markdown/text + page count, ideal as LLM input for structural mapping (Seeder EVAL infers entities+fields+confidence via Nexus extractor).
- **Cost:** $0 self-hosted (LLM token cost downstream).
- **Escalate when:** crawl returns no text → infer from URL only, or fall to Playwright.
- **Fallback:** crawl4ai absent → PowerScraper L1/L2 + manual markdown.
- **Notes:** the EVAL phase's crawler; ScrapeGraphAI (L4) then does schema extraction in HARVEST.
