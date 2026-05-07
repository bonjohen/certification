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

## Key Insights

- **ES6 modules are the framework.** `import { QuizEngine } from './quiz-engine.js'` is native browser syntax. No bundler, no transpiler, no module system polyfill. Clean dependency graph, clear file boundaries.
- **No build step means no build failures.** There is no `npm run build` that can break. The files you edit are the files the browser runs. This eliminates an entire class of "works locally, fails in CI" problems.
- **The tradeoff is real.** No component system means HTML is duplicated across provider pages. No state management library means manual DOM manipulation in `app.js`. No hot reload means manual browser refresh. These costs are acceptable for this project's scale (~6 JS files, ~13 HTML pages) but would not scale to a 50-page SPA.
- **CDN imports bridge the gap for complex dependencies.** `import Ajv from 'https://esm.sh/ajv@8.17.1/dist/2020.js'` loads a schema validator without npm in production. The vitest config aliases these CDN URLs to `node_modules` for testing.
- **Hosting is trivially simple.** GitHub Pages, Netlify, S3, or `python -m http.server`. No server-side logic, no environment variables, no database connections, no cold starts.
- **Content Security Policy is still possible.** A `<meta>` CSP tag restricts scripts to `'self'` and the ESM CDN, blocking XSS even without a server to set headers.

## Information Needed to Complete This Document

- [ ] Discuss the breaking points: at what scale does this approach stop working?
- [ ] Compare developer experience to a React/Next.js equivalent
- [ ] Document the CDN import + vitest alias pattern in detail
- [ ] Address performance: does loading 6 separate JS modules cause waterfall delays?
- [ ] Discuss how this approach handles caching, versioning, and cache-busting
