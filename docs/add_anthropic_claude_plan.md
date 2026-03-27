# Anthropic CCA-F — Phased Release Plan

Work queue for adding Anthropic as the 4th certification provider with the CCA-F (Claude Certified Architect, Foundations) exam.

Design spec: `docs/add_anthropic_claude_design.md` (sections 9–20)

---

## Status Legend

| Symbol | Meaning           |
|--------|-------------------|
| `[ ]`  | Available         |
| `[>]`  | Processing        |
| `[X]`  | Completed         |
| `[!]`  | Blocked / Paused  |

---

## Phase 1: Research & Domain Analysis

> Independent. No code changes. Produces the research document that informs question authoring in Phase 3.

| #   | Task                                                                                              | Status | Started | Completed |
|-----|---------------------------------------------------------------------------------------------------|--------|---------|-----------|
| 1.1 | Gather official Anthropic certification facts (exam name, purpose, public resources, availability) | [X]    | 2026-03-26 14:00 PST | 2026-03-26 14:00 PST |
| 1.2 | Gather community-reported observations (themes, scenario patterns, recurring public claims)         | [X]    | 2026-03-26 14:00 PST | 2026-03-26 14:00 PST |
| 1.3 | Survey public question ecosystems (repos, forums, prep courses, blogs, sample-question pages)      | [X]    | 2026-03-26 14:00 PST | 2026-03-26 14:00 PST |
| 1.4 | Define authoring guidance for generating original practice questions from research                  | [X]    | 2026-03-26 14:00 PST | 2026-03-26 14:00 PST |
| 1.5 | Assemble research document at `docs/anthropic-cca-f-research.md` (4 sections per design spec)      | [X]    | 2026-03-26 14:00 PST | 2026-03-26 14:00 PST |
| 1.6 | Define topic-to-question allocation plan (50 questions across 12 topic areas, balanced)             | [X]    | 2026-03-26 14:00 PST | 2026-03-26 14:00 PST |

---

## Phase 2: Provider Scaffolding

> Independent of Phase 1. Wires Anthropic into the application with stub data so the full navigation path is testable before content is ready.

| #   | Task                                                                                                         | Status | Started | Completed |
|-----|--------------------------------------------------------------------------------------------------------------|--------|---------|-----------|
| 2.1 | Add Anthropic provider card to `index.html` home page (logo/SVG, name, description, badge "1 Exam", link)    | [X]   | 2026-03-26 09:00 PST | 2026-03-26 09:00 PST |
| 2.2 | Add Anthropic CSS rules to `index.html` (hover border color, provider-name color, badge color)               | [X]   | 2026-03-26 09:00 PST | 2026-03-26 09:00 PST |
| 2.3 | Create `anthropic.html` provider page with CCA-F exam card (follow `aws.html` pattern)                       | [X]   | 2026-03-26 09:00 PST | 2026-03-26 09:00 PST |
| 2.4 | Register Anthropic in `js/app.js` — `getProviderFromExam()`: recognize `cca-` prefix → `'anthropic'`         | [X]   | 2026-03-26 09:00 PST | 2026-03-26 09:00 PST |
| 2.5 | Register Anthropic in `js/app.js` — `setBackLinks()`: add `anthropic: 'anthropic.html'` to `providerPages`   | [X]   | 2026-03-26 09:00 PST | 2026-03-26 09:00 PST |
| 2.6 | Register Anthropic in `js/app.js` — `updateExamInfo()`: add `anthropic` to `providerPages` and `providerNames` | [X]   | 2026-03-26 09:00 PST | 2026-03-26 09:00 PST |
| 2.7 | Create `data/anthropic/` directory and a stub `cca-f.xml` with 3 valid placeholder questions                  | [X]   | 2026-03-26 09:00 PST | 2026-03-26 09:00 PST |
| 2.8 | Verify `quiz.html?exam=cca-f` loads and renders the stub questions without errors                             | [ ]    |         |           |
| 2.9 | Verify full navigation path: home → `anthropic.html` → quiz → back-link returns to `anthropic.html`          | [ ]    |         |           |
| 2.10 | When [Submit Anser] is pressed add behavior to expand hints to full for that question.                       | [ ]    |         |           |

---

## Phase 3: Question Authoring

> Depends on Phase 1 (research informs content). Each task produces a batch of original questions for one topic area. All questions must include: title, optional scenario, question stem, 4 choices, 1 correct answer, 1 explanation, 3 progressive hints.

