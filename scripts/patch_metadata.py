#!/usr/bin/env python3
"""
Patch exam XML file with metadata from a JSON manifest.

Applies categories, descriptive titles, unique scenarios, category-refs,
and topical tags to an exam XML file. Writes atomically via temp-then-rename.

Usage:
    python scripts/patch_metadata.py --file data/aws/aip-c01.xml --manifest scripts/manifests/aip-c01.json
"""

import argparse
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {'exam': 'http://certification.study/schema/v1'}
NS_URI = 'http://certification.study/schema/v1'

ET.register_namespace('', NS_URI)


def find_child(parent: ET.Element, tag_name: str) -> ET.Element | None:
    """Find child element, trying with namespace first, then without."""
    elem = parent.find(f'exam:{tag_name}', NS)
    if elem is not None:
        return elem
    return parent.find(tag_name)


def find_all_children(parent: ET.Element, tag_name: str) -> list[ET.Element]:
    """Find all child elements, trying with namespace first, then without."""
    results = parent.findall(f'exam:{tag_name}', NS)
    if results:
        return results
    return parent.findall(tag_name)


def ns(tag: str) -> str:
    """Return Clark-notation namespaced tag."""
    return f'{{{NS_URI}}}{tag}'


def load_manifest(manifest_path: Path) -> dict:
    with open(manifest_path, encoding='utf-8') as f:
        return json.load(f)


def validate_manifest(manifest: dict, xml_path: Path) -> list[str]:
    """Return list of validation errors (empty = OK)."""
    errors = []
    category_ids = {c['id'] for c in manifest.get('categories', [])}

    if not manifest.get('categories'):
        errors.append('Manifest has no categories defined')

    for q in manifest.get('questions', []):
        qid = q.get('id', '?')
        if not q.get('title'):
            errors.append(f'Question {qid}: missing title')
        if not q.get('scenario'):
            errors.append(f'Question {qid}: missing scenario')
        if not q.get('category_ref'):
            errors.append(f'Question {qid}: missing category_ref')
        elif q['category_ref'] not in category_ids:
            errors.append(f'Question {qid}: category_ref "{q["category_ref"]}" not in defined categories')
        tags = q.get('tags', [])
        if len(tags) < 2:
            errors.append(f'Question {qid}: fewer than 2 tags ({tags})')

    return errors


def patch_file(xml_path: Path, manifest: dict, dry_run: bool = False) -> None:
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # --- Patch categories in metadata ---
    metadata = find_child(root, 'metadata')
    if metadata is None:
        print(f'ERROR: no <metadata> found in {xml_path}', file=sys.stderr)
        sys.exit(1)

    # Remove existing categories block
    existing_cats = find_child(metadata, 'categories')
    if existing_cats is not None:
        metadata.remove(existing_cats)

    # Build new categories element
    cats_elem = ET.SubElement(metadata, ns('categories'))
    for cat in manifest['categories']:
        cat_elem = ET.SubElement(cats_elem, ns('category'))
        cat_elem.set('id', cat['id'])
        cat_elem.text = cat['label']

    # --- Build lookup: question id -> manifest entry ---
    q_map = {str(q['id']): q for q in manifest['questions']}

    # --- Patch each question ---
    questions_elem = find_child(root, 'questions')
    if questions_elem is None:
        print(f'ERROR: no <questions> found in {xml_path}', file=sys.stderr)
        sys.exit(1)

    patched = 0
    missing = []
    for question in find_all_children(questions_elem, 'question'):
        qid = question.get('id', '')
        if qid not in q_map:
            missing.append(qid)
            continue

        entry = q_map[qid]

        # Update category-ref attribute
        question.set('category-ref', entry['category_ref'])

        # Update title
        title_elem = find_child(question, 'title')
        if title_elem is not None:
            title_elem.text = entry['title']

        # Update scenario
        scenario_elem = find_child(question, 'scenario')
        if scenario_elem is not None:
            scenario_elem.text = entry['scenario']
        else:
            # Insert scenario after title (before question-text)
            title_elem = find_child(question, 'title')
            idx = list(question).index(title_elem) + 1 if title_elem is not None else 0
            scenario_new = ET.Element(ns('scenario'))
            scenario_new.text = entry['scenario']
            question.insert(idx, scenario_new)

        # Replace tags
        tags_elem = find_child(question, 'tags')
        if tags_elem is not None:
            question.remove(tags_elem)
        tags_new = ET.SubElement(question, ns('tags'))
        for tag_text in entry['tags']:
            tag_elem = ET.SubElement(tags_new, ns('tag'))
            tag_elem.text = tag_text

        patched += 1

    if missing:
        print(f'WARNING: {len(missing)} question IDs in XML not found in manifest: {missing[:5]}{"..." if len(missing) > 5 else ""}', file=sys.stderr)

    print(f'Patched {patched}/{patched + len(missing)} questions in {xml_path.name}')

    if dry_run:
        print('Dry run — no file written.')
        return

    # Write atomically
    temp_path = xml_path.with_suffix('.xml.tmp')
    tree.write(temp_path, encoding='unicode', xml_declaration=True)
    temp_path.replace(xml_path)
    print(f'Written: {xml_path}')


def main():
    parser = argparse.ArgumentParser(description='Patch exam XML with metadata manifest')
    parser.add_argument('--file', required=True, help='Path to exam XML file')
    parser.add_argument('--manifest', required=True, help='Path to JSON manifest file')
    parser.add_argument('--dry-run', action='store_true', help='Validate and report without writing')
    args = parser.parse_args()

    xml_path = Path(args.file)
    manifest_path = Path(args.manifest)

    if not xml_path.exists():
        print(f'ERROR: XML file not found: {xml_path}', file=sys.stderr)
        sys.exit(1)
    if not manifest_path.exists():
        print(f'ERROR: Manifest file not found: {manifest_path}', file=sys.stderr)
        sys.exit(1)

    manifest = load_manifest(manifest_path)
    errors = validate_manifest(manifest, xml_path)
    if errors:
        print('Manifest validation errors:', file=sys.stderr)
        for e in errors:
            print(f'  {e}', file=sys.stderr)
        sys.exit(1)

    patch_file(xml_path, manifest, dry_run=args.dry_run)


if __name__ == '__main__':
    main()
