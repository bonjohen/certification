# XML Entity Encoding Pitfalls

## The Lesson

XML entity encoding bugs (`Q&A` vs `Q&amp;A`) are the most common class of data corruption in XML content pipelines. They're invisible in many editors, they pass casual visual inspection, and they cause parse failures that manifest as "the file won't load" with no useful error message. Any pipeline that produces or transforms XML content must have automated validation.

## Context

The certification quiz application stored exam questions in XML files. Multiple bug-fix commits addressed entity encoding issues:
- `Fix HTML entity references in AZ-400 and AZ-500 exam XML files` — unescaped `&` in question text caused parse failures
- `Fix XML escape characters in scenarios for questions 8 and 42 in Databricks certification exam (Q&A vs Q&amp;A)` — content had literal `&` instead of `&amp;`

## Key Insights

- **The five XML entities must always be escaped in text content:** `&amp;` (`&`), `&lt;` (`<`), `&gt;` (`>`), `&quot;` (`"`), `&apos;` (`'`). Forgetting any of these produces a malformed XML document.
- **The `&` character is the most common offender.** It appears naturally in text ("Q&A", "AT&T", "R&D") and is easy to type without escaping. Authors don't think of `&` as a special character.
- **XML parsers fail hard on entity errors.** Unlike HTML parsers (which are lenient), XML parsers abort on the first malformed entity. The error message is often "not well-formed" with a line number but no indication of which character is the problem.
- **Editors that highlight XML syntax help.** VS Code with an XML extension will red-underline unescaped `&`. But many content authoring workflows happen outside syntax-aware editors (spreadsheets, forms, AI-generated text).
- **Automated XML validation is the only reliable gate.** A `validate-xml.js` script that parses every XML file and reports errors catches these bugs before they reach users. Running it as part of the development workflow (or CI) prevents entity encoding bugs from ever shipping.
- **JSON avoids this entire problem class.** JSON strings don't have entity encoding — `"Q&A"` is valid JSON. This was one motivation for the XML-to-JSON migration.

## Information Needed to Complete This Document

- [ ] Show specific examples of broken vs fixed XML (the actual diff)
- [ ] Include the validation script's approach to catching these errors
- [ ] Document other entity encoding edge cases (CDATA sections, nested HTML in XML)
- [ ] Discuss prevention: content authoring guidelines for XML authors
- [ ] Compare XML entity encoding to HTML entity encoding (which is more lenient)
