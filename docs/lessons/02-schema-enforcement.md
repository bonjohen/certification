# Schema Enforcement at the Data Layer

## The Lesson

Adding runtime schema validation to your data loading layer catches entire categories of bugs that would otherwise surface as confusing UI glitches. The cost is a one-time schema definition and a few lines of validation code. The payoff is immediate, clear error messages instead of silent wrong behavior.

## Context

A quiz application loaded exam data from JSON files. Without schema validation, a missing field (e.g., no `correct-answer` on a question) would silently produce a quiz where no answer was ever marked correct. A wrong type (e.g., `difficulty: 3` instead of `difficulty: "intermediate"`) would break filtering without any error.

## What Happened

- A JSON Schema (Draft 2020-12) was written to define the exact shape of exam data: metadata fields, question structure, choice constraints, hint levels, difficulty enums
- The `ExamLoader` class validates every exam file against this schema on load using Ajv
- Validation errors are surfaced to the user with the specific field path and constraint that failed
- The schema also serves as living documentation of the data contract

## Key Insights

- **Schema validation at load time is a circuit breaker.** It fails fast with a clear message instead of letting bad data propagate through the quiz engine, where the symptom is far from the cause.
- **JSON Schema is both validation and documentation.** New contributors can read the schema to understand the exact data format without reverse-engineering the parser or reading XML examples.
- **CDN-loaded validators need careful wiring in test environments.** Browser code that imports from `https://esm.sh/ajv` needs aliases in the test config (vitest) to resolve to `node_modules/ajv` instead. This is a one-time setup cost but a common stumbling block.
- **Enums are the highest-value schema feature.** Constraining `difficulty` to `["basic", "intermediate", "advanced"]` and `hint.level` to `[1, 2, 3]` catches the most common data-authoring mistakes.

## Information Needed to Complete This Document

- [ ] Include the full JSON Schema or its key sections
- [ ] Show example validation error messages (good vs bad)
- [ ] Document the Ajv 2020-12 import pattern for browser ES modules
- [ ] Compare the developer experience of XSD validation vs JSON Schema validation
- [ ] Discuss schema evolution: how to add new fields without breaking existing files
