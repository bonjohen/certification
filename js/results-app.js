/**
 * Results Page Application
 * Renders exam results with category/difficulty breakdowns, timeline, and detail view
 */

import { ExamLoader } from './exam-loader.js';
import { QuizEngine } from './quiz-engine.js';
import { ProgressTracker } from './progress-tracker.js';
import { getProviderFromExam, sanitizeHTML } from './app.js';

function formatPST(isoString) {
    if (!isoString) return '--';
    return new Date(isoString).toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }) + ' PST';
}

function formatDuration(ms) {
    if (!ms || ms < 0) return '--';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
}

const providerColors = {
    azure: '#0078d4',
    aws: '#FF9900',
    gcp: '#4285F4',
    anthropic: '#D97757',
    comptia: '#C8232C',
    isc2: '#003366',
    github: '#333333',
    databricks: '#FF3621',
    nvidia: '#76B900',
    cisco: '#049FD9'
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

class ResultsApp {
    constructor() {
        this.results = null;
        this.provider = null;
        this.examId = null;
        this.detailsVisible = false;
        this.init();
    }

    async init() {
        const params = new URLSearchParams(window.location.search);
        this.examId = params.get('exam');

        if (!this.examId) {
            this.showError('No exam specified. Please select an exam from the home page.');
            return;
        }

        this.provider = getProviderFromExam(this.examId, null);
        document.documentElement.style.setProperty('--provider-color', providerColors[this.provider] || '#0078d4');

        // Set back links
        const backUrl = providerPages[this.provider] || 'index.html';
        document.getElementById('back-link').href = backUrl;
        document.getElementById('back-to-quiz-btn').href = `quiz.html?exam=${encodeURIComponent(this.examId)}`;

        try {
            // Load exam data and restore engine state
            const loader = new ExamLoader();
            const examPath = `data/${this.provider}/${this.examId}.json`;
            const examData = await loader.loadExam(examPath);

            const engine = new QuizEngine(examData);
            const tracker = new ProgressTracker(examData.metadata.examCode);
            const savedState = tracker.load();

            if (!savedState || !savedState.answers || savedState.answers.size === 0) {
                this.showError('No saved progress was found for this exam. Take the quiz first.');
                return;
            }

            engine.restoreState(savedState);
            this.results = engine.exportResults();

            this.render();
        } catch (err) {
            console.error('Failed to load results:', err);
            this.showError(`Failed to load results: ${err.message}`);
        }
    }

    showError(message) {
        document.getElementById('loading').hidden = true;
        document.getElementById('error').hidden = false;
        document.getElementById('error-text').textContent = message;
        const backUrl = providerPages[this.provider] || 'index.html';
        document.getElementById('error-back-link').href = backUrl;
    }

    render() {
        document.getElementById('loading').hidden = true;
        document.getElementById('results-content').hidden = false;

        document.title = `${this.results.examCode} Results - ${providerNames[this.provider] || ''} Study Guide`;
        document.getElementById('exam-code').textContent = this.results.examCode;
        document.getElementById('exam-title').textContent = this.results.examTitle;

        this.renderBanner();
        this.renderSummary();
        this.renderCategoryTable();
        this.renderDifficultyBreakdown();
        this.renderTimeline();
        this.renderQuestionDetails();
        this.setupEventListeners();
    }

    renderBanner() {
        const banner = document.getElementById('results-banner');
        banner.style.borderTopColor = providerColors[this.provider] || '#0078d4';

        document.getElementById('banner-provider').textContent = providerNames[this.provider] || this.provider;
        document.getElementById('banner-exam').textContent = `${this.results.examCode} - ${this.results.examTitle}`;
        document.getElementById('banner-score').textContent = `${this.results.score}/${this.results.totalQuestions} (${this.results.percentage}%)`;
        document.getElementById('banner-timestamp').textContent = `Completed: ${formatPST(this.results.timestamp)}`;
    }

    renderSummary() {
        const hintCounts = { 1: 0, 2: 0, 3: 0 };
        let answered = 0;
        let incorrect = 0;
        this.results.details.forEach(d => {
            if (d.selected !== null) {
                answered++;
                if (!d.isCorrect) incorrect++;
            }
            (d.hintsUsed || []).forEach(level => {
                if (hintCounts[level] !== undefined) hintCounts[level]++;
            });
        });
        const unanswered = this.results.totalQuestions - answered;

        document.getElementById('stat-total').textContent = this.results.totalQuestions;
        document.getElementById('stat-correct').textContent = this.results.score;
        document.getElementById('stat-incorrect').textContent = incorrect;
        document.getElementById('stat-unanswered').textContent = unanswered;
        document.getElementById('stat-hints-l1').textContent = hintCounts[1];
        document.getElementById('stat-hints-l2').textContent = hintCounts[2];
        document.getElementById('stat-hints-l3').textContent = hintCounts[3];
    }

    renderCategoryTable() {
        const categories = this.results.categories || {};
        const catStats = {};

        // Aggregate by category
        this.results.details.forEach(d => {
            const catId = d.categoryRef || 'unknown';
            if (!catStats[catId]) {
                catStats[catId] = { name: categories[catId] || catId, total: 0, correct: 0, incorrect: 0, unanswered: 0, h1: 0, h2: 0, h3: 0 };
            }
            catStats[catId].total++;
            if (d.selected === null) {
                catStats[catId].unanswered++;
            } else if (d.isCorrect) {
                catStats[catId].correct++;
            } else {
                catStats[catId].incorrect++;
            }
            (d.hintsUsed || []).forEach(level => {
                if (level === 1) catStats[catId].h1++;
                else if (level === 2) catStats[catId].h2++;
                else if (level === 3) catStats[catId].h3++;
            });
        });

        // Sort by score % ascending (weakest first), unanswered excluded from score calc
        const sorted = Object.values(catStats).sort((a, b) => {
            const answeredA = a.correct + a.incorrect;
            const answeredB = b.correct + b.incorrect;
            const pctA = answeredA > 0 ? a.correct / answeredA : 0;
            const pctB = answeredB > 0 ? b.correct / answeredB : 0;
            return pctA - pctB;
        });

        const tbody = document.getElementById('category-tbody');
        tbody.innerHTML = '';
        sorted.forEach(cat => {
            const answered = cat.correct + cat.incorrect;
            const pct = answered > 0 ? Math.round((cat.correct / answered) * 100) : 0;
            const scoreClass = pct >= 80 ? 'score-high' : pct >= 60 ? 'score-mid' : 'score-low';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sanitizeHTML(cat.name)}</td>
                <td>${cat.total}</td>
                <td>${cat.correct}</td>
                <td>${cat.incorrect}</td>
                <td>${cat.unanswered}</td>
                <td class="${scoreClass}">${pct}%</td>
                <td>${cat.h1}</td>
                <td>${cat.h2}</td>
                <td>${cat.h3}</td>
            `;
            tbody.appendChild(tr);
        });

        // Footer totals
        const totals = sorted.reduce((acc, c) => {
            acc.total += c.total; acc.correct += c.correct; acc.incorrect += c.incorrect;
            acc.unanswered += c.unanswered; acc.h1 += c.h1; acc.h2 += c.h2; acc.h3 += c.h3;
            return acc;
        }, { total: 0, correct: 0, incorrect: 0, unanswered: 0, h1: 0, h2: 0, h3: 0 });
        const totalAnswered = totals.correct + totals.incorrect;
        const totalPct = totalAnswered > 0 ? Math.round((totals.correct / totalAnswered) * 100) : 0;

        const tfoot = document.getElementById('category-tfoot');
        tfoot.innerHTML = `
            <tr>
                <td><strong>Total</strong></td>
                <td><strong>${totals.total}</strong></td>
                <td><strong>${totals.correct}</strong></td>
                <td><strong>${totals.incorrect}</strong></td>
                <td><strong>${totals.unanswered}</strong></td>
                <td><strong>${totalPct}%</strong></td>
                <td><strong>${totals.h1}</strong></td>
                <td><strong>${totals.h2}</strong></td>
                <td><strong>${totals.h3}</strong></td>
            </tr>
        `;
    }

    renderDifficultyBreakdown() {
        const diffStats = { basic: { correct: 0, total: 0 }, intermediate: { correct: 0, total: 0 }, advanced: { correct: 0, total: 0 } };

        this.results.details.forEach(d => {
            const diff = d.difficulty || 'intermediate';
            if (!diffStats[diff]) diffStats[diff] = { correct: 0, total: 0 };
            diffStats[diff].total++;
            if (d.isCorrect) diffStats[diff].correct++;
        });

        const container = document.getElementById('difficulty-cards');
        container.innerHTML = '';
        ['basic', 'intermediate', 'advanced'].forEach(level => {
            const s = diffStats[level];
            if (s.total === 0) return;
            const pct = Math.round((s.correct / s.total) * 100);
            const div = document.createElement('div');
            div.className = `difficulty-card difficulty-${level}`;
            div.innerHTML = `
                <span class="difficulty-label">${level.charAt(0).toUpperCase() + level.slice(1)}</span>
                <span class="difficulty-value">${s.correct}/${s.total}</span>
                <span class="difficulty-pct">${pct}%</span>
            `;
            container.appendChild(div);
        });
    }

    renderTimeline() {
        const displayed = this.results.details
            .map(d => d.displayedAt)
            .filter(Boolean)
            .map(t => new Date(t).getTime());
        const answered = this.results.details
            .map(d => d.answeredAt)
            .filter(Boolean)
            .map(t => new Date(t).getTime());

        const earliest = displayed.length > 0 ? Math.min(...displayed) : null;
        const latest = answered.length > 0 ? Math.max(...answered) : null;
        const duration = earliest && latest ? latest - earliest : null;

        const container = document.getElementById('timeline');
        container.innerHTML = `
            <div class="timeline-item">
                <span class="timeline-label">Started</span>
                <span class="timeline-value">${earliest ? formatPST(new Date(earliest).toISOString()) : '--'}</span>
            </div>
            <div class="timeline-item">
                <span class="timeline-label">Finished</span>
                <span class="timeline-value">${latest ? formatPST(new Date(latest).toISOString()) : '--'}</span>
            </div>
            <div class="timeline-item">
                <span class="timeline-label">Duration</span>
                <span class="timeline-value">${formatDuration(duration)}</span>
            </div>
        `;
    }

    renderQuestionDetails() {
        const categories = this.results.categories || {};
        const list = document.getElementById('detail-list');
        list.innerHTML = '';

        this.results.details.forEach(d => {
            const isUnanswered = d.selected === null;
            const displayedMs = d.displayedAt ? new Date(d.displayedAt).getTime() : null;
            const answeredMs = d.answeredAt ? new Date(d.answeredAt).getTime() : null;
            const ttaMs = displayedMs && answeredMs ? answeredMs - displayedMs : null;

            const hintLines = Object.entries(d.hintTimestamps || {})
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([level, ts]) => `Level ${level}: ${formatPST(ts)}`)
                .join('<br>');

            const catName = categories[d.categoryRef] || d.categoryRef || '';
            const statusClass = isUnanswered ? 'unanswered' : d.isCorrect ? 'correct' : 'incorrect';
            const statusIcon = isUnanswered ? '&#8212;' : d.isCorrect ? '&#10003;' : '&#10007;';
            const filterValue = isUnanswered ? 'unanswered' : d.isCorrect ? 'correct' : 'incorrect';
            const hasHints = d.hintsUsed && d.hintsUsed.length > 0;

            const div = document.createElement('div');
            div.className = `detail-question ${statusClass}`;
            div.dataset.filter = filterValue;
            div.dataset.hints = hasHints ? 'true' : 'false';
            div.dataset.questionId = d.questionId;
            div.dataset.category = d.categoryRef || '';
            div.dataset.tta = ttaMs || 0;

            div.innerHTML = `
                <div class="detail-q-header">
                    <span class="detail-status ${statusClass}">${statusIcon}</span>
                    <span class="detail-q-num">#${d.questionId}</span>
                    <span class="detail-q-title">${sanitizeHTML(d.questionTitle)}</span>
                    <span class="detail-badges">
                        <span class="badge-category">${sanitizeHTML(catName)}</span>
                        <span class="badge-difficulty badge-${d.difficulty || 'intermediate'}">${d.difficulty || 'intermediate'}</span>
                    </span>
                </div>
                <div class="detail-q-body">
                    <div class="detail-row">
                        <span class="detail-label">Your Answer</span>
                        <span class="detail-value">${isUnanswered ? 'Unanswered' : d.selected}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Correct Answer</span>
                        <span class="detail-value">${d.correctAnswer || '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Displayed At</span>
                        <span class="detail-value">${formatPST(d.displayedAt)}</span>
                    </div>
                    ${!isUnanswered ? `
                    <div class="detail-row">
                        <span class="detail-label">Answered At</span>
                        <span class="detail-value">${formatPST(d.answeredAt)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time to Answer</span>
                        <span class="detail-value">${formatDuration(ttaMs)}</span>
                    </div>
                    ` : ''}
                    ${hasHints ? `
                    <div class="detail-row">
                        <span class="detail-label">Hints</span>
                        <span class="detail-value">${hintLines}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            list.appendChild(div);
        });
    }

    setupEventListeners() {
        // Print
        document.getElementById('print-btn').addEventListener('click', () => window.print());

        // Export JSON
        const exportHandler = () => {
            const blob = new Blob([JSON.stringify(this.results, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.results.examCode}-results.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
        document.getElementById('export-btn').addEventListener('click', exportHandler);
        document.getElementById('footer-export-btn').addEventListener('click', exportHandler);

        // Toggle details
        const toggleBtn = document.getElementById('toggle-details');
        const detailList = document.getElementById('detail-list');
        const filterBar = document.getElementById('filter-bar');
        toggleBtn.addEventListener('click', () => {
            this.detailsVisible = !this.detailsVisible;
            detailList.hidden = !this.detailsVisible;
            filterBar.hidden = !this.detailsVisible;
            toggleBtn.textContent = this.detailsVisible ? 'Hide Details' : 'Show Details';
        });

        // Filter buttons
        filterBar.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                detailList.querySelectorAll('.detail-question').forEach(el => {
                    if (filter === 'all') {
                        el.hidden = false;
                    } else if (filter === 'hints') {
                        el.hidden = el.dataset.hints !== 'true';
                    } else {
                        el.hidden = el.dataset.filter !== filter;
                    }
                });
            });
        });

        // Sort select
        document.getElementById('sort-select').addEventListener('change', (e) => {
            const sortBy = e.target.value;
            const items = Array.from(detailList.querySelectorAll('.detail-question'));
            items.sort((a, b) => {
                if (sortBy === 'number') return Number(a.dataset.questionId) - Number(b.dataset.questionId);
                if (sortBy === 'time') return Number(a.dataset.tta) - Number(b.dataset.tta);
                if (sortBy === 'category') return (a.dataset.category || '').localeCompare(b.dataset.category || '');
                return 0;
            });
            items.forEach(item => detailList.appendChild(item));
        });

        // Footer links
        const providerPage = providerPages[this.provider] || 'index.html';
        document.getElementById('footer-provider-link').href = providerPage;
        document.getElementById('footer-provider-link').textContent = `Return to ${providerNames[this.provider] || ''} Exams`;

        document.getElementById('footer-new-attempt').href = `quiz.html?exam=${encodeURIComponent(this.examId)}`;
        document.getElementById('footer-new-attempt').addEventListener('click', (e) => {
            e.preventDefault();
            const tracker = new ProgressTracker(this.results.examCode);
            tracker.clear();
            window.location.href = `quiz.html?exam=${encodeURIComponent(this.examId)}`;
        });
    }
}

// Initialize when DOM is ready
if (typeof document !== 'undefined' && document.getElementById('results-content')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new ResultsApp());
    } else {
        new ResultsApp();
    }
}
