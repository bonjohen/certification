# AI-Graded Content Validation

## The Lesson

Large question banks authored by multiple sources (human or AI) accumulate factual errors that are invisible to structural validation. Using an LLM to independently attempt each question blind — without seeing the answer key — and then comparing its answer to the stored correct answer, surfaces wrong answers, ambiguous questions, and misleading explanations at scale.

## Context

1,650 certification exam questions across 10 providers had been structurally validated (schema-correct, hints above quality thresholds) but never independently verified for factual correctness. A wrong correct-answer or misleading hint actively teaches incorrect information — worse than having no hint at all.

## The Methodology

1. Present each question to an LLM without the answer key or hints
2. The LLM selects an answer and writes its reasoning
3. Compare the LLM's answer to the stored correct answer
4. Classify as Match, Disagree, or Ambiguous
5. For disagreements, include both explanations for human review
6. Additionally compare the LLM's explanation against stored H2 hints for factual consistency

## Key Insights

- **Blind attempt is essential.** If the LLM sees the answer, it will rationalize it. The value comes from independent reasoning.
- **Disagreements are not automatically the LLM's error.** Some stored answers are genuinely wrong. The disagreement flags it for human review — the human makes the final call.
- **"Ambiguous" is a valid classification.** Some questions legitimately have multiple defensible answers. Identifying these is valuable — they should be rewritten, not left as trick questions.
- **This catches a different class of errors than schema validation.** Schema validation ensures the data is well-formed. AI validation ensures the content is factually correct. Both are needed.
- **The output is a review queue, not an auto-fix.** The LLM identifies candidates; humans verify. False positives (LLM wrong, stored answer right) are acceptable. False negatives (both agree on a wrong answer) are the blind spot.

## Applicability

This technique works for any large corpus of factual Q&A content: exam prep tools, trivia databases, FAQ systems, documentation with embedded quizzes. It is less useful for subjective or opinion-based questions where "correctness" depends on context. It also has diminishing returns on content that was written by a single expert who has already verified answers manually.

## Related Lessons

- [Content Quality Auditing at Scale](03-content-quality-auditing.md) — structural quality auditing (character counts, schema) is necessary but insufficient; AI validation catches factual errors that structural checks miss
- [Schema Enforcement at the Data Layer](02-schema-enforcement.md) — schema validation ensures well-formed data; AI validation ensures factually correct data; both are needed
