#!/usr/bin/env python3
"""Convert variant-schema XML exam files to canonical certification.xsd format.

Handles two variant schemas found in the codebase:

Variant A (dea-c01, mla-c01):
  - <choice id="A"> → <choice letter="A">
  - <hint level="1" heading="Brief">text</hint> → <hint level="1" label="Brief Hint"><content>text</content></hint>
  - <list><item> → <ul><li>
  - <last-modified> as date not dateTime
  - <category id="..." name="..." /> → <category id="...">name text</category>

Variant B (ai-900, dp-900):
  - <choice id="A"> → <choice letter="A">
  - <hint level="1">text</hint> → <hint level="1" label="..."><content>text</content></hint>
  - <category-ref> as child element → attribute on <question>
  - <difficulty> as child element → attribute on <question>
  - question id like "ai900-q001" → numeric
  - <last-modified> before <created-date> → swap order
"""
import re
import sys
from pathlib import Path
from datetime import datetime


HINT_LABELS = {"1": "Brief Hint", "2": "Complete Explanation", "3": "Deep Knowledge"}


def convert_file(path: Path) -> str:
    """Read a variant-schema file and return canonical XML string."""
    text = path.read_text(encoding="utf-8")

    # Detect variant type
    is_variant_a = 'heading="' in text  # dea/mla style
    is_variant_b = "<category-ref>" in text and "<difficulty>" in text  # ai900/dp900 style

    if is_variant_a:
        text = convert_variant_a(text)
    elif is_variant_b:
        text = convert_variant_b(text)
    else:
        print(f"  Unknown variant in {path}, skipping")
        return text

    return text


def convert_variant_a(text: str) -> str:
    """Convert variant A (dea-c01, mla-c01) to canonical schema."""

    # Fix <category id="..." name="..." /> → <category id="...">name</category>
    text = re.sub(
        r'<category id="([^"]+)" name="([^"]+)"\s*/>',
        r'<category id="\1">\2</category>',
        text,
    )

    # Fix <choice id="X"> → <choice letter="X">
    text = re.sub(r'<choice id="([A-D])">', r'<choice letter="\1">', text)

    # Fix <last-modified>YYYY-MM-DD</last-modified> (no time) → add time
    text = re.sub(
        r"<last-modified>(\d{4}-\d{2}-\d{2})</last-modified>",
        r"<last-modified>\1T00:00:00Z</last-modified>",
        text,
    )

    # Fix hints: <hint level="N" heading="...">text</hint>
    # to <hint level="N" label="..."><content>text</content></hint>
    # Handle inline hints (no children)
    def fix_inline_hint(m):
        level = m.group(1)
        label = HINT_LABELS.get(level, m.group(2))
        content = m.group(3).strip()
        return f'<hint level="{level}" label="{label}">\n          <content>{content}</content>\n        </hint>'

    text = re.sub(
        r'<hint level="(\d)" heading="([^"]*)">((?:(?!<list>)(?!</hint>).)*)</hint>',
        fix_inline_hint,
        text,
        flags=re.DOTALL,
    )

    # Fix hints with <list><item>: convert to <ul><li> inside <content>
    def fix_list_hint(m):
        level = m.group(1)
        label = HINT_LABELS.get(level, m.group(2))
        list_block = m.group(3)
        # Convert <list> → <ul>, <item> → <li>
        list_block = list_block.replace("<list>", "<ul>").replace("</list>", "</ul>")
        list_block = list_block.replace("<item>", "<li>").replace("</item>", "</li>")
        return f'<hint level="{level}" label="{label}">\n          <content>{list_block.strip()}</content>\n        </hint>'

    text = re.sub(
        r'<hint level="(\d)" heading="([^"]*)">\s*(<list>.*?</list>)\s*</hint>',
        fix_list_hint,
        text,
        flags=re.DOTALL,
    )

    return text


def convert_variant_b(text: str) -> str:
    """Convert variant B (ai-900, dp-900) to canonical schema."""

    # Fix element order: <last-modified> before <created-date> → swap
    # Find and extract both elements
    lm_match = re.search(r"(\s*<last-modified>.*?</last-modified>)\n", text)
    cd_match = re.search(r"(\s*<created-date>.*?</created-date>)\n", text)
    if lm_match and cd_match:
        lm_pos = lm_match.start()
        cd_pos = cd_match.start()
        if lm_pos < cd_pos:
            # last-modified is before created-date — swap them
            lm_text = lm_match.group(1)
            cd_text = cd_match.group(1)
            # Remove both, then insert in correct order
            text = text[:lm_match.start()] + text[lm_match.end():]
            # Re-find created-date position after removal
            cd_match2 = re.search(r"(\s*<created-date>.*?</created-date>)\n", text)
            if cd_match2:
                insert_pos = cd_match2.end()
                text = text[:insert_pos] + lm_text + "\n" + text[insert_pos:]

    # Fix <choice id="X"> → <choice letter="X">
    text = re.sub(r'<choice id="([A-D])">', r'<choice letter="\1">', text)

    # Fix question elements: extract <category-ref> and <difficulty> child elements
    # and move them to attributes on <question>
    def fix_question(m):
        qid_raw = m.group(1)
        body = m.group(2)

        # Extract category-ref child element
        cat_match = re.search(r"<category-ref>([^<]+)</category-ref>\s*\n?", body)
        cat_ref = cat_match.group(1).strip() if cat_match else "cat-general"
        if cat_match:
            body = body[:cat_match.start()] + body[cat_match.end():]

        # Extract difficulty child element
        diff_match = re.search(r"<difficulty>([^<]+)</difficulty>\s*\n?", body)
        difficulty = diff_match.group(1).strip() if diff_match else "intermediate"
        if diff_match:
            body = body[:diff_match.start()] + body[diff_match.end():]

        # Extract numeric ID from patterns like "ai900-q001" or "dp900-q042"
        num_match = re.search(r"q(\d+)", qid_raw, re.IGNORECASE)
        if num_match:
            qid = str(int(num_match.group(1)))
        else:
            num_match = re.search(r"(\d+)", qid_raw)
            qid = str(int(num_match.group(1))) if num_match else qid_raw

        return f'<question id="{qid}" category-ref="{cat_ref}" difficulty="{difficulty}">{body}'

    text = re.sub(
        r'<question id="([^"]+)">(.*?)(?=<title>)',
        fix_question,
        text,
        flags=re.DOTALL,
    )

    # Fix inline hints: <hint level="N">text</hint>
    # to <hint level="N" label="..."><content>text</content></hint>
    def fix_inline_hint(m):
        level = m.group(1)
        label = HINT_LABELS.get(level, "Hint")
        content = m.group(2).strip()
        return f'<hint level="{level}" label="{label}">\n          <content>{content}</content>\n        </hint>'

    # Match hints that don't already have label= and don't contain child elements
    text = re.sub(
        r'<hint level="(\d)"(?![\s>]*label)>((?:(?!</hint>).)*)</hint>',
        fix_inline_hint,
        text,
        flags=re.DOTALL,
    )

    return text


def main():
    files = [
        Path("data/aws/dea-c01.xml"),
        Path("data/aws/mla-c01.xml"),
        Path("data/azure/ai-900.xml"),
        Path("data/azure/dp-900.xml"),
    ]

    for path in files:
        if not path.exists():
            print(f"SKIP {path}: not found")
            continue

        print(f"Converting {path} ...", end=" ")
        result = convert_file(path)
        path.write_text(result, encoding="utf-8")
        print("OK")


if __name__ == "__main__":
    main()
