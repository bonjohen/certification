/**
 * ResultsApp Unit Tests (F-02)
 * Tests for results-app.js: utility functions and ResultsApp class
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../setup.js';

// Mock dependencies before importing results-app
vi.mock('../../js/exam-loader.js', () => ({
    ExamLoader: vi.fn().mockImplementation(() => ({
        loadExam: vi.fn()
    }))
}));

vi.mock('../../js/quiz-engine.js', () => ({
    QuizEngine: vi.fn().mockImplementation(() => ({
        restoreState: vi.fn(),
        exportResults: vi.fn()
    }))
}));

vi.mock('../../js/progress-tracker.js', () => ({
    ProgressTracker: vi.fn().mockImplementation(() => ({
        load: vi.fn(),
        clear: vi.fn()
    }))
}));

vi.mock('../../js/app.js', () => ({
    getProviderFromExam: vi.fn(() => 'azure'),
    sanitizeHTML: vi.fn((html) => html || '')
}));

import { ExamLoader } from '../../js/exam-loader.js';
import { QuizEngine } from '../../js/quiz-engine.js';
import { ProgressTracker } from '../../js/progress-tracker.js';
import { getProviderFromExam } from '../../js/app.js';

// jsdom doesn't provide URL.createObjectURL/revokeObjectURL
if (!URL.createObjectURL) {
    URL.createObjectURL = vi.fn(() => 'blob:mock');
}
if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = vi.fn();
}

// Build DOM scaffold with all element IDs that ResultsApp expects
function buildResultsDOM() {
    document.body.innerHTML = `
        <a id="back-link" href="#"></a>
        <a id="back-to-quiz-btn" href="#"></a>
        <div id="loading"></div>
        <div id="error" hidden>
            <span id="error-text"></span>
            <a id="error-back-link" href="#"></a>
        </div>
        <div id="results-content" hidden>
            <span id="exam-code"></span>
            <span id="exam-title"></span>
            <div id="results-banner" style="">
                <span id="banner-provider"></span>
                <span id="banner-exam"></span>
                <span id="banner-score"></span>
                <span id="banner-timestamp"></span>
            </div>
            <span id="stat-total"></span>
            <span id="stat-correct"></span>
            <span id="stat-incorrect"></span>
            <span id="stat-unanswered"></span>
            <span id="stat-hints-l1"></span>
            <span id="stat-hints-l2"></span>
            <span id="stat-hints-l3"></span>
            <table>
                <tbody id="category-tbody"></tbody>
                <tfoot id="category-tfoot"></tfoot>
            </table>
            <div id="difficulty-cards"></div>
            <div id="timeline"></div>
            <div id="detail-list" hidden></div>
            <button id="print-btn"></button>
            <button id="export-btn"></button>
            <button id="footer-export-btn"></button>
            <button id="toggle-details">Show Details</button>
            <div id="filter-bar" hidden>
                <button class="filter-btn" data-filter="all">All</button>
                <button class="filter-btn" data-filter="correct">Correct</button>
                <button class="filter-btn" data-filter="incorrect">Incorrect</button>
                <button class="filter-btn" data-filter="unanswered">Unanswered</button>
                <button class="filter-btn" data-filter="hints">Hints Used</button>
            </div>
            <select id="sort-select">
                <option value="number">Number</option>
                <option value="time">Time</option>
                <option value="category">Category</option>
            </select>
            <a id="footer-provider-link" href="#"></a>
            <a id="footer-new-attempt" href="#"></a>
        </div>
    `;
}

// Sample results data that mirrors QuizEngine.exportResults() output
function createSampleResults() {
    return {
        examCode: 'az-900',
        examTitle: 'Azure Fundamentals',
        provider: 'Microsoft Azure',
        totalQuestions: 3,
        attempted: 2,
        score: 1,
        percentage: 50,
        timestamp: '2025-06-01T18:00:00.000Z',
        categories: { cat1: 'Cloud Concepts', cat2: 'Security' },
        details: [
            {
                questionId: 1,
                questionTitle: 'What is cloud?',
                categoryRef: 'cat1',
                difficulty: 'basic',
                selected: 'A',
                correctAnswer: 'A',
                isCorrect: true,
                hintsUsed: [1],
                displayedAt: '2025-06-01T17:50:00.000Z',
                answeredAt: '2025-06-01T17:51:00.000Z',
                hintTimestamps: { 1: '2025-06-01T17:50:30.000Z' }
            },
            {
                questionId: 2,
                questionTitle: 'What is security?',
                categoryRef: 'cat2',
                difficulty: 'intermediate',
                selected: 'B',
                correctAnswer: 'C',
                isCorrect: false,
                hintsUsed: [1, 2],
                displayedAt: '2025-06-01T17:52:00.000Z',
                answeredAt: '2025-06-01T17:54:00.000Z',
                hintTimestamps: { 1: '2025-06-01T17:52:30.000Z', 2: '2025-06-01T17:53:00.000Z' }
            },
            {
                questionId: 3,
                questionTitle: 'Unanswered question',
                categoryRef: 'cat1',
                difficulty: 'advanced',
                selected: null,
                correctAnswer: 'D',
                isCorrect: null,
                hintsUsed: [],
                displayedAt: '2025-06-01T17:55:00.000Z',
                answeredAt: null,
                hintTimestamps: {}
            }
        ]
    };
}

// Standard mock setup: configures ExamLoader, QuizEngine, ProgressTracker
// so that ResultsApp.init() succeeds and renders
function setupSuccessfulInit(results = createSampleResults(), provider = 'azure') {
    getProviderFromExam.mockReturnValue(provider);

    const mockLoader = { loadExam: vi.fn().mockResolvedValue({
        metadata: { examCode: results.examCode, examTitle: results.examTitle },
        questions: results.details.map(d => ({ id: d.questionId }))
    })};
    ExamLoader.mockImplementation(() => mockLoader);

    const mockEngine = {
        restoreState: vi.fn(),
        exportResults: vi.fn().mockReturnValue(results)
    };
    QuizEngine.mockImplementation(() => mockEngine);

    const mockTracker = {
        load: vi.fn().mockReturnValue({
            answers: new Map([[1, { selected: 'A' }]]),
            currentIndex: 0
        }),
        clear: vi.fn()
    };
    ProgressTracker.mockImplementation(() => mockTracker);

    return { mockLoader, mockEngine, mockTracker };
}

describe('ResultsApp', () => {
    // Import lazily to avoid auto-init at module load time.
    // The module's auto-init checks for document.getElementById('results-content'),
    // which won't exist at import time since we haven't called buildResultsDOM() yet.
    let ResultsApp;

    beforeEach(async () => {
        // Import once — the auto-init guard runs at import time but
        // results-content doesn't exist yet so it's a no-op.
        const mod = await import('../../js/results-app.js');
        ResultsApp = mod.ResultsApp;

        // NOW set up the DOM
        buildResultsDOM();
        Object.defineProperty(window, 'location', {
            value: { search: '?exam=az-900', href: '' },
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('init - no exam param', () => {
        it('should show error when no exam is specified', async () => {
            window.location.search = '';
            // Construct directly — constructor calls init()
            const app = new ResultsApp();
            // init is async, wait for DOM update
            await vi.waitFor(() => {
                expect(document.getElementById('loading').hidden).toBe(true);
            });
            expect(document.getElementById('error').hidden).toBe(false);
            expect(document.getElementById('error-text').textContent).toContain('No exam specified');
        });
    });

    describe('init - successful render', () => {
        it('should render results when exam data and saved state exist', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('loading').hidden).toBe(true);
            });

            expect(document.getElementById('results-content').hidden).toBe(false);
            expect(document.getElementById('exam-code').textContent).toBe('az-900');
            expect(document.getElementById('exam-title').textContent).toBe('Azure Fundamentals');

            // Banner
            expect(document.getElementById('banner-provider').textContent).toBe('Azure');
            expect(document.getElementById('banner-score').textContent).toBe('1/3 (50%)');

            // Summary stats
            expect(document.getElementById('stat-total').textContent).toBe('3');
            expect(document.getElementById('stat-correct').textContent).toBe('1');
            expect(document.getElementById('stat-incorrect').textContent).toBe('1');
            expect(document.getElementById('stat-unanswered').textContent).toBe('1');
            expect(document.getElementById('stat-hints-l1').textContent).toBe('2');
            expect(document.getElementById('stat-hints-l2').textContent).toBe('1');
            expect(document.getElementById('stat-hints-l3').textContent).toBe('0');
        });

        it('should set provider color as CSS custom property', async () => {
            setupSuccessfulInit(createSampleResults(), 'aws');
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            expect(document.documentElement.style.getPropertyValue('--p-current')).toBe('#FF9900');
        });

        it('should set back links correctly', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            expect(document.getElementById('back-link').href).toContain('azure.html');
            expect(document.getElementById('back-to-quiz-btn').href).toContain('quiz.html?exam=az-900');
        });

        it('should use default color for unknown provider', async () => {
            setupSuccessfulInit(createSampleResults(), 'unknownprovider');
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            expect(document.documentElement.style.getPropertyValue('--p-current')).toBe('#0078d4');
            expect(document.getElementById('back-link').href).toContain('index.html');
        });
    });

    describe('init - error cases', () => {
        it('should show error when no saved progress exists', async () => {
            getProviderFromExam.mockReturnValue('azure');
            ExamLoader.mockImplementation(() => ({
                loadExam: vi.fn().mockResolvedValue({
                    metadata: { examCode: 'az-900', examTitle: 'Test' },
                    questions: [{ id: 1 }]
                })
            }));
            QuizEngine.mockImplementation(() => ({
                restoreState: vi.fn(),
                exportResults: vi.fn()
            }));
            ProgressTracker.mockImplementation(() => ({
                load: vi.fn().mockReturnValue(null),
                clear: vi.fn()
            }));

            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('error').hidden).toBe(false);
            });

            expect(document.getElementById('error-text').textContent).toContain('No saved progress');
        });

        it('should show error when saved answers map is empty', async () => {
            getProviderFromExam.mockReturnValue('azure');
            ExamLoader.mockImplementation(() => ({
                loadExam: vi.fn().mockResolvedValue({
                    metadata: { examCode: 'az-900', examTitle: 'Test' },
                    questions: [{ id: 1 }]
                })
            }));
            QuizEngine.mockImplementation(() => ({
                restoreState: vi.fn(),
                exportResults: vi.fn()
            }));
            ProgressTracker.mockImplementation(() => ({
                load: vi.fn().mockReturnValue({ answers: new Map(), currentIndex: 0 }),
                clear: vi.fn()
            }));

            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('error').hidden).toBe(false);
            });

            expect(document.getElementById('error-text').textContent).toContain('No saved progress');
        });

        it('should show error when loader throws', async () => {
            getProviderFromExam.mockReturnValue('azure');
            ExamLoader.mockImplementation(() => ({
                loadExam: vi.fn().mockRejectedValue(new Error('Network error'))
            }));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('error').hidden).toBe(false);
            });

            expect(document.getElementById('error-text').textContent).toContain('Network error');
            consoleSpy.mockRestore();
        });
    });

    describe('renderCategoryTable', () => {
        it('should sort categories by score ascending (weakest first)', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const rows = document.querySelectorAll('#category-tbody tr');
            expect(rows.length).toBe(2);
            // cat2/Security = 0% (weakest), cat1/Cloud Concepts = 100%
            expect(rows[0].querySelector('td').textContent).toBe('Security');
            expect(rows[1].querySelector('td').textContent).toBe('Cloud Concepts');
        });

        it('should render footer totals', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const tfoot = document.getElementById('category-tfoot');
            expect(tfoot.innerHTML).toContain('Total');
            expect(tfoot.innerHTML).toContain('3');
        });

        it('should apply score-high/mid/low classes based on percentage', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const rows = document.querySelectorAll('#category-tbody tr');
            // Security: 0% -> score-low
            expect(rows[0].querySelector('.score-low')).not.toBeNull();
            // Cloud Concepts: 100% -> score-high
            expect(rows[1].querySelector('.score-high')).not.toBeNull();
        });
    });

    describe('renderDifficultyBreakdown', () => {
        it('should render difficulty cards for each level present', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const cards = document.querySelectorAll('.difficulty-card');
            expect(cards.length).toBe(3); // basic, intermediate, advanced
            expect(cards[0].classList.contains('difficulty-basic')).toBe(true);
            expect(cards[1].classList.contains('difficulty-intermediate')).toBe(true);
            expect(cards[2].classList.contains('difficulty-advanced')).toBe(true);
        });

        it('should skip difficulty levels with no questions', async () => {
            const results = createSampleResults();
            // Remove the advanced question
            results.details = results.details.filter(d => d.difficulty !== 'advanced');
            results.totalQuestions = 2;

            setupSuccessfulInit(results);
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const cards = document.querySelectorAll('.difficulty-card');
            expect(cards.length).toBe(2);
        });
    });

    describe('renderTimeline', () => {
        it('should render start, finish, and duration', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const timeline = document.getElementById('timeline');
            expect(timeline.innerHTML).toContain('Started');
            expect(timeline.innerHTML).toContain('Finished');
            expect(timeline.innerHTML).toContain('Duration');
            // Duration from 17:50 to 17:54 = 4m 0s
            expect(timeline.innerHTML).toContain('4m');
        });

        it('should show hours when duration > 1h', async () => {
            const results = createSampleResults();
            results.details = [{
                questionId: 1, questionTitle: 'Q1', categoryRef: 'cat1',
                difficulty: 'basic', selected: 'A', correctAnswer: 'A',
                isCorrect: true, hintsUsed: [], hintTimestamps: {},
                displayedAt: '2025-06-01T10:00:00.000Z',
                answeredAt: '2025-06-01T11:30:45.000Z'
            }];
            results.totalQuestions = 1;
            results.score = 1;
            results.categories = { cat1: 'Test' };

            setupSuccessfulInit(results);
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            expect(document.getElementById('timeline').innerHTML).toContain('1h 30m 45s');
        });

        it('should show seconds only for short duration', async () => {
            const results = createSampleResults();
            results.details = [{
                questionId: 1, questionTitle: 'Q1', categoryRef: 'cat1',
                difficulty: 'basic', selected: 'A', correctAnswer: 'A',
                isCorrect: true, hintsUsed: [], hintTimestamps: {},
                displayedAt: '2025-06-01T10:00:00.000Z',
                answeredAt: '2025-06-01T10:00:15.000Z'
            }];
            results.totalQuestions = 1;
            results.score = 1;
            results.categories = { cat1: 'Test' };

            setupSuccessfulInit(results);
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            expect(document.getElementById('timeline').innerHTML).toContain('15s');
        });

        it('should show -- when no timestamps exist', async () => {
            const results = createSampleResults();
            results.details = [{
                questionId: 1, questionTitle: 'Q1', categoryRef: 'cat1',
                difficulty: 'basic', selected: null, correctAnswer: 'A',
                isCorrect: null, hintsUsed: [], hintTimestamps: {},
                displayedAt: null, answeredAt: null
            }];
            results.totalQuestions = 1;
            results.score = 0;
            results.categories = { cat1: 'Test' };

            setupSuccessfulInit(results);
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const dashes = document.getElementById('timeline').innerHTML.match(/--/g);
            expect(dashes.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('renderQuestionDetails', () => {
        it('should render detail items for each question', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const details = document.querySelectorAll('.detail-question');
            expect(details.length).toBe(3);

            expect(details[0].classList.contains('correct')).toBe(true);
            expect(details[0].dataset.filter).toBe('correct');

            expect(details[1].classList.contains('incorrect')).toBe(true);
            expect(details[1].dataset.filter).toBe('incorrect');

            expect(details[2].classList.contains('unanswered')).toBe(true);
            expect(details[2].dataset.filter).toBe('unanswered');
        });

        it('should mark questions with hints', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const details = document.querySelectorAll('.detail-question');
            expect(details[0].dataset.hints).toBe('true');  // Q1 has hints
            expect(details[1].dataset.hints).toBe('true');  // Q2 has hints
            expect(details[2].dataset.hints).toBe('false'); // Q3 no hints
        });

        it('should include hint timestamps in detail body', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const details = document.querySelectorAll('.detail-question');
            // Q2 has 2 hint levels
            expect(details[1].innerHTML).toContain('Level 1');
            expect(details[1].innerHTML).toContain('Level 2');
        });

        it('should not show answeredAt/TTA for unanswered questions', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            const details = document.querySelectorAll('.detail-question');
            // Unanswered (Q3) should show "Unanswered" and not have "Answered At" row
            expect(details[2].innerHTML).toContain('Unanswered');
            expect(details[2].innerHTML).not.toContain('Answered At');
        });
    });

    describe('setupEventListeners', () => {
        async function initApp() {
            setupSuccessfulInit();
            const app = new ResultsApp();
            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });
            return app;
        }

        it('should toggle details visibility', async () => {
            await initApp();

            const toggleBtn = document.getElementById('toggle-details');
            const detailList = document.getElementById('detail-list');

            // Initially hidden
            expect(detailList.hidden).toBe(true);

            toggleBtn.click();
            expect(detailList.hidden).toBe(false);
            expect(toggleBtn.textContent).toBe('Hide Details');

            toggleBtn.click();
            expect(detailList.hidden).toBe(true);
            expect(toggleBtn.textContent).toBe('Show Details');
        });

        it('should filter questions by correct/incorrect/unanswered', async () => {
            await initApp();

            document.getElementById('toggle-details').click();

            const filterBtns = document.querySelectorAll('.filter-btn');
            const details = document.querySelectorAll('.detail-question');

            // Click "correct" filter
            filterBtns[1].click();
            expect(details[0].hidden).toBe(false); // correct
            expect(details[1].hidden).toBe(true);  // incorrect
            expect(details[2].hidden).toBe(true);  // unanswered

            // Click "all" filter
            filterBtns[0].click();
            expect(details[0].hidden).toBe(false);
            expect(details[1].hidden).toBe(false);
            expect(details[2].hidden).toBe(false);
        });

        it('should filter by hints used', async () => {
            await initApp();

            document.getElementById('toggle-details').click();

            const hintsBtn = document.querySelector('.filter-btn[data-filter="hints"]');
            const details = document.querySelectorAll('.detail-question');

            hintsBtn.click();
            expect(details[0].hidden).toBe(false); // has hints
            expect(details[1].hidden).toBe(false); // has hints
            expect(details[2].hidden).toBe(true);  // no hints
        });

        it('should sort questions by number, time, and category', async () => {
            await initApp();

            const sortSelect = document.getElementById('sort-select');
            const detailList = document.getElementById('detail-list');

            // Sort by category
            sortSelect.value = 'category';
            sortSelect.dispatchEvent(new Event('change'));

            const afterCatSort = detailList.querySelectorAll('.detail-question');
            expect(afterCatSort[0].dataset.category).toBe('cat1');
            expect(afterCatSort[2].dataset.category).toBe('cat2');

            // Sort back by number
            sortSelect.value = 'number';
            sortSelect.dispatchEvent(new Event('change'));

            const afterNumSort = detailList.querySelectorAll('.detail-question');
            expect(afterNumSort[0].dataset.questionId).toBe('1');
            expect(afterNumSort[1].dataset.questionId).toBe('2');
            expect(afterNumSort[2].dataset.questionId).toBe('3');
        });

        it('should set footer links', async () => {
            await initApp();

            const providerLink = document.getElementById('footer-provider-link');
            expect(providerLink.href).toContain('azure.html');
            expect(providerLink.textContent).toContain('Azure');

            const newAttempt = document.getElementById('footer-new-attempt');
            expect(newAttempt.href).toContain('quiz.html?exam=az-900');
        });

        it('should call print on print button click', async () => {
            await initApp();

            const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
            document.getElementById('print-btn').click();
            expect(printSpy).toHaveBeenCalled();
            printSpy.mockRestore();
        });

        it('should create and trigger download on export click', async () => {
            await initApp();

            const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
            const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
            const clickSpy = vi.fn();
            const origCreateElement = document.createElement.bind(document);
            vi.spyOn(document, 'createElement').mockImplementation((tag) => {
                const el = origCreateElement(tag);
                if (tag === 'a') el.click = clickSpy;
                return el;
            });

            document.getElementById('export-btn').click();

            expect(createObjectURLSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalled();
            expect(revokeObjectURLSpy).toHaveBeenCalled();

            createObjectURLSpy.mockRestore();
            revokeObjectURLSpy.mockRestore();
        });

        it('should also export from footer export button', async () => {
            await initApp();

            const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
            const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
            const clickSpy = vi.fn();
            const origCreateElement = document.createElement.bind(document);
            vi.spyOn(document, 'createElement').mockImplementation((tag) => {
                const el = origCreateElement(tag);
                if (tag === 'a') el.click = clickSpy;
                return el;
            });

            document.getElementById('footer-export-btn').click();

            expect(createObjectURLSpy).toHaveBeenCalled();
            expect(clickSpy).toHaveBeenCalled();

            createObjectURLSpy.mockRestore();
            revokeObjectURLSpy.mockRestore();
        });

        it('should clear progress and redirect on new attempt click', async () => {
            await initApp();

            const newAttempt = document.getElementById('footer-new-attempt');

            // The click handler calls e.preventDefault() and tracker.clear()
            // then sets window.location.href
            const mockClear = vi.fn();
            ProgressTracker.mockImplementation(() => ({
                load: vi.fn(),
                clear: mockClear
            }));

            const event = new Event('click', { cancelable: true });
            newAttempt.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(true);
            expect(mockClear).toHaveBeenCalled();
        });
    });

    describe('renderSummary edge cases', () => {
        it('should count all hint levels correctly', async () => {
            const results = createSampleResults();
            // Add L3 hints to Q1
            results.details[0].hintsUsed = [1, 2, 3];

            setupSuccessfulInit(results);
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            expect(document.getElementById('stat-hints-l1').textContent).toBe('2'); // Q1 + Q2
            expect(document.getElementById('stat-hints-l2').textContent).toBe('2'); // Q1 + Q2
            expect(document.getElementById('stat-hints-l3').textContent).toBe('1'); // Q1 only
        });

        it('should handle details with no hintsUsed field', async () => {
            const results = createSampleResults();
            // Remove hintsUsed from Q1
            delete results.details[0].hintsUsed;

            setupSuccessfulInit(results);
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            // Should not throw, hint counts should still work
            expect(document.getElementById('stat-hints-l1').textContent).toBe('1'); // only Q2
        });
    });

    describe('document title', () => {
        it('should set document title with exam code and provider', async () => {
            setupSuccessfulInit();
            const app = new ResultsApp();

            await vi.waitFor(() => {
                expect(document.getElementById('results-content').hidden).toBe(false);
            });

            expect(document.title).toContain('az-900');
            expect(document.title).toContain('Azure');
        });
    });
});
