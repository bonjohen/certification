/**
 * XML Parser Module
 * Loads and parses certification exam XML files
 */

export class XMLParser {
    constructor() {
        this.parser = new DOMParser();
    }

    async loadExam(examPath) {
        const response = await fetch(examPath);
        if (!response.ok) {
            throw new Error(`Failed to load exam: ${response.status} ${response.statusText}`);
        }
        const xmlText = await response.text();
        return this.parseExam(xmlText);
    }

    parseExam(xmlText) {
        const doc = this.parser.parseFromString(xmlText, 'application/xml');

        // Check for parsing errors
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
            throw new Error('XML parsing error: ' + parseError.textContent);
        }

        return {
            metadata: this.parseMetadata(doc),
            questions: this.parseQuestions(doc),
            glossary: this.parseGlossary(doc)
        };
    }

    parseMetadata(doc) {
        const metadata = doc.querySelector('metadata');
        if (!metadata) {
            throw new Error('No metadata found in exam XML');
        }

        return {
            examCode: this.getText(metadata, 'exam-code'),
            examTitle: this.getText(metadata, 'exam-title'),
            provider: this.getText(metadata, 'provider'),
            description: this.getText(metadata, 'description'),
            totalQuestions: parseInt(this.getText(metadata, 'total-questions')) || 0,
            createdDate: this.getText(metadata, 'created-date'),
            lastModified: this.getText(metadata, 'last-modified'),
            categories: this.parseCategories(metadata)
        };
    }

    parseCategories(metadata) {
        const categories = {};
        const categoryElements = metadata.querySelectorAll('categories > category');
        categoryElements.forEach(cat => {
            const id = cat.getAttribute('id');
            if (id) {
                categories[id] = cat.textContent.trim();
            }
        });
        return categories;
    }

    parseQuestions(doc) {
        const questions = [];
        const questionElements = doc.querySelectorAll('questions > question');

        questionElements.forEach(q => {
            questions.push({
                id: parseInt(q.getAttribute('id')) || questions.length + 1,
                categoryRef: q.getAttribute('category-ref') || '',
                difficulty: q.getAttribute('difficulty') || 'intermediate',
                title: this.getText(q, 'title'),
                scenario: this.getInnerHTML(q, 'scenario'),
                questionText: this.getInnerHTML(q, 'question-text'),
                choices: this.parseChoices(q),
                correctAnswer: this.getText(q, 'correct-answer'),
                hints: this.parseHints(q),
                tags: this.parseTags(q)
            });
        });

        return questions;
    }

    parseChoices(questionElement) {
        const choices = [];
        const choiceElements = questionElement.querySelectorAll('choices > choice');

        choiceElements.forEach(c => {
            choices.push({
                letter: c.getAttribute('letter') || '',
                text: c.textContent.trim()
            });
        });

        // Sort choices by letter (A, B, C, D)
        choices.sort((a, b) => a.letter.localeCompare(b.letter));

        return choices;
    }

    parseHints(questionElement) {
        const hints = [];
        const hintElements = questionElement.querySelectorAll('hints > hint');

        hintElements.forEach(h => {
            hints.push({
                level: parseInt(h.getAttribute('level')) || 1,
                label: h.getAttribute('label') || `Level ${h.getAttribute('level')}`,
                content: this.getInnerHTML(h, 'content')
            });
        });

        // Sort hints by level
        hints.sort((a, b) => a.level - b.level);

        return hints;
    }

    parseTags(questionElement) {
        const tags = [];
        const tagElements = questionElement.querySelectorAll('tags > tag');
        tagElements.forEach(t => tags.push(t.textContent.trim()));
        return tags;
    }

    parseGlossary(doc) {
        const glossary = {};
        const termElements = doc.querySelectorAll('glossary > term');

        termElements.forEach(t => {
            const id = t.getAttribute('id');
            if (id) {
                glossary[id] = {
                    id: id,
                    category: t.getAttribute('category') || '',
                    name: this.getText(t, 'name'),
                    definition: this.getInnerHTML(t, 'definition'),
                    examNote: this.getText(t, 'exam-note'),
                    relatedTerms: this.parseRelatedTerms(t)
                };
            }
        });

        return glossary;
    }

    parseRelatedTerms(termElement) {
        const refs = [];
        const refElements = termElement.querySelectorAll('related-terms > term-ref');
        refElements.forEach(r => refs.push(r.textContent.trim()));
        return refs;
    }

    getText(parent, selector) {
        const element = parent.querySelector(selector);
        return element ? element.textContent.trim() : '';
    }

    getInnerHTML(parent, selector) {
        const element = parent.querySelector(selector);
        if (!element) return '';

        // Convert child nodes to HTML string
        let html = '';
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                html += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                html += this.elementToHTML(node);
            }
        });

        return html.trim();
    }

    elementToHTML(element) {
        const tagName = element.tagName.toLowerCase();

        // Handle known formatting elements
        const allowedTags = ['p', 'strong', 'em', 'code', 'ul', 'ol', 'li'];

        if (allowedTags.includes(tagName)) {
            let inner = '';
            element.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    inner += node.textContent;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    inner += this.elementToHTML(node);
                }
            });
            return `<${tagName}>${inner}</${tagName}>`;
        }

        // For unknown tags, just return text content
        return element.textContent;
    }
}
