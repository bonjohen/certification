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

## Information Needed to Complete This Document

- [ ] Include results from actual validation runs (match rates, disagreement rates)
- [ ] Show example disagreements: cases where the stored answer was wrong vs where the LLM was wrong
- [ ] Document the prompt template used for blind attempts
- [ ] Discuss cost and time for validating 1,650 questions
- [ ] Address the false-negative problem: what if both the LLM and the stored answer are wrong?
