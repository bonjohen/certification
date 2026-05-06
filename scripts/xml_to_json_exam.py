#!/usr/bin/env python3
"""
Convert one certification XML exam file to JSON and validate it.

Usage:
  python scripts/xml_to_json_exam.py data/azure/az-900.xml

Outputs:
  data/azure/az-900.json
  data/schema/certification.schema.json
"""

from __future__ import annotations

import argparse
import html
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

try:
    from jsonschema import Draft202012Validator
except ImportError:
    raise SystemExit("Missing dependency: jsonschema")


ALLOWED_FORMAT_TAGS = {"p", "strong", "em", "code", "ul", "ol", "li"}

SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://certification.study/schema/certification.schema.json",
    "title": "Certification Exam JSON Schema",
    "type": "object",
    "additionalProperties": False,
    "required": ["version", "metadata", "questions", "glossary"],
    "properties": {
        "version": {"type": "string", "minLength": 1},
        "metadata": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "examCode",
                "examTitle",
                "provider",
                "description",
                "totalQuestions",
                "createdDate",
                "lastModified",
                "categories",
            ],
            "properties": {
                "examCode": {"type": "string", "minLength": 1},
                "examTitle": {"type": "string", "minLength": 1},
                "provider": {"type": "string", "minLength": 1},
                "description": {"type": "string"},
                "totalQuestions": {"type": "integer", "minimum": 1},
                "createdDate": {"type": "string", "format": "date"},
                "lastModified": {"type": "string", "format": "date-time"},
                "categories": {
                    "type": "object",
                    "additionalProperties": {"type": "string", "minLength": 1},
                },
            },
        },
        "questions": {
            "type": "array",
            "minItems": 1,
            "items": {"$ref": "#/$defs/question"},
        },
        "glossary": {
            "type": "object",
            "additionalProperties": {"$ref": "#/$defs/glossaryTerm"},
        },
    },
    "$defs": {
        "question": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "id",
                "categoryRef",
                "difficulty",
                "title",
                "scenario",
                "questionText",
                "choices",
                "correctAnswer",
                "hints",
                "tags",
            ],
            "properties": {
                "id": {"type": "integer", "minimum": 1},
                "categoryRef": {"type": "string"},
                "difficulty": {
                    "type": "string",
                    "enum": ["basic", "intermediate", "advanced"],
                },
                "title": {"type": "string", "minLength": 1},
                "scenario": {"type": "string"},
                "questionText": {"type": "string", "minLength": 1},
                "choices": {
                    "type": "array",
                    "minItems": 4,
                    "maxItems": 4,
                    "items": {"$ref": "#/$defs/choice"},
                },
                "correctAnswer": {
                    "type": "string",
                    "enum": ["A", "B", "C", "D"],
                },
                "hints": {
                    "type": "array",
                    "minItems": 3,
                    "maxItems": 3,
                    "items": {"$ref": "#/$defs/hint"},
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string", "minLength": 1},
                    "uniqueItems": True,
                },
            },
        },
        "choice": {
            "type": "object",
            "additionalProperties": False,
            "required": ["letter", "text"],
            "properties": {
                "letter": {"type": "string", "enum": ["A", "B", "C", "D"]},
                "text": {"type": "string", "minLength": 1},
            },
        },
        "hint": {
            "type": "object",
            "additionalProperties": False,
            "required": ["level", "label", "content"],
            "properties": {
                "level": {"type": "integer", "minimum": 1, "maximum": 3},
                "label": {"type": "string"},
                "content": {"type": "string", "minLength": 1},
            },
        },
        "glossaryTerm": {
            "type": "object",
            "additionalProperties": False,
            "required": ["id", "category", "name", "definition", "examNote", "relatedTerms"],
            "properties": {
                "id": {"type": "string", "minLength": 1},
                "category": {"type": "string"},
                "name": {"type": "string", "minLength": 1},
                "definition": {"type": "string", "minLength": 1},
                "examNote": {"type": "string"},
                "relatedTerms": {
                    "type": "array",
                    "items": {"type": "string", "minLength": 1},
                    "uniqueItems": True,
                },
            },
        },
    },
}


def strip_ns(tag: str) -> str:
    return tag.rsplit("}", 1)[-1] if "}" in tag else tag


def direct_children(parent: ET.Element, name: str) -> list[ET.Element]:
    return [child for child in list(parent) if strip_ns(child.tag) == name]


def find_child(parent: ET.Element, name: str) -> ET.Element | None:
    matches = direct_children(parent, name)
    return matches[0] if matches else None


def text_of(parent: ET.Element, name: str, default: str = "") -> str:
    child = find_child(parent, name)
    if child is None:
        return default
    return "".join(child.itertext()).strip()


