# Lessons Learned as a Practice

## The Lesson

Systematically extracting lessons from project work — and writing them as standalone documents — turns ephemeral experience into a durable knowledge base. The practice is most valuable when it is automated enough to be low-friction (discovery from git history) but requires human judgment for what actually matters (selecting which lessons to write, ensuring they generalize beyond the source project).

## Context

A development team had completed dozens of features, migrations, code reviews, and bug fixes across a multi-provider web application. The decisions and patterns behind that work existed only in commit messages, design docs, and the memories of the people involved. When similar situations arose in other projects, the same mistakes were repeated because the knowledge was locked in the original project's git history.

## What Happened

1. A manual review of 73 commits identified 23 distinct lessons spanning data quality, architecture, process, testing, and data engineering
2. Each lesson was written as a standalone markdown document with a consistent structure: a general principle (The Lesson), project context (Context), a narrative of what happened (What Happened), and reusable observations (Key Insights)
3. An index grouped lessons into five categories with one-line descriptions, making the collection browsable
4. A template was created to standardize future lessons and provide inline authoring guidance for each section
5. The template and index were combined into a skill specification (`/lessons`) with four modes: discover new candidates from git history, write a specific lesson, list the index, and audit existing lessons for completeness
6. The skill was deployed as a reusable Claude Code slash command, available across all projects

## Key Insights

- **Discovery should be automated; selection should be human.** Git history contains hundreds of commits, but only some represent genuine lessons. A skill can scan commit patterns (bug fixes, migrations, multi-commit sequences) and propose candidates, but the human decides which are worth writing up. Automated discovery prevents lessons from being forgotten; human selection prevents noise.
- **Standalone independence is the hardest quality to achieve.** Writers naturally reference internal file paths, class names, and project-specific context. A lesson that requires codebase access to understand is a design doc, not a lesson. The discipline is: general principle in The Lesson and Key Insights, project specifics confined to Context and What Happened.
- **Drafts are more valuable than nothing.** A lesson that captures the core insight in two sentences and defers the full narrative is still useful — it marks the existence of a lesson that can be fleshed out later. Waiting until you have time to write a polished document means the lesson never gets written. The `/lessons` skill explicitly supports Draft / Partial / Complete levels.
- **The template is the quality mechanism.** Without a template, lessons vary wildly in structure, depth, and usefulness. The template's section contracts (1-3 sentences for The Lesson, 4-8 steps for What Happened, 4-6 actionable insights) prevent both thin throwaway notes and sprawling narratives.
- **Lessons are backward-looking; design docs are forward-looking.** Design docs ask "what should we build?" Lessons ask "what did we learn from building it?" They complement each other but serve different purposes. A project that only writes design docs captures intent; a project that also writes lessons captures wisdom.
- **Cross-project value requires a central archive.** Lessons stored in `docs/lessons/` within one project are invisible to other projects. A central location (a shared archive directory, a wiki, a dedicated repository) makes lessons discoverable across the organization. The source project keeps its copy; the archive gets a copy of lessons that generalize.

## Examples

### Good lesson statement vs. bad

| Quality | Example |
|---------|---------|
| Good | "When hints contain the exact text of the correct answer, they short-circuit learning. This is invisible in manual review but easy to detect programmatically." |
| Bad | "We found that 45 H1 hints in 28 XML files contained verbatim answer text and fixed them with fix_verbatim_h1.py." |

The good version states a general principle anyone can apply. The bad version is a project status update.

### Good insight vs. bad

| Quality | Example |
|---------|---------|
| Good | **"Equivalence tests are temporary by design."** Once the migration is complete and the old format is retired, the equivalence tests can be deleted. They exist only to bridge the migration. |
| Bad | **"We wrote a lot of tests."** The equivalence test suite had 5,101 assertions. |

The good version is actionable — it tells you when to create and when to delete this type of test. The bad version is a metric with no guidance.

## Applicability

This practice applies to any team or individual that:
- Works on multiple projects over time and wants to avoid repeating mistakes
- Onboards new team members who need to understand past decisions
- Uses AI coding assistants that benefit from project-specific context (lessons can inform CLAUDE.md or similar files)
- Runs retrospectives but doesn't persist the insights beyond meeting notes

It is less valuable when:
- The project is a one-off throwaway with no future maintenance
- The team is so small (one person) that all context lives in one head and the person never forgets (rare)
- The work is purely routine with no novel decisions (also rare)

## Related Lessons

- [Phased Release Planning](14-phased-release-planning.md) — the phased plan structure inspired the lesson template's emphasis on ordered steps and explicit state
- [Design-First Development](15-design-first-development.md) — design docs and lessons are complementary artifacts in the same workflow
- [Code Review Driven Remediation](13-code-review-remediation.md) — code reviews produce findings; lessons capture what was learned from fixing them
