# Anthropic CCA-F Research Document

Research companion for authoring 50 original practice questions for the Claude Certified Architect, Foundations (CCA-F) study bank.

---

## Section 1: Official Facts

### Exam Identity

- **Official Name:** Claude Certified Architect -- Foundations (CCA-F)
- **Provider:** Anthropic
- **Launch Date:** March 12, 2026
- **Exam Code:** CCA-F (used in this project for routing and XML metadata)

### Purpose

The CCA-F is Anthropic's first official technical certification. It validates that engineers can design and ship production-grade Claude AI applications at enterprise scale. The exam is architecture-focused rather than trivia-based, testing real production system design knowledge. It emphasizes applied decision-making over memorization of isolated facts.

The "Foundations" label signals this is the first tier of a multi-level credential stack. Anthropic has confirmed additional certifications targeting sellers, developers, and advanced architects are planned for later in 2026.

### Official Exam Structure

| Attribute              | Value                                                    |
|------------------------|----------------------------------------------------------|
| Number of questions    | 60 multiple-choice                                       |
| Time limit             | 120 minutes, single sitting                              |
| Proctored              | Yes -- no external tools, documentation, or Claude access |
| Scoring                | Scaled 100--1,000; passing score 720                     |
| Question format        | Scenario-based, one correct answer, three distractors    |
| Scenario pool          | 6 reference scenarios; 4 randomly selected per sitting   |

### Official Exam Domains (5 Competency Areas)

| Domain | Topic                                     | Weight |
|--------|-------------------------------------------|--------|
| 1      | Agentic Architecture & Orchestration      | 27%    |
| 2      | Tool Design & MCP Integration             | 18%    |
| 3      | Claude Code Configuration & Workflows     | 20%    |
| 4      | Prompt Engineering & Structured Output    | 20%    |
| 5      | Context Management & Reliability          | 15%    |

### Official Scenario Contexts (6 Reference Scenarios)

The 60 exam questions are anchored to these scenario contexts:

1. Customer Support Resolution Agent
2. Code Generation with Claude Code
3. Multi-Agent Research System
4. Developer Productivity with Claude
5. Claude Code for CI/CD
6. Structured Data Extraction

On any given sitting, 4 of the 6 scenarios are randomly selected.

### Availability and Access

- Currently exclusive to Claude Partner Network members
- Joining the Partner Network is free for any organization bringing Claude to market
- First 5,000 partner company employees receive free early access
- After the early-access phase, the certification costs $99 per attempt
- Registration: `anthropic.skilljar.com/claude-certified-architect-foundations-access-request`

### Official Preparation Resources -- Anthropic Academy

Anthropic Academy launched on March 2, 2026, ten days before the exam, with 13 free self-paced courses on Skilljar. No subscription or paywall required. Key courses relevant to CCA-F preparation:

| Course                                       | Relevance                                          |
|----------------------------------------------|----------------------------------------------------|
| Claude 101                                   | Baseline Claude usage patterns and capabilities    |
| AI Fluency Framework & Foundations           | Foundational AI concepts                           |
| Building Applications with Claude API        | Flagship 8.1-hour course: Messages API through agentic architectures and RAG |
| Introduction to Model Context Protocol       | MCP fundamentals, tools, resources, prompts        |
| Claude Code Developer Training               | Claude Code architecture, configuration, workflows |

An official practice test with 60 questions in the same scenario format as the real exam (with explanations after each answer) is provided separately after registration.

### Official Documentation References

- **Claude API Docs:** `docs.anthropic.com` / `platform.claude.com/docs`
- **Claude Code:** `github.com/anthropics/claude-code`
- **MCP Specification:** `modelcontextprotocol.io`
- **Anthropic Academy:** `anthropic.skilljar.com`
- **Prompting Best Practices:** `platform.claude.com/docs/en/build-with-claude/prompt-engineering`
- **Tool Use Documentation:** `docs.anthropic.com/en/docs/build-with-claude/tool-use`
- **Extended Thinking:** `platform.claude.com/docs/en/build-with-claude/extended-thinking`
- **Long Context Tips:** `docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips`
- **Context Engineering for Agents:** `anthropic.com/engineering/effective-context-engineering-for-ai-agents`

