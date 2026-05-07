# Provider-Agnostic Plugin Architecture

## The Lesson

When a system needs to support multiple "providers" (vendors, brands, data sources) that share the same behavior but differ in branding and content, the architecture should make adding a new provider a data-only operation with minimal code changes. The code that distinguishes providers should be concentrated in one place, not scattered across the codebase.

## Context

A certification quiz site started with a single provider (Azure) and grew to 10 providers (Azure, AWS, GCP, Anthropic, CompTIA, ISC2, GitHub, Databricks, NVIDIA, Cisco) over several months. Each provider has its own landing page, exam data files, and brand colors, but shares the same quiz engine, data loader, progress tracker, and results page.

## How It Evolved

- **1 provider (Azure):** Everything hardcoded. Azure colors, Azure data paths, Azure back-links.
- **3 providers (Azure, AWS, GCP):** `getProviderFromExam()` added to detect provider from exam ID prefixes. Provider-specific logic consolidated into three maps: prefix→provider, provider→backLink, provider→displayName.
- **4 providers (+ Anthropic):** Pattern validated. Adding Anthropic required: one HTML file, one data directory, three map entries, zero engine changes.
- **10 providers:** Same pattern held. Six providers added in one commit with no changes to the quiz engine, data loader, or results page.

## Key Insights

- **The provider-detection function is the architectural keystone.** `getProviderFromExam()` is the single function that maps an exam code to a provider key. Everything else (back-links, display names, data paths, brand colors) derives from that key. Getting this function right — and keeping it as the only place provider-specific logic lives — is what makes the system scalable.
- **Convention over configuration for data paths.** `data/{provider}/{exam-code}.json` means no routing table is needed for data files. The provider key and exam code are sufficient to construct the path.
- **Brand colors are CSS, not code.** Provider-specific colors are CSS custom properties (`--p-azure`, `--p-aws`, etc.) set on the page's root element. The quiz engine and results page reference `--p-current` and never know which provider they're rendering.
- **Each provider page is a static HTML file, not a template.** This seems like duplication but is actually an advantage: each page can be independently edited, deployed, and cached. The shared behavior comes from the JS modules, not from server-side templating.
- **The invariant that protects this architecture:** "New providers must not introduce provider-specific rendering, storage, or navigation logic." This invariant has held across all 10 providers.

## Applicability

This pattern works for any system where multiple "brands" or "vendors" share the same behavior but differ in branding and content: multi-tenant SaaS dashboards, multi-publisher content platforms, multi-vendor comparison tools. It breaks down when providers need fundamentally different behavior (different question types, different scoring rules, different UI layouts) — at that point you need a strategy pattern or plugin interface, not just prefix-based routing.

## Related Lessons

- [Scaling Content Without Scaling Complexity](16-scaling-content.md) — the same architecture that enables 10 providers also enables 50+ exams with zero engine changes
- [Design System Migration](09-design-system-migration.md) — Atlas tokens provide provider brand colors as CSS variables, complementing the JS-level provider abstraction
