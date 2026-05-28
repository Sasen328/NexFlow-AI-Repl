# Scrapers — Index & Layer Map

> PowerScraper (`lib/power-scraper.ts`, real this branch) escalates through layers.
> Camoufox (L3) and ScrapeGraphAI (L4) + the OSINT clients (Sherlock, TheHarvester,
> Crawlee, proxy-pool) are the target design (engine branch / Scout sidecar) — marked **[planned]** where not yet a discrete file here.

## Layer map
```
L1  Cheerio + axios          fast static HTML            (real)
L2  Playwright + stealth      full JS render              (real — power-scraper + stealth-browser)
L3  Camoufox + Playwright     engine-level anti-fingerprint  [planned: lib/scrapers/camoufox-runner.ts]
L4  ScrapeGraphAI             LLM natural-language schema extraction  [planned: scrapegraph-client.ts / Scout]
L5  BeautifulSoup subprocess  RTL / malformed Arabic HTML  (real — bs4_extract.py)
```
PowerScraper API: `scrapePage(url,{engine,timeoutMs,followPagination,pageClassifier})` → `PageData`. Auto-escalates on empty/blocked content; UA + viewport rotation; 800–2500ms human delays; pagination ≤20 pages.

## OSINT / harvest clients
- **Sherlock** — username→social presence (Scout `/scout/osint/social`).
- **TheHarvester** — domain→emails/subdomains/hosts (Scout OSINT) **[planned client]**.
- **Crawlee** — managed crawl queue + autoscale **[planned: crawlee-runner.ts]**.
- **proxy-pool** — rotating residential proxies (`nexus/proxy-manager.ts` exists) gating L2/L3.
- **Crawl4AI** — LLM-friendly crawler (Scout, used by Data Seeder EVAL).

Per-scraper files: `cheerio.md` · `playwright.md` · `camoufox.md` · `scrapegraphai.md` · `beautifulsoup.md` · `sherlock.md` · `theharvester.md` · `crawlee.md` · `proxy-pool.md` · `crawl4ai.md`.

## Env vars (scraper fabric)
`CHROMIUM_EXECUTABLE_PATH` · `CAMOUFOX_ENABLED` · `SCRAPEGRAPH_API_KEY` · `CRAWL4AI_API_KEY` · `THEHARVESTER_BIN` · `SCOUT_URL` · proxy: `WEBSHARE_PROXY_LIST`/`IPROYAL_*`+`NEXUS_PROXY_ENABLED` · captcha: `NOPECHA_API_KEY`/`CAPMONSTER_API_KEY`+`NEXUS_CAPTCHA_ENABLED`.
