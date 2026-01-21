/**
 * XMLParser Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { XMLParser } from '../../js/xml-parser.js';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('XMLParser', () => {
    let parser;

    beforeEach(() => {
        parser = new XMLParser();
    });

    // Helper to get sample XML
    const getSampleXML = () => {
        return readFileSync(
            join(process.cwd(), 'tests', 'fixtures', 'sample-exam.xml'),
            'utf-8'
        );
    };

    describe('parseExam', () => {
        it('should parse complete exam structure', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);

            expect(exam).toHaveProperty('metadata');
            expect(exam).toHaveProperty('questions');
            expect(exam).toHaveProperty('glossary');
        });

        it('should throw error for invalid XML', () => {
            const invalidXml = '<exam><metadata></exam>';

            expect(() => parser.parseExam(invalidXml)).toThrow('XML parsing error');
        });

        it('should throw error for missing metadata', () => {
            const noMetadataXml = '<?xml version="1.0"?><exam><questions></questions></exam>';

            expect(() => parser.parseExam(noMetadataXml)).toThrow('No metadata found');
        });
    });

    describe('parseMetadata', () => {
        it('should extract all metadata fields', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const meta = exam.metadata;

            expect(meta.examCode).toBe('TEST-001');
            expect(meta.examTitle).toBe('Sample Test Exam');
            expect(meta.provider).toBe('Test Provider');
            expect(meta.description).toBe('A sample exam for unit testing');
            expect(meta.totalQuestions).toBe(3);
            expect(meta.createdDate).toBe('2024-01-01');
            expect(meta.lastModified).toBe('2024-01-15');
        });

        it('should parse categories correctly', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const categories = exam.metadata.categories;

            expect(categories.cat1).toBe('Category One');
            expect(categories.cat2).toBe('Category Two');
        });

        it('should handle missing optional fields', () => {
            const minimalXml = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>MIN-001</exam-code>
                        <exam-title>Minimal Exam</exam-title>
                    </metadata>
                    <questions></questions>
                </exam>`;

            const exam = parser.parseExam(minimalXml);
            expect(exam.metadata.examCode).toBe('MIN-001');
            expect(exam.metadata.provider).toBe('');
            expect(exam.metadata.totalQuestions).toBe(0);
        });
    });

    describe('parseQuestions', () => {
        it('should parse all questions', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);

            expect(exam.questions).toHaveLength(3);
        });

        it('should extract question attributes', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const q1 = exam.questions[0];

            expect(q1.id).toBe(1);
            expect(q1.categoryRef).toBe('cat1');
            expect(q1.difficulty).toBe('beginner');
            expect(q1.title).toBe('Sample Question 1');
        });

        it('should parse scenario HTML', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const q1 = exam.questions[0];

            expect(q1.scenario).toContain('<p>');
            expect(q1.scenario).toContain('test environment');
        });

        it('should handle questions without scenarios', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const q2 = exam.questions[1];

            expect(q2.scenario).toBe('');
        });

        it('should extract correct answer', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);

            expect(exam.questions[0].correctAnswer).toBe('B');
            expect(exam.questions[1].correctAnswer).toBe('A');
            expect(exam.questions[2].correctAnswer).toBe('D');
        });

        it('should parse tags', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const q1 = exam.questions[0];

            expect(q1.tags).toContain('testing');
            expect(q1.tags).toContain('sample');
        });
    });

    describe('parseChoices', () => {
        it('should parse choices with letter attribute', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const choices = exam.questions[0].choices;

            expect(choices).toHaveLength(4);
            expect(choices[0].letter).toBe('A');
            expect(choices[0].text).toBe('First option');
        });

        it('should sort choices by letter', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const choices = exam.questions[0].choices;

            const letters = choices.map(c => c.letter);
            expect(letters).toEqual(['A', 'B', 'C', 'D']);
        });

        it('should handle id attribute as fallback for letter', () => {
            const xmlWithId = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>ID-001</exam-code>
                        <exam-title>ID Test</exam-title>
                    </metadata>
                    <questions>
                        <question id="1">
                            <title>Test</title>
                            <question-text>Test?</question-text>
                            <choices>
                                <choice id="C">Option C</choice>
                                <choice id="A">Option A</choice>
                                <choice id="B">Option B</choice>
                            </choices>
                            <correct-answer>A</correct-answer>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithId);
            const choices = exam.questions[0].choices;

            expect(choices[0].letter).toBe('A');
            expect(choices[1].letter).toBe('B');
            expect(choices[2].letter).toBe('C');
        });

        it('should prefer letter attribute over id', () => {
            const xmlWithBoth = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>BOTH-001</exam-code>
                        <exam-title>Both Test</exam-title>
                    </metadata>
                    <questions>
                        <question id="1">
                            <title>Test</title>
                            <question-text>Test?</question-text>
                            <choices>
                                <choice letter="X" id="Y">Option</choice>
                            </choices>
                            <correct-answer>X</correct-answer>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithBoth);
            expect(exam.questions[0].choices[0].letter).toBe('X');
        });
    });

    describe('parseHints', () => {
        it('should parse all hints for a question', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const hints = exam.questions[0].hints;

            expect(hints).toHaveLength(3);
        });

        it('should extract hint level and label', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const hint = exam.questions[0].hints[0];

            expect(hint.level).toBe(1);
            expect(hint.label).toBe('Basic Hint');
        });

        it('should sort hints by level', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const hints = exam.questions[0].hints;

            expect(hints[0].level).toBe(1);
            expect(hints[1].level).toBe(2);
            expect(hints[2].level).toBe(3);
        });

        it('should parse hint content', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const hint = exam.questions[0].hints[0];

            expect(hint.content).toBe('This is a level 1 hint.');
        });

        it('should handle questions without hints', () => {
            const xmlWithoutHints = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>NO-HINTS</exam-code>
                        <exam-title>No Hints</exam-title>
                    </metadata>
                    <questions>
                        <question id="1">
                            <title>Test</title>
                            <question-text>Test?</question-text>
                            <choices>
                                <choice letter="A">A</choice>
                            </choices>
                            <correct-answer>A</correct-answer>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithoutHints);
            expect(exam.questions[0].hints).toEqual([]);
        });

        it('should default label if not provided', () => {
            const xmlWithDefaultLabel = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>DEF-001</exam-code>
                        <exam-title>Default Label</exam-title>
                    </metadata>
                    <questions>
                        <question id="1">
                            <title>Test</title>
                            <question-text>Test?</question-text>
                            <choices><choice letter="A">A</choice></choices>
                            <correct-answer>A</correct-answer>
                            <hints>
                                <hint level="2">
                                    <content>Content</content>
                                </hint>
                            </hints>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithDefaultLabel);
            expect(exam.questions[0].hints[0].label).toBe('Level 2');
        });

        it('should handle direct hint text without content element', () => {
            const xmlWithDirectHint = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>DIRECT-001</exam-code>
                        <exam-title>Direct Hint</exam-title>
                    </metadata>
                    <questions>
                        <question id="1">
                            <title>Test</title>
                            <question-text>Test?</question-text>
                            <choices><choice id="A">A</choice></choices>
                            <correct-answer>A</correct-answer>
                            <hints>
                                <hint level="1">This is direct hint content.</hint>
                            </hints>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithDirectHint);
            expect(exam.questions[0].hints[0].content).toBe('This is direct hint content.');
        });
    });

    describe('alternate XML formats', () => {
        it('should handle category-ref as child element', () => {
            const xmlWithElementCategoryRef = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>ELEM-001</exam-code>
                        <exam-title>Element Format</exam-title>
                    </metadata>
                    <questions>
                        <question id="1">
                            <category-ref>cat-test</category-ref>
                            <difficulty>advanced</difficulty>
                            <title>Test</title>
                            <question-text>Test?</question-text>
                            <choices><choice id="A">A</choice></choices>
                            <correct-answer>A</correct-answer>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithElementCategoryRef);
            expect(exam.questions[0].categoryRef).toBe('cat-test');
            expect(exam.questions[0].difficulty).toBe('advanced');
        });

        it('should prefer attribute over element for category-ref', () => {
            const xmlWithBothFormats = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>BOTH-001</exam-code>
                        <exam-title>Both Formats</exam-title>
                    </metadata>
                    <questions>
                        <question id="1" category-ref="from-attr" difficulty="basic">
                            <category-ref>from-element</category-ref>
                            <difficulty>advanced</difficulty>
                            <title>Test</title>
                            <question-text>Test?</question-text>
                            <choices><choice letter="A">A</choice></choices>
                            <correct-answer>A</correct-answer>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithBothFormats);
            // Attribute takes precedence
            expect(exam.questions[0].categoryRef).toBe('from-attr');
            expect(exam.questions[0].difficulty).toBe('basic');
        });
    });

    describe('parseGlossary', () => {
        it('should parse glossary terms', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);

            expect(exam.glossary).toHaveProperty('term1');
            expect(exam.glossary).toHaveProperty('term2');
        });

        it('should extract term details', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);
            const term = exam.glossary.term1;

            expect(term.id).toBe('term1');
            expect(term.category).toBe('testing');
            expect(term.name).toBe('Test Term');
            expect(term.definition).toContain('testing purposes');
            expect(term.examNote).toBe('Remember this for the exam.');
        });

        it('should parse related terms', () => {
            const xmlText = getSampleXML();
            const exam = parser.parseExam(xmlText);

            expect(exam.glossary.term1.relatedTerms).toContain('term2');
        });

        it('should handle empty glossary', () => {
            const xmlNoGlossary = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>NO-GLOSS</exam-code>
                        <exam-title>No Glossary</exam-title>
                    </metadata>
                    <questions></questions>
                </exam>`;

            const exam = parser.parseExam(xmlNoGlossary);
            expect(exam.glossary).toEqual({});
        });
    });

    describe('getText helper', () => {
        it('should return empty string for missing element', () => {
            const xml = `<?xml version="1.0"?><exam><metadata><exam-code>TEST</exam-code><exam-title>Test</exam-title></metadata><questions></questions></exam>`;
            const exam = parser.parseExam(xml);

            expect(exam.metadata.description).toBe('');
        });

        it('should trim whitespace', () => {
            const xml = `<?xml version="1.0"?><exam><metadata><exam-code>  TRIMMED  </exam-code><exam-title>Test</exam-title></metadata><questions></questions></exam>`;
            const exam = parser.parseExam(xml);

            expect(exam.metadata.examCode).toBe('TRIMMED');
        });
    });

    describe('elementToHTML', () => {
        it('should preserve allowed HTML tags', () => {
            const xmlWithHtml = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>HTML-001</exam-code>
                        <exam-title>HTML Test</exam-title>
                    </metadata>
                    <questions>
                        <question id="1">
                            <title>Test</title>
                            <question-text><p>Text with <strong>bold</strong> and <em>italic</em></p></question-text>
                            <choices><choice letter="A">A</choice></choices>
                            <correct-answer>A</correct-answer>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithHtml);
            const text = exam.questions[0].questionText;

            expect(text).toContain('<p>');
            expect(text).toContain('<strong>bold</strong>');
            expect(text).toContain('<em>italic</em>');
        });

        it('should handle code elements', () => {
            const xmlWithCode = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>CODE-001</exam-code>
                        <exam-title>Code Test</exam-title>
                    </metadata>
                    <questions>
                        <question id="1">
                            <title>Test</title>
                            <question-text><p>Use <code>console.log()</code> for output</p></question-text>
                            <choices><choice letter="A">A</choice></choices>
                            <correct-answer>A</correct-answer>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithCode);
            expect(exam.questions[0].questionText).toContain('<code>console.log()</code>');
        });

        it('should handle lists', () => {
            const xmlWithLists = `<?xml version="1.0"?>
                <exam>
                    <metadata>
                        <exam-code>LIST-001</exam-code>
                        <exam-title>List Test</exam-title>
                    </metadata>
                    <questions>
                        <question id="1">
                            <title>Test</title>
                            <question-text><ul><li>Item 1</li><li>Item 2</li></ul></question-text>
                            <choices><choice letter="A">A</choice></choices>
                            <correct-answer>A</correct-answer>
                        </question>
                    </questions>
                </exam>`;

            const exam = parser.parseExam(xmlWithLists);
            const text = exam.questions[0].questionText;

            expect(text).toContain('<ul>');
            expect(text).toContain('<li>Item 1</li>');
        });
    });
});
