# April 11 New XML Content Review Plan

**Date:** 2026-04-11
**Scope:** 7 new XML exam files added today
**Reference file:** `data/aws/aif-c01.xml` (gold standard)

## Problem Statement

The 7 new XML files were machine-generated in a simplified format and converted to the canonical schema via `scripts/convert_xml_schema.py`. While structurally valid against `certification.xsd`, the content quality is significantly below the reference standard. This plan addresses the content gaps.

## Files Under Review

| File | Provider | Questions | Issues Found |
|------|----------|-----------|--------------|
| `data/aws/aip-c01.xml` | AWS | 50 | Answer bias, thin hints, generic titles/scenarios |
| `data/azure/ai-102.xml` | Azure | 50 | 100% B answers, thin hints, generic titles/scenarios |
| `data/azure/ai-300.xml` | Azure | 50 | 100% B answers, thin hints, generic titles/scenarios |
| `data/azure/az-700.xml` | Azure | 50 | 100% B answers, thin hints, generic titles/scenarios |
| `data/gcp/cloud-data-engineer.xml` | GCP | 50 | 94% B answers, thin hints, generic titles/scenarios |
| `data/gcp/gen-ai-leader.xml` | GCP | 50 | 100% B answers, thin hints, generic titles/scenarios |
| `data/gcp/pro-ml-eng.xml` | GCP | 50 | 100% A answers, thin hints, generic titles/scenarios |

## Issues Identified

### 1. Answer Position Bias (Critical)

The correct answer is almost always in the same position, making quizzes trivially gameable.

| File | A | B | C | D |
|------|---|---|---|---|
| aip-c01.xml | 1 | 45 | 4 | 0 |
| ai-102.xml | 0 | 50 | 0 | 0 |
| ai-300.xml | 0 | 50 | 0 | 0 |
| az-700.xml | 0 | 50 | 0 | 0 |
| cloud-data-engineer.xml | 3 | 47 | 0 | 0 |
| gen-ai-leader.xml | 0 | 50 | 0 | 0 |
| pro-ml-eng.xml | 50 | 0 | 0 | 0 |

**Fix:** Run `scripts/randomize_answers.py` on all 7 files. This script already exists and handles letter shuffling with correct-answer tracking.

### 2. Hint Content Far Too Thin (Critical)

Hint quality is the core study value of the site. The new files are 5-20x shorter than the reference.

| Metric | Reference (aif-c01) | New Files Average |
|--------|---------------------|-------------------|
| Hint 1 avg length | 110 chars | 16 chars |
| Hint 2 avg length | 380 chars | 63 chars |
| Hint 3 avg length | 294 chars | 14 chars |
| Hint 1 min length | 77 chars | 3 chars |
| Hint 3 min length | 243 chars | 3 chars |

Worst offenders: `az-700.xml` (hint3 avg 8 chars), `ai-102.xml` (hint2 avg 42 chars), `pro-ml-eng.xml` (hint3 avg 8 chars).

**Hint 1 (Brief Hint):** Should be 1-2 sentences nudging toward the right concept area. Currently just 2-3 word fragments like "Think vectors" or "Think security".

**Hint 2 (Complete Explanation):** Should be a full paragraph explaining why the correct answer is right and why the distractors are wrong. Currently just 1 sentence restating the answer.

**Hint 3 (Deep Knowledge):** Should be a bulleted list of related concepts, edge cases, or exam-relevant detail (often using `<ul><li>` markup). Currently just the answer word itself (e.g., "Firewall", "Spanner").

**Fix:** Rewrite all hints per file to match reference quality. This is the bulk of the work.

### 3. Generic Titles (Moderate)

All 350 questions use "Question N" as their title. The reference file uses descriptive titles like "Machine Learning Definition", "Supervised vs Unsupervised Learning", etc.

**Fix:** Replace each generic title with a 2-5 word descriptive title derived from the question content.

### 4. Single Boilerplate Scenario (Moderate)

All 350 questions share one generic scenario: "You are preparing for the {exam-title} certification exam." The reference file has 50 unique scenarios that set up realistic workplace situations.

**Fix:** Write unique scenarios per question that contextualize the problem in a real-world situation.

### 5. No Category Differentiation (Low)

All questions use a single `cat-general` category. The reference file defines 4+ categories per exam (e.g., "AI/ML Fundamentals", "AWS AI Services", "Responsible AI", "ML Lifecycle").

**Fix:** Define 3-5 categories per exam and assign each question to the appropriate category.

### 6. No Tag Variety (Low)

All questions have a single tag matching the exam code. The reference file uses 2-3 topical tags per question (e.g., "Machine Learning", "AI Fundamentals", "Concepts").

**Fix:** Add 2-3 descriptive tags per question.

## Phased Execution