### Current Models (March 2026)

| Model              | Tier                          | Pricing (input/output per MTok) |
|--------------------|-------------------------------|---------------------------------|
| Claude Opus 4.6    | Most intelligent              | $5 / $25                        |
| Claude Sonnet 4.6  | Balanced speed & intelligence | $3 / $15                        |
| Claude Haiku 4.5   | Fastest, most affordable      | $1 / $5                         |

### Enterprise Adoption Context

- Accenture is training approximately 30,000 professionals on Claude
- Cognizant is training up to 350,000 employees globally
- The certification positions itself competitively against AWS ML Specialty and Google Cloud ML Engineer certifications, but focuses specifically on production-grade agentic system design

---

## Section 2: Community-Reported Observations

> **Disclaimer:** Everything in this section is community-reported, sourced from public blog posts, forums, and third-party guides. None of this is official Anthropic guidance. Claims have not been independently verified.

### Commonly Reported Themes

1. **Architecture over trivia.** Community consensus is that CCA-F tests design judgment, not memorization. Candidates report that questions require choosing between viable architectural options rather than recalling isolated API parameters.

2. **Scenario-heavy format.** Multiple community sources confirm that nearly every question is embedded in a realistic production scenario. Candidates must read context carefully before identifying the correct architectural decision.

3. **"Build first, certify after."** The recurring community advice is that hands-on project experience is more valuable than course completion alone. Study guides recommend building real agentic systems, RAG pipelines, and tool-calling workflows before attempting the exam.

4. **Agentic architecture dominates.** Community reports align with the official 27% weighting -- the agentic architecture domain is widely considered the most heavily tested and the most challenging.

5. **MCP is a differentiator.** Multiple guides highlight MCP integration as a topic many candidates underestimate. Understanding tool boundaries, server design, and permission models is reportedly critical.

6. **Context window management is subtle.** Community members report that questions about context window tradeoffs require nuanced understanding of progressive summarization risks, context positioning effects, and compaction strategies.

### Public Scenario Patterns

Community sources describe these architectural decision patterns as commonly tested:

- **Hub-and-spoke multi-agent design:** Central orchestrator managing 2-4 specialist worker agents, with task decomposition and result aggregation
- **Tool boundary decisions:** When to expose capabilities as tools vs. embedding logic in prompts vs. using MCP servers
- **Fallback and degradation patterns:** Designing systems that degrade gracefully when Claude is unavailable or overloaded (circuit breakers, exponential backoff, request queuing)
- **Human-in-the-loop escalation:** When to involve humans, how to design escalation thresholds (e.g., 3 consecutive denials or 20 total trigger human escalation)
- **Context compaction strategies:** Managing conversations approaching context window limits through summarization, structured note-taking, and multi-agent architectures
- **Structured output validation loops:** JSON schema enforcement with retry logic on validation failure
- **Prompt caching for cost optimization:** Cache reads at 10% of standard input price for repeated context
- **Batch API for async processing:** 50% discount on tokens for non-real-time workloads

### Recurring Claims About Best Practices

Community sources repeatedly emphasize these production patterns (community-reported, not official):

- **Explicit instructions outperform implicit inference.** Claude responds better to direct, specific instructions than to relying on the model to infer intent.
- **XML tags for prompt structure.** Using `<instructions>`, `<context>`, `<input>`, `<example>` tags reduces misinterpretation in complex prompts.
- **"Don't guess" instructions reduce hallucination.** Explicitly instructing Claude to say "I don't know" when unsure, especially in RAG applications.
- **Quote-then-answer for long documents.** Asking Claude to quote relevant passages before answering cuts through noise in long-context tasks.
- **Least-privilege tool access.** 78% of MCP security incidents reportedly stem from overly permissive tokens; community recommends restricting permissions tool-by-tool.
- **Write code to call tools at scale.** When many MCP tools are configured, agents scale better by writing code to call tools instead of using direct tool calls, avoiding context window bloat from tool definitions.

### Reported Difficulty Level

