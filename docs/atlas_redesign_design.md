# Atlas Design System Rollout — Design Document

## 1. Purpose

The certification study site is being redesigned under the "Atlas" design system. The new system replaces the ad-hoc CSS utility classes and per-page inline styles with a unified token-based architecture. Azure's provider page and the quiz page have already been rebuilt as reference implementations. This document specifies what must happen to propagate the design to all ten providers and the entry/landing page.

## 2. Scope

- Rebuild `index.html` (landing page) using Atlas tokens and system components
- Convert 9 remaining provider pages (aws, gcp, anthropic, comptia, isc2, github, databricks, nvidia, cisco) from old CSS to Atlas
- Retire old stylesheets (`css/styles.css`, `css/quiz.css`, `css/results.css`) once all pages are ported
- Port `results.html` to Atlas styling
- All pages gain dark mode support via the `[data-theme="dark"]` token layer

## 3. Core Design Principles

The Atlas system is governed by these constraints (from the redesign deck):

1. **Typography-driven hierarchy.** Serif (`Source Serif 4`) for headlines and reading text; sans (`Inter Tight`) for UI and body; mono (`JetBrains Mono`) for metadata, codes, eyebrows. No competing visual elements.
2. **Provider color as accent only.** Brand colors (`--p-azure`, `--p-aws`, etc.) appear only in small marks (36px chip, 3px left-bar on hover, badges). They never appear as page backgrounds or section fills.
3. **Token-first.** All color, spacing, radius, shadow, and motion values reference CSS custom properties from `system/tokens.css`. No raw hex, px spacing, or duration outside the token file.
4. **Light + Dark.** The token file defines both palettes. Switching themes is a single `data-theme="dark"` attribute on `<html>`.
5. **Local-first, no build step.** Static HTML + CSS. No bundler, no framework, no server dependencies.

## 4. Primary User Stories

- As a user, I see a consistent, polished experience across all provider pages regardless of which certification vendor I'm studying.
- As a user, I can toggle dark mode site-wide and every page respects it.
- As a user browsing on mobile, the responsive breakpoints work identically across all providers.
- As a user arriving at the landing page, I see all providers in a structured grid with clear visual hierarchy and immediate navigation.

## 5. Design System Foundation

### 5.1 File Structure

```
system/
  tokens.css      — Design tokens (colors, type, spacing, motion, radii, shadows)
  system.css      — Reusable component classes (nav, buttons, badges, cards, exam-row, progress)
```

Both files are already committed and in use by `azure.html` and `quiz.html`.

### 5.2 Token Inventory (key variables)

| Concern | Token | Light | Dark |
|---------|-------|-------|------|
| Text primary | `--atlas-ink` | #1A1D24 | #F2EEE3 |
| Text secondary | `--atlas-ink-2` | #4A4D54 | #B8B5AC |
| Text tertiary | `--atlas-muted` | #7A7D84 | #777874 |
| Page bg | `--atlas-paper` | #F6F4EF | #0F1014 |
| Card bg | `--atlas-paper-2` | #EDEAE0 | #15171C |
| Soft border | `--atlas-rule-soft` | rgba(26,29,36,.12) | rgba(242,238,227,.10) |
| Success | `--atlas-good` | #3F7D58 | #6BB089 |
| Error | `--atlas-bad` | #B0463A | #D87363 |
| Warning | `--atlas-warn` | #B68C2E | #D9B25A |
| Interactive | `--atlas-accent` | #2F5DA8 | #6FA0E8 |

### 5.3 Provider Colors (accent marks only)

```
--p-aws:        #FF9900
--p-azure:      #0078D4
--p-gcp:        #4285F4
--p-cisco:      #1BA0D7
--p-anthropic:  #D97757
--p-comptia:    #C8202F
--p-pmi:        #0F4C97
--p-isaca:      #0E5FA4
```

Each provider page sets `--p-current: var(--p-{provider})` in its `:root` block.

### 5.4 Typography

| Role | Family | Size | Use |
|------|--------|------|-----|
| Display | `--serif` | clamp(48px, 6vw, 84px) | Landing hero |
| H1 | `--serif` | clamp(36px, 4vw, 56px) | Provider hero |
| H2 | `--serif` | 28px | Section headings |
| Body | `--sans` | 16px | Paragraph text, UI |
| Eyebrow/Meta | `--mono` | 11px, letter-spacing .14em, uppercase | Labels, codes, badges |

### 5.5 Key System Components (from system.css)

