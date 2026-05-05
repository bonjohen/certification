# Release Plan 2 — Generate XML Question Banks for 10 New Exams

## Context

Release Plan 1 (completed May 5, 2026) added lifecycle badges, new provider pages (GitHub, Databricks, NVIDIA, Cisco), coming-soon placeholder cards, and routing for 10 new exams listed in `docs/may052026/ten.md`. All 10 exams currently show as "Coming Soon" (non-clickable `<div>` cards) with empty `data/` directories. This plan generates the XML question bank data for each exam and wires the cards to become active, playable study guides.

### The 10 Exams

| # | Exam Code | Provider | Title | Replaces |
|---|-----------|----------|-------|----------|
| 1 | soa-c03 | AWS | AWS Certified CloudOps Engineer - Associate | SOA-C02 (retired) |
| 2 | ai-901 | Azure | Microsoft Azure AI Fundamentals | AI-900 (ending soon) |
| 3 | ai-103 | Azure | Microsoft Azure AI Apps and Agents Developer Associate | AI-102 (ending soon) |
| 4 | ai-200 | Azure | Develop AI Cloud Solutions on Azure | AZ-204 (ending soon) |
| 5 | sc-500 | Azure | Secure AI Solutions in the Cloud | AZ-500 (ending soon) |
| 6 | gh-300 | GitHub | GitHub Copilot Certification | — |
| 7 | db-genai | Databricks | Databricks Certified Generative AI Engineer Associate | — |
| 8 | db-ml | Databricks | Databricks Certified Machine Learning Associate | — |
| 9 | nv-genai | NVIDIA | NVIDIA-Certified Associate: Generative AI LLMs | — |
| 10 | 810-110 | Cisco | Cisco AI Technical Practitioner (AITECH) | — |

---

## Per-Exam Deliverables

For each exam, the work is:

1. **Create XML file** at `data/{provider}/{exam-code}.xml` — 50 questions following the schema in `data/schema/certification.xsd`
   - Metadata: exam-code, exam-title, provider, description, total-questions (50), created-date, last-modified, categories (3-6 domain categories)
   - Questions: id (1-50), category-ref, difficulty (basic/intermediate/advanced), title, scenario, question-text, 4 choices (A-D), correct-answer, 3 hints (Brief Hint, Complete Explanation, Deep Knowledge), optional tags
   - Content sourced from official exam guides / study materials referenced in `ten.md`

2. **Activate exam card** on provider page — change `<div class="exam-card coming-soon">` to `<a href="quiz.html?exam={code}" class="exam-card new-exam">`, update meta from "Coming Soon" to "50 Questions"

3. **Add coming-soon cards for Azure replacements** — AI-901, AI-103, AI-200, SC-500 don't have coming-soon cards on `azure.html` yet; they need to be added first (as active cards since we're generating data)

4. **Register exam in app.js** — add to `examUrls` map in `updateHeader()` with exam-specific certification URL

5. **Run validation** — `node scripts/validate-xml.js` to verify XML schema compliance

6. **Run randomization** — `python scripts/randomize_answers.py` to distribute answer positions

---

## Phased Approach

Each phase handles one exam (or a small group by provider). This keeps commits focused and allows validation per exam.

### Phase 1: AWS — SOA-C03

**Goal:** SOA-C03 XML exists, card is active, replaces the retired SOA-C02 path.

| Task | Status | Description |
|------|--------|-------------|
| 1.1 | Open | Create `data/aws/soa-c03.xml` — 50 questions covering deployment, monitoring, reliability, automation, security, networking, workload operations. Categories: Monitoring & Observability, Reliability & Business Continuity, Deployment & Automation, Security & Compliance, Networking, Cost & Performance Optimization |
| 1.2 | Open | `aws.html` — Convert SOA-C03 coming-soon `<div>` to active `<a href="quiz.html?exam=soa-c03" class="exam-card new-exam">`, update meta to "50 Questions" |
| 1.3 | Open | `js/app.js` — Add `'soa-c03'` to `examUrls` map |
| 1.4 | Open | Run `node scripts/validate-xml.js` on `data/aws/soa-c03.xml` |
| 1.5 | Open | Run `python scripts/randomize_answers.py data/aws/soa-c03.xml` |
| 1.6 | Open | Stage and commit |

