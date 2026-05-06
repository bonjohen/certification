/**
 * ExamLoader Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ExamLoader } from '../../js/exam-loader.js';

describe('ExamLoader', () => {
    let loader;

    const fixturesDir = join(process.cwd(), 'tests', 'fixtures');

    const getSampleJSON = () => {
        return JSON.parse(readFileSync(join(fixturesDir, 'sample-exam.json'), 'utf-8'));
    };

    const getSchema = () => {
        return JSON.parse(
            readFileSync(join(process.cwd(), 'data', 'schema', 'certification.schema.json'), 'utf-8')
        );
    };

    beforeEach(() => {
        loader = new ExamLoader();
        vi.restoreAllMocks();
    });

    describe('loadExam', () => {
        it('should load and return a valid exam', async () => {
            const sampleData = getSampleJSON();
            const schema = getSchema();

            // Mock fetch: first call returns exam JSON, second returns schema
            const fetchMock = vi.fn()
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(sampleData),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(schema),
                });
            vi.stubGlobal('fetch', fetchMock);

            const exam = await loader.loadExam('data/test/test-001.json');

            expect(exam).toHaveProperty('metadata');
            expect(exam).toHaveProperty('questions');
            expect(exam).toHaveProperty('glossary');
            expect(exam.metadata.examCode).toBe('TEST-001');
            expect(exam.questions).toHaveLength(3);
        });

        it('should return the same shape as XMLParser output', async () => {
            const sampleData = getSampleJSON();
            const schema = getSchema();

            const fetchMock = vi.fn()
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(sampleData) })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(schema) });
            vi.stubGlobal('fetch', fetchMock);

            const exam = await loader.loadExam('data/test/test-001.json');

            // Metadata shape
            expect(exam.metadata).toHaveProperty('examCode');
            expect(exam.metadata).toHaveProperty('examTitle');
            expect(exam.metadata).toHaveProperty('provider');
            expect(exam.metadata).toHaveProperty('categories');
            expect(typeof exam.metadata.totalQuestions).toBe('number');

            // Question shape
            const q = exam.questions[0];
            expect(q).toHaveProperty('id');
            expect(q).toHaveProperty('categoryRef');
            expect(q).toHaveProperty('difficulty');
            expect(q).toHaveProperty('choices');
            expect(q).toHaveProperty('correctAnswer');
            expect(q).toHaveProperty('hints');
            expect(q).toHaveProperty('tags');

            // Choice shape
            expect(q.choices[0]).toHaveProperty('letter');
            expect(q.choices[0]).toHaveProperty('text');

            // Hint shape
            expect(q.hints[0]).toHaveProperty('level');
            expect(q.hints[0]).toHaveProperty('label');
            expect(q.hints[0]).toHaveProperty('content');
        });

        it('should cache the schema after first load', async () => {
            const sampleData = getSampleJSON();
            const schema = getSchema();

            const fetchMock = vi.fn()
                // First loadExam: exam + schema
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(sampleData) })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(schema) })
                // Second loadExam: exam only (schema cached)
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(sampleData) });
            vi.stubGlobal('fetch', fetchMock);

            await loader.loadExam('data/test/test-001.json');
            await loader.loadExam('data/test/test-001.json');

            // 3 fetches total: exam, schema, exam (no second schema fetch)
            expect(fetchMock).toHaveBeenCalledTimes(3);
        });
    });

    describe('error handling', () => {
        it('should throw on HTTP error', async () => {
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            }));

            await expect(loader.loadExam('data/missing.json'))
                .rejects.toThrow('Failed to load exam: 404 Not Found');
        });

        it('should throw on invalid JSON', async () => {
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.reject(new SyntaxError('Unexpected token')),
            }));

            await expect(loader.loadExam('data/bad.json'))
                .rejects.toThrow('Invalid JSON in exam file');
        });

        it('should throw on schema validation failure', async () => {
            const invalidData = {
                version: '1.0',
                metadata: {
                    examCode: 'BAD-001',
                    // missing required fields
                },
                questions: [],
                glossary: {},
            };
            const schema = getSchema();

            const fetchMock = vi.fn()
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(invalidData) })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(schema) });
            vi.stubGlobal('fetch', fetchMock);

            await expect(loader.loadExam('data/test/bad.json'))
                .rejects.toThrow('Schema validation failed');
        });

        it('should catch missing required metadata fields', async () => {
            const missingTitle = getSampleJSON();
            delete missingTitle.metadata.examTitle;
            const schema = getSchema();

            const fetchMock = vi.fn()
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(missingTitle) })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(schema) });
            vi.stubGlobal('fetch', fetchMock);

            await expect(loader.loadExam('data/test/bad.json'))
                .rejects.toThrow('Schema validation failed');
        });

        it('should catch wrong difficulty enum value', async () => {
            const badDifficulty = getSampleJSON();
            badDifficulty.questions[0].difficulty = 'extreme';
            const schema = getSchema();

            const fetchMock = vi.fn()
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(badDifficulty) })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(schema) });
            vi.stubGlobal('fetch', fetchMock);

            await expect(loader.loadExam('data/test/bad.json'))
                .rejects.toThrow('Schema validation failed');
        });

        it('should catch wrong number of choices', async () => {
            const badChoices = getSampleJSON();
            badChoices.questions[0].choices = [
                { letter: 'A', text: 'Only one' },
            ];
            const schema = getSchema();

            const fetchMock = vi.fn()
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(badChoices) })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(schema) });
            vi.stubGlobal('fetch', fetchMock);

            await expect(loader.loadExam('data/test/bad.json'))
                .rejects.toThrow('Schema validation failed');
        });

        it('should degrade gracefully when schema cannot be loaded', async () => {
            const sampleData = getSampleJSON();

            const fetchMock = vi.fn()
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(sampleData) })
                .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });
            vi.stubGlobal('fetch', fetchMock);

            // Should still load the exam — schema validation is defense-in-depth
            const exam = await loader.loadExam('data/test/test-001.json');
            expect(exam.metadata.examCode).toBe('TEST-001');
        });
    });
});
