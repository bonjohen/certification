# Code Review Driven Remediation

## The Lesson

A whole-codebase code review is only as valuable as the remediation that follows it. The review itself produces a findings document. The remediation requires a separate phased plan that prioritizes findings by severity, groups them into shippable phases, and tracks each fix to completion with test verification.

## Context

A comprehensive code review of the certification quiz site identified 11 findings (F-01 through F-11) ranging from XSS vulnerabilities to test coverage gaps to orphan data files. The review was structured as: Executive Summary → Review Scope → Project Shape → Phased Remediation Plan.

## How Remediation Was Structured

1. **Phase 1: Foundation and Trust** (7 tasks) — XSS sanitization, CSP, provider-detection test fix. These are the findings that could cause harm to users.
2. **Phase 2: Correctness and Maintainability** (7 tasks) — Orphan file cleanup, namespace normalization, re-submission guard. Real issues but no user-facing risk.
3. **Phase 3: Test and Release Confidence** (7 tasks) — Integration tests, DOM testing with jsdom, XML schema validation script. Closing coverage gaps.
4. **Phase 4: CI and Documentation** (7 tasks) — README updates, docs index, accessibility audit. Polish and infrastructure.

Each phase was committed independently. Test count grew from 118 → 129 → 172 across phases.

## Key Insights

- **Severity drives phase order, not effort.** The XSS fix (Phase 1) was actually simpler than the integration tests (Phase 3), but it shipped first because it was the highest-risk finding.
- **Each phase must be independently shippable.** Phase 2 can be skipped or deferred without making Phase 1 incomplete. This lets the team ship urgent fixes immediately and schedule lower-priority work.
- **Test count is the progress metric.** Starting at 118 tests and ending at 172 tests provides concrete evidence that remediation added coverage, not just "fixes."
- **The review document is the requirements spec.** Each finding has a finding ID (F-01), a severity, and a specific description. The remediation plan references these IDs, creating traceability from finding → task → commit.
- **A code review that doesn't produce a remediation plan is just opinions.** The review document alone changes nothing. The phased plan with tracked tasks is what drives actual improvement.

## Information Needed to Complete This Document

- [ ] Include the full findings list (F-01 through F-11) with severities
- [ ] Show how finding IDs map to remediation tasks
- [ ] Discuss how the review scope was defined (what was in scope, what was out)
- [ ] Document the review execution method (manual reading, automated tools, test runs)
- [ ] Compare to other code review approaches (PR-based review, audit firms, static analysis)