| #    | Task                                                                         | Status | Started | Completed |
|------|------------------------------------------------------------------------------|--------|---------|-----------|
| 3.1  | Author questions: Agentic architecture & orchestration                       | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.2  | Author questions: Claude API usage patterns                                  | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.3  | Author questions: Tool design and tool calling                               | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.4  | Author questions: MCP-oriented integration thinking                          | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.5  | Author questions: Claude Code workflows & configuration patterns             | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.6  | Author questions: Prompt engineering for reliable behavior                    | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.7  | Author questions: Structured output & validation                             | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.8  | Author questions: Context management & context-window tradeoffs              | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.9  | Author questions: Guardrails & safe escalation patterns                      | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.10 | Author questions: Retry, recovery & error-handling design                    | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.11 | Author questions: Human-in-the-loop workflow decisions                       | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |
| 3.12 | Author questions: Long-document & multi-step workflow strategies             | [X]   | 2026-03-26 09:15 PST | 2026-03-26 09:30 PST |

---

## Phase 4: XML Assembly & Validation

> Depends on Phase 3. Assembles all authored questions into the production XML file, validates structure, and runs answer randomization.

| #   | Task                                                                                                 | Status | Started | Completed |
|-----|------------------------------------------------------------------------------------------------------|--------|---------|-----------|
| 4.1 | Assemble all 50 questions into `data/anthropic/cca-f.xml` following the existing XML schema          | [ ]    |         |           |
| 4.2 | Validate XML metadata (exam-code: CCA-F, provider: Anthropic, total-questions: 50, categories)       | [ ]    |         |           |
| 4.3 | Validate every question has: title, stem, 4 choices (A–D), correct-answer, explanation, 3 hints      | [ ]    |         |           |
| 4.4 | Run answer randomization script (`scripts/randomize_answers.py`) on `data/anthropic/cca-f.xml`       | [ ]    |         |           |
| 4.5 | Verify XML loads without parser errors via `XMLParser.loadExam()`                                    | [ ]    |         |           |
| 4.6 | Remove stub XML from Phase 2 if still present (replace with production file)                         | [ ]    |         |           |
---

## Phase 5: Integration Testing & Acceptance

> Depends on Phase 2 + Phase 4. End-to-end verification against design spec section 19 acceptance criteria.

| #    | Task                                                                                                       | Status | Started | Completed |
|------|------------------------------------------------------------------------------------------------------------|--------|---------|-----------|
| 5.1  | Home page visibly shows Anthropic as a fourth provider card                                                | [ ]    |         |           |
| 5.2  | Selecting Anthropic provider card opens `anthropic.html`                                                   | [ ]    |         |           |
| 5.3  | Anthropic provider page contains exactly one exam card for CCA-F                                           | [ ]    |         |           |
| 5.4  | Exam card indicates 50 questions                                                                           | [ ]    |         |           |
| 5.5  | Selecting exam card opens `quiz.html?exam=cca-f`                                                           | [ ]    |         |           |
| 5.6  | Fresh session begins at Question 1 of 50                                                                   | [ ]    |         |           |
| 5.7  | Quiz header correctly identifies Anthropic and CCA-F                                                       | [ ]    |         |           |
| 5.8  | Quiz back-link returns to `anthropic.html`                                                                 | [ ]    |         |           |
| 5.9  | All 50 questions load from `data/anthropic/cca-f.xml`                                                      | [ ]    |         |           |
| 5.10 | Every question renders: 4 choices, 1 correct answer, 1 explanation, 3 progressive hints                    | [ ]    |         |           |
| 5.11 | Submit behavior, correctness feedback, and score display work correctly                                    | [ ]    |         |           |
| 5.12 | Previous/next navigation and keyboard arrow navigation work                                                | [ ]    |         |           |
| 5.13 | Progressive hint reveal works (3 levels per question)                                                      | [ ]    |         |           |
| 5.14 | Local storage persistence saves and restores session (answers, hints, progress, completion)                 | [ ]    |         |           |
| 5.15 | Returning user receives continue-or-start-fresh prompt                                                     | [ ]    |         |           |
| 5.16 | Completion display works at end of exam                                                                    | [ ]    |         |           |
| 5.17 | UI copy distinguishes official certification info from local study content                                  | [ ]    |         |           |
| 5.18 | Naming consistency verified: "Anthropic", "CCA-F", "Claude Certified Architect, Foundations" used everywhere | [ ]    |         |           |
| 5.19 | Full acceptance criteria walkthrough (design spec section 19) — all criteria pass                            | [ ]    |         |           |

---

## Phase Dependencies

```
Phase 1 ──────────────────► Phase 3 ──► Phase 4 ──┐
                                                    ├──► Phase 5
Phase 2 ──────────────────────────────────────────┘
```

Phases 1 and 2 are independent and can run in parallel.
Phase 3 requires Phase 1 output (research document + topic allocation).
Phase 4 requires Phase 3 output (authored questions).
Phase 5 requires both Phase 2 (scaffolding) and Phase 4 (production XML).
