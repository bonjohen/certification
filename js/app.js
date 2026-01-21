/**
 * Main Application Entry Point
 * Certification Exam Quiz Application
 */

import { XMLParser } from './xml-parser.js';
import { QuizEngine } from './quiz-engine.js';
import { ProgressTracker } from './progress-tracker.js';

class QuizApp {
    constructor() {
        this.parser = new XMLParser();
        this.engine = null;
        this.tracker = null;
        this.categories = {};

        this.elements = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorText: document.getElementById('error-text'),
            errorBackLink: document.getElementById('error-back-link'),
            questionCard: document.getElementById('question-card'),
            navigation: document.getElementById('navigation'),
            backLink: document.getElementById('back-link'),
            examCode: document.getElementById('exam-code'),
            examTitle: document.getElementById('exam-title'),
            currentNum: document.getElementById('current-num'),
            totalNum: document.getElementById('total-num'),
            score: document.getElementById('score'),
            attempted: document.getElementById('attempted'),
            percentComplete: document.getElementById('percent-complete'),
            percentSuccess: document.getElementById('percent-success'),
            qNum: document.getElementById('q-num'),
            questionTitle: document.getElementById('question-title'),
            questionCategory: document.getElementById('question-category'),
            scenarioSection: document.getElementById('scenario-section'),
            scenarioText: document.getElementById('scenario-text'),
            questionContent: document.getElementById('question-content'),
            choicesFieldset: document.getElementById('choices-fieldset'),
            submitAnswer: document.getElementById('submit-answer'),
            feedbackSection: document.getElementById('feedback-section'),
            feedbackResult: document.getElementById('feedback-result'),
            hintsSection: document.getElementById('hints-section'),
            hintsContent: document.getElementById('hints-content'),
            hintBtn1: document.getElementById('hint-btn-1'),
            hintBtn2: document.getElementById('hint-btn-2'),
            hintBtn3: document.getElementById('hint-btn-3'),
            prevQuestion: document.getElementById('prev-question'),
            nextQuestion: document.getElementById('next-question')
        };

        this.selectedAnswer = null; // Track currently selected answer for toggle behavior

