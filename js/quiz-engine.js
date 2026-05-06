/**
 * Quiz Engine Module
 * Manages quiz state, navigation, and answer evaluation
 */

export class QuizEngine {
    constructor(examData) {
        this.exam = examData;
        this.currentIndex = 0;
        this.answers = new Map(); // questionId -> {selected, isCorrect, hintsUsed, timestamp}
        this.hintsRevealed = new Map(); // questionId -> Set of revealed levels
        this.questionDisplayed = new Map(); // questionId -> ISO8601 UTC timestamp
        this.hintTimestamps = new Map(); // questionId -> Map(level -> ISO8601 UTC timestamp)
    }

    get currentQuestion() {
        return this.exam.questions[this.currentIndex];
    }

    get totalQuestions() {
        return this.exam.questions.length;
    }

    get currentQuestionNumber() {
        return this.currentIndex + 1;
    }

    get score() {
        let correct = 0;
        this.answers.forEach(answer => {
            if (answer.isCorrect) correct++;
        });
        return correct;
    }

    get attemptedCount() {
        return this.answers.size;
    }

    navigateTo(index) {
        if (index >= 0 && index < this.totalQuestions) {
            this.currentIndex = index;
            return true;
        }
        return false;
    }

    next() {
        return this.navigateTo(this.currentIndex + 1);
    }

    previous() {
        return this.navigateTo(this.currentIndex - 1);
    }

    submitAnswer(selectedLetter) {
        const question = this.currentQuestion;

        // Guard against re-submission — preserve the first answer
        if (this.hasAnswered(question.id)) {
            const existing = this.getAnswer(question.id);
            return {
                isCorrect: existing.isCorrect,
                correctAnswer: question.correctAnswer,
                selectedAnswer: existing.selected
            };
        }

        const isCorrect = selectedLetter === question.correctAnswer;

        this.answers.set(question.id, {
            selected: selectedLetter,
            isCorrect: isCorrect,
            hintsUsed: this.getRevealedHintLevels(question.id),
            timestamp: new Date().toISOString()
        });

        return {
            isCorrect,
            correctAnswer: question.correctAnswer,
            selectedAnswer: selectedLetter
        };
    }

    hasAnswered(questionId) {
        return this.answers.has(questionId);
    }

    getAnswer(questionId) {
        return this.answers.get(questionId);
    }

    recordQuestionDisplayed(questionId) {
        if (!this.questionDisplayed.has(questionId)) {
            this.questionDisplayed.set(questionId, new Date().toISOString());
        }
    }

    revealHint(questionId, level) {
        if (!this.hintsRevealed.has(questionId)) {
            this.hintsRevealed.set(questionId, new Set());
        }
        this.hintsRevealed.get(questionId).add(level);

        // Record hint reveal timestamp (first reveal only)
        if (!this.hintTimestamps.has(questionId)) {
            this.hintTimestamps.set(questionId, new Map());
        }
        const qHints = this.hintTimestamps.get(questionId);
        if (!qHints.has(level)) {
            qHints.set(level, new Date().toISOString());
        }
    }

    hideHint(questionId, level) {
        const revealed = this.hintsRevealed.get(questionId);
        if (revealed) {
            revealed.delete(level);
            // Also hide any higher level hints
            for (let l = level + 1; l <= 3; l++) {
                revealed.delete(l);
            }
        }
    }

    toggleHint(questionId, level) {
        if (this.isHintRevealed(questionId, level)) {
            this.hideHint(questionId, level);
            return false; // now hidden
        } else {
            this.revealHint(questionId, level);
            return true; // now revealed
        }
    }

    isHintRevealed(questionId, level) {
        const revealed = this.hintsRevealed.get(questionId);
        return revealed ? revealed.has(level) : false;
    }

    getRevealedHintLevels(questionId) {
        const revealed = this.hintsRevealed.get(questionId);
        return revealed ? Array.from(revealed) : [];
    }