- The exam is positioned at a "301 level" -- intermediate-to-advanced for practitioners with hands-on Claude experience
- Target audience: solution architects and AI engineers with production agentic system experience
- Estimated preparation time: 2-4 weeks for experienced AI developers; 2-4 months for developers new to Claude
- Community broadly rates the certification as more design-focused than AWS or Google Cloud ML certifications

---

## Section 3: Public Question Ecosystems

> **Note:** These resources are documented for research purposes only. No content from these sources may be copied verbatim into the study bank. They inform topic coverage, terminology, scenario styles, common misconceptions, and distractor patterns.

### GitHub Repositories

| Repository | Description |
|------------|-------------|
| `paullarionov/claude-certified-architect` | Study materials with practical exercises for tool design, MCP integration, structured output, and context management |
| `OlivierAlter/Claude-Certified-Architect-Foundations-Certification-Exam` | Unofficial practice exam: 77 scenario-based questions + interactive Claude Code skill, covering all 30 task statements |
| `SGridworks/claude-certified-architect-training` | 12-week training program with 110 practice questions, full exam simulations, and gamified XP progression |
| `Connectry-io/connectrylab-architect-cert-mcp` | MCP-based certification tutor: 390 questions, guided capstone build, 30 concept handouts, 6 reference projects |
| `tvytlx/2e0c4c823e56e1ddcce8f0634d1f36e6` (Gist) | "Become a Claude Architect" study guide gist |
| `hesreallyhim/awesome-claude-code` | Curated list of skills, hooks, slash-commands, agent orchestrators, and plugins for Claude Code |

### Community Study Sites

| Site | Description |
|------|-------------|
| `claudecertifications.com` | Free study guide, 25 practice questions, 5 domain breakdowns, 12-week prep plan, anti-patterns cheatsheet |
| `claudecertificationguide.com` | Free community study guide covering all 5 domains |
| `flashgenius.net` | Ultimate guide with domain breakdowns, updated through March 2026 |

### Online Courses

| Platform | Course | Description |
|----------|--------|-------------|
| Udemy | "Claude Certified Architect -- Certification Practice Tests" | Community-built practice exams across all 5 domains |
| Udemy | "Claude Certified Architect" | Full preparation course |

### Blog Posts and Articles

| Source | Title / Topic |
|--------|---------------|
| DEV Community (`dev.to/mcrolly`) | "Inside Anthropic's Claude Certified Architect Program -- What It Tests and Who Should Pursue It" |
| Medium (`@reliabledataengineering`) | "The Claude Certified Architect Is Here -- And It's Unlike Any AI Certification Before It" |
| Medium (`@reliabledataengineering`) | "Agentic Workflows with Claude: Architecture Patterns, Design Principles & Production Patterns" |
| Medium (`@mahendraa1188`) | Complete course guide for Claude Architect certification |
| Medium (`dynamicbalaji`) | CCA-F Preparation Guide |
| Medium (`@richardhightower`) | "Complete Guide to Passing the CCA Foundations Exam" |
| `lowcode.agency` | Step-by-step guide to becoming a Claude Certified Architect |
| `claudedirectory.org` | "The Anthropic Claude Certification Program: Everything You Need to Know" |
| `zenvanriel.com` | Claude Certified Architect guide for AI engineers |
| `ai.cc` | CCA-F 2026 exam guide and prep strategy |
| `datastudios.org` | Access path, partner requirements, and preparation areas |
| `aitoolsclub.com` | Complete guide: How to Become a Claude Certified Architect |
| `awesomeagents.ai` | Coverage of Anthropic's $100M investment in certification program |
| `aidatainsider.com` | Certification launch coverage |
| `sitepoint.com` | Deep dive into Claude Code agentic CLI workflow |
| `claude-world.com` | "Complete Map of Anthropic's Developer Ecosystem: 22 Repos, One Vision" |

### Observed Question Patterns (Community-Reported)

Community practice materials reveal these recurring question patterns:

