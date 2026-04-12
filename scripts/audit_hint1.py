#!/usr/bin/env python3
"""Audit Hint 1 entries across all exam XML files.

Checks each question's Hint 1 against quality criteria:
1. Must not name the correct answer directly (matching correct choice text)
2. Must not use unique terminology from the correct choice that doesn't appear in other choices
3. Must be shorter and less revealing than Hint 2
4. Must not strongly eliminate three choices (leaving only one plausible)

Produces a per-file report XML containing only the failing questions.
"""
import xml.etree.ElementTree as ET
import os
import re
import sys
from pathlib import Path

NS = {'c': 'http://certification.study/schema/v1'}
ET.register_namespace('', 'http://certification.study/schema/v1')


def get_text(elem):
    """Get all text content from an element, including children."""
    if elem is None:
        return ''
    return (ET.tostring(elem, encoding='unicode', method='text') or '').strip()


def get_inner_xml(elem):
    """Get inner XML as string."""
    if elem is None:
        return ''
    return (ET.tostring(elem, encoding='unicode') or '').strip()


def extract_key_terms(text):
    """Extract significant technical terms (4+ chars, not common words) from text.

    Uses an aggressive stop list to reduce false positives from generic English words.
    Only flags truly distinctive technical terminology.
    """
    stop_words = {
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
        'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'between', 'under', 'over',
        'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
        'neither', 'each', 'every', 'all', 'any', 'few', 'more', 'most',
        'other', 'some', 'such', 'no', 'only', 'same', 'than', 'too',
        'very', 'just', 'because', 'if', 'when', 'where', 'how', 'what',
        'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'it',
        'its', 'they', 'them', 'their', 'we', 'us', 'our', 'you', 'your',
        'he', 'him', 'his', 'she', 'her', 'about', 'up', 'out', 'then',
        'also', 'use', 'used', 'using', 'like', 'think', 'consider',
        'approach', 'best', 'most', 'service', 'provides', 'provide',
        'based', 'data', 'system', 'solution', 'model', 'type', 'need',
        'needs', 'without', 'while', 'well', 'rather', 'whether',
        # Additional generic words that cause false positives
        'what', 'make', 'makes', 'made', 'way', 'ways', 'work', 'works',
        'working', 'first', 'second', 'third', 'new', 'different', 'specific',
        'right', 'correct', 'change', 'changes', 'changed', 'help', 'helps',
        'helped', 'reduce', 'reduces', 'increase', 'increases', 'ensure',
        'ensures', 'allow', 'allows', 'enable', 'enables', 'support',
        'supports', 'require', 'requires', 'required', 'create', 'creates',
        'manage', 'manages', 'managed', 'handling', 'handle', 'handles',
        'control', 'controls', 'process', 'processes', 'access', 'level',
        'high', 'low', 'large', 'small', 'multiple', 'single', 'many',
        'time', 'value', 'values', 'cost', 'costs', 'performance',
        'application', 'applications', 'resources', 'resource', 'network',
        'scenario', 'problem', 'task', 'tasks', 'option', 'options',
        'feature', 'features', 'tool', 'tools', 'component', 'components',
        'pattern', 'patterns', 'design', 'architecture', 'available',
        'across', 'between', 'within', 'over', 'under', 'through',
        'direct', 'directly', 'instead', 'already', 'still', 'even',
        'another', 'certain', 'given', 'keep', 'keeps', 'run', 'runs',
        'running', 'start', 'stop', 'set', 'sets', 'setting', 'check',
        'checks', 'test', 'tests', 'testing', 'code', 'server', 'client',
        'request', 'requests', 'response', 'responses', 'input', 'output',
        'file', 'files', 'key', 'keys', 'name', 'names', 'role', 'roles',
        'policy', 'policies', 'rule', 'rules', 'group', 'groups',
        'instance', 'instances', 'user', 'users', 'account', 'accounts',
        'region', 'regions', 'zone', 'zones', 'project', 'projects',
        'environment', 'environments', 'deploy', 'deploys', 'deployment',
        'build', 'builds', 'monitor', 'monitors', 'monitoring', 'log',
        'logs', 'logging', 'secure', 'security', 'private', 'public',
        'connect', 'connects', 'connection', 'route', 'routes', 'routing',
        'store', 'stores', 'storage', 'query', 'queries', 'table', 'tables',
        'database', 'databases', 'index', 'load', 'scale', 'scales',
        'scaling', 'traffic', 'virtual', 'machine', 'machines', 'compute',
        'memory', 'disk', 'image', 'images', 'container', 'containers',
        'cluster', 'clusters', 'node', 'nodes', 'agent', 'agents',
        'pipeline', 'pipelines', 'workflow', 'workflows', 'step', 'steps',
        'stage', 'stages', 'layer', 'layers', 'standard', 'default',
        'custom', 'global', 'local', 'internal', 'external', 'primary',
        'secondary', 'main', 'core', 'basic', 'advanced', 'full',
        'complete', 'partial', 'total', 'overall', 'general', 'common',
        'responsibility', 'document', 'documents', 'define', 'defines',
        'defined', 'configure', 'configures', 'configured', 'configuration',
        'implement', 'implements', 'implementation', 'integration',
        'operation', 'operations', 'operational', 'production',
        'development', 'optimize', 'optimizes', 'optimization',
        'automate', 'automates', 'automated', 'automation', 'version',
        'versions', 'update', 'updates', 'updated', 'maintain', 'maintains',
        'central', 'separate', 'combined', 'additional', 'existing',
        'approach', 'result', 'results', 'impact', 'risk', 'issue',
        'issues', 'error', 'errors', 'failure', 'failures', 'success',
        'proposition',
    }
    words = re.findall(r'[a-zA-Z][a-zA-Z0-9_.-]+', text.lower())
    return {w for w in words if w not in stop_words and len(w) >= 4}


