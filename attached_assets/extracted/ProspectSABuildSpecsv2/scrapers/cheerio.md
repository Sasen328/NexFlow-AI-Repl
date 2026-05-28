# Cheerio + axios (L1 — fast static)

- **Layer/tier:** L1, first try for every URL. Static HTML only (no JS).
- **Role bindings:** `url_crawl` tool; PowerScraper L1; quick fetches across all engines.
- **Env vars:** none.
- **How:** axios GET (≤12s), strip script/style, reduce to ~8k chars → text/DOM.
- **Cost:** $0.
- **Escalate when:** empty body, JS-gated content, anti-bot block → L2 Playwright.
- **Fallback:** L1 fail → L2.
- **Notes:** cheapest/fastest; handles ~60% of public Saudi sites.