- **"Which architecture pattern best addresses..."** -- Choosing among hub-and-spoke, pipeline, fan-out/fan-in for a given scenario
- **"What is the MOST appropriate tool boundary..."** -- Deciding between embedding logic in prompts, creating tools, or using MCP servers
- **"How should the system handle..."** -- Designing error recovery, degradation, or escalation for failure scenarios
- **"Which context management strategy..."** -- Choosing between compaction, progressive summarization, multi-agent splitting
- **"What is the PRIMARY risk of..."** -- Identifying anti-patterns and their consequences
- **Anti-pattern identification:** Questions that present a flawed design and ask candidates to identify the core problem

### Community-Reported Anti-Pattern Categories

Study materials frequently reference these anti-patterns:

- Over-relying on a single large context window instead of decomposing tasks
- Hardcoding tool permissions instead of applying least-privilege
- Using synchronous processing where batch API would be more cost-effective
- Skipping validation loops on structured output
- Treating all failures identically instead of implementing graduated retry strategies
- Exposing too many tools simultaneously, consuming context window budget

---

## Section 4: Authoring Guidance

### Core Principles

1. **All questions must be originally authored.** No verbatim copying of question stems, answer choices, or explanations from any source (official or community).

2. **Architecture-oriented, reasoning-focused.** Every question should require evaluating tradeoffs between viable alternatives, not recalling isolated facts.

3. **Applied decision-making over memorization.** Questions should present realistic production scenarios where the candidate must choose the best design approach.

4. **Teach through explanations.** Each explanation must teach why the correct answer is correct AND why the stronger design decision is preferred. Explanations should illuminate the underlying architectural principle.

### Question Structure Requirements

Each question must include all of the following:

| Component | Requirement |
|-----------|-------------|
| **Title** | Brief descriptive title for the question |
| **Scenario** | Optional context block setting up a realistic production situation (recommended for most questions) |
| **Stem** | The question itself, framed as a decision point |
| **Choices** | Exactly 4 answer choices (A, B, C, D) |
| **Correct answer** | Exactly 1 correct answer |
| **Explanation** | Why the correct answer is correct and why the design decision is preferred |
| **Hint 1** | Directional guidance without substantially giving away the answer |
| **Hint 2** | Key decision point or tradeoff illuminated |
| **Hint 3** | Deeper conceptual reinforcement (still a hint, not a repeat of the explanation) |

### Progressive Hint Design

- **Hint Level 1 (Directional):** Point toward the relevant concept area or constraint without naming the answer. Example: "Consider what happens when the context window approaches its limit."
- **Hint Level 2 (Tradeoff):** Illuminate the key decision point or tradeoff that distinguishes the correct answer. Example: "Compare the cost of re-processing the full context versus the risk of losing important details during summarization."
- **Hint Level 3 (Conceptual):** Provide deeper conceptual reinforcement that helps the learner understand the principle. Example: "Progressive summarization introduces information loss at each compression step. Consider whether architectural decomposition can avoid this entirely."

### Distractor Design

- Every distractor should be plausible and represent a real mistake an architect might make
- At least one distractor should represent a common anti-pattern
- At least one distractor should represent a reasonable-but-suboptimal approach
- Distractors should not be obviously wrong on their face -- they should require understanding the scenario context to eliminate
- Avoid trick questions or "gotcha" phrasing

### Scenario Design

- Scenarios should be grounded in realistic production situations
- Include relevant constraints (scale, latency, cost, reliability requirements)
- Provide enough context that the question is answerable without external knowledge
- Vary scenario complexity across questions (some short context, some detailed)
- Draw scenario themes from the 6 official reference contexts where appropriate:
  1. Customer support resolution agent
  2. Code generation with Claude Code
  3. Multi-agent research system
  4. Developer productivity with Claude
  5. Claude Code for CI/CD
  6. Structured data extraction

### Topic Balance Guidelines

- Questions should be distributed across all 12 topic areas defined in the allocation plan
- No topic area should feel over-represented or neglected
- Cross-cutting concerns (e.g., error handling appears in agentic architecture, tool calling, and context management) should be distributed naturally across topics rather than concentrated

### Quality Criteria

- Each question should be answerable by someone with production Claude experience
- No question should require knowledge that is only available through proprietary/NDA materials
- Questions should test understanding of principles, not memorization of specific API parameter names
- The correct answer should be defensibly the best choice given the scenario constraints
- Explanations should be educational -- a learner who reads only the explanations should gain real architectural knowledge

