# Building a Lessons Skill for Claude Code

## The Lesson

A Claude Code skill file is a structured prompt that turns a repeatable workflow into a single slash command. The skill's power comes from clearly separating modes (read-only vs write), defining explicit quality contracts for outputs, and providing the AI with enough heuristics to make judgment calls without human intervention on each step.

## Context

A project had accumulated 73 commits of rich engineering work — migrations, code reviews, scaling events, bug fixes — but the lessons from that work existed only in commit messages and design docs. A `/lessons` skill was created to automate the discovery, authoring, auditing, and repair of standalone lesson documents. The skill needed to work across any project (not just its origin), handle 25+ documents without losing coherence, and produce output that is useful to developers who have never seen the source codebase.

## What Happened

1. A manual review of git history produced 23 lesson candidates. Each was written as a markdown document following a consistent structure (The Lesson, Context, What Happened, Key Insights).
2. The structure was formalized into a template with inline authoring guidance for each section.
3. The template and workflow were combined into a skill specification (`SKILL.md`) with five modes: discover, write, list, audit, and repair.
4. The skill was deployed to `~/.claude/skills/lessons/SKILL.md` and immediately became invocable as `/lessons`.
5. The skill was tested in production: `/lessons audit` found 23 partial documents, `/lessons repair` was looped to fill gaps in batches of 5 until all 25 reached Complete status.
6. A `repair` mode was added after the initial deployment when it became clear that bulk completion of existing drafts was a distinct workflow from writing new lessons.

## Key Insights

- **Mode separation prevents accidents.** Read-only modes (discover, list, audit) never write files. Write modes (write, repair) always report what they changed. This makes the skill safe to invoke speculatively — "let me see what's there" never mutates state.
- **Quality contracts make autonomous work possible.** By defining exactly what "Complete" means (all required sections substantive, no placeholders, optional sections where they add value), the skill can audit and repair without asking the user about each judgment call.
- **Batch size limits prevent context exhaustion.** The repair mode processes at most 5 files per invocation. This keeps the AI's context focused and produces consistent quality across large collections. The tradeoff is multiple invocations for large backlogs — solvable with `/loop`.
- **Discovery heuristics are a lookup table, not an algorithm.** Rather than describing an abstract "how to find lessons," the skill provides a concrete table mapping commit-message patterns to likely lesson topics. This makes the AI's discovery behavior predictable and reviewable.
- **The frontmatter is the skill's identity.** The `name`, `description`, and `argument-hint` fields in YAML frontmatter are what Claude Code uses to match user invocations to the skill file. The description must be specific enough to trigger on relevant requests but not so broad that it fires on unrelated work.

## The Skill File Explained

A Claude Code skill lives in `~/.claude/skills/<name>/SKILL.md`. It consists of YAML frontmatter (metadata) followed by markdown (the prompt). Here is the complete file with commentary on each section.

### Frontmatter — Identity and Invocation

```yaml
---
name: lessons
description: Discover, write, list, audit, or repair lessons-learned documents extracted from project work. Mines git history, design docs, plans, and code reviews to identify reusable patterns and mistakes. Each lesson is a standalone document useful independent of the codebase.
argument-hint: "[write <topic> | list | audit | repair [<file-or-pattern>]]"
---
```

The `name` field becomes the slash command (`/lessons`). The `description` is shown in skill listings and helps Claude Code decide when this skill is relevant. The `argument-hint` shows the user what arguments are accepted — it's displayed as placeholder text in the prompt.

### Opening Directive — Role and Purpose

```markdown
You are producing **lessons learned** documents — standalone learning resources extracted from real project work. Each lesson captures a pattern, mistake, or decision and is written so a developer on a completely different project can understand and apply it.
```

This single paragraph sets the AI's role and the key quality constraint (standalone, project-independent). It appears before any mode-specific instructions so it governs all behavior regardless of which mode is active.

### Input Routing — Mode Dispatch Table

```markdown
## Inputs

The argument `$ARGUMENTS` determines the mode:

| Argument | Mode | Writes files? |
|----------|------|---------------|
| *(empty)* | **Discover** — scan for new lesson candidates | No |
| `write <topic>` | **Author** — write or complete a lesson on `<topic>` | Yes |
| `list` | **Index** — print the current lesson index | No |
| `audit` | **Completeness check** — evaluate all lessons | No |
| `repair [target]` | **Repair** — fill missing sections in existing lessons | Yes |
```

