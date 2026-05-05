# Certification Site Update — Release Plan 1

**Source documents:** `docs/may052026/ten.md`, `docs/may052026/cert_review.md`
**Project root:** `C:\Projects\certification`
**Date:** 2026-05-05 (PST)

---

## Summary

This plan updates the certification site based on a May 5, 2026 lifecycle review and a ten-exam expansion list. It adds lifecycle status badges to all exams, distinguishes training content from proctored certification exams, marks retired and ending-soon exams with replacement paths, adds new certification providers (GitHub, Databricks, NVIDIA, Cisco), adds recommended exams to existing providers, corrects exam naming inconsistencies, adds certification-organization links in the quiz header, and adds official cert site links in provider page headers.

### Status Badge System

Per cert_review.md implementation notes, all exam cards will carry one of these status badges:

| Badge | Meaning | Visual |
|---|---|---|
| Current | Active exam, no retirement date found | Green or default (no badge needed if all are current) |
| Ending Soon | Official retirement date published, exam still available | Amber/orange badge with retirement date |
| Retired | Official last test date has passed | Red/gray badge, card visually dimmed |
| Training Only | Learning content, not a proctored certification exam | Blue/gray badge, distinct from cert exams |
| Source Needed | Status could not be independently verified | Yellow/muted badge |

### Retiring/Replaced Exams

| Current Exam | Status | Retirement Date | Replacement |
|---|---|---|---|
| SOA-C02 (AWS SysOps Administrator) | **Retired** | Sep 29, 2025 | SOA-C03 (AWS CloudOps Engineer) |
| AI-900 (Azure AI Fundamentals) | Ending Soon | Jun 30, 2026 | AI-901 (Azure AI Fundamentals) |
| AI-102 (Azure AI Engineer Associate) | Ending Soon | Jun 30, 2026 (per ten.md) | AI-103 (Azure AI Apps and Agents Developer) |
| AZ-204 (Azure Developer Associate) | Ending Soon | Jul 31, 2026 | AI-200 (Develop AI Cloud Solutions on Azure) |
| AZ-500 (Azure Security Engineer) | Ending Soon | Aug 31, 2026 | SC-500 (Secure AI Solutions in the Cloud) |

### GCP Training vs Certification Reclassification

Per cert_review.md, these GCP items are training/course content, not proctored exams:

| Site Item | Reclassification |
|---|---|
| gcp-fund-core | Training Only |
| gcp-cloud-fnd | Training Only |
| gcp-gk-compute | Training Only |
| gcp-networks | Training Only |
| gcp-db-stor | Training Only |
| gcp-data-eng-ml | Training Only (add real Professional Data Engineer as separate item) |
| gcp-db-devops | Training Only |
| gcp-cloud-eng | Exam Prep (maps to Associate Cloud Engineer certification) |
| gcp-exam-prep-ace | Exam Prep (consolidate with Associate Cloud Engineer) |
| gcp-cloud-arch | Exam Prep (consolidate with GCP-PCA Professional Cloud Architect) |

### New Exams for Existing Providers (from cert_review.md recommended additions + ten.md)

| Provider | New Exam | Source |
|---|---|---|
| AWS | SAP-C02 AWS Certified Solutions Architect - Professional | cert_review.md |
| Azure | DP-600 Microsoft Certified: Fabric Analytics Engineer Associate | cert_review.md |
| GCP | Professional Data Engineer | cert_review.md |
| GitHub | GH-200 GitHub Actions Certification | cert_review.md |

### New Providers (from ten.md)

| Provider | Brand Color | Exams |
|---|---|---|
| GitHub | #333333 | GH-300 GitHub Copilot Certification, GH-200 GitHub Actions Certification |
| Databricks | #FF3621 | Certified Generative AI Engineer Associate, Certified Machine Learning Associate |
| NVIDIA | #76B900 | NVIDIA-Certified Associate: Generative AI LLMs |
| Cisco | #049FD9 | 810-110 AITECH Cisco AI Technical Practitioner |

### Additional Flags

- **Anthropic CCA-F**: Add "Source Needed" flag — official public page was not accessible during review (cert_review.md)
- **GCP Professional Machine Learning Engineer (pro-ml-eng)**: New exam version goes live Jun 1, 2026 — flag for content refresh after that date (cert_review.md)

### Provider Certification Site URLs (from cert_review.md sources)

