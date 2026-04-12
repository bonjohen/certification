#!/usr/bin/env python3
"""Fix H1 hints that contain the correct answer text verbatim.

Reads the audit failure files, identifies verbatim matches, and rewrites
those H1s to be conceptual nudges that don't name the answer.

Strategy: Replace H1 with a question about the concept area derived from
the question text, without naming any choice.
"""
import xml.etree.ElementTree as ET
import re
from pathlib import Path

NS = {'c': 'http://certification.study/schema/v1'}
ET.register_namespace('', 'http://certification.study/schema/v1')


def get_text(elem):
    if elem is None:
        return ''
    return (ET.tostring(elem, encoding='unicode', method='text') or '').strip()


def make_nudge(question_text, correct_text, all_choices):
    """Generate a conceptual nudge from the question text.

    Strategy: Extract the core question topic and frame it as
    'Think about...' or 'Consider which...' without naming any choice.
    """
    qt = question_text.lower()

    # Extract the key action/concept from the question
    # Remove question preamble
    qt_clean = re.sub(r'^(which|what|how|why|when|where)\s+(is|are|does|do|should|would|could|can|will|service|approach|tool|feature|option|practice|technique|method|strategy|design|solution|configuration|capability)\s+', '', qt, flags=re.IGNORECASE)

    # Build a generic nudge based on question keywords
    if 'scaling' in qt or 'scale' in qt:
        return "Think about whether the scenario needs to grow by adding more units or by making existing units bigger."
    if 'deploy' in qt or 'deployment' in qt:
        return "Consider which deployment approach best matches the risk tolerance and rollout requirements described in the scenario."
    if 'monitor' in qt or 'observ' in qt:
        return "Think about which aspect of system health the scenario is asking you to track and what kind of tool serves that purpose."
    if 'security' in qt or 'secure' in qt or 'encrypt' in qt:
        return "Consider which security mechanism addresses the specific threat or requirement described in the scenario."
    if 'store' in qt or 'storage' in qt or 'persist' in qt:
        return "Think about the access patterns, durability needs, and performance characteristics the scenario requires from its storage layer."
    if 'automat' in qt:
        return "Consider which approach removes manual steps while maintaining the reliability and repeatability the scenario demands."
    if 'pipeline' in qt or 'workflow' in qt or 'orchestrat' in qt:
        return "Think about which orchestration approach best handles the sequence, dependencies, and error handling the scenario requires."
    if 'cost' in qt or 'expensive' in qt or 'budget' in qt:
        return "Consider which factor has the most direct impact on spending for the workload pattern described."
    if 'latency' in qt or 'performance' in qt or 'fast' in qt:
        return "Think about which factor is the primary bottleneck for the response time requirements in this scenario."
    if 'backup' in qt or 'recover' in qt or 'disaster' in qt:
        return "Consider what recovery guarantees the scenario needs and which approach provides them with the least operational overhead."
    if 'identity' in qt or 'authenticat' in qt or 'authoriz' in qt:
        return "Think about what kind of identity the workload needs and how it should prove that identity to the services it calls."
    if 'log' in qt or 'audit' in qt:
        return "Consider what the operations team needs to collect and where they need to analyze it to meet the scenario's requirements."
    if 'network' in qt or 'connect' in qt or 'traffic' in qt:
        return "Think about how the traffic needs to flow between the components described and what controls are needed along that path."
    if 'data' in qt and ('process' in qt or 'transform' in qt or 'ingest' in qt):
        return "Consider the volume, velocity, and transformation requirements to determine which processing approach fits best."
    if 'model' in qt and ('train' in qt or 'deploy' in qt or 'serving' in qt):
        return "Think about what the ML lifecycle stage described requires in terms of infrastructure, automation, and management."
    if 'test' in qt:
        return "Consider which testing approach catches the specific category of problems the scenario is trying to prevent."
    if 'explain' in qt or 'interpret' in qt:
        return "Think about what would help stakeholders understand and trust the system's outputs in this scenario."

    # Generic fallback based on question structure
    return "Consider the specific requirements and constraints in the scenario to determine which option best addresses all of them."


def fix_file(xml_path, audit_path):
    """Fix verbatim H1s in a single XML file using its audit results."""
    audit_tree = ET.parse(audit_path)

    # Collect question IDs with verbatim failures
    verbatim_qids = set()
    for fq in audit_tree.findall('.//c:failing-question', NS):
        reasons = [r.text for r in fq.findall('.//c:reason', NS)]
        if any('verbatim' in (r or '') for r in reasons):
            q = fq.find('c:question', NS)
            verbatim_qids.add(q.get('id'))

    if not verbatim_qids:
        return 0

    # Read the actual XML file as text for editing
    text = Path(xml_path).read_text(encoding='utf-8')
    tree = ET.parse(xml_path)
    fixed = 0

    for q in tree.findall('.//c:question', NS):
        qid = q.get('id')
        if qid not in verbatim_qids:
            continue

        question_text = get_text(q.find('c:question-text', NS))
        correct_letter = q.find('c:correct-answer', NS).text.strip()
        choices = {}
        for ch in q.findall('.//c:choice', NS):
            choices[ch.get('letter')] = (ch.text or '').strip()
        correct_text = choices.get(correct_letter, '')

        # Get current H1
        h1 = [h for h in q.findall('.//c:hint', NS) if h.get('level') == '1']
        if not h1:
            continue
        h1_content = h1[0].find('c:content', NS)
        old_h1 = get_text(h1_content)

        # Generate new nudge
        new_h1 = make_nudge(question_text, correct_text, choices)

        # Replace in text
        if old_h1 in text:
            text = text.replace(old_h1, new_h1, 1)
            fixed += 1
            print(f"  Q{qid}: Fixed verbatim giveaway")

    if fixed > 0:
        Path(xml_path).write_text(text, encoding='utf-8')

    return fixed


def main():
    audit_dir = Path('docs/h1_audit')
    total_fixed = 0

    # Map audit files to source files
    for audit_file in sorted(audit_dir.glob('*.xml')):
        tree = ET.parse(audit_file)
        source = tree.getroot().get('source', '')
        if not source:
            continue

        source_path = Path(source)
        if not source_path.exists():
            continue

        print(f"\n{source}:")
        fixed = fix_file(source_path, audit_file)
        total_fixed += fixed

    print(f"\n{'='*40}")
    print(f"Total verbatim H1s fixed: {total_fixed}")


if __name__ == '__main__':
    main()