    canRevealHint(questionId, level) {
        // Level 1 is always available
        if (level === 1) return true;
        // Higher levels require previous level to be revealed
        return this.isHintRevealed(questionId, level - 1);
    }

    getProgress() {
        return this.exam.questions.map(q => ({
            id: q.id,
            answered: this.hasAnswered(q.id),
            isCorrect: this.answers.get(q.id)?.isCorrect ?? null
        }));
    }

    exportResults() {
        const percentage = this.attemptedCount > 0
            ? Math.round((this.score / this.attemptedCount) * 100)
            : 0;

        // Build a lookup from question id to question object
        const questionsById = new Map(
            this.exam.questions.map(q => [q.id, q])
        );

        return {
            examCode: this.exam.metadata.examCode,
            examTitle: this.exam.metadata.examTitle,
            provider: this.exam.metadata.provider || '',
            totalQuestions: this.totalQuestions,
            attempted: this.attemptedCount,
            score: this.score,
            percentage: percentage,
            timestamp: new Date().toISOString(),
            categories: { ...(this.exam.metadata.categories || {}) },
            details: this.exam.questions.map(q => {
                const answer = this.answers.get(q.id);
                const qHintTs = this.hintTimestamps.get(q.id);
                const hintTsObj = {};
                if (qHintTs) {
                    qHintTs.forEach((ts, level) => { hintTsObj[level] = ts; });
                }
                return {
                    questionId: q.id,
                    questionTitle: q.title,
                    categoryRef: q.categoryRef,
                    difficulty: q.difficulty,
                    selected: answer ? answer.selected : null,
                    correctAnswer: q.correctAnswer,
                    isCorrect: answer ? answer.isCorrect : null,
                    hintsUsed: qHintTs && qHintTs.size > 0
                        ? Array.from(qHintTs.keys()).sort((a, b) => a - b)
                        : (answer ? answer.hintsUsed : this.getRevealedHintLevels(q.id)),
                    displayedAt: this.questionDisplayed.get(q.id) || null,
                    answeredAt: answer ? (answer.timestamp || null) : null,
                    hintTimestamps: hintTsObj
                };
            })
        };
    }

    // Save and restore state for persistence
    getState() {
        return {
            currentIndex: this.currentIndex,
            answers: Array.from(this.answers.entries()),
            hintsRevealed: Array.from(this.hintsRevealed.entries()).map(
                ([id, set]) => [id, Array.from(set)]
            ),
            questionDisplayed: Array.from(this.questionDisplayed.entries()),
            hintTimestamps: Array.from(this.hintTimestamps.entries()).map(
                ([id, levelMap]) => [id, Array.from(levelMap.entries())]
            )
        };
    }

    restoreState(state) {
        if (state.currentIndex !== undefined) {
            this.currentIndex = state.currentIndex;
        }
        if (state.answers instanceof Map) {
            this.answers = state.answers;
        } else if (Array.isArray(state.answers)) {
            this.answers = new Map(state.answers);
        }
        if (state.hintsRevealed instanceof Map) {
            this.hintsRevealed = state.hintsRevealed;
        } else if (Array.isArray(state.hintsRevealed)) {
            this.hintsRevealed = new Map(
                state.hintsRevealed.map(([id, arr]) => [id, new Set(arr)])
            );
        }
        // Restore questionDisplayed (backward compat: default to empty Map)
        if (state.questionDisplayed instanceof Map) {
            this.questionDisplayed = state.questionDisplayed;
        } else if (Array.isArray(state.questionDisplayed)) {
            this.questionDisplayed = new Map(state.questionDisplayed);
        } else {
            this.questionDisplayed = new Map();
        }
        // Restore hintTimestamps (backward compat: default to empty Map)
        if (state.hintTimestamps instanceof Map) {
            this.hintTimestamps = state.hintTimestamps;
        } else if (Array.isArray(state.hintTimestamps)) {
            this.hintTimestamps = new Map(
                state.hintTimestamps.map(([id, arr]) => [id, new Map(arr)])
            );
        } else {
            this.hintTimestamps = new Map();
        }
    }
}
