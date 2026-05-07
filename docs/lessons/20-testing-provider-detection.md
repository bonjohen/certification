# Testing Provider Detection Logic

## The Lesson

When critical logic is embedded in a class that's hard to test (DOM-coupled UI class), developers sometimes copy the logic into the test file and test the copy instead. This creates a dangerous illusion of coverage: the tests pass, but they're not testing the real code. When the real code diverges from the copy, regressions are invisible.

## Context

The `getProviderFromExam()` function was originally a method inside the `QuizApp` class. Since `QuizApp` required a browser DOM to instantiate, the test file recreated the same provider-detection logic as a standalone function and tested that copy.

## What Happened

1. Code review identified that `app.test.js` was testing a copy of the logic, not the real function
2. The fix: extract `getProviderFromExam()` from `QuizApp` as a standalone exported function in `app.js`
3. Update `app.test.js` to import and test the real export
4. Verify all 27 existing tests still pass against the real function
5. Add new tests for recently added providers (Anthropic, CompTIA, ISC2, etc.)

## Key Insights

- **Test the real code, not a copy.** If you can't test the real code, refactor it to be testable. Extracting a pure function from a DOM-coupled class is almost always possible and has zero runtime cost.
- **Copied test logic drifts silently.** When a new provider was added to the real `getProviderFromExam()` in `QuizApp`, the copy in the test file wasn't updated. Tests still passed. The new provider wasn't tested.
- **Pure functions are the easiest thing to test.** `getProviderFromExam(examId, metaProvider)` takes two strings and returns a string. No DOM, no state, no side effects. It can be tested with simple `expect(fn('az-900', null)).toBe('azure')` assertions.
- **Code review caught what tests couldn't.** The test suite was green. Coverage reports showed the test file had high line coverage. Only a human reading the test file and the source file side-by-side could see that they were testing different code.
- **This is a general anti-pattern.** Anywhere you see test code that reimplements production logic ("I'll just copy the regex here"), the test is fragile. The test should import the real thing or mock its dependencies, never reimplement it.

## Applicability

This anti-pattern appears anywhere tests reimplement production logic rather than importing it: regex patterns copied into test files, calculation formulas duplicated for assertion, routing rules recreated in test helpers. The fix is always the same — extract the logic into an importable, testable unit, then test the real thing. This applies to any language or framework.

## Related Lessons

- [Integration Testing a DOM Application with jsdom](19-jsdom-integration-testing.md) — dependency injection (the refactoring technique used here) is what makes DOM-coupled code testable
- [Code Review Driven Remediation](13-code-review-remediation.md) — this was finding F-02 in the code review; test-code drift was invisible to coverage reports
