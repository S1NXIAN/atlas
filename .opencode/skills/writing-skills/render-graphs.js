#!/usr/bin/env node

/**
 * Render graphviz diagrams from a skill's SKILL.md to SVG files.
 *
 * Usage:
 *   ./render-graphs.js <skill-directory>           # Render each diagram separately
 *   ./render-graphs.js <skill-directory> --combine # Combine all into one diagram
 *
 * Extracts all ```dot blocks from SKILL.md and renders to SVG.
 *
 * Requires: graphviz (dot) installed on system
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function extractDotBlocks(markdown) {
  const blocks = [];
  const regex = /```dot\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const content = match[1].trim();
    const nameMatch = content.match(/digraph\s+(\w+)/);
    const name = nameMatch ? nameMatch[1] : `graph_${blocks.length + 1}`;
    blocks.push({ name, content });
  }

  return blocks;
}

function renderToSvg(dotContent) {
  try {
    return execSync('dot -Tsvg', {
      input: dotContent,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });
  } catch (err) {
    console.error('Error running dot:', err.message);
    if (err.stderr) console.error(err.stderr.toString());
    return null;
  }
}

function main() {
  const args = process.argv.slice(2);
  const combine = args.includes('--combine');
  const skillDirArg = args.find(a => !a.startsWith('--'));

  if (!skillDirArg) {
    console.error('Usage: render-graphs.js <skill-directory> [--combine]');
    process.exit(1);
  }

  const skillDir = path.resolve(skillDirArg);
  const skillFile = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(skillFile)) {
    console.error(`Error: ${skillFile} not found`);
    process.exit(1);
  }

  try { execSync('which dot', { encoding: 'utf-8' }); }
  catch {
    console.error('Error: graphviz (dot) not found. Install with: apt install graphviz');
    process.exit(1);
  }

  const markdown = fs.readFileSync(skillFile, 'utf-8');
  const blocks = extractDotBlocks(markdown);

  if (blocks.length === 0) {
    console.log('No ```dot blocks found in', skillFile);
    process.exit(0);
  }

  const outputDir = path.join(skillDir, 'diagrams');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  for (const block of blocks) {
    const svg = renderToSvg(block.content);
    if (svg) {
      fs.writeFileSync(path.join(outputDir, `${block.name}.svg`), svg);
    }
  }

  console.log(`Rendered ${blocks.length} diagram(s) to ${outputDir}/`);
}

main();
