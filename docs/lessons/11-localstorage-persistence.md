# Client-Side State Persistence with localStorage

## The Lesson

localStorage can serve as a full persistence layer for client-side applications when the data is user-specific, the data volume is small, and there is no multi-device sync requirement. The key challenges are key design, migration of storage formats, and graceful handling of storage limits and corruption.

## Context

The quiz application persists quiz state (current question, answers given, hints revealed, timestamps) to localStorage so users can close the browser and resume later. It also maintains a history of completed quiz attempts for the results page.

## What Happened

<!-- reconstructed from context, not git history -->

1. The initial quiz application had no persistence — closing the browser lost all progress. Users studying 50-question exams couldn't complete them in one sitting.
2. A `ProgressTracker` class was added that saves quiz state to localStorage after every answer submission and hint reveal, keyed by exam code (e.g., `progress_az-900`).
3. On quiz load, the tracker checks for saved state and prompts the user to resume or start fresh. Resuming restores the exact question, answers, and hint state.
4. When the storage format changed (adding timestamp tracking for the results page), a migration path was added: the tracker detects old format entries and upgrades them in place rather than discarding them.
5. A results history feature was added that saves completed quiz attempts separately, allowing the results page to show past scores, timing, and per-question breakdowns.
6. The `clear` operation was scoped per-exam rather than global, so clearing progress on one exam doesn't affect others.

## Key Insights

- **Key design matters.** Keying state by exam code (`progress_{exam-code}`) means a user can have independent progress on multiple exams simultaneously. A single `progress` key would have been simpler but would lose state on exam switch.
- **Save on every action, not just on exit.** The progress tracker saves after every answer submission and hint reveal. This makes the system crash-safe — if the browser crashes mid-quiz, at most one answer is lost.
- **Migration is inevitable.** When the storage format changes (e.g., adding timestamp fields, changing hint structure), old saved state must be migrated or gracefully discarded. The progress tracker handles this by detecting old formats and upgrading them in place.
- **localStorage has a ~5MB limit.** For small JSON objects per exam, this is generous. But if every quiz attempt is saved in history without cleanup, it can fill up over time. Consider a retention policy for old history entries.
- **localStorage is synchronous and blocking.** This is fine for small reads/writes but would be a problem for large datasets. For this application's data sizes (a few KB per exam), it's not a concern.
- **Clear state must be explicit.** The "start fresh" option clears progress for one exam, not all exams. The clear operation should be scoped to match user expectations.

## Related Lessons

- [Static Site as Application Platform](10-static-site-as-platform.md) — localStorage is what makes a zero-backend static site feel like an application with state
