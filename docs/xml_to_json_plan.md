# XML-to-JSON Migration — Implementation Plan

**Source:** Existing codebase analysis (no separate design/PDR — scope is narrow)
**Project root:** `C:\Projects\certification`
**Date:** 2026-05-06

## Current State

JSON data files already exist for all exams (50+ files across 10 providers). The conversion
script (`scripts/xml_to_json_exam.py`) and JSON Schema (`data/schema/certification.schema.json`)
are both in place. The quiz engine (`js/quiz-engine.js`) is format-agnostic — it consumes a
plain JS object with `{metadata, questions, glossary}`. The only remaining work is in the
loading layer: `js/xml-parser.js` and `js/app.js` still hardcode XML paths and XML parsing.

## Technology Stack (Additive)

| Concern | Choice |
|---|---|
| Schema validation | Ajv 8 (JSON Schema Draft 2020-12), loaded via CDN or bundled |
| Exam loader | New `js/exam-loader.js` replacing `js/xml-parser.js` |
| Data format | JSON (`.json` files in `data/{provider}/`) |

## Work Queue Instructions

### State Transitions

Open  ──>  Started  ──>  Completed
              │
              └──>  Blocked  ──>  Started  ──>  Completed

- **Open**: Not yet begun.
- **Started**: Actively in progress. Record the start datetime (PST).
- **Completed**: Done and verified. Record the completion datetime (PST).
- **Blocked**: Cannot proceed; note the blocker in the description.

### Commit Protocol

1. Work through all tasks in a phase.
2. When every task reaches Completed, write the Phase Summary.
3. Stage and commit all changes for the phase. Do not push.
4. Proceed immediately to the next phase.

---

## Phase 1: ExamLoader with JSON Schema Validation

**Goal:** A new `js/exam-loader.js` replaces `js/xml-parser.js` as the exam loading mechanism. It fetches JSON, validates against the schema, and returns the same `{metadata, questions, glossary}` object the quiz engine expects.

**Depends on:** Nothing (first phase).

| Row  | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 1.1  | Completed | 2026-05-06 06:29 PM (PST) | 2026-05-06 06:30 PM (PST) | Create `js/exam-loader.js` — ExamLoader class with `loadExam(examPath)` that fetches JSON, validates against schema, returns parsed object. Include clear error messages on validation failure. |
| 1.2  | Completed | 2026-05-06 06:30 PM (PST) | 2026-05-06 06:30 PM (PST) | Integrate Ajv for client-side JSON Schema validation. Load `data/schema/certification.schema.json` once on first call, cache for subsequent loads. Evaluate CDN (esm.sh/ajv) vs vendored copy; prefer CDN for simplicity. |
| 1.3  | Completed | 2026-05-06 06:30 PM (PST) | 2026-05-06 06:30 PM (PST) | ExamLoader error handling: network errors, invalid JSON, schema validation failures. Surface user-friendly error in `#error-message` element (same pattern as current XMLParser failures in `js/app.js`). |
| 1.4  | Completed | 2026-05-06 06:30 PM (PST) | 2026-05-06 06:32 PM (PST) | Unit-test ExamLoader against a known-good JSON file and a deliberately broken one. Verify schema validation catches missing fields, wrong types, extra choices, bad difficulty enum. |
| 1.5  | Completed | 2026-05-06 06:32 PM (PST) | 2026-05-06 06:33 PM (PST) | Stage all changes, commit Phase 1. |

### Phase 1 Summary

- **Changes:** Created `js/exam-loader.js` (ExamLoader class with Ajv 2020-12 validation via esm.sh CDN, schema caching, graceful degradation). Created `tests/fixtures/sample-exam.json` fixture. Created `tests/unit/exam-loader.test.js` (10 tests covering load, shape, caching, HTTP errors, JSON parse errors, schema validation failures, graceful degradation). Added `ajv@8` and `ajv-formats@3` as devDependencies for test mocks.
- **Changes hosted at:** TBD
- **Commit:** `Add ExamLoader with JSON Schema validation (replaces XMLParser)`

---

## Phase 2: Rewire app.js to Use ExamLoader

**Goal:** `js/app.js` imports and uses ExamLoader instead of XMLParser. All exam paths resolve to `.json` files. Quiz functionality is unchanged.

**Depends on:** Phase 1.

