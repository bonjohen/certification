# General Code Review — Phased Remediation Plan

Work queue derived from `docs/general_code_review_results.md`. Addresses all 11 findings (F-01 through F-11) plus missing artifacts identified in section 6.

Source review: Mode A Whole Codebase Review, approved with non-blocking comments.

---

## Status Legend

| Symbol | Meaning           |
|--------|-------------------|
| `[ ]`  | Available         |
| `[>]`  | Processing        |
| `[X]`  | Completed         |
| `[!]`  | Blocked / Paused  |

---

## Phase 1: Foundation and Trust

> Eliminate the XSS risk and fix test-code drift that masks regressions. These are the only findings that could cause harm beyond the development team.

| #   | Task                                                                                                                         | Finding | Status | Started | Completed |
|-----|------------------------------------------------------------------------------------------------------------------------------|---------|--------|---------|-----------|
| 1.1 | Extract `getProviderFromExam` from `QuizApp` class in `js/app.js` into a standalone exported function                        | F-02    | [X]    | 2026-03-26 | 2026-03-26 |
| 1.2 | Update `app.test.js` to import and test the real `getProviderFromExam` instead of the copied logic                           | F-02    | [X]    | 2026-03-26 | 2026-03-26 |
| 1.3 | Add Anthropic detection tests to `app.test.js` (`cca-f` exam ID and `Anthropic` provider metadata)                          | F-02    | [X]    | 2026-03-26 | 2026-03-26 |
| 1.4 | Verify all 27 existing provider-detection tests still pass against the real export                                            | F-02    | [X]    | 2026-03-26 | 2026-03-26 |
| 1.5 | Add HTML sanitization for `innerHTML` assignments in `app.js` (lines 283, 289, 442) — use DOMPurify or allowlist sanitizer   | F-01    | [X]    | 2026-03-26 | 2026-03-26 |
| 1.6 | Add XSS regression test: inject `<script>` tag in XML scenario/question-text, verify it is not rendered as executable HTML   | F-01    | [X]    | 2026-03-26 | 2026-03-26 |
| 1.7 | Add Content Security Policy meta tag to `quiz.html` to mitigate XSS even if sanitization is imperfect                        | F-01    | [X]    | 2026-03-26 | 2026-03-26 |

---

## Phase 2: Correctness and Maintainability

> Clean up orphan files, normalize XML namespaces, and address data-layer inconsistencies. Real issues that affect professionalism and maintainability but do not block trust in the running application.

| #   | Task                                                                                                                         | Finding | Status | Started | Completed |
|-----|------------------------------------------------------------------------------------------------------------------------------|---------|--------|---------|-----------|
| 2.1 | Delete `data/anthropic/questions-batch-a.xml`, `questions-batch-b.xml`, `questions-batch-c.xml`                              | F-03    | [X]    | 2026-03-26 | 2026-03-26 |
| 2.2 | Verify `data/anthropic/cca-f.xml` still contains all 50 questions after batch file removal                                   | F-03    | [X]    | 2026-03-26 | 2026-03-26 |
| 2.3 | Normalize `data/azure/ai-900.xml` namespace to `xmlns="http://certification.study/schema/v1"`                                | F-04    | [X]    | 2026-03-26 | 2026-03-26 |
| 2.4 | Normalize `data/azure/dp-900.xml` namespace to `xmlns="http://certification.study/schema/v1"`                                | F-04    | [X]    | 2026-03-26 | 2026-03-26 |
| 2.5 | Verify `ai-900` and `dp-900` quizzes load and parse correctly after namespace normalization                                  | F-04    | [X]    | 2026-03-26 | 2026-03-26 |
| 2.6 | Add re-submission guard in `quiz-engine.js` `submitAnswer` — early return if `hasAnswered(question.id)` is true              | F-11    | [X]    | 2026-03-26 | 2026-03-26 |
| 2.7 | Add unit test: call `submitAnswer` twice on same question, verify first answer is preserved                                  | F-11    | [X]    | 2026-03-26 | 2026-03-26 |

---

## Phase 3: Test and Release Confidence

> Close the `app.js` coverage gap, add integration tests, and introduce XML schema validation. The UI orchestration layer currently has zero coverage and the highest blast radius.

