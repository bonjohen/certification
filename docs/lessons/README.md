# Lessons Learned

Standalone learning documents extracted from the certification study site project. Each lesson captures a pattern, mistake, or decision that emerged from real development work and is written to be useful independent of this codebase.

## Index

### Data & Content Quality

1. [XML to JSON Migration](01-xml-to-json-migration.md) — Why and how to migrate a live data format without breaking consumers
2. [Schema Enforcement at the Data Layer](02-schema-enforcement.md) — Adding JSON Schema validation to catch data defects before they reach the UI
3. [Content Quality Auditing at Scale](03-content-quality-auditing.md) — Measuring and enforcing quality thresholds across 1,650+ questions
4. [Answer Position Bias](04-answer-position-bias.md) — Why correct answers cluster in certain positions and how randomization fixes it
5. [Hint Quality as a Spectrum](05-hint-quality-spectrum.md) — Designing a three-tier progressive hint system with measurable quality thresholds
6. [AI-Graded Content Validation](06-ai-graded-validation.md) — Using LLMs to independently verify answer correctness across a large question bank
7. [Verbatim Answer Leakage in Hints](07-verbatim-answer-leakage.md) — How hints can accidentally give away answers, and systematic detection

### Architecture & Design

8. [Provider-Agnostic Plugin Architecture](08-provider-agnostic-architecture.md) — Scaling from 1 to 10 providers without provider-specific code
9. [Design System Migration](09-design-system-migration.md) — Introducing a token-based design system (Atlas) into an existing multi-page static site
10. [Static Site as Application Platform](10-static-site-as-platform.md) — Building a full application with vanilla HTML/CSS/JS, no framework, no build step
11. [Client-Side State Persistence with localStorage](11-localstorage-persistence.md) — Patterns for save/resume/history in a zero-backend architecture
12. [Content Security Policy for Static Sites](12-csp-static-sites.md) — Adding CSP to a no-build static site that uses ES modules and CDN imports

### Process & Methodology

13. [Code Review Driven Remediation](13-code-review-remediation.md) — Turning a whole-codebase review into a phased, trackable remediation plan
14. [Phased Release Planning](14-phased-release-planning.md) — Breaking large features into independently shippable phases with explicit state tracking
15. [Design-First Development](15-design-first-development.md) — Writing design docs and PDRs before code, and when it pays off
16. [Scaling Content Without Scaling Complexity](16-scaling-content.md) — Adding 50+ exams across 10 providers while keeping the codebase stable
17. [XSS in Trusted-Data Applications](17-xss-trusted-data.md) — Why innerHTML from "your own" XML/JSON data is still a vulnerability
24. [Lessons Learned as a Practice](24-lessons-learned-as-a-practice.md) — Turning project experience into a durable, reusable knowledge base via a `/lessons` skill
25. [Legacy Artifact Removal](25-legacy-artifact-removal.md) — Safely deleting dead code after a migration: dependency mapping, bulk deletion, and verification
26. [Building a Lessons Skill](26-building-a-lessons-skill.md) — Anatomy of a Claude Code skill file: frontmatter, mode dispatch, quality contracts, and hard rules
27. [Building a Review Skill](27-building-a-review-skill.md) — Encoding a 7-category review checklist into a repeatable skill with evidence requirements and phased remediation output
28. [Building a Phase Execution Skill](28-building-a-phase-execution-skill.md) — Automating plan execution with restart-safe state, verification gates, and atomic commits

### Testing

18. [Equivalence Testing During Format Migration](18-equivalence-testing.md) — Running 5,101 render-equivalence tests to prove JSON matches XML output
19. [Integration Testing a DOM Application with jsdom](19-jsdom-integration-testing.md) — Testing a browser application end-to-end without a browser
20. [Testing Provider Detection Logic](20-testing-provider-detection.md) — How a copied test diverged from production code, and the fix

### Data Engineering

21. [XML Entity Encoding Pitfalls](21-xml-entity-encoding.md) — The `Q&A` vs `Q&amp;A` class of bugs in XML content pipelines
22. [Schema Variant Consolidation](22-schema-variant-consolidation.md) — When parallel authoring produces incompatible schemas, and how to reconcile them
23. [Bulk Metadata Enrichment Scripts](23-bulk-metadata-enrichment.md) — Writing Python tooling to patch thousands of XML elements programmatically
