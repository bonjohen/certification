#!/usr/bin/env python3
"""
Randomize answer positions in certification exam XML files.

This script walks through XML exam files, randomly assigns a new letter (A-D)
for each question's correct answer, and swaps the choice metadata accordingly.
"""

import argparse
import xml.etree.ElementTree as ET
import random
import re
import sys
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple, Optional

# XML namespace used in the exam files
NS = {'exam': 'http://certification.study/schema/v1'}

# Register namespace to preserve it in output
ET.register_namespace('', 'http://certification.study/schema/v1')

LETTERS = ['A', 'B', 'C', 'D']


def extract_question_number(question_id: str) -> int:
    """Extract numeric portion from question ID (e.g., 'dea-004' -> 4, '42' -> 42, 'ai900-q001' -> 1)."""
    # Handle patterns like "ai900-q001" - extract the number after 'q'
    match = re.search(r'q(\d+)', question_id, re.IGNORECASE)
    if match:
        return int(match.group(1))
    # Handle patterns like "dea-004" - extract trailing number after hyphen
    match = re.search(r'-(\d+)$', question_id)
    if match:
        return int(match.group(1))
    # Fall back to finding any number
    match = re.search(r'(\d+)', question_id)
    if match:
        return int(match.group(1))
    return 0


def find_child(parent: ET.Element, tag_name: str) -> Optional[ET.Element]:
    """Find child element, trying with namespace first, then without."""
    # Try with namespace
    elem = parent.find(f'exam:{tag_name}', NS)
    if elem is not None:
        return elem
    # Try without namespace
    return parent.find(tag_name)


def find_all_children(parent: ET.Element, tag_name: str) -> List[ET.Element]:
    """Find all child elements, trying with namespace first, then without."""
    # Try with namespace
    elems = parent.findall(f'exam:{tag_name}', NS)
    if elems:
        return elems
    # Try without namespace
    return parent.findall(tag_name)


def get_current_answer(question: ET.Element) -> Optional[Tuple[str, int]]:
    """
    Get the current correct answer for a question (no modifications).

    Returns: (current_letter, question_number) or None if skipped
    """
    question_id = question.get('id')
    choices_elem = find_child(question, 'choices')
    correct_answer_elem = find_child(question, 'correct-answer')

    if choices_elem is None or correct_answer_elem is None:
        return None

    current_letter = correct_answer_elem.text.strip()
    qnum = extract_question_number(question_id)

    # Validate choices exist
    choice_elements = find_all_children(choices_elem, 'choice')
    if len(choice_elements) < 4:
        return None

    return (current_letter, qnum)


def randomize_question(question: ET.Element) -> Optional[Tuple[str, str, int]]:
    """
    Randomize the correct answer position for a single question.

    Returns: (original_letter, new_letter, question_number) or None if skipped
    """
    question_id = question.get('id')
    choices_elem = find_child(question, 'choices')
    correct_answer_elem = find_child(question, 'correct-answer')

    if choices_elem is None or correct_answer_elem is None:
        return None

    original_letter = correct_answer_elem.text.strip()
    new_letter = random.choice(LETTERS)

    # Extract question number for statistics
    qnum = extract_question_number(question_id)

    # Find choice elements - handle both 'letter' and 'id' attributes
    choice_elements = find_all_children(choices_elem, 'choice')
    choices = {}
    for c in choice_elements:
        # Try 'letter' attribute first, then 'id'
        letter = c.get('letter') or c.get('id')
        if letter:
            choices[letter] = c

    # Check if we have all 4 choices
    if len(choices) < 4:
        print(f"  Warning: Question {question_id} has only {len(choices)} choices, skipping")
        return None

    if original_letter not in choices or new_letter not in choices:
        print(f"  Warning: Question {question_id} missing choice {original_letter} or {new_letter}")
        return None

    if original_letter == new_letter:
        # No swap needed
        return (original_letter, new_letter, qnum)

    # Swap the text content of the two choices
    original_choice = choices[original_letter]
    new_choice = choices[new_letter]

    original_text = original_choice.text
    new_text = new_choice.text

    original_choice.text = new_text
    new_choice.text = original_text

    # Update the correct answer to the new letter
    correct_answer_elem.text = new_letter

    return (original_letter, new_letter, qnum)


def analyze_exam_file(filepath: Path) -> List[Tuple[str, int]]:
    """
    Analyze a single exam XML file without making changes.

    Returns: List of (current_letter, question_number) tuples
    """
    print(f"\nAnalyzing: {filepath.name}")

    tree = ET.parse(filepath)
    root = tree.getroot()

    # Try with namespace first, then without
    questions = root.findall('.//exam:question', NS)
    if not questions:
        questions = root.findall('.//question')
    results = []

    for question in questions:
        result = get_current_answer(question)
        if result:
            results.append(result)

    print(f"  Found {len(results)} questions")
    return results


