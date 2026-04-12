# Hint Enrichment Plan — All Exams

**Date:** 2026-04-12
**Scope:** All 33 exam XML files — schema fixes and hint enrichment to reference quality
**Reference file:** `data/aws/aif-c01.xml` (gold standard: H1=110, H2=380, H3=294 avg chars)

## Problem Statement

An audit of all 33 exam files reveals that 22 of 33 have hints below reference quality thresholds. Four files also have invalid XML schema that must be fixed before hint enrichment. This plan covers both schema remediation and hint enrichment for every file that needs it.

## Quality Thresholds

| Level | Label | Min Avg Chars | Description |
|-------|-------|---------------|-------------|
| H1 | Brief Hint | 80 | 1-2 sentence nudge toward the right concept |
| H2 | Complete Explanation | 250 | Full paragraph: why correct, why distractors wrong |
| H3 | Deep Knowledge | 200 | Bulleted `<ul><li>` list with 3-4 deep-dive bullets |

## File Audit Summary

### Tier 1: Invalid Schema (4 files) — need XSD conversion + hint enrichment

These files use a variant XML schema (`heading` instead of `label`, `<list><item>` instead of `<ul><li>`, inline hint text instead of `<content>` wrapper, `id` instead of `letter` on choices). They fail XSD validation with hundreds of errors. Must be converted to canonical schema before hint quality can be assessed or improved.

| File | Provider | Qs | XSD Errors | Notes |
|------|----------|----|------------|-------|
| `data/aws/dea-c01.xml` | AWS | 50 | 855 | Variant schema; hints exist but wrong structure |
| `data/aws/mla-c01.xml` | AWS | 50 | 855 | Variant schema; hints exist but wrong structure |
| `data/azure/ai-900.xml` | Azure | 50 | 101 | Missing created-date, variant hint structure |
| `data/azure/dp-900.xml` | Azure | 50 | 101 | Missing created-date, variant hint structure |

### Tier 2: Critical (6 files) — valid schema, hints nearly empty (H2 < 100)

These files have valid XSD structure but extremely thin hint content (2-3 word fragments). Already being addressed in `docs/April11plan.md` Phases 2-4.

| File | Provider | H1 avg | H2 avg | H3 avg | Status |
|------|----------|--------|--------|--------|--------|
| `data/aws/aip-c01.xml` | AWS | 187 | 587 | 676 | **Done** (Phase 2) |
| `data/azure/ai-102.xml` | Azure | 14 | 42 | 10 | **In progress** (Phase 3) |
| `data/azure/ai-300.xml` | Azure | 21 | 88 | 23 | **In progress** (Phase 3) |
| `data/azure/az-700.xml` | Azure | 15 | 36 | 8 | **In progress** (Phase 3) |
| `data/gcp/cloud-data-engineer.xml` | GCP | 15 | 47 | 12 | Pending (Phase 4) |
| `data/gcp/gen-ai-leader.xml` | GCP | 14 | 47 | 14 | Pending (Phase 4) |
| `data/gcp/pro-ml-eng.xml` | GCP | 14 | 54 | 8 | Pending (Phase 4) |

### Tier 3: Needs Work (12 files) — valid schema, hints below threshold

These files have real hint content but fall short on at least one metric. The primary gap is H1 (Brief Hint) being too short across all GCP files.

