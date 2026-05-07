# Design-First Development

## The Lesson

Writing a design document and a Physical Design Requirements (PDR) document before coding catches architectural mistakes when they're cheapest to fix. The design doc explores the problem space; the PDR specifies the physical implementation. Skipping either leads to rework: skipping design means building the wrong thing; skipping PDR means building the right thing in the wrong way.

## Context

The certification project used a five-stage development process for non-trivial features:
1. **Design** — explore the problem space (design doc)
2. **PDR** — define the physical implementation (what to build, what to reuse)
3. **Plan** — break PDR into ordered phases
4. **Execute** — implement each phase
5. **Commit** — one commit per phase when green

This was applied to: Anthropic provider addition, Atlas design system rollout, XML-to-JSON migration, and code review remediation.

## What Happened

1. The Anthropic provider addition was the first feature to follow the full five-stage process. A design doc explored the exam format, question bank requirements, and topic coverage before any code was written.
2. The design doc identified that 50 questions across 12 topic areas was the right scope — a decision that would have been much more expensive to change after authoring began.
3. A PDR specified the exact files to create, the XML schema to follow, and the provider-detection prefix (`cca-*`). The plan then broke this into 5 phases (research → scaffold → author → assemble → integration test).
4. The Atlas design system rollout followed the same process: a design doc defined the token inventory and component library, a PDR specified the migration order and bridge-variable strategy, and a plan broke the rollout into 6 phases.
5. The XML-to-JSON migration skipped the full design doc (scope was narrow enough) but still wrote a PDR-level plan. This worked because the decision space was small — there was only one reasonable approach.
6. A "second opinion" pattern emerged: after writing a design doc, an AI architect agent reviewed it for blind spots. This caught a missing dark-mode consideration in the Atlas design that would have required rework.

## Key Insights

- **The design doc is not the PDR.** The design doc asks "what should we build and why?" The PDR asks "how should we build it — what files, what dependencies, what data model?" Conflating them produces documents that are too abstract to implement or too detailed to evaluate.
- **Design docs should enumerate options, not just the chosen one.** If there's only one option, there's nothing to design. The value of the design phase is evaluating alternatives.
- **PDRs should reference existing assets.** A table of "Existing Infrastructure to Reuse" prevents reinventing code that already exists. This is especially valuable in projects with accumulated utility scripts and modules.
- **The plan is a mechanical translation of the PDR.** If the PDR is specific enough, the plan almost writes itself. If writing the plan requires making new design decisions, the PDR was underspecified.
- **Design docs are cheap; wrong implementations are expensive.** A design doc takes 30-60 minutes. Discovering after implementation that you chose the wrong data format, wrong library, or wrong architecture costs days of rework.
- **Second opinions on design docs catch blind spots.** Having another engineer (or an AI architect agent) review the design doc specifically for "what's wrong, weak, or risky" surfaces assumptions the author didn't question.

## Applicability

Design-first pays off for features that involve architectural decisions, new data formats, or multi-phase rollouts. It is overkill for bug fixes, single-file changes, config tweaks, and anything where the implementation is obvious. A good heuristic: if the work will touch more than 3 files or take more than 2 hours, write a design doc first.

## Related Lessons

- [Phased Release Planning](14-phased-release-planning.md) — the plan is Stage 3 of the same workflow; design docs feed directly into phased plans
- [Lessons Learned as a Practice](24-lessons-learned-as-a-practice.md) — design docs are forward-looking, lessons are backward-looking; they complement each other
