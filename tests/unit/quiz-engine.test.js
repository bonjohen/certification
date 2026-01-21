/**
 * QuizEngine Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QuizEngine } from '../../js/quiz-engine.js';

// Sample exam data for testing
const createSampleExam = () => ({
    metadata: {
        examCode: 'TEST-001',
        examTitle: 'Test Exam',
        provider: 'Test Provider',
    },
    questions: [
        {
            id: 1,
            title: 'Question 1',
            correctAnswer: 'B',
            choices: [
                { letter: 'A', text: 'Option A' },
                { letter: 'B', text: 'Option B' },
                { letter: 'C', text: 'Option C' },
                { letter: 'D', text: 'Option D' },
            ],
            hints: [
                { level: 1, label: 'Hint 1', content: 'Hint content 1' },
                { level: 2, label: 'Hint 2', content: 'Hint content 2' },
                { level: 3, label: 'Hint 3', content: 'Hint content 3' },
            ],
        },
        {
            id: 2,
            title: 'Question 2',
            correctAnswer: 'A',
            choices: [
                { letter: 'A', text: 'Option A' },
                { letter: 'B', text: 'Option B' },
            ],
            hints: [],
        },
        {
            id: 3,
            title: 'Question 3',
            correctAnswer: 'D',
            choices: [
                { letter: 'A', text: 'Option A' },
                { letter: 'B', text: 'Option B' },
                { letter: 'C', text: 'Option C' },
                { letter: 'D', text: 'Option D' },
            ],
            hints: [{ level: 1, label: 'Hint', content: 'Content' }],
        },
    ],
});

describe('QuizEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new QuizEngine(createSampleExam());
    });

    describe('initialization', () => {
        it('should initialize with correct default state', () => {
            expect(engine.currentIndex).toBe(0);
            expect(engine.totalQuestions).toBe(3);
            expect(engine.currentQuestionNumber).toBe(1);
            expect(engine.score).toBe(0);
            expect(engine.attemptedCount).toBe(0);
        });

        it('should have access to current question', () => {
            const question = engine.currentQuestion;
            expect(question.id).toBe(1);
            expect(question.title).toBe('Question 1');
        });
    });

    describe('navigation', () => {
        it('should navigate to next question', () => {
            expect(engine.next()).toBe(true);
            expect(engine.currentIndex).toBe(1);
            expect(engine.currentQuestionNumber).toBe(2);
        });

        it('should navigate to previous question', () => {
            engine.navigateTo(2);
            expect(engine.previous()).toBe(true);
            expect(engine.currentIndex).toBe(1);
        });

        it('should not navigate below index 0', () => {
            expect(engine.previous()).toBe(false);
            expect(engine.currentIndex).toBe(0);
        });

        it('should not navigate beyond last question', () => {
            engine.navigateTo(2);
            expect(engine.next()).toBe(false);
            expect(engine.currentIndex).toBe(2);
        });

        it('should navigate to specific index', () => {
            expect(engine.navigateTo(1)).toBe(true);
            expect(engine.currentIndex).toBe(1);
        });

        it('should reject invalid navigation indices', () => {
            expect(engine.navigateTo(-1)).toBe(false);
            expect(engine.navigateTo(100)).toBe(false);
            expect(engine.currentIndex).toBe(0);
        });
    });

    describe('submitAnswer', () => {
        it('should return correct result for correct answer', () => {
            const result = engine.submitAnswer('B');
            expect(result.isCorrect).toBe(true);
            expect(result.correctAnswer).toBe('B');
            expect(result.selectedAnswer).toBe('B');
        });

        it('should return incorrect result for wrong answer', () => {
            const result = engine.submitAnswer('A');
            expect(result.isCorrect).toBe(false);
            expect(result.correctAnswer).toBe('B');
            expect(result.selectedAnswer).toBe('A');
        });

        it('should update score for correct answers', () => {
            engine.submitAnswer('B'); // Correct
            expect(engine.score).toBe(1);
            expect(engine.attemptedCount).toBe(1);
        });

        it('should not update score for incorrect answers', () => {
            engine.submitAnswer('A'); // Incorrect
            expect(engine.score).toBe(0);
            expect(engine.attemptedCount).toBe(1);
        });

        it('should track answer with hasAnswered', () => {
            expect(engine.hasAnswered(1)).toBe(false);
            engine.submitAnswer('B');
            expect(engine.hasAnswered(1)).toBe(true);
        });

        it('should retrieve answer with getAnswer', () => {
            engine.submitAnswer('B');
            const answer = engine.getAnswer(1);
            expect(answer.selected).toBe('B');
            expect(answer.isCorrect).toBe(true);
            expect(answer.timestamp).toBeDefined();
        });

        it('should track hints used at time of submission', () => {
            engine.revealHint(1, 1);
            engine.revealHint(1, 2);
            engine.submitAnswer('B');
            const answer = engine.getAnswer(1);
            expect(answer.hintsUsed).toEqual([1, 2]);
        });
    });

    describe('hint management', () => {
        it('should allow revealing level 1 hint without prerequisites', () => {
            expect(engine.canRevealHint(1, 1)).toBe(true);
        });

        it('should require level 1 before level 2', () => {
            expect(engine.canRevealHint(1, 2)).toBe(false);
            engine.revealHint(1, 1);
            expect(engine.canRevealHint(1, 2)).toBe(true);
        });

        it('should require level 2 before level 3', () => {
            expect(engine.canRevealHint(1, 3)).toBe(false);
            engine.revealHint(1, 1);
            expect(engine.canRevealHint(1, 3)).toBe(false);
            engine.revealHint(1, 2);
            expect(engine.canRevealHint(1, 3)).toBe(true);
        });

        it('should track revealed hints', () => {
            engine.revealHint(1, 1);
            expect(engine.isHintRevealed(1, 1)).toBe(true);
            expect(engine.isHintRevealed(1, 2)).toBe(false);
        });

        it('should toggle hints on and off', () => {
            const revealed1 = engine.toggleHint(1, 1);
            expect(revealed1).toBe(true);
            expect(engine.isHintRevealed(1, 1)).toBe(true);

            const revealed2 = engine.toggleHint(1, 1);
            expect(revealed2).toBe(false);
            expect(engine.isHintRevealed(1, 1)).toBe(false);
        });

        it('should hide higher level hints when hiding lower level', () => {
            engine.revealHint(1, 1);
            engine.revealHint(1, 2);
            engine.revealHint(1, 3);
            expect(engine.getRevealedHintLevels(1)).toEqual([1, 2, 3]);

            engine.hideHint(1, 2);
            expect(engine.isHintRevealed(1, 1)).toBe(true);
            expect(engine.isHintRevealed(1, 2)).toBe(false);
            expect(engine.isHintRevealed(1, 3)).toBe(false);
        });

        it('should return revealed hint levels as array', () => {
            engine.revealHint(1, 1);
            engine.revealHint(1, 2);
            const levels = engine.getRevealedHintLevels(1);
            expect(levels).toContain(1);
            expect(levels).toContain(2);
            expect(levels).not.toContain(3);
        });

        it('should return empty array for no revealed hints', () => {
            expect(engine.getRevealedHintLevels(1)).toEqual([]);
            expect(engine.getRevealedHintLevels(999)).toEqual([]);
        });
    });

    describe('getProgress', () => {
        it('should return progress for all questions', () => {
            const progress = engine.getProgress();
            expect(progress).toHaveLength(3);
            expect(progress[0].id).toBe(1);
            expect(progress[0].answered).toBe(false);
            expect(progress[0].isCorrect).toBe(null);
        });

        it('should reflect answered questions in progress', () => {
            engine.submitAnswer('B'); // Correct for question 1
            engine.next();
            engine.submitAnswer('C'); // Incorrect for question 2

            const progress = engine.getProgress();
            expect(progress[0].answered).toBe(true);
            expect(progress[0].isCorrect).toBe(true);
            expect(progress[1].answered).toBe(true);
            expect(progress[1].isCorrect).toBe(false);
            expect(progress[2].answered).toBe(false);
        });
    });

    describe('exportResults', () => {
        it('should export results with all metadata', () => {
            engine.submitAnswer('B');
            const results = engine.exportResults();

            expect(results.examCode).toBe('TEST-001');
            expect(results.examTitle).toBe('Test Exam');
            expect(results.totalQuestions).toBe(3);
            expect(results.attempted).toBe(1);
            expect(results.score).toBe(1);
            expect(results.percentage).toBe(100);
            expect(results.timestamp).toBeDefined();
            expect(results.details).toHaveLength(1);
        });

        it('should calculate percentage correctly', () => {
            engine.submitAnswer('B'); // Correct
            engine.next();
            engine.submitAnswer('C'); // Incorrect

            const results = engine.exportResults();
            expect(results.percentage).toBe(50);
        });

        it('should handle zero attempts', () => {
            const results = engine.exportResults();
            expect(results.percentage).toBe(0);
            expect(results.details).toHaveLength(0);
        });
    });

    describe('state persistence', () => {
        it('should export state with getState', () => {
            engine.navigateTo(1);
            engine.submitAnswer('A');
            engine.revealHint(2, 1);

            const state = engine.getState();
            expect(state.currentIndex).toBe(1);
            expect(state.answers).toBeInstanceOf(Array);
            expect(state.hintsRevealed).toBeInstanceOf(Array);
        });

        it('should restore state correctly', () => {
            // Set up initial state
            engine.navigateTo(1);
            engine.submitAnswer('A');
            engine.revealHint(2, 1);
            const state = engine.getState();

            // Create new engine and restore
            const newEngine = new QuizEngine(createSampleExam());
            newEngine.restoreState(state);

            expect(newEngine.currentIndex).toBe(1);
            expect(newEngine.hasAnswered(2)).toBe(true);
            expect(newEngine.isHintRevealed(2, 1)).toBe(true);
        });

        it('should handle restoring from Map objects', () => {
            const state = {
                currentIndex: 2,
                answers: new Map([[1, { selected: 'B', isCorrect: true }]]),
                hintsRevealed: new Map([[1, new Set([1, 2])]]),
            };

            engine.restoreState(state);
            expect(engine.currentIndex).toBe(2);
            expect(engine.hasAnswered(1)).toBe(true);
            expect(engine.isHintRevealed(1, 1)).toBe(true);
        });

        it('should handle restoring from arrays (serialized format)', () => {
            const state = {
                currentIndex: 1,
                answers: [[2, { selected: 'A', isCorrect: true }]],
                hintsRevealed: [[2, [1]]],
            };

            engine.restoreState(state);
            expect(engine.currentIndex).toBe(1);
            expect(engine.hasAnswered(2)).toBe(true);
            expect(engine.isHintRevealed(2, 1)).toBe(true);
        });

        it('should round-trip state through serialization', () => {
            engine.submitAnswer('B');
            engine.next();
            engine.submitAnswer('C');
            engine.revealHint(2, 1);

            const state = engine.getState();
            const serialized = JSON.stringify(state);
            const deserialized = JSON.parse(serialized);

            const newEngine = new QuizEngine(createSampleExam());
            newEngine.restoreState(deserialized);

            expect(newEngine.score).toBe(1);
            expect(newEngine.attemptedCount).toBe(2);
            expect(newEngine.isHintRevealed(2, 1)).toBe(true);
        });
    });
});
