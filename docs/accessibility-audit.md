# Accessibility Audit

**Date:** 2026-04-13
**Tool:** axe-core
**Pages audited:** index.html, quiz.html, azure.html, aws.html, gcp.html, anthropic.html

## index.html

No violations found.

**Passes:** 18 | **Violations:** 0 | **Incomplete:** 3

## quiz.html

No violations found.

**Passes:** 14 | **Violations:** 0 | **Incomplete:** 3

## azure.html

No violations found.

**Passes:** 18 | **Violations:** 0 | **Incomplete:** 3

## aws.html

No violations found.

**Passes:** 18 | **Violations:** 0 | **Incomplete:** 3

## gcp.html

No violations found.

**Passes:** 18 | **Violations:** 0 | **Incomplete:** 3

## anthropic.html

No violations found.

**Passes:** 18 | **Violations:** 0 | **Incomplete:** 3

---
**Total violations across all pages:** 0

## Notes

- Color-contrast checks show as "Incomplete" (3 per page) because jsdom does not support `HTMLCanvasElement.getContext`, which axe-core requires for computed color measurements. Manual review of contrast ratios is recommended for the primary text (`#333` on `#fff`) and button styles.
- The audit covers static HTML structure only. Dynamic states (hint reveal, answer feedback, modal dialogs) would require a browser-based runner (e.g., Playwright + axe) for full coverage.
