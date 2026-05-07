# Equivalence Testing During Format Migration

## The Lesson

When migrating a data format (XML to JSON) that feeds a rendering pipeline, the only way to prove the migration is correct is to run both formats through the pipeline and compare the outputs field-by-field. Unit tests of the new loader are necessary but insufficient — they prove the new code works, not that it produces identical results to the old code.

## Context

The quiz application migrated from XML exam files (parsed by `XMLParser`) to JSON exam files (loaded by `ExamLoader`). The quiz engine consumed a plain JavaScript object from either source. The question was: does the JSON loader produce the exact same object as the XML parser for every question in every exam?

## What Happened

1. A render-equivalence test suite was written that loads every exam file in both formats
2. For each question, the test compares: title, scenario, question text, choices (text and letter), correct answer, hints (level, label, content), category, difficulty, tags
3. The test suite ran against all 50+ exam files, producing 5,101 individual test assertions
4. All 5,101 tests passed, proving field-level equivalence between XML and JSON representations

## Key Insights

- **Equivalence tests are temporary by design.** Once the migration is complete and the old format is retired, the equivalence tests can be deleted. They exist only to bridge the migration. This is different from regression tests, which are permanent.
- **Test volume is a feature, not a smell.** 5,101 tests sounds excessive, but each one checks a specific field of a specific question. If question 37 of exam AZ-305 has a whitespace difference in its H2 hint between XML and JSON, exactly one test fails and tells you exactly where.
- **Whitespace and encoding are the usual suspects.** XML and JSON handle whitespace, entities, and nested HTML differently. The equivalence tests caught cases where XML entity decoding (`&amp;` → `&`) behaved differently from JSON string parsing.
- **Run equivalence tests on the full corpus, not just fixtures.** A test fixture with 5 questions might pass while the real corpus has edge cases in question 1,247. The whole point of equivalence testing is exhaustive comparison.
- **The old parser stays alive during migration.** You can't delete `XMLParser` until the equivalence tests have passed. The old code is the reference implementation that the tests compare against.

## Applicability

Equivalence testing applies to any format migration, parser rewrite, or rendering engine swap where the output must match exactly. It also works for database schema migrations (compare query results before/after), API version upgrades (compare response payloads), and compiler/transpiler changes. It is NOT useful when the new system intentionally produces different output — in that case, you need acceptance tests, not equivalence tests.

## Related Lessons

- [XML to JSON Migration](01-xml-to-json-migration.md) — the migration that this testing strategy was built to verify
- [XML Entity Encoding Pitfalls](21-xml-entity-encoding.md) — whitespace and entity differences between XML and JSON were the most common equivalence failures
