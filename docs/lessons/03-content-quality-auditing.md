# Content Quality Auditing at Scale

## The Lesson

When you have hundreds or thousands of content items authored by different sources at different times, quality varies wildly unless you define measurable thresholds and audit systematically. The audit itself is more valuable than the fixes it produces — it turns "the hints feel thin" into "22 of 33 files have H2 averages below 100 characters."

## Context

A certification quiz application had 33 exam files containing 1,650 questions, each with three progressive hints (Brief Hint, Complete Explanation, Deep Knowledge). Hints were authored by multiple contributors/processes over several months. Some had rich, paragraph-length explanations; others had 2-3 word fragments.

## What Happened

1. A reference file (`data/aws/aif-c01.xml`) was identified as the gold standard: H1=110, H2=380, H3=294 average characters
2. Minimum thresholds were defined: H1 >= 80 chars, H2 >= 250 chars, H3 >= 200 chars
3. Every file was audited programmatically against these thresholds
4. Files were classified into tiers: Invalid Schema (4), Critical (6), Needs Work (12), Reference Quality (11)
5. Enrichment was done tier-by-tier over multiple commits, with each file re-audited after enrichment

## Key Insights

- **Pick a reference file, not an abstract standard.** A real example that stakeholders agree is "good" is more useful than a specification nobody has seen implemented.
- **Character count is a crude but effective proxy for content depth.** A 40-character "hint" cannot possibly contain a real explanation. Thresholds don't guarantee quality, but they guarantee a floor.
- **Tiering by severity creates natural work priority.** Invalid schema files block everything (can't even measure quality). Critical files are actively harmful (hints that say nothing). Needs-work files are functional but below standard. This ordering makes the remediation plan write itself.
- **Enrichment at scale requires batch tooling.** Manual editing of 1,650 questions × 3 hints each is impractical. Scripts that can patch metadata, measure quality, and report progress are essential.
- **Quality auditing should be repeatable.** Running the audit after fixes ensures no regressions and measures progress. The audit script becomes a permanent quality gate.

## Related Lessons

- [Hint Quality as a Spectrum](05-hint-quality-spectrum.md) — the three-tier hint system whose quality this audit measured
- [Verbatim Answer Leakage in Hints](07-verbatim-answer-leakage.md) — a different content defect class found by a similar audit-then-fix pattern
- [Bulk Metadata Enrichment Scripts](23-bulk-metadata-enrichment.md) — the batch tooling that made fixing 1,650 questions practical
