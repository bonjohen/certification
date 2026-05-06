# Atlas Redesign — Startup Context

Read this if you're resuming the Atlas redesign rollout after a `/clear` or new session.

## What This Is

A multi-provider certification exam study site being redesigned under the "Atlas" design system. The site serves browser-based practice quizzes backed by JSON question banks. 10 providers, ~50 exams, ~2500 questions.

## Current State

- **azure.html** and **quiz.html** are already rebuilt with Atlas styling (the reference implementations)
- **9 provider pages** + **index.html** + **results.html** still use the legacy `css/styles.css`
- The design system files are complete and committed: `system/tokens.css` (114 lines) + `system/system.css` (302 lines)
- The JS engine (`js/app.js`, `js/quiz-engine.js`, `js/progress-tracker.js`, `js/exam-loader.js`) is unchanged by this work — it uses element IDs, not CSS classes

## Key Files

| File | Role |
|------|------|
| `system/tokens.css` | Design tokens (colors, type, spacing, motion, dark mode) |
| `system/system.css` | Shared components (nav, buttons, badges, exam-row, cards) |
| `azure.html` | **Reference implementation** — copy structure for all providers |
| `quiz.html` | Already ported (654 lines, inline styles) |
| `docs/atlas_redesign_design.md` | Stage 1 design document |
| `docs/atlas_redesign_pdr.md` | Stage 2 physical design requirements |
| `docs/atlas_redesign_plan.md` | Stage 3 phased implementation plan |

## Provider Page Pattern

Every provider page follows the same template (azure.html):
1. Links `system/tokens.css` + `system/system.css`
2. Sets `:root { --p-current: var(--p-{provider}); }` for brand color
3. Has ~60 lines of inline `<style>` for page layout (hero, filters, exam-row grid, responsive)
4. Structure: `.site-nav` → `.hero` → `.filters` → `.exam-list` (grouped by level) → theme toggle script
5. Exam rows: grid `88px 1fr 140px 90px 24px` with hover left-bar in provider color

## Provider Color Variables (from tokens.css)

```
--p-aws: #FF9900      --p-azure: #0078D4     --p-gcp: #4285F4
--p-cisco: #1BA0D7    --p-anthropic: #D97757  --p-comptia: #C8202F
--p-pmi: #0F4C97      --p-isaca: #0E5FA4
```

Note: tokens.css doesn't have variables for github, databricks, nvidia, isc2. These need to be added or handled inline.

## Badge States

| Status | Atlas class | Meaning |
|--------|-------------|---------|
| New | `.badge-state.new` | Recently added exam |
| Ending | `.badge-state.ending` | Being retired soon |
| Replaced | `.badge-state.replaced` | Retired, successor exists |
| Training | (italic label, no badge) | Training course, not certification |
| Source needed | `.badge-state.source` | No verified official source |
| Exam prep | `.badge-state.prep` | Exam preparation course |

## Theme Toggle Pattern

```javascript
const THEME_KEY = 'atlas:theme';
const saved = localStorage.getItem(THEME_KEY);
if (saved) document.documentElement.setAttribute('data-theme', saved);
document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
});
```

## Exam Data by Provider

- **AWS** (10 exams): AIF-C01, AIP-C01, CLF-C02, DEA-C01, DVA-C02, MLA-C01, SAA-C03, SAP-C02, SOA-C02 (retired), SOA-C03
- **GCP** (15 exams): cloud-data-engineer, gcp-cloud-arch, gcp-cloud-eng, gcp-cloud-fnd, gcp-data-eng, gcp-data-eng-ml, gcp-db-devops, gcp-db-stor, gcp-exam-prep-ace, gcp-fund-core, gcp-gk-compute, gcp-networks, gcp-pca, gen-ai-leader, pro-ml-eng
- **Anthropic** (1): cca-f
- **CompTIA** (1): sy0-701
- **ISC2** (1): cissp
- **GitHub** (2): gh-200, gh-300
- **Databricks** (2): db-genai, db-ml
- **NVIDIA** (1): nv-genai
- **Cisco** (1): 810-110 (aitech)

## Tests

- Run: `npx vitest run`
- 195 active tests pass; 5101 XML/JSON render equivalence tests are skipped (`describe.skip`)
- JS engine tests are the regression gate — they must stay green throughout

## Important Constraints

- No build step — static HTML+CSS only
- Provider color is accent only (small marks) — never page background
- Each page is self-contained with inline `<style>` (no separate CSS file per page)
- Old `css/styles.css` stays until ALL pages are ported (some pages may still reference it during migration)
- Do not modify `js/app.js` DOM element IDs without updating quiz.html to match
- The quiz.html has already been redesigned externally (not by this agent) — treat it as authoritative