| Row  | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 2.1  | Completed | 2026-05-06 06:36 PM (PST) | 2026-05-06 06:36 PM (PST) | In `js/app.js`: replace `import { XMLParser }` with `import { ExamLoader }`. Replace `this.parser = new XMLParser()` with `this.loader = new ExamLoader()`. |
| 2.2  | Completed | 2026-05-06 06:36 PM (PST) | 2026-05-06 06:38 PM (PST) | In `js/app.js` line ~165: change exam path from `data/${provider}/${examId}.xml` to `data/${provider}/${examId}.json`. Update `loadExam()` call site. |
| 2.3  | Completed | 2026-05-06 06:38 PM (PST) | 2026-05-06 06:38 PM (PST) | In `quiz.html`: update any script references if needed (likely none — app.js is the entry point). |
| 2.4  | Completed | 2026-05-06 06:38 PM (PST) | 2026-05-06 06:39 PM (PST) | Smoke-test: open quiz.html?exam=saa-c03, az-305, cca-f in browser. Verify questions load, answers submit, hints reveal, progress saves. |
| 2.5  | Completed | 2026-05-06 06:39 PM (PST) | 2026-05-06 06:40 PM (PST) | Stage all changes, commit Phase 2. |

### Phase 2 Summary

- **Changes:** Rewired `js/app.js` to import ExamLoader instead of XMLParser, changed exam path from `.xml` to `.json`. Updated `quiz.html` CSP to allow `esm.sh` CDN for Ajv. Added vitest resolve aliases for CDN imports in `vitest.config.js`. Simplified `exam-loader.test.js` to use config-level aliases. All 182 tests pass.
- **Changes hosted at:** TBD
- **Commit:** `Rewire app.js to load JSON exams via ExamLoader`

---

## Phase 3: Preserve Custom Quiz Logic and Clean Up

**Goal:** Any custom quiz behavior (hint system, progress tracking, answer randomization) is verified intact. XMLParser is retained for output comparison.

**Depends on:** Phase 2.

| Row  | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 3.1  | Completed | 2026-05-06 06:41 PM (PST) | 2026-05-06 06:42 PM (PST) | Verify hint system (3-level progressive reveal) works with JSON-loaded data. Hints contain HTML — confirm rendering is preserved. |
| 3.2  | Completed | 2026-05-06 06:42 PM (PST) | 2026-05-06 06:42 PM (PST) | Verify progress-tracker.js save/load/clear cycle works end-to-end with JSON-loaded exams. Check localStorage keys are consistent. |
| 3.3  | Completed | 2026-05-06 06:42 PM (PST) | 2026-05-06 06:42 PM (PST) | Verify quiz-engine.js: answer submission, scoring, result export all function correctly. |
| 3.4  | Completed | 2026-05-06 06:42 PM (PST) | 2026-05-06 06:46 PM (PST) | Keep `js/xml-parser.js` and its tests. Verify XMLParser and ExamLoader produce equivalent `{metadata, questions, glossary}` output for the same exam. |
| 3.5  | Completed | 2026-05-06 06:46 PM (PST) | 2026-05-06 06:47 PM (PST) | Verify all 10 providers load correctly: aws, azure, gcp, anthropic, comptia, isc2, github, databricks, nvidia, cisco. Spot-check one exam per provider. |
| 3.6  | Completed | 2026-05-06 06:47 PM (PST) | 2026-05-06 06:48 PM (PST) | Stage all changes, commit Phase 3. |

### Phase 3 Summary

- **Changes:** Added `tests/integration/xml-json-equivalence.test.js` (13 tests verifying XMLParser ↔ JSON structural equivalence). Aligned test fixtures (`sample-exam.xml` and `sample-exam.json`) to use identical content matching the JSON schema (difficulty enum, 3 hints per question, date-time format). Updated test expectations in `xml-parser.test.js` and `data-flow.integration.test.js` to match. Verified all 10 providers (50 JSON exams) load correctly. All 195 tests pass.
- **Changes hosted at:** TBD
- **Commit:** `Verify quiz features with JSON loader, retain XMLParser for comparison`

---

## Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Client-side schema validation via Ajv | Catches corrupt data before the quiz engine sees it. Server-side validation already happens in the Python conversion script; client-side is the defense-in-depth layer. |
| 2 | Single ExamLoader class, not a generic "parser" | JSON needs no parsing beyond `response.json()`. The class exists for schema validation, error handling, and caching — not format translation. |
| 3 | Retain XMLParser for output comparison | User wants to compare XML and JSON loader outputs side by side. XMLParser and its tests stay in the repo alongside ExamLoader. |
| 4 | Load schema once, cache in ExamLoader instance | Avoids re-fetching the schema on every exam load. Schema changes require a page refresh, which is acceptable. |
