# Schema Variant Consolidation

## The Lesson

When multiple people or processes author data files for the same system without a shared schema, variant schemas emerge. The variants look similar enough to pass casual inspection but differ in element names, nesting structure, or attribute naming — causing parser failures on some files but not others. Consolidation requires a conversion script, not manual editing.

## Context

The certification quiz had a canonical XML schema (`certification.xsd`) used by most exam files. But four files used a "variant" schema with different conventions:
- `heading` instead of `label` for hint labels
- `<list><item>` instead of `<ul><li>` for structured content
- Inline hint text instead of `<content>` wrapper elements
- `id` instead of `letter` on choice elements

These files loaded in the browser (the XML parser was lenient) but failed XSD validation with hundreds of errors each.

## What Happened

1. The hint enrichment audit identified 4 files with 855+ XSD validation errors each
2. Root cause: these files were authored using a different authoring tool/template
3. A conversion script (`convert_variant_schema.py`) was written to programmatically transform variant schema files to canonical schema
4. The 4 files were converted, re-validated, and committed
5. After conversion, hint enrichment could proceed on a uniform schema

## Key Insights

- **Lenient parsers hide schema drift.** The browser's `DOMParser` would parse `<heading>` and `<label>` equally well — it doesn't validate against a schema. This meant variant files "worked" in the application but were structurally wrong.
- **Schema validation is the only reliable detector.** Visual inspection of XML files doesn't reveal schema variants (the content looks the same). Only running the files against the XSD or JSON Schema reveals structural differences.
- **Variant schemas are a parallel authoring problem.** They emerge when two people start authoring independently, each making reasonable but different structural choices. The solution is to establish the canonical schema early and validate against it on every commit.
- **Conversion scripts must be mechanical, not manual.** With 50 questions × multiple elements per question × 4 files, manual editing is error-prone. A script that handles element renaming, attribute mapping, and nesting restructuring is both safer and faster.
- **After consolidation, delete the conversion script or archive it.** It's a one-time tool. Leaving it in the active scripts directory implies it might be needed again, which suggests the schema drift problem hasn't been solved.

## Information Needed to Complete This Document

- [ ] Show a side-by-side comparison of canonical vs variant schema for the same question
- [ ] Document the specific element/attribute mappings the conversion script handled
- [ ] Discuss how to prevent schema drift in the future (pre-commit validation, authoring templates)
- [ ] Quantify: how many validation errors were produced by each variant file?
- [ ] Consider the generalized lesson for any multi-author data pipeline
