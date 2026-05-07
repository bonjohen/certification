# Phased Release Planning

## The Lesson

Breaking large features into ordered phases — each independently shippable, each ending with a commit — transforms ambitious work into manageable steps with explicit progress tracking. The phase plan is both a work queue and an audit trail.

## Context

Multiple large features in the certification project were delivered using phased plans:
- Adding the Anthropic provider (5 phases: research → scaffold → author questions → assemble → integration test)
- XML-to-JSON migration (4 phases: loader → rewire → verify → equivalence tests)
- Atlas design system rollout (6 phases: tokens → landing → providers batch 1 → providers batch 2 → results → cleanup)
- Code review remediation (4 phases by severity)

## The Pattern

Each plan follows this structure:

```
## Phase N: [Title]
Goal: [What is true after this phase completes]
Depends on: [Prior phase or "Nothing"]

| Row | Status | Started | Completed | Description |
|-----|--------|---------|-----------|-------------|
| N.1 | Open   |         |           | [Task]      |
| N.2 | Open   |         |           | [Task]      |
```

State transitions: `Open → Started → Completed` (or `Open → Started → Blocked → Started → Completed`). Timestamps are recorded in PST.

## Key Insights

- **The goal statement is the phase's acceptance criteria.** "What is true after this phase completes" is a single sentence that everyone can verify. "Add integration tests" is vague. "All 19 acceptance criteria pass in jsdom" is verifiable.
- **Phase dependencies create a DAG, not a sequence.** Most phases depend on the prior phase, but some are parallel. Making dependencies explicit allows parallel work when possible.
- **One commit per phase enforces atomic progress.** If a phase is half-done, it's not committed. This means the main branch is always in a clean state and each commit is a complete unit of work.
- **Timestamps create an audit trail.** Recording when each task started and completed provides velocity data and makes post-mortems possible. "Phase 3 took 4 hours" is useful planning data for future similar work.
- **The plan document is a living artifact.** It's updated as work proceeds (status changes, timestamps added, blockers noted) and checked in alongside the code. After completion, it serves as a historical record of how the feature was built.
- **Numbering is sequential within phases, not global.** Task 3.2 is the second task in phase 3, not the 32nd task overall. This makes phases independently reorderable.

## Applicability

Phased planning works for any work that spans more than 2-3 commits and benefits from explicit progress tracking. It is overkill for single-file fixes, typo corrections, and config changes. A good heuristic: if the work would take more than one session or involves more than one logical unit of change, write a phase plan. If it's a single atomic change, just do it.

## Related Lessons

- [Design-First Development](15-design-first-development.md) — phased plans are Stage 3 of the five-stage workflow; they translate PDR decisions into ordered work
- [Code Review Driven Remediation](13-code-review-remediation.md) — the remediation plan is a phased plan driven by severity rather than dependency order
- [Lessons Learned as a Practice](24-lessons-learned-as-a-practice.md) — the phased plan structure inspired the lesson template's numbered "What Happened" steps
