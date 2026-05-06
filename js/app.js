/**
 * Main Application Entry Point
 * Certification Exam Quiz Application
 */

import { XMLParser } from './xml-parser.js';
import { QuizEngine } from './quiz-engine.js';
import { ProgressTracker } from './progress-tracker.js';

/**
 * Detect provider key from exam ID prefix or metadata provider string.
 * Extracted as a standalone function so it can be imported by tests
 * without instantiating QuizApp (which requires the DOM).
 *
 * @param {string|null} examId   - e.g. "az-900", "cca-f"
 * @param {string|null} metaProvider - e.g. "Microsoft Azure", "Anthropic"
 * @returns {string} provider key: 'azure' | 'aws' | 'gcp' | 'anthropic'
 */
export function getProviderFromExam(examId, metaProvider) {
    // Check metadata provider first
    if (metaProvider) {
        const p = metaProvider.toLowerCase();
        if (p.includes('azure') || p.includes('microsoft')) return 'azure';
        if (p.includes('aws') || p.includes('amazon')) return 'aws';
        if (p.includes('gcp') || p.includes('google')) return 'gcp';
        if (p.includes('anthropic')) return 'anthropic';
        if (p.includes('comptia')) return 'comptia';
        if (p.includes('isc2') || p.includes('(isc)²')) return 'isc2';
        if (p.includes('github')) return 'github';
        if (p.includes('databricks')) return 'databricks';
        if (p.includes('nvidia')) return 'nvidia';
        if (p.includes('cisco')) return 'cisco';
    }

    // Fall back to exam ID prefix detection
    if (examId) {
        const id = examId.toLowerCase();
        // Azure exams: az-*, dp-*, ai-*, sc-*
        if (id.startsWith('az-') || id.startsWith('dp-') || id.startsWith('ai-') ||
            id.startsWith('sc-')) return 'azure';
        // AWS exams: clf-*, saa-*, sap-*, dva-*, soa-*, dea-*, mla-*, aif-*, aip-*
        if (id.startsWith('clf-') || id.startsWith('saa-') || id.startsWith('sap-') ||
            id.startsWith('dva-') || id.startsWith('soa-') || id.startsWith('dea-') ||
            id.startsWith('mla-') || id.startsWith('aif-') || id.startsWith('aip-')) return 'aws';
        // GCP exams: gcp-*, cloud-data-engineer, gen-ai-leader, pro-ml-eng
        if (id.startsWith('gcp-') || id === 'cloud-data-engineer' ||
            id === 'gen-ai-leader' || id === 'pro-ml-eng') return 'gcp';
        // Anthropic exams: cca-*
        if (id.startsWith('cca-')) return 'anthropic';
        // CompTIA exams: sy0-*, core1*, core2*, cas-*, cv0-*
        if (id.startsWith('sy0-') || id.startsWith('cas-') || id.startsWith('cv0-') ||
            id.startsWith('core') || id.startsWith('pt0-') || id.startsWith('cs0-')) return 'comptia';
        // ISC2 exams: cissp, ccsp, sscp, cap
        if (id === 'cissp' || id === 'ccsp' || id === 'sscp' || id === 'cap') return 'isc2';
        // GitHub exams: gh-*
        if (id.startsWith('gh-')) return 'github';
        // Databricks exams: db-*
        if (id.startsWith('db-')) return 'databricks';
        // NVIDIA exams: nv-*
        if (id.startsWith('nv-')) return 'nvidia';
        // Cisco exams: 810-*, aitech
        if (id.startsWith('810-') || id === 'aitech') return 'cisco';
    }

    return 'azure'; // Default fallback
}

/**
 * Sanitize an HTML string by removing dangerous elements and attributes.
 * Uses the DOM to parse and clean the markup — no external dependencies.
 *
 * @param {string} html - untrusted HTML (e.g. from XML question banks)
 * @returns {string} sanitized HTML safe for innerHTML assignment
 */
