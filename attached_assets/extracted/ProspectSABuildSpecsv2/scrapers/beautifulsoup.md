# BeautifulSoup subprocess (L5 — RTL / malformed)

- **Layer/tier:** L5, last resort for malformed or RTL Arabic HTML that L1–L4 mangle.
- **Role bindings:** PowerScraper L5; `lib/bs4_extract.py` invoked as a subprocess; Scout-side `beautifulsoup4`.
- **Env vars:** Python3 + bs4 installed (Scout `requirements.txt`).
- **How:** lenient parser tolerant of broken markup; preserves Arabic RTL structure, extracts emails/phones/tables Cheerio drops.
- **Cost:** $0.
- **Escalate when:** n/a (terminal layer) — returns best-effort text.
- **Fallback:** if subprocess unavailable → return L1/L2 partial.
- **Notes:** critical for old Saudi gov/registry pages with broken encoding.
