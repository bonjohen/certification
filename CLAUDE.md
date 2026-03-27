## Project Overview

This is a multi-provider certification exam study site. It serves browser-based practice quizzes backed by XML question banks. The shared quiz engine, XML parser, navigation, persistence, and hint system are provider-agnostic — new providers plug in by adding data and a provider page.

### Current Providers

- **AWS** — 7 exams (`data/aws/*.xml`)
- **Azure** — 8 exams (`data/azure/*.xml`)
- **GCP** — 10 exams (`data/gcp/*.xml`)

### Architecture Conventions

- Question banks live at `data/{provider}/{exam-code}.xml`
- Each provider has a landing page (`{provider}.html`) listing its exam cards
- Quizzes are served by `quiz.html?exam={exam-code}`
- All exams reuse the shared quiz engine (`js/quiz-engine.js`), XML parser (`js/xml-parser.js`), progress tracker (`js/progress-tracker.js`), and app controller (`js/app.js`)
- New providers must not introduce provider-specific rendering, storage, or navigation logic

### Naming Rules

When referencing the Anthropic certification feature, use these names consistently everywhere (UI text, metadata, XML, routing, filenames, code references):

| Field      | Value                                      |
|------------|--------------------------------------------|
| Provider   | Anthropic                                  |
| Exam code  | CCA-F                                      |
| Exam title | Claude Certified Architect, Foundations    |

---

When facing architectural or implementation choices, Claude should:
1. **Choose the best option** based on project constraints (simplicity, determinism, restart-safety)
2. **Document the decision** in `docs/todo.md` under "Resolved Decisions"
3. **Explain the rationale** briefly when making the choice
4. **Prefer:** simplicity over cleverness, determinism over parallelism, file-based over networked

## Agent Operating Rules

1. Make architectural decisions autonomously when needed; document rationale in todo.md.
2. Prefer `/delegate` for scoped, non-authoritative processing or evaluation tasks.
3. When information stabilizes, persist it in files and treat prior discussion as disposable.
4. File placement rules:
   - Temporary files: `/tmp/a_story_night/`
   - Logs: `/log/<producer>/`
   - Source data: `/data/<source>/`
   - Executables: appropriate `bin/` directories
   - Avoid files in root unless they truly belong there
   - Discover and respect existing structure before creating new paths
5. Minimize change scope; prefer localized modifications over broad rewrites unless explicitly directed.

## Invariants

- **Never delete user data**; only move or rename
- **All state transitions must be logged**
- **Processing must be idempotent and restart-safe**
- **Completed outputs must never be silently overwritten**
- **Recovery logic always runs before new work is claimed**

## File Safety

- Treat all filesystem operations as potentially fallible
- Prefer atomic moves and renames
- Assume the system may crash or restart at any point
- Use write-to-temp-then-rename pattern for all writes

## Behavior

- As progress is made, update project documentation (`todo.md`, etc.)
- Immediately before a commit, clean up folders that may have misplaced files
- Favor simple, deterministic designs over clever optimizations
- Make recovery paths explicit and testable
- Keep job state externalized to files, not memory
- Avoid introducing databases or network dependencies unless explicitly required