def audit_question(q):
    """Audit a single question's H1. Returns list of failure reasons, or empty list if OK."""
    failures = []

    correct_letter = q.find('c:correct-answer', NS)
    if correct_letter is None:
        return ['Missing correct-answer element']
    correct_letter = correct_letter.text.strip()

    # Get choices
    choices = {}
    for ch in q.findall('.//c:choice', NS):
        letter = ch.get('letter')
        text = (ch.text or '').strip()
        choices[letter] = text

    correct_text = choices.get(correct_letter, '')
    wrong_texts = [t for l, t in choices.items() if l != correct_letter]

    # Get hints
    hints = q.findall('.//c:hint', NS)
    h1_elem = None
    h2_elem = None
    for h in hints:
        if h.get('level') == '1':
            h1_elem = h
        elif h.get('level') == '2':
            h2_elem = h

    if h1_elem is None:
        return ['Missing hint level 1']

    h1_content = h1_elem.find('c:content', NS)
    h1_text = get_text(h1_content)
    h2_content = h2_elem.find('c:content', NS) if h2_elem is not None else None
    h2_text = get_text(h2_content)

    h1_lower = h1_text.lower()

    # Test 1: Does H1 contain the correct answer text nearly verbatim?
    correct_lower = correct_text.lower()
    if len(correct_lower) >= 5 and correct_lower in h1_lower:
        failures.append(f'H1 contains correct answer text verbatim: "{correct_text}"')

    # Test 2: Unique terminology check
    # Find terms in correct answer that don't appear in ANY wrong answer
    correct_terms = extract_key_terms(correct_text)
    wrong_terms = set()
    for wt in wrong_texts:
        wrong_terms.update(extract_key_terms(wt))

    unique_correct_terms = correct_terms - wrong_terms
    h1_terms = extract_key_terms(h1_text)
    leaked_terms = unique_correct_terms & h1_terms
    if leaked_terms:
        failures.append(f'H1 uses unique correct-answer terms not in other choices: {leaked_terms}')

    # Test 3: H1 should be shorter than H2
    if h2_text and len(h1_text) >= len(h2_text):
        failures.append(f'H1 ({len(h1_text)} chars) is not shorter than H2 ({len(h2_text)} chars)')

    # Test 4: Check if H1 explicitly eliminates wrong answers
    elimination_count = 0
    for wt in wrong_texts:
        wt_lower = wt.lower()
        # Check if H1 says something like "not X" or "X is not" for wrong answers
        key_wrong_terms = extract_key_terms(wt)
        unique_wrong = key_wrong_terms - correct_terms
        for term in unique_wrong:
            if re.search(rf'\bnot\b.*\b{re.escape(term)}\b|\b{re.escape(term)}\b.*\bnot\b', h1_lower):
                elimination_count += 1
                break
    if elimination_count >= 3:
        failures.append(f'H1 explicitly eliminates {elimination_count} of 3 wrong answers')

    return failures


def audit_file(xml_path):
    """Audit all questions in a file. Returns list of (question_element, failures)."""
    tree = ET.parse(xml_path)
    results = []
    for q in tree.findall('.//c:question', NS):
        failures = audit_question(q)
        if failures:
            results.append((q, failures))
    return results, tree


def write_failures(failures_list, source_tree, output_path, source_path):
    """Write failing questions to an output XML file."""
    root = ET.Element('hint1-audit')
    root.set('source', str(source_path))
    root.set('total-questions', str(len(source_tree.findall('.//c:question', NS))))
    root.set('failing-questions', str(len(failures_list)))

    for q_elem, failures in failures_list:
        # Create a wrapper with failure reasons
        wrapper = ET.SubElement(root, 'failing-question')
        reasons = ET.SubElement(wrapper, 'failure-reasons')
        for f in failures:
            reason = ET.SubElement(reasons, 'reason')
            reason.text = f

        # Copy the entire question element
        wrapper.append(q_elem)

    tree = ET.ElementTree(root)
    ET.indent(tree, space='  ')
    tree.write(output_path, encoding='unicode', xml_declaration=True)


def main():
    output_dir = Path('docs/h1_audit')
    output_dir.mkdir(parents=True, exist_ok=True)

    data_dir = Path('data')
    total_questions = 0
    total_failures = 0
    file_results = []

    # Process each provider directory
    for provider_dir in sorted(data_dir.iterdir()):
        if not provider_dir.is_dir() or provider_dir.name == 'schema':
            continue

        for xml_file in sorted(provider_dir.glob('*.xml')):
            failures, tree = audit_file(xml_file)
            q_count = len(tree.findall('.//c:question', NS))
            total_questions += q_count
            total_failures += len(failures)

            rel_path = xml_file.relative_to(data_dir)
            status = f'FAIL ({len(failures)}/{q_count})' if failures else f'PASS ({q_count}/{q_count})'
            print(f'  {rel_path}: {status}')
            file_results.append((xml_file, len(failures), q_count))

            if failures:
                out_name = f'{provider_dir.name}_{xml_file.stem}_h1_failures.xml'
                out_path = output_dir / out_name
                write_failures(failures, tree, out_path, xml_file)

    print(f'\n{"="*60}')
    print(f'Total: {total_failures} failing questions out of {total_questions}')
    print(f'Files with failures: {sum(1 for _, f, _ in file_results if f > 0)}/{len(file_results)}')
    if total_failures > 0:
        print(f'\nFailure files written to {output_dir}/')


if __name__ == '__main__':
    main()