def process_exam_file(filepath: Path) -> List[Tuple[str, int]]:
    """
    Process a single exam XML file, randomizing all question answers.

    Returns: List of (new_letter, question_number) tuples
    """
    print(f"\nProcessing: {filepath.name}")

    tree = ET.parse(filepath)
    root = tree.getroot()

    # Try with namespace first, then without
    questions = root.findall('.//exam:question', NS)
    if not questions:
        questions = root.findall('.//question')
    results = []

    for question in questions:
        result = randomize_question(question)
        if result:
            original, new, qnum = result
            results.append((new, qnum))
            if original != new:
                print(f"  Q{qnum}: {original} -> {new}")

    # Write back to file using write-to-temp-then-rename pattern
    temp_path = filepath.with_suffix('.xml.tmp')
    tree.write(temp_path, encoding='UTF-8', xml_declaration=True)

    # Replace original with temp
    temp_path.replace(filepath)

    print(f"  Processed {len(results)} questions")
    return results


def print_statistics(all_results: Dict[str, List[Tuple[str, int]]], label: str = ""):
    """
    Print statistics similar to the SQL query:
    SELECT Letter AS Answer, count(*) AS COUNT,
           COUNT(*)/50.0 AS Percentage,
           AVG(QuestionNumber) AS Placement
    FROM Answers
    GROUP BY Letter
    """
    print("\n" + "=" * 70)
    title = f"OVERALL STATISTICS - {label}" if label else "OVERALL STATISTICS (All Exams)"
    print(title)
    print("=" * 70)

    # Aggregate all results
    all_answers = []
    for exam, results in all_results.items():
        all_answers.extend(results)

    # Group by letter
    by_letter = defaultdict(list)
    for letter, qnum in all_answers:
        by_letter[letter].append(qnum)

    total = len(all_answers)

    print(f"\n{'Answer':<10} {'Count':<10} {'Percentage':<15} {'Avg Placement':<15}")
    print("-" * 50)

    for letter in LETTERS:
        count = len(by_letter[letter])
        percentage = (count / total * 100) if total > 0 else 0
        avg_placement = sum(by_letter[letter]) / count if count > 0 else 0
        print(f"{letter:<10} {count:<10} {percentage:>6.2f}%{'':<8} {avg_placement:>6.2f}")

    print("-" * 50)
    print(f"{'Total':<10} {total:<10}")

    # Per-exam statistics
    print("\n" + "=" * 70)
    per_exam_title = f"PER-EXAM STATISTICS - {label}" if label else "PER-EXAM STATISTICS"
    print(per_exam_title)
    print("=" * 70)

    for exam, results in sorted(all_results.items()):
        print(f"\n{exam}:")
        exam_by_letter = defaultdict(list)
        for letter, qnum in results:
            exam_by_letter[letter].append(qnum)

        exam_total = len(results)
        print(f"  {'Answer':<8} {'Count':<8} {'Percentage':<12} {'Avg Placement':<15}")
        print(f"  {'-' * 45}")

        for letter in LETTERS:
            count = len(exam_by_letter[letter])
            percentage = (count / exam_total * 100) if exam_total > 0 else 0
            avg_placement = sum(exam_by_letter[letter]) / count if count > 0 else 0
            print(f"  {letter:<8} {count:<8} {percentage:>6.2f}%{'':<5} {avg_placement:>6.2f}")


def main():
    parser = argparse.ArgumentParser(
        description='Randomize answer positions in certification exam XML files.'
    )
    parser.add_argument(
        '--show-current',
        action='store_true',
        help='Show statistics for current answer distribution without making changes'
    )
    args = parser.parse_args()

    # Find data directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_dir = project_root / 'data'

    if not data_dir.exists():
        print(f"Error: Data directory not found: {data_dir}")
        sys.exit(1)

    # Optional: Set seed for reproducibility (remove for true randomness)
    # random.seed(42)

    # Find all XML exam files
    xml_files = list(data_dir.glob('**/*.xml'))

    if not xml_files:
        print("No XML files found in data directory")
        sys.exit(1)

    print(f"Found {len(xml_files)} exam files")

    if args.show_current:
        print("\n[ANALYSIS MODE - No changes will be made]")

    # Always collect BEFORE statistics first
    print("\n--- Collecting BEFORE statistics ---")
    before_results = {}
    for xml_file in sorted(xml_files):
        exam_name = f"{xml_file.parent.name}/{xml_file.stem}"
        results = analyze_exam_file(xml_file)
        before_results[exam_name] = results

    if args.show_current:
        # In show-current mode, after is the same as before
        after_results = before_results
    else:
        # Process files (randomize) and collect AFTER statistics
        print("\n--- Processing files ---")
        after_results = {}
        for xml_file in sorted(xml_files):
            exam_name = f"{xml_file.parent.name}/{xml_file.stem}"
            results = process_exam_file(xml_file)
            after_results[exam_name] = results

    # Print BEFORE statistics
    print_statistics(before_results, "BEFORE")

    # Print AFTER statistics
    print_statistics(after_results, "AFTER")

    if args.show_current:
        print("\n[OK] Analysis complete (no changes made)")
    else:
        print("\n[OK] All files processed successfully")


if __name__ == '__main__':
    main()
