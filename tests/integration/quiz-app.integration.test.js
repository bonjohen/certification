/**
 * QuizApp Integration Tests
 * Full flow: load XML → render question → select answer → submit → verify feedback
 * Also covers keyboard navigation (arrow keys).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { QuizApp, sanitizeHTML } from '../../js/app.js';
import { XMLParser } from '../../js/xml-parser.js';
import { QuizEngine } from '../../js/quiz-engine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SAMPLE_XML_PATH = join(process.cwd(), 'tests', 'fixtures', 'sample-exam.xml');

function getSampleXML() {
    return readFileSync(SAMPLE_XML_PATH, 'utf-8');
}

/** Build a minimal quiz-page DOM and return an elements map matching QuizApp. */
function buildQuizDOM() {
    document.body.innerHTML = `
        <div id="loading"></div>
        <div id="error" hidden>
            <p id="error-text"></p>
            <a id="error-back-link" href="index.html"></a>
        </div>
        <div id="question-card" hidden>
            <span id="q-num"></span>
            <h2 id="question-title"></h2>
            <span id="question-category"></span>
            <section id="scenario-section" hidden><div id="scenario-text"></div></section>
            <p id="question-content"></p>
            <fieldset id="choices-fieldset"></fieldset>
            <button id="submit-answer" disabled></button>
            <section id="feedback-section" hidden><div id="feedback-result"></div></section>
        </div>
        <nav id="navigation" hidden>
            <button id="prev-question"></button>
            <span id="current-num">1</span>
            <span id="total-num">0</span>
            <button id="next-question"></button>
        </nav>
        <a id="back-link" href="index.html"></a>
        <span id="exam-code"></span>
        <span id="exam-title"></span>
        <span id="score">0</span>
        <span id="attempted">0</span>
        <span id="percent-complete">0%</span>
        <span id="percent-success">0%</span>
        <aside id="hints-section" hidden>
            <div id="hints-content"></div>
            <button id="hint-btn-1"></button>
            <button id="hint-btn-2" disabled></button>
            <button id="hint-btn-3" disabled></button>
        </aside>
        <div id="correct-answer-display" hidden><span id="correct-answer-letter"></span></div>
    `;

    const el = (id) => document.getElementById(id);
    return {
        loading: el('loading'),
        error: el('error'),
        errorText: el('error-text'),
        errorBackLink: el('error-back-link'),
        questionCard: el('question-card'),
        navigation: el('navigation'),
        backLink: el('back-link'),
        examCode: el('exam-code'),
        examTitle: el('exam-title'),
        currentNum: el('current-num'),
        totalNum: el('total-num'),
        score: el('score'),
        attempted: el('attempted'),
        percentComplete: el('percent-complete'),
        percentSuccess: el('percent-success'),
        qNum: el('q-num'),
        questionTitle: el('question-title'),
        questionCategory: el('question-category'),
        scenarioSection: el('scenario-section'),
        scenarioText: el('scenario-text'),
        questionContent: el('question-content'),
        choicesFieldset: el('choices-fieldset'),
        submitAnswer: el('submit-answer'),
        feedbackSection: el('feedback-section'),
        feedbackResult: el('feedback-result'),
        hintsSection: el('hints-section'),
        hintsContent: el('hints-content'),
        hintBtn1: el('hint-btn-1'),
        hintBtn2: el('hint-btn-2'),
        hintBtn3: el('hint-btn-3'),
        prevQuestion: el('prev-question'),
        nextQuestion: el('next-question'),
        correctAnswerDisplay: el('correct-answer-display'),
        correctAnswerLetter: el('correct-answer-letter'),
    };
}

/** Create a QuizApp wired up with parsed sample exam data (no fetch). */
function createWiredApp() {
    const elements = buildQuizDOM();
    const parser = new XMLParser();
    const examData = parser.parseExam(getSampleXML());

    const app = new QuizApp({ elements, parser, autoInit: false });

    // Wire engine + tracker manually (mirrors what init() does after fetch)
    app.engine = new QuizEngine(examData);
    app.categories = examData.metadata.categories || {};
    // Use a no-op tracker to avoid localStorage in integration tests
    app.tracker = { save: vi.fn(), load: () => null, clear: vi.fn(), saveResults: vi.fn() };

    return { app, elements, examData };
}

