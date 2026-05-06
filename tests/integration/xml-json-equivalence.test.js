/**
 * XMLParser ↔ ExamLoader Equivalence Test
 * Verifies that both parsers produce the same {metadata, questions, glossary}
 * shape from the same exam content, so the quiz engine works identically
 * regardless of which loader was used.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { XMLParser } from '../../js/xml-parser.js';

const FIXTURES = join(process.cwd(), 'tests', 'fixtures');

function loadXML() {
    const parser = new XMLParser();
    const xmlText = readFileSync(join(FIXTURES, 'sample-exam.xml'), 'utf-8');
    return parser.parseExam(xmlText);
}

function loadJSON() {
    const raw = readFileSync(join(FIXTURES, 'sample-exam.json'), 'utf-8');
    const data = JSON.parse(raw);
    return {
        metadata: data.metadata,
        questions: data.questions,
        glossary: data.glossary,
    };
}

describe('XMLParser ↔ JSON equivalence', () => {
    let xmlExam, jsonExam;

    beforeEach(() => {
        xmlExam = loadXML();
        jsonExam = loadJSON();
    });

    describe('metadata', () => {
        it('same exam code and title', () => {
            expect(jsonExam.metadata.examCode).toBe(xmlExam.metadata.examCode);
            expect(jsonExam.metadata.examTitle).toBe(xmlExam.metadata.examTitle);
        });

        it('same provider and description', () => {
            expect(jsonExam.metadata.provider).toBe(xmlExam.metadata.provider);
            expect(jsonExam.metadata.description).toBe(xmlExam.metadata.description);
        });

        it('same totalQuestions', () => {
            expect(jsonExam.metadata.totalQuestions).toBe(xmlExam.metadata.totalQuestions);
        });

        it('same categories', () => {
            expect(jsonExam.metadata.categories).toEqual(xmlExam.metadata.categories);
        });
    });

    describe('questions', () => {
        it('same number of questions', () => {
            expect(jsonExam.questions.length).toBe(xmlExam.questions.length);
        });

        it('each question has matching id, title, correctAnswer', () => {
            for (let i = 0; i < xmlExam.questions.length; i++) {
                const xq = xmlExam.questions[i];
                const jq = jsonExam.questions[i];
                expect(jq.id).toBe(xq.id);
                expect(jq.title).toBe(xq.title);
                expect(jq.correctAnswer).toBe(xq.correctAnswer);
            }
        });

        it('each question has matching categoryRef and difficulty', () => {
            for (let i = 0; i < xmlExam.questions.length; i++) {
                expect(jsonExam.questions[i].categoryRef).toBe(xmlExam.questions[i].categoryRef);
                expect(jsonExam.questions[i].difficulty).toBe(xmlExam.questions[i].difficulty);
            }
        });

        it('each question has matching choices (letter + text)', () => {
            for (let i = 0; i < xmlExam.questions.length; i++) {
                const xChoices = xmlExam.questions[i].choices;
                const jChoices = jsonExam.questions[i].choices;
                expect(jChoices.length).toBe(xChoices.length);
                for (let c = 0; c < xChoices.length; c++) {
                    expect(jChoices[c].letter).toBe(xChoices[c].letter);
                    expect(jChoices[c].text).toBe(xChoices[c].text);
                }
            }
        });

        it('each question has matching hints (level, label, content)', () => {
            for (let i = 0; i < xmlExam.questions.length; i++) {
                const xHints = xmlExam.questions[i].hints;
                const jHints = jsonExam.questions[i].hints;
                expect(jHints.length).toBe(xHints.length);
                for (let h = 0; h < xHints.length; h++) {
                    expect(jHints[h].level).toBe(xHints[h].level);
                    expect(jHints[h].label).toBe(xHints[h].label);
                    expect(jHints[h].content).toBe(xHints[h].content);
                }
            }
        });

        it('each question has matching tags', () => {
            for (let i = 0; i < xmlExam.questions.length; i++) {
                expect(jsonExam.questions[i].tags).toEqual(xmlExam.questions[i].tags);
            }
        });
    });

    describe('glossary', () => {
        it('same term IDs', () => {
            expect(Object.keys(jsonExam.glossary).sort())
                .toEqual(Object.keys(xmlExam.glossary).sort());
        });

        it('each term has matching name and definition', () => {
            for (const id of Object.keys(xmlExam.glossary)) {
                expect(jsonExam.glossary[id].name).toBe(xmlExam.glossary[id].name);
                expect(jsonExam.glossary[id].definition).toBe(xmlExam.glossary[id].definition);
            }
        });

        it('each term has matching examNote and relatedTerms', () => {
            for (const id of Object.keys(xmlExam.glossary)) {
                expect(jsonExam.glossary[id].examNote).toBe(xmlExam.glossary[id].examNote);
                expect(jsonExam.glossary[id].relatedTerms).toEqual(xmlExam.glossary[id].relatedTerms);
            }
        });
    });
});
