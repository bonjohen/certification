# Legacy Artifact Removal

## The Lesson

After a migration, the old system's artifacts (files, code, tests, scripts) must be actively removed in a deliberate cleanup pass — they don't disappear on their own. The removal is safe only when you can prove the new system is fully operational, and the cleanup itself requires a plan because the old artifacts have tentacles (tests that import them, scripts that process them, docs that reference them).

## Context

A quiz application migrated from XML to JSON for its exam data format. The migration was proven correct by 5,101 equivalence tests. But months after JSON became the production format, all 50 XML data files, the XML parser module, 4 XML-specific test files, 10 processing scripts, 33 audit reports, and an XSD schema remained in the repository — over 100 files of dead weight. The XML files were larger than the JSON equivalents, the XML parser was imported by integration tests that didn't need it, and newcomers couldn't tell which format was authoritative.

## What Happened

1. A plan was written listing every XML artifact by category: data files (50), parser code (1), tests (4), scripts (10), audit reports (33), schema (1), and fixture (1).
2. The one integration test file that tested non-XML functionality but happened to use XMLParser was identified and rewritten to load JSON fixtures directly. This was the only code modification needed.
3. Tests were run to confirm the rewritten test passed — 28 tests green.
4. All XML-only files were deleted in bulk: `find data -name "*.xml" -delete`, then scripts, tests, audit reports, and the XSD.
5. `package.json` was updated to remove the `validate:xml` script. `CLAUDE.md` and `README.md` were updated to remove XML references.
6. Final test run confirmed 133 tests passing (down from 195 — the 62 removed tests were all XML-specific).
7. Verification grep confirmed zero `.xml` references in JS or test files.

## Key Insights

- **Removal requires a dependency map, not just a file list.** Deleting the XML parser isn't safe until you know which tests import it. The quiz-app integration test imported XMLParser only as a convenience for loading test data — not because it was testing XML. Identifying this distinction was the key judgment call.
- **The test count drop is expected and healthy.** Going from 195 to 133 tests sounds alarming, but the 62 removed tests tested dead code (XML parsing, XML-JSON equivalence). Test count should reflect live functionality, not historical artifacts.
- **Bulk deletion is safe when the new system is proven.** The 5,101 equivalence tests from the migration phase provided the confidence to delete without doubt. Without that prior proof, each XML file deletion would need individual verification.
- **Dead code has a maintenance cost even when dormant.** The XML files showed up in grep results, confused IDE search, and made `git status` noisy after any bulk operation. Their presence implied they might be needed, creating decision paralysis about whether to update them.
- **Documentation must be updated atomically with deletion.** If you delete the XML parser but leave it listed in CLAUDE.md and README.md, the next developer will waste time looking for it. Docs, package.json scripts, and the code itself are all part of the same atomic cleanup.

## Applicability

This pattern applies after any migration: database schema changes (old tables), framework upgrades (compatibility shims), API version bumps (deprecated endpoints), language migrations (old source files). The prerequisite is always the same: proof that the new system handles all cases the old system did. Without that proof, deletion is risky; with it, deletion is overdue.

## Related Lessons

- [XML to JSON Migration](01-xml-to-json-migration.md) — the migration that made these artifacts dead; removal is the migration's final step
- [Equivalence Testing During Format Migration](18-equivalence-testing.md) — the 5,101 equivalence tests provided the confidence to delete without re-verification
- [Schema Enforcement at the Data Layer](02-schema-enforcement.md) — the JSON Schema validator replaced both the XML parser and the validate-xml.js script
