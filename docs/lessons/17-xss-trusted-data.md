# XSS in Trusted-Data Applications

## The Lesson

Using `innerHTML` to render content from "your own" data files (XML, JSON, markdown) is an XSS vulnerability even when the data is self-authored today. The threat model changes when the data pipeline changes: content contributions, bulk imports from external sources, or AI-generated content can all introduce script injection. Sanitize all HTML inserted via `innerHTML`, regardless of how much you trust the source.

## Context

The quiz application rendered question text, scenarios, and hints using `innerHTML` from parsed XML/JSON data. The data files were all self-authored and stored in the repository. A code review flagged this as an XSS risk despite the trusted-source argument.

## The Remediation

1. A `sanitizeHTML()` function was added that removes `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, and `<form>` elements, and strips event handler attributes (`onclick`, `onerror`, etc.)
2. All `innerHTML` assignments in `app.js` were routed through this sanitizer
3. A CSP meta tag was added as defense-in-depth
4. A regression test injects `<script>alert(1)</script>` in question data and verifies it's not rendered as executable HTML

## Key Insights

- **"We author all the data" is a point-in-time argument, not an architectural guarantee.** Today you author all the data. Tomorrow you accept community contributions, import from a third-party API, or generate content with an LLM that might hallucinate HTML.
- **`innerHTML` is the vector, not the data source.** The vulnerability exists because `innerHTML` parses and executes HTML. It doesn't matter whether the HTML came from an attacker or from your own repository — the mechanism is the same.
- **DOM-based sanitization is simple and sufficient.** Create a temporary `<div>`, set its `innerHTML`, remove dangerous elements and attributes, return the cleaned HTML. No external library needed for basic cases.
- **CSP is defense-in-depth, not a replacement for sanitization.** CSP blocks script execution but doesn't prevent other HTML injection (e.g., phishing-style UI manipulation with injected `<form>` elements). Both layers are needed.
- **The regression test is the most important artifact.** It proves the vulnerability is covered and prevents future developers from accidentally removing the sanitization.

## Information Needed to Complete This Document

- [ ] Include the full `sanitizeHTML()` implementation
- [ ] Document the specific innerHTML call sites that were remediated
- [ ] Show the CSP meta tag and explain each directive
- [ ] Discuss the DOMPurify library as an alternative to hand-rolled sanitization
- [ ] Address the broader OWASP innerHTML guidance
