#!/usr/bin/env python3
"""Render every docs/*.md file to a branded NexFlow PDF.

Pipeline:
- Markdown -> HTML via the `markdown` library (with the `tables`, `fenced_code`,
  `toc`, and `attr_list` extensions enabled).
- HTML -> PDF via WeasyPrint, applying the NexFlow brand stylesheet defined
  inline below: chameleon palette accents, page numbers, table of contents,
  and the NexFlow logo header on every page.

Inputs:  docs/*.md (excluding README.md? -> README is included too).
Outputs: docs/<same-name>.pdf
"""

from __future__ import annotations

import re
from pathlib import Path

import markdown
from weasyprint import HTML, CSS

DOCS_DIR = Path(__file__).resolve().parent
ASSETS_DIR = DOCS_DIR / "assets"

# Chameleon palette (mirror of docs/01-brand-palette-motion.md)
PALETTE = {
    "primary":   "#B8A0C8",
    "secondary": "#C0A0B8",
    "growth":    "#88B8B0",
    "wealth":    "#C8A880",
    "interface": "#90B8B8",
    "highlight": "#B8B880",
    "base":      "#F5F2F6",
    "ink":       "#3E2F4A",
}

LOGO_FULL = (ASSETS_DIR / "logo_full.png").as_uri()
LOGO_MARK = (ASSETS_DIR / "logo_mark.png").as_uri()

