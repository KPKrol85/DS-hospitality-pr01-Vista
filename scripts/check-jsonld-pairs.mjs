#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { deepStrictEqual } from 'node:assert/strict';

const projectRoot = process.cwd();
const assetRoot = path.join(projectRoot, 'assets', 'seo');

function parseAttributes(source) {
  const attributes = new Map();
  const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of source.matchAll(attributePattern)) {
    const name = match[1].toLowerCase();
    if (attributes.has(name)) throw new Error(`duplicate ${name} attribute`);
    attributes.set(name, match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

function findPair(html) {
  const references = [];
  const fallbacks = [];
  // Match whole tags/raw-text blocks so comments and script contents cannot create fake declarations.
  // This is a focused extractor for the project's static HTML, not a general HTML parser.
  const tagPattern = /<!--[\s\S]*?-->|<(script|style|textarea|title)\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/\1\s*>|<([a-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  for (const match of html.matchAll(tagPattern)) {
    const tagName = (match[1] ?? match[4] ?? '').toLowerCase();
    if (tagName !== 'meta' && tagName !== 'script') continue;
    const attributes = parseAttributes(match[2] ?? match[5]);
    if (tagName === 'meta' && attributes.get('name') === 'ld-json') {
      references.push(attributes.get('content'));
    }
    if (tagName === 'script' && attributes.get('data-seo-jsonld') === 'fallback') {
      if (attributes.get('type') !== 'application/ld+json') {
        throw new Error('fallback must have type="application/ld+json"');
      }
      if (match[3] === undefined) throw new Error('fallback is missing its closing </script>');
      fallbacks.push(match[3]);
    }
  }

  if (references.length !== 1) {
    throw new Error(`expected one meta[name="ld-json"], found ${references.length}`);
  }
  if (fallbacks.length !== 1) {
    throw new Error(`expected one JSON-LD fallback, found ${fallbacks.length}`);
  }
  return { reference: references[0], fallback: fallbacks[0] };
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function resolveReference(reference) {
  if (!reference?.trim()) throw new Error('ld-json meta is missing a non-empty content path');
  // Follow local link conventions: accept root-relative paths and ignore query/hash suffixes.
  const localPath = decodeURIComponent(reference.trim().split(/[?#]/, 1)[0]);
  if (!localPath || localPath.startsWith('//') || /[:\\?#]/.test(localPath)) {
    throw new Error(`ld-json reference must be a local JSON path: ${reference}`);
  }
  const target = path.resolve(projectRoot, localPath.startsWith('/') ? `.${localPath}` : localPath);
  if (!isWithin(assetRoot, target) || path.extname(target) !== '.json') {
    throw new Error(`ld-json reference must stay within assets/seo/ and name a .json file: ${reference}`);
  }
  // Also prevent a symlink within assets/seo/ from escaping the asset scope.
  const realTarget = await fs.realpath(target);
  if (!isWithin(await fs.realpath(assetRoot), realTarget)) {
    throw new Error(`ld-json reference resolves outside assets/seo/: ${reference}`);
  }
  return realTarget;
}

function parseJson(source, label) {
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`${label} contains invalid JSON (${error.message})`);
  }
}

async function main() {
  const entries = await fs.readdir(projectRoot, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
    .map((entry) => entry.name)
    .sort();
  const issues = [];
  if (htmlFiles.length === 0) issues.push('no root HTML files found');

  for (const filename of htmlFiles) {
    try {
      const html = await fs.readFile(path.join(projectRoot, filename), 'utf8');
      const { reference, fallback } = findPair(html);
      const embedded = parseJson(fallback, 'embedded fallback');
      let externalSource;
      try {
        externalSource = await fs.readFile(await resolveReference(reference), 'utf8');
      } catch (error) {
        throw new Error(`external JSON (${reference ?? 'missing content'}) -> ${error.message}`);
      }
      const external = parseJson(externalSource, `external JSON (${reference})`);
      deepStrictEqual(embedded, external, `embedded fallback and external JSON (${reference}) differ`);
    } catch (error) {
      issues.push(`${filename} -> ${error.message}`);
    }
  }

  if (issues.length > 0) {
    console.error(`JSON-LD pair check failed with ${issues.length} issue(s) (${htmlFiles.length} root HTML file(s) checked):`);
    for (const issue of issues.sort()) console.error(`- ${issue}`);
    process.exitCode = 1;
    return;
  }
  console.log(`JSON-LD pair check passed (${htmlFiles.length} pair(s)).`);
}

await main().catch((error) => {
  console.error(`JSON-LD pair check failed: ${error.message}`);
  process.exitCode = 1;
});