| #   | Task                                                                                                                         | Finding | Status | Started | Completed |
|-----|------------------------------------------------------------------------------------------------------------------------------|---------|--------|---------|-----------|
| 3.1 | Refactor `QuizApp` constructor to accept DOM element references via dependency injection (enable jsdom testing)               | F-05    | [X]    | 2026-03-27 | 2026-03-27 |
| 3.2 | Add jsdom-based integration tests for `QuizApp`: load XML → render question → select answer → submit → verify feedback       | F-05/F-06 | [X]  | 2026-03-27 | 2026-03-27 |
| 3.3 | Add integration test: wire `XMLParser` + `QuizEngine` with `tests/fixtures/sample-exam.xml`, verify full data flow           | F-06    | [X]    | 2026-03-27 | 2026-03-27 |
| 3.4 | Achieve at least 50% line coverage for `app.js` via `npm run test:coverage`                                                  | F-05    | [X]    | 2026-03-27 | 2026-03-27 |
| 3.5 | Create Node script to validate all `data/**/*.xml` against `data/schema/certification.xsd`                                   | Missing | [X]    | 2026-03-27 | 2026-03-27 |
| 3.6 | Add keyboard navigation test for arrow key handlers in quiz                                                                  | Missing | [X]    | 2026-03-27 | 2026-03-27 |
| 3.7 | Ensure `package-lock.json` is committed for reproducible installs                                                            | Missing | [X]    | 2026-03-27 | 2026-03-27 |

---

## Phase 4: Operations and Reviewer Polish

> Improve documentation accuracy, add CI/CD, organize docs, and improve developer experience for handoff.

| #   | Task                                                                                                                         | Finding | Status | Started | Completed |
|-----|------------------------------------------------------------------------------------------------------------------------------|---------|--------|---------|-----------|
| 4.1 | Fix README.md port mismatch: "Running Locally" section says 8000, actual dev server uses 8080 — align or document both       | F-07    | [ ]    |         |           |
| 4.2 | Add `css/quiz.css` to README project structure listing                                                                       | F-07    | [ ]    |         |           |
| 4.3 | Add GitHub Actions CI workflow (`.github/workflows/ci.yml`): `npm ci && npm test` on push/PR                                 | F-09    | [ ]    |         |           |
| 4.4 | Add XML schema validation step to CI workflow                                                                                | F-09    | [ ]    |         |           |
| 4.5 | Organize `docs/` directory: move historical working documents to `docs/archive/` or add `docs/README.md` index               | F-10    | [ ]    |         |           |
| 4.6 | Commit or delete untracked `docs/add_anthropic_claude_design.md`                                                             | F-10    | [ ]    |         |           |
| 4.7 | Run accessibility audit (axe-core or manual) on quiz page and document results                                               | Missing | [ ]    |         |           |

---

## Phase Dependencies

```
Phase 1 ──► Phase 3 (tests in Phase 3 depend on refactoring from Phase 1)
Phase 2 ──► (independent, can run in parallel with Phase 1)
Phase 3 ──► Phase 4 (CI in Phase 4 runs tests built in Phase 3)
```

Phases 1 and 2 are independent and can run in parallel.
Phase 3 depends on Phase 1 (the `app.js` refactoring enables testability).
Phase 4 depends on Phase 3 (CI workflow runs the tests created in Phase 3).

---

## Finding Cross-Reference

| Finding | Severity | Phase | Tasks        |
|---------|----------|-------|--------------|
| F-01    | Medium   | 1     | 1.5, 1.6, 1.7 |
| F-02    | Medium   | 1     | 1.1–1.4      |
| F-03    | Low      | 2     | 2.1, 2.2     |
| F-04    | Low      | 2     | 2.3–2.5      |
| F-05    | Medium   | 3     | 3.1, 3.2, 3.4 |
| F-06    | Low      | 3     | 3.2, 3.3     |
| F-07    | Nit      | 4     | 4.1, 4.2     |
| F-08    | Low      | —     | (design decision, no action) |
| F-09    | Low      | 4     | 4.3, 4.4     |
| F-10    | Nit      | 4     | 4.5, 4.6     |
| F-11    | Nit      | 2     | 2.6, 2.7     |
