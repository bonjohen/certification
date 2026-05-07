# `/lessons` Skill Design

This document specifies a Claude Code skill that extracts lessons learned from project work and produces standalone learning documents.

## Purpose

The `/lessons` skill mines a project's git history, design docs, plans, code reviews, and file changes to identify reusable lessons — patterns that worked, mistakes that were caught, decisions that paid off or didn't. Each lesson is written as a standalone document that is useful to a reader who has never seen the codebase.

## Invocation

```
/lessons                          # Scan for new lessons, propose additions
/lessons write <topic>            # Write or complete a specific lesson
/lessons list                     # Show the current index
/lessons audit                    # Check existing lessons for completeness
```

## Output Location

- Lesson files: `docs/lessons/NN-slug-title.md`
- Index: `docs/lessons/README.md`
- Template: `docs/lessons/TEMPLATE.md`

## Skill Behavior

### `/lessons` (no argument) — Discover

1. Read `docs/lessons/README.md` to know what lessons already exist.
2. Scan for new lesson candidates by examining:
   - `git log --oneline` for patterns: bug fixes, migrations, refactors, scaling events, remediation phases
   - `docs/` for design docs, PDRs, plans, review results, audit reports
   - Commit messages containing "Fix", "Refactor", "Migrate", "Add", "Port", "Remove", "Enrich"
   - Multi-commit sequences that tell a story (phased work, iterative improvement)
3. For each candidate, check whether an existing lesson already covers it.
4. Present the new candidates as a numbered list with proposed titles and one-line descriptions.
5. Do not write any files. Wait for the user to select which lessons to write.

### `/lessons write <topic>` — Author

1. Read the template at `docs/lessons/TEMPLATE.md`.
2. Research the topic thoroughly:
   - Read relevant commits (`git log --stat`, `git show`)
   - Read related docs, plans, review results
   - Read the actual code changes when the lesson is about a code decision
3. Assign the next available number and a slug: `NN-slug-title.md`.
4. Write the lesson file following the template structure (see Template below).
5. Add the lesson to `docs/lessons/README.md` under the appropriate category.
6. If the lesson references other existing lessons, add cross-references in both directions.

### `/lessons list` — Index

Print the current contents of `docs/lessons/README.md` to the conversation.

### `/lessons audit` — Completeness Check

1. Read every lesson file in `docs/lessons/`.
2. For each file, evaluate:
   - Does **The Lesson** state a general principle (not project-specific)?
   - Does **Context** make sense without codebase access?
   - Does **What Happened** have 4-8 concrete steps?
   - Does **Key Insights** have 4-6 actionable bullets?
   - Are optional sections present where they'd add value?
   - Are there any remaining placeholders or "Information Needed" checklists?
3. Report a table: filename, completeness status (Draft / Partial / Complete), and the specific gaps.

## Lesson Template

The template defines the structure of each lesson document. Each section has a specific purpose and quality bar.

```markdown
# [Title]

## The Lesson

[1-3 sentences. A general principle that a reader can apply to their own
work. Frame as a reusable insight, not a project-specific fact.

Good: "When migrating a data format, the key risk is proving the new
      format produces identical behavior — not the conversion itself."
Bad:  "We migrated XML to JSON in the certification project."]


## Context

[One paragraph. Set the stage for someone outside the project. What kind
of system, what scale, what constraints, why this situation arose. Use
concrete numbers but avoid internal paths or class names that require
codebase access.]


## What Happened

[4-8 numbered steps. What was tried, in what order, what the outcome was.
Include both successes and failures. Focus on decisions and consequences,
not implementation details.

If a tool was written, name it and say what it did. Don't paste source
code here — that belongs in Examples.]


## Key Insights

[4-6 bulleted observations. Each bullet:
  1. Starts with a bold statement (the insight)
  2. Follows with 1-2 sentences of explanation or evidence

Every insight must be actionable — a reader should be able to change
their behavior based on it.]


## Examples

[OPTIONAL — include when concrete examples make the lesson significantly
clearer. Show before/after, good/bad, or worked/failed comparisons.
Use simplified/generic versions, not verbatim codebase copies.
Delete this section if not needed.]


## Applicability

[OPTIONAL — include when the lesson generalizes beyond the obvious
domain. Where else does it apply? When does the advice NOT apply?
Delete this section if self-evident.]


## Related Lessons

[OPTIONAL — cross-references to other lessons in the collection.
Format: - [Title](filename.md) — one sentence on the relationship.
Delete this section if no meaningful connections.]
```

