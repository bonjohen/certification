/**
 * ProgressTracker Migration Logic Tests (F-05)
 * Tests for exportProgressFile (lines 133-150) and
 * importProgressFile (lines 152-170) in progress-tracker.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import '../setup.js';
import { ProgressTracker } from '../../js/progress-tracker.js';

// jsdom doesn't provide URL.createObjectURL/revokeObjectURL
if (!URL.createObjectURL) {
    URL.createObjectURL = vi.fn(() => 'blob:mock');
}
if (!URL.revokeObjectURL) {
    URL.revokeObjectURL = vi.fn();
}

// Helper to read Blob content (jsdom Blob lacks .text())
function readBlobAsText(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(blob);
    });
}

// Mock QuizEngine for testing
const createMockEngine = (state = {}) => ({
    getState: vi.fn(() => ({
        currentIndex: state.currentIndex ?? 0,
        answers: state.answers ?? [],
        hintsRevealed: state.hintsRevealed ?? [],
        questionDisplayed: state.questionDisplayed ?? [],
        hintTimestamps: state.hintTimestamps ?? [],
    })),
});

describe('ProgressTracker.exportProgressFile', () => {
    let tracker;

    beforeEach(() => {
        tracker = new ProgressTracker('TEST-001');
    });

    it('should create a Blob with JSON state and trigger download', () => {
        const mockEngine = createMockEngine({
            currentIndex: 3,
            answers: [[1, { selected: 'B', isCorrect: true }]],
            hintsRevealed: [[1, [1, 2]]],
        });

        const clickSpy = vi.fn();
        const origCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = origCreateElement(tag);
            if (tag === 'a') {
                el.click = clickSpy;
            }
            return el;
        });

        const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
        const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        tracker.exportProgressFile(mockEngine);

        // Should create object URL from a Blob
        expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
        const blobArg = createObjectURLSpy.mock.calls[0][0];
        expect(blobArg).toBeInstanceOf(Blob);
        expect(blobArg.type).toBe('application/json');

        // Should trigger download click
        expect(clickSpy).toHaveBeenCalledTimes(1);

        // Should revoke URL after download
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');

        createObjectURLSpy.mockRestore();
        revokeObjectURLSpy.mockRestore();
    });

    it('should include examCode derived from storageKey', async () => {
        const mockEngine = createMockEngine({ currentIndex: 0 });

        let capturedBlob;
        vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
            capturedBlob = blob;
            return 'blob:test';
        });
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        const clickSpy = vi.fn();
        const origCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = origCreateElement(tag);
            if (tag === 'a') el.click = clickSpy;
            return el;
        });

        tracker.exportProgressFile(mockEngine);

        // Read the Blob content
        const text = await readBlobAsText(capturedBlob);
        const parsed = JSON.parse(text);

        expect(parsed.examCode).toBe('TEST-001');
        expect(parsed.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(parsed.currentIndex).toBe(0);
    });

    it('should set download filename from exam code', () => {
        const mockEngine = createMockEngine();

        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        let anchorEl;
        const origCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = origCreateElement(tag);
            if (tag === 'a') {
                anchorEl = el;
                el.click = vi.fn();
            }
            return el;
        });

        tracker.exportProgressFile(mockEngine);

        expect(anchorEl.download).toBe('TEST-001-progress.json');
        expect(anchorEl.href).toContain('blob:test');
    });

    it('should include full engine state in export', async () => {
        const mockEngine = createMockEngine({
            currentIndex: 5,
            answers: [[1, { selected: 'A', isCorrect: true }], [2, { selected: 'C', isCorrect: false }]],
            hintsRevealed: [[1, [1, 2]], [2, [1]]],
            questionDisplayed: [[1, '2025-01-01T00:00:00Z']],
            hintTimestamps: [[1, [[1, '2025-01-01T00:01:00Z']]]],
        });

        let capturedBlob;
        vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
            capturedBlob = blob;
            return 'blob:test';
        });
        vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        const origCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = origCreateElement(tag);
            if (tag === 'a') el.click = vi.fn();
            return el;
        });

        tracker.exportProgressFile(mockEngine);

        const text = await readBlobAsText(capturedBlob);
        const parsed = JSON.parse(text);

        expect(parsed.currentIndex).toBe(5);
        expect(parsed.answers).toEqual([[1, { selected: 'A', isCorrect: true }], [2, { selected: 'C', isCorrect: false }]]);
        expect(parsed.hintsRevealed).toEqual([[1, [1, 2]], [2, [1]]]);
        expect(parsed.questionDisplayed).toEqual([[1, '2025-01-01T00:00:00Z']]);
        expect(parsed.hintTimestamps).toEqual([[1, [[1, '2025-01-01T00:01:00Z']]]]);
    });
});

describe('ProgressTracker.importProgressFile', () => {
    it('should resolve with parsed state from a valid progress file', async () => {
        const fileContent = JSON.stringify({
            examCode: 'TEST-001',
            currentIndex: 3,
            answers: [[1, { selected: 'B', isCorrect: true }]],
            hintsRevealed: [[1, [1]]],
        });

        const file = new File([fileContent], 'TEST-001-progress.json', { type: 'application/json' });

        const result = await ProgressTracker.importProgressFile(file);

        expect(result.examCode).toBe('TEST-001');
        expect(result.currentIndex).toBe(3);
        expect(result.answers).toEqual([[1, { selected: 'B', isCorrect: true }]]);
    });

    it('should reject with error for invalid JSON', async () => {
        const file = new File(['not valid json {{{'], 'bad.json', { type: 'application/json' });

        await expect(ProgressTracker.importProgressFile(file))
            .rejects.toThrow('Failed to parse progress file');
    });

    it('should reject when parsed state is null', async () => {
        const file = new File(['null'], 'null.json', { type: 'application/json' });

        await expect(ProgressTracker.importProgressFile(file))
            .rejects.toThrow('Invalid progress file format');
    });

    it('should reject when parsed state is not an object', async () => {
        const file = new File(['"just a string"'], 'string.json', { type: 'application/json' });

        await expect(ProgressTracker.importProgressFile(file))
            .rejects.toThrow('Invalid progress file format');
    });

    it('should reject when answers field is missing', async () => {
        const fileContent = JSON.stringify({
            examCode: 'TEST-001',
            currentIndex: 0,
            // no answers field
        });
        const file = new File([fileContent], 'no-answers.json', { type: 'application/json' });

        await expect(ProgressTracker.importProgressFile(file))
            .rejects.toThrow('Invalid progress file format');
    });

    it('should reject when answers is not an array', async () => {
        const fileContent = JSON.stringify({
            examCode: 'TEST-001',
            currentIndex: 0,
            answers: 'not-an-array',
        });
        const file = new File([fileContent], 'bad-answers.json', { type: 'application/json' });

        await expect(ProgressTracker.importProgressFile(file))
            .rejects.toThrow('Invalid progress file format');
    });

    it('should accept a file with empty answers array', async () => {
        const fileContent = JSON.stringify({
            examCode: 'TEST-001',
            currentIndex: 0,
            answers: [],
        });
        const file = new File([fileContent], 'empty.json', { type: 'application/json' });

        const result = await ProgressTracker.importProgressFile(file);
        expect(result.answers).toEqual([]);
    });

    it('should handle file read errors', async () => {
        // Create a mock file that will trigger onerror
        const file = new File(['content'], 'test.json');

        // Override FileReader to simulate error
        const origFileReader = globalThis.FileReader;
        globalThis.FileReader = class MockFileReader {
            readAsText() {
                setTimeout(() => this.onerror(new Error('Read failed')), 0);
            }
        };

        await expect(ProgressTracker.importProgressFile(file))
            .rejects.toThrow('Failed to read file');

        globalThis.FileReader = origFileReader;
    });

    it('should preserve all fields from a complete progress file', async () => {
        const state = {
            examCode: 'AZ-900',
            currentIndex: 10,
            answers: [[1, { selected: 'A', isCorrect: true }], [5, { selected: 'D', isCorrect: false }]],
            hintsRevealed: [[1, [1, 2, 3]]],
            questionDisplayed: [[1, '2025-03-01T12:00:00Z']],
            hintTimestamps: [[1, [[1, '2025-03-01T12:01:00Z'], [2, '2025-03-01T12:02:00Z']]]],
            exportedAt: '2025-03-01T12:30:00Z',
        };

        const file = new File([JSON.stringify(state)], 'AZ-900-progress.json');

        const result = await ProgressTracker.importProgressFile(file);

        expect(result.examCode).toBe('AZ-900');
        expect(result.currentIndex).toBe(10);
        expect(result.answers).toHaveLength(2);
        expect(result.hintsRevealed).toEqual([[1, [1, 2, 3]]]);
        expect(result.questionDisplayed).toEqual([[1, '2025-03-01T12:00:00Z']]);
        expect(result.hintTimestamps).toEqual([[1, [[1, '2025-03-01T12:01:00Z'], [2, '2025-03-01T12:02:00Z']]]]);
        expect(result.exportedAt).toBe('2025-03-01T12:30:00Z');
    });
});