BRAND_CSS = f"""
@page {{
    size: A4;
    margin: 26mm 18mm 22mm 18mm;

    @top-left {{
        content: "";
        background: url('{LOGO_MARK}') no-repeat left center;
        background-size: 14mm 14mm;
        width: 14mm;
        height: 16mm;
    }}
    @top-center {{
        content: string(doc-title);
        font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 9pt;
        color: {PALETTE['ink']};
        letter-spacing: 0.06em;
        text-transform: uppercase;
        font-weight: 600;
    }}
    @top-right {{
        content: "NexFlow";
        font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 9pt;
        color: {PALETTE['primary']};
        letter-spacing: 0.18em;
        font-weight: 700;
    }}
    @bottom-left {{
        content: "Confidential — © NexFlow";
        font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 8pt;
        color: #888;
    }}
    @bottom-right {{
        content: "Page " counter(page) " of " counter(pages);
        font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;
        font-size: 8pt;
        color: #888;
    }}
}}

@page :first {{
    margin: 0;
    @top-left {{ content: ""; background: none; }}
    @top-center {{ content: ""; }}
    @top-right {{ content: ""; }}
    @bottom-left {{ content: ""; }}
    @bottom-right {{ content: ""; }}
}}

html {{
    string-set: doc-title attr(data-doc-title);
}}

body {{
    font-family: 'Inter', 'Segoe UI', Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: {PALETTE['ink']};
    background: white;
}}

/* ── Cover page ──────────────────────────────────────────────────────────── */
.cover {{
    page: cover;
    page-break-after: always;
    height: 297mm;
    position: relative;
    color: {PALETTE['ink']};
    background:
        radial-gradient(circle at 12% 18%, {PALETTE['primary']}55 0%, transparent 60%),
        radial-gradient(circle at 88% 22%, {PALETTE['growth']}48 0%, transparent 62%),
        radial-gradient(circle at 30% 78%, {PALETTE['wealth']}42 0%, transparent 58%),
        radial-gradient(circle at 78% 82%, {PALETTE['secondary']}45 0%, transparent 60%),
        {PALETTE['base']};
    padding: 38mm 22mm;
    box-sizing: border-box;
}}
.cover .mark {{
    width: 40mm;
}}
.cover h1 {{
    font-size: 38pt;
    line-height: 1.05;
    margin: 28mm 0 6mm 0;
    font-weight: 900;
    color: {PALETTE['ink']};
    letter-spacing: -0.01em;
}}
.cover .subtitle {{
    font-size: 13pt;
    color: {PALETTE['ink']};
    opacity: 0.78;
    max-width: 130mm;
    margin-bottom: 18mm;
}}
.cover .meta {{
    position: absolute;
    bottom: 28mm;
    left: 22mm;
    right: 22mm;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 9pt;
    color: {PALETTE['ink']};
    text-transform: uppercase;
    letter-spacing: 0.18em;
    font-weight: 700;
}}
.cover .swatches {{
    position: absolute;
    bottom: 22mm;
    right: 22mm;
    display: flex;
    gap: 4mm;
}}
.cover .swatches span {{
    display: inline-block;
    width: 8mm;
    height: 8mm;
    border-radius: 2mm;
    box-shadow: 0 1px 3px rgba(62,47,74,0.18);
}}

/* ── Body ────────────────────────────────────────────────────────────────── */
h1, h2, h3, h4, h5 {{
    font-weight: 800;
    color: {PALETTE['ink']};
    line-height: 1.2;
}}
h1 {{
    font-size: 22pt;
    margin: 14mm 0 5mm 0;
    border-bottom: 0.6mm solid {PALETTE['primary']};
    padding-bottom: 2mm;
    page-break-before: always;
}}
h1:first-of-type {{ page-break-before: auto; }}
h2 {{
    font-size: 15pt;
    margin: 9mm 0 3mm 0;
    color: {PALETTE['ink']};
}}
h2::before {{
    content: "";
    display: inline-block;
    width: 3mm;
    height: 3mm;
    border-radius: 0.8mm;
    background: linear-gradient(135deg, {PALETTE['primary']}, {PALETTE['growth']}, {PALETTE['wealth']});
    margin-right: 3mm;
    transform: translateY(-0.5mm);
}}
h3 {{
    font-size: 12pt;
    margin: 6mm 0 2mm 0;
    color: {PALETTE['primary']};
}}
h4 {{
    font-size: 10.5pt;
    margin: 4mm 0 1.5mm 0;
    color: {PALETTE['ink']};
    text-transform: uppercase;
    letter-spacing: 0.06em;
}}
p {{ margin: 0 0 3mm 0; }}
ul, ol {{ margin: 0 0 4mm 6mm; padding: 0; }}
li {{ margin: 0 0 1.2mm 0; }}
strong {{ color: {PALETTE['ink']}; font-weight: 700; }}
em {{ color: {PALETTE['ink']}; }}
a {{ color: {PALETTE['primary']}; text-decoration: none; }}
hr {{
    border: none;
    border-top: 0.3mm solid #e3dde6;
    margin: 5mm 0;
}}

blockquote {{
    margin: 4mm 0;
    padding: 3mm 4mm;
    border-left: 1mm solid {PALETTE['primary']};
    background: {PALETTE['primary']}10;
    color: {PALETTE['ink']};
    font-style: normal;
    border-radius: 0 1.5mm 1.5mm 0;
}}
blockquote p:last-child {{ margin-bottom: 0; }}

table {{
    width: 100%;
    border-collapse: collapse;
    margin: 3mm 0 5mm 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
}}
th, td {{
    border: 0.15mm solid #e3dde6;
    padding: 1.6mm 2mm;
    text-align: left;
    vertical-align: top;
}}
thead th {{
    background: {PALETTE['primary']}22;
    color: {PALETTE['ink']};
    font-weight: 700;
    text-transform: uppercase;
    font-size: 8.5pt;
    letter-spacing: 0.04em;
}}
tbody tr:nth-child(even) td {{ background: {PALETTE['base']}; }}

code {{
    font-family: 'Menlo', 'Consolas', 'Courier New', monospace;
    font-size: 9pt;
    background: {PALETTE['interface']}22;
    padding: 0.5mm 1.2mm;
    border-radius: 1mm;
    color: {PALETTE['ink']};
}}
pre {{
    background: {PALETTE['ink']};
    color: {PALETTE['base']};
    padding: 3mm 4mm;
    border-radius: 1.5mm;
    overflow: hidden;
    font-size: 8.8pt;
    line-height: 1.5;
    page-break-inside: avoid;
    margin: 3mm 0 5mm 0;
}}
pre code {{
    background: transparent;
    color: {PALETTE['base']};
    padding: 0;
    font-size: 8.8pt;
}}

img {{ max-width: 100%; }}

/* TOC */
nav.toc {{
    page-break-after: always;
    padding: 4mm 0;
}}
nav.toc h2 {{
    font-size: 18pt;
    margin-top: 0;
    border-bottom: 0.4mm solid {PALETTE['primary']};
    padding-bottom: 2mm;
}}
nav.toc h2::before {{ display: none; }}
nav.toc ul {{ list-style: none; padding-left: 0; margin-left: 0; }}
nav.toc ul ul {{ padding-left: 6mm; }}
nav.toc li {{
    margin: 1.2mm 0;
    border-bottom: 0.1mm dotted #d6cdd9;
    padding: 0.6mm 0;
}}
nav.toc a {{
    color: {PALETTE['ink']};
    font-weight: 500;
    text-decoration: none;
}}
nav.toc li.toc-h1 > a {{ font-weight: 800; color: {PALETTE['primary']}; }}
nav.toc li.toc-h2 > a {{ font-weight: 600; }}
nav.toc li.toc-h3 > a {{ color: {PALETTE['ink']}88; font-size: 9.5pt; }}

/* Color swatches inside the brand doc */
span[style*="background:"] {{ vertical-align: middle; }}
"""


