/**
 * Quiz Engine Module
 * Manages quiz state, navigation, and answer evaluation
 */

export class QuizEngine {
    constructor(examData) {
        this.exam = examData;
        this.currentIndex = 0;
        this.answers = new Map(); // questionId -> {selected, isCorrect, hintsUsed}
        this.hintsRevealed = new Map(); // questionId -> Set of revealed levels
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

    revealHint(questionId, level) {
        if (!this.hintsRevealed.has(questionId)) {
            this.hintsRevealed.set(questionId, new Set());
        }
        this.hintsRevealed.get(questionId).add(level);
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

        return {
            examCode: this.exam.metadata.examCode,
            examTitle: this.exam.metadata.examTitle,
            totalQuestions: this.totalQuestions,
            attempted: this.attemptedCount,
            score: this.score,
            percentage: percentage,
            timestamp: new Date().toISOString(),
            details: Array.from(this.answers.entries()).map(([id, answer]) => ({
                questionId: id,
                selected: answer.selected,
                isCorrect: answer.isCorrect,
                hintsUsed: answer.hintsUsed
            }))
        };
    }

    // Save and restore state for persistence
    getState() {
        return {
            currentIndex: this.currentIndex,
            answers: Array.from(this.answers.entries()),
            hintsRevealed: Array.from(this.hintsRevealed.entries()).map(
                ([id, set]) => [id, Array.from(set)]
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
    }
}