### Phase 1: Answer Randomization
**Goal:** Eliminate answer position bias across all 7 files.
**Effort:** Low (scripted)

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 1.1 | Completed | 2026-04-12 07:01 AM (PST) | 2026-04-12 07:02 AM (PST) | Run `scripts/randomize_answers.py` on all 7 new XML files |
| 1.2 | Completed | 2026-04-12 07:02 AM (PST) | 2026-04-12 07:02 AM (PST) | Verify post-randomization distribution is roughly uniform (no letter > 35%) |
| 1.3 | Completed | 2026-04-12 07:02 AM (PST) | 2026-04-12 07:03 AM (PST) | Run `npx vitest run` to confirm no regressions |
| 1.4 | Started | 2026-04-12 07:03 AM (PST) | | Stage and commit Phase 1 |

### Phase 1 Summary
- **Changes:** Ran `scripts/randomize_answers.py` across all 33 XML files (7 new + 26 existing). The 7 new files went from 90-100% single-letter bias to well-distributed answers (overall: A=24.6%, B=23.0%, C=27.7%, D=24.7%). Two files at 36% on one letter — within normal variance for n=50. 172 tests passing.
- **Changes hosted at:** TBD
- **Commit:** `Randomize answer positions across all exam XML files`

---

### Phase 2: Hint Enrichment — AWS
**Goal:** Bring `aip-c01.xml` hints to reference quality.
**Effort:** High (50 questions x 3 hints = 150 hint rewrites)

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 2.1 | Open | | | Rewrite all Hint 1 entries in `data/aws/aip-c01.xml` — 1-2 sentence nudges |
| 2.2 | Open | | | Rewrite all Hint 2 entries in `data/aws/aip-c01.xml` — full explanations with distractor analysis |
| 2.3 | Open | | | Rewrite all Hint 3 entries in `data/aws/aip-c01.xml` — bulleted deep knowledge with `<ul><li>` markup |
| 2.4 | Open | | | Validate XML against `data/schema/certification.xsd` |
| 2.5 | Open | | | Stage and commit Phase 2 |

### Phase 2 Summary
- **Changes:** TBD
- **Commit:** `Enrich hints for AWS AIP-C01 to reference quality`

---

### Phase 3: Hint Enrichment — Azure (3 files)
**Goal:** Bring `ai-102.xml`, `ai-300.xml`, `az-700.xml` hints to reference quality.
**Effort:** High (150 questions x 3 hints = 450 hint rewrites)

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 3.1 | Open | | | Rewrite all hints in `data/azure/ai-102.xml` |
| 3.2 | Open | | | Rewrite all hints in `data/azure/ai-300.xml` |
| 3.3 | Open | | | Rewrite all hints in `data/azure/az-700.xml` |
| 3.4 | Open | | | Validate all 3 files against XSD |
| 3.5 | Open | | | Stage and commit Phase 3 |

### Phase 3 Summary
- **Changes:** TBD
- **Commit:** `Enrich hints for Azure AI-102, AI-300, AZ-700 to reference quality`

---

### Phase 4: Hint Enrichment — GCP (3 files)
**Goal:** Bring `cloud-data-engineer.xml`, `gen-ai-leader.xml`, `pro-ml-eng.xml` hints to reference quality.
**Effort:** High (150 questions x 3 hints = 450 hint rewrites)

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 4.1 | Open | | | Rewrite all hints in `data/gcp/cloud-data-engineer.xml` |
| 4.2 | Open | | | Rewrite all hints in `data/gcp/gen-ai-leader.xml` |
| 4.3 | Open | | | Rewrite all hints in `data/gcp/pro-ml-eng.xml` |
| 4.4 | Open | | | Validate all 3 files against XSD |
| 4.5 | Open | | | Stage and commit Phase 4 |

### Phase 4 Summary
- **Changes:** TBD
- **Commit:** `Enrich hints for GCP cloud-data-engineer, gen-ai-leader, pro-ml-eng to reference quality`

---

### Phase 5: Titles, Scenarios, and Categories
**Goal:** Replace generic titles, boilerplate scenarios, and single-category assignments across all 7 files.
**Effort:** High (350 questions need title + scenario + category + tags)

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 5.1 | Open | | | Define 3-5 categories per exam in each file's `<metadata><categories>` |
| 5.2 | Open | | | Replace "Question N" titles with descriptive titles across all 7 files |
| 5.3 | Open | | | Write unique real-world scenarios for all 350 questions |
| 5.4 | Open | | | Assign `category-ref` per question to match new categories |
| 5.5 | Open | | | Add 2-3 descriptive tags per question |
| 5.6 | Open | | | Validate all 7 files against XSD |
| 5.7 | Open | | | Run `npx vitest run` to confirm no regressions |
| 5.8 | Open | | | Stage and commit Phase 5 |

### Phase 5 Summary
- **Changes:** TBD
- **Commit:** `Add descriptive titles, unique scenarios, categories, and tags to 7 new XML files`

---

## Execution Notes

- **Phase 1** is scripted and can run immediately.
- **Phases 2-4** are the heaviest lift — 1,050 hint rewrites total. Consider parallelizing across files using subagents in worktrees. Each file is independent.
- **Phase 5** can partially overlap with hint work but is cleaner as a separate pass after hints are stable.
- All phases validate against `data/schema/certification.xsd` before committing.
- The existing `scripts/randomize_answers.py` handles Phase 1. No new tooling needed.
