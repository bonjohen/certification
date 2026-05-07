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

## Information Needed to Complete This Document

- [ ] Include a real plan excerpt showing the progression from Open to Completed
- [ ] Compare this approach to Agile sprints, Kanban boards, and GitHub Issues
- [ ] Discuss when this formality is overkill (small changes, single-file fixes)
- [ ] Document the commit protocol: what goes in the commit message
- [ ] Show how blocked tasks are handled (what information to record, when to escalate)
