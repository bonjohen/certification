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

### Phase Start Protocol

1. Run `/compact atlas redesign phase N` to reclaim context.
2. Read `docs/startup.md` to reload project context.
3. Read the plan file to find the next Open phase.
4. Begin work on the first Open row.

### Commit Protocol

1. Work through all tasks in a phase.
2. When every task reaches Completed, write the Phase Summary.
3. Update `docs/startup.md` with any new information discovered during the phase (new constraints, gotchas, file changes, token additions, etc.) so the next phase start has accurate context.
4. Stage and commit all changes for the phase (including the updated startup.md). Do not push.
5. Proceed immediately to the next phase (starting with the Phase Start Protocol).

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
| 1.1 | Completed | 2026-05-06 03:45 PM | 2026-05-06 03:47 PM | Add missing provider colors to `system/tokens.css`: `--p-github: #1F2328`, `--p-databricks: #FF3621`, `--p-nvidia: #76B900`, `--p-isc2: #003366` |
| 1.2 | Completed | 2026-05-06 03:47 PM | 2026-05-06 03:52 PM | Rebuild `index.html` using Atlas system: site-nav, hero with display title + stats, 5-column provider grid (.pcard pattern from redesign deck), theme toggle, responsive breakpoints |
| 1.3 | Completed | 2026-05-06 03:52 PM | 2026-05-06 03:54 PM | Verify: all 10 provider cards link correctly, dark mode works, responsive at 768px/480px |
| 1.4 | Completed | 2026-05-06 03:54 PM | 2026-05-06 03:56 PM | Stage and commit Phase 1 |

### Phase 1 Summary

- **Changes:** Added 4 missing provider color tokens (github, databricks, nvidia, isc2) to `system/tokens.css` and pchip selectors to `system/system.css`. Rebuilt `index.html` with Atlas site-nav, hero with stats, 5-column provider grid (10 cards), theme toggle, and responsive breakpoints at 768px/480px.
- **Changes hosted at:** `index.html`, `system/tokens.css`, `system/system.css`
- **Commit:** `Port landing page to Atlas design system with provider grid`

---

## Phase 2: Provider Pages — Batch 1 (AWS, GCP, Anthropic)

**Goal:** Port the three largest/most-complex provider pages to Atlas.
**Depends on:** Phase 1 (tokens updated).

| # | Status | Started (PST) | Completed (PST) | Description |
|---|--------|---------------|------------------|-------------|
| 2.1 | Completed | 2026-05-06 03:58 PM | 2026-05-06 04:05 PM | Rebuild `aws.html` from azure.html template: 10 exams, 3 level sections (Foundational, Associate, Professional), badge states (new, retired), retirement note on SOA-C02 |
| 2.2 | Completed | 2026-05-06 04:05 PM | 2026-05-06 04:12 PM | Rebuild `gcp.html` from azure.html template: 15 exams, multiple level sections, badge states (new, training-only, exam-prep), refresh note on pro-ml-eng |
| 2.3 | Completed | 2026-05-06 04:05 PM | 2026-05-06 04:12 PM | Rebuild `anthropic.html` from azure.html template: 1 exam, single section, source-needed badge |
| 2.4 | Completed | 2026-05-06 04:12 PM | 2026-05-06 04:14 PM | Verify: all exam links work (`quiz.html?exam=`), filters toggle correctly, dark mode, responsive |
| 2.5 | Completed | 2026-05-06 04:14 PM | 2026-05-06 04:16 PM | Stage and commit Phase 2 |

### Phase 2 Summary

- **Changes:** Rebuilt `aws.html` (10 exams, 3 level sections, retired/new badges, filter chips), `gcp.html` (15 exams, 5 level sections, training/exam-prep/new badges, refresh note), and `anthropic.html` (1 exam, source-needed badge). All use static HTML exam rows with Atlas layout, theme toggle, and responsive breakpoints.
- **Changes hosted at:** `aws.html`, `gcp.html`, `anthropic.html`
- **Commit:** `Port AWS, GCP, Anthropic provider pages to Atlas`

---

## Phase 3: Provider Pages — Batch 2 (CompTIA, ISC2, GitHub, Databricks, NVIDIA, Cisco)

**Goal:** Port the remaining 6 simpler provider pages (1-2 exams each).
**Depends on:** Phase 2 (pattern validated on complex pages).

