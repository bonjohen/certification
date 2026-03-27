#!/usr/bin/env node

/**
 * XML Schema Validator
 * Validates all data/**\/*.xml files against the structural requirements
 * defined in data/schema/certification.xsd.
 *
 * Uses the DOM parser (via jsdom) to check:
 *  - Root element is <certification-exam> with version attribute
 *  - Required metadata fields present
 *  - Each question has required children (title, question-text, choices, correct-answer, hints)
 *  - Exactly 4 choices per question with letter attributes (A-D)
 *  - Exactly 3 hints per question with level attributes (1-3)
 *  - correct-answer is one of A, B, C, D
 *  - total-questions matches actual question count
 *
 * Exit code 0 = all valid, 1 = validation errors found.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { JSDOM } from 'jsdom';

const DATA_DIR = join(process.cwd(), 'data');
const VALID_LETTERS = ['A', 'B', 'C', 'D'];
const VALID_DIFFICULTIES = ['basic', 'intermediate', 'advanced'];
const NS = 'http://certification.study/schema/v1';

function findXmlFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            if (entry === 'schema') continue; // skip schema dir
            files.push(...findXmlFiles(full));
        } else if (entry.endsWith('.xml')) {
            files.push(full);
        }
    }
    return files;
}

function validateFile(filePath) {
    const errors = [];
    const warnings = [];
    const label = relative(process.cwd(), filePath);

    let xmlText;
    try {
        xmlText = readFileSync(filePath, 'utf-8');
    } catch (e) {
        errors.push(`${label}: cannot read file — ${e.message}`);
        return { errors, warnings };
    }

    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const parser = new dom.window.DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
        errors.push(`${label}: XML parse error — ${parseError.textContent.trim().slice(0, 120)}`);
        return { errors, warnings };
    }

    // Helper: query with namespace
    const q = (parent, localName) => parent.getElementsByTagNameNS(NS, localName);
    const qFirst = (parent, localName) => q(parent, localName)[0] || null;
    const text = (parent, localName) => {
        const el = qFirst(parent, localName);
        return el ? el.textContent.trim() : '';
    };

    // --- Root element ---
    const root = doc.documentElement;
    if (root.localName !== 'certification-exam') {
        errors.push(`${label}: root element must be <certification-exam>, got <${root.localName}>`);
        return { errors, warnings };
    }
    if (!root.getAttribute('version')) {
        errors.push(`${label}: <certification-exam> missing required 'version' attribute`);
    }

    // --- Metadata ---
    const metadata = qFirst(root, 'metadata');
    if (!metadata) {
        errors.push(`${label}: missing <metadata>`);
        return { errors, warnings };
    }

    const requiredMeta = ['exam-code', 'exam-title', 'provider', 'total-questions', 'created-date', 'last-modified'];
    for (const field of requiredMeta) {
        if (!text(metadata, field)) {
            errors.push(`${label}: metadata missing required <${field}>`);
        }
    }

    // --- Questions ---
    const questionsContainer = qFirst(root, 'questions');
    if (!questionsContainer) {
        errors.push(`${label}: missing <questions>`);
        return { errors, warnings };
    }

    const questions = q(questionsContainer, 'question');
    if (questions.length === 0) {
        errors.push(`${label}: <questions> contains no <question> elements`);
        return { errors, warnings };
    }

    // total-questions consistency
    const declaredTotal = parseInt(text(metadata, 'total-questions'), 10);
    if (declaredTotal && declaredTotal !== questions.length) {
        errors.push(`${label}: <total-questions> declares ${declaredTotal} but found ${questions.length} questions`);
    }

    for (let i = 0; i < questions.length; i++) {
        const qEl = questions[i];
        const qId = qEl.getAttribute('id') || `(index ${i})`;
        const prefix = `${label} Q${qId}`;

        // Required children
        for (const child of ['title', 'question-text', 'choices', 'correct-answer', 'hints']) {
            if (!qFirst(qEl, child)) {
                errors.push(`${prefix}: missing <${child}>`);
            }
        }

        // Difficulty attribute (optional but must be valid if present)
        const diff = qEl.getAttribute('difficulty');
        if (diff && !VALID_DIFFICULTIES.includes(diff)) {
            errors.push(`${prefix}: invalid difficulty '${diff}' (expected: ${VALID_DIFFICULTIES.join(', ')})`);
        }

        // Choices: exactly 4, letters A-D
        const choicesEl = qFirst(qEl, 'choices');
        if (choicesEl) {
            const choices = q(choicesEl, 'choice');
            if (choices.length !== 4) {
                errors.push(`${prefix}: expected 4 choices, found ${choices.length}`);
            }
            const letters = [];
            for (const c of choices) {
                // Accept both 'letter' (preferred) and 'id' (legacy) attributes
                const letter = c.getAttribute('letter') || c.getAttribute('id');
                if (!letter) {
                    errors.push(`${prefix}: <choice> missing 'letter' attribute`);
                } else if (!VALID_LETTERS.includes(letter)) {
                    errors.push(`${prefix}: invalid choice letter '${letter}'`);
                } else {
                    letters.push(letter);
                    if (!c.getAttribute('letter') && c.getAttribute('id')) {
                        warnings.push(`${prefix}: <choice> uses legacy 'id' attribute, prefer 'letter'`);
                    }
                }
            }
            const uniqueLetters = new Set(letters);
            if (uniqueLetters.size !== letters.length) {
                errors.push(`${prefix}: duplicate choice letters`);
            }
        }

        // correct-answer: must be A-D
        const answer = text(qEl, 'correct-answer');
        if (answer && !VALID_LETTERS.includes(answer)) {
            errors.push(`${prefix}: <correct-answer> '${answer}' is not A, B, C, or D`);
        }

        // Hints: exactly 3, levels 1-3
        const hintsEl = qFirst(qEl, 'hints');
        if (hintsEl) {
            const hints = q(hintsEl, 'hint');
            if (hints.length !== 3) {
                errors.push(`${prefix}: expected 3 hints, found ${hints.length}`);
            }
            const levels = [];
            for (const h of hints) {
                const level = parseInt(h.getAttribute('level'), 10);
                if (isNaN(level) || level < 1 || level > 3) {
                    errors.push(`${prefix}: hint has invalid level '${h.getAttribute('level')}'`);
                } else {
                    levels.push(level);
                }
                // Each hint must have <content> or direct text content
                if (!qFirst(h, 'content')) {
                    if (h.textContent.trim()) {
                        warnings.push(`${prefix}: hint level ${level} uses bare text, prefer <content> wrapper`);
                    } else {
                        errors.push(`${prefix}: hint level ${level} has no content`);
                    }
                }
            }
            const uniqueLevels = new Set(levels);
            if (uniqueLevels.size !== levels.length) {
                errors.push(`${prefix}: duplicate hint levels`);
            }
        }
    }

    return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const xmlFiles = findXmlFiles(DATA_DIR);
let totalErrors = 0;
let totalWarnings = 0;
let totalFiles = 0;

console.log(`Validating ${xmlFiles.length} XML files against certification schema...\n`);

for (const file of xmlFiles) {
    totalFiles++;
    const { errors, warnings } = validateFile(file);
    const label = relative(process.cwd(), file);

    if (errors.length === 0 && warnings.length === 0) {
        console.log(`  PASS  ${label}`);
    } else if (errors.length === 0) {
        console.log(`  WARN  ${label}`);
        for (const w of warnings) {
            console.log(`        ⚠ ${w}`);
        }
        totalWarnings += warnings.length;
    } else {
        console.log(`  FAIL  ${label}`);
        for (const err of errors) {
            console.log(`        ✗ ${err}`);
        }
        for (const w of warnings) {
            console.log(`        ⚠ ${w}`);
        }
        totalErrors += errors.length;
        totalWarnings += warnings.length;
    }
}

console.log(`\n${totalFiles} files checked, ${totalErrors} errors, ${totalWarnings} warnings.`);

process.exit(totalErrors > 0 ? 1 : 0);
