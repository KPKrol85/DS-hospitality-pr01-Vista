#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();

// Only these directories are read, so dependencies, dist/, caches, and temporary output are never scanned.
const SOURCE_DIRS = [
  { dir: 'js', extensions: ['.js'] },
  { dir: 'js/features', extensions: ['.js'] },
  { dir: 'pwa', extensions: ['.js'] },
  { dir: 'netlify/edge-functions', extensions: ['.js'] },
  { dir: 'scripts', extensions: ['.mjs'] },
  { dir: '.', extensions: ['.cjs', '.mjs'] },
  { dir: 'assets/seo', extensions: ['.json'] },
];

// Browser .js files load as ES modules unless listed here (blocking <script> and the service worker template).
const CLASSIC_SCRIPTS = new Set(['js/theme-init.js', 'pwa/service-worker.js']);

const CHECK_LABELS = {
  module: 'ES module syntax',
  script: 'classic script syntax',
  commonjs: 'CommonJS syntax',
  json: 'JSON syntax',
};

function getCheckKind(relPath) {
  const ext = path.extname(relPath);
  if (ext === '.json') return 'json';
  if (ext === '.cjs') return 'commonjs';
  if (ext === '.mjs') return 'module';
  return CLASSIC_SCRIPTS.has(relPath) ? 'script' : 'module';
}

function withLine(line, message) {
  return line ? `line ${line}: ${message}` : message;
}

function checkModule(source) {
  // vm.SourceTextModule is still experimental, so the module goal is parsed by `node --check`, which never evaluates code.
  const result = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: source, encoding: 'utf8' });
  if (result.error) return `node --check could not run: ${result.error.message}`;
  if (result.status === 0) return null;

  const line = result.stderr.match(/^\[stdin\]:(\d+)$/m)?.[1];
  const message = result.stderr.match(/^\w*Error: .+$/m)?.[0] ?? result.stderr.trim();
  return withLine(line, message);
}

function checkSource(kind, source, relPath) {
  if (kind === 'module') return checkModule(source);

  try {
    if (kind === 'json') {
      JSON.parse(source.replace(/^﻿/, ''));
    } else if (kind === 'script') {
      new vm.Script(source, { filename: relPath });
    } else {
      vm.compileFunction(source, ['exports', 'require', 'module', '__filename', '__dirname'], { filename: relPath });
    }
    return null;
  } catch (error) {
    // V8 compile errors start their stack with "<filename>:<line>"; JSON errors include the position in the message.
    const line = kind === 'json' ? null : error.stack?.split('\n', 1)[0].match(/:(\d+)$/)?.[1];
    return withLine(line, `${error.name}: ${error.message}`);
  }
}

async function collectFiles(issues) {
  const files = [];

  for (const { dir, extensions } of SOURCE_DIRS) {
    let entries;
    try {
      entries = await fs.readdir(path.join(projectRoot, dir), { withFileTypes: true });
    } catch (error) {
      issues.push(`${dir}/ -> cannot read directory (${error.code || error.message})`);
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || entry.name.endsWith('.min.js')) continue;
      if (extensions.includes(path.extname(entry.name))) {
        files.push(path.posix.join(dir, entry.name));
      }
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

async function main() {
  const issues = [];
  const files = await collectFiles(issues);
  let jsonCount = 0;

  for (const relPath of files) {
    const kind = getCheckKind(relPath);
    if (kind === 'json') jsonCount += 1;

    const source = await fs.readFile(path.join(projectRoot, relPath), 'utf8');
    const problem = checkSource(kind, source, relPath);
    if (problem) {
      issues.push(`${relPath} (${CHECK_LABELS[kind]}) -> ${problem}`);
    }
  }

  if (issues.length > 0) {
    console.error(`Syntax check failed with ${issues.length} issue(s):`);
    for (const issue of issues.sort()) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(`Syntax check passed (${files.length - jsonCount} JavaScript file(s) + ${jsonCount} JSON file(s)).`);
}

await main();
