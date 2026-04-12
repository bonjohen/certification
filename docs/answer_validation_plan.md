# Answer Validation Plan — AI-Graded Content Review

**Date:** 2026-04-12
**Scope:** All 33 exam XML files (1,650 questions)
**Purpose:** Independently verify correctness of answers and hints by having Claude attempt each question blind, then compare against the stored answer and explanation.

## Problem Statement

The exam content was generated or written by various sources with varying quality. While hints have been enriched to reference quality, the factual correctness of answers and explanations has not been independently verified. A wrong correct-answer or a misleading hint is worse than a thin hint — it actively teaches incorrect information.

This plan has Claude attempt each question without seeing the answer key, generate its own explanation, then compare against the stored correct answer and hint content. Discrepancies are flagged for human review.

## Methodology

For each question in each exam file:

1. **Blind attempt:** Present the question text, scenario, and choices to Claude without revealing the correct answer or hints. Claude selects an answer and writes a brief explanation.
2. **Compare:** Check whether Claude's answer matches the stored `<correct-answer>`.
3. **Classify the result:**
   - **Match** — Claude agrees with the stored answer. Log as confirmed.
   - **Disagree** — Claude picked a different answer. Flag for review with both explanations.
   - **Ambiguous** — Claude identifies the question as having multiple defensible answers or unclear wording. Flag for review.
4. **Hint review:** For each question (match or not), compare Claude's explanation against Hint 2 (Complete Explanation). Flag if:
   - The hint contains a factual error Claude can identify
   - The hint's distractor analysis contradicts Claude's reasoning
   - The hint is correct but Claude's explanation adds important nuance the hint lacks

## Output Format

Per-exam report as a markdown file in `docs/validation/`:

```markdown
# Answer Validation: {exam-code}

**Date:** YYYY-MM-DD
**Questions:** 50
**Matches:** N (N%)
**Disagreements:** N
**Ambiguous:** N

## Disagreements

### Question {id}: {title}
- **Stored answer:** {letter} — {choice text}
- **Claude's answer:** {letter} — {choice text}
- **Claude's reasoning:** {explanation}
- **Hint 2 says:** {hint text}
- **Assessment:** [likely wrong answer / ambiguous question / Claude error]

## Ambiguous Questions

### Question {id}: {title}
- **Issue:** {description of ambiguity}
- **Recommendation:** [reword / accept as-is / change answer]

## Hint Corrections

### Question {id}: {title}
- **Issue:** {factual error or misleading statement in hint}
- **Recommendation:** {suggested fix}

## Summary
- Questions confirmed correct: N
- Questions needing review: N
- Hint issues found: N
```

## Phased Execution

### Phase 1: AWS Exams (8 files, 400 questions)
**Goal:** Validate all AWS exam answers and hints.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 1.1 | Open | | | Validate `data/aws/clf-c02.xml` (50 questions) |
| 1.2 | Open | | | Validate `data/aws/aif-c01.xml` (50 questions) |
| 1.3 | Open | | | Validate `data/aws/aip-c01.xml` (50 questions) |
| 1.4 | Open | | | Validate `data/aws/saa-c03.xml` (50 questions) |
| 1.5 | Open | | | Validate `data/aws/dva-c02.xml` (50 questions) |
| 1.6 | Open | | | Validate `data/aws/soa-c02.xml` (50 questions) |
| 1.7 | Open | | | Validate `data/aws/dea-c01.xml` (50 questions) |
| 1.8 | Open | | | Validate `data/aws/mla-c01.xml` (50 questions) |
| 1.9 | Open | | | Write summary report `docs/validation/aws_validation.md` |
| 1.10 | Open | | | Stage and commit Phase 1 |

### Phase 1 Summary
- **Changes:** TBD
- **Commit:** `Validate AWS exam answers and hints — N disagreements found`

---

### Phase 2: Azure Exams (11 files, 550 questions)
**Goal:** Validate all Azure exam answers and hints.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 2.1 | Open | | | Validate `data/azure/az-900.xml` (50 questions) |
| 2.2 | Open | | | Validate `data/azure/az-104.xml` (50 questions) |
| 2.3 | Open | | | Validate `data/azure/az-204.xml` (50 questions) |
| 2.4 | Open | | | Validate `data/azure/az-305.xml` (50 questions) |
| 2.5 | Open | | | Validate `data/azure/az-400.xml` (50 questions) |
| 2.6 | Open | | | Validate `data/azure/az-500.xml` (50 questions) |
| 2.7 | Open | | | Validate `data/azure/az-700.xml` (50 questions) |
| 2.8 | Open | | | Validate `data/azure/dp-900.xml` (50 questions) |
| 2.9 | Open | | | Validate `data/azure/ai-900.xml` (50 questions) |
| 2.10 | Open | | | Validate `data/azure/ai-102.xml` (50 questions) |
| 2.11 | Open | | | Validate `data/azure/ai-300.xml` (50 questions) |
| 2.12 | Open | | | Write summary report `docs/validation/azure_validation.md` |
| 2.13 | Open | | | Stage and commit Phase 2 |

