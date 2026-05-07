# Schema Enforcement at the Data Layer

## The Lesson

Adding runtime schema validation to your data loading layer catches entire categories of bugs that would otherwise surface as confusing UI glitches. The cost is a one-time schema definition and a few lines of validation code. The payoff is immediate, clear error messages instead of silent wrong behavior.

## Context

A quiz application loaded exam data from JSON files. Without schema validation, a missing field (e.g., no `correct-answer` on a question) would silently produce a quiz where no answer was ever marked correct. A wrong type (e.g., `difficulty: 3` instead of `difficulty: "intermediate"`) would break filtering without any error.

## What Happened

1. The application initially loaded exam data from JSON files without any validation. Missing fields or wrong types only surfaced as broken UI — a quiz where no answer was marked correct, a filter that silently excluded everything.
2. A JSON Schema (Draft 2020-12) was written to define the exact shape of exam data: metadata fields, question structure, choice constraints, hint levels, and difficulty enums.
3. An `ExamLoader` class was created that validates every exam file against this schema on load using Ajv, loaded from a CDN for the browser and aliased to `node_modules` in the test config.
4. Validation errors are now surfaced immediately with the specific JSON path and constraint that failed (e.g., `questions[14].difficulty must be one of: basic, intermediate, advanced`).
5. The schema doubled as living documentation — new contributors read it to understand the data format instead of reverse-engineering the parser.

## Key Insights

- **Schema validation at load time is a circuit breaker.** It fails fast with a clear message instead of letting bad data propagate through the quiz engine, where the symptom is far from the cause.
- **JSON Schema is both validation and documentation.** New contributors can read the schema to understand the exact data format without reverse-engineering the parser or reading XML examples.
- **CDN-loaded validators need careful wiring in test environments.** Browser code that imports from `https://esm.sh/ajv` needs aliases in the test config (vitest) to resolve to `node_modules/ajv` instead. This is a one-time setup cost but a common stumbling block.
- **Enums are the highest-value schema feature.** Constraining `difficulty` to `["basic", "intermediate", "advanced"]` and `hint.level` to `[1, 2, 3]` catches the most common data-authoring mistakes.

## Related Lessons

- [XML to JSON Migration](01-xml-to-json-migration.md) — the migration created the opportunity to add schema validation; XML had an XSD but no runtime enforcement
- [XML Entity Encoding Pitfalls](21-xml-entity-encoding.md) — schema validation catches structural errors, but encoding errors need a different gate
