# Project TODO

Review date: 2026-05-08

## Important

All important items resolved (2026-05-08).

## Nice-to-have

No items remaining.

## Resolved Decisions

- **XML removal complete** (2026-05-07): All XML data, parser, scripts, tests, and schema removed. JSON is the sole data format.
- **Lessons exposed on website** (2026-05-07): lessons.html (card grid with filters) + lesson.html (markdown viewer via marked.js from esm.sh). Nav updated site-wide.
- **CSP on lesson viewer** (2026-05-07): Allows esm.sh (scripts), Google Fonts (styles), gstatic (font files), and unsafe-inline for the module script.
- **Accessibility audit refreshed** (2026-05-08): 15 pages audited, 1 pre-existing moderate violation on quiz.html (landmark regions). All new pages clean.
- **Lessons nav scoping** (2026-05-08): Lessons link appears on index, provider pages, lessons.html, and lesson.html. Excluded from quiz.html (focused interface) and results.html (post-quiz flow).
- **Stale artifacts cleaned** (2026-05-08): log/, output/, tmp/ added to .gitignore. Tracked artifacts removed. deployment-guide.md updated to current file structure.
