#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = process.cwd();

// Tags whose attribute lists image candidates that the browser selects by width descriptor.
const CANDIDATE_ATTRIBUTES = new Map([
  ['img', 'srcset'],
  ['source', 'srcset'],
  ['link', 'imagesrcset'],
]);

function lineAt(text, offset) {
  let line = 1;
  for (let index = text.indexOf('\n'); index !== -1 && index < offset; index = text.indexOf('\n', index + 1)) {
    line += 1;
  }
  return line;
}

function* findCandidateAttributes(html) {
  // Match whole tags and skip comments; this is a focused extractor for the project's static HTML, not a general HTML parser.
  const tagPattern = /<!--[\s\S]*?-->|<([a-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/dgi;
  const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/dg;

  for (const tagMatch of html.matchAll(tagPattern)) {
    const attributeName = CANDIDATE_ATTRIBUTES.get(tagMatch[1]?.toLowerCase());
    if (!attributeName) continue;

    const attributesOffset = tagMatch.indices[2][0];
    for (const attributeMatch of tagMatch[2].matchAll(attributePattern)) {
      if (attributeMatch[1].toLowerCase() !== attributeName) continue;
      const valueGroup = [2, 3, 4].find((group) => attributeMatch[group] !== undefined);
      if (valueGroup === undefined) continue;
      yield {
        value: attributeMatch[valueGroup],
        offset: attributesOffset + attributeMatch.indices[valueGroup][0],
      };
    }
  }
}

function parseSrcset(value) {
  // Follows the WHATWG candidate split: a URL runs to whitespace, its descriptors run to the next comma.
  const candidates = [];
  let position = 0;

  while (position < value.length) {
    while (position < value.length && /[\s,]/.test(value[position])) position += 1;
    if (position >= value.length) break;

    const urlStart = position;
    while (position < value.length && !/\s/.test(value[position])) position += 1;
    let url = value.slice(urlStart, position);
    let descriptor = '';

    if (url.endsWith(',')) {
      url = url.replace(/,+$/, '');
    } else {
      const commaIndex = value.indexOf(',', position);
      const descriptorEnd = commaIndex === -1 ? value.length : commaIndex;
      descriptor = value.slice(position, descriptorEnd).trim();
      position = descriptorEnd + 1;
    }

    candidates.push({ url, descriptor, offset: urlStart });
  }

  return candidates;
}

function isExternal(url) {
  return /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith('//');
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function resolveImagePath(htmlFile, url) {
  const localPath = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  const resolved = localPath.startsWith('/')
    ? path.resolve(projectRoot, `.${localPath}`)
    : path.resolve(path.dirname(htmlFile), localPath);
  if (!isWithin(projectRoot, resolved)) throw new Error('resolves outside the project');
  return resolved;
}

async function readDecodedWidth(imagePath) {
  const metadata = await sharp(imagePath).metadata();
  // Browsers apply EXIF orientation by default, so compare against the oriented width.
  return metadata.autoOrient?.width ?? metadata.width;
}

async function main() {
  const entries = await fs.readdir(projectRoot, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const widthCache = new Map();
  const issues = [];
  let checked = 0;

  for (const htmlFile of htmlFiles) {
    const html = await fs.readFile(path.join(projectRoot, htmlFile), 'utf8');

    for (const attribute of findCandidateAttributes(html)) {
      for (const candidate of parseSrcset(attribute.value)) {
        if (!/w$/i.test(candidate.descriptor)) continue;
        const location = `${htmlFile}:${lineAt(html, attribute.offset + candidate.offset)}`;

        const declared = candidate.descriptor.match(/^([1-9]\d*)w$/)?.[1];
        if (!declared) {
          issues.push(`${location} -> ${candidate.url} has an invalid width descriptor "${candidate.descriptor}"`);
          continue;
        }
        if (isExternal(candidate.url)) {
          issues.push(`${location} -> ${candidate.url} is not a local image, so ${declared}w cannot be verified`);
          continue;
        }

        checked += 1;
        let imagePath;
        try {
          imagePath = resolveImagePath(path.join(projectRoot, htmlFile), candidate.url);
          if (!widthCache.has(imagePath)) widthCache.set(imagePath, readDecodedWidth(imagePath));
          const actual = await widthCache.get(imagePath);
          if (actual !== Number(declared)) {
            issues.push(`${location} -> ${candidate.url} declares ${declared}w, decoded width is ${actual}px`);
          }
        } catch (error) {
          issues.push(`${location} -> ${candidate.url} cannot be measured (${error.message})`);
        }
      }
    }
  }

  const scope = `${checked} width descriptor(s), ${widthCache.size} distinct image(s), ${htmlFiles.length} HTML file(s)`;

  if (issues.length > 0) {
    console.error(`Image descriptor check failed with ${issues.length} issue(s) (${scope}):`);
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(`Image descriptor check passed (${scope}).`);
}

await main();
