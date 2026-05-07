# XML Entity Encoding Pitfalls

## The Lesson

XML entity encoding bugs (`Q&A` vs `Q&amp;A`) are the most common class of data corruption in XML content pipelines. They're invisible in many editors, they pass casual visual inspection, and they cause parse failures that manifest as "the file won't load" with no useful error message. Any pipeline that produces or transforms XML content must have automated validation.

## Context

The certification quiz application stored exam questions in XML files. Multiple bug-fix commits addressed entity encoding issues:
- `Fix HTML entity references in AZ-400 and AZ-500 exam XML files` — unescaped `&` in question text caused parse failures
- `Fix XML escape characters in scenarios for questions 8 and 42 in Databricks certification exam (Q&A vs Q&amp;A)` — content had literal `&` instead of `&amp;`

## What Happened

1. Six Azure exam XML files were added to the project. Two of them (AZ-400, AZ-500) contained unescaped `&` characters in question text — phrases like "Q&A" instead of "Q&amp;A".
2. The XML parser failed silently in the browser: `DOMParser` returned a parsererror document instead of the exam, and the quiz showed a generic "failed to load" message with no indication that an `&` on line 247 was the cause.
3. A fix commit corrected the two files manually. No automated check was added at this point.
4. Months later, the same bug recurred in Databricks exam files — questions 8 and 42 had `Q&A` in their scenarios. Another manual fix commit followed.
5. A `validate-xml.js` script was then written to parse all XML files and report errors, catching this class of bug before it reached users.
6. The eventual migration from XML to JSON eliminated this entire problem class — JSON strings handle `&` natively with no escaping required.

## Key Insights

- **The five XML entities must always be escaped in text content:** `&amp;` (`&`), `&lt;` (`<`), `&gt;` (`>`), `&quot;` (`"`), `&apos;` (`'`). Forgetting any of these produces a malformed XML document.
- **The `&` character is the most common offender.** It appears naturally in text ("Q&A", "AT&T", "R&D") and is easy to type without escaping. Authors don't think of `&` as a special character.
- **XML parsers fail hard on entity errors.** Unlike HTML parsers (which are lenient), XML parsers abort on the first malformed entity. The error message is often "not well-formed" with a line number but no indication of which character is the problem.
- **Editors that highlight XML syntax help.** VS Code with an XML extension will red-underline unescaped `&`. But many content authoring workflows happen outside syntax-aware editors (spreadsheets, forms, AI-generated text).
- **Automated XML validation is the only reliable gate.** A `validate-xml.js` script that parses every XML file and reports errors catches these bugs before they reach users. Running it as part of the development workflow (or CI) prevents entity encoding bugs from ever shipping.
- **JSON avoids this entire problem class.** JSON strings don't have entity encoding — `"Q&A"` is valid JSON. This was one motivation for the XML-to-JSON migration.

## Examples

**Broken XML** (causes parse failure):
```xml
<scenario>Your team uses a Q&A forum for knowledge sharing.</scenario>
```

**Fixed XML**:
```xml
<scenario>Your team uses a Q&amp;A forum for knowledge sharing.</scenario>
```

The only visible difference is `&` vs `&amp;`. Both render identically to the user, but the first one kills the XML parser.

## Related Lessons

- [XML to JSON Migration](01-xml-to-json-migration.md) — entity encoding bugs were one motivation for migrating away from XML
- [Schema Enforcement at the Data Layer](02-schema-enforcement.md) — schema validation catches structural errors; entity validation catches encoding errors; both are needed
