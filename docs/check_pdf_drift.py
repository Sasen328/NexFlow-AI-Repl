#!/usr/bin/env python3
"""Fail if any docs markdown file is newer than its matching PDF.

Walks `docs/` (including `docs/business/` and `docs/investor/` subfolders)
for every `*.md` file, then compares its mtime against the sibling `*.pdf`.

Exits non-zero if:
  - a matching PDF is missing entirely, or
  - the markdown's mtime is strictly newer than the PDF's mtime.

Intended to be wired up as a pre-commit hook or CI check via
`pnpm run docs:pdf:check`. When it fails, run `pnpm run docs:pdf` to
re-render the PDFs and commit them alongside the markdown changes.
"""

from __future__ import annotations

import sys
from pathlib import Path

DOCS_DIR = Path(__file__).resolve().parent


def _collect_md_files() -> list[Path]:
    files: list[Path] = sorted(DOCS_DIR.glob("*.md"))
    for sub in ("business", "investor"):
        sub_dir = DOCS_DIR / sub
        if sub_dir.is_dir():
            files += sorted(sub_dir.glob("*.md"))
    return files


def main() -> int:
    drift: list[str] = []
    missing: list[str] = []

    for md in _collect_md_files():
        pdf = md.with_suffix(".pdf")
        rel = md.relative_to(DOCS_DIR.parent)
        if not pdf.exists():
            missing.append(str(rel))
            continue
        if md.stat().st_mtime > pdf.stat().st_mtime:
            drift.append(str(rel))

    if not missing and not drift:
        print("docs PDFs are in sync with markdown sources.")
        return 0

    if missing:
        print("Missing PDF for:", file=sys.stderr)
        for path in missing:
            print(f"  - {path}", file=sys.stderr)
    if drift:
        print("Markdown is newer than PDF for:", file=sys.stderr)
        for path in drift:
            print(f"  - {path}", file=sys.stderr)
    print(
        "\nRun `pnpm run docs:pdf` to re-render and commit the updated PDFs.",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    sys.exit(main())
