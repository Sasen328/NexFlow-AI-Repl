"""
Enrichment Scraper — Python AI sidecar for the NexFlow waterfall orchestrator.

Exposes /scraper/* endpoints behind the workspace shared proxy. The Node-side
api-server's `python_scraper` connector calls into here for AI-assisted
structured extraction from public company web pages.

Endpoints
---------
GET  /scraper/health              -> liveness + version + capability list
POST /scraper/extract             -> fetch URL, return text + structured fields
GET  /scraper/                    -> small status JSON (browsable index)

Design notes
------------
* BeautifulSoup4 is the default engine — fast, zero browser dep.
* Crawl4AI is treated as an OPTIONAL upgrade; if installed it's selected
  when the caller passes `mode="crawl4ai"`. Otherwise we silently fall
  back to BS4 so the waterfall keeps moving.
* All outbound fetches respect a 10s timeout and identify themselves with
  a NexFlow user-agent so the host can rate-limit us if needed.
* Robots.txt is honored by default; pass `respect_robots=false` to override.
"""

from __future__ import annotations

import ipaddress
import logging
import os
import re
import socket
import urllib.parse
import urllib.robotparser
from typing import Any, Optional

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl

# ─────────────────────────────────────────────────────────────────────
# Optional Crawl4AI — heavy, opt-in. We never error on missing install.
# ─────────────────────────────────────────────────────────────────────
try:  # pragma: no cover - optional dep
    from crawl4ai import AsyncWebCrawler  # type: ignore[import-not-found]
    HAS_CRAWL4AI = True
except Exception:  # noqa: BLE001
    AsyncWebCrawler = None  # type: ignore[assignment]
    HAS_CRAWL4AI = False

VERSION = "1.0.1"
USER_AGENT = (
    "NexFlow-Enrichment-Scraper/1.0 "
    "(+https://nexflow.replit.app; contact: ops@nexflow.io)"
)
DEFAULT_TIMEOUT = 10  # seconds
MAX_REDIRECTS = 5

# Shared secret — when set, every /scraper/extract call must present a matching
# X-Sidecar-Token header. The Node-side connector (api-server) sends this from
# the same env var. When unset, the endpoint is open (dev convenience only —
# production deploys MUST set this).
SHARED_SECRET = os.environ.get("SCRAPER_SHARED_SECRET", "").strip() or None

logger = logging.getLogger("enrichment-scraper")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(
    title="NexFlow Enrichment Scraper",
    version=VERSION,
    description="AI-assisted public-web extractor sidecar for the NexFlow waterfall.",
    # Service is mounted at /scraper by the workspace reverse proxy, so all
    # routes must include the /scraper prefix here.
    root_path="",
)

# Server-to-server only — no browser CORS surface needed. We keep the
# middleware mounted but with an empty origin list so a browser can never
# trick a logged-in user into hitting /scraper/extract from another tab.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_methods=["GET", "POST"],
    allow_headers=["X-Sidecar-Token", "Content-Type"],
)


# ─────────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────────
class ExtractRequest(BaseModel):
    url: HttpUrl
    mode: str = Field(
        default="bs4",
        description="bs4 | crawl4ai. Falls back to bs4 if crawl4ai isn't installed.",
    )
    respect_robots: bool = Field(default=True)
    timeout_seconds: int = Field(default=DEFAULT_TIMEOUT, ge=1, le=30)


class StructuredFields(BaseModel):
    company_name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    size_band: Optional[str] = None
    tech_stack: list[str] = Field(default_factory=list)
    headcount_signals: list[str] = Field(default_factory=list)
    news: list[str] = Field(default_factory=list)
    social_links: dict[str, str] = Field(default_factory=dict)
    emails: list[str] = Field(default_factory=list)


class ExtractResponse(BaseModel):
    ok: bool
    url: str
    mode_used: str
    text: Optional[str] = None
    structured: Optional[StructuredFields] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    ok: bool
    version: str
    modes: list[str]
    crawl4ai_available: bool


