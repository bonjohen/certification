# Cloud Certification Study

A scenario-based quiz application for studying cloud certification exams. Supports Microsoft Azure, Amazon Web Services (AWS), and Google Cloud Platform (GCP) certifications.

## Features

- **Multi-provider support** - Study for Azure, AWS, and GCP certifications
- **Scenario-based questions** - Real-world scenarios to reinforce practical knowledge
- **Progressive hint system** - Three levels of hints to guide learning without giving away answers
- **Progress tracking** - Auto-saves progress to localStorage; resume where you left off
- **Responsive design** - Works on desktop and mobile devices
- **No backend required** - Pure client-side application; host anywhere

## Supported Exams

### Microsoft Azure (8 exams)
| Code | Title | Level |
|------|-------|-------|
| AZ-900 | Microsoft Azure Fundamentals | Beginner |
| AZ-104 | Microsoft Azure Administrator | Intermediate |
| AZ-204 | Developing Solutions for Microsoft Azure | Intermediate |
| AZ-305 | Designing Microsoft Azure Infrastructure Solutions | Advanced |
| AZ-400 | Designing and Implementing Microsoft DevOps Solutions | Advanced |
| AZ-500 | Microsoft Azure Security Technologies | Advanced |
| DP-900 | Microsoft Azure Data Fundamentals | Beginner |
| AI-900 | Microsoft Azure AI Fundamentals | Beginner |

### Amazon Web Services (7 exams)
| Code | Title | Level |
|------|-------|-------|
| CLF-C02 | AWS Certified Cloud Practitioner | Foundational |
| AIF-C01 | AWS Certified AI Practitioner | Foundational |
| SAA-C03 | AWS Certified Solutions Architect - Associate | Associate |
| DVA-C02 | AWS Certified Developer - Associate | Associate |
| SOA-C02 | AWS Certified SysOps Administrator - Associate | Associate |
| DEA-C01 | AWS Certified Data Engineer - Associate | Associate |
| MLA-C01 | AWS Certified Machine Learning Engineer - Associate | Associate |

### Google Cloud Platform (10 courses)
| Code | Title | Level |
|------|-------|-------|
| GCP-FUND-CORE | Google Cloud Fundamentals: Core Infrastructure | Beginner |
| GCP-CLOUD-FND | Cloud Computing and GCP Fundamentals | Beginner |
| GCP-CLOUD-ENG | Associate Cloud Engineer Preparation | Associate |
| GCP-EXAM-PREP-ACE | Exam Prep: Associate Cloud Engineer | Associate |
| GCP-CLOUD-ARCH | Professional Cloud Architect Preparation | Professional |
| GCP-GK-COMPUTE | GCP: Compute Services | Intermediate |
| GCP-NETWORKS | Networking in Google Cloud: Fundamentals | Intermediate |
| GCP-DB-STOR | GCP: Database and Storage | Intermediate |
| GCP-DATA-ENG-ML | Data Engineering, Big Data, and Machine Learning | Advanced |
| GCP-DB-DEVOPS | Database, Big Data, and DevOps Services | Advanced |

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server for development

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/bonjohen/certification.git
   cd certification
   ```

2. Start a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js
   npx serve .

   # Using VS Code
   # Install "Live Server" extension and click "Go Live"
   ```

3. Open http://localhost:8000 in your browser

### Deployment

The application is static HTML/CSS/JS and can be hosted on any web server or static hosting service:

- **GitHub Pages** - Push to `gh-pages` branch or enable Pages in repository settings
- **Netlify** - Connect repository for automatic deployments
- **Vercel** - Import project for instant deployment
- **AWS S3** - Upload files to an S3 bucket with static website hosting

## Project Structure

```
certification/
├── index.html          # Main landing page (provider selection)
├── azure.html          # Azure exam selection
├── aws.html            # AWS exam selection
├── gcp.html            # GCP exam selection
├── quiz.html           # Quiz interface
├── css/
│   └── styles.css      # Application styles
├── js/
│   ├── app.js          # Main application logic
│   ├── quiz-engine.js  # Quiz state management
│   ├── progress-tracker.js  # localStorage persistence
│   └── xml-parser.js   # Exam XML parsing
├── data/
│   ├── azure/          # Azure exam XML files
│   ├── aws/            # AWS exam XML files
│   ├── gcp/            # GCP exam XML files
│   └── schema/         # XML schema definitions
└── tests/              # Unit tests
```

## Development

### Running Tests

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Adding New Exams

1. Create a new XML file in the appropriate provider folder (`data/azure/`, `data/aws/`, or `data/gcp/`)
2. Follow the existing XML schema (see `data/schema/certification.xsd`)
3. Add an exam card to the corresponding provider HTML file
4. The quiz will automatically load based on the `?exam=` URL parameter

### XML Question Format

```xml
<question id="1" category-ref="cat-id" difficulty="basic">
    <title>Question Title</title>
    <scenario>Real-world scenario description...</scenario>
    <question-text>What should you do?</question-text>
    <choices>
        <choice letter="A">First option</choice>
        <choice letter="B">Correct option</choice>
        <choice letter="C">Third option</choice>
        <choice letter="D">Fourth option</choice>
    </choices>
    <correct-answer>B</correct-answer>
    <hints>
        <hint level="1" label="Brief Hint">
            <content>A small nudge in the right direction.</content>
        </hint>
        <hint level="2" label="Detailed Hint">
            <content>More detailed explanation.</content>
        </hint>
        <hint level="3" label="Answer Explanation">
            <content>Complete explanation of why B is correct.</content>
        </hint>
    </hints>
</question>
```

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6 modules)
- **Testing**: Vitest with jsdom
- **Data Format**: XML with custom schema

## License

This project is for educational purposes. Exam content is inspired by official certification objectives but is not affiliated with or endorsed by Microsoft, Amazon, or Google.

## Disclaimer

These study guides are supplementary materials. Always refer to official documentation:
- [Microsoft Learn](https://learn.microsoft.com/)
- [AWS Training](https://aws.amazon.com/training/)
- [Google Cloud Training](https://cloud.google.com/training)
