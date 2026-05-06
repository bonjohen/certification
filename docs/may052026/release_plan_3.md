# Release Plan 3 — Generate XML Question Banks for 4 Remaining Exams

**Source documents:** `docs/may052026/cert_review.md`, `docs/may052026/release_plan_1.md`
**Project root:** `C:\Projects\certification`
**Date:** 2026-05-05 (PST)

---

## Context

Release Plans 1 and 2 added 10 new provider pages, lifecycle badges, and 10 new exam question banks. Four exams remain as Coming Soon placeholders with no XML data. This plan generates the question banks and activates the cards.

### The 4 Exams

| # | Exam Code | Provider | Title | Source |
|---|-----------|----------|-------|--------|
| 1 | sap-c02 | AWS | AWS Certified Solutions Architect - Professional | cert_review.md |
| 2 | dp-600 | Azure | Microsoft Certified: Fabric Analytics Engineer Associate | cert_review.md |
| 3 | gcp-data-eng | GCP | Professional Data Engineer | cert_review.md |
| 4 | gh-200 | GitHub | GitHub Actions Certification | cert_review.md |

---

## Per-Exam Deliverables

1. **Create XML file** at `data/{provider}/{exam-code}.xml` — 50 questions, baked-in A=13/B=12/C=13/D=12 answer distribution, all ampersands escaped
2. **Activate exam card** — change `<div class="exam-card coming-soon">` to `<a href="quiz.html?exam={code}" class="exam-card new-exam">`, update meta from "Coming Soon" to "50 Questions"
3. **Register in app.js** — add to `examUrls` map with exam-specific certification URL
4. **Validate** — `node scripts/validate-xml.js`

---

## Work Queue Instructions

### State Transitions

Open  -->  Started  -->  Completed
              |
              └-->  Blocked  -->  Started  -->  Completed

- **Open**: Not yet begun.
- **Started**: Actively in progress. Record the start datetime (PST).
- **Completed**: Done and verified. Record the completion datetime (PST).
- **Blocked**: Cannot proceed; note the blocker in the description.

### Commit Protocol

1. Work through all tasks in a phase.
2. When every task reaches Completed, write the Phase Summary.
3. Stage and commit all changes for the phase. Do not push.
4. Proceed immediately to the next phase.

### Agent Constraints

- Maximum 1 XML generation agent at a time
- Do not run validation inside agents; run once after file is written
- Agents must write files immediately (no planning mode)
- All XML content must escape ampersands (`&amp;`)

---

## Phase 1: AWS — SAP-C02

**Goal:** SAP-C02 XML exists, card is active on `aws.html`.
**Depends on:** Nothing (first phase).

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 1.1 | Completed | 2026-05-05 09:00 AM | 2026-05-05 09:05 AM | Create `data/aws/sap-c02.xml` — 50 questions covering advanced architecture, networking, security, cost optimization, migration, multi-account strategies, hybrid architectures, disaster recovery, high availability |
| 1.2 | Completed | 2026-05-05 09:05 AM | 2026-05-05 09:06 AM | `aws.html` — Convert SAP-C02 coming-soon `<div>` to active `<a href="quiz.html?exam=sap-c02" class="exam-card new-exam">`, update meta to "50 Questions / Professional" |
| 1.3 | Completed | 2026-05-05 09:06 AM | 2026-05-05 09:06 AM | `js/app.js` — Add `'sap-c02'` to `examUrls` map |
| 1.4 | Completed | 2026-05-05 09:06 AM | 2026-05-05 09:07 AM | Run `node scripts/validate-xml.js` on new file |
| 1.5 | Completed | 2026-05-05 09:07 AM | 2026-05-05 09:07 AM | Stage and commit |

### Phase 1 Summary

- **Changes:** Created `data/aws/sap-c02.xml` (50 questions), activated card in `aws.html`, added exam URL to `js/app.js`
- **Commit:** `Add SAP-C02 AWS Solutions Architect Professional exam (50 questions)`

---

## Phase 2: Azure — DP-600

**Goal:** DP-600 XML exists, card is active on `azure.html`.
**Depends on:** Phase 1.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 2.1 | Completed | 2026-05-05 09:08 AM | 2026-05-05 09:15 AM | Create `data/azure/dp-600.xml` — 50 questions covering Microsoft Fabric, data lakehouse, data pipelines, dataflows, semantic models, Power BI integration, data warehousing, real-time analytics, OneLake, data governance |
| 2.2 | Completed | 2026-05-05 09:15 AM | 2026-05-05 09:16 AM | `azure.html` — Convert DP-600 coming-soon `<div>` to active `<a href="quiz.html?exam=dp-600" class="exam-card new-exam">`, update meta to "50 Questions / Associate" |
| 2.3 | Completed | 2026-05-05 09:16 AM | 2026-05-05 09:16 AM | `js/app.js` — Add `'dp-600'` to `examUrls` map |
| 2.4 | Completed | 2026-05-05 09:16 AM | 2026-05-05 09:17 AM | Run `node scripts/validate-xml.js` on new file |
| 2.5 | Completed | 2026-05-05 09:17 AM | 2026-05-05 09:17 AM | Stage and commit |

### Phase 2 Summary

- **Changes:** Created `data/azure/dp-600.xml` (50 questions), activated card in `azure.html`, added exam URL to `js/app.js`
- **Commit:** `Add DP-600 Fabric Analytics Engineer Associate exam (50 questions)`

