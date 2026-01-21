Overview
Build an XML-based certification exam study application that transforms existing markdown study guides (AZ-104, AZ-204) into interactive web-based quizzes with progressive hint levels.
Current State
Two markdown files exist:

output\AZ-104 Microsoft Azure Administrator -- Study Guide.md (50 questions)
output\AZ-204 Microsoft Azure -- Study Guide.md (50 questions)

Each question has three progressive answer levels:

A) Minimum Acceptable Answer (brief, 1-2 sentences)
B) Complete Answer (detailed rationale)
C) Deeper Knowledge (expert-level, bullet points)

Note: The existing A/B/C are explanation levels, NOT multiple-choice options. Multiple-choice A/B/C/D options must be created.

Phase 1: XML Schema Design
Create data/schema/certification.xsd with:
certification-exam (root)
├── metadata
│   ├── exam-code (e.g., "AZ-104")
│   ├── exam-title
│   ├── provider
│   ├── total-questions
│   └── categories[]
├── questions[]
│   ├── @id, @category-ref, @difficulty
│   ├── title
│   ├── scenario
│   ├── question-text
│   ├── choices (exactly 4: A, B, C, D)
│   ├── correct-answer (A|B|C|D)
│   ├── hints (3 levels for progressive reveal)
│   │   ├── hint level="1" (Brief - from existing A)
│   │   ├── hint level="2" (Complete - from existing B)
│   │   └── hint level="3" (Deep - from existing C)
│   └── tags[]
└── glossary[]
    └── term[@id, @category]
        ├── name
        └── definition

Phase 2: Content Transformation
Step 1: Create transformation script
tools/md-to-xml-converter.js - Node.js script to:

Parse markdown structure
Extract question titles, scenarios, question text
Map existing A/B/C answers to hint levels 1/2/3
Output intermediate JSON with placeholders for manual entry

Step 2: AI-generated multiple-choice options
For each question, AI will:

Analyze the scenario and existing A) Minimum Acceptable Answer
Generate 4 plausible choices (A/B/C/D)
Set the correct answer based on the existing A) answer
Create 3 realistic distractors based on common misconceptions and exam traps mentioned in C) Deeper Knowledge

Step 3: Generate final XML

Convert completed JSON to XML
Validate against XSD schema


Phase 3: Web Application
File Structure
certification/
├── index.html              # Exam selector
├── quiz.html               # Quiz interface
├── css/
│   ├── styles.css
│   └── quiz.css
├── js/
│   ├── app.js              # Main entry point
│   ├── xml-parser.js       # Load/parse XML
│   ├── quiz-engine.js      # Quiz state management
│   └── progress-tracker.js # LocalStorage persistence
├── data/
│   ├── schema/
│   │   └── certification.xsd
│   ├── az-104/
│   │   └── exam.xml
│   └── az-204/
│       └── exam.xml
└── tools/
    └── md-to-xml-converter.js
Quiz Page Features

Display one question at a time with scenario
Show 4 radio button choices (A/B/C/D)
Submit button evaluates answer (correct/incorrect feedback)
Three "Reveal Hint" buttons (progressive unlock)
Navigation: Previous/Next, question dots showing progress
Score tracking: X correct / Y attempted
LocalStorage saves progress between sessions


Phase 4: Implementation Steps

Create XML Schema (data/schema/certification.xsd)
Create transformation script (tools/md-to-xml-converter.js)
Transform AZ-104 markdown to intermediate JSON
AI-generate multiple-choice options for AZ-104 (50 questions)
Generate AZ-104 XML and validate
Build web application (HTML/CSS/JS)
Repeat transformation for AZ-204
Test and polish


Verification Plan

Schema validation: Use xmllint --schema to validate XML against XSD
Unit test quiz engine: Verify answer evaluation, hint progression, navigation
Manual testing:

Load each exam, answer all 50 questions
Verify correct/incorrect feedback works
Test hint reveal progression (must reveal level 1 before 2, etc.)
Verify progress persists across browser refresh


Cross-browser: Test in Chrome, Firefox, Edge


Critical Files to Create/Modify
FilePurposedata/schema/certification.xsdXML Schema Definitiontools/md-to-xml-converter.jsMarkdown parser/transformerdata/az-104/exam.xmlTransformed AZ-104 contentdata/az-204/exam.xmlTransformed AZ-204 contentjs/xml-parser.jsXML loading and parsingjs/quiz-engine.jsCore quiz logicquiz.htmlQuiz interface

Technology Choices

Data format: XML with XSD validation (structured, human-readable)
Frontend: Vanilla HTML/CSS/JavaScript (no build step, works offline)
Persistence: LocalStorage (no backend needed)
Styling: CSS with CSS variables for theming