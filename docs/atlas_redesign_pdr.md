# Physical Design Requirements: Atlas Redesign Rollout

**Source document:** `docs/atlas_redesign_design.md`
**Project root:** `C:\Projects\certification`
**Date:** 2026-05-06 02:15 PM (PST)

## 1. System Context

### 1.1 Existing Infrastructure to Reuse

| Asset | Location | Reuse |
|-------|----------|-------|
| Design tokens | `system/tokens.css` (114 lines) | Use as-is — complete light/dark palette, type, spacing, motion |
| System components | `system/system.css` (302 lines) | Use as-is — nav, buttons, badges, cards, exam-row, progress |
| Azure provider page | `azure.html` (470 lines) | Template for all other provider pages |
| Quiz page | `quiz.html` (654 lines) | Already ported — no changes needed |
| Theme toggle script | Inline in azure.html lines 329-339 | Extract pattern, replicate in each page |
| Provider routing | `js/app.js` `getProviderFromExam()` | Unchanged — works with any HTML structure |
| Exam data (JSON) | `data/{provider}/*.json` | Unchanged — pages link to `quiz.html?exam=` |
| Google Fonts | Imported in system.css line 7 | Automatic once system.css is linked |

### 1.2 New Dependencies to Add

| Package | Purpose | Version Constraint |
|---------|---------|-------------------|
| None | Static HTML+CSS only | N/A |

No new dependencies. The Atlas system is zero-dependency by design.

### 1.3 Files to Delete After Migration

| File | Reason |
|------|--------|
| `css/styles.css` | Replaced by `system/tokens.css` + `system/system.css` |
| `css/quiz.css` | Replaced by inline styles in new `quiz.html` |
| `css/results.css` | Replaced by inline styles in new `results.html` |

Deletion deferred until ALL pages are confirmed ported and tested.

## 2. Package Layout

```
certification/
├── system/
│   ├── tokens.css          (existing — design tokens)
│   └── system.css          (existing — shared components)
├── index.html              (REBUILD — Atlas landing page)
├── azure.html              (existing — reference implementation)
├── aws.html                (REBUILD)
├── gcp.html                (REBUILD)
├── anthropic.html          (REBUILD)
├── comptia.html            (REBUILD)
├── isc2.html               (REBUILD)
├── github.html             (REBUILD)
├── databricks.html         (REBUILD)
├── nvidia.html             (REBUILD)
├── cisco.html              (REBUILD)
├── quiz.html               (existing — already ported)
├── results.html            (REBUILD — port to Atlas)
├── js/                     (unchanged)
├── data/                   (unchanged)
├── css/                    (deprecated after migration)
└── docs/
    ├── atlas_redesign_design.md
    └── atlas_redesign_pdr.md
```

## 3. Data Model

No data model changes. Exam data lives in `data/{provider}/{exam}.json` and is loaded by the existing JS engine. Provider pages are static HTML — exam entries are hardcoded in the HTML (matching the azure.html pattern where a manifest script populates the list).

### 3.1 Provider Metadata (per page)

Each provider page needs:

| Field | Source | Example |
|-------|--------|---------|
| Provider key | Filename | `aws` |
| Display name | Page content | `Amazon Web Services` |
| Short tagline | Page content | `Cloud computing platform certifications` |
| Brand color var | `--p-{key}` from tokens.css | `--p-aws: #FF9900` |
| Provider initial | First letter(s) for pchip | `A` |
| Exam count | Count of exams listed | `10` |
| Total questions | Sum of all exam questions | `500` |

### 3.2 Exam Entry Metadata (per row)

| Field | Source | Renders As |
|-------|--------|-----------|
| Code | Exam code (e.g. `SAA-C03`) | `.exam-row .code` |
| Title | Exam title | `.exam-row .name` |
| Description | Short description | `.exam-row .desc` |
| Level | Foundational/Associate/Professional/Advanced | `.exam-row .level` |
| Questions | Always 50 | `.exam-row .qcount` |
| Status | active/new/ending/replaced/training/source-needed | `.badge-state` |
| Retire note | Optional replacement message | `.retire-note` |
| Link | `quiz.html?exam={code}` | `<a href>` |

### 3.3 Badge State Mapping (old → new)

| Legacy class | Atlas class | Color |
|--------------|-------------|-------|
| `.new-exam` | `.badge-state.new` | `--atlas-good` |
| `.ending-soon` | `.badge-state.ending` | `--atlas-warn` |
| `.retired-exam` | `.badge-state.replaced` | `--atlas-muted` |
| `.training-only` | `.badge-state.training` | `--atlas-muted` (italic label) |
| `.source-needed` | `.badge-state.source` | `--atlas-muted` |
| `.exam-prep` | `.badge-state.prep` | `--atlas-accent` |

