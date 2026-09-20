import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const [, , kind, outputPath] = process.argv;

if (!kind || !outputPath) {
  console.error("Usage: node scripts/verify-build.mjs <css|js> <output-path>");
  process.exit(1);
}

const absolutePath = path.resolve(outputPath);
const contents = await readFile(absolutePath, "utf8");

if (kind === "css") {
  if (/@import\b/.test(contents)) {
    console.error(`[verify] CSS output still contains @import: ${outputPath}`);
    process.exit(1);
  }

  console.log(`[verify] CSS output passed: ${outputPath}`);
  process.exit(0);
}

if (kind === "js") {
  if (/\bimport\b|\bexport\b/.test(contents)) {
    console.error(`[verify] JS output still contains import/export: ${outputPath}`);
    process.exit(1);
  }

  console.log(`[verify] JS output passed: ${outputPath}`);
  process.exit(0);
}

console.error(`Unknown build kind: ${kind}`);
process.exit(1);