---

## Topic Allocation Plan

50 questions distributed across 12 topic areas. The allocation balances coverage while reflecting the relative importance of each domain area.

### Distribution

| # | Topic Area | Questions | Question IDs |
|---|------------|-----------|--------------|
| 1 | Agentic architecture & orchestration | 5 | Q01--Q05 |
| 2 | Claude API usage patterns | 4 | Q06--Q09 |
| 3 | Tool design and tool calling | 5 | Q10--Q14 |
| 4 | MCP-oriented integration thinking | 4 | Q15--Q18 |
| 5 | Claude Code workflows & configuration patterns | 5 | Q19--Q23 |
| 6 | Prompt engineering for reliable behavior | 4 | Q24--Q27 |
| 7 | Structured output & validation | 4 | Q28--Q31 |
| 8 | Context management & context-window tradeoffs | 4 | Q32--Q35 |
| 9 | Guardrails & safe escalation patterns | 4 | Q36--Q39 |
| 10 | Retry, recovery & error-handling design | 4 | Q40--Q43 |
| 11 | Human-in-the-loop workflow decisions | 4 | Q44--Q47 |
| 12 | Long-document & multi-step workflow strategies | 3 | Q48--Q50 |
| | **Total** | **50** | |

### Allocation Rationale

- **5 questions** for Topics 1, 3, and 5: These map to the two highest-weighted official domains (Agentic Architecture at 27% and Claude Code at 20%) and to Tool Design & MCP (18%), which the community reports as commonly underestimated. Splitting MCP into its own topic (Topic 4) means tool calling (Topic 3) and MCP integration (Topic 4) together cover the 18% domain.
- **4 questions** for Topics 2, 4, 6, 7, 8, 9, 10, and 11: These provide balanced coverage of Claude API patterns, MCP integration, prompt engineering, structured output, context management, guardrails, retry/recovery, and human-in-the-loop -- all significant areas in the official domains.
- **3 questions** for Topic 12: Long-document and multi-step workflow strategies overlap with context management (Topic 8) and agentic orchestration (Topic 1), so a slightly smaller allocation avoids redundancy while ensuring dedicated coverage.

### Topic-to-Official-Domain Mapping

| Our Topic | Maps to Official Domain |
|-----------|------------------------|
| 1. Agentic architecture & orchestration | Domain 1: Agentic Architecture & Orchestration (27%) |
| 2. Claude API usage patterns | Cross-cutting (Domains 1, 4, 5) |
| 3. Tool design and tool calling | Domain 2: Tool Design & MCP Integration (18%) |
| 4. MCP-oriented integration thinking | Domain 2: Tool Design & MCP Integration (18%) |
| 5. Claude Code workflows & config | Domain 3: Claude Code Configuration & Workflows (20%) |
| 6. Prompt engineering for reliable behavior | Domain 4: Prompt Engineering & Structured Output (20%) |
| 7. Structured output & validation | Domain 4: Prompt Engineering & Structured Output (20%) |
| 8. Context management & context-window tradeoffs | Domain 5: Context Management & Reliability (15%) |
| 9. Guardrails & safe escalation patterns | Domain 5: Context Management & Reliability (15%) |
| 10. Retry, recovery & error-handling design | Domain 5: Context Management & Reliability (15%) |
| 11. Human-in-the-loop workflow decisions | Cross-cutting (Domains 1, 5) |
| 12. Long-document & multi-step workflow strategies | Cross-cutting (Domains 1, 5) |

### Verification

- Topics 1 alone = 5 questions covering Domain 1 (27% official weight)
- Topics 3 + 4 = 9 questions covering Domain 2 (18% official weight)
- Topic 5 = 5 questions covering Domain 3 (20% official weight)
- Topics 6 + 7 = 8 questions covering Domain 4 (20% official weight)
- Topics 8 + 9 + 10 = 12 questions covering Domain 5 (15% official weight)
- Topics 2, 11, 12 = 11 cross-cutting questions that reinforce all domains
- **Grand total: 50 questions**