### Phase 2: Azure — AI-901, AI-103, AI-200, SC-500

**Goal:** Four Azure replacement exams have XML data and active cards on `azure.html`.

| Task | Status | Description |
|------|--------|-------------|
| 2.1 | Open | Create `data/azure/ai-901.xml` — 50 questions. Azure AI fundamentals: AI/ML concepts, Azure AI services, Azure AI Studio, computer vision, NLP, generative AI basics, responsible AI, Python familiarity |
| 2.2 | Open | Create `data/azure/ai-103.xml` — 50 questions. Azure AI apps/agents: Microsoft Foundry, generative AI app development, agents, tools, knowledge connections, multimodal AI, prompt engineering |
| 2.3 | Open | Create `data/azure/ai-200.xml` — 50 questions. AI cloud solutions on Azure: compute, containers, serverless APIs, Azure Functions, Service Bus, Event Grid, monitoring, troubleshooting |
| 2.4 | Open | Create `data/azure/sc-500.xml` — 50 questions. Secure AI solutions: AI workload auth, trust boundaries, Microsoft Defender for Cloud, Foundry security, identity controls, compliance |
| 2.5 | Open | `azure.html` — Add four new active exam cards (AI-901, AI-103, AI-200, SC-500) with `new-exam` class, positioned near their retiring predecessors |
| 2.6 | Open | `js/app.js` — Add `'ai-901'`, `'ai-103'`, `'ai-200'`, `'sc-500'` to `examUrls` map |
| 2.7 | Open | Run validation and randomization on all four XML files |
| 2.8 | Open | Stage and commit |

### Phase 3: GitHub — GH-300

**Goal:** GH-300 Copilot Certification XML exists and card is active.

| Task | Status | Description |
|------|--------|-------------|
| 3.1 | Open | Create `data/github/gh-300.xml` — 50 questions. GitHub Copilot: responsible AI, Copilot features/architecture, prompt engineering, developer productivity, privacy controls, exclusions, testing, Copilot Business/Enterprise, IDE integrations |
| 3.2 | Open | `github.html` — Convert GH-300 coming-soon `<div>` to active `<a>` card |
| 3.3 | Open | `js/app.js` — Add `'gh-300'` to `examUrls` map |
| 3.4 | Open | Run validation and randomization |
| 3.5 | Open | Stage and commit |

### Phase 4: Databricks — DB-GenAI, DB-ML

**Goal:** Both Databricks exams have XML data and active cards.

| Task | Status | Description |
|------|--------|-------------|
| 4.1 | Open | Create `data/databricks/db-genai.xml` — 50 questions. GenAI on Databricks: LLM-enabled solutions, RAG, model selection, tool integration, Vector Search, Model Serving, solution decomposition, evaluation |
| 4.2 | Open | Create `data/databricks/db-ml.xml` — 50 questions. Databricks ML: AutoML, Unity Catalog, MLflow, feature engineering, model training/evaluation/deployment, Spark ML, hyperparameter tuning |
| 4.3 | Open | `databricks.html` — Convert both coming-soon `<div>`s to active `<a>` cards |
| 4.4 | Open | `js/app.js` — Add `'db-genai'`, `'db-ml'` to `examUrls` map |
| 4.5 | Open | Run validation and randomization |
| 4.6 | Open | Stage and commit |

### Phase 5: NVIDIA — NV-GenAI

**Goal:** NVIDIA GenAI LLMs exam has XML data and active card.