export function sanitizeHTML(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    // Remove dangerous elements
    div.querySelectorAll('script, style, iframe, object, embed, form').forEach(el => el.remove());
    // Remove event-handler attributes and javascript: hrefs from all elements
    div.querySelectorAll('*').forEach(el => {
        for (const attr of Array.from(el.attributes)) {
            if (attr.name.startsWith('on') ||
                (attr.name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:'))) {
                el.removeAttribute(attr.name);
            }
        }
    });
    return div.innerHTML;
}

export class QuizApp {
    /**
     * @param {object} [options]
     * @param {object} [options.elements] - Pre-built DOM element map (for testing)
     * @param {XMLParser} [options.parser] - Custom XML parser instance
     * @param {boolean} [options.autoInit=true] - Whether to call init() automatically
     */
    constructor(options = {}) {
        this.parser = options.parser || new XMLParser();
        this.engine = null;
        this.tracker = null;
        this.categories = {};

        this.elements = options.elements || {
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
            nextQuestion: document.getElementById('next-question'),
            correctAnswerDisplay: document.getElementById('correct-answer-display'),
            correctAnswerLetter: document.getElementById('correct-answer-letter'),
            certOrgLink: document.getElementById('cert-org-link')
        };

        this.selectedAnswer = null; // Track currently selected answer for toggle behavior
        this.quizActive = false; // True only after startQuiz() — guards keyboard nav

        if (options.autoInit !== false) {
            this.init();
        }
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
            const provider = this.getProviderFromExam(examId, null);
            const examPath = `data/${provider}/${examId}.xml`;
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
        this.quizActive = true;
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
            gcp: 'gcp.html',
            anthropic: 'anthropic.html',
            comptia: 'comptia.html',
            isc2: 'isc2.html',
            github: 'github.html',
            databricks: 'databricks.html',
            nvidia: 'nvidia.html',
            cisco: 'cisco.html'
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
            gcp: 'gcp.html',
            anthropic: 'anthropic.html',
            comptia: 'comptia.html',
            isc2: 'isc2.html',
            github: 'github.html',
            databricks: 'databricks.html',
            nvidia: 'nvidia.html',
            cisco: 'cisco.html'
        };
        const providerNames = {
            azure: 'Azure',
            aws: 'AWS',
            gcp: 'Google Cloud',
            anthropic: 'Anthropic',
            comptia: 'CompTIA',
            isc2: 'ISC2',
            github: 'GitHub',
            databricks: 'Databricks',
            nvidia: 'NVIDIA',
            cisco: 'Cisco'
        };

        const certOrgUrls = {
            aws: 'https://aws.amazon.com/certification/',
            azure: 'https://learn.microsoft.com/en-us/credentials/certifications/',
            gcp: 'https://cloud.google.com/learn/certification',
            comptia: 'https://www.comptia.org/certifications',
            isc2: 'https://www.isc2.org/certifications',
            github: 'https://docs.github.com/en/get-started/showcase-your-expertise-with-github-certifications',
            databricks: 'https://www.databricks.com/learn/certification',
            nvidia: 'https://academy.nvidia.com',
            cisco: 'https://www.cisco.com/site/us/en/learn/training-certifications/index.html'
        };

        // Per-exam URLs that point to the specific exam/cert page
        const examUrls = {
            // AWS
            'aip-c01': 'https://aws.amazon.com/certification/certified-ai-practitioner/',
            'clf-c02': 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
            'aif-c01': 'https://aws.amazon.com/certification/certified-ai-practitioner/',
            'saa-c03': 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
            'dva-c02': 'https://aws.amazon.com/certification/certified-developer-associate/',
            'soa-c02': 'https://aws.amazon.com/certification/certified-sysops-admin-associate/',
            'dea-c01': 'https://aws.amazon.com/certification/certified-data-engineer-associate/',
            'mla-c01': 'https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/',
            'sap-c02': 'https://aws.amazon.com/certification/certified-solutions-architect-professional/',
            // Azure
            'ai-102': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-102/',
            'ai-300': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-300/',
            'az-700': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-700/',
            'az-900': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-900/',
            'az-104': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-104/',
            'az-204': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-204/',
            'az-305': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-305/',
            'az-400': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-400/',
            'az-500': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/az-500/',
            'dp-900': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/dp-900/',
            'ai-900': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-900/',
            // GCP certifications
            'cloud-data-engineer': 'https://cloud.google.com/learn/certification/data-engineer',
            'pro-ml-eng': 'https://cloud.google.com/learn/certification/machine-learning-engineer',
            'gcp-pca': 'https://cloud.google.com/learn/certification/cloud-architect',
            // CompTIA
            'sy0-701': 'https://www.comptia.org/certifications/security',
            // ISC2
            'cissp': 'https://www.isc2.org/certifications/cissp',
            // AWS (new)
            'soa-c03': 'https://aws.amazon.com/certification/certified-sysops-admin-associate/',
            // Azure (new)
            'ai-901': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-901/',
            'ai-103': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/ai-103/',
            'ai-200': 'https://learn.microsoft.com/en-us/training/paths/deploy-cloud-native-applications-to-azure-container-apps/',
            'sc-500': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/sc-500/',
            // GitHub
            'gh-300': 'https://docs.github.com/en/get-started/showcase-your-expertise-with-github-certifications',
            // Databricks
            'db-genai': 'https://www.databricks.com/resources/learn/training/generative-ai-fundamentals',
            'db-ml': 'https://www.databricks.com/learn/certification/machine-learning-associate',
            // NVIDIA
            'nv-genai': 'https://academy.nvidia.com/en/course/generative-ai-llm-associate/',
            // Cisco
            '810-110': 'https://www.cisco.com/site/us/en/learn/training-certifications/certifications/ai-technical-practitioner/index.html'
        };

        this.elements.backLink.href = providerPages[provider] || 'index.html';
        document.title = `${meta.examCode} Quiz - ${providerNames[provider] || ''} Study Guide`;

        // Set certification link: prefer exam-specific URL, fall back to provider
        const certUrl = examUrls[examId] || certOrgUrls[provider];
        if (this.elements.certOrgLink && certUrl) {
            this.elements.certOrgLink.href = certUrl;
            this.elements.certOrgLink.textContent = `${providerNames[provider] || provider} Certifications`;
            this.elements.certOrgLink.hidden = false;
        }
    }

    getProviderFromExam(examId, metaProvider) {
        return getProviderFromExam(examId, metaProvider);
    }

    setupEventListeners() {
        this.elements.submitAnswer.addEventListener('click', () => this.submitAnswer());
        this.elements.prevQuestion.addEventListener('click', () => this.navigatePrevious());
        this.elements.nextQuestion.addEventListener('click', () => this.navigateNext());

        this.elements.hintBtn1.addEventListener('click', () => this.toggleHint(1));
        this.elements.hintBtn2.addEventListener('click', () => this.toggleHint(2));
        this.elements.hintBtn3.addEventListener('click', () => this.toggleHint(3));

        // Keyboard navigation — only when quiz is active
        document.addEventListener('keydown', (e) => {
            if (!this.quizActive) return;
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

        // Correct answer letter
        this.elements.correctAnswerLetter.textContent = question.correctAnswer;
        this.elements.correctAnswerDisplay.hidden = false;

        // Category
        const categoryName = this.categories[question.categoryRef] || question.categoryRef || '';
        this.elements.questionCategory.textContent = categoryName;

        // Scenario
        if (question.scenario) {
            this.elements.scenarioSection.hidden = false;
            this.elements.scenarioText.innerHTML = sanitizeHTML(question.scenario);
        } else {
            this.elements.scenarioSection.hidden = true;
        }

        // Question text
        this.elements.questionContent.innerHTML = sanitizeHTML(question.questionText);

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
            : `Incorrect. The correct answer is ${sanitizeHTML(this.engine.currentQuestion.correctAnswer)}.`;

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
                    <div class="hint-label">${sanitizeHTML(hint.label)}</div>
                    <div class="hint-content">${sanitizeHTML(hint.content)}</div>
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

// Initialize app when DOM is ready.
// Guard: only auto-init when the quiz page DOM is present (avoids errors
// when this module is imported solely for its exported utility functions,
// e.g. in unit tests running under jsdom).
if (typeof document !== 'undefined' && document.getElementById('question-card')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new QuizApp());
    } else {
        new QuizApp();
    }
}
