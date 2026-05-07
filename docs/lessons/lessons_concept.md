# AI-Assisted Project Lessons Reference Standard

## Purpose

The purpose of a lesson document is to preserve reusable engineering knowledge discovered during real project execution.

Lessons are:

* Stand-alone documents.
* Written for future engineers and future AI agents.
* Designed for retrieval and reuse inside agentic coding systems.
* Connected to real implementation examples.
* Focused on practical engineering outcomes rather than theory.

The long-term goal is to build:

* A searchable engineering knowledge base.
* A reusable architecture and implementation reference system.
* A collection of “how-to” patterns and anti-patterns.
* A memory system for Claude Code/OpenClaw/master orchestration agents.

Lessons should be written during or immediately after:

* Major phases
* Refactors
* Infrastructure changes
* Architecture decisions
* Failures
* Discoveries
* Performance improvements
* Integration work
* Deployment stabilization
* AI workflow improvements

---

# Recommended Repository Structure

```text
/docs
    /lessons
        lesson_architecture_pipeline_layering.md
        lesson_json_schema_validation.md
        lesson_ai_prompt_fragmentation.md
        lesson_agent_retry_strategy.md
```

---

# Naming Standard

```text
lesson_[topic].md
```

Examples:

```text
lesson_vector_store_abstraction.md
lesson_incremental_pipeline_validation.md
lesson_token_cost_tracking.md
lesson_ai_generated_test_failures.md
lesson_structured_logging_patterns.md
```

Use:

* lowercase
* underscores
* highly searchable names

Avoid:

* vague names
* dates in filenames
* “final”
* “v2”
* “misc”

---

# Metadata Header Standard

Every lesson should begin with structured metadata.

Example:

```markdown
# Lesson: Incremental Pipeline Validation

## Metadata

| Field | Value |
|---|---|
| Project | JobClass |
| Repository | github.com/bonjohen/jobclass |
| Phase | Data Warehouse Validation |
| Date | 2026-05-07 |
| Lesson Type | Architecture |
| Impact Level | High |
| Reusable | Yes |
| AI-Safe | Yes |
| Related Lessons | lesson_schema_versioning.md |
```

---

# Standard Lesson Structure

## 1. Problem Statement

Describe:

* What problem existed
* Why it mattered
* What symptoms appeared
* Why the previous approach failed

Example:

```markdown
The pipeline originally validated records only after full warehouse load completion.
This caused failures to be discovered several hours after execution began,
making debugging slow and expensive.
```

---

## 2. Context

Describe:

* System architecture
* Relevant technologies
* Constraints
* Team/process conditions
* AI involvement level

Example:

```markdown
The project used:
- Python
- FastAPI
- PostgreSQL
- Airflow
- AI-assisted code generation through Claude Code

The pipeline handled multiple government datasets with differing schemas and update schedules.
```

---

## 3. Discovery Process

Explain:

* How the issue was discovered
* What evidence revealed the problem
* Failed hypotheses
* Investigation process

This section is extremely valuable for future debugging agents.

Example:

```markdown
The issue was initially believed to be caused by malformed CSV input.
After instrumentation was added, it became clear that schema drift in staging tables
was propagating silently into downstream transforms.
```

---

## 4. Solution

Describe:

* The actual solution
* Why it worked
* Key implementation details
* Design tradeoffs

Prefer concrete engineering language.

---

## 5. Architectural Insight

This is one of the most important sections.

Move beyond:

* “what fixed it”

Into:

* “what general principle was learned”

Example:

```markdown
Validation systems should exist at every pipeline boundary rather than at the end
of the pipeline.

The earlier validation occurs:
- the cheaper the failure
- the easier the debugging
- the lower the token cost for AI-assisted repair
```

---

## 6. AI-Assisted Development Insight

Describe:

* How AI helped
* How AI failed
* Prompting lessons
* Validation lessons
* Token efficiency lessons
* Context management lessons
* Agent orchestration lessons

Example:

```markdown
Claude Code performed well when:
- exact schemas were supplied
- output formats were constrained
- examples were provided

Claude performed poorly when:
- prompts referenced ambiguous table names
- multiple unrelated tasks were combined
- architectural assumptions were implied rather than stated
```

This section becomes extremely valuable for future agent orchestration systems.

---

## 7. Reusable Pattern

Describe the generalized reusable approach.

Example:

```markdown
Reusable Pattern:
Incremental Validation Layer

Pattern:
Raw → Validate → Normalize → Validate → Warehouse → Validate

Benefits:
- Faster debugging
- Easier rollback
- Better AI repairability
- Reduced downstream corruption
```

---

## 8. Anti-Patterns