# ─────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
TECH_HINTS = {
    "React": [r"__NEXT_DATA__", r"window\._react", r"react-dom"],
    "Next.js": [r"__NEXT_DATA__", r"/_next/"],
    "Vue.js": [r"window\.__NUXT__", r"v-cloak"],
    "Angular": [r"ng-version=", r"@angular/"],
    "Wordpress": [r"wp-content", r"/wp-includes/"],
    "Shopify": [r"cdn\.shopify\.com", r"Shopify\.theme"],
    "Webflow": [r"webflow\.io", r"data-wf-page"],
    "Hubspot": [r"hs-scripts\.com", r"_hsq"],
    "Intercom": [r"widget\.intercom\.io"],
    "Segment": [r"cdn\.segment\.com"],
    "Cloudflare": [r"cdn-cgi/"],
}
SIZE_HINTS = [
    (re.compile(r"\b(\d{4,5}\+?)\s+employees", re.I), lambda m: f"{m.group(1)}+ employees"),
    (re.compile(r"\b(1000\s*-\s*5000)\s+employees", re.I), lambda _: "1000-5000 employees"),
    (re.compile(r"\b(500\s*-\s*1000)\s+employees", re.I), lambda _: "500-1000 employees"),
    (re.compile(r"\b(100\s*-\s*500)\s+employees", re.I), lambda _: "100-500 employees"),
    (re.compile(r"\b(50\s*-\s*100)\s+employees", re.I), lambda _: "50-100 employees"),
    (re.compile(r"\b(10\s*-\s*50)\s+employees", re.I), lambda _: "10-50 employees"),
]
INDUSTRY_HINTS = {
    "Fintech": ["fintech", "payments", "banking", "lending", "neobank", "crypto"],
    "SaaS": ["saas", "software-as-a-service", "b2b software", "platform"],
    "E-commerce": ["e-commerce", "ecommerce", "online retail", "marketplace"],
    "Healthcare": ["healthcare", "telehealth", "pharma", "medical device"],
    "Logistics": ["logistics", "supply chain", "shipping", "freight"],
    "Real Estate": ["real estate", "property", "proptech", "broker"],
    "Energy": ["renewable", "solar", "oil & gas", "energy"],
    "Education": ["edtech", "learning", "school", "university"],
}


def _allowed_by_robots(url: str, user_agent: str) -> bool:
    """Best-effort robots.txt check. Failure to fetch -> allowed."""
    try:
        parsed = urllib.parse.urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        return rp.can_fetch(user_agent, url)
    except Exception:  # noqa: BLE001
        return True


def _is_private_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return True  # unparseable → block to be safe
    return (
        addr.is_private
        or addr.is_loopback
        or addr.is_link_local
        or addr.is_reserved
        or addr.is_multicast
        or addr.is_unspecified
    )


def _ssrf_guard(url: str) -> None:
    """Reject URLs that point at private/loopback/cloud-metadata IPs.

    Resolves DNS for the host and blocks if any returned IP is private. Also
    blocks the cloud metadata IP literal 169.254.169.254. Raises HTTPException
    with status 400 on rejection.
    """
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="only http(s) URLs are allowed")
    host = parsed.hostname
    if not host:
        raise HTTPException(status_code=400, detail="missing host")
    # Direct IP literal in URL
    try:
        addr = ipaddress.ip_address(host)
        if _is_private_ip(str(addr)):
            raise HTTPException(status_code=400, detail="blocked: private/loopback IP")
        return
    except ValueError:
        pass
    # Resolve DNS, block if ANY answer is private
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail=f"DNS resolution failed for {host}")
    for info in infos:
        ip = info[4][0]
        if _is_private_ip(ip):
            raise HTTPException(status_code=400, detail=f"blocked: {host} resolves to private IP")


def _fetch(url: str, timeout: int) -> tuple[str, dict[str, str]]:
    """Fetch the URL with manual redirect following so we can SSRF-check each hop."""
    headers = {"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.8"}
    current = url
    for _ in range(MAX_REDIRECTS + 1):
        _ssrf_guard(current)
        r = requests.get(current, headers=headers, timeout=timeout, allow_redirects=False)
        if r.is_redirect or r.status_code in (301, 302, 303, 307, 308):
            loc = r.headers.get("Location")
            if not loc:
                r.raise_for_status()
                return r.text, dict(r.headers)
            current = urllib.parse.urljoin(current, loc)
            continue
        r.raise_for_status()
        return r.text, dict(r.headers)
    raise HTTPException(status_code=400, detail="too many redirects")


def _check_secret(token: Optional[str]) -> None:
    if SHARED_SECRET is None:
        return  # open mode (local dev)
    if not token or token != SHARED_SECRET:
        raise HTTPException(status_code=401, detail="invalid or missing X-Sidecar-Token")


