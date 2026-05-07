# Verbatim Answer Leakage in Hints

## The Lesson

When hints contain the exact text of the correct answer choice, they short-circuit learning. The learner reads the hint, sees the answer verbatim, and selects it without understanding why it's correct. This is a subtle content defect that is invisible in manual review but easy to detect programmatically.

## Context

The certification quiz had a three-level progressive hint system. Level 1 hints (Brief Hint) are meant to nudge the learner toward the right concept area without giving away the answer. An audit found that 45+ questions across 28 exam files had H1 hints that contained the verbatim text of the correct answer choice.

## What Happened

1. An audit script (`scripts/audit_hint1.py`) was written to compare each H1 hint against all answer choices for the same question
2. The script flagged any H1 hint that contained the exact text of the correct answer choice as a substring
3. 45 instances were found across 11 of 28 files
4. A fix script (`scripts/fix_verbatim_h1.py`) rewrote flagged H1 hints to point toward the concept area without naming the specific answer
5. Post-fix audit confirmed zero remaining leaks

## Key Insights

- **Verbatim leakage is a content smell, not a schema error.** The data is structurally valid — the hint has text, the answer has a letter. Only semantic comparison reveals the problem.
- **Substring matching catches most cases.** If the H1 hint contains the exact string of the correct answer choice, it's a leak. Fuzzy matching or semantic similarity would catch more cases but has more false positives.
- **The fix must preserve the pedagogical intent.** Rewriting a leaky hint is not just removing the answer text — it's replacing it with a genuine conceptual nudge. "Think about which Azure service handles X" is good. "The answer is not A, B, or D" is not.
- **Automated detection should run as a quality gate.** New questions should be checked for leakage before they're merged. The audit script is cheap to run and catches a high-value defect class.
- **This applies to any hint/clue system, not just quiz apps.** Educational software, help systems, guided tutorials — anywhere a "hint" exists alongside a "correct answer," leakage is possible.

## Examples

**Leaked H1:** "Consider Azure Functions for this scenario."
**Correct answer choice B:** "Azure Functions"
**Problem:** The hint names the correct answer verbatim.

**Fixed H1:** "Think about which Azure service is designed for event-driven, serverless execution."
**Same correct answer:** "Azure Functions"
**Why better:** Points to the concept (event-driven, serverless) without naming the specific service.

## Related Lessons

- [Hint Quality as a Spectrum](05-hint-quality-spectrum.md) — leakage undermines H1's purpose as a conceptual nudge; the fix must preserve that pedagogical role
- [Content Quality Auditing at Scale](03-content-quality-auditing.md) — leakage detection is one type of automated quality audit that runs across the full corpus
