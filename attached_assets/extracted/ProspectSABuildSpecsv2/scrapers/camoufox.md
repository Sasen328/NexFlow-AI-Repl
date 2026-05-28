# Camoufox (L3 — engine-level stealth) [planned]

- **Layer/tier:** L3, after L2 stealth still gets fingerprinted. Firefox-based anti-detect engine driven via Playwright.
- **Role bindings:** PowerScraper L3 (`lib/scrapers/camoufox-runner.ts` on engine branch).
- **Env vars:** `CAMOUFOX_ENABLED=true`, optional proxy vars.
- **How:** ships hardened browser fingerprints at the engine level (not JS patches), defeating canvas/WebGL/font/timing detection that L2 can't.
- **Cost:** $0 compute (+ proxy).
- **Escalate when:** even Camoufox blocked → rotate proxy-pool, then ScrapeGraphAI (L4) on whatever HTML is obtained.
- **Fallback:** L3 fail → L4 / return best partial.
- **Notes:** reserve for the hardest gov/anti-bot targets; heavier startup than Playwright.
