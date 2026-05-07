# Integration Testing a DOM Application with jsdom

## The Lesson

A browser-based application that uses DOM APIs (querySelector, innerHTML, addEventListener) can be integration-tested in Node.js using jsdom, without launching a real browser. This is faster than Playwright/Selenium and simpler to set up, but requires dependency injection to decouple the application from global DOM state.

## Context

The quiz application's `QuizApp` class in `app.js` had 0% test coverage because it was tightly coupled to the browser DOM — it called `document.getElementById()` in its constructor. This couldn't be tested in Node.js as-is.

## What Happened

1. `QuizApp` was refactored to accept DOM element references via constructor parameters instead of querying the global `document`
2. Integration tests created a jsdom document with the required HTML structure
3. Tests exercised the full flow: load exam → render question → select answer → submit → verify feedback
4. Test coverage for `app.js` went from 0% to meaningful coverage
5. vitest with `environment: 'jsdom'` was configured in `vitest.config.js`

## Key Insights

- **Dependency injection is the key enabler.** If a class queries the DOM in its constructor (`document.getElementById('quiz')`), it can't be tested without the real DOM. Accepting element references as parameters makes it testable anywhere.
- **jsdom is fast but incomplete.** It handles DOM manipulation, events, and CSS class toggling well. It does not handle visual rendering, layout computation, CSS transitions, or some newer Web APIs. For this application (mostly DOM manipulation and event handling), jsdom coverage is high.
- **Integration tests > unit tests for UI code.** Testing that `QuizApp` renders the correct question text after calling `loadExam()` is more valuable than testing that `renderQuestion()` sets innerHTML. The integration test validates the contract the user cares about.
- **The test HTML structure must match production.** jsdom tests create a minimal HTML document with the IDs and structure that the application expects. If production HTML changes (new IDs, new structure), the test fixtures must be updated. This is a maintenance cost but also a safety net.
- **vitest + jsdom is the simplest setup for ES module DOM testing.** No browser binaries, no WebSocket connections, no headless Chrome configuration. Just `test: { environment: 'jsdom' }` in the vitest config.

## Applicability

jsdom integration testing works well for applications whose complexity is in DOM manipulation, event handling, and data flow — not in visual rendering, animations, or cross-browser layout differences. If your tests need to verify visual appearance, use Playwright or Cypress. If they need to verify logic and data flow through the DOM, jsdom is faster and simpler.

## Related Lessons

- [Testing Provider Detection Logic](20-testing-provider-detection.md) — extracting pure functions from DOM-coupled classes is the prerequisite for both unit testing and jsdom integration testing
- [Code Review Driven Remediation](13-code-review-remediation.md) — the 0% coverage gap on the UI controller was identified in the code review; jsdom testing was the fix