## 4. Provider Page Template

Every provider page follows the same structure. Only content differs.

### 4.1 HTML Skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{Provider Name} — Atlas</title>
  <link rel="stylesheet" href="system/tokens.css" />
  <link rel="stylesheet" href="system/system.css" />
  <style>
    :root { --p-current: var(--p-{key}); }
    /* ~60 lines of page-specific layout CSS (copied from azure.html) */
  </style>
</head>
<body>
  <nav class="site-nav"> ... </nav>
  <div class="shell">
    <section class="hero"> ... </section>
    <section class="filters"> ... </section>
    <section class="exam-list"> ... </section>
  </div>
  <script> /* theme toggle + optional filter logic */ </script>
</body>
</html>
```

### 4.2 Customization Points Per Provider

| Element | What changes |
|---------|-------------|
| `<title>` | Provider name |
| `:root { --p-current }` | Provider color variable |
| `.hero .pchip-lg` | Provider initial letter |
| `.hero h1` | Provider name (with italic accent word) |
| `.hero .lede` | Provider description |
| `.hero-meta` | Exam count + total questions |
| `.level-section` blocks | Grouped exams by level |
| `.exam-row` entries | One per exam |

### 4.3 Filter Behavior

The filter bar has two axes:
- **Status:** All | Active | New | Retiring
- **Level:** All | Foundational | Associate | Professional | Advanced

Filtering is done client-side via `aria-pressed` on filter chips and `hidden` attribute on exam rows. Match azure.html's implementation.

## 5. Landing Page (index.html)

### 5.1 Structure

```
.site-nav          — Brand + links + theme toggle
.hero              — Display title, lede, stats (providers, exams, questions)
.providers-section — Section header + 5-column provider grid
.footer            — Minimal attribution
```

### 5.2 Provider Grid

5 columns on desktop → 2 at 768px → 1 at 480px.

Each `.pcard`:
- Top row: `.pchip` (colored square with initial) + exam count badge
- Middle: Provider name (serif 20px) + description (12px)
- Bottom: Meta row (mono 11px)
- Featured card (one, dark inverse): newest or highlighted provider
- Hover: background shift to `--atlas-paper-2`
- Click: navigates to `{provider}.html`

### 5.3 Stats Row

Three stats in hero: `10 Providers` | `50 Study Guides` | `2,500 Questions`

## 6. Results Page Port

### 6.1 Changes

- Replace `<link href="css/styles.css">` + `<link href="css/results.css">` with `system/tokens.css` + `system/system.css`
- Add page-specific `<style>` block using Atlas tokens for:
  - Banner (uses `--p-current` for top border)
  - Summary cards (use `--atlas-good`, `--atlas-bad`, `--atlas-muted`, `--atlas-warn`)
  - Category table (Atlas table styling)
  - Detail cards (left border colors from semantic tokens)
- Add `.site-nav` and theme toggle
- Keep `js/results-app.js` unchanged — it references element IDs not CSS classes

### 6.2 Provider Color

`js/results-app.js` currently sets `--provider-color` via JS. Change to set `--p-current` instead (or alias them).

## 7. Verification Criteria

### 7.1 Visual

- [ ] Every provider page renders identically to azure.html in layout/structure (only content differs)
- [ ] Dark mode toggle works on all pages
- [ ] Provider color appears only in: pchip, hover left-bar, badge accents
- [ ] No legacy gradient headers remain
- [ ] Font loading: serif, sans, mono all render correctly

### 7.2 Functional

- [ ] All exam links navigate to correct `quiz.html?exam={code}`
- [ ] Filter chips toggle exam row visibility
- [ ] Theme preference persists across pages via `localStorage('atlas:theme')`
- [ ] Mobile responsive: exam rows collapse to 2-column grid at 760px
- [ ] Results page renders with Atlas styling and correct provider color

### 7.3 Regression

- [ ] All 195 passing tests remain green (JS engine unchanged)
- [ ] `js/app.js` still initializes correctly on quiz.html (DOM IDs preserved)
- [ ] Progress tracking and results export still function

### 7.4 Cleanup

- [ ] No page links `css/styles.css`, `css/quiz.css`, or `css/results.css`
- [ ] Old CSS files can be safely deleted (verified by grep for references)
