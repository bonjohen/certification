/**
 * XMLParser + QuizEngine Integration Test
 * Verifies the full data flow: XML file → parsed exam → engine state management
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { XMLParser } from '../../js/xml-parser.js';
import { QuizEngine } from '../../js/quiz-engine.js';

const SAMPLE_XML_PATH = join(process.cwd(), 'tests', 'fixtures', 'sample-exam.xml');

function loadExamFromFile() {
    const parser = new XMLParser();
    const xmlText = readFileSync(SAMPLE_XML_PATH, 'utf-8');
    return parser.parseExam(xmlText);
}

describe('XMLParser → QuizEngine data flow', () => {
    let engine;

    beforeEach(() => {
        const examData = loadExamFromFile();
        engine = new QuizEngine(examData);
    });

    it('parser output feeds directly into QuizEngine constructor', () => {
        expect(engine.totalQuestions).toBe(3);
        expect(engine.currentIndex).toBe(0);
    });

    it('metadata propagates correctly', () => {
        expect(engine.exam.metadata.examCode).toBe('TEST-001');
        expect(engine.exam.metadata.examTitle).toBe('Sample Test Exam');
        expect(engine.exam.metadata.provider).toBe('Test Provider');
        expect(engine.exam.metadata.totalQuestions).toBe(3);
    });

    it('categories parsed into metadata', () => {
        const cats = engine.exam.metadata.categories;
        expect(cats.cat1).toBe('Category One');
        expect(cats.cat2).toBe('Category Two');
    });

    it('questions have all required fields for the engine', () => {
        engine.exam.questions.forEach(q => {
            expect(q).toHaveProperty('id');
            expect(q).toHaveProperty('title');
            expect(q).toHaveProperty('questionText');
            expect(q).toHaveProperty('choices');
            expect(q).toHaveProperty('correctAnswer');
            expect(q).toHaveProperty('hints');
            expect(q.choices.length).toBe(4);
        });
    });

    it('choices have letter and text properties the engine expects', () => {
        const q1 = engine.exam.questions[0];
        q1.choices.forEach(c => {
            expect(c).toHaveProperty('letter');
            expect(c).toHaveProperty('text');
            expect(c.letter).toMatch(/^[A-D]$/);
            expect(c.text.length).toBeGreaterThan(0);
        });
    });

    it('engine can evaluate correct answers from parsed data', () => {
        // Q1 correct = B
        const result1 = engine.submitAnswer('B');
        expect(result1.isCorrect).toBe(true);

        // Q2 correct = A
        engine.next();
        const result2 = engine.submitAnswer('A');
        expect(result2.isCorrect).toBe(true);

        // Q3 correct = D
        engine.next();
        const result3 = engine.submitAnswer('D');
        expect(result3.isCorrect).toBe(true);

        expect(engine.score).toBe(3);
    });

    it('engine can evaluate incorrect answers from parsed data', () => {
        const result = engine.submitAnswer('C'); // correct is B
        expect(result.isCorrect).toBe(false);
        expect(result.correctAnswer).toBe('B');
    });

    it('hints from XML are accessible through the engine', () => {
        const q1 = engine.currentQuestion;
        expect(q1.hints.length).toBe(3);
        expect(q1.hints[0].level).toBe(1);
        expect(q1.hints[0].content).toContain('level 1 hint');

        // Reveal and check
        engine.revealHint(q1.id, 1);
        expect(engine.isHintRevealed(q1.id, 1)).toBe(true);
        expect(engine.canRevealHint(q1.id, 2)).toBe(true);
    });

    it('tags from XML are preserved on questions', () => {
        const q1 = engine.exam.questions[0];
        expect(q1.tags).toContain('testing');
        expect(q1.tags).toContain('sample');
    });

    it('navigation works across all parsed questions', () => {
        expect(engine.currentQuestionNumber).toBe(1);
        engine.next();
        expect(engine.currentQuestionNumber).toBe(2);
        expect(engine.currentQuestion.title).toBe('Sample Question 2');
        engine.next();
        expect(engine.currentQuestionNumber).toBe(3);
        engine.previous();
        expect(engine.currentQuestionNumber).toBe(2);
    });

    it('state export/restore roundtrip preserves all answers', () => {
        engine.submitAnswer('B');
        engine.next();
        engine.submitAnswer('A');
        engine.revealHint(engine.exam.questions[0].id, 1);

        const state = engine.getState();
        const examData = loadExamFromFile();
        const engine2 = new QuizEngine(examData);
        engine2.restoreState(state);

        expect(engine2.currentIndex).toBe(1);
        expect(engine2.score).toBe(2);
        expect(engine2.attemptedCount).toBe(2);
        expect(engine2.isHintRevealed(engine.exam.questions[0].id, 1)).toBe(true);
    });

    it('glossary is parsed alongside questions', () => {
        const examData = loadExamFromFile();
        expect(Object.keys(examData.glossary).length).toBe(2);
        expect(examData.glossary.term1.name).toBe('Test Term');
        expect(examData.glossary.term2.name).toBe('Another Term');
        expect(examData.glossary.term1.relatedTerms).toContain('term2');
    });

    it('difficulty and categoryRef parsed from attributes', () => {
        expect(engine.exam.questions[0].difficulty).toBe('basic');
        expect(engine.exam.questions[0].categoryRef).toBe('cat1');
        expect(engine.exam.questions[1].difficulty).toBe('intermediate');
        expect(engine.exam.questions[1].categoryRef).toBe('cat2');
        expect(engine.exam.questions[2].difficulty).toBe('advanced');
    });

    it('getProgress reflects full parsed question set', () => {
        engine.submitAnswer('B');
        const progress = engine.getProgress();
        expect(progress.length).toBe(3);
        expect(progress[0].answered).toBe(true);
        expect(progress[0].isCorrect).toBe(true);
        expect(progress[1].answered).toBe(false);
        expect(progress[2].answered).toBe(false);
    });

    it('exportResults produces complete results object', () => {
        engine.submitAnswer('B');
        engine.next();
        engine.submitAnswer('C'); // wrong

        const results = engine.exportResults();
        expect(results.examCode).toBe('TEST-001');
        expect(results.examTitle).toBe('Sample Test Exam');
        expect(results.totalQuestions).toBe(3);
        expect(results.attempted).toBe(2);
        expect(results.score).toBe(1);
        expect(results.percentage).toBe(50);
        expect(results.details.length).toBe(3); // all questions; 2 answered, 1 unanswered
        expect(results.details.filter(d => d.selected !== null).length).toBe(2);
    });
});