def render_md_to_html_body(md_text: str) -> tuple[str, str]:
    """Return (rendered_html_body, doc_title) for the given markdown."""
    md = markdown.Markdown(
        extensions=[
            "tables",
            "fenced_code",
            "toc",
            "attr_list",
            "sane_lists",
        ],
        extension_configs={
            "toc": {
                "toc_depth": "1-3",
                "anchorlink": False,
                "permalink": False,
            },
        },
    )
    html_body = md.convert(md_text)
    toc_html = md.toc

    # Doc title from the first H1 of the markdown
    m = re.search(r"^#\s+(.*?)$", md_text, re.MULTILINE)
    doc_title = m.group(1).strip() if m else "NexFlow Documentation"
    return html_body, doc_title, toc_html  # type: ignore[return-value]


def build_full_html(md_text: str, doc_title: str) -> str:
    body, doc_title_extracted, toc = render_md_to_html_body(md_text)
    title = doc_title_extracted or doc_title

    # Subtitle = the first blockquote (if any) used as a `> Document scope:` line.
    subtitle = ""
    m = re.search(r"^>\s*\*\*Document scope:\*\*\s*(.+?)$", md_text, re.MULTILINE)
    if m:
        subtitle = m.group(1).strip()
    else:
        m = re.search(r"^>\s*(.+?)$", md_text, re.MULTILINE)
        if m:
            subtitle = m.group(1).strip()

    # Strip the leading "# Title" because the cover takes its place.
    body = re.sub(r"^<h1[^>]*>.*?</h1>", "", body, count=1, flags=re.DOTALL)

    swatches = "".join(
        f'<span style="background:{c};"></span>'
        for c in (
            PALETTE["primary"], PALETTE["secondary"], PALETTE["growth"],
            PALETTE["wealth"], PALETTE["interface"], PALETTE["highlight"],
        )
    )

    return f"""<!doctype html>
<html data-doc-title="{title}">
<head><meta charset="utf-8"><title>{title}</title></head>
<body>
  <section class="cover">
    <img src="{LOGO_FULL}" class="mark" alt="NexFlow" />
    <h1>{title}</h1>
    <div class="subtitle">{subtitle}</div>
    <div class="meta">
      <div>NexFlow Documentation Bundle</div>
      <div>Confidential — internal & design-partner use</div>
    </div>
    <div class="swatches">{swatches}</div>
  </section>

  <nav class="toc">
    <h2>Contents</h2>
    {toc}
  </nav>

  <main>
    {body}
  </main>
</body>
</html>"""


def render_one(md_path: Path) -> Path:
    out_path = md_path.with_suffix(".pdf")
    md_text = md_path.read_text(encoding="utf-8")
    full_html = build_full_html(md_text, doc_title=md_path.stem)
    HTML(string=full_html, base_url=str(DOCS_DIR)).write_pdf(
        target=str(out_path),
        stylesheets=[CSS(string=BRAND_CSS)],
    )
    return out_path


def main() -> None:
    md_files = sorted(p for p in DOCS_DIR.glob("*.md"))
    if not md_files:
        print("No markdown files found.")
        return
    print(f"Rendering {len(md_files)} markdown files to PDF…")
    for md in md_files:
        try:
            out = render_one(md)
            print(f"  ✓ {md.name}  ->  {out.name}")
        except Exception as e:
            print(f"  ✗ {md.name}  FAILED: {e}")
            raise


if __name__ == "__main__":
    main()