def int_or_default(value: str | None, default: int) -> int:
    try:
        return int(value) if value is not None and value != "" else default
    except ValueError:
        return default


def inner_html_of_child(parent: ET.Element, name: str) -> str:
    child = find_child(parent, name)
    if child is None:
        return ""
    return render_inner_html(child)


def render_inner_html(element: ET.Element) -> str:
    parts: list[str] = []

    if element.text:
        parts.append(html.escape(element.text, quote=False))

    for child in list(element):
        parts.append(render_element_html(child))
        if child.tail:
            parts.append(html.escape(child.tail, quote=False))

    return "".join(parts).strip()


def render_element_html(element: ET.Element) -> str:
    tag = strip_ns(element.tag)

    if tag in ALLOWED_FORMAT_TAGS:
        inner = render_inner_html(element)
        return f"<{tag}>{inner}</{tag}>"

    return html.escape("".join(element.itertext()), quote=False)


def parse_exam(xml_path: Path) -> dict[str, Any]:
    tree = ET.parse(xml_path)
    root = tree.getroot()

    if strip_ns(root.tag) != "certification-exam":
        raise ValueError(f"Expected root <certification-exam>, found <{strip_ns(root.tag)}>")

    metadata = find_child(root, "metadata")
    if metadata is None:
        raise ValueError("Missing <metadata>")

    questions = find_child(root, "questions")
    if questions is None:
        raise ValueError("Missing <questions>")

    return {
        "version": root.attrib.get("version", ""),
        "metadata": parse_metadata(metadata),
        "questions": parse_questions(questions),
        "glossary": parse_glossary(root),
    }


def parse_metadata(metadata: ET.Element) -> dict[str, Any]:
    return {
        "examCode": text_of(metadata, "exam-code"),
        "examTitle": text_of(metadata, "exam-title"),
        "provider": text_of(metadata, "provider"),
        "description": text_of(metadata, "description"),
        "totalQuestions": int_or_default(text_of(metadata, "total-questions"), 0),
        "createdDate": text_of(metadata, "created-date"),
        "lastModified": text_of(metadata, "last-modified"),
        "categories": parse_categories(metadata),
    }


def parse_categories(metadata: ET.Element) -> dict[str, str]:
    categories_node = find_child(metadata, "categories")
    if categories_node is None:
        return {}

    categories: dict[str, str] = {}
    for category in direct_children(categories_node, "category"):
        category_id = category.attrib.get("id", "").strip()
        category_name = "".join(category.itertext()).strip()
        if category_id:
            categories[category_id] = category_name

    return categories


def parse_questions(questions_node: ET.Element) -> list[dict[str, Any]]:
    questions: list[dict[str, Any]] = []

    for index, question in enumerate(direct_children(questions_node, "question"), start=1):
        question_id = int_or_default(question.attrib.get("id"), index)

        category_ref = (
            question.attrib.get("category-ref")
            or text_of(question, "category-ref")
            or ""
        )

        difficulty = (
            question.attrib.get("difficulty")
            or text_of(question, "difficulty")
            or "intermediate"
        )

        questions.append(
            {
                "id": question_id,
                "categoryRef": category_ref,
                "difficulty": difficulty,
                "title": text_of(question, "title"),
                "scenario": inner_html_of_child(question, "scenario"),
                "questionText": inner_html_of_child(question, "question-text"),
                "choices": parse_choices(question),
                "correctAnswer": text_of(question, "correct-answer"),
                "hints": parse_hints(question),
                "tags": parse_tags(question),
            }
        )

    return questions


def parse_choices(question: ET.Element) -> list[dict[str, str]]:
    choices_node = find_child(question, "choices")
    if choices_node is None:
        return []

    choices: list[dict[str, str]] = []

    for choice in direct_children(choices_node, "choice"):
        letter = choice.attrib.get("letter") or choice.attrib.get("id") or ""
        choices.append(
            {
                "letter": letter.strip(),
                "text": "".join(choice.itertext()).strip(),
            }
        )

    return sorted(choices, key=lambda item: item["letter"])


def parse_hints(question: ET.Element) -> list[dict[str, Any]]:
    hints_node = find_child(question, "hints")
    if hints_node is None:
        return []

    hints: list[dict[str, Any]] = []

    for hint in direct_children(hints_node, "hint"):
        level = int_or_default(hint.attrib.get("level"), 1)
        label = hint.attrib.get("label", f"Level {level}")
        content_node = find_child(hint, "content")
        content = render_inner_html(content_node) if content_node is not None else "".join(hint.itertext()).strip()

        hints.append(
            {
                "level": level,
                "label": label,
                "content": content,
            }
        )

    return sorted(hints, key=lambda item: item["level"])


