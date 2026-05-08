# Building a Codebase Review Skill

## The Lesson

A structured review skill turns the ad-hoc "look at this code and tell me what's wrong" request into a repeatable, evidence-based audit that produces the same quality of findings regardless of who runs it or when. The skill's value comes from its taxonomy of problem categories (derived from real issues found in real projects) and its insistence that every finding includes concrete evidence and a specific fix.

## Context

A project that had gone through multiple rounds of manual code review, migration cleanup, and architecture work needed a way to systematize the review process. Previous reviews had found XSS vulnerabilities, test-code drift, dead artifacts, CSP gaps, documentation referencing deleted files, and CI workflows calling removed scripts. Each issue was individually fixable, but they kept recurring because there was no checklist ensuring they were checked every time. A `/review` skill was built to encode these checks permanently.

## What Happened

1. A catalog of every real problem found across the project's history was compiled: security (innerHTML XSS, missing CSP), dead code (orphan XML files, stale scripts), documentation drift (README listing deleted files, CI calling removed commands), test gaps (0% coverage modules, tests testing copies), consistency (nav links missing on some pages, mixed CSP policies), and operations (gitignore gaps, broken workflows).
2. These were organized into 7 review categories, each with specific grep-able signals (what to search for, what constitutes a finding).
3. A severity framework was defined: Critical (security/data loss), High (broken UX/CI), Medium (inconsistencies/dead code), Low (polish).
4. An output format was designed that produces a findings document with evidence, impact, fix, and a phased remediation plan that can be directly executed with `/phase`.
5. Hard rules were defined to prevent the most common review anti-patterns: findings without evidence, style preferences reported as bugs, "consider improving" without a specific action.
6. The skill was deployed and immediately tested against its own origin project — finding 7 issues including one High-severity CSP gap that had been missed in previous manual reviews.

## Key Insights

- **A taxonomy of problems is more useful than "just look at the code."** The 7-category checklist (Security, Dead Code, Documentation, Tests, Consistency, Architecture, Operations) ensures nothing is skipped. Without a taxonomy, reviews tend to find whatever the reviewer happened to notice first and miss systematic issues.
- **Evidence requirements prevent false positives.** The hard rule "every finding must have a file path or grep result" eliminates vague suspicions ("I think there might be an XSS issue somewhere") and forces the reviewer to prove the issue exists before reporting it.
- **The fix must be in the finding.** A finding that says "F-03: stale files exist" without specifying which files and what to do with them is useless as a work item. Including the specific remediation (`git rm -r plans/; add to .gitignore`) makes the finding directly executable.
- **Scoped modes prevent overwhelm.** `/review security` on a 500-file codebase is tractable. `/review full` on the same codebase might produce 30 findings that paralyze the team. Scoped modes let users focus on what matters most right now.
- **The remediation plan bridges review and execution.** Most review documents end with findings and stop. Adding a phased plan (Critical first, Low last) with a task table that `/phase` can execute turns the review into a work queue, not just a report.
- **Severity levels must be opinionated, not diplomatic.** "XSS is something to consider" helps nobody. "XSS is HIGH — fix this sprint" creates urgency. The skill explicitly forbids softening security findings.

## The Skill File Explained

The `/review` skill lives at `~/.claude/skills/review/SKILL.md`. Here's how its major sections work.

### Frontmatter — Identity

```yaml
---
name: review
description: Perform a structured codebase review that identifies security issues, dead code, inconsistencies, documentation drift, test gaps, and missed patterns. Produces a prioritized findings document with actionable remediation tasks.
argument-hint: "[scope: full | security | consistency | hygiene]"
---
```

The `argument-hint` shows the four scope options. Unlike `/lessons` which has 5 modes doing different things, `/review` always does the same thing (find problems) — the argument just narrows which categories to check.

### Opening Directive — Role

