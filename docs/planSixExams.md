Plan: Create Six New Azure Certification Exam Folders
Overview
Create data folders and XML exam files for six new Azure certifications, following the existing AZ-204/AZ-104 structure and schema validation requirements.

Target Certifications
AZ-305 - Azure Solutions Architect Expert
AZ-400 - DevOps Engineer Expert
AZ-900 - Azure Fundamentals
DP-203 - Azure Data Engineer Associate
DP-300 - Azure Database Administrator Associate
DP-900 - Azure Data Fundamentals
Current Structure Analysis
Schema: data/schema/certification.xsd (already exists, validates all exams)
Example: data/az-204/exam.xml (1,825 lines, 50 questions)
Pattern: Each exam has its own folder containing a single exam.xml file
Frontend: index.html displays exam cards linking to quiz.html?exam={code}
Implementation Approach
Phase 1: Prepare Metadata Research
For each certification, gather:

Official exam title
Brief description (from Microsoft Learn)
Appropriate difficulty level (basic/intermediate/advanced)
5-7 topic categories (based on exam skills outline)
Rationale: Metadata must be accurate to match official Microsoft certification documentation.

Phase 2: Create Directory Structure (Batch)
Create all six directories in one operation:

data/
├── az-305/
├── az-400/
├── az-900/
├── dp-203/
├── dp-300/
└── dp-900/
Rationale: Simple filesystem operation, no dependencies.

Phase 3: Generate XML Template Skeletons (Sequential)
For each certification (one at a time):

Create exam.xml with complete metadata section
Add placeholder structure for 50 questions
Validate against schema to ensure structure compliance
Order of creation (strategic):

AZ-900 (Fundamentals - simplest content)
DP-900 (Data Fundamentals - similar to AZ-900)
AZ-305 (Solutions Architect - builds on AZ-104/204 knowledge)
AZ-400 (DevOps - practical implementation focus)
DP-203 (Data Engineer - Azure data services)
DP-300 (Database Admin - specialized database focus)
Rationale: Start with fundamentals exams (easier content), then progress to expert-level. This allows pattern refinement before tackling complex content.

Phase 4: Content Population Strategy (AI-Generated)
Each exam requires 50 questions with:

Title, scenario, question text
4 multiple-choice options (A/B/C/D)
Correct answer designation
3 progressive hint levels
Tags and category references
Approach: AI-generated content based on Microsoft Learn exam skills outlines

Generate questions using Claude referencing official Microsoft exam objectives
Each question prompt specifies: category, difficulty level, realistic scenario
Content validation against Azure documentation for technical accuracy
Follow AZ-204 question pattern: realistic business scenarios with practical decision-making
Ensure distractors (incorrect answers) reflect common misconceptions
Hint levels: (1) Brief answer, (2) Complete explanation, (3) Deep knowledge with bullet points
Quality assurance:

Cross-reference technical details with Microsoft Learn modules
Ensure scenarios are realistic and exam-relevant
Verify all Azure service names, features, and terminology are current (2026)
Phase 5: Update Frontend (Single Batch)
Update index.html to add six new exam cards:

Insert cards in logical order (Fundamentals → Associate → Expert)
Match existing card structure (exam-code, exam-title, exam-description, exam-meta)
Ensure links point to correct exam codes
File to modify: C:\Projects\certification\index.html (lines 18-42, exam-cards section)

Phase 6: Validation
For each exam:

Schema validation: xmllint --schema data/schema/certification.xsd data/{exam}/exam.xml
Frontend load test: Open quiz.html?exam={exam} and verify:
Metadata displays correctly
Questions load
Hints reveal progressively
Navigation works
Cross-check categories: All category-ref values must match defined category IDs
Critical Files to Create/Modify
File Path	Action	Purpose
data/az-305/exam.xml	Create	AZ-305 exam data
data/az-400/exam.xml	Create	AZ-400 exam data
data/az-900/exam.xml	Create	AZ-900 exam data
data/dp-203/exam.xml	Create	DP-203 exam data
data/dp-300/exam.xml	Create	DP-300 exam data
data/dp-900/exam.xml	Create	DP-900 exam data
index.html	Modify	Add 6 new exam cards (lines 18-42)
Schema Compliance Checklist
Each exam.xml must include:

