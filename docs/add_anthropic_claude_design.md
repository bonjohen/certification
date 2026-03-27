## 9. XML Data Requirements

The Anthropic XML file shall follow the same schema expected by the existing XML parser and quiz engine.

The metadata section shall identify:

Exam code: CCA-F

Exam title: Claude Certified Architect, Foundations

Provider: Anthropic

Total questions: 50

Description: a scenario-based study companion or equivalent wording

The XML file shall define 50 questions.

Each question shall include:

A title

An optional scenario or context block where appropriate

A question stem

Four answer choices

One correct answer

One explanation

Three progressive hints

Relevant tags or categories if supported by the existing parser

The XML content shall be valid and load without parser errors.

## 10. Question Bank Requirements

The Anthropic study bank shall contain exactly 50 original practice questions.

The question set shall be designed for study and skill development rather than replication of the live certification exam.

The question set shall be architecture-oriented and reasoning-focused.

The question set shall emphasize applied decision-making rather than memorization of isolated facts.

The question set shall be sized so that a fresh user starts at Question 1 of 50 and proceeds through a complete 50-question exam set.

## 11. Question Authoring Requirements

All Anthropic questions shall be authored originally for this site.

Public information about the certification, public training resources, public prep ecosystems, public forum discussions, and public sample-question ecosystems may be used as research input.

Those materials may be used to identify domain coverage, terminology, likely scenario styles, common misconceptions, and distractor patterns.

They must not be copied directly into the shipped study bank.

No third-party question wording, answer wording, or explanation wording shall be reused verbatim.

Each question shall be written in a manner consistent with architecture and implementation judgment.

Each explanation shall teach why the correct answer is correct and why the stronger design decision is preferred.

## 12. Content Coverage Requirements

The 50-question Anthropic bank shall cover the major topic areas relevant to Anthropic certification study.

Coverage shall include:

Agentic architecture and orchestration

Claude API usage patterns

Tool design and tool calling

MCP-oriented integration thinking

Claude Code workflows and configuration patterns

Prompt engineering for reliable behavior

Structured output and validation

Context management and context-window tradeoffs

Guardrails and safe escalation patterns

Retry, recovery, and error-handling design

Human-in-the-loop workflow decisions

Long-document and multi-step workflow strategies

The bank shall be balanced across these topics so that the result feels comprehensive rather than narrowly focused.

## 13. Progressive Hint Requirements

The Anthropic exam shall use the same three-level progressive hint behavior already implemented in the shared quiz experience.

Hint level one shall provide directional guidance without substantially giving away the answer.

Hint level two shall explain the key decision point or tradeoff.

Hint level three shall provide deeper conceptual reinforcement while still remaining a hint rather than merely repeating the final explanation.

All 50 questions shall include all three hint levels.

The Anthropic content shall fit the existing hint interaction model exactly.

## 14. Navigation Requirements

The Anthropic path shall reuse the current quiz navigation model.

This includes:

Previous and next question controls

Keyboard navigation using left and right arrows

Answer selection before submission

Submit gating until an answer is selected

Correctness feedback after submit

Question counters

Score and completion display

Back-link behavior to the provider page

No Anthropic-specific navigation model shall be introduced.

## 15. Persistence Requirements

The Anthropic exam shall participate in the same local storage persistence model already used by the application.

A returning user with saved Anthropic progress shall receive the same continue-or-start-fresh behavior used elsewhere in the site.

Saved state shall include:

Current question index

Selected answers

Correctness history

Revealed hints

Progress state

Completion state if applicable

The Anthropic integration shall reuse the existing persistence mechanism rather than introducing a new one.

## 16. Research Package Requirements

A research document shall be created at:

`docs/anthropic-cca-f-research.md`

This document shall be a companion artifact for the coding or content agent.

It shall contain four sections.

Section one shall record official facts about the certification, including official exam name, official purpose, official public resources, and official availability notes where known.

Section two shall record community-reported facts, including commonly reported themes, public scenario patterns, and recurring public claims about the exam, clearly labeled as community-reported rather than official.

Section three shall record public question ecosystems, including repositories, forum discussions, prep courses, blog posts, sample-question pages, and similar public study materials.

Section four shall define authoring guidance for generating original practice questions from the research without copying source content.

## 17. Trust and Accuracy Requirements

Visible UI copy shall distinguish between official certification information and local study content.

The site shall use accurate official naming for the provider and exam.

The site shall avoid presenting unverified public claims as official facts.

The research document may include community-reported observations, but those must be clearly identified as community-reported.

The visible UI shall remain conservative and trustworthy in how it describes the certification and the local study bank.

## 18. Compatibility Requirements

The Anthropic implementation shall fit into the existing repository structure and application architecture.

It shall not require replacement of the existing shared quiz engine.

It shall not require replacement of the existing XML parser.

It shall not require separate Anthropic-specific storage behavior.

It shall not require separate Anthropic-specific rendering logic beyond the minimum provider mapping and exam recognition needed to plug into the shared model.

## 19. Acceptance Criteria

The feature shall be considered complete only when all of the following are true.

The home page visibly shows Anthropic as a fourth provider card.

Selecting the Anthropic provider card opens `anthropic.html`.

The Anthropic provider page visibly contains exactly one exam card for CCA-F — Claude Certified Architect, Foundations.

The Anthropic exam card visibly indicates that the local study bank contains 50 questions.

Selecting the Anthropic exam card opens `quiz.html?exam=cca-f`.

A fresh session begins at Question 1 of 50.

The quiz header correctly identifies Anthropic and the CCA-F exam.

The quiz back link returns to `anthropic.html`.

All 50 questions load successfully from `data/anthropic/cca-f.xml`.

Every question renders with four answer choices, one correct answer, one explanation, and three progressive hints.

Submit behavior, feedback behavior, previous and next navigation, keyboard navigation, hint reveal behavior, score display, completion display, and saved-session resume work for Anthropic exactly as they do for the existing providers.

The Anthropic path is visibly usable in a browser with representative data.

The feature works as an integrated, user-visible addition to the live application rather than as a partial structural placeholder.

## 20. Final Naming Rule

Use the following naming consistently everywhere in the implementation.

Provider: Anthropic

Exam code: CCA-F

Exam title: Claude Certified Architect, Foundations

This naming shall be used in page text, exam card text, metadata, XML, routing, file naming, and internal references.