```markdown
You are performing a **structured project review** — a systematic audit of a codebase that identifies real problems and produces actionable remediation tasks. The review is opinionated: it flags things that should be fixed, not things that "could be improved someday."
```

"Opinionated" is the key word. This prevents the AI from hedging ("you might want to consider...") and forces direct statements ("F-01: this is broken, here's how to fix it").

### Review Protocol — Three-Phase Process

```markdown
### Phase 1: Observe
[understand the project before judging it]

### Phase 2: Investigate
[systematically check each category with evidence]

### Phase 3: Report
[write findings to docs/review-YYYY-MM-DD.md]
```

Phase 1 (Observe) is critical — it prevents the reviewer from flagging something as "wrong" that is actually an intentional project convention. Reading CLAUDE.md, package.json, and git log first builds context for Phase 2's judgments.

### Category Checklists — What to Look For

Each of the 7 categories provides a concrete list of signals to check:

```markdown
### 1. Security Surface

Look for:
- **innerHTML / dangerouslySetInnerHTML** without sanitization
- **Missing Content Security Policy**
- **Secrets in source** — grep for API_KEY, SECRET, TOKEN, password
- **Unvalidated input** — query parameters used without validation
- **Eval / Function constructor** — dynamic code execution
```

These are not abstract principles — they're grep-able patterns. "Grep for `innerHTML`" is unambiguous; "check for security issues" is not. The specificity makes the review reproducible.

### Severity Levels — Prioritization Contract

```markdown
| Level | Meaning | Action |
|-------|---------|--------|
| **Critical** | Security vulnerability, data loss risk | Fix immediately |
| **High** | Broken UX, test gaps that mask regressions | Fix this sprint |
| **Medium** | Inconsistencies, dead code, docs drift | Fix when nearby |
| **Low** | Polish, minor naming issues | Fix opportunistically |
```

The "Action" column is what separates this from a generic severity scale — it tells the reader exactly when to fix each level, not just how bad it is.

### Output Format — Structured Findings

```markdown
### [SEVERITY] F-01: [Short title]

**Category:** [Security | Dead Code | ...]
**Evidence:** [file:line or command output]
**Impact:** [What goes wrong if unfixed]
**Fix:** [Specific remediation]
```

Every finding has 4 fields. If any field can't be filled, it's not a finding. This structure makes findings scannable (severity + title), verifiable (evidence), motivating (impact), and actionable (fix).

### Hard Rules — Anti-patterns to Prevent

```markdown
- **Every finding must have evidence.**
- **Never report style preferences as findings.**
- **Findings must be actionable.**
- **Don't repeat what works.**
- **Respect project conventions.**
- **Security findings get specific severity.**
- **The remediation plan must be executable.**
```

These rules encode the difference between a useful review and a frustrating one. "Don't repeat what works" is especially important — a 5-page report where 4 pages say "this is fine" dilutes the signal.

## Applicability

This skill pattern works for any codebase audit workflow: security audits, pre-launch checklists, dependency health checks, accessibility reviews, performance audits. The key transferable elements are: a taxonomy of problems specific to your domain, evidence requirements for every finding, severity levels with action timelines, and an output format that doubles as a work queue.

It does NOT replace specialized security tools (SAST scanners, dependency auditors) for deep analysis. It fills the gap between "no review" and "hire an auditor" — the 80% of issues a careful read-through catches that automated tools miss.

## Related Lessons

- [Building a Lessons Skill](26-building-a-lessons-skill.md) — same skill architecture pattern (frontmatter, modes, quality contracts, hard rules) applied to a different domain
- [Code Review Driven Remediation](13-code-review-remediation.md) — the manual code review that identified the problem patterns this skill now checks automatically
- [XSS in Trusted-Data Applications](17-xss-trusted-data.md) — the specific security finding (innerHTML without CSP) that became category 1 item 1 in the review checklist
- [Legacy Artifact Removal](25-legacy-artifact-removal.md) — dead code findings (category 2) are the trigger for removal work