| File | Provider | H1 avg | H2 avg | H3 avg | Primary Gap |
|------|----------|--------|--------|--------|-------------|
| `data/azure/az-104.xml` | Azure | 49 | 162 | 258 | H1 short, H2 thin |
| `data/azure/az-900.xml` | Azure | 68 | 217 | 242 | H1 short, H2 thin |
| `data/gcp/gcp-exam-prep-ace.xml` | GCP | 75 | 221 | 308 | H1 short, H2 thin |
| `data/gcp/gcp-gk-compute.xml` | GCP | 66 | 239 | 247 | H1 short |
| `data/gcp/gcp-networks.xml` | GCP | 70 | 240 | 234 | H1 short |
| `data/gcp/gcp-db-devops.xml` | GCP | 67 | 241 | 210 | H1 short |
| `data/gcp/gcp-cloud-fnd.xml` | GCP | 67 | 248 | 304 | H1 short |
| `data/gcp/gcp-data-eng-ml.xml` | GCP | 65 | 254 | 262 | H1 short |
| `data/gcp/gcp-cloud-eng.xml` | GCP | 65 | 269 | 328 | H1 short |
| `data/gcp/gcp-fund-core.xml` | GCP | 68 | 270 | 386 | H1 short |
| `data/gcp/gcp-db-stor.xml` | GCP | 78 | 272 | 253 | H1 short |
| `data/gcp/gcp-cloud-arch.xml` | GCP | 64 | 294 | 316 | H1 short |

### Tier 4: OK (11 files) — no action needed

| File | Provider | H1 avg | H2 avg | H3 avg |
|------|----------|--------|--------|--------|
| `data/azure/az-305.xml` | Azure | 97 | 267 | 327 |
| `data/azure/az-400.xml` | Azure | 93 | 277 | 305 |
| `data/azure/az-500.xml` | Azure | 103 | 294 | 316 |
| `data/aws/clf-c02.xml` | AWS | 110 | 342 | 305 |
| `data/azure/az-204.xml` | Azure | 140 | 342 | 324 |
| `data/aws/dva-c02.xml` | AWS | 105 | 369 | 286 |
| `data/aws/saa-c03.xml` | AWS | 107 | 374 | 289 |
| `data/aws/soa-c02.xml` | AWS | 106 | 374 | 264 |
| `data/aws/aif-c01.xml` | AWS | 110 | 380 | 294 |
| `data/aws/aip-c01.xml` | AWS | 187 | 587 | 676 |
| `data/anthropic/cca-f.xml` | Anthropic | 113 | 689 | 707 |

---

## Phased Execution

### Phase 1: Schema Conversion (4 files)
**Goal:** Convert the 4 invalid-schema files to canonical `certification.xsd` format.
**Depends on:** Nothing.
**Note:** These files already have substantive hint content in the wrong XML structure. The conversion must preserve existing content while restructuring it.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 1.1 | Completed | 2026-04-12 07:17 AM (PST) | 2026-04-12 07:20 AM (PST) | Write conversion script for variant schema (`heading`→`label`, `<list><item>`→`<ul><li>`, inline→`<content>`, `id`→`letter`, fix `last-modified` format, add missing `created-date`) |
| 1.2 | Completed | 2026-04-12 07:20 AM (PST) | 2026-04-12 07:22 AM (PST) | Convert `data/aws/dea-c01.xml` and `data/aws/mla-c01.xml` |
| 1.3 | Completed | 2026-04-12 07:20 AM (PST) | 2026-04-12 07:22 AM (PST) | Convert `data/azure/ai-900.xml` and `data/azure/dp-900.xml` |
| 1.4 | Completed | 2026-04-12 07:22 AM (PST) | 2026-04-12 07:25 AM (PST) | Validate all 4 files against XSD |
| 1.5 | Completed | 2026-04-12 07:25 AM (PST) | 2026-04-12 07:25 AM (PST) | Measure hint quality post-conversion to determine if enrichment is also needed |
| 1.6 | Completed | 2026-04-12 07:25 AM (PST) | 2026-04-12 07:25 AM (PST) | Run `npx vitest run` to confirm no regressions |
| 1.7 | Completed | 2026-04-12 07:25 AM (PST) | 2026-04-12 07:25 AM (PST) | Stage and commit Phase 1 |

