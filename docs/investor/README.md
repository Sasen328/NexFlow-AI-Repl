# NexFlow Investor Materials

> **Document scope:** Index for the NexFlow pre-seed investor pack. All four documents and the slide deck reconcile to a single financial model and tell one consistent story.

This folder is the single source of truth for the NexFlow pre-seed round. It is designed to be sent as a complete bundle to investors, advisors, and design partners.

---

## What's inside

| # | Document | Format | Audience | Purpose |
| --- | --- | --- | --- | --- |
| 01 | **NexFlow Investor Deck — High Level** | `.pptx` + `.pdf` | First-meeting investors | 15-slide pitch deck. Read in 10 minutes; presented in 20. |
| 02 | **Investor Deep-Dive** | `.md` + `.pdf` | CRM-savvy investors doing diligence | Long-form thesis, market sizing, product architecture, returns math. |
| 03 | **Feasibility Study** | `.md` + `.pdf` | Strategic partners, syndicate leads | Refreshed feasibility analysis across market, product, regulation, financials, operations, risk. |
| 04 | **Three-Year Financial Plan** | `.md` + `.pdf` | CFOs, finance-led investors, model reviewers | Line-by-line walk-through of the financial model with sensitivities and KPI commitments. |

---

## How to read the pack

- **First meeting?** Open `01-investor-highlevel.pdf` and skim. 10 minutes.
- **Sufficiently interested to dig in?** Read `02-investor-deep-dive.pdf` end-to-end. ~25 minutes. This is the document we wrote for the investor who has seen 100 CRMs and wants to know why this one is different.
- **Diligence stage?** `03-feasibility-study.pdf` covers the operational and regulatory fit; `04-three-year-financial-plan.pdf` is the model in narrative form. Together they answer the questions a serious investor will ask before wiring.

All four documents are individually self-contained — none requires the others to make sense — but all four together form a coherent investment case.

---

## Reconciliation guarantee

Every numerical figure in the deck and the three accompanying documents ties to the same single source of truth: the NexFlow three-year financial model. If you find a number that contradicts the model, treat it as a typo in the document and flag it — the model is canonical.

Key reference figures, used everywhere:

- **Pre-seed round:** $100K on a $1.5M pre-money SAFE (~6.25% on conversion).
- **Year 1:** 1,200 paying customers (~6,000 seats) · $59.10 blended ARPU per seat / mo · $4.26M ARR · $1.68M revenue · 77% GM · $1.23M EBITDA · $0.98M NI.
- **Year 2:** 6,200 paying customers (~43,400 seats) · $69.75 blended ARPU per seat / mo · $36.33M ARR · $19.72M revenue · 79% GM · $15.42M EBITDA · $12.34M NI.
- **Year 3:** 19,200 paying customers (~192,000 seats) · $77.40 blended ARPU per seat / mo · $178.33M ARR · $110.66M revenue · 81% GM · $89.23M EBITDA · $71.38M NI.
- **Returns (illustrative, post-dilution):** $100K SAFE returns **~89x** (8x ARR exit), **~134x** (12x ARR), or **~200x** (18x ARR) at a Year-3 exit, assuming the pre-seed stake is diluted ~10x through subsequent Series A/B/C rounds — consistent with the 89x–200x range stated in the source feasibility study. The model's literal cap-table MOIC (no dilution) is roughly 10x larger and is shown alongside in `02-investor-deep-dive.md` §11 and `04-three-year-financial-plan.md` §8 as a sanity check on the model arithmetic.

---

## Regenerating these files

The high-level deck lives as a slides artifact in this monorepo at `artifacts/investor-deck/`. To re-export PPTX or PDF after editing the deck source, use the standard slides export flow and drop the result into this folder as `01-investor-highlevel.pptx` / `01-investor-highlevel.pdf`.

The three markdown documents (`02`, `03`, `04`) are rendered to PDF by the workspace-wide branded PDF renderer:

```bash
python3 docs/render_pdf.py
```

This script picks up every `*.md` under `docs/`, `docs/business/`, and `docs/investor/` and writes branded PDFs alongside each markdown source. The `README.md` in this folder is also rendered as part of the bundle.

---

## Contact

For diligence access (model, customer interviews, technical walk-through), please reach out to `founders@nexflow.sa`.

> **Confidential.** Pre-seed investor use only. Please do not redistribute without permission.
