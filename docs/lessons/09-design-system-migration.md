# Design System Migration

## The Lesson

Migrating an existing multi-page site to a design system is a page-by-page operation, not a big-bang rewrite. The design system (tokens + components) must be complete and proven on one reference page before touching others. The migration ends with deleting the old stylesheets — if the old CSS files can be removed without breaking anything, the migration is complete.

## Context

A 10-provider certification site had grown organically with ad-hoc CSS: `css/styles.css` (432 lines) and `css/quiz.css` (793 lines). Each provider page had inline styles for brand colors. There was no shared color palette, no spacing scale, no typography system. Adding dark mode, responsive improvements, or a new page meant duplicating CSS patterns.

The "Atlas" design system was created: `system/tokens.css` (design tokens) and `system/system.css` (component classes).

## How the Migration Was Executed

1. **Design doc first.** A full design document defined the token inventory, component library, and rollout order.
2. **Reference implementation.** Azure's provider page and the quiz page were rebuilt with Atlas tokens as proof-of-concept.
3. **Landing page.** The index page was ported, establishing the provider grid component.
4. **Provider pages in batches.** AWS/GCP/Anthropic in one commit, then CompTIA/ISC2/GitHub/Databricks/NVIDIA/Cisco in another.
5. **Results page.** Ported with legacy CSS variable bridging (`--primary-color: var(--p-current)`).
6. **Legacy CSS deletion.** `css/styles.css` and `css/quiz.css` removed (1,225 lines deleted) with no visual regressions.

## Key Insights

- **Tokens are the migration's foundation.** Converting a page to the design system means replacing every raw `#hex`, `8px`, `Arial` with a token reference. If the tokens aren't defined yet, you're just moving inline styles to a different file.
- **Bridge variables ease the transition.** During migration, legacy CSS variable names (`--primary-color`) can alias to new tokens (`var(--p-current)`). This allows pages to migrate incrementally without breaking pages that haven't been ported yet.
- **Batch similar pages together.** The 6 smaller provider pages (CompTIA through Cisco) were near-identical in structure, so they were ported in a single commit. The 3 larger pages (AWS, GCP, Anthropic) with unique content were done separately.
- **The old CSS deletion is the victory condition.** If you can `git rm css/styles.css css/quiz.css` and every page still renders correctly, the migration is complete. If you can't, you missed something.
- **Dark mode comes "free" from tokens.** Once all pages use tokens, dark mode is a single `[data-theme="dark"]` block in `tokens.css` that redefines the palette. No per-page dark mode code needed.

## Related Lessons

- [Static Site as Application Platform](10-static-site-as-platform.md) — Atlas proves a design system doesn't require a CSS preprocessor or build step
- [Provider-Agnostic Plugin Architecture](08-provider-agnostic-architecture.md) — provider brand colors as CSS variables complement the JS-level provider detection
- [Design-First Development](15-design-first-development.md) — the Atlas rollout followed the full design-doc → PDR → plan → execute workflow
