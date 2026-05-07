# Answer Position Bias

## The Lesson

When humans author multiple-choice questions, the correct answer tends to cluster in certain positions (often B or C). Test-takers learn this pattern and use it as a guessing heuristic. Randomizing answer positions eliminates this bias and makes the quiz a better learning tool.

## Context

A certification quiz application had 1,650+ questions authored by multiple contributors. The correct answer was disproportionately placed in certain letter positions, creating a learnable pattern that undermined the educational purpose of the tool.

## What Happened

1. An audit of answer distributions revealed statistical clustering of correct answers
2. A Python script (`randomize_answers.py`) was written to shuffle choice order within each question while updating the correct-answer letter to track the new position
3. The script was run across all exam XML files in a single batch
4. Post-randomization verification confirmed uniform distributions and no answer-key corruption

## Key Insights

- **Answer position bias is universal in human-authored content.** It's not laziness — it's cognitive: authors tend to write the correct answer first (as A) or put it in the middle (B/C) because that "feels" natural.
- **Randomization must be atomic per question.** The choices and the correct-answer letter must be updated together. Shuffling choices without updating the answer key is a catastrophic data corruption.
- **Post-randomization validation is non-negotiable.** After shuffling, verify that (a) every question still has exactly one correct answer, (b) the correct-answer letter matches the shuffled choice, (c) the distribution is approximately uniform.
- **Run randomization once at authoring time, not at quiz runtime.** Runtime randomization creates a different experience on each load, which complicates progress tracking and makes bug reports unreproducible.

## Information Needed to Complete This Document

- [ ] Include pre-randomization distribution data (e.g., "42% of correct answers were B")
- [ ] Show the randomization algorithm (Fisher-Yates on choices + remap answer key)
- [ ] Document the verification checks that ran post-randomization
- [ ] Discuss whether re-randomization should happen when new questions are added
- [ ] Reference academic literature on answer position bias in standardized testing
