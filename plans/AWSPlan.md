Plan: Add AWS Certification Exams (index2.html)
Overview
Create a new AWS certification exam page (index2.html) with 7 AWS exam cards, following the same structure as the existing Azure exams in index.html.
Target AWS Certifications (7 exams)
Exam CodeTitleLevelCLF-C02AWS Certified Cloud PractitionerFoundationalAIF-C01AWS Certified AI PractitionerFoundationalSAA-C03AWS Certified Solutions Architect – AssociateAssociateDVA-C02AWS Certified Developer – AssociateAssociateSOA-C02AWS Certified SysOps Administrator – AssociateAssociateDEA-C01AWS Certified Data Engineer – AssociateAssociateMLA-C01AWS Certified Machine Learning Engineer – AssociateAssociate
Files to Create
1. index2.html (AWS Landing Page)

Copy structure from index.html
Update branding: Azure blue (#0078d4) → AWS orange (#FF9900)
Update header title to "AWS Certification Exam Study"
Add 7 exam cards linking to quiz.html?exam={code}

2. Data Folders & XML Files (7 folders)
Create following the data/az-204/exam.xml pattern:
data/
├── clf-c02/exam.xml    (Cloud Practitioner - 50 questions)
├── aif-c01/exam.xml    (AI Practitioner - 50 questions)
├── saa-c03/exam.xml    (Solutions Architect - 50 questions)
├── dva-c02/exam.xml    (Developer - 50 questions)
├── soa-c02/exam.xml    (SysOps Administrator - 50 questions)
├── dea-c01/exam.xml    (Data Engineer - 50 questions)
└── mla-c01/exam.xml    (ML Engineer - 50 questions)
Each XML file will contain:

Metadata (exam code, title, provider: "Amazon Web Services", categories)
50 scenario-based questions
4 choices (A-D) per question
3-level hints per question
Relevant tags and categories

Detailed Implementation Steps
Step 1: Create index2.html

Copy index.html to index2.html
Update page title and header text
Optionally adjust CSS color scheme for AWS branding
Replace 8 Azure exam cards with 7 AWS exam cards
Update card links to point to AWS exam codes

Step 2: Create AWS Exam Data Folders
Create 7 folders: data/clf-c02/, data/aif-c01/, data/saa-c03/, data/dva-c02/, data/soa-c02/, data/dea-c01/, data/mla-c01/
Step 3: Create exam.xml for CLF-C02 (Cloud Practitioner)

Categories: Cloud Concepts, Security & Compliance, Cloud Technology, Billing & Pricing
50 foundational questions covering AWS basics

Step 4: Create exam.xml for AIF-C01 (AI Practitioner)

Categories: AI/ML Fundamentals, AWS AI Services, Responsible AI, ML Lifecycle
50 questions on AWS AI/ML services

Step 5: Create exam.xml for SAA-C03 (Solutions Architect)

Categories: Design Resilient Architectures, High-Performing Architectures, Secure Applications, Cost-Optimized Architectures
50 scenario-based architecture questions

Step 6: Create exam.xml for DVA-C02 (Developer)

Categories: Development, Security, Deployment, Troubleshooting & Optimization
50 questions on AWS development patterns

Step 7: Create exam.xml for SOA-C02 (SysOps Administrator)

Categories: Monitoring & Reporting, High Availability, Deployment & Provisioning, Storage & Data Management, Security & Compliance, Networking, Cost Optimization
50 operations-focused questions

Step 8: Create exam.xml for DEA-C01 (Data Engineer)

Categories: Data Ingestion, Data Transformation, Data Storage, Data Orchestration, Data Security
50 questions on AWS data engineering services

Step 9: Create exam.xml for MLA-C01 (ML Engineer)

Categories: Data Preparation, Model Development, Deployment & Orchestration, Monitoring & Maintenance
50 questions on ML engineering with SageMaker and related services

Key AWS Services to Cover
Core Services (across all exams)

EC2, Lambda, ECS, EKS (Compute)
S3, EBS, EFS, Glacier (Storage)
RDS, DynamoDB, Aurora, Redshift (Database)
VPC, Route 53, CloudFront, ELB (Networking)
IAM, KMS, Secrets Manager (Security)
CloudWatch, CloudTrail, X-Ray (Monitoring)

AI/ML Services (AIF-C01, MLA-C01)

SageMaker, Bedrock, Comprehend, Rekognition, Polly, Lex, Textract, Transcribe

Data Services (DEA-C01)

Kinesis, Glue, Athena, EMR, Lake Formation, Data Pipeline

Critical Files to Modify/Create
FileActionindex2.htmlCREATE - New AWS landing pagedata/clf-c02/exam.xmlCREATE - 50 questionsdata/aif-c01/exam.xmlCREATE - 50 questionsdata/saa-c03/exam.xmlCREATE - 50 questionsdata/dva-c02/exam.xmlCREATE - 50 questionsdata/soa-c02/exam.xmlCREATE - 50 questionsdata/dea-c01/exam.xmlCREATE - 50 questionsdata/mla-c01/exam.xmlCREATE - 50 questions
No Changes Required

quiz.html - Works with any exam code
js/*.js - All modules are exam-agnostic
css/*.css - Existing styles work (optional: add AWS color variant)
data/schema/certification.xsd - Schema supports any provider

Verification

Open index2.html in browser - verify 7 AWS cards display
Click each card - verify quiz.html loads with correct exam
Answer questions - verify hint system and progress tracking work
Check localStorage - verify progress saves with aws exam codes
Verify XML validates against existing schema

Future Integration (for later)

Create index3.html for Google Cloud certifications
Create main landing page to choose cloud provider (Azure/AWS/GCP)
Unified navigation between all provider pages