`$ARGUMENTS` is a Claude Code variable that receives whatever the user types after `/lessons`. The table makes routing deterministic — the AI doesn't need to interpret intent; it pattern-matches the argument. The "Writes files?" column makes the safety contract explicit at a glance.

### File Convention — Where Lessons Live

```markdown
## Lesson Location

Lessons live at `docs/lessons/` in the current project. This is the default and correct location for project-specific lessons.

- Lesson files: `docs/lessons/NN-slug-title.md`
- Index: `docs/lessons/README.md`
- Template: `docs/lessons/TEMPLATE.md`
```

Naming conventions are critical for skills that create files. Without explicit naming rules, the AI would invent a different scheme on each invocation. The numbered-slug pattern (`01-xml-to-json-migration.md`) provides sort order, human readability, and stable URLs.

### Discover Mode — Read-Only Intelligence Gathering

```markdown
## Mode: Discover (no argument)

1. Read `docs/lessons/README.md` to know what lessons already exist.
2. Scan for new lesson candidates:
   - `git log --oneline` — look for bug fixes, migrations, refactors...
   - `docs/` — design docs, PDRs, plans, review results, audit reports
   - Multi-commit sequences that tell a story
3. For each candidate, check whether an existing lesson already covers it.
4. Present new candidates as a numbered list with proposed titles and one-line descriptions.
5. **Do not write any files.** Wait for the user to select which lessons to write.
```

