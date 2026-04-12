#!/usr/bin/env python3
"""Convert new-format XML exam files to the project's canonical schema.

Reads simplified XML like:
  <exam><title>...</title><provider>...</provider><level>...</level><questions>
    <question id="1">
      <prompt>...</prompt>
      <choices><choice correct="true/false">...</choice>...</choices>
      <hint level="1">...</hint>
      <explanation>...</explanation>
    </question>
  </questions></exam>

And writes the full certification-exam schema used by the quiz engine.
"""
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import date, datetime

# Map filename stems to metadata
FILE_META = {
    "aip-c01": {
        "exam-code": "AIP-C01",
        "exam-title": "AWS Certified Generative AI Developer - Professional",
        "provider": "Amazon Web Services",
        "description": "Scenario-Based Study Guide for AIP-C01 certification - validates ability to develop generative AI applications using AWS services including Amazon Bedrock, SageMaker, and related AI/ML tools.",
    },
    "ai-102": {
        "exam-code": "AI-102",
        "exam-title": "Microsoft Azure AI Engineer Associate",
        "provider": "Microsoft Azure",
        "description": "Scenario-Based Study Guide for AI-102 certification - validates skills in designing and implementing Azure AI solutions including cognitive services, OpenAI integration, and knowledge mining.",
    },
    "ai-300": {
        "exam-code": "AI-300",
        "exam-title": "Microsoft Azure MLOps Engineer Associate",
        "provider": "Microsoft Azure",
        "description": "Scenario-Based Study Guide for AI-300 certification - validates skills in operationalizing machine learning models using Azure Machine Learning, CI/CD pipelines, and monitoring.",
    },
    "az-700": {
        "exam-code": "AZ-700",
        "exam-title": "Microsoft Azure Network Engineer Associate",
        "provider": "Microsoft Azure",
        "description": "Scenario-Based Study Guide for AZ-700 certification - validates skills in designing, implementing, and managing Azure networking solutions including VNets, load balancing, and hybrid connectivity.",
    },
    "cloud-data-engineer": {
        "exam-code": "cloud-data-engineer",
        "exam-title": "Google Cloud Professional Cloud Database Engineer",
        "provider": "Google Cloud",
        "description": "Scenario-Based Study Guide for Professional Cloud Database Engineer certification - validates skills in designing, managing, and troubleshooting Google Cloud database solutions.",
    },
    "gen-ai-leader": {
        "exam-code": "gen-ai-leader",
        "exam-title": "Google Cloud Generative AI Leader",
        "provider": "Google Cloud",
        "description": "Scenario-Based Study Guide for Generative AI Leader certification - validates understanding of generative AI concepts, Vertex AI, and enterprise AI strategy on Google Cloud.",
    },
    "pro-ml-eng": {
        "exam-code": "pro-ml-eng",
        "exam-title": "Google Cloud Professional Machine Learning Engineer",
        "provider": "Google Cloud",
        "description": "Scenario-Based Study Guide for Professional Machine Learning Engineer certification - validates skills in designing, building, and productionizing ML models on Google Cloud.",
    },
}

HINT_LABELS = {
    "1": "Brief Hint",
    "2": "Complete Explanation",
    "3": "Deep Knowledge",
}

LETTERS = ["A", "B", "C", "D", "E", "F"]


def clean_source(text: str) -> str:
    """Remove non-XML preamble (e.g. bare title line before <exam>)."""
    # Find the first < that starts the XML
    idx = text.find("<")
    if idx > 0:
        text = text[idx:]
    return text.strip()


def parse_source(path: Path) -> tuple:
    """Parse the simplified XML and return (metadata_from_file, questions)."""
    raw = path.read_text(encoding="utf-8")
    raw = clean_source(raw)
    root = ET.fromstring(raw)

    questions = []
    for q in root.iter("question"):
        qid = q.get("id")
        prompt = q.findtext("prompt", "").strip()

        # Parse choices — find correct answer letter
        choices = []
        correct_letter = None
        for i, ch in enumerate(q.findall("choices/choice")):
            letter = LETTERS[i]
            text = (ch.text or "").strip()
            if ch.get("correct") == "true":
                correct_letter = letter
            choices.append((letter, text))

        # Parse hints
        hints = []
        for h in q.findall("hint"):
            level = h.get("level", "1")
            text = (h.text or "").strip()
            hints.append((level, text))

        # Parse explanation (becomes part of hint 2 if hint 2 is short)
        explanation = (q.findtext("explanation") or "").strip()

        questions.append({
            "id": qid,
            "prompt": prompt,
            "choices": choices,
            "correct": correct_letter,
            "hints": hints,
            "explanation": explanation,
        })

    return questions