- `.site-nav` — Shared navigation bar (brand mark + links + theme toggle)
- `.btn` / `.btn.ghost` / `.btn.subtle` — Button variants
- `.badge` / `.badge.new` / `.badge.end` — Status badges
- `.pchip` — Provider chip (36x36, colored square, white initial)
- `.exam-row` — Grid row (code | name+desc | level | qcount | arrow)
- `.progress` — Thin bar with fill `<i>`
- `.card` / `.card.inset` — Surface variants
- `.shell` — Max-width 1200px centered container

## 6. Functional Requirements

### 6.1 Landing Page (index.html)

**Structure:**
1. `.site-nav` — Atlas brand mark + nav links (All, By Level, Recent) + theme toggle
2. `.hero` — Large serif display title ("Study *Atlas*"), subtitle lede, stats row (providers count, exams count, questions count)
3. `.providers-section` — Provider grid (5-column on desktop, responsive)
   - Each provider is a `.pcard` with: colored `.pchip`, provider name, short description, exam count badge
   - One "featured" card (inverse colors) for the newest/highlighted provider
   - Hover: subtle background shift
4. Footer — minimal (version, link to GitHub)

**Responsive:** Grid collapses to 2 columns at 768px, 1 column at 480px.

### 6.2 Provider Pages (9 remaining)

Each provider page follows the azure.html pattern:

1. `.site-nav` (shared)
2. `.hero` section:
   - Large `.pchip-lg` (64px) with provider initial
   - Serif title with italic accent (e.g. "Amazon *Web Services*")
   - `.lede` description
   - `.hero-meta` — exam count + total questions stats
3. `.filters` bar — Level filter chips (All, Foundational, Associate, Professional, Specialty)
4. `.exam-list` with `.level-section` groups:
   - `.level-head` — italic serif section header + exam count
   - `.exam-row` items per exam:
     - Grid: code | name+desc | level col | question count | arrow
     - Hover: 3px left provider-color bar
     - Badge states: `.badge-state.new`, `.ending`, `.replaced`
     - Retirement notes: `.retire-note` with link to replacement
5. Theme toggle + responsive collapse

**Per-provider customization** is exclusively `--p-current` and the text content. No provider-specific CSS rules.

### 6.3 Quiz Page (quiz.html)

Already rebuilt. Uses:
- Sticky `.quiz-top` with breadcrumb, progress bar, action buttons
- Single-column `.canvas` (max-width 880px)
- Choice buttons as `<button>` with `aria-pressed` and `data-state` attributes
- `<details>` elements for progressive hints
- Keyboard navigation (A-D select, Enter submit, arrows navigate, T toggle theme, 1-3 for hints)

### 6.4 Results Page (results.html)

Needs porting from old CSS to Atlas. Maintains same data/functionality but uses:
- Atlas tokens for all colors, spacing, typography
- `.site-nav` shared header
- Provider-colored banner via `--p-current`
- Category table, difficulty cards, timeline, detail list — all restyled with Atlas tokens
- Print media rules preserved

### 6.5 Shared Chrome

Every page includes:
```html
<link rel="stylesheet" href="system/tokens.css" />
<link rel="stylesheet" href="system/system.css" />
```

Every page includes the theme toggle script and `.site-nav` component.

### 6.6 Dark Mode

Theme toggle stores preference in `localStorage` key `atlas-theme`. Pages read it on load and set `data-theme="dark"` on `<html>`. The token file handles all color switching via the `[data-theme="dark"]` selector.

### 6.7 Fonts

Loaded from Google Fonts (already in azure.html):
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,300;1,8..60,400;1,8..60,500&display=swap" rel="stylesheet" />
```

## 7. Migration Strategy

- Provider pages are independent — each can be ported without affecting others
- Old CSS files (`css/styles.css`, `css/quiz.css`) remain in place until ALL pages are ported
- Each ported page switches its `<link>` tags from `css/styles.css` to `system/tokens.css` + `system/system.css`
- Page-specific styles go in a `<style>` block within the page (matching azure.html pattern)
- The JS engine files (`js/app.js`, `js/quiz-engine.js`, etc.) are unaffected — they reference DOM element IDs, not CSS classes
- `js/app.js` needs element ID updates if quiz.html DOM structure changed (addressed in implementation)

## 8. Reference Implementations

- **Provider page:** `azure.html` (470 lines, fully rebuilt)
- **Quiz page:** `quiz.html` (654 lines, fully rebuilt)
- **Design deck:** `docs/redesign/CertificationRedesign.html` (presentation showing all patterns)
- **Tokens:** `system/tokens.css` (114 lines)
- **Components:** `system/system.css` (302 lines)
