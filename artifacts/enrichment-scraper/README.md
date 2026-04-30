# Enrichment Scraper (Python sidecar)

FastAPI service that powers the `python_scraper` connector inside the NexFlow
waterfall orchestrator (`artifacts/api-server/src/lib/enrichment/`).

## Endpoints

All routes are mounted behind `/scraper` by the workspace shared proxy.

| Method | Path                | Purpose                                      |
| ------ | ------------------- | -------------------------------------------- |
| GET    | `/scraper/health`   | Liveness + capability list                   |
| GET    | `/scraper/`         | Service info JSON (browsable)                |
| POST   | `/scraper/extract`  | Fetch a URL and return text + structured JSON |

### `POST /scraper/extract`

```json
{
  "url": "https://example.com",
  "mode": "bs4",                  // "bs4" | "crawl4ai" (auto-fallback)
  "respect_robots": true,
  "timeout_seconds": 10
}
```

Response:

```json
{
  "ok": true,
  "url": "https://example.com",
  "mode_used": "bs4",
  "text": "...first 5000 chars...",
  "structured": {
    "company_name": "Example",
    "description": "...",
    "industry": "SaaS",
    "size_band": "100-500 employees",
    "tech_stack": ["React", "Next.js"],
    "headcount_signals": ["Active hiring page detected"],
    "news": ["Latest headline ..."],
    "social_links": { "linkedin": "...", "twitter": "..." },
    "emails": ["info@example.com"]
  }
}
```

## Modes

* **bs4** (default) — `requests` + `BeautifulSoup4` + `lxml`. Fast, no
  browser dependency, no JS execution.
* **crawl4ai** (optional) — AI-assisted extraction with full browser
  rendering. Heavy install (~Playwright + Chromium); only loaded if
  `crawl4ai` is importable. Auto-falls-back to `bs4` otherwise.

To enable crawl4ai later:

```bash
python -m pip install "crawl4ai>=0.4"
python -m playwright install chromium
```

## Robots.txt

Honored by default. Pass `respect_robots: false` per request to override
when scraping public pages your team is authorised to read.

## Local dev

```bash
pnpm --filter @workspace/enrichment-scraper run dev
```

The Node-side connector reads `ENRICHMENT_SCRAPER_URL` (default
`http://localhost:8000/scraper`). The sidecar is intentionally NOT routed
through the workspace shared proxy — it's a server-to-server call from
api-server, so we save a hop and avoid path-prefix fiddling.
