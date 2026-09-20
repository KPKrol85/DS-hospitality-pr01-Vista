#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const skippedSchemes = new Set(['http:', 'https:', 'mailto:', 'tel:', 'data:', 'blob:', 'javascript:']);

function isIgnoredReference(value) {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('#')) return true;

  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\d+.-]*:)/);
  if (schemeMatch) {
    return skippedSchemes.has(schemeMatch[1].toLowerCase());
  }

  if (trimmed.startsWith('//')) {
    return true;
  }

  return false;
}

function stripQueryAndHash(value) {
  return value.split('#')[0].split('?')[0];
}

function extractTagAttributeValues(html, tagName, attributeName) {
  const tagRegex = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const attrRegex = new RegExp(`\\b${attributeName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const values = [];

  for (const tagMatch of html.matchAll(tagRegex)) {
    const tag = tagMatch[0];
    const attrMatch = tag.match(attrRegex);
    if (!attrMatch) continue;

    const value = (attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '').trim();
    if (value) values.push(value);
  }

  return values;
}

function parseSrcsetCandidates(srcset) {
  return srcset
    .split(',')
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((candidate) => {
      const firstWhitespace = candidate.search(/\s/);
      return firstWhitespace === -1 ? candidate : candidate.slice(0, firstWhitespace);
    });
}

function toRelative(targetPath) {
  return path.relative(projectRoot, targetPath) || '.';
}

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function validateLocalReference(sourceFile, rawRef, kind, issues) {
  if (isIgnoredReference(rawRef)) return;

  const cleanRef = stripQueryAndHash(rawRef.trim());
  if (!cleanRef) return;

  const resolvedPath = cleanRef.startsWith('/')
    ? path.resolve(projectRoot, `.${cleanRef}`)
    : path.resolve(path.dirname(sourceFile), cleanRef);

  if (!(await fileExists(resolvedPath))) {
    issues.push(`${toRelative(sourceFile)} -> ${kind}="${rawRef}" (missing: ${toRelative(resolvedPath)})`);
  }
}

function parseSitemapLocs(xml) {
  const locRegex = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  return [...xml.matchAll(locRegex)].map((match) => match[1].trim()).filter(Boolean);
}

async function main() {
  const entries = await fs.readdir(projectRoot, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
    .map((entry) => path.join(projectRoot, entry.name))
    .sort((a, b) => a.localeCompare(b));

  const issues = [];

  for (const htmlFile of htmlFiles) {
    const html = await fs.readFile(htmlFile, 'utf8');

    const refs = [
      ...extractTagAttributeValues(html, 'a', 'href').map((value) => ({ kind: 'href', value })),
      ...extractTagAttributeValues(html, 'link', 'href').map((value) => ({ kind: 'href', value })),
      ...extractTagAttributeValues(html, 'script', 'src').map((value) => ({ kind: 'src', value })),
      ...extractTagAttributeValues(html, 'img', 'src').map((value) => ({ kind: 'src', value })),
      ...extractTagAttributeValues(html, 'source', 'srcset').flatMap((value) =>
        parseSrcsetCandidates(value).map((candidate) => ({ kind: 'srcset', value: candidate })),
      ),
    ];

    for (const ref of refs) {
      await validateLocalReference(htmlFile, ref.value, ref.kind, issues);
    }
  }

  const sitemapPath = path.join(projectRoot, 'sitemap.xml');
  if (await fileExists(sitemapPath)) {
    const sitemap = await fs.readFile(sitemapPath, 'utf8');
    const locs = parseSitemapLocs(sitemap);

    for (const loc of locs) {
      let url;
      try {
        url = new URL(loc);
      } catch {
        issues.push(`sitemap.xml -> invalid <loc>: ${loc}`);
        continue;
      }

      if (!/^https?:$/i.test(url.protocol)) {
        continue;
      }

      const pathname = decodeURIComponent(url.pathname);
      if (pathname.includes('..')) {
        issues.push(`sitemap.xml -> unsafe <loc> path: ${loc}`);
        continue;
      }

      const localTarget = pathname === '/'
        ? path.join(projectRoot, 'index.html')
        : path.join(projectRoot, pathname.replace(/^\//, ''));

      if (!(await fileExists(localTarget))) {
        issues.push(`sitemap.xml -> <loc>${loc}</loc> (missing: ${toRelative(localTarget)})`);
      }
    }
  } else {
    issues.push('sitemap.xml -> missing sitemap.xml');
  }

  if (issues.length > 0) {
    console.error(`Link integrity check failed with ${issues.length} issue(s):`);
    for (const issue of issues.sort()) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(`Link integrity check passed (${htmlFiles.length} HTML file(s) + sitemap.xml).`);
}

await main();