## Quality Standards

### Independence

Each lesson must be readable and useful without access to the codebase. A developer on a completely different project should understand the problem, the approach, and the takeaways. This means:

- No unexplained internal file paths (use generic descriptions: "the quiz engine module" not "`js/quiz-engine.js`")
- No references to class or function names without explaining what they do
- Concrete numbers and scale are good ("1,650 questions across 50 exam files") — they ground the lesson in reality

### Generality

**The Lesson** and **Key Insights** should be stated as general principles. The **Context** and **What Happened** sections are where project-specific details live. A reader should be able to read just The Lesson and Key Insights and get value, then read Context and What Happened for the supporting evidence.

### Completeness Levels

| Level | Criteria |
|-------|----------|
| **Draft** | Has The Lesson and Context. Other sections are placeholders or thin. |
| **Partial** | Has The Lesson, Context, What Happened, and Key Insights, but insights lack evidence or examples would help. |
| **Complete** | All required sections are substantive. Optional sections are present where they add value. No placeholders remain. |

Drafts are acceptable — a large list of drafts is more valuable than a small list of polished documents, because drafts capture the lesson's existence while details can be filled in later.

### Categorization

Lessons are grouped in the README index by domain. Current categories:

- **Data & Content Quality** — schema, validation, content auditing, format migration
- **Architecture & Design** — system design, plugin patterns, design systems, persistence
- **Process & Methodology** — planning, review, workflow, scaling
- **Testing** — test strategies, equivalence testing, integration testing
- **Data Engineering** — encoding, schema management, bulk transformation

New categories can be added when a cluster of 3+ lessons doesn't fit existing ones.

### Numbering

Sequential across the entire collection (not per-category). Numbers are assigned at write time and never change. Gaps from deleted lessons are acceptable — don't renumber.

## Discovery Heuristics

When scanning for lesson candidates, look for these signals in the git history:

| Signal | Example commit pattern | Likely lesson topic |
|--------|----------------------|---------------------|
| Bug fix after a pattern was missed | "Fix XML escape characters..." | Encoding pitfalls, validation gaps |
| Format migration | "Rewire app.js to load JSON..." | Migration strategy, equivalence testing |
| Multi-commit enrichment | "Enrich hints for GCP..." (6 commits) | Content quality at scale, batch tooling |
| Code review + remediation | "Code review remediation Phase N" | Review-driven improvement, phased planning |
| Scaling event | "Add CompTIA, ISC2, GitHub..." | Plugin architecture, scaling without complexity |
| Design system work | "Port landing page to Atlas..." | Design system migration, token-based design |
| Audit + fix cycle | "Fix H1 answer giveaways..." | Automated quality gates, content defects |
| Schema work | "Convert 4 variant-schema XML..." | Schema consolidation, data pipeline discipline |
| Security fix | "Add Content Security Policy..." | Security in static sites, defense in depth |
| Test infrastructure | "Add full-corpus equivalence test" | Testing strategies, migration verification |

## Relationship to Other Skills

- `/phase` executes plan rows — lessons are extracted *after* phases complete, reflecting on what was learned.
- Design docs and PDRs are forward-looking (what to build). Lessons are backward-looking (what was learned from building it).
- `docs/todo.md` "Resolved Decisions" captures *what* was decided. Lessons capture *why it mattered* and *what to do differently*.
