# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-provider certification exam study site. Browser-based practice quizzes backed by JSON question banks. The shared quiz engine, loader, navigation, persistence, and hint system are provider-agnostic — new providers plug in by adding data and a provider page.

## Commands

```bash
npm start                    # http-server on port 8080, opens browser
npm test                     # vitest run (all tests)
npm run test:watch           # vitest in watch mode
npm run test:coverage        # vitest with v8 coverage
npx vitest run tests/unit/quiz-engine.test.js  # single test file
```

No build step — pure static site. Tests use vitest + jsdom (configured in `vitest.config.js`). ESM imports from `https://esm.sh/` are aliased to node_modules in the vitest config.

## Current Providers (10)

| Provider | Prefix pattern | Landing page | Data dir |
|----------|---------------|--------------|----------|
| Azure | `az-*`, `dp-*`, `ai-*`, `sc-*` | `azure.html` | `data/azure/` |
| AWS | `clf-*`, `saa-*`, `dva-*`, `soa-*`, `dea-*`, `mla-*`, `aif-*`, `aip-*`, `sap-*` | `aws.html` | `data/aws/` |
| GCP | `gcp-*`, `cloud-data-engineer`, `gen-ai-leader`, `pro-ml-eng` | `gcp.html` | `data/gcp/` |
| Anthropic | `cca-*` | `anthropic.html` | `data/anthropic/` |
| CompTIA | `sy0-*`, `cas-*`, `cv0-*`, `core*`, `pt0-*`, `cs0-*` | `comptia.html` | `data/comptia/` |
| ISC2 | `cissp`, `ccsp`, `sscp`, `cap` | `isc2.html` | `data/isc2/` |
| GitHub | `gh-*` | `github.html` | `data/github/` |
| Databricks | `db-*` | `databricks.html` | `data/databricks/` |
| NVIDIA | `nv-*` | `nvidia.html` | `data/nvidia/` |
| Cisco | `810-*`, `aitech` | `cisco.html` | `data/cisco/` |

## Architecture

### Core JS modules (all ES modules in `js/`)

- **`app.js`** — Quiz page controller. `getProviderFromExam()` maps exam-code prefixes to provider keys (used for back-links, branding, data paths). `QuizApp` class orchestrates DOM, engine, loader, and progress tracker. Also exports `sanitizeHTML()` for safe innerHTML rendering.
- **`exam-loader.js`** — Fetches JSON exam files, validates against `data/schema/certification.schema.json` using Ajv 2020-12 (loaded from esm.sh in browser, aliased in vitest). Caches schema after first load.
- **`quiz-engine.js`** — Stateless quiz logic: scoring, answer checking, hint progression, question navigation. No DOM dependency.
- **`progress-tracker.js`** — localStorage persistence. Saves/restores quiz state keyed by exam code. Handles migration of old storage formats.
- **`results-app.js`** — Results page controller (`results.html`). Shows score, category/difficulty breakdowns, timeline, and per-question detail.

### Design system: Atlas (`system/`)

- `system/tokens.css` — CSS custom properties (colors, spacing, typography, radii)
- `system/system.css` — Base component styles (nav, cards, buttons, layout)
- All pages use Atlas tokens. Provider pages bridge legacy CSS vars to Atlas tokens where needed.

### Data format

Exam data is JSON at `data/{provider}/{exam-code}.json`, validated against `data/schema/certification.schema.json`.

### Key pages

- `index.html` — Provider selection landing page
- `{provider}.html` — Exam card listing for a provider
- `quiz.html?exam={exam-code}` — Quiz interface (loads JSON from `data/{provider}/{exam-code}.json`)
- `results.html` — Post-quiz results with breakdowns

### Adding a New Provider

1. Create `{provider}.html` (copy an existing provider page, update branding)
2. Add provider card to `index.html`
3. Register in `js/app.js`: add prefix matching to `getProviderFromExam()`, add entries to `setBackLinks()` and `updateExamInfo()`
4. Create `data/{provider}/` with JSON exam files matching `data/schema/certification.schema.json`

### Scripts (`scripts/`)

- `accessibility-audit.js` — Runs axe-core accessibility checks

## Decision-Making

When facing architectural or implementation choices:
1. Choose the best option based on project constraints (simplicity, determinism, restart-safety)
2. Document the decision in `docs/todo.md` under "Resolved Decisions"
3. Prefer: simplicity over cleverness, determinism over parallelism, file-based over networked

## Invariants

- Never delete user data; only move or rename
- Processing must be idempotent and restart-safe
- Completed outputs must never be silently overwritten
- New providers must not introduce provider-specific rendering, storage, or navigation logic