Document:

* Bad approaches
* Hidden traps
* Mistakes
* False assumptions

Example:

```markdown
Anti-Pattern:
Single giant AI prompt requesting:
- schema generation
- ETL generation
- testing
- deployment
- documentation

This consistently reduced quality and increased hallucinations.
```

---

## 9. Implementation References

Link directly to:

* source files
* commits
* pull requests
* diagrams
* scripts
* schemas

Example:

```markdown
## References

- /src/pipeline/validator.py
- /schemas/job_record.schema.json
- Commit: 3f82d2a
- docs/architecture/pipeline_flow.md
```

---

## 10. Example Before/After

Show:

* old approach
* improved approach

Short examples are ideal.

---

## 11. Scalability / Future Considerations

Describe:

* future risks
* scalability concerns
* next improvements
* unresolved limitations

Example:

```markdown
The current approach validates schema shape but not semantic correctness.
Future improvements should include:
- statistical validation
- anomaly detection
- drift scoring
```

---

## 12. Tags

Use highly searchable tags.

Example:

```markdown
## Tags

#ai-assisted-development
#etl
#validation
#schema-management
#pipeline-design
#agentic-workflow
#debugging
```

---

# Lesson Categories

Strong recommended categories:

| Category         | Purpose                         |
| ---------------- | ------------------------------- |
| Architecture     | System design lessons           |
| AI Workflow      | Prompting/agent lessons         |
| Performance      | Speed/memory/token optimization |
| Reliability      | Stability/recovery lessons      |
| Deployment       | Hosting/devops lessons          |
| Data Engineering | ETL/schema/storage lessons      |
| Frontend         | UI/UX/component lessons         |
| Tooling          | IDE/build/test workflow lessons |
| Testing          | Validation/testing lessons      |
| Human Factors    | Workflow/process/team lessons   |

---

# High-Value Lesson Characteristics

Good lessons:

* describe tradeoffs
* include failure modes
* explain discovery process
* contain reusable insights
* include references
* are short enough to scan
* are detailed enough to reuse
* contain concrete implementation details

Bad lessons:

* generic summaries
* vague retrospectives
* emotional commentary
* “we learned communication matters”
* no implementation references
* no reusable principle

---

# Recommended AI-Oriented Additions

## AI Confidence Notes

```markdown
AI Confidence:
Medium

Reason:
Generated code appeared correct but failed under multi-threaded execution.
```

---

## Prompt Fragment References

```markdown
Prompt Fragments:
- prompts/schema_generation.md
- prompts/warehouse_validation.md
```

---

## Validation Strategy

```markdown
Validation Required:
- Unit tests
- Integration tests
- Real data replay
- Token cost analysis
```

---

# Suggested Long-Term Structure

Eventually create:

```text
/docs
    /lessons
    /patterns
    /anti_patterns
    /reference_implementations
    /prompt_fragments
    /architecture
```

This naturally evolves into:

* engineering memory
* AI coding guidance
* reusable architecture library
* onboarding system
* retrieval database for coding agents

---

# Example Minimal Lesson

```markdown
# Lesson: Incremental JSON Validation

## Problem
Large ETL jobs failed late in execution because malformed records were only validated after warehouse insertion.

## Discovery
Pipeline failures were traced to inconsistent source data generated by multiple agencies.

## Solution
Validation was moved into:
- ingestion
- normalization
- warehouse load phases

## Architectural Insight
Validation should occur at every transformation boundary.

## AI Insight
Claude generated reliable validators only when exact JSON schemas were supplied.

## Reusable Pattern
Raw → Validate → Normalize → Validate → Store

## References
- /schemas/
- /src/validation/

## Tags
#etl
#validation
#json-schema
#ai-assisted-development
```

---

# Recommended Operating Rule

A lesson should be written whenever one of these occurs:

* “That took much longer than expected.”
* “We should always do it this way.”
* “AI failed badly here.”
* “This architecture worked unusually well.”
* “This debugging method saved us.”
* “We finally understand the real issue.”
* “This should become a reusable pattern.”
* “Future agents will need this.”

---

# Recommended Retrieval Strategy for Claude/OpenClaw

Eventually index lessons by:

* tags
* architecture type
* technology
* failure mode
* lesson category
* token cost impact
* implementation references

This allows future agents to:

* retrieve comparable implementations
* avoid known mistakes
* follow proven patterns
* reference working architectures
* improve consistency across projects

You are essentially building:

* an engineering memory system
* a reusable architectural cognition layer
* an AI-assisted software engineering playbook

Related repository:
[JobClass Repository](https://github.com/bonjohen/jobclass?utm_source=chatgpt.com)
