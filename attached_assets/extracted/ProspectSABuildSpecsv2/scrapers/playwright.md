# Playwright + stealth (L2 — full JS)

- **Layer/tier:** L2, after L1 fails. Headless Chromium, JS render.
- **Role bindings:** `deep_scrape` tool; PowerScraper L2; `stealth-browser.ts` (Masaar CR/AOA).
- **Env vars:** `CHROMIUM_EXECUTABLE_PATH` (optional), proxy + captcha vars.
- **How:** stealth fingerprint patches (webdriver/plugins/WebGL/canvas noise), HumanBehavior (Bézier mouse, scroll, jitter), session persistence (cookies/localStorage per domain), `autoSolveCaptcha()` (Claude Vision, 3 tries → human fallback).
- **Cost:** $0 compute (+ optional proxy/captcha fees).
- **Escalate when:** still blocked/fingerprinted → L3 Camoufox; malformed RTL → L5 bs4.
- **Fallback:** L2 fail → L3 (or L1 result if partial).
- **Notes:** powers Masaar stealth browsing of mc.gov.sa / Amaaly.
