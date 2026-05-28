# Crawlee (managed crawl queue) [planned]

- **Layer/tier:** crawl orchestration above L1–L3 for large multi-page harvests.
- **Role bindings:** `lib/scrapers/crawlee-runner.ts` [engine branch]; Data Seeder HARVEST, Website Intel BFS, Builder bulk harvest.
- **Env vars:** `CHROMIUM_EXECUTABLE_PATH`, proxy vars.
- **How:** request queue + autoscaling pool + retry/backoff + dedup, wrapping Cheerio/Playwright. Respects robots, rotates sessions/proxies.
- **Cost:** $0 compute (+ proxy).
- **Escalate when:** per-page block → hand the URL to L3 Camoufox.
- **Fallback:** if absent → PowerScraper's built-in pagination loop (≤20 pages).
- **Notes:** use for site-wide harvests; single-page fetches stay on PowerScraper directly.
