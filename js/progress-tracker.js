/**
 * Progress Tracker Module
 * Persists quiz progress to localStorage
 */

export class ProgressTracker {
    constructor(examCode) {
        this.storageKey = `cert-quiz-${examCode}`;
    }

    save(quizEngine) {
        const state = {
            ...quizEngine.getState(),
            lastSaved: new Date().toISOString()
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return null;

            const state = JSON.parse(saved);
            if (!state || typeof state !== 'object') return null;

            // Handle hintsRevealed - ensure it's an array of valid pairs before mapping
            let hintsRevealed = new Map();
            if (Array.isArray(state.hintsRevealed)) {
                try {
                    hintsRevealed = new Map(
                        state.hintsRevealed
                            .filter(item => Array.isArray(item) && item.length === 2)
                            .map(([id, arr]) => [id, new Set(Array.isArray(arr) ? arr : [])])
                    );
                } catch (e) {
                    console.warn('Error parsing hintsRevealed, using empty Map');
                    hintsRevealed = new Map();
                }
            }

            // Handle answers - ensure it's an array of valid pairs
            let answers = new Map();
            if (Array.isArray(state.answers)) {
                try {
                    answers = new Map(
                        state.answers.filter(item => Array.isArray(item) && item.length === 2)
                    );
                } catch (e) {
                    console.warn('Error parsing answers, using empty Map');
                    answers = new Map();
                }
            }

            return {
                currentIndex: typeof state.currentIndex === 'number' ? state.currentIndex : 0,
                answers: answers,
                hintsRevealed: hintsRevealed,
                lastSaved: state.lastSaved
            };
        } catch (e) {
            console.error('Failed to load saved progress:', e);
            return null;
        }
    }

    clear() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (e) {
            console.error('Failed to clear progress:', e);
        }
    }

    saveResults(results) {
        const historyKey = `${this.storageKey}-history`;
        try {
            const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            history.push(results);
            // Keep last 10 results
            while (history.length > 10) history.shift();
            localStorage.setItem(historyKey, JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save results:', e);
        }
    }

    getHistory() {
        const historyKey = `${this.storageKey}-history`;
        try {
            return JSON.parse(localStorage.getItem(historyKey) || '[]');
        } catch (e) {
            console.error('Failed to get history:', e);
            return [];
        }
    }
}