---

## Phase 3: GCP — Professional Data Engineer

**Goal:** GCP-Data-Eng XML exists, card is active on `gcp.html`.
**Depends on:** Phase 2.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 3.1 | Completed | 2026-05-05 09:18 AM | 2026-05-05 09:30 AM | Create `data/gcp/gcp-data-eng.xml` — 50 questions covering BigQuery, Dataflow, Dataproc, Pub/Sub, Cloud Composer, data pipeline design, data warehousing, ML integration, data governance, streaming/batch processing |
| 3.2 | Completed | 2026-05-05 09:30 AM | 2026-05-05 09:31 AM | `gcp.html` — Convert GCP-Data-Eng coming-soon `<div>` to active `<a href="quiz.html?exam=gcp-data-eng" class="exam-card new-exam">`, update meta to "50 Questions / Professional" |
| 3.3 | Completed | 2026-05-05 09:31 AM | 2026-05-05 09:31 AM | `js/app.js` — Add `'gcp-data-eng'` to `examUrls` map (URL: `https://cloud.google.com/learn/certification/data-engineer`) |
| 3.4 | Completed | 2026-05-05 09:31 AM | 2026-05-05 09:32 AM | Run `node scripts/validate-xml.js` on new file |
| 3.5 | Completed | 2026-05-05 09:32 AM | 2026-05-05 09:32 AM | Stage and commit |

### Phase 3 Summary

- **Changes:** Created `data/gcp/gcp-data-eng.xml` (50 questions), activated card in `gcp.html`, added exam URL to `js/app.js`
- **Commit:** `Add GCP Professional Data Engineer exam (50 questions)`

---

## Phase 4: GitHub — GH-200

**Goal:** GH-200 XML exists, card is active on `github.html`.
**Depends on:** Phase 3.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 4.1 | Completed | 2026-05-05 09:33 AM | 2026-05-05 09:45 AM | Create `data/github/gh-200.xml` — 50 questions covering GitHub Actions workflows, YAML syntax, runners, events/triggers, secrets management, reusable workflows, composite actions, CI/CD pipelines, artifact management, environments, deployment strategies |
| 4.2 | Completed | 2026-05-05 09:45 AM | 2026-05-05 09:46 AM | `github.html` — Convert GH-200 coming-soon `<div>` to active `<a href="quiz.html?exam=gh-200" class="exam-card new-exam">`, update meta to "50 Questions / Associate" |
| 4.3 | Completed | 2026-05-05 09:46 AM | 2026-05-05 09:46 AM | `js/app.js` — Add `'gh-200'` to `examUrls` map |
| 4.4 | Completed | 2026-05-05 09:46 AM | 2026-05-05 09:47 AM | Run `node scripts/validate-xml.js` on new file |
| 4.5 | Completed | 2026-05-05 09:47 AM | 2026-05-05 09:47 AM | Stage and commit |

### Phase 4 Summary

- **Changes:** Created `data/github/gh-200.xml` (50 questions), activated card in `github.html`, added exam URL to `js/app.js`
- **Commit:** `Add GH-200 GitHub Actions Certification exam (50 questions)`

---

## Phase 5: Final Validation

**Goal:** All 4 exams pass validation, all tests pass, index counts correct.
**Depends on:** Phase 4.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 5.1 | Completed | 2026-05-05 09:48 AM | 2026-05-05 09:48 AM | `index.html` — Verify study guide counts are correct for AWS, Azure, GCP, GitHub |
| 5.2 | Completed | 2026-05-05 09:48 AM | 2026-05-05 09:49 AM | Run `node scripts/validate-xml.js` — all files pass |
| 5.3 | Completed | 2026-05-05 09:49 AM | 2026-05-05 09:49 AM | Run `npx vitest run` — all tests pass |
| 5.4 | Completed | 2026-05-05 09:49 AM | 2026-05-05 09:50 AM | Run `python scripts/randomize_answers.py --show-current` — verify answer distributions |
| 5.5 | Completed | 2026-05-05 09:50 AM | 2026-05-05 09:50 AM | Stage and commit |

### Phase 5 Summary

- **Changes:** Verified index.html counts (all correct), ran randomize_answers.py on all files, all 50 XML files pass validation, all 172 tests pass
- **Commit:** `Final validation: verify counts, tests, answer distributions for 4 new exams`

---

## Critical Files

| File | Changes |
|------|---------|
| `data/aws/sap-c02.xml` | New — 50 questions |
| `data/azure/dp-600.xml` | New — 50 questions |
| `data/gcp/gcp-data-eng.xml` | New — 50 questions |
| `data/github/gh-200.xml` | New — 50 questions |
| `aws.html` | Activate SAP-C02 card |
| `azure.html` | Activate DP-600 card |
| `gcp.html` | Activate GCP-Data-Eng card |
| `github.html` | Activate GH-200 card |
| `js/app.js` | Add 4 exams to `examUrls` map |
| `index.html` | Verify/update study guide counts |

## Verification

1. `node scripts/validate-xml.js` — all 4 new XML files pass
2. `python scripts/randomize_answers.py --show-current` — answer distribution is A=13/B=12/C=13/D=12
3. `npx vitest run` — all tests pass
4. Manual: load each `quiz.html?exam={code}` in browser and confirm questions render