✅ Root element with namespace and version attribute
✅ Complete metadata (exam-code, exam-title, provider, description, total-questions, dates)
✅ 5-7 categories with unique IDs (format: cat-{name})
✅ Exactly 50 questions
✅ Each question: unique ID, 4 choices (A/B/C/D), correct answer, 3 hints
✅ All category-ref attributes must reference defined category IDs
✅ FormattedTextType content uses only allowed HTML tags: <p>, <strong>, <em>, <code>, <ul>, <ol>, <li>
Metadata Reference (from Microsoft Learn)
AZ-305: Azure Solutions Architect Expert
Title: Designing Microsoft Azure Infrastructure Solutions
Description: Design cloud and hybrid solutions that run on Azure, including compute, network, storage, monitoring, and security
Difficulty: Advanced
Categories: Architecture Design, Identity & Security, Data Storage, Business Continuity, Infrastructure
AZ-400: DevOps Engineer Expert
Title: Designing and Implementing Microsoft DevOps Solutions
Description: Design and implement strategies for collaboration, code, infrastructure, source control, security, compliance, continuous integration, testing, delivery, monitoring, and feedback
Difficulty: Advanced
Categories: DevOps Planning, Source Control, CI/CD, Security & Compliance, Infrastructure as Code, Monitoring & Feedback
AZ-900: Azure Fundamentals
Title: Microsoft Azure Fundamentals
Description: Foundational knowledge of cloud services and how those services are provided with Microsoft Azure
Difficulty: Basic
Categories: Cloud Concepts, Core Azure Services, Security & Compliance, Pricing & Support
DP-203: Azure Data Engineer Associate
Title: Data Engineering on Microsoft Azure
Description: Design and implement data storage, data processing, and data security for analytics workloads
Difficulty: Intermediate
Categories: Data Storage, Data Processing, Data Security, Monitoring & Optimization, Batch Processing, Stream Processing
DP-300: Azure Database Administrator Associate
Title: Administering Microsoft Azure SQL Solutions
Description: Manage SQL Server and Azure SQL database infrastructure for cloud, on-premises and hybrid data platforms
Difficulty: Intermediate
Categories: Database Deployment, Database Management, Security, Performance Optimization, High Availability, Automation
DP-900: Azure Data Fundamentals
Title: Microsoft Azure Data Fundamentals
Description: Foundational knowledge of core data concepts and how they are implemented using Azure data services
Difficulty: Basic
Categories: Core Data Concepts, Relational Data, Non-Relational Data, Analytics Workloads
AI Question Generation Process
For each exam, the AI generation will follow this workflow:

Step 1: Research Exam Objectives
Fetch Microsoft Learn exam skills outline via web search
Extract skill domains and sub-topics
Map to 5-7 categories for the exam
Step 2: Question Distribution
Distribute 50 questions across categories proportionally
Vary difficulty levels (basic/intermediate/advanced) based on exam level
Ensure coverage of all major skill domains
Step 3: Generate Each Question
For each of the 50 questions, provide Claude with:

Exam: {exam-code}
Category: {category-name}
Difficulty: {basic|intermediate|advanced}
Topic: {specific-skill-from-outline}

Generate a scenario-based question following AZ-204 pattern:
- Realistic business/technical scenario (2-3 sentences)
- Clear question asking for a decision or choice
- 4 plausible multiple-choice options
- 1 correct answer with rationale
- 3 progressive hints (brief, complete, deep)
- 2-3 relevant tags
Step 4: Format and Validate
Format generated content into XML structure
Ensure FormattedTextType compliance (only allowed HTML tags)
Validate against schema after every 10 questions
Adjust generation prompt if validation fails
Step 5: Quality Review
Spot-check technical accuracy (5-10 questions per exam)
Verify scenarios are realistic and exam-relevant
Ensure hints provide genuine educational value
Execution Strategy
Sequential (Recommended)
Process one exam at a time from start to finish:

Create directory
Generate exam.xml skeleton with metadata
Populate 50 questions (AI-assisted or manual)
Validate with schema
Test in browser
Move to next exam
Pros: Catch issues early, iterate on process improvements Cons: Takes longer to see all exams available

Parallel (Alternative)
Create all skeletons first, then populate content in batch:

Create all 6 directories
Generate all 6 exam.xml skeletons
Populate all questions across all exams
Batch validate
Update frontend once
Pros: Faster time-to-complete Cons: Harder to track progress, potential for repeated errors

Decision: Use Sequential approach for quality control and alignment with project principle of "determinism over parallelism."

Verification Plan
Schema validation: Run xmllint for each exam.xml
Content completeness: Verify each exam has exactly 50 questions
Category integrity: All category-ref values resolve to defined categories
Frontend integration: Each exam card loads successfully in quiz.html
Browser testing: Spot-check 5-10 questions per exam for:
Hint progression (must reveal level 1 before 2)
Answer evaluation (correct/incorrect feedback)
Navigation (Previous/Next buttons work)
Cross-browser: Test in Chrome/Edge (Windows primary)
Risk Mitigation
Content accuracy risk: Cross-reference all technical content with official Microsoft Learn documentation
Schema validation risk: Validate after each exam creation to catch structural issues early
Consistency risk: Use AZ-204 as template for formatting and style conventions
Success Criteria
✅ All 6 exam folders created under data/
✅ All 6 exam.xml files validate against certification.xsd
✅ Each exam contains exactly 50 questions with complete metadata
✅ index.html displays 8 total exam cards (2 existing + 6 new)
✅ All exams load and function correctly in quiz.html
✅ No browser console errors when loading any exam