### Phase 1 Summary
- **Changes:** Wrote `scripts/convert_variant_schema.py` handling two variant schemas. Converted 4 files to canonical XSD. AWS files (dea-c01, mla-c01) had good hints in wrong structure — now valid and OK (H2=588/609). Azure files (ai-900, dp-900) valid but need hint enrichment (H2=73/80). 172 tests passing.
- **Changes hosted at:** TBD
- **Commit:** `Convert 4 variant-schema XML files to canonical certification.xsd format`

---

### Phase 2: Hint Enrichment — Converted Files (if needed)
**Goal:** Bring the 4 newly-converted files to reference hint quality if they fall below threshold after conversion.
**Depends on:** Phase 1.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 2.1 | Completed | 2026-04-12 07:25 AM (PST) | 2026-04-12 07:25 AM (PST) | Enrich hints in `data/aws/dea-c01.xml` if below threshold — SKIPPED, already OK (H2=588) |
| 2.2 | Completed | 2026-04-12 07:25 AM (PST) | 2026-04-12 07:25 AM (PST) | Enrich hints in `data/aws/mla-c01.xml` if below threshold — SKIPPED, already OK (H2=609) |
| 2.3 | Completed | 2026-04-12 07:25 AM (PST) | 2026-04-12 01:53 PM (PST) | Enrich hints in `data/azure/ai-900.xml` if below threshold |
| 2.4 | Completed | 2026-04-12 07:25 AM (PST) | 2026-04-12 01:53 PM (PST) | Enrich hints in `data/azure/dp-900.xml` if below threshold |
| 2.5 | Completed | 2026-04-12 01:53 PM (PST) | 2026-04-12 01:53 PM (PST) | Validate all files against XSD |
| 2.6 | Completed | 2026-04-12 01:53 PM (PST) | 2026-04-12 01:53 PM (PST) | Run `npx vitest run` |
| 2.7 | Completed | 2026-04-12 01:53 PM (PST) | 2026-04-12 01:54 PM (PST) | Stage and commit Phase 2 |

### Phase 2 Summary
- **Changes:** dea-c01 and mla-c01 already met thresholds after schema conversion (skipped). Enriched ai-900: H1=146, H2=663, H3=1141. Enriched dp-900: H1=187, H2=671, H3=969. All XSD valid, 172 tests passing.
- **Changes hosted at:** TBD
- **Commit:** `Enrich hints for ai-900, dp-900 to reference quality`

---

### Phase 3: Hint Enrichment — Azure Below-Threshold (2 files)
**Goal:** Bring `az-104.xml` and `az-900.xml` to reference hint quality.
**Depends on:** Nothing (independent of Phases 1-2).

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 3.1 | Open | | | Enrich all hints in `data/azure/az-104.xml` (H1=49→100+, H2=162→300+) |
| 3.2 | Open | | | Enrich all hints in `data/azure/az-900.xml` (H1=68→100+, H2=217→300+) |
| 3.3 | Open | | | Validate both files against XSD |
| 3.4 | Open | | | Run `npx vitest run` |
| 3.5 | Open | | | Stage and commit Phase 3 |

### Phase 3 Summary
- **Changes:** TBD
- **Commit:** `Enrich hints for Azure az-104, az-900 to reference quality`

---

### Phase 4: Hint Enrichment — GCP Below-Threshold Batch 1 (4 files)
**Goal:** Bring 4 GCP files closest to threshold to reference quality.
**Depends on:** Nothing.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 4.1 | Open | | | Enrich all hints in `data/gcp/gcp-cloud-arch.xml` (H1=64→100+) |
| 4.2 | Open | | | Enrich all hints in `data/gcp/gcp-db-stor.xml` (H1=78→100+) |
| 4.3 | Open | | | Enrich all hints in `data/gcp/gcp-fund-core.xml` (H1=68→100+) |
| 4.4 | Open | | | Enrich all hints in `data/gcp/gcp-cloud-eng.xml` (H1=65→100+) |
| 4.5 | Open | | | Validate all 4 files against XSD |
| 4.6 | Open | | | Run `npx vitest run` |
| 4.7 | Open | | | Stage and commit Phase 4 |

