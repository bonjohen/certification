# Bulk Metadata Enrichment Scripts

## The Lesson

When hundreds of data records need the same type of update (adding titles, categories, tags, or enriched descriptions), writing a dedicated Python script that reads a manifest and patches the data files is orders of magnitude faster and more reliable than manual editing. The script is disposable, but the pattern is reusable.

## Context

The certification quiz had 10 new exam files (7 files in one batch) where each question needed: a title, a scenario, category references, difficulty level, and tags. With 50 questions per file, that's 350 questions × 5 fields = 1,750 individual edits. Manual editing was impractical.

## What Happened

1. A `patch_metadata.py` script was written to read a JSON manifest specifying per-question metadata
2. Manifest files were created for each exam (e.g., `scripts/manifests/aip-c01.json`) with question IDs and their metadata
3. The script parsed each XML file, located questions by ID, and inserted/updated the specified metadata elements
4. The process was applied to all 10 files across 3 commits, each covering a batch of 2-3 exams
5. Post-patch validation confirmed all files remained valid XML and loaded correctly

## Key Insights

- **Separate the data from the transformation.** The manifest (JSON) describes what to change. The script (Python) describes how to change it. This separation means the same script works for any exam file — only the manifest changes.
- **Manifests are reviewable.** A JSON file listing question IDs and their categories/tags can be reviewed by a domain expert who doesn't read Python. The transformation logic is separate from the content decisions.
- **XML manipulation in Python requires care.** Python's `xml.etree.ElementTree` doesn't preserve formatting, comments, or processing instructions. Libraries like `lxml` preserve more, but even they can reformat whitespace. The script should validate output against the schema, not against the original formatting.
- **Batch sizes should match review capacity.** Doing all 10 files in one commit makes review impossible. Batching 2-3 files per commit keeps diffs reviewable while maintaining efficiency.
- **The script is a one-time tool but the pattern recurs.** `patch_metadata.py` was used once for this specific enrichment. But the pattern (manifest + transformation script + validation) was reused for hint enrichment, answer randomization, and schema conversion.

## Information Needed to Complete This Document

- [ ] Include the manifest JSON structure (what fields, what format)
- [ ] Show the core loop of the patch script (read manifest → find question → insert elements)
- [ ] Document the validation steps that ran after patching
- [ ] Discuss alternatives: bulk editing in a spreadsheet, using XSLT transformations, manual editing
- [ ] Quantify: time to write the script + manifests vs estimated time for manual editing
