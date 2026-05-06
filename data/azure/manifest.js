// Manifest of Azure exams. State + retire notes are editorial metadata
// not present in the JSON files themselves; everything else (title, desc,
// level, question count) is fetched at runtime from data/azure/<slug>.json.
window.AZURE_MANIFEST = [
  { slug: "ai-102", state: "ending-soon", retire: "Retiring Jun 30, 2026. Replaced by AI-103.",
    desc: "Design and implement Azure AI solutions including cognitive services, OpenAI integration, and knowledge mining." },
  { slug: "ai-103", state: "new",
    desc: "Develop AI applications and agents using Microsoft Foundry, generative AI, knowledge connections, multimodal AI, and prompt engineering." },
  { slug: "ai-200", state: "new",
    desc: "Build AI-powered cloud solutions covering compute, containers, serverless APIs, Azure Functions, messaging, monitoring, and troubleshooting." },
  { slug: "ai-300", state: "new",
    desc: "Operationalize machine learning models using Azure Machine Learning, CI/CD pipelines, and monitoring." },
  { slug: "ai-900", state: "ending-soon", retire: "Retiring Jun 30, 2026. Replaced by AI-901.",
    desc: "Validate foundational knowledge of machine learning, AI concepts, computer vision, NLP, and generative AI on Azure." },
  { slug: "ai-901", state: "new",
    desc: "Foundational knowledge of AI and machine learning concepts, Azure AI services, computer vision, NLP, generative AI, and responsible AI." },
  { slug: "az-104", state: "active",
    desc: "Validate practical skills for implementing, managing, and monitoring core Azure services." },
  { slug: "az-204", state: "ending-soon", retire: "Retiring Jul 31, 2026. Replacement: AI-200.",
    desc: "Design, build, test, deploy, and maintain cloud-native applications on Microsoft Azure." },
  { slug: "az-305", state: "active",
    desc: "Design identity, governance, data storage, business continuity, and infrastructure solutions." },
  { slug: "az-400", state: "active",
    desc: "Design and implement DevOps practices for version control, CI/CD, security, and infrastructure as code." },
  { slug: "az-500", state: "ending-soon", retire: "Retiring Aug 31, 2026. Replacement: SC-500.",
    desc: "Implement security controls, manage identity and access, and protect data, applications, and networks." },
  { slug: "az-700", state: "new",
    desc: "Design, implement, and manage Azure networking solutions including VNets, load balancing, and hybrid connectivity." },
  { slug: "az-900", state: "active",
    desc: "Validate foundational knowledge of cloud concepts, Azure services, security, privacy, and pricing." },
  { slug: "dp-600", state: "new",
    desc: "Prepare and enrich data for analytics, secure and maintain assets, and manage semantic models using Microsoft Fabric." },
  { slug: "dp-900", state: "active",
    desc: "Validate foundational knowledge of core data concepts, relational and non-relational data, and analytics workloads." },
  { slug: "sc-500", state: "new",
    desc: "Secure AI workloads covering authentication, trust boundaries, Microsoft Defender for Cloud, AI Foundry security, identity controls, and compliance." }
];

// Map exam codes/levels to a normalized level for grouping.
// The JSON has difficulty per question, not exam-level — so we infer from
// code prefix conventions: *-9xx = Beginner, AI-103/200/300/AZ-104/204/700/DP-600 = Intermediate/Associate, *-3xx/4xx/5xx = Advanced.
window.AZURE_LEVEL_FOR = function(code) {
  const c = code.toUpperCase();
  if (/-9\d{2}$/.test(c)) return "Beginner";
  if (c === "AZ-104" || c === "AZ-204" || c === "AI-200") return "Intermediate";
  if (c === "AI-102" || c === "AI-103" || c === "AI-300" || c === "AZ-700" || c === "DP-600") return "Associate";
  return "Advanced";
};