### Phase 2 Summary
- **Changes:** TBD
- **Commit:** `Validate Azure exam answers and hints — N disagreements found`

---

### Phase 3: GCP Exams (13 files, 650 questions)
**Goal:** Validate all GCP exam answers and hints.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 3.1 | Open | | | Validate `data/gcp/gcp-fund-core.xml` (50 questions) |
| 3.2 | Open | | | Validate `data/gcp/gcp-cloud-fnd.xml` (50 questions) |
| 3.3 | Open | | | Validate `data/gcp/gcp-cloud-eng.xml` (50 questions) |
| 3.4 | Open | | | Validate `data/gcp/gcp-exam-prep-ace.xml` (50 questions) |
| 3.5 | Open | | | Validate `data/gcp/gcp-cloud-arch.xml` (50 questions) |
| 3.6 | Open | | | Validate `data/gcp/gcp-gk-compute.xml` (50 questions) |
| 3.7 | Open | | | Validate `data/gcp/gcp-networks.xml` (50 questions) |
| 3.8 | Open | | | Validate `data/gcp/gcp-db-stor.xml` (50 questions) |
| 3.9 | Open | | | Validate `data/gcp/gcp-data-eng-ml.xml` (50 questions) |
| 3.10 | Open | | | Validate `data/gcp/gcp-db-devops.xml` (50 questions) |
| 3.11 | Open | | | Validate `data/gcp/cloud-data-engineer.xml` (50 questions) |
| 3.12 | Open | | | Validate `data/gcp/gen-ai-leader.xml` (50 questions) |
| 3.13 | Open | | | Validate `data/gcp/pro-ml-eng.xml` (50 questions) |
| 3.14 | Open | | | Write summary report `docs/validation/gcp_validation.md` |
| 3.15 | Open | | | Stage and commit Phase 3 |

### Phase 3 Summary
- **Changes:** TBD
- **Commit:** `Validate GCP exam answers and hints — N disagreements found`

---

### Phase 4: Anthropic Exam (1 file, 50 questions)
**Goal:** Validate the Anthropic CCA-F exam answers and hints.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 4.1 | Open | | | Validate `data/anthropic/cca-f.xml` (50 questions) |
| 4.2 | Open | | | Write summary report `docs/validation/anthropic_validation.md` |
| 4.3 | Open | | | Stage and commit Phase 4 |

### Phase 4 Summary
- **Changes:** TBD
- **Commit:** `Validate Anthropic CCA-F exam answers and hints — N disagreements found`

---

### Phase 5: Remediation
**Goal:** Fix confirmed wrong answers, ambiguous questions, and hint errors found in Phases 1-4.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 5.1 | Open | | | Triage all flagged items: classify as fix / accept / needs-user-input |
| 5.2 | Open | | | Fix confirmed wrong answers in XML files |
| 5.3 | Open | | | Fix confirmed hint errors in XML files |
| 5.4 | Open | | | Reword ambiguous questions where the fix is clear |
| 5.5 | Open | | | Validate all modified files against XSD |
| 5.6 | Open | | | Run `npx vitest run` |
| 5.7 | Open | | | Stage and commit Phase 5 |

### Phase 5 Summary
- **Changes:** TBD
- **Commit:** `Remediate N answer/hint errors found during validation`

---

## Execution Notes

- Each validation task can run as a parallel subagent since files are independent.
- The blind-attempt approach requires that the agent NOT read the correct-answer or hints before answering. The agent should be given only: scenario, question-text, and choices.
- A Python script should extract questions, feed them to the validation agent, then compare results programmatically.
- Expected disagreement rate: 2-5% for well-written exams, potentially higher for machine-generated content.
- Claude's answer is not automatically correct — disagreements need human judgment. The value is in surfacing questions that deserve a second look.
- This plan should run AFTER the hint enrichment plans complete, so hints are in their final state when reviewed.

## Relationship to Other Plans

- **Depends on:** `docs/hint_enrichment_plan.md` and `docs/April11plan.md` (all hint work should be complete first)
- **Independent of:** April11plan Phase 5 (titles/scenarios/categories) — validation checks answers and explanations, not metadata
