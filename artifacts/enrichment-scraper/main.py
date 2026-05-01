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

Modes
-----
bs4           : BeautifulSoup4 + requests (lightweight, fast, default)
playwright    : Headless Chromium via Playwright (JS-rendered pages)
stealth       : Playwright + playwright-stealth evasion (bot-detection bypass)
crawl4ai      : Crawl4AI async crawler (Markdown output, optional)
"""

from __future__ import annotations

import asyncio
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

# ─── Optional Playwright ──────────────────────────────────────────────────────
try:
    from playwright.async_api import async_playwright  # type: ignore[import-not-found]
    HAS_PLAYWRIGHT = True
except Exception:
    async_playwright = None  # type: ignore[assignment]
    HAS_PLAYWRIGHT = False

# ─── Optional playwright-stealth ─────────────────────────────────────────────
try:
    from playwright_stealth.stealth import Stealth as _Stealth  # type: ignore[import-not-found]
    HAS_STEALTH = True
except Exception:
    _Stealth = None  # type: ignore[assignment]
    HAS_STEALTH = False

# ─── Optional Crawl4AI ───────────────────────────────────────────────────────
try:
    from crawl4ai import AsyncWebCrawler  # type: ignore[import-not-found]
    HAS_CRAWL4AI = True
except Exception:
    AsyncWebCrawler = None  # type: ignore[assignment]
    HAS_CRAWL4AI = False

VERSION = "2.0.0"
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)
NEXFLOW_UA = (
    "NexFlow-Enrichment-Scraper/2.0 "
    "(+https://nexflow.replit.app; contact: ops@nexflow.io)"
)
DEFAULT_TIMEOUT = 15
MAX_REDIRECTS = 5

SHARED_SECRET = os.environ.get("SCRAPER_SHARED_SECRET", "").strip() or None

logger = logging.getLogger("enrichment-scraper")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

app = FastAPI(
    title="NexFlow Enrichment Scraper",
    version=VERSION,
    description="Multi-engine web extractor sidecar: BS4 + Playwright + Stealth + Crawl4AI.",
    root_path="",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_methods=["GET", "POST"],
    allow_headers=["X-Sidecar-Token", "Content-Type"],
)


# ─── Schemas ─────────────────────────────────────────────────────────────────
class ExtractRequest(BaseModel):
    url: HttpUrl
    mode: str = Field(
        default="bs4",
        description="bs4 | playwright | stealth | crawl4ai — falls back to bs4 if engine unavailable.",
    )
    respect_robots: bool = Field(default=True)
    timeout_seconds: int = Field(default=DEFAULT_TIMEOUT, ge=1, le=60)


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
    playwright_available: bool
    stealth_available: bool
    crawl4ai_available: bool


# ─── Helpers ─────────────────────────────────────────────────────────────────
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
    "Finance": ["wealth management", "asset management", "investment", "fund"],
    "Insurance": ["insurance", "takaful", "reinsurance"],
}


def _allowed_by_robots(url: str, user_agent: str) -> bool:
    try:
        parsed = urllib.parse.urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = urllib.robotparser.RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        return rp.can_fetch(user_agent, url)
    except Exception:
        return True


def _is_private_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return True
    return (
        addr.is_private or addr.is_loopback or addr.is_link_local
        or addr.is_reserved or addr.is_multicast or addr.is_unspecified
    )


def _ssrf_guard(url: str) -> None:
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="only http(s) URLs are allowed")
    host = parsed.hostname
    if not host:
        raise HTTPException(status_code=400, detail="missing host")
    try:
        addr = ipaddress.ip_address(host)
        if _is_private_ip(str(addr)):
            raise HTTPException(status_code=400, detail="blocked: private/loopback IP")
        return
    except ValueError:
        pass
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail=f"DNS resolution failed for {host}")
    for info in infos:
        ip = info[4][0]
        if _is_private_ip(ip):
            raise HTTPException(status_code=400, detail=f"blocked: {host} resolves to private IP")


def _fetch(url: str, timeout: int) -> tuple[str, dict[str, str]]:
    headers = {
        "User-Agent": USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
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
        return
    if not token or token != SHARED_SECRET:
        raise HTTPException(status_code=401, detail="invalid or missing X-Sidecar-Token")


def _extract_structured(html: str, base_url: str) -> StructuredFields:
    soup = BeautifulSoup(html, "lxml")
    out = StructuredFields()

    og_site = soup.find("meta", property="og:site_name")
    if og_site and og_site.get("content"):
        out.company_name = og_site["content"].strip()
    elif soup.title and soup.title.string:
        out.company_name = soup.title.string.split("|")[0].split("·")[0].strip() or None

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

    full_text = soup.get_text(separator=" ", strip=True).lower()
    for industry, hints in INDUSTRY_HINTS.items():
        if any(h in full_text for h in hints):
            out.industry = industry
            break

    for pattern, fmt in SIZE_HINTS:
        m = pattern.search(full_text)
        if m:
            out.size_band = fmt(m)
            break

    for tech, patterns in TECH_HINTS.items():
        if any(re.search(p, html) for p in patterns):
            out.tech_stack.append(tech)

    if any(s in full_text for s in ["we're hiring", "we are hiring", "join our team", "careers"]):
        out.headcount_signals.append("Active hiring page detected")
    careers_links = soup.find_all("a", href=re.compile(r"(careers|jobs|hiring)", re.I))
    if careers_links:
        out.headcount_signals.append(f"{len(careers_links)} careers links on homepage")

    for h in soup.find_all(["h2", "h3"], limit=8):
        txt = h.get_text(strip=True)
        if 12 <= len(txt) <= 140:
            out.news.append(txt)

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "linkedin.com/company" in href and "linkedin" not in out.social_links:
            out.social_links["linkedin"] = href
        elif ("twitter.com/" in href or "x.com/" in href) and "twitter" not in out.social_links:
            out.social_links["twitter"] = href
        elif "github.com/" in href and "github" not in out.social_links:
            out.social_links["github"] = href

    raw_emails = EMAIL_RE.findall(html)
    seen: set[str] = set()
    for e in raw_emails:
        e = e.lower()
        if e in seen or e.endswith((".png", ".jpg", ".gif")):
            continue
        seen.add(e)
        out.emails.append(e)
    out.emails = out.emails[:5]

    return out


# ─── Engine implementations ──────────────────────────────────────────────────

async def _crawl_bs4(url: str, timeout: int) -> tuple[str, str]:
    """BeautifulSoup4 via requests — fast, no browser needed."""
    html, _ = _fetch(url, timeout)
    text = BeautifulSoup(html, "lxml").get_text(separator="\n", strip=True)
    return text, html


async def _crawl_playwright(url: str, timeout: int, use_stealth: bool = False) -> tuple[str, str]:
    """Headless Chromium via Playwright — renders JavaScript."""
    if not HAS_PLAYWRIGHT or async_playwright is None:
        raise RuntimeError("playwright not installed")
    _ssrf_guard(url)
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
        )
        try:
            context = await browser.new_context(
                user_agent=USER_AGENT,
                locale="en-US",
                viewport={"width": 1280, "height": 800},
                extra_http_headers={
                    "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
                },
            )
            page = await context.new_page()

            if use_stealth and HAS_STEALTH and _Stealth is not None:
                await _Stealth().apply_stealth_async(page)

            await page.goto(url, wait_until="networkidle", timeout=timeout * 1000)
            html = await page.content()
            text = await page.evaluate("() => document.body.innerText")
            return text or "", html or ""
        finally:
            await browser.close()


async def _crawl_crawl4ai(url: str, timeout: int) -> tuple[str, str]:
    """Crawl4AI async crawler — returns Markdown + raw HTML."""
    if not HAS_CRAWL4AI or AsyncWebCrawler is None:
        raise RuntimeError("crawl4ai not installed")
    async with AsyncWebCrawler(verbose=False) as crawler:
        result = await crawler.arun(url=url, page_timeout=timeout * 1000)
        text = getattr(result, "markdown", "") or getattr(result, "text", "") or ""
        html = getattr(result, "html", "") or ""
        return text, html


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/scraper/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    modes = ["bs4"]
    if HAS_PLAYWRIGHT:
        modes.append("playwright")
        if HAS_STEALTH:
            modes.append("stealth")
    if HAS_CRAWL4AI:
        modes.append("crawl4ai")
    return HealthResponse(
        ok=True,
        version=VERSION,
        modes=modes,
        playwright_available=HAS_PLAYWRIGHT,
        stealth_available=HAS_STEALTH,
        crawl4ai_available=HAS_CRAWL4AI,
    )


@app.get("/scraper/")
async def index() -> dict[str, Any]:
    return {
        "service": "NexFlow Enrichment Scraper",
        "version": VERSION,
        "engines": {
            "bs4": True,
            "playwright": HAS_PLAYWRIGHT,
            "stealth": HAS_PLAYWRIGHT and HAS_STEALTH,
            "crawl4ai": HAS_CRAWL4AI,
        },
        "endpoints": ["/scraper/health", "/scraper/extract"],
    }


@app.post("/scraper/extract", response_model=ExtractResponse)
async def extract(
    req: ExtractRequest,
    x_sidecar_token: Optional[str] = Header(default=None, alias="X-Sidecar-Token"),
) -> ExtractResponse:
    _check_secret(x_sidecar_token)
    url_str = str(req.url)
    logger.info("extract url=%s mode=%s", url_str, req.mode)

    _ssrf_guard(url_str)

    if req.respect_robots and not _allowed_by_robots(url_str, NEXFLOW_UA):
        return ExtractResponse(
            ok=False, url=url_str, mode_used="blocked",
            error="Blocked by robots.txt — pass respect_robots=false to override",
        )

    mode = req.mode
    mode_used = "bs4"
    text = ""
    html = ""

    try:
        if mode == "stealth" and HAS_PLAYWRIGHT and HAS_STEALTH:
            text, html = await _crawl_playwright(url_str, req.timeout_seconds, use_stealth=True)
            mode_used = "stealth"
        elif mode == "playwright" and HAS_PLAYWRIGHT:
            text, html = await _crawl_playwright(url_str, req.timeout_seconds, use_stealth=False)
            mode_used = "playwright"
        elif mode == "crawl4ai" and HAS_CRAWL4AI:
            text, html = await _crawl_crawl4ai(url_str, req.timeout_seconds)
            mode_used = "crawl4ai"
        else:
            # bs4 default (also fallback for any unavailable engine)
            if mode not in ("bs4",):
                logger.warning("engine '%s' unavailable, falling back to bs4", mode)
            text, html = await _crawl_bs4(url_str, req.timeout_seconds)
            mode_used = "bs4"

    except HTTPException:
        raise
    except requests.HTTPError as e:
        return ExtractResponse(ok=False, url=url_str, mode_used=mode_used,
                               error=f"HTTP {e.response.status_code}")
    except requests.RequestException as e:
        return ExtractResponse(ok=False, url=url_str, mode_used=mode_used,
                               error=f"fetch failed: {e}")
    except Exception as e:
        logger.exception("extract failed")
        # Try BS4 fallback if a browser engine failed
        if mode_used != "bs4":
            try:
                text, html = await _crawl_bs4(url_str, req.timeout_seconds)
                mode_used = "bs4_fallback"
                logger.info("browser engine failed, bs4 fallback succeeded")
            except Exception as e2:
                return ExtractResponse(ok=False, url=url_str, mode_used=mode_used,
                                       error=f"{mode} failed: {e}; bs4 fallback also failed: {e2}")
        else:
            return ExtractResponse(ok=False, url=url_str, mode_used=mode_used, error=str(e))

    structured = _extract_structured(html, url_str)
    return ExtractResponse(
        ok=True,
        url=url_str,
        mode_used=mode_used,
        text=text[:6000] if text else None,
        structured=structured,
    )


# ─── Entrypoint ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
