# Certification Study

A scenario-based quiz application for studying technology certification exams. Supports Microsoft Azure, Amazon Web Services (AWS), Google Cloud Platform (GCP), and Anthropic certifications.

## Features

- **Multi-provider support** - Study for Azure, AWS, GCP, and Anthropic certifications
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

### Anthropic (1 exam)
| Code | Title | Level |
|------|-------|-------|
| CCA-F | Claude Certified Architect, Foundations | Foundational |

### CompTIA (1 exam)
| Code | Title | Level |
|------|-------|-------|
| SY0-701 | CompTIA Security+ | Intermediate |

### ISC2 (1 exam)
| Code | Title | Level |
|------|-------|-------|
| CISSP | Certified Information Systems Security Professional | Advanced |

### GitHub (2 exams)
| Code | Title | Level |
|------|-------|-------|
| GH-200 | GitHub Actions Certification | Intermediate |
| GH-300 | GitHub Copilot Certification | Intermediate |

### Databricks (2 exams)
| Code | Title | Level |
|------|-------|-------|
| DB-GenAI | Databricks Generative AI Engineer | Intermediate |
| DB-ML | Databricks Machine Learning | Intermediate |

### NVIDIA (1 exam)
| Code | Title | Level |
|------|-------|-------|
| NV-GenAI | NVIDIA Generative AI | Intermediate |

### Cisco (1 exam)
| Code | Title | Level |
|------|-------|-------|
| 810-110 | Cisco AI Fundamentals | Foundational |

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
   # Using npm (recommended — uses port 8080)
   npm start

   # Using Python 3
   python -m http.server 8080

   # Using VS Code
   # Install "Live Server" extension and click "Go Live"
   ```

3. Open http://localhost:8080 in your browser

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
├── anthropic.html      # Anthropic exam selection
├── quiz.html           # Quiz interface
├── css/
│   └── results.css     # Results page styles
├── js/
│   ├── app.js          # Main application logic
│   ├── exam-loader.js  # JSON exam loading with schema validation
│   ├── quiz-engine.js  # Quiz state management
│   ├── progress-tracker.js  # localStorage persistence
│   └── results-app.js  # Results page logic
├── data/
│   ├── azure/          # Azure exam JSON files
│   ├── aws/            # AWS exam JSON files
│   ├── gcp/            # GCP exam JSON files
│   ├── anthropic/      # Anthropic exam JSON files
│   └── schema/         # JSON Schema definitions
├── system/
│   ├── tokens.css      # Atlas design system tokens
│   └── system.css      # Atlas component styles
└── tests/              # Unit and integration tests
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

1. Create a new JSON file in the appropriate provider folder (`data/{provider}/`)
2. Follow the JSON Schema at `data/schema/certification.schema.json`
3. Add an exam card to the corresponding provider HTML file
4. The quiz will automatically load based on the `?exam=` URL parameter

### JSON Question Format

```json
{
  "id": 1,
  "categoryRef": "cat-id",
  "difficulty": "basic",
  "title": "Question Title",
  "scenario": "Real-world scenario description...",
  "questionText": "What should you do?",
  "choices": [
    { "letter": "A", "text": "First option" },
    { "letter": "B", "text": "Correct option" },
    { "letter": "C", "text": "Third option" },
    { "letter": "D", "text": "Fourth option" }
  ],
  "correctAnswer": "B",
  "hints": [
    { "level": 1, "label": "Brief Hint", "content": "A small nudge in the right direction." },
    { "level": 2, "label": "Detailed Hint", "content": "More detailed explanation." },
    { "level": 3, "label": "Answer Explanation", "content": "Complete explanation of why B is correct." }
  ]
}
```

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6 modules)
- **Testing**: Vitest with jsdom
- **Data Format**: JSON with JSON Schema validation

## License

This project is for educational purposes. Exam content is inspired by official certification objectives but is not affiliated with or endorsed by Microsoft, Amazon, Google, or Anthropic.

## Disclaimer

These study guides are supplementary materials. Always refer to official documentation:
- [Microsoft Learn](https://learn.microsoft.com/)
- [AWS Training](https://aws.amazon.com/training/)
- [Google Cloud Training](https://cloud.google.com/training)
- [Anthropic Documentation](https://docs.anthropic.com/)