        this.init();
    }

    async init() {
        const examId = this.getExamIdFromUrl();

        // Set back links early based on exam ID (before loading exam data)
        this.setBackLinks(examId);

        if (!examId) {
            this.showError('No exam specified. Please select an exam from the home page.');
            return;
        }

        try {
            const examPath = `data/${examId}/exam.xml`;
            const examData = await this.parser.loadExam(examPath);

            this.categories = examData.metadata.categories || {};
            this.engine = new QuizEngine(examData);
            this.tracker = new ProgressTracker(examData.metadata.examCode);

            // Check for saved progress
            let savedState = null;
            try {
                savedState = this.tracker.load();
            } catch (loadErr) {
                console.warn('Error loading saved state, starting fresh:', loadErr);
                this.tracker.clear();
            }

            if (savedState && savedState.answers && savedState.answers.size > 0) {
                this.showContinuePrompt(savedState);
                return;
            }

            this.startQuiz();
        } catch (err) {
            console.error('Failed to load exam:', err);
            this.showError(`Failed to load exam: ${err.message}`);
        }
    }

    showContinuePrompt(savedState) {
        this.elements.loading.hidden = true;

        const answered = savedState.answers.size;
        const total = this.engine.totalQuestions;
        let correct = 0;
        savedState.answers.forEach(answer => {
            if (answer.isCorrect) correct++;
        });

        const promptHtml = `
            <div class="continue-prompt">
                <h2>Continue Previous Session?</h2>
                <p>You have a saved session for this exam:</p>
                <div class="saved-progress-stats">
                    <div class="stat">
                        <span class="stat-value">${answered}/${total}</span>
                        <span class="stat-label">Questions Answered</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${correct}/${answered}</span>
                        <span class="stat-label">Correct</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${answered > 0 ? Math.round((correct / answered) * 100) : 0}%</span>
                        <span class="stat-label">Success Rate</span>
                    </div>
                </div>
                <div class="prompt-buttons">
                    <button id="continue-yes" class="btn btn-primary">Continue Session</button>
                    <button id="continue-no" class="btn btn-secondary">Start Fresh</button>
                </div>
            </div>
        `;

        // Create prompt container
        const promptContainer = document.createElement('div');
        promptContainer.id = 'continue-prompt-container';
        promptContainer.innerHTML = promptHtml;
        this.elements.questionCard.parentElement.appendChild(promptContainer);

        // Add event listeners
        document.getElementById('continue-yes').addEventListener('click', () => {
            this.engine.restoreState(savedState);
            promptContainer.remove();
            this.startQuiz();
        });

        document.getElementById('continue-no').addEventListener('click', () => {
            this.tracker.clear();
            promptContainer.remove();
            this.startQuiz();
        });
    }

    startQuiz() {
        this.setupEventListeners();
        this.updateHeader();
        this.renderQuestion();
        this.showQuiz();
    }

    getExamIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('exam');
    }

    setBackLinks(examId) {
        const provider = this.getProviderFromExam(examId, null);
        const providerPages = {
            azure: 'azure.html',
            aws: 'aws.html',
            gcp: 'gcp.html'
        };
        const backUrl = providerPages[provider] || 'index.html';

        if (this.elements.backLink) {
            this.elements.backLink.href = backUrl;
        }
        if (this.elements.errorBackLink) {
            this.elements.errorBackLink.href = backUrl;
        }
    }

    showError(message) {
        this.elements.loading.hidden = true;
        this.elements.error.hidden = false;
        this.elements.errorText.textContent = message;
    }

    showQuiz() {
        this.elements.loading.hidden = true;
        this.elements.questionCard.hidden = false;
        this.elements.navigation.hidden = false;
        this.elements.hintsSection.hidden = false;
    }

    updateHeader() {
        const meta = this.engine.exam.metadata;
        this.elements.examCode.textContent = meta.examCode;
        this.elements.examTitle.textContent = meta.examTitle;
        this.elements.totalNum.textContent = this.engine.totalQuestions;

        // Determine provider from exam code or metadata
        const examId = this.getExamIdFromUrl();
        const provider = this.getProviderFromExam(examId, meta.provider);
        const providerPages = {
            azure: 'azure.html',
            aws: 'aws.html',
            gcp: 'gcp.html'
        };
        const providerNames = {
            azure: 'Azure',
            aws: 'AWS',
            gcp: 'Google Cloud'
        };

        this.elements.backLink.href = providerPages[provider] || 'index.html';
        document.title = `${meta.examCode} Quiz - ${providerNames[provider] || 'Cloud'} Certification Study`;
    }

    getProviderFromExam(examId, metaProvider) {
        // Check metadata provider first
        if (metaProvider) {
            const p = metaProvider.toLowerCase();
            if (p.includes('azure') || p.includes('microsoft')) return 'azure';
            if (p.includes('aws') || p.includes('amazon')) return 'aws';
            if (p.includes('gcp') || p.includes('google')) return 'gcp';
        }

        // Fall back to exam ID prefix detection
        if (examId) {
            const id = examId.toLowerCase();
            // Azure exams: az-*, dp-*, ai-*
            if (id.startsWith('az-') || id.startsWith('dp-') || id.startsWith('ai-')) return 'azure';
            // AWS exams: clf-*, saa-*, dva-*, soa-*, dea-*, mla-*, aif-*
            if (id.startsWith('clf-') || id.startsWith('saa-') || id.startsWith('dva-') ||
                id.startsWith('soa-') || id.startsWith('dea-') || id.startsWith('mla-') ||
                id.startsWith('aif-')) return 'aws';
            // GCP exams: gcp-*
            if (id.startsWith('gcp-')) return 'gcp';
        }

        return 'azure'; // Default fallback
    }

    setupEventListeners() {
        this.elements.submitAnswer.addEventListener('click', () => this.submitAnswer());
        this.elements.prevQuestion.addEventListener('click', () => this.navigatePrevious());
        this.elements.nextQuestion.addEventListener('click', () => this.navigateNext());

        this.elements.hintBtn1.addEventListener('click', () => this.toggleHint(1));
        this.elements.hintBtn2.addEventListener('click', () => this.toggleHint(2));
        this.elements.hintBtn3.addEventListener('click', () => this.toggleHint(3));

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigatePrevious();
            if (e.key === 'ArrowRight') this.navigateNext();
        });
    }

    renderQuestion() {
        const question = this.engine.currentQuestion;
        const answer = this.engine.getAnswer(question.id);
        const isAnswered = this.engine.hasAnswered(question.id);

        // Update question info
        this.elements.currentNum.textContent = this.engine.currentQuestionNumber;
        this.elements.qNum.textContent = this.engine.currentQuestionNumber;
        this.elements.questionTitle.textContent = question.title;

        // Category
        const categoryName = this.categories[question.categoryRef] || question.categoryRef || '';
        this.elements.questionCategory.textContent = categoryName;

        // Scenario
        if (question.scenario) {
            this.elements.scenarioSection.hidden = false;
            this.elements.scenarioText.innerHTML = question.scenario;
        } else {
            this.elements.scenarioSection.hidden = true;
        }

        // Question text
        this.elements.questionContent.innerHTML = question.questionText;

        // Choices
        this.renderChoices(question, answer, isAnswered);

        // Submit button
        this.elements.submitAnswer.disabled = true;
        this.elements.submitAnswer.hidden = isAnswered;

        // Feedback
        if (isAnswered) {
            this.showFeedback(answer);
        } else {
            this.elements.feedbackSection.hidden = true;
        }

        // Hints
        this.renderHintButtons(question.id);
        this.renderHintContent(question);

        // Navigation
        this.updateNavigationButtons();
        this.updateScoreDisplay();

        // Reset selected answer tracker for new question
        this.selectedAnswer = null;
    }

    renderChoices(question, answer, isAnswered) {
        this.elements.choicesFieldset.innerHTML = '';

        question.choices.forEach(choice => {
            const label = document.createElement('label');
            label.className = 'choice-option';

            if (isAnswered) {
                label.classList.add('disabled');
                if (choice.letter === question.correctAnswer) {
                    label.classList.add('correct');
                } else if (choice.letter === answer?.selected) {
                    label.classList.add('incorrect');
                }
            }

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'answer';
            input.value = choice.letter;
            input.disabled = isAnswered;

            if (answer?.selected === choice.letter) {
                input.checked = true;
                label.classList.add('selected');
                this.selectedAnswer = choice.letter;
            }

            // Handle click for toggle behavior (second click unselects)
            label.addEventListener('click', (e) => {
                if (isAnswered) return;

                // Prevent default to handle radio manually
                e.preventDefault();

                if (this.selectedAnswer === choice.letter) {
                    // Second click on same answer - unselect it
                    input.checked = false;
                    label.classList.remove('selected');
                    this.selectedAnswer = null;
                    this.elements.submitAnswer.disabled = true;
                } else {
                    // First click or different answer - select it
                    // Uncheck all radios and remove selected class
                    this.elements.choicesFieldset.querySelectorAll('input[type="radio"]').forEach(r => {
                        r.checked = false;
                    });
                    this.elements.choicesFieldset.querySelectorAll('.choice-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    // Select this one
                    input.checked = true;
                    label.classList.add('selected');
                    this.selectedAnswer = choice.letter;
                    this.elements.submitAnswer.disabled = false;
                }
            });

            const letterSpan = document.createElement('span');
            letterSpan.className = 'choice-letter';
            letterSpan.textContent = choice.letter;

            const textSpan = document.createElement('span');
            textSpan.className = 'choice-text';
            textSpan.textContent = choice.text;

            label.appendChild(input);
            label.appendChild(letterSpan);
            label.appendChild(textSpan);

            this.elements.choicesFieldset.appendChild(label);
        });
    }

    submitAnswer() {
        const selected = this.elements.choicesFieldset.querySelector('input:checked');
        if (!selected) return;

        const result = this.engine.submitAnswer(selected.value);
        this.tracker.save(this.engine);

        // Update UI
        const answer = this.engine.getAnswer(this.engine.currentQuestion.id);
        this.renderChoices(this.engine.currentQuestion, answer, true);
        this.elements.submitAnswer.hidden = true;
        this.showFeedback(answer);
        this.updateScoreDisplay();
    }

    showFeedback(answer) {
        this.elements.feedbackSection.hidden = false;
        this.elements.feedbackSection.className = 'feedback ' + (answer.isCorrect ? 'correct' : 'incorrect');

        const icon = answer.isCorrect ? '✓' : '✗';
        const text = answer.isCorrect
            ? 'Correct!'
            : `Incorrect. The correct answer is ${this.engine.currentQuestion.correctAnswer}.`;

        this.elements.feedbackResult.innerHTML = `
            <span class="feedback-icon">${icon}</span>
            <span class="feedback-text">${text}</span>
        `;
    }

    renderHintButtons(questionId) {
        [1, 2, 3].forEach(level => {
            const btn = this.elements[`hintBtn${level}`];
            const isRevealed = this.engine.isHintRevealed(questionId, level);
            const canReveal = this.engine.canRevealHint(questionId, level);

            btn.classList.toggle('revealed', isRevealed);
            // Enable if revealed (to allow closing) or if can reveal
            btn.disabled = !isRevealed && !canReveal;
        });
    }

    renderHintContent(question) {
        this.elements.hintsContent.innerHTML = '';

        question.hints.forEach(hint => {
            if (this.engine.isHintRevealed(question.id, hint.level)) {
                const div = document.createElement('div');
                div.className = 'hint';
                div.dataset.level = hint.level;

                div.innerHTML = `
                    <div class="hint-label">${hint.label}</div>
                    <div class="hint-content">${hint.content}</div>
                `;

                this.elements.hintsContent.appendChild(div);
            }
        });
    }

    toggleHint(level) {
        const questionId = this.engine.currentQuestion.id;
        const isRevealed = this.engine.isHintRevealed(questionId, level);

        // If not revealed, check if we can reveal it
        if (!isRevealed && !this.engine.canRevealHint(questionId, level)) {
            return;
        }

        this.engine.toggleHint(questionId, level);
        this.tracker.save(this.engine);

        this.renderHintButtons(questionId);
        this.renderHintContent(this.engine.currentQuestion);
    }

    navigatePrevious() {
        if (this.engine.previous()) {
            this.renderQuestion();
        }
    }

    navigateNext() {
        if (this.engine.next()) {
            this.renderQuestion();
        }
    }

    navigateTo(index) {
        if (this.engine.navigateTo(index)) {
            this.renderQuestion();
        }
    }

    updateNavigationButtons() {
        this.elements.prevQuestion.disabled = this.engine.currentIndex === 0;
        this.elements.nextQuestion.disabled = this.engine.currentIndex === this.engine.totalQuestions - 1;
    }

    updateScoreDisplay() {
        this.elements.score.textContent = this.engine.score;
        this.elements.attempted.textContent = this.engine.attemptedCount;

        // Calculate percentages
        const total = this.engine.totalQuestions;
        const attempted = this.engine.attemptedCount;
        const score = this.engine.score;

        const percentComplete = total > 0 ? Math.round((attempted / total) * 100) : 0;
        const percentSuccess = attempted > 0 ? Math.round((score / attempted) * 100) : 0;

        this.elements.percentComplete.textContent = `${percentComplete}%`;
        this.elements.percentSuccess.textContent = `${percentSuccess}%`;
    }

}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new QuizApp());
} else {
    new QuizApp();
}