| # | Status | Started (PST) | Completed (PST) | Description |
|---|--------|---------------|------------------|-------------|
| 3.1 | Completed | 2026-05-06 04:20 PM | 2026-05-06 04:24 PM | Rebuild `comptia.html`: 1 exam (SY0-701), Intermediate level |
| 3.2 | Completed | 2026-05-06 04:20 PM | 2026-05-06 04:24 PM | Rebuild `isc2.html`: 1 exam (CISSP), Advanced level |
| 3.3 | Completed | 2026-05-06 04:20 PM | 2026-05-06 04:24 PM | Rebuild `github.html`: 2 exams (GH-200, GH-300), Associate level |
| 3.4 | Completed | 2026-05-06 04:20 PM | 2026-05-06 04:24 PM | Rebuild `databricks.html`: 2 exams (DB-GenAI, DB-ML), Associate level |
| 3.5 | Completed | 2026-05-06 04:20 PM | 2026-05-06 04:24 PM | Rebuild `nvidia.html`: 1 exam (NV-GenAI), Associate level |
| 3.6 | Completed | 2026-05-06 04:20 PM | 2026-05-06 04:24 PM | Rebuild `cisco.html`: 1 exam (810-110 AITECH), Practitioner level |
| 3.7 | Completed | 2026-05-06 04:24 PM | 2026-05-06 04:25 PM | Verify: all links, filters, dark mode, responsive for all 6 pages |
| 3.8 | Completed | 2026-05-06 04:25 PM | 2026-05-06 04:26 PM | Stage and commit Phase 3 |

### Phase 3 Summary

- **Changes:** Rebuilt all 6 remaining provider pages (comptia.html, isc2.html, github.html, databricks.html, nvidia.html, cisco.html) from legacy card layout to Atlas design system with site-nav, hero, exam-row grid, theme toggle, and responsive breakpoints.
- **Changes hosted at:** `comptia.html`, `isc2.html`, `github.html`, `databricks.html`, `nvidia.html`, `cisco.html`
- **Commit:** `Port CompTIA, ISC2, GitHub, Databricks, NVIDIA, Cisco to Atlas`

---

## Phase 4: Results Page Port

**Goal:** Rebuild `results.html` with Atlas tokens and system components.
**Depends on:** Phase 1 (tokens available).

| # | Status | Started (PST) | Completed (PST) | Description |
|---|--------|---------------|------------------|-------------|
| 4.1 | Completed | 2026-05-06 04:28 PM | 2026-05-06 04:32 PM | Rebuild `results.html`: replace CSS links with system imports, add site-nav, restyle banner/cards/table/details with Atlas tokens, update `js/results-app.js` to set `--p-current` instead of `--provider-color` |
| 4.2 | Completed | 2026-05-06 04:32 PM | 2026-05-06 04:33 PM | Verify: results page renders correctly for a completed exam, dark mode works, print mode works, export/import still functions |
| 4.3 | Completed | 2026-05-06 04:33 PM | 2026-05-06 04:34 PM | Stage and commit Phase 4 |

### Phase 4 Summary

- **Changes:** Rebuilt `results.html` with Atlas system imports (tokens.css + system.css), site-nav with theme toggle, and a CSS variable bridge mapping legacy vars to Atlas tokens. Updated `js/results-app.js` to set `--p-current` instead of `--provider-color`. All 195 tests pass.
- **Changes hosted at:** `results.html`, `js/results-app.js`
- **Commit:** `Port results page to Atlas design system`

---

## Phase 5: Cleanup + Verification

**Goal:** Remove legacy CSS files and verify no regressions.
**Depends on:** Phases 1-4 all complete.

| # | Status | Started (PST) | Completed (PST) | Description |
|---|--------|---------------|------------------|-------------|
| 5.1 | Completed | 2026-05-06 04:34 PM | 2026-05-06 04:35 PM | Grep all HTML files for references to `css/styles.css`, `css/quiz.css`, `css/results.css` — styles.css and quiz.css have zero refs; results.css still used by results.html (retained) |
| 5.2 | Completed | 2026-05-06 04:35 PM | 2026-05-06 04:35 PM | Delete `css/styles.css`, `css/quiz.css` (results.css retained — still in use) |
| 5.3 | Completed | 2026-05-06 04:35 PM | 2026-05-06 04:36 PM | Run `npx vitest run` — 195 tests pass |
| 5.4 | Completed | 2026-05-06 04:36 PM | 2026-05-06 04:36 PM | Verified: all exam links use `quiz.html?exam=` pattern, all provider pages use Atlas system |
| 5.5 | Completed | 2026-05-06 04:36 PM | 2026-05-06 04:37 PM | Stage and commit Phase 5 |

### Phase 5 Summary

- **Changes:** Deleted `css/styles.css` and `css/quiz.css` (zero references remaining). Retained `css/results.css` which is still imported by `results.html` for results-specific layout. All 195 tests pass.
- **Changes hosted at:** `css/` (removed styles.css, quiz.css)
- **Commit:** `Remove legacy CSS files after Atlas migration complete`
