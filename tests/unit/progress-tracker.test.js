/**
 * ProgressTracker Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../setup.js';
import { ProgressTracker } from '../../js/progress-tracker.js';

// Mock QuizEngine for testing
const createMockEngine = (state = {}) => ({
    getState: vi.fn(() => ({
        currentIndex: state.currentIndex ?? 0,
        answers: state.answers ?? [],
        hintsRevealed: state.hintsRevealed ?? [],
    })),
});

describe('ProgressTracker', () => {
    let tracker;

    beforeEach(() => {
        tracker = new ProgressTracker('TEST-001');
        localStorage.clear();
    });

    describe('initialization', () => {
        it('should create storage key from exam code', () => {
            expect(tracker.storageKey).toBe('cert-quiz-TEST-001');
        });

        it('should handle different exam codes', () => {
            const azureTracker = new ProgressTracker('AZ-900');
            expect(azureTracker.storageKey).toBe('cert-quiz-AZ-900');
        });
    });

    describe('save', () => {
        it('should save quiz state to localStorage', () => {
            const mockEngine = createMockEngine({
                currentIndex: 5,
                answers: [[1, { selected: 'B', isCorrect: true }]],
                hintsRevealed: [[1, [1, 2]]],
            });

            tracker.save(mockEngine);

            expect(localStorage.setItem).toHaveBeenCalled();
            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData.currentIndex).toBe(5);
            expect(savedData.lastSaved).toBeDefined();
        });

        it('should include lastSaved timestamp', () => {
            const mockEngine = createMockEngine();
            tracker.save(mockEngine);

            const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedData.lastSaved).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        });

        it('should handle localStorage errors gracefully', () => {
            const mockEngine = createMockEngine();
            localStorage.setItem.mockImplementation(() => {
                throw new Error('QuotaExceeded');
            });

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Should not throw
            expect(() => tracker.save(mockEngine)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('load', () => {
        it('should return null when no saved data exists', () => {
            const result = tracker.load();
            expect(result).toBe(null);
        });

        it('should load and parse saved state', () => {
            const savedState = {
                currentIndex: 3,
                answers: [[1, { selected: 'A', isCorrect: false }]],
                hintsRevealed: [[1, [1]]],
                lastSaved: '2024-01-15T10:30:00.000Z',
            };
            localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

            const result = tracker.load();

            expect(result).not.toBe(null);
            expect(result.currentIndex).toBe(3);
            expect(result.lastSaved).toBe('2024-01-15T10:30:00.000Z');
        });

        it('should convert answers array to Map', () => {
            const savedState = {
                currentIndex: 0,
                answers: [[1, { selected: 'B' }], [2, { selected: 'A' }]],
                hintsRevealed: [],
            };
            localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

            const result = tracker.load();

            expect(result.answers).toBeInstanceOf(Map);
            expect(result.answers.size).toBe(2);
            expect(result.answers.get(1).selected).toBe('B');
        });

        it('should convert hintsRevealed to Map of Sets', () => {
            const savedState = {
                currentIndex: 0,
                answers: [],
                hintsRevealed: [[1, [1, 2]], [2, [1]]],
            };
            localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

            const result = tracker.load();

            expect(result.hintsRevealed).toBeInstanceOf(Map);
            expect(result.hintsRevealed.get(1)).toBeInstanceOf(Set);
            expect(result.hintsRevealed.get(1).has(1)).toBe(true);
            expect(result.hintsRevealed.get(1).has(2)).toBe(true);
        });

        it('should handle corrupted JSON gracefully', () => {
            localStorage.getItem.mockReturnValue('not valid json {{{');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const result = tracker.load();

            expect(result).toBe(null);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should handle null stored value', () => {
            localStorage.getItem.mockReturnValue(null);

            const result = tracker.load();
            expect(result).toBe(null);
        });

        it('should handle non-object stored value', () => {
            localStorage.getItem.mockReturnValue('"just a string"');

            const result = tracker.load();
            expect(result).toBe(null);
        });

        it('should handle malformed answers array', () => {
            const savedState = {
                currentIndex: 0,
                answers: ['not', 'valid', 'pairs'],
                hintsRevealed: [],
            };
            localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

            const result = tracker.load();

            expect(result.answers).toBeInstanceOf(Map);
            expect(result.answers.size).toBe(0);
        });

        it('should handle malformed hintsRevealed array', () => {
            const savedState = {
                currentIndex: 0,
                answers: [],
                hintsRevealed: ['invalid'],
            };
            localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

            const result = tracker.load();

            expect(result.hintsRevealed).toBeInstanceOf(Map);
            expect(result.hintsRevealed.size).toBe(0);
        });

        it('should default currentIndex to 0 if invalid', () => {
            const savedState = {
                currentIndex: 'not a number',
                answers: [],
                hintsRevealed: [],
            };
            localStorage.getItem.mockReturnValue(JSON.stringify(savedState));

            const result = tracker.load();

            expect(result.currentIndex).toBe(0);
        });
    });

    describe('clear', () => {
        it('should remove saved data from localStorage', () => {
            tracker.clear();
            expect(localStorage.removeItem).toHaveBeenCalledWith('cert-quiz-TEST-001');
        });

        it('should handle localStorage errors gracefully', () => {
            localStorage.removeItem.mockImplementation(() => {
                throw new Error('Storage error');
            });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => tracker.clear()).not.toThrow();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('saveResults', () => {
        it('should save results to history', () => {
            const results = {
                score: 8,
                total: 10,
                percentage: 80,
                timestamp: '2024-01-15T10:30:00.000Z',
            };

            tracker.saveResults(results);

            expect(localStorage.setItem).toHaveBeenCalled();
            const call = localStorage.setItem.mock.calls[0];
            expect(call[0]).toBe('cert-quiz-TEST-001-history');
            const savedHistory = JSON.parse(call[1]);
            expect(savedHistory).toHaveLength(1);
            expect(savedHistory[0].score).toBe(8);
        });

        it('should append to existing history', () => {
            const existingHistory = [{ score: 5, total: 10 }];
            localStorage.getItem.mockReturnValue(JSON.stringify(existingHistory));

            tracker.saveResults({ score: 8, total: 10 });

            const savedHistory = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedHistory).toHaveLength(2);
        });

        it('should limit history to 10 entries', () => {
            const existingHistory = Array(10).fill(null).map((_, i) => ({
                score: i,
                total: 10
            }));
            localStorage.getItem.mockReturnValue(JSON.stringify(existingHistory));

            tracker.saveResults({ score: 99, total: 100 });

            const savedHistory = JSON.parse(localStorage.setItem.mock.calls[0][1]);
            expect(savedHistory).toHaveLength(10);
            expect(savedHistory[0].score).toBe(1); // Oldest removed
            expect(savedHistory[9].score).toBe(99); // Newest added
        });

        it('should handle localStorage errors gracefully', () => {
            localStorage.setItem.mockImplementation(() => {
                throw new Error('Storage full');
            });
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => tracker.saveResults({ score: 5 })).not.toThrow();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('getHistory', () => {
        it('should return empty array when no history exists', () => {
            localStorage.getItem.mockReturnValue(null);

            const history = tracker.getHistory();
            expect(history).toEqual([]);
        });

        it('should return saved history', () => {
            const savedHistory = [
                { score: 8, total: 10 },
                { score: 9, total: 10 },
            ];
            localStorage.getItem.mockReturnValue(JSON.stringify(savedHistory));

            const history = tracker.getHistory();

            expect(history).toHaveLength(2);
            expect(history[0].score).toBe(8);
        });

        it('should handle corrupted history gracefully', () => {
            localStorage.getItem.mockReturnValue('invalid json');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const history = tracker.getHistory();

            expect(history).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });
});