def build_output(meta: dict, questions: list) -> str:
    """Build the canonical XML string."""
    today = date.today().isoformat()
    now = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    total = len(questions)

    lines = []
    lines.append("<?xml version='1.0' encoding='UTF-8'?>")
    lines.append('<certification-exam xmlns="http://certification.study/schema/v1" version="1.0">')
    lines.append("  <metadata>")
    lines.append(f"    <exam-code>{esc(meta['exam-code'])}</exam-code>")
    lines.append(f"    <exam-title>{esc(meta['exam-title'])}</exam-title>")
    lines.append(f"    <provider>{esc(meta['provider'])}</provider>")
    lines.append(f"    <description>{esc(meta['description'])}</description>")
    lines.append(f"    <total-questions>{total}</total-questions>")
    lines.append(f"    <created-date>{today}</created-date>")
    lines.append(f"    <last-modified>{now}</last-modified>")
    lines.append("    <categories>")
    lines.append('      <category id="cat-general">General</category>')
    lines.append("    </categories>")
    lines.append("  </metadata>")
    lines.append("")
    lines.append("  <questions>")

    for q in questions:
        lines.append(f'    <question id="{q["id"]}" category-ref="cat-general" difficulty="intermediate">')
        lines.append(f"      <title>Question {q['id']}</title>")
        lines.append(f"      <scenario>You are preparing for the {esc(meta['exam-title'])} certification exam.</scenario>")
        lines.append(f"      <question-text>{esc(q['prompt'])}</question-text>")
        lines.append("      <choices>")
        for letter, text in q["choices"]:
            lines.append(f'        <choice letter="{letter}">{esc(text)}</choice>')
        lines.append("      </choices>")
        lines.append(f"      <correct-answer>{q['correct']}</correct-answer>")
        lines.append("      <hints>")

        # Build hints — use file hints if present, fill in from explanation
        hint_map = {h[0]: h[1] for h in q["hints"]}
        explanation = q["explanation"]

        # Hint 1
        h1_text = hint_map.get("1", "Consider the key concept being tested.")
        lines.append('        <hint level="1" label="Brief Hint">')
        lines.append(f"          <content>{esc(h1_text)}</content>")
        lines.append("        </hint>")

        # Hint 2 — use explanation if available and hint 2 is short/missing
        h2_text = hint_map.get("2", "")
        if explanation and (not h2_text or len(h2_text) < len(explanation)):
            h2_text = explanation
        elif not h2_text:
            h2_text = "Review the core concepts related to this question."
        lines.append('        <hint level="2" label="Complete Explanation">')
        lines.append(f"          <content>{esc(h2_text)}</content>")
        lines.append("        </hint>")

        # Hint 3
        h3_text = hint_map.get("3", "")
        if h3_text:
            lines.append('        <hint level="3" label="Deep Knowledge">')
            lines.append(f"          <content>{esc(h3_text)}</content>")
            lines.append("        </hint>")

        lines.append("      </hints>")
        lines.append("      <tags>")
        lines.append(f"        <tag>{esc(meta['exam-code'])}</tag>")
        lines.append("      </tags>")
        lines.append("    </question>")
        lines.append("")

    lines.append("  </questions>")
    lines.append("</certification-exam>")
    return "\n".join(lines) + "\n"


def esc(text: str) -> str:
    """Escape XML special characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("\u2013", "-")  # en-dash
        .replace("\u2014", "-")  # em-dash
        .replace("\u2018", "'")  # left single quote
        .replace("\u2019", "'")  # right single quote
        .replace("\u201c", '"')  # left double quote
        .replace("\u201d", '"')  # right double quote
    )


def main():
    files = [
        "data/aws/aip-c01.xml",
        "data/azure/ai-102.xml",
        "data/azure/ai-300.xml",
        "data/azure/az-700.xml",
        "data/gcp/cloud-data-engineer.xml",
        "data/gcp/gen-ai-leader.xml",
        "data/gcp/pro-ml-eng.xml",
    ]

    for fpath in files:
        p = Path(fpath)
        stem = p.stem
        if stem not in FILE_META:
            print(f"SKIP {fpath}: no metadata defined")
            continue

        meta = FILE_META[stem]
        print(f"Converting {fpath} ...", end=" ")

        questions = parse_source(p)
        output = build_output(meta, questions)
        p.write_text(output, encoding="utf-8")
        print(f"OK ({len(questions)} questions)")


if __name__ == "__main__":
    main()