### Phase 4 Summary
- **Changes:** TBD
- **Commit:** `Enrich hints for GCP cloud-arch, db-stor, fund-core, cloud-eng to reference quality`

---

### Phase 5: Hint Enrichment — GCP Below-Threshold Batch 2 (4 files)
**Goal:** Bring 4 more GCP files to reference quality.
**Depends on:** Nothing.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 5.1 | Open | | | Enrich all hints in `data/gcp/gcp-data-eng-ml.xml` (H1=65→100+) |
| 5.2 | Open | | | Enrich all hints in `data/gcp/gcp-cloud-fnd.xml` (H1=67→100+) |
| 5.3 | Open | | | Enrich all hints in `data/gcp/gcp-db-devops.xml` (H1=67→100+) |
| 5.4 | Open | | | Enrich all hints in `data/gcp/gcp-networks.xml` (H1=70→100+) |
| 5.5 | Open | | | Validate all 4 files against XSD |
| 5.6 | Open | | | Run `npx vitest run` |
| 5.7 | Open | | | Stage and commit Phase 5 |

### Phase 5 Summary
- **Changes:** TBD
- **Commit:** `Enrich hints for GCP data-eng-ml, cloud-fnd, db-devops, networks to reference quality`

---

### Phase 6: Hint Enrichment — GCP Below-Threshold Batch 3 (4 files)
**Goal:** Bring remaining 4 GCP files to reference quality.
**Depends on:** Nothing.

| Task | Status | Started (PST) | Completed (PST) | Description |
|------|--------|---------------|------------------|-------------|
| 6.1 | Open | | | Enrich all hints in `data/gcp/gcp-gk-compute.xml` (H1=66→100+) |
| 6.2 | Open | | | Enrich all hints in `data/gcp/gcp-exam-prep-ace.xml` (H1=75→100+) |
| 6.3 | Open | | | Validate both files against XSD |
| 6.4 | Open | | | Run `npx vitest run` |
| 6.5 | Open | | | Run full audit script to confirm all 33 files meet thresholds |
| 6.6 | Open | | | Stage and commit Phase 6 |

### Phase 6 Summary
- **Changes:** TBD
- **Commit:** `Enrich hints for GCP gk-compute, exam-prep-ace; all exams at reference quality`

---

## Work Summary

| Category | Files | Hints to Write/Rewrite | Effort |
|----------|-------|------------------------|--------|
| Schema conversion | 4 | 0 (structural fix only) | Low (scripted) |
| Full hint rewrite (Tier 2 critical, from April11plan) | 6 | 900 | High (in progress) |
| Enrichment of converted files (Tier 1, if needed) | up to 4 | up to 600 | High |
| Enrichment of Tier 3 files | 12 | ~1,800 (mostly H1 expansion) | Medium-High |
| **Total** | **22** | **up to 3,300** | |

## Relationship to April11plan.md

The `docs/April11plan.md` covers the 7 new files added on April 11. Its Phases 2-4 (Tier 2 critical hints) overlap with this plan's scope. Once April11plan Phases 2-4 complete, the 6 critical files are done and this plan picks up from the remaining work:
- Phase 1 here = schema conversion (not in April11plan)
- Phase 2 here = hint enrichment for converted files (not in April11plan)
- Phases 3-6 here = Tier 3 enrichment (not in April11plan)
- April11plan Phase 5 (titles/scenarios/categories) is orthogonal and can run after all hint work.

## Execution Notes

- Phases 1-6 here and April11plan Phases 3-5 can run in parallel since they touch different files.
- Phase 1 (schema conversion) should run first since it may reveal that the 4 converted files already have adequate hints.
- For Tier 3 files, the primary gap is H1 length — many have acceptable H2 and H3. Consider a targeted H1-only enrichment pass for efficiency rather than full rewrites.
- All phases validate against `data/schema/certification.xsd` before committing.
