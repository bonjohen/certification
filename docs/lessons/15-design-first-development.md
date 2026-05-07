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

## Key Insights

- **The design doc is not the PDR.** The design doc asks "what should we build and why?" The PDR asks "how should we build it — what files, what dependencies, what data model?" Conflating them produces documents that are too abstract to implement or too detailed to evaluate.
- **Design docs should enumerate options, not just the chosen one.** If there's only one option, there's nothing to design. The value of the design phase is evaluating alternatives.
- **PDRs should reference existing assets.** A table of "Existing Infrastructure to Reuse" prevents reinventing code that already exists. This is especially valuable in projects with accumulated utility scripts and modules.
- **The plan is a mechanical translation of the PDR.** If the PDR is specific enough, the plan almost writes itself. If writing the plan requires making new design decisions, the PDR was underspecified.
- **Design docs are cheap; wrong implementations are expensive.** A design doc takes 30-60 minutes. Discovering after implementation that you chose the wrong data format, wrong library, or wrong architecture costs days of rework.
- **Second opinions on design docs catch blind spots.** Having another engineer (or an AI architect agent) review the design doc specifically for "what's wrong, weak, or risky" surfaces assumptions the author didn't question.

## Information Needed to Complete This Document

- [ ] Include template structures for both design doc and PDR
- [ ] Show a real example where the design phase changed the approach (vs. going with the first idea)
- [ ] Discuss when design-first is overkill (bug fixes, small features, config changes)
- [ ] Compare to other design processes (RFCs, ADRs, PRDs)
- [ ] Address the risk of over-designing: spending too long in design when the implementation would have been straightforward