def parse_tags(question: ET.Element) -> list[str]:
    tags_node = find_child(question, "tags")
    if tags_node is None:
        return []

    return [
        "".join(tag.itertext()).strip()
        for tag in direct_children(tags_node, "tag")
        if "".join(tag.itertext()).strip()
    ]


def parse_glossary(root: ET.Element) -> dict[str, dict[str, Any]]:
    glossary_node = find_child(root, "glossary")
    if glossary_node is None:
        return {}

    glossary: dict[str, dict[str, Any]] = {}

    for term in direct_children(glossary_node, "term"):
        term_id = term.attrib.get("id", "").strip()
        if not term_id:
            continue

        related_terms_node = find_child(term, "related-terms")
        related_terms = []
        if related_terms_node is not None:
            related_terms = [
                "".join(ref.itertext()).strip()
                for ref in direct_children(related_terms_node, "term-ref")
                if "".join(ref.itertext()).strip()
            ]

        glossary[term_id] = {
            "id": term_id,
            "category": term.attrib.get("category", ""),
            "name": text_of(term, "name"),
            "definition": inner_html_of_child(term, "definition"),
            "examNote": text_of(term, "exam-note"),
            "relatedTerms": related_terms,
        }

    return glossary


def validate_schema(data: dict[str, Any]) -> None:
    validator = Draft202012Validator(SCHEMA)
    errors = sorted(validator.iter_errors(data), key=lambda error: list(error.absolute_path))

    if errors:
        lines = ["JSON Schema validation failed:"]
        for error in errors:
            path = "$" + "".join(
                f"[{part}]" if isinstance(part, int) else f".{part}"
                for part in error.absolute_path
            )
            lines.append(f"  {path}: {error.message}")
        raise ValueError("\n".join(lines))


def validate_semantics(data: dict[str, Any]) -> None:
    errors: list[str] = []

    metadata = data["metadata"]
    questions = data["questions"]
    categories = metadata.get("categories", {})

    if metadata["totalQuestions"] != len(questions):
        errors.append(
            f"metadata.totalQuestions is {metadata['totalQuestions']}, "
            f"but found {len(questions)} questions"
        )

    ids = [question["id"] for question in questions]
    duplicate_ids = sorted({question_id for question_id in ids if ids.count(question_id) > 1})
    if duplicate_ids:
        errors.append(f"Duplicate question IDs: {duplicate_ids}")

    for question in questions:
        qid = question["id"]

        if question["categoryRef"] and categories and question["categoryRef"] not in categories:
            errors.append(
                f"Question {qid}: categoryRef '{question['categoryRef']}' "
                f"does not exist in metadata.categories"
            )

        choice_letters = [choice["letter"] for choice in question["choices"]]
        if sorted(choice_letters) != ["A", "B", "C", "D"]:
            errors.append(f"Question {qid}: choices must contain exactly A, B, C, D")

        if question["correctAnswer"] not in choice_letters:
            errors.append(
                f"Question {qid}: correctAnswer '{question['correctAnswer']}' "
                f"is not one of the choice letters"
            )

        hint_levels = [hint["level"] for hint in question["hints"]]
        if hint_levels != [1, 2, 3]:
            errors.append(f"Question {qid}: hints must contain levels 1, 2, 3 in order")

    for glossary_key, term in data["glossary"].items():
        if glossary_key != term["id"]:
            errors.append(
                f"Glossary key '{glossary_key}' does not match term.id '{term['id']}'"
            )

    if errors:
        raise ValueError("Semantic validation failed:\n  " + "\n  ".join(errors))


def validate_exam(data: dict[str, Any]) -> None:
    validate_schema(data)
    validate_semantics(data)


def write_schema(schema_path: Path) -> None:
    schema_path.parent.mkdir(parents=True, exist_ok=True)
    schema_path.write_text(
        json.dumps(SCHEMA, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def write_json(data: dict[str, Any], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert one certification XML file to JSON and validate it."
    )
    parser.add_argument("xml_file", type=Path)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Output JSON path. Defaults to same path with .json extension.",
    )
    parser.add_argument(
        "--schema-path",
        type=Path,
        default=Path("data/schema/certification.schema.json"),
        help="Where to write the JSON schema.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    xml_path: Path = args.xml_file
    output_path: Path = args.output or xml_path.with_suffix(".json")
    schema_path: Path = args.schema_path

    if not xml_path.exists():
        print(f"ERROR: XML file not found: {xml_path}", file=sys.stderr)
        return 1

    try:
        write_schema(schema_path)

        data = parse_exam(xml_path)
        validate_exam(data)

        write_json(data, output_path)

        reloaded = json.loads(output_path.read_text(encoding="utf-8"))
        validate_exam(reloaded)

    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print(f"Schema written: {schema_path}")
    print(f"JSON written:   {output_path}")
    print("Validation:     PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())