def _extract_structured(html: str, base_url: str) -> StructuredFields:
    soup = BeautifulSoup(html, "lxml")
    out = StructuredFields()

    # Company name: og:site_name → <title> first chunk
    og_site = soup.find("meta", property="og:site_name")
    if og_site and og_site.get("content"):
        out.company_name = og_site["content"].strip()
    elif soup.title and soup.title.string:
        out.company_name = soup.title.string.split("|")[0].split("·")[0].strip() or None

    # Description: og:description → meta description → first <p>
    og_desc = soup.find("meta", property="og:description")
    if og_desc and og_desc.get("content"):
        out.description = og_desc["content"].strip()
    else:
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            out.description = meta_desc["content"].strip()
        else:
            first_p = soup.find("p")
            if first_p and first_p.text:
                out.description = first_p.text.strip()[:280]

    # Industry: regex against full text
    full_text = soup.get_text(separator=" ", strip=True).lower()
    for industry, hints in INDUSTRY_HINTS.items():
        if any(h in full_text for h in hints):
            out.industry = industry
            break

    # Size band: text match
    for pattern, fmt in SIZE_HINTS:
        m = pattern.search(full_text)
        if m:
            out.size_band = fmt(m)
            break

    # Tech stack: search raw HTML for fingerprints
    for tech, patterns in TECH_HINTS.items():
        if any(re.search(p, html) for p in patterns):
            out.tech_stack.append(tech)

    # Headcount signals: look for "we're hiring", "join our team", careers links
    if any(s in full_text for s in ["we're hiring", "we are hiring", "join our team", "careers"]):
        out.headcount_signals.append("Active hiring page detected")
    careers_links = soup.find_all("a", href=re.compile(r"(careers|jobs|hiring)", re.I))
    if careers_links:
        out.headcount_signals.append(f"{len(careers_links)} careers links on homepage")

    # News: <article> headlines or h2/h3 in news/blog sections
    for h in soup.find_all(["h2", "h3"], limit=8):
        txt = h.get_text(strip=True)
        if 12 <= len(txt) <= 140:
            out.news.append(txt)

    # Social links
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "linkedin.com/company" in href and "linkedin" not in out.social_links:
            out.social_links["linkedin"] = href
        elif ("twitter.com/" in href or "x.com/" in href) and "twitter" not in out.social_links:
            out.social_links["twitter"] = href
        elif "github.com/" in href and "github" not in out.social_links:
            out.social_links["github"] = href

    # Emails (deduped, bot-safe — drop obviously masked ones)
    raw_emails = EMAIL_RE.findall(html)
    seen = set()
    for e in raw_emails:
        e = e.lower()
        if e in seen or e.endswith((".png", ".jpg", ".gif")):
            continue
        seen.add(e)
        out.emails.append(e)
    out.emails = out.emails[:5]

    return out


async def _crawl_with_crawl4ai(url: str, timeout: int) -> tuple[str, str]:
    """Returns (text, html) — only invoked when HAS_CRAWL4AI."""
    if not HAS_CRAWL4AI or AsyncWebCrawler is None:  # defensive
        raise RuntimeError("crawl4ai not installed")
    async with AsyncWebCrawler(verbose=False) as crawler:  # type: ignore[misc]
        result = await crawler.arun(url=url, page_timeout=timeout * 1000)
        text = getattr(result, "markdown", "") or getattr(result, "text", "")
        html = getattr(result, "html", "") or ""
        return text, html


# ─────────────────────────────────────────────────────────────────────
# Routes — all served behind the /scraper prefix via the workspace proxy.
# ─────────────────────────────────────────────────────────────────────
@app.get("/scraper/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(
        ok=True,
        version=VERSION,
        modes=["bs4"] + (["crawl4ai"] if HAS_CRAWL4AI else []),
        crawl4ai_available=HAS_CRAWL4AI,
    )


@app.get("/scraper/")
async def index() -> dict[str, Any]:
    return {
        "service": "NexFlow Enrichment Scraper",
        "version": VERSION,
        "endpoints": ["/scraper/health", "/scraper/extract"],
        "crawl4ai_available": HAS_CRAWL4AI,
    }


@app.post("/scraper/extract", response_model=ExtractResponse)
async def extract(
    req: ExtractRequest,
    x_sidecar_token: Optional[str] = Header(default=None, alias="X-Sidecar-Token"),
) -> ExtractResponse:
    _check_secret(x_sidecar_token)
    url_str = str(req.url)
    logger.info("extract url=%s mode=%s", url_str, req.mode)

    # SSRF guard up-front — also re-applied on every redirect inside _fetch.
    _ssrf_guard(url_str)

    if req.respect_robots and not _allowed_by_robots(url_str, USER_AGENT):
        return ExtractResponse(
            ok=False, url=url_str, mode_used="blocked",
            error="Blocked by robots.txt — pass respect_robots=false to override",
        )

    mode_used = "bs4"
    try:
        if req.mode == "crawl4ai" and HAS_CRAWL4AI:
            text, html = await _crawl_with_crawl4ai(url_str, req.timeout_seconds)
            mode_used = "crawl4ai"
        else:
            html, _headers = _fetch(url_str, req.timeout_seconds)
            text = BeautifulSoup(html, "lxml").get_text(separator="\n", strip=True)
    except HTTPException:
        raise
    except requests.HTTPError as e:
        return ExtractResponse(ok=False, url=url_str, mode_used=mode_used, error=f"HTTP {e.response.status_code}")
    except requests.RequestException as e:
        return ExtractResponse(ok=False, url=url_str, mode_used=mode_used, error=f"fetch failed: {e}")
    except Exception as e:  # noqa: BLE001
        logger.exception("extract failed")
        return ExtractResponse(ok=False, url=url_str, mode_used=mode_used, error=str(e))

    structured = _extract_structured(html, url_str)
    return ExtractResponse(
        ok=True,
        url=url_str,
        mode_used=mode_used,
        text=text[:5000] if text else None,
        structured=structured,
    )


# ─────────────────────────────────────────────────────────────────────
# Entrypoint — `python main.py` runs uvicorn directly for ad-hoc testing.
# Production / dev workflow uses `uvicorn main:app ...` instead.
# ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