| Task | Status | Description |
|------|--------|-------------|
| 5.1 | Open | Create `data/nvidia/nv-genai.xml` — 50 questions. NVIDIA GenAI: LLM fundamentals, NVIDIA GPU architecture for AI, TensorRT, Triton Inference Server, NeMo, CUDA basics, model optimization, inference deployment, RAG with NVIDIA tools |
| 5.2 | Open | `nvidia.html` — Convert coming-soon `<div>` to active `<a>` card |
| 5.3 | Open | `js/app.js` — Add `'nv-genai'` to `examUrls` map |
| 5.4 | Open | Run validation and randomization |
| 5.5 | Open | Stage and commit |

### Phase 6: Cisco — 810-110 AITECH

**Goal:** Cisco AITECH exam has XML data and active card.

| Task | Status | Description |
|------|--------|-------------|
| 6.1 | Open | Create `data/cisco/810-110.xml` — 50 questions. Cisco AI: modernizing code with AI, automating workflows, AI-powered technical solutions, enterprise AI adoption, Cisco AI tools, networking + AI integration |
| 6.2 | Open | `cisco.html` — Convert coming-soon `<div>` to active `<a>` card |
| 6.3 | Open | `js/app.js` — Add `'810-110'` to `examUrls` map |
| 6.4 | Open | Run validation and randomization |
| 6.5 | Open | Stage and commit |

### Phase 7: Index Counts + Final Validation

**Goal:** All study guide counts on index.html are correct, all 10 exams pass validation, all tests pass.

| Task | Status | Description |
|------|--------|-------------|
| 7.1 | Open | `index.html` — Update study guide counts for all providers that gained active exams |
| 7.2 | Open | Run `node scripts/validate-xml.js` across all 10 new XML files |
| 7.3 | Open | Run `npx vitest run` — all tests must pass |
| 7.4 | Open | Verify each new exam loads in browser at `quiz.html?exam={code}` |
| 7.5 | Open | Stage and commit |

---

## Critical Files

| File | Changes |
|------|---------|
| `data/aws/soa-c03.xml` | New — 50 questions |
| `data/azure/ai-901.xml` | New — 50 questions |
| `data/azure/ai-103.xml` | New — 50 questions |
| `data/azure/ai-200.xml` | New — 50 questions |
| `data/azure/sc-500.xml` | New — 50 questions |
| `data/github/gh-300.xml` | New — 50 questions |
| `data/databricks/db-genai.xml` | New — 50 questions |
| `data/databricks/db-ml.xml` | New — 50 questions |
| `data/nvidia/nv-genai.xml` | New — 50 questions |
| `data/cisco/810-110.xml` | New — 50 questions |
| `aws.html` | Activate SOA-C03 card |
| `azure.html` | Add + activate AI-901, AI-103, AI-200, SC-500 cards |
| `github.html` | Activate GH-300 card |
| `databricks.html` | Activate DB-GenAI, DB-ML cards |
| `nvidia.html` | Activate NV-GenAI card |
| `cisco.html` | Activate 810-110 card |
| `js/app.js` | Add all 10 exams to `examUrls` map |
| `index.html` | Update study guide counts |

## Reusable Utilities

- `scripts/validate-xml.js` — validates XML against schema rules
- `scripts/randomize_answers.py` — shuffles answer positions for even distribution
- `data/schema/certification.xsd` — XML schema definition
- Existing XML files (e.g., `data/aws/saa-c03.xml`) — template for question format

## Verification

1. `node scripts/validate-xml.js` — all 10 new XML files pass
2. `python scripts/randomize_answers.py --show-current` — answer distribution is balanced
3. `npx vitest run` — all 172+ tests pass
4. Manual: load each `quiz.html?exam={code}` in browser and confirm questions render
5. Manual: confirm each provider page shows the new exam as an active card with "50 Questions" and "NEW" badge

## Output

Save completed plan as `docs/may052026/release_plan_2.md` before execution begins.
