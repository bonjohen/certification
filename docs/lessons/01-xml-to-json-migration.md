# XML to JSON Migration

## The Lesson

When migrating a live data format (XML to JSON), the key risk is not the conversion itself — it's proving that the new format produces identical behavior. The migration succeeded because the conversion was treated as a pipeline problem (convert, validate, prove equivalence) rather than a rewrite.

## Context

A certification quiz application served 50+ exam files as XML, parsed client-side with `DOMParser`. The XML parser was ~200 lines of code handling namespace quirks, entity decoding, and cross-browser issues. JSON would eliminate all of this complexity and enable schema validation with standard tooling.

## What Happened

1. All XML files were converted to JSON using a Python script (`xml_to_json_exam.py`)
2. A JSON Schema was written to formalize the data contract (`certification.schema.json`)
3. A new `ExamLoader` class replaced `XMLParser`, adding schema validation on load
4. The old XML parser was retained temporarily for comparison
5. An equivalence test suite ran every question through both parsers and compared output field-by-field
6. Only after 5,101 equivalence tests passed was the XML parser retired from the hot path

## Key Insights

- **Convert the data first, code second.** Having JSON files ready before writing the loader meant the loader could be tested immediately against real data, not fixtures.
- **Schema validation is the migration's safety net.** The JSON Schema caught issues the XML XSD had missed — wrong types, missing fields, extra choices — because JSON Schema tooling (Ajv) is more mature and precise than browser-side XSD validation.
- **Keep the old path alive until equivalence is proven.** Running both parsers in parallel and comparing their output was the only reliable way to prove the migration was correct. Unit tests alone wouldn't have caught subtle differences in how whitespace, entities, or nested HTML were handled.
- **The conversion script is a one-time tool but needs to be correct.** Bugs in the converter silently propagate to every exam file. The script should be tested against known-good reference files before running on the full corpus.

## Related Lessons

- [Schema Enforcement at the Data Layer](02-schema-enforcement.md) — the migration enabled runtime JSON Schema validation that XML never had
- [Equivalence Testing During Format Migration](18-equivalence-testing.md) — the 5,101 equivalence tests that proved the migration was correct
- [XML Entity Encoding Pitfalls](21-xml-entity-encoding.md) — entity encoding bugs were one motivation for leaving XML behind