// ---------------------------------------------------------------------------
// Integration: full quiz flow
// ---------------------------------------------------------------------------

describe('QuizApp integration', () => {
    let app, elements, examData;

    beforeEach(() => {
        ({ app, elements, examData } = createWiredApp());
    });

    it('startQuiz renders the first question into the DOM', () => {
        app.startQuiz();

        expect(elements.questionCard.hidden).toBe(false);
        expect(elements.navigation.hidden).toBe(false);
        expect(elements.qNum.textContent).toBe('1');
        expect(elements.questionTitle.textContent).toBe('Sample Question 1');
        expect(elements.totalNum.textContent).toBe('3');
    });

    it('renders four choices for the first question', () => {
        app.startQuiz();

        const radios = elements.choicesFieldset.querySelectorAll('input[type="radio"]');
        expect(radios.length).toBe(4);

        const labels = elements.choicesFieldset.querySelectorAll('.choice-option');
        expect(labels.length).toBe(4);
    });

    it('submit button is disabled before an answer is selected', () => {
        app.startQuiz();
        expect(elements.submitAnswer.disabled).toBe(true);
    });

    it('selecting an answer enables the submit button', () => {
        app.startQuiz();

        // Simulate clicking the first choice label
        const label = elements.choicesFieldset.querySelector('.choice-option');
        label.click();

        expect(elements.submitAnswer.disabled).toBe(false);
    });

    it('submitting the correct answer shows correct feedback', () => {
        app.startQuiz();

        // Q1 correct answer is B — select it
        const radios = elements.choicesFieldset.querySelectorAll('input[type="radio"]');
        const labelB = radios[1].closest('label');
        labelB.click();

        elements.submitAnswer.click();

        expect(elements.feedbackSection.hidden).toBe(false);
        expect(elements.feedbackSection.className).toContain('correct');
        expect(elements.feedbackResult.textContent).toContain('Correct');
    });

    it('submitting an incorrect answer shows incorrect feedback with correct answer', () => {
        app.startQuiz();

        // Q1 correct answer is B — select A instead
        const labels = elements.choicesFieldset.querySelectorAll('.choice-option');
        labels[0].click(); // A

        elements.submitAnswer.click();

        expect(elements.feedbackSection.hidden).toBe(false);
        expect(elements.feedbackSection.className).toContain('incorrect');
        expect(elements.feedbackResult.textContent).toContain('Incorrect');
        expect(elements.feedbackResult.textContent).toContain('B');
    });

    it('submit button hides after submission', () => {
        app.startQuiz();

        const labels = elements.choicesFieldset.querySelectorAll('.choice-option');
        labels[0].click();
        elements.submitAnswer.click();

        expect(elements.submitAnswer.hidden).toBe(true);
    });

    it('score display updates after submitting a correct answer', () => {
        app.startQuiz();

        const radios = elements.choicesFieldset.querySelectorAll('input[type="radio"]');
        radios[1].closest('label').click(); // B — correct
        elements.submitAnswer.click();

        expect(elements.score.textContent).toBe('1');
        expect(elements.attempted.textContent).toBe('1');
    });

    it('navigateNext moves to the second question', () => {
        app.startQuiz();
        app.navigateNext();

        expect(elements.qNum.textContent).toBe('2');
        expect(elements.questionTitle.textContent).toBe('Sample Question 2');
    });

    it('navigatePrevious returns to the first question', () => {
        app.startQuiz();
        app.navigateNext();
        app.navigatePrevious();

        expect(elements.qNum.textContent).toBe('1');
        expect(elements.questionTitle.textContent).toBe('Sample Question 1');
    });

    it('prev button is disabled on the first question', () => {
        app.startQuiz();
        expect(elements.prevQuestion.disabled).toBe(true);
    });

    it('next button is disabled on the last question', () => {
        app.startQuiz();
        app.navigateNext();
        app.navigateNext(); // now on Q3 (last)

        expect(elements.nextQuestion.disabled).toBe(true);
    });

    it('category badge is populated from metadata categories', () => {
        app.startQuiz();
        // Q1 has categoryRef "cat1" → "Category One"
        expect(elements.questionCategory.textContent).toBe('Category One');
    });

    it('scenario section is visible when the question has a scenario', () => {
        app.startQuiz(); // Q1 has a scenario
        expect(elements.scenarioSection.hidden).toBe(false);
    });

    it('scenario section is hidden when the question has no scenario', () => {
        app.startQuiz();
        app.navigateNext(); // Q2 has no scenario
        expect(elements.scenarioSection.hidden).toBe(true);
    });

    it('hint buttons render and level-1 is enabled', () => {
        app.startQuiz();
        expect(elements.hintBtn1.disabled).toBe(false);
        expect(elements.hintBtn2.disabled).toBe(true);
    });

    it('clicking hint-1 reveals hint content', () => {
        app.startQuiz();
        elements.hintBtn1.click();

        const hints = elements.hintsContent.querySelectorAll('.hint');
        expect(hints.length).toBe(1);
        expect(hints[0].textContent).toContain('level 1 hint');
    });

    it('revealing hint-1 enables hint-2', () => {
        app.startQuiz();
        elements.hintBtn1.click();
        expect(elements.hintBtn2.disabled).toBe(false);
    });

    it('toggling hint-1 off hides its content', () => {
        app.startQuiz();
        elements.hintBtn1.click();
        elements.hintBtn1.click(); // toggle off

        const hints = elements.hintsContent.querySelectorAll('.hint');
        expect(hints.length).toBe(0);
    });

    it('toggle deselect: clicking same answer twice unselects it', () => {
        app.startQuiz();

        const label = elements.choicesFieldset.querySelector('.choice-option');
        label.click();
        expect(elements.submitAnswer.disabled).toBe(false);

        label.click(); // second click — unselect
        expect(elements.submitAnswer.disabled).toBe(true);
    });

    it('tracker.save is called after submitting an answer', () => {
        app.startQuiz();

        const labels = elements.choicesFieldset.querySelectorAll('.choice-option');
        labels[0].click();
        elements.submitAnswer.click();

        expect(app.tracker.save).toHaveBeenCalled();
    });

    it('full flow: answer all 3 questions and verify final score', () => {
        app.startQuiz();

        // Q1: select B (correct)
        let labels = elements.choicesFieldset.querySelectorAll('.choice-option');
        labels[1].click();
        elements.submitAnswer.click();

        // Q2: select A (correct)
        app.navigateNext();
        labels = elements.choicesFieldset.querySelectorAll('.choice-option');
        labels[0].click();
        elements.submitAnswer.click();

        // Q3: select D (correct)
        app.navigateNext();
        labels = elements.choicesFieldset.querySelectorAll('.choice-option');
        labels[3].click();
        elements.submitAnswer.click();

        expect(elements.score.textContent).toBe('3');
        expect(elements.attempted.textContent).toBe('3');
        expect(elements.percentComplete.textContent).toBe('100%');
        expect(elements.percentSuccess.textContent).toBe('100%');
    });

    it('answered question is rendered read-only when revisited', () => {
        app.startQuiz();

        // Answer Q1
        const labels = elements.choicesFieldset.querySelectorAll('.choice-option');
        labels[1].click();
        elements.submitAnswer.click();

        // Navigate away and back
        app.navigateNext();
        app.navigatePrevious();

        // Submit button should be hidden, choices disabled
        expect(elements.submitAnswer.hidden).toBe(true);
        const radios = elements.choicesFieldset.querySelectorAll('input[type="radio"]');
        radios.forEach(r => expect(r.disabled).toBe(true));
    });
});

// ---------------------------------------------------------------------------
// Integration: keyboard navigation
// ---------------------------------------------------------------------------

describe('Keyboard navigation', () => {
    let app, elements;

    beforeEach(() => {
        ({ app, elements } = createWiredApp());
        app.startQuiz();
    });

    it('ArrowRight navigates to the next question', () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        expect(elements.qNum.textContent).toBe('2');
    });

    it('ArrowLeft navigates to the previous question', () => {
        app.navigateNext(); // go to Q2
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        expect(elements.qNum.textContent).toBe('1');
    });

    it('ArrowLeft on first question does nothing', () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        expect(elements.qNum.textContent).toBe('1');
    });

    it('ArrowRight on last question does nothing', () => {
        app.navigateNext();
        app.navigateNext(); // Q3
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        expect(elements.qNum.textContent).toBe('3');
    });

    it('other keys do not navigate', () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
        expect(elements.qNum.textContent).toBe('1');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(elements.qNum.textContent).toBe('1');
    });
});
