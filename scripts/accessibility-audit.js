#!/usr/bin/env node
/**
 * Accessibility audit for quiz.html using axe-core + jsdom.
 * Run: node scripts/accessibility-audit.js
 * Results written to: docs/accessibility-audit.md
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadPage(filename) {
  const html = readFileSync(join(root, filename), 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    resources: 'usable',
    url: `file://${root}/${filename}`,
  });
  return dom;
}

async function auditPage(filename) {
  const dom = loadPage(filename);
  const { window } = dom;

  // Inject axe into the page context
  const axeSource = readFileSync(
    join(root, 'node_modules/axe-core/axe.min.js'),
    'utf8'
  );
  window.eval(axeSource);

  const results = await new Promise((resolve, reject) => {
    window.axe.run(window.document, { reporter: 'v2' }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

  return results;
}

function severityEmoji(impact) {
  return { critical: 'CRITICAL', serious: 'SERIOUS', moderate: 'MODERATE', minor: 'MINOR' }[impact] || impact;
}

async function main() {
  const pages = [
    'index.html', 'quiz.html', 'results.html', 'lessons.html', 'lesson.html',
    'azure.html', 'aws.html', 'gcp.html', 'anthropic.html',
    'comptia.html', 'isc2.html', 'github.html', 'databricks.html', 'nvidia.html', 'cisco.html',
  ];
  const timestamp = new Date().toISOString().slice(0, 10);
  const lines = [
    `# Accessibility Audit`,
    ``,
    `**Date:** ${timestamp}`,
    `**Tool:** axe-core`,
    `**Pages audited:** ${pages.join(', ')}`,
    ``,
  ];

  let totalViolations = 0;

  for (const page of pages) {
    lines.push(`## ${page}`);
    lines.push('');
    try {
      const results = await auditPage(page);
      if (results.violations.length === 0) {
        lines.push('No violations found.');
      } else {
        totalViolations += results.violations.length;
        for (const v of results.violations) {
          lines.push(`### [${severityEmoji(v.impact)}] ${v.id}: ${v.description}`);
          lines.push(`- **Help:** ${v.helpUrl}`);
          lines.push(`- **Elements affected:** ${v.nodes.length}`);
          for (const node of v.nodes.slice(0, 3)) {
            lines.push(`  - \`${node.html.slice(0, 120)}\``);
          }
        }
      }
      lines.push('');
      lines.push(`**Passes:** ${results.passes.length} | **Violations:** ${results.violations.length} | **Incomplete:** ${results.incomplete.length}`);
    } catch (err) {
      lines.push(`Error auditing page: ${err.message}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push(`**Total violations across all pages:** ${totalViolations}`);
  lines.push('');

  const output = lines.join('\n');
  const outPath = join(root, 'docs', 'accessibility-audit.md');
  writeFileSync(outPath, output, 'utf8');
  console.log(`Audit complete. ${totalViolations} total violations found.`);
  console.log(`Results written to: docs/accessibility-audit.md`);
}

main().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
