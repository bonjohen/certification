# Atlas Redesign — Implementation Plan

**Source document:** `docs/atlas_redesign_pdr.md`

## Work Queue Instructions

### State Transitions

Open  ──>  Started  ──>  Completed
              │
              └──>  Blocked  ──>  Started  ──>  Completed

- **Open**: Not yet begun.
- **Started**: Actively in progress. Record the start datetime (PST).
- **Completed**: Done and verified. Record the completion datetime (PST).
- **Blocked**: Cannot proceed; note the blocker in the description.

### Commit Protocol

1. Work through all tasks in a phase.
2. When every task reaches Completed, write the Phase Summary.
3. Stage and commit all changes for the phase. Do not push.
4. Proceed immediately to the next phase.

## Technology Stack (Additive)

| Concern | Choice |
|---------|--------|
| Styling | CSS custom properties via `system/tokens.css` + `system/system.css` |
| Layout | CSS Grid + Flexbox |
| Theme | `data-theme="dark"` attribute + localStorage |
| Fonts | Google Fonts (Source Serif 4, Inter Tight, JetBrains Mono) via system.css |
| Interactivity | Vanilla JS (filter chips, theme toggle) |

---

## Phase 1: Token Additions + Landing Page

**Goal:** Add missing provider color tokens and rebuild `index.html` as the Atlas landing page.
**Depends on:** Nothing (first phase).

| # | Status | Started (PST) | Completed (PST) | Description |
|---|--------|---------------|------------------|-------------|
| 1.1 | Open | | | Add missing provider colors to `system/tokens.css`: `--p-github: #1F2328`, `--p-databricks: #FF3621`, `--p-nvidia: #76B900`, `--p-isc2: #003366` |
| 1.2 | Open | | | Rebuild `index.html` using Atlas system: site-nav, hero with display title + stats, 5-column provider grid (.pcard pattern from redesign deck), theme toggle, responsive breakpoints |
| 1.3 | Open | | | Verify: all 10 provider cards link correctly, dark mode works, responsive at 768px/480px |
| 1.4 | Open | | | Stage and commit Phase 1 |

### Phase 1 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Port landing page to Atlas design system with provider grid`

---

## Phase 2: Provider Pages — Batch 1 (AWS, GCP, Anthropic)

**Goal:** Port the three largest/most-complex provider pages to Atlas.
**Depends on:** Phase 1 (tokens updated).

| # | Status | Started (PST) | Completed (PST) | Description |
|---|--------|---------------|------------------|-------------|
| 2.1 | Open | | | Rebuild `aws.html` from azure.html template: 10 exams, 3 level sections (Foundational, Associate, Professional), badge states (new, retired), retirement note on SOA-C02 |
| 2.2 | Open | | | Rebuild `gcp.html` from azure.html template: 15 exams, multiple level sections, badge states (new, training-only, exam-prep), refresh note on pro-ml-eng |
| 2.3 | Open | | | Rebuild `anthropic.html` from azure.html template: 1 exam, single section, source-needed badge |
| 2.4 | Open | | | Verify: all exam links work (`quiz.html?exam=`), filters toggle correctly, dark mode, responsive |
| 2.5 | Open | | | Stage and commit Phase 2 |

### Phase 2 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Port AWS, GCP, Anthropic provider pages to Atlas`

---

## Phase 3: Provider Pages — Batch 2 (CompTIA, ISC2, GitHub, Databricks, NVIDIA, Cisco)

**Goal:** Port the remaining 6 simpler provider pages (1-2 exams each).
**Depends on:** Phase 2 (pattern validated on complex pages).

| # | Status | Started (PST) | Completed (PST) | Description |
|---|--------|---------------|------------------|-------------|
| 3.1 | Open | | | Rebuild `comptia.html`: 1 exam (SY0-701), Intermediate level |
| 3.2 | Open | | | Rebuild `isc2.html`: 1 exam (CISSP), Advanced level |
| 3.3 | Open | | | Rebuild `github.html`: 2 exams (GH-200, GH-300), Associate level |
| 3.4 | Open | | | Rebuild `databricks.html`: 2 exams (DB-GenAI, DB-ML), Associate level |
| 3.5 | Open | | | Rebuild `nvidia.html`: 1 exam (NV-GenAI), Associate level |
| 3.6 | Open | | | Rebuild `cisco.html`: 1 exam (810-110 AITECH), Practitioner level |
| 3.7 | Open | | | Verify: all links, filters, dark mode, responsive for all 6 pages |
| 3.8 | Open | | | Stage and commit Phase 3 |

### Phase 3 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Port CompTIA, ISC2, GitHub, Databricks, NVIDIA, Cisco to Atlas`

---

## Phase 4: Results Page Port

**Goal:** Rebuild `results.html` with Atlas tokens and system components.
**Depends on:** Phase 1 (tokens available).

| # | Status | Started (PST) | Completed (PST) | Description |
|---|--------|---------------|------------------|-------------|
| 4.1 | Open | | | Rebuild `results.html`: replace CSS links with system imports, add site-nav, restyle banner/cards/table/details with Atlas tokens, update `js/results-app.js` to set `--p-current` instead of `--provider-color` |
| 4.2 | Open | | | Verify: results page renders correctly for a completed exam, dark mode works, print mode works, export/import still functions |
| 4.3 | Open | | | Stage and commit Phase 4 |

### Phase 4 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Port results page to Atlas design system`

---

## Phase 5: Cleanup + Verification

**Goal:** Remove legacy CSS files and verify no regressions.
**Depends on:** Phases 1-4 all complete.

| # | Status | Started (PST) | Completed (PST) | Description |
|---|--------|---------------|------------------|-------------|
| 5.1 | Open | | | Grep all HTML files for references to `css/styles.css`, `css/quiz.css`, `css/results.css` — confirm zero matches |
| 5.2 | Open | | | Delete `css/styles.css`, `css/quiz.css`, `css/results.css` |
| 5.3 | Open | | | Run `npx vitest run` — confirm 195 tests pass |
| 5.4 | Open | | | Manual spot-check: open one exam per provider in quiz, verify rendering |
| 5.5 | Open | | | Stage and commit Phase 5 |

### Phase 5 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Remove legacy CSS files after Atlas migration complete`