| Provider | Official Cert Site URL |
|---|---|
| AWS | https://aws.amazon.com/certification/ |
| Azure | https://learn.microsoft.com/en-us/credentials/certifications/ |
| GCP | https://cloud.google.com/learn/certification |
| Anthropic | (source needed — not verified) |
| CompTIA | https://www.comptia.org/certifications |
| ISC2 | https://www.isc2.org/certifications |
| GitHub | https://docs.github.com/en/get-started/showcase-your-expertise-with-github-certifications |
| Databricks | https://www.databricks.com/learn/certification |
| NVIDIA | https://academy.nvidia.com |
| Cisco | https://www.cisco.com/site/us/en/learn/training-certifications/index.html |

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

---

## Technology Stack (Additive)

| Concern | Choice |
|---|---|
| Status badges | CSS-only via `.ending-soon`, `.retired-exam`, `.training-only`, `.source-needed` card classes |
| External cert links | Plain `<a>` tags with `target="_blank" rel="noopener"` |
| Provider routing | Extend existing `getProviderFromExam()` prefix map in `js/app.js` |
| Cert org links in quiz header | New `certOrgUrls` map in `js/app.js`, injected into quiz header DOM |

---

## Phase 1: Status Badge CSS System

**Goal:** CSS classes exist for all five status badges (Current, Ending Soon, Retired, Training Only, Source Needed) so subsequent phases can apply them to cards.

**Depends on:** Nothing (first phase).

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 1.1 | Completed | 2026-05-05 07:10 PM | 2026-05-05 07:12 PM | Add `.ending-soon` CSS to `css/styles.css` — amber badge top-right "ENDING SOON", similar pattern to `.new-exam::after` |
| 1.2 | Completed | 2026-05-05 07:10 PM | 2026-05-05 07:12 PM | Add `.retired-exam` CSS to `css/styles.css` — red/gray badge "RETIRED", card opacity reduced to ~0.7 |
| 1.3 | Completed | 2026-05-05 07:10 PM | 2026-05-05 07:12 PM | Add `.training-only` CSS to `css/styles.css` — blue/gray badge "TRAINING", visually distinct from certification exams |
| 1.4 | Completed | 2026-05-05 07:10 PM | 2026-05-05 07:12 PM | Add `.source-needed` CSS to `css/styles.css` — yellow/muted badge "SOURCE NEEDED" |
| 1.5 | Completed | 2026-05-05 07:10 PM | 2026-05-05 07:12 PM | Add `.retirement-info` CSS — small text block below exam-description for retirement date and replacement exam |
| 1.6 | Completed | 2026-05-05 07:10 PM | 2026-05-05 07:12 PM | Add `.refresh-note` CSS — small text block for content-refresh flags (e.g. "New exam version Jun 1, 2026") |
| 1.7 | Open | | | Stage and commit Phase 1 |

### Phase 1 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Add lifecycle status badge CSS: ending-soon, retired, training-only, source-needed`

---

## Phase 2: Apply Status Badges to Existing Exams

**Goal:** All existing exam cards carry the correct lifecycle badge per cert_review.md. Retired and ending-soon exams show replacement paths. Training items are labeled. CCA-F gets source-needed flag.