The five numbered steps are a strict protocol. Step 1 (read existing) prevents duplicates. Step 5 (don't write) is a hard safety constraint repeated for emphasis. The discover mode is intentionally conservative — it proposes, never acts.

### Discovery Heuristics — Pattern Recognition Table

```markdown
### Discovery Heuristics

| Signal | Example commit pattern | Likely lesson topic |
|--------|----------------------|---------------------|
| Bug fix after a pattern was missed | "Fix XML escape characters..." | Encoding pitfalls |
| Format migration | "Rewire app.js to load JSON..." | Migration strategy |
| Multi-commit enrichment | "Enrich hints for GCP..." (6x) | Batch tooling |
| ...10 rows total... |
```

This table is the skill's "training data" for discovery. Rather than asking the AI to reason from first principles about what constitutes a lesson, it provides concrete examples of commit-message patterns and what lesson topics they map to. This makes discovery behavior predictable and auditable.

### Write Mode — Structured Authoring

```markdown
## Mode: Author (`write <topic>`)

1. Read `docs/lessons/TEMPLATE.md` for the section structure.
2. Research the topic thoroughly:
   - Read relevant commits (`git log --stat`, `git show`)
   - Read related docs, plans, review results
   - Read actual code changes when the lesson is about a code decision
3. Assign the next available number and a slug: `NN-slug-title.md`.
4. Write the lesson following the template structure below.
5. Add the lesson to `docs/lessons/README.md` under the appropriate category.
6. If the lesson references other existing lessons, add cross-references in both directions.
```

Write mode is the most complex — it requires research, numbering, writing, index maintenance, and cross-referencing. The instruction to research before writing (step 2) prevents hallucinated narratives. The bidirectional cross-reference rule (step 6) keeps the knowledge graph connected.

### Template Structure — The Output Contract

```markdown
### Template Structure

Every lesson has these **required** sections:

#### `## The Lesson`
1-3 sentences stating a general principle. Frame as reusable insight, not project fact.

- Good: "When migrating a data format, the key risk is proving equivalence..."
- Bad: "We migrated XML to JSON in the certification project."

#### `## Context`
One paragraph. Set the stage for an outsider...

#### `## What Happened`
4-8 numbered steps...

#### `## Key Insights`
4-6 bulleted observations. Each bullet:
1. Starts with **bold statement** (the insight)
2. Follows with 1-2 sentences of explanation or evidence
```

The template provides both structural constraints (how many sentences, how many bullets) and quality examples (good vs bad). The good/bad comparison for "The Lesson" is the single most effective prompt technique in the entire skill — it calibrates the AI's abstraction level with one concrete example.

### Audit Mode — Non-Destructive Quality Assessment

```markdown
## Mode: Audit (`audit`)

1. Read every `*.md` file in `docs/lessons/` (excluding README.md and TEMPLATE.md).
2. For each file, evaluate against the completeness levels:

| Level | Criteria |
|-------|----------|
| **Draft** | Has The Lesson and Context. Other sections are placeholders or thin. |
| **Partial** | Has all four required sections, but insights lack evidence... |
| **Complete** | All required sections are substantive. Optional sections present... |

3. Report a table: `| Filename | Status | Gaps |`
4. **Do not modify any files.** Report only.
```

The three-level rubric (Draft/Partial/Complete) gives the AI a consistent vocabulary for quality assessment. The explicit "do not modify" constraint (step 4) makes audit safe to run at any time — it's purely diagnostic.

### Repair Mode — Surgical Gap-Filling

```markdown
## Mode: Repair (`repair [target]`)

Repair fills missing or thin sections in existing lessons. It preserves all existing content and only adds what's missing.
```

Repair is the most nuanced mode. Its constraints section is the longest because it handles the most edge cases:

```markdown
### Repair constraints

- **Never rewrite existing content.** Repair only adds.
- **Never remove sections.** Even non-standard sections are kept as-is.
- **Reconstructed narratives are marked.** Include `<!-- reconstructed -->` comment.
- **Cross-references are bidirectional.** Update both files.
- **Batch size limit.** Process at most 5 files per invocation.
```

The batch size limit is a pragmatic concession to context window limits. Without it, repairing 25 lessons in one invocation would degrade quality on the later files as context fills up. The "never rewrite" constraint prevents the AI from "improving" existing prose that the author chose deliberately.

### Quality Standards — Cross-Cutting Constraints

```markdown
## Quality Standards

### Independence
Each lesson must be readable without codebase access...

### Generality
**The Lesson** and **Key Insights** are general principles. **Context** and **What Happened** are where project-specific details live.

### Categorization
Group lessons in the README index by domain:
- **Data & Content Quality**
- **Architecture & Design**
- **Process & Methodology**
- **Testing**
- **Data Engineering**

### Numbering
Sequential across the entire collection (not per-category). Assigned at write time, never changed.
```

Quality standards apply across all modes. The independence rule prevents codebase-coupled lessons. The generality rule tells the AI where to put project-specific content (Context/What Happened) vs general principles (The Lesson/Key Insights). The categorization list prevents the AI from inventing new categories on every invocation.

### Hard Rules — Non-Negotiable Constraints

```markdown
## Hard Rules

- **Discover mode never writes files.**
- **Audit mode never modifies files.**
- **Drafts are acceptable.** A large list of drafts is more valuable than a small list of polished documents.
- **Lessons are standalone.** If a lesson can't be understood without reading the codebase, it's not done.
- **Never delete lessons.** Mark as superseded or merge into another, but don't remove.
```

Hard rules are the skill's invariants. They override any other instruction. "Drafts are acceptable" is particularly important — it prevents the AI from refusing to create a lesson because it can't make it perfect in one pass.

### Relationship Section — Workflow Integration

```markdown
## Relationship to Other Skills and Artifacts

- `/phase` executes plan rows. Lessons are extracted *after* phases complete.
- Design docs and PDRs are forward-looking (what to build). Lessons are backward-looking (what was learned).
- `docs/todo.md` "Resolved Decisions" captures *what* was decided. Lessons capture *why it mattered*.
```

This section positions the skill within a larger workflow. It prevents the AI from confusing lessons with design docs or todo items, and tells it when in the development lifecycle to suggest writing lessons.

## Applicability

This skill architecture pattern works for any repeatable AI workflow that produces structured documents: retrospectives, architecture decision records (ADRs), runbooks, incident post-mortems, onboarding guides. The key ingredients are: mode dispatch (read-only vs write), an explicit template with quality examples, batch size limits for large collections, and hard rules that override everything else.

## Related Lessons

- [Lessons Learned as a Practice](24-lessons-learned-as-a-practice.md) — the meta-lesson about why to write lessons; this lesson covers how the automation works
- [Design-First Development](15-design-first-development.md) — the skill follows the same principle: define the structure before producing content
- [Phased Release Planning](14-phased-release-planning.md) — the repair mode's batch-of-5 approach mirrors phased execution
