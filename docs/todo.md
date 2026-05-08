# Project TODO

Review date: 2026-05-07

## Important

All important items resolved (2026-05-08).

## Nice-to-have

### 4. Re-run accessibility audit
Last audit was April 13. The site has changed significantly (Atlas migration, lessons page). Re-run `scripts/accessibility-audit.js` to check for new issues.

### 5. Quiz page navigation
Quiz.html intentionally has no global nav (focused quiz interface). Consider whether a minimal "Lessons" link in the header breadcrumb area would help users who finish a quiz find the lessons section.

## Resolved Decisions

- **XML removal complete** (2026-05-07): All XML data, parser, scripts, tests, and schema removed. JSON is the sole data format.
- **Lessons exposed on website** (2026-05-07): lessons.html (card grid with filters) + lesson.html (markdown viewer via marked.js from esm.sh). Nav updated site-wide.
- **CSP on lesson viewer** (2026-05-07): Allows esm.sh (scripts), Google Fonts (styles), gstatic (font files), and unsafe-inline for the module script.
