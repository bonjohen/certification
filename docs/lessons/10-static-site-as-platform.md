# Static Site as Application Platform

## The Lesson

A full-featured application (quiz engine, progress persistence, scoring, results dashboards, 10 providers, 50+ exams) can be built with vanilla HTML, CSS, and ES6 modules — no framework, no build step, no server. This approach trades developer convenience (hot reload, component abstractions, state management libraries) for deployment simplicity (host anywhere, no CI/CD pipeline, no server costs) and eliminates entire categories of problems (build failures, dependency conflicts, framework version upgrades).

## Context

The certification quiz site serves browser-based practice quizzes. It has:
- 10 provider landing pages + 1 index page + 1 quiz page + 1 results page
- A quiz engine managing state, navigation, scoring, and hints
- localStorage persistence with save/resume/history
- JSON Schema validation of exam data at load time
- A full test suite (vitest + jsdom)

All of this runs from static files served by any HTTP server.

## What Happened

<!-- reconstructed from context, not git history -->

1. The project started as a single HTML page with inline JavaScript for one Azure exam. No framework was chosen because the initial scope didn't justify one.
2. As the application grew (quiz engine, progress tracking, results page), the code was split into ES6 modules. The browser's native `import`/`export` handled module loading without a bundler.
3. When JSON Schema validation was needed, Ajv was imported from a CDN (`esm.sh`) rather than adding a build step. The vitest config aliases these CDN URLs to `node_modules` for testing.
4. A design system (Atlas) was added as plain CSS files — `tokens.css` for variables, `system.css` for components. No CSS preprocessor, no CSS-in-JS.
5. The application scaled to 10 providers, 50+ exams, 13 HTML pages, and 6 JS modules without ever introducing a build step, bundler, or framework.
6. Deployment remained trivial throughout: push to GitHub Pages, done. No CI/CD pipeline, no environment configuration, no server provisioning.

## Key Insights

- **ES6 modules are the framework.** `import { QuizEngine } from './quiz-engine.js'` is native browser syntax. No bundler, no transpiler, no module system polyfill. Clean dependency graph, clear file boundaries.
- **No build step means no build failures.** There is no `npm run build` that can break. The files you edit are the files the browser runs. This eliminates an entire class of "works locally, fails in CI" problems.
- **The tradeoff is real.** No component system means HTML is duplicated across provider pages. No state management library means manual DOM manipulation in `app.js`. No hot reload means manual browser refresh. These costs are acceptable for this project's scale (~6 JS files, ~13 HTML pages) but would not scale to a 50-page SPA.
- **CDN imports bridge the gap for complex dependencies.** `import Ajv from 'https://esm.sh/ajv@8.17.1/dist/2020.js'` loads a schema validator without npm in production. The vitest config aliases these CDN URLs to `node_modules` for testing.
- **Hosting is trivially simple.** GitHub Pages, Netlify, S3, or `python -m http.server`. No server-side logic, no environment variables, no database connections, no cold starts.
- **Content Security Policy is still possible.** A `<meta>` CSP tag restricts scripts to `'self'` and the ESM CDN, blocking XSS even without a server to set headers.

## Applicability

This approach works well for content-driven applications with limited interactivity per page (quiz apps, documentation sites, dashboards). It stops working when you need deep component composition, complex client-side routing, or real-time state synchronization across many components. A good heuristic: if you'd need more than ~10 JS modules or more than ~20 pages, evaluate whether a framework would reduce total complexity rather than add it.

## Related Lessons

- [Client-Side State Persistence with localStorage](11-localstorage-persistence.md) — localStorage is what gives a static site application-like persistence
- [Content Security Policy for Static Sites](12-csp-static-sites.md) — CSP via meta tags works because there's no server to set headers
- [Design System Migration](09-design-system-migration.md) — the Atlas design system was built as plain CSS, proving a design system doesn't need a preprocessor
