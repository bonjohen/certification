# Hint Quality as a Spectrum

## The Lesson

A progressive hint system (brief nudge → full explanation → deep-dive knowledge) is more pedagogically effective than a single "show answer" button. But each level must serve a distinct purpose with a measurable quality bar, or they collapse into three versions of the same thin content.

## Context

Each question in the quiz has three hint levels:
- **H1 (Brief Hint):** 1-2 sentence nudge toward the right concept area
- **H2 (Complete Explanation):** Full paragraph explaining why the correct answer is right and why distractors are wrong
- **H3 (Deep Knowledge):** Bulleted deep-dive with 3-4 bullets covering related concepts, edge cases, or real-world implications

## What Happened

An audit revealed that many questions had hints that were nominally three levels but functionally identical — all three were 10-20 character fragments like "Think about networking" or "Azure service." The three-tier system was present structurally but absent educationally.

Quality thresholds were defined (H1 >= 80 chars, H2 >= 250 chars, H3 >= 200 chars) and enforced through systematic enrichment of all 33 exam files.

## Key Insights

- **Each hint level needs a distinct structural contract.** H1 is a sentence. H2 is a paragraph with distractor analysis. H3 is a bulleted list. If the structure isn't specified, authors default to the same format at every level.
- **Minimum character counts prevent token hints.** A 15-character hint cannot contain a real explanation. The threshold doesn't guarantee quality but guarantees substance.
- **H2 (Complete Explanation) is the load-bearing hint.** It's what learners read after getting an answer wrong. If H2 is thin, the entire hint system fails its educational purpose. H2 should get the most authoring attention.
- **H3 (Deep Knowledge) benefits from structured format.** Requiring `<ul><li>` bulleted format forces authors to identify multiple discrete insights rather than writing another paragraph.
- **Progressive disclosure changes study behavior.** Users who can peek at H1 before committing an answer learn to think about the concept area. Users who go straight to H3 after getting it wrong learn more deeply. The three levels support different learning strategies.

## Information Needed to Complete This Document

- [ ] Include examples of each hint level at reference quality
- [ ] Show a bad-to-good transformation for each level
- [ ] Discuss the pedagogical research behind progressive hint systems
- [ ] Document how hint levels affect study behavior (if usage data is available)
- [ ] Consider whether a 4th hint level (e.g., "Related Topics") would add value
