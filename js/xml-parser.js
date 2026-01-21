/**
 * XML Parser Module
 * Loads and parses certification exam XML files
 */

export class XMLParser {
    constructor() {
        this.parser = new DOMParser();
    }

    async loadExam(examPath) {
        // Try fetch first (works with http/https)
        // Fall back to XMLHttpRequest for file:// protocol
        try {
            const xmlText = await this.fetchXML(examPath);
            return this.parseExam(xmlText);
        } catch (fetchError) {
            // If fetch fails (e.g., CORS with file://), try XMLHttpRequest
            if (window.location.protocol === 'file:') {
                try {
                    const xmlText = await this.loadXMLHttpRequest(examPath);
                    return this.parseExam(xmlText);
                } catch (xhrError) {
                    throw new Error(
                        'Cannot load exam files with file:// protocol. ' +
                        'Please use a local server (e.g., "python -m http.server" or VS Code Live Server).'
                    );
                }
            }
            throw fetchError;
        }
    }

    async fetchXML(examPath) {
        const response = await fetch(examPath);
        if (!response.ok) {
            throw new Error(`Failed to load exam: ${response.status} ${response.statusText}`);
        }
        return response.text();
    }

    loadXMLHttpRequest(examPath) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', examPath, true);
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 0) {
                    resolve(xhr.responseText);
                } else {
                    reject(new Error(`XHR failed: ${xhr.status}`));
                }
            };
            xhr.onerror = () => reject(new Error('XHR network error'));
            xhr.send();
        });
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
            // Support both attribute and element formats for category-ref and difficulty
            const categoryRef = q.getAttribute('category-ref') || this.getText(q, 'category-ref') || '';
            const difficulty = q.getAttribute('difficulty') || this.getText(q, 'difficulty') || 'intermediate';

            questions.push({
                id: parseInt(q.getAttribute('id')) || questions.length + 1,
                categoryRef: categoryRef,
                difficulty: difficulty,
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
            // Support both 'letter' attribute (preferred) and 'id' attribute (fallback)
            const letter = c.getAttribute('letter') || c.getAttribute('id') || '';
            choices.push({
                letter: letter,
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
            // Support both <content> child element and direct text content
            let content = this.getInnerHTML(h, 'content');
            if (!content) {
                // Fall back to direct text content of hint element
                content = h.textContent.trim();
            }

            hints.push({
                level: parseInt(h.getAttribute('level')) || 1,
                label: h.getAttribute('label') || `Level ${h.getAttribute('level')}`,
                content: content
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