**Depends on:** Phase 1.

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 2.1 | Completed | 2026-05-05 07:13 PM | 2026-05-05 07:14 PM | `aws.html` — Mark SOA-C02 as `retired-exam`, add retirement-info: "Retired Sep 29, 2025. Replaced by SOA-C03 AWS CloudOps Engineer - Associate" |
| 2.2 | Completed | 2026-05-05 07:13 PM | 2026-05-05 07:14 PM | `azure.html` — Mark AI-900 as `ending-soon`, add retirement-info: "Retiring Jun 30, 2026. Replaced by AI-901" |
| 2.3 | Completed | 2026-05-05 07:13 PM | 2026-05-05 07:14 PM | `azure.html` — Mark AI-102 as `ending-soon`, remove `new-exam` class, add retirement-info: "Retiring Jun 30, 2026. Replaced by AI-103" |
| 2.4 | Completed | 2026-05-05 07:13 PM | 2026-05-05 07:14 PM | `azure.html` — Mark AZ-204 as `ending-soon`, add retirement-info: "Retiring Jul 31, 2026. Replacement track: AI-200" |
| 2.5 | Completed | 2026-05-05 07:13 PM | 2026-05-05 07:14 PM | `azure.html` — Mark AZ-500 as `ending-soon`, add retirement-info: "Retiring Aug 31, 2026. Replacement track: SC-500" |
| 2.6 | Completed | 2026-05-05 07:15 PM | 2026-05-05 07:17 PM | `gcp.html` — Mark gcp-fund-core, gcp-cloud-fnd, gcp-gk-compute, gcp-networks, gcp-db-stor, gcp-data-eng-ml, gcp-db-devops as `training-only` |
| 2.7 | Completed | 2026-05-05 07:15 PM | 2026-05-05 07:17 PM | `gcp.html` — Mark gcp-cloud-eng, gcp-exam-prep-ace, gcp-cloud-arch as exam-prep items with `.exam-prep` class |
| 2.8 | Completed | 2026-05-05 07:15 PM | 2026-05-05 07:17 PM | `gcp.html` — Add refresh note to pro-ml-eng: "New exam version expected Jun 1, 2026" |
| 2.9 | Completed | 2026-05-05 07:17 PM | 2026-05-05 07:18 PM | `anthropic.html` — Mark CCA-F as `source-needed` |
| 2.10 | Open | | | Verify all badges render correctly by reading final HTML |
| 2.11 | Open | | | Stage and commit Phase 2 |

### Phase 2 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Apply lifecycle badges: retired SOA-C02, ending-soon Azure exams, training-only GCP items, source-needed CCA-F`

---

## Phase 3: Naming and Spelling Corrections

**Goal:** All exam titles match official certification names per vendor pages cited in cert_review.md.

**Depends on:** Phase 2.

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 3.1 | Completed | 2026-05-05 07:19 PM | 2026-05-05 07:22 PM | `aws.html` — Verify all 8 exam titles against cert_review.md vendor URLs; fix SOA-C02 title wording if needed |
| 3.2 | Completed | 2026-05-05 07:19 PM | 2026-05-05 07:22 PM | `azure.html` — Verify all 11 exam titles; check AI-102, AI-300, AZ-700 against official Microsoft naming |
| 3.3 | Completed | 2026-05-05 07:19 PM | 2026-05-05 07:22 PM | `gcp.html` — Verify all 14 titles; use exact Google credential titles per cert_review.md to avoid mixing with training tracks |
| 3.4 | Completed | 2026-05-05 07:19 PM | 2026-05-05 07:22 PM | `comptia.html` — Verify SY0-701 title |
| 3.5 | Completed | 2026-05-05 07:19 PM | 2026-05-05 07:22 PM | `isc2.html` — Verify CISSP title |
| 3.6 | Completed | 2026-05-05 07:19 PM | 2026-05-05 07:22 PM | `anthropic.html` — Verify CCA-F title |
| 3.7 | Open | | | Stage and commit Phase 3 |

### Phase 3 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Fix exam naming inconsistencies and spelling errors across all provider pages`

---

## Phase 4: New Provider Pages — GitHub, Databricks, NVIDIA, Cisco

**Goal:** Four new providers have landing pages. GitHub gets two exam cards (GH-300 Copilot, GH-200 Actions). All cards are Coming Soon (no XML question banks yet).

