/**
 * Exam Loader Module
 * Loads JSON exam files and validates against the certification schema.
 * Replaces XMLParser — JSON needs no parsing beyond response.json(),
 * so this class exists for schema validation, error handling, and caching.
 */

import Ajv2020 from 'https://esm.sh/ajv@8.17.1/dist/2020.js';
import addFormats from 'https://esm.sh/ajv-formats@3.0.1';

export class ExamLoader {
    constructor() {
        this._ajv = null;
        this._validate = null;
        this._schemaLoaded = false;
    }

    /**
     * Load and validate an exam JSON file.
     * @param {string} examPath - relative path like "data/aws/saa-c03.json"
     * @returns {Promise<{metadata, questions, glossary}>}
     */
    async loadExam(examPath) {
        const examData = await this._fetchJSON(examPath);
        await this._ensureSchema();
        this._validateExam(examData, examPath);
        return {
            metadata: examData.metadata,
            questions: examData.questions,
            glossary: examData.glossary
        };
    }

    async _fetchJSON(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load exam: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (err) {
            if (err instanceof SyntaxError) {
                throw new Error(`Invalid JSON in exam file: ${path}`);
            }
            if (window.location.protocol === 'file:') {
                throw new Error(
                    'Cannot load exam files with file:// protocol. ' +
                    'Please use a local server (e.g., "python -m http.server" or VS Code Live Server).'
                );
            }
            throw err;
        }
    }

    async _ensureSchema() {
        if (this._schemaLoaded) return;

        try {
            const response = await fetch('data/schema/certification.schema.json');
            if (!response.ok) {
                throw new Error(`Failed to load schema: ${response.status}`);
            }
            const schema = await response.json();

            this._ajv = new Ajv2020({ allErrors: true });
            addFormats(this._ajv);
            this._validate = this._ajv.compile(schema);
            this._schemaLoaded = true;
        } catch (err) {
            console.warn('Schema validation unavailable:', err.message);
            // Degrade gracefully — schema validation is defense-in-depth,
            // not a hard gate. The Python conversion script is the primary validator.
            this._schemaLoaded = true;
            this._validate = null;
        }
    }

    _validateExam(data, path) {
        if (!this._validate) return;

        const valid = this._validate(data);
        if (!valid) {
            const errors = this._validate.errors
                .slice(0, 5)
                .map(e => `  ${e.instancePath || '/'}: ${e.message}`)
                .join('\n');
            throw new Error(
                `Schema validation failed for ${path}:\n${errors}`
            );
        }
    }
}
