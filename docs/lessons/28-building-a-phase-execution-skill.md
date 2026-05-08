# Building a Phase Execution Skill

## The Lesson

A phased plan is only as good as its execution discipline. A `/phase` skill automates the mechanical parts of plan execution — picking the next task, timestamping start/completion, verifying work, committing atomically — so the human (or AI) can focus on doing the actual work rather than maintaining the plan document. The skill's value is in enforcing invariants (never commit partial phases, never skip status updates) that humans forget under pressure.

## Context

A development workflow used markdown plan files with status tables (Open → Started → Completed) to track phased work. Each phase contained 4-8 tasks, and each task had a description, status, start timestamp, and completion timestamp. Multiple features (Anthropic provider, Atlas design system, XML-to-JSON migration, code review remediation) were delivered this way — 20+ phases across 4 plans. The manual process worked but was error-prone: developers forgot to update timestamps, committed partial phases, or lost track of which row was next after interruptions.

## What Happened

1. The plan file format was standardized: a markdown table with columns `PhaseNo`, `Status`, `Started (PST)`, `Completed (PST)`, `Description`. State transitions were defined: Open → Started → Completed (with Blocked as an escape hatch).
2. A `/phase` skill was written to automate one iteration of the execution loop: read the plan, find the next Open row, flip to Started with timestamp, do the work, verify, flip to Completed, loop until the phase is done, then commit.
3. The skill was given a "resume" capability: if a row is already `Started` (from a previous interrupted session), it picks up that row instead of starting a new one. This makes the plan file the single source of truth for "where are we?"
4. A commit protocol was enforced: one commit per phase, only when all rows are Completed and verification passes. This prevents the main branch from ever containing partial work.
5. An autonomy mode was added: when explicitly authorized, the skill runs end-to-end across multiple phases without pausing. It only stops for destructive actions (push, deploy, delete).
6. Hard rules were defined to prevent the most common execution failures: never skip timestamps, never batch phases, never push (that requires separate authorization).

## Key Insights

- **The plan file is the state machine, not the AI's memory.** If the skill crashes mid-row, the next invocation sees `Status: Started` and resumes. If the plan file says Open, the work hasn't started — regardless of what happened in a previous conversation. This makes execution restart-safe across session boundaries.
- **Timestamps are audit data, not decoration.** Recording when each row started and completed provides velocity metrics ("Phase 3 took 4 hours"), enables post-mortems ("row 3.2 was started at 2pm but not completed until 6pm — what blocked it?"), and proves work actually happened in the claimed order.
- **One commit per phase is a forcing function for quality.** You can't commit until every row is done and verification passes. This prevents "commit the easy rows now, come back to the hard ones later" — which inevitably means the hard ones never get done.
- **The Blocked state is an explicit escape hatch.** Without it, a row that can't be completed would stall the entire phase forever. Blocked + a one-line reason lets execution continue past obstacles while creating a visible record of what needs resolution.
- **Never push is the safest default.** Pushing is irreversible (others pull it). Committing is local and reversible. The skill commits freely but never pushes — that requires explicit per-message authorization from the user, enforced by a git hook.
- **Autonomy requires explicit opt-in.** The default behavior is: complete one phase, commit, report, stop. Running end-to-end ("go autonomous") is a separate mode that the user must explicitly request. This prevents runaway execution on large plans.

## The Skill File Explained

### Frontmatter

```yaml
---
name: phase
description: Execute the next Open row in the active plan file (Stage 4 execution loop from CLAUDE.md). Picks the next Open row, flips it to Started with a PST timestamp, does the work, flips to Completed with a PST timestamp, then continues until the phase is done.
argument-hint: "[plan-file-path]"
---
```

The argument is optional — if omitted, the skill finds the most recently modified `docs/*_plan.md` in the project. This "convention over configuration" approach means users can just type `/phase` without remembering file paths.

### Plan File Discovery

```markdown
The argument `$ARGUMENTS` is a path to the plan file. If empty, find the plan file by:
1. Looking for `docs/*_plan.md` in the current working directory.
2. If multiple matches, picking the most recently modified one.
3. If still ambiguous, **stop and ask the user** — do not guess.
```

The three-step fallback (explicit path → glob → ask) balances convenience with safety. Guessing wrong (executing the wrong plan) is worse than asking a clarifying question.

### The 7-Step Protocol

```markdown
### 1. Read the plan file
### 2. Flip the row to Started
### 3. Do the work described in the row
### 4. Verify the work
### 5. Flip the row to Completed
### 6. Loop or finish the phase
### 7. Stage and commit
```

Each step is atomic and observable. The plan file is saved after step 2 (Started) and step 5 (Completed) — so even a crash between steps leaves the state file accurate. Step 4 (Verify) is the quality gate: the row cannot advance to Completed while verification fails.

### Verification Logic

```markdown
Run any verification the row implies. If verification fails:
- If fixable in this row's scope, fix it and re-verify.
- If the row's description was wrong, mark Blocked with a reason.
- Never mark a row Completed while verification is failing.
```

This prevents "green-washing" — marking work done when it's actually broken. The AI must prove the work is correct before advancing. The Blocked state provides an honest exit when the task itself is flawed.

### Phase Summary Block

```markdown
### Phase N Summary
- **Changes:** [What was created/modified.]
- **Changes hosted at:** TBD
- **Commit:** `[Phase commit message]`
```

Written at the end of each phase, the summary serves three purposes: (1) it's the commit message source, (2) it's a historical record in the plan file, (3) it marks the phase boundary for future readers.

### Hard Rules

```markdown
- Never skip the row-status updates.
- Never batch multiple phases into one commit.
- Never commit a partial phase.
- Never git push.
- If unsure which row to pick, STOP and ask.
```

These five rules encode the invariants that make phased execution trustworthy. Breaking any one of them compromises the plan file as a source of truth — and once the plan file is unreliable, the entire workflow breaks down.

## Applicability

This skill pattern works for any multi-step execution workflow with checkpoints: deployment runbooks, data migration playbooks, infrastructure provisioning sequences, onboarding checklists. The key ingredients are: a persistent state file (the plan), atomic status transitions with timestamps, verification gates between steps, and a commit boundary that ensures partial work never reaches shared state.

It does NOT work for highly parallel work where tasks have no ordering, or for exploratory work where the next step depends on the result of the current step in unpredictable ways. Those need different coordination patterns (kanban boards, decision trees).

## Related Lessons

- [Phased Release Planning](14-phased-release-planning.md) — the plan format that this skill executes; the skill is the automation layer on top of the planning pattern
- [Building a Lessons Skill](26-building-a-lessons-skill.md) — same SKILL.md architecture; `/phase` and `/lessons` share the frontmatter + protocol + hard rules pattern
- [Building a Review Skill](27-building-a-review-skill.md) — `/review` produces the findings; `/phase` executes the remediation plan that `/review` generates
- [Design-First Development](15-design-first-development.md) — `/phase` is Stage 4 of the five-stage workflow; design and planning happen before execution begins