**Depends on:** Phase 3.

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 4.1 | Completed | 2026-05-05 07:10 PM | 2026-05-05 07:12 PM | Add `.coming-soon` CSS class to `css/styles.css` — grayed-out card, "COMING SOON" badge, non-clickable |
| 4.2 | Completed | 2026-05-05 07:22 PM | 2026-05-05 07:24 PM | Create `github.html` — GitHub branding (#333333), two exam cards: GH-300 Copilot + GH-200 Actions (Coming Soon) |
| 4.3 | Completed | 2026-05-05 07:22 PM | 2026-05-05 07:24 PM | Create `databricks.html` — Databricks branding (#FF3621), two exam cards: Gen AI Engineer + ML Associate (Coming Soon) |
| 4.4 | Completed | 2026-05-05 07:22 PM | 2026-05-05 07:24 PM | Create `nvidia.html` — NVIDIA branding (#76B900), one exam card: Generative AI LLMs Associate (Coming Soon) |
| 4.5 | Completed | 2026-05-05 07:22 PM | 2026-05-05 07:24 PM | Create `cisco.html` — Cisco branding (#049FD9), one exam card: 810-110 AITECH (Coming Soon) |
| 4.6 | Completed | 2026-05-05 07:24 PM | 2026-05-05 07:25 PM | Create empty `data/github/`, `data/databricks/`, `data/nvidia/`, `data/cisco/` directories with `.gitkeep` |
| 4.7 | Open | | | Stage and commit Phase 4 |

### Phase 4 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Add GitHub, Databricks, NVIDIA, Cisco provider pages with Coming Soon exam cards`

---

## Phase 5: New Exams for Existing Providers

**Goal:** Add recommended exam cards to existing provider pages: AWS SAP-C02, Azure DP-600, GCP Professional Data Engineer, and AWS SOA-C03 (active replacement for retired SOA-C02). All as Coming Soon since no XML exists yet.

**Depends on:** Phase 4.

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 5.1 | Completed | 2026-05-05 07:25 PM | 2026-05-05 07:28 PM | `aws.html` — Add SOA-C03 AWS Certified CloudOps Engineer - Associate card (Coming Soon) |
| 5.2 | Completed | 2026-05-05 07:25 PM | 2026-05-05 07:28 PM | `aws.html` — Add SAP-C02 AWS Certified Solutions Architect - Professional card (Coming Soon) |
| 5.3 | Completed | 2026-05-05 07:25 PM | 2026-05-05 07:28 PM | `azure.html` — Add DP-600 Microsoft Certified: Fabric Analytics Engineer Associate card (Coming Soon) |
| 5.4 | Completed | 2026-05-05 07:25 PM | 2026-05-05 07:28 PM | `gcp.html` — Add Professional Data Engineer card (Coming Soon) |
| 5.5 | Completed | 2026-05-05 07:31 PM | 2026-05-05 07:31 PM | `js/app.js` `getProviderFromExam()` — Add prefix rules for new exam IDs: `sap-` → aws, `sc-` → azure, also done with Phase 7 routing |
| 5.6 | Open | | | Stage and commit Phase 5 |

### Phase 5 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Add SOA-C03, SAP-C02, DP-600, GCP Data Engineer cards to existing provider pages`

---

## Phase 6: Index Page — New Provider Cards + Count Updates

**Goal:** All four new providers appear on `index.html`. Study guide counts updated for all providers including new Coming Soon cards.

**Depends on:** Phase 5.

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 6.1 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:33 PM | `index.html` — Add GitHub provider card with NEW badge, brand color #333333 |
| 6.2 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:33 PM | `index.html` — Add Databricks provider card with NEW badge, brand color #FF3621 |
| 6.3 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:33 PM | `index.html` — Add NVIDIA provider card with NEW badge, brand color #76B900 |
| 6.4 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:33 PM | `index.html` — Add Cisco provider card with NEW badge, brand color #049FD9 |
| 6.5 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:33 PM | `index.html` — Add CSS rules for new provider hover borders, name colors, badge colors |
| 6.6 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | `index.html` — Remove NEW badges from CompTIA and ISC2 |
| 6.7 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:33 PM | `index.html` — Update all study guide counts to reflect added cards (AWS 10, Azure 12, GCP 15, GitHub 2, Databricks 2, NVIDIA 1, Cisco 1) |
| 6.8 | Open | | | Stage and commit Phase 6 |

### Phase 6 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Add GitHub, Databricks, NVIDIA, Cisco to index.html; update all study guide counts`

---

## Phase 7: App.js Routing — Register New Providers

**Goal:** Quiz engine routes to/from all new provider pages. Back links, provider detection, and title generation work for all new providers.

**Depends on:** Phase 6.

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 7.1 | Completed | 2026-05-05 07:31 PM | 2026-05-05 07:31 PM | `js/app.js` `getProviderFromExam()` — Add metaProvider matching for 'github', 'databricks', 'nvidia', 'cisco' |
| 7.2 | Completed | 2026-05-05 07:31 PM | 2026-05-05 07:31 PM | `js/app.js` `getProviderFromExam()` — Add exam ID prefix rules: `gh-` → github, databricks exam IDs → databricks, `nv-` → nvidia, `810-`/`aitech` → cisco |
| 7.3 | Completed | 2026-05-05 07:31 PM | 2026-05-05 07:31 PM | `js/app.js` `setBackLinks()` — Add github, databricks, nvidia, cisco to providerPages map |
| 7.4 | Completed | 2026-05-05 07:31 PM | 2026-05-05 07:32 PM | `js/app.js` `updateHeader()` — Add new providers to providerPages, providerNames, and certOrgUrls maps |
| 7.5 | Open | | | Stage and commit Phase 7 |

### Phase 7 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Register GitHub, Databricks, NVIDIA, Cisco in app.js routing`

---

## Phase 8: Provider Page Header Links to Official Cert Sites

**Goal:** Each provider page header includes a link to that provider's official certification site. URLs sourced from cert_review.md.

**Depends on:** Phase 7.

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 8.1 | Completed | 2026-05-05 07:10 PM | 2026-05-05 07:12 PM | Add `.cert-site-link` CSS to `css/styles.css` — done in Phase 1 CSS batch |
| 8.2 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | `aws.html` header — Add link to https://aws.amazon.com/certification/ |
| 8.3 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | `azure.html` header — Add link to https://learn.microsoft.com/en-us/credentials/certifications/ |
| 8.4 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | `gcp.html` header — Add link to https://cloud.google.com/learn/certification |
| 8.5 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | `anthropic.html` header — Omitted with comment (official cert page not verified) |
| 8.6 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | `comptia.html` header — Add link to https://www.comptia.org/certifications |
| 8.7 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | `isc2.html` header — Add link to https://www.isc2.org/certifications |
| 8.8 | Completed | 2026-05-05 07:24 PM | 2026-05-05 07:24 PM | `github.html` header — Included at creation in Phase 4 |
| 8.9 | Completed | 2026-05-05 07:24 PM | 2026-05-05 07:24 PM | `databricks.html` header — Included at creation in Phase 4 |
| 8.10 | Completed | 2026-05-05 07:24 PM | 2026-05-05 07:24 PM | `nvidia.html` header — Included at creation in Phase 4 |
| 8.11 | Completed | 2026-05-05 07:24 PM | 2026-05-05 07:24 PM | `cisco.html` header — Included at creation in Phase 4 |
| 8.12 | Open | | | Stage and commit Phase 8 |

### Phase 8 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Add official certification site links to all provider page headers`

---

## Phase 9: Quiz Header — Certification Org Link

**Goal:** When taking a quiz, the quiz header shows a small external link to the certification organization's official certification page.

**Depends on:** Phase 8.

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 9.1 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | `quiz.html` — Add `<a id="cert-org-link" class="cert-org-link" target="_blank" rel="noopener" hidden></a>` in `.header-left` after `.exam-info` |
| 9.2 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | `css/quiz.css` — Add `.cert-org-link` styles: small font, light color, hover underline |
| 9.3 | Completed | 2026-05-05 07:31 PM | 2026-05-05 07:32 PM | `js/app.js` — Add `certOrgUrls` map in `updateHeader()`, set href/text on `cert-org-link` and unhide |
| 9.4 | Completed | 2026-05-05 07:32 PM | 2026-05-05 07:32 PM | Wire up `cert-org-link` element in QuizApp constructor elements map |
| 9.5 | Open | | | Verify link appears correctly for each provider by reading final code |
| 9.6 | Open | | | Stage and commit Phase 9 |

### Phase 9 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Add certification org link to quiz header`

---

## Phase 10: Final Audit

**Goal:** All provider pages and index cards have correct counts, all badges render correctly, naming is consistent, no broken links, project docs updated.

**Depends on:** Phase 9.

| Task | Status | Started (PST) | Completed (PST) | Description |
|---|---|---|---|---|
| 10.1 | Open | | | Audit all `index.html` study guide counts against actual cards on each provider page |
| 10.2 | Open | | | Verify all internal links (provider pages → quiz.html, breadcrumbs → index.html) |
| 10.3 | Open | | | Verify all external cert-site links are well-formed |
| 10.4 | Open | | | Verify GCP page clearly separates certifications from training content |
| 10.5 | Open | | | Final read-through of all modified files for typos, broken HTML, missing closing tags |
| 10.6 | Open | | | Update `CLAUDE.md` provider list (add GitHub, Databricks, NVIDIA, Cisco; update exam counts) |
| 10.7 | Open | | | Stage and commit Phase 10 |

### Phase 10 Summary

- **Changes:** TBD
- **Changes hosted at:** TBD
- **Commit:** `Final audit: verify counts, links, badges, and update project docs`
