import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, "dist");

const REQUIRED_FILES = [
  "css/style.min.css",
  "js/script.min.js",
  "js/theme-init.js",
  "site.webmanifest",
];

const OPTIONAL_ROOT_FILES = ["robots.txt", "sitemap.xml"];
const OPTIONAL_NETLIFY_FILES = [
  ["netlify/_headers", "_headers"],
  ["netlify/_redirects", "_redirects"],
];

const REQUIRED_DIRS = [
  "assets/fonts",
  "assets/seo",
  "assets/img/icons",
  "assets/img/logo",
  "assets/img/og",
  "assets/img/optimized",
  "assets/img/screenshots",
  "assets/img/shortcuts",
  "assets/img/ui",
];

const DIST_STATIC_ASSETS = [
  "css/style.min.css",
  "js/theme-init.js",
  "js/script.min.js",
  "site.webmanifest",
];

async function pathExists(relativePath) {
  try {
    await stat(path.join(ROOT_DIR, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function assertExists(relativePath, typeLabel) {
  if (!(await pathExists(relativePath))) {
    throw new Error(`Missing required ${typeLabel}: ${relativePath}`);
  }
}

async function cleanDist() {
  await rm(DIST_DIR, { recursive: true, force: true });
}

async function listHtmlPages() {
  const entries = await readdir(ROOT_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function copyFileIntoDist(sourceRelativePath, destinationRelativePath = sourceRelativePath) {
  await assertExists(sourceRelativePath, "file");
  const destinationPath = path.join(DIST_DIR, destinationRelativePath);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await cp(path.join(ROOT_DIR, sourceRelativePath), destinationPath);
}

async function copyDirectoryIntoDist(sourceRelativePath, destinationRelativePath = sourceRelativePath) {
  await assertExists(sourceRelativePath, "directory");
  await cp(path.join(ROOT_DIR, sourceRelativePath), path.join(DIST_DIR, destinationRelativePath), {
    recursive: true,
    force: true,
  });
}

async function copyOptimizedImagesIntoDist() {
  const sourceRoot = path.join(ROOT_DIR, "assets", "img", "optimized");
  const destinationRoot = path.join(DIST_DIR, "assets", "img", "optimized");

  await cp(sourceRoot, destinationRoot, {
    recursive: true,
    force: true,
    filter: (sourcePath) => {
      const relativePath = path.relative(sourceRoot, sourcePath);
      if (!relativePath) {
        return true;
      }

      const normalizedPath = relativePath.split(path.sep).join("/");
      return normalizedPath !== ".gitkeep" && !normalizedPath.startsWith("test/");
    },
  });
}

async function rewriteHtmlFile(htmlFileName, passthroughImageCopies) {
  const sourcePath = path.join(ROOT_DIR, htmlFileName);
  let html = await readFile(sourcePath, "utf8");

  html = html.replaceAll('href="css/style.css"', 'href="css/style.min.css"');
  html = html.replace(
    /<script\b[^>]*src="js\/script\.js"[^>]*><\/script>/g,
    '<script defer src="js/script.min.js"></script>'
  );

  html = html.replace(/(\.?\/)?assets\/img\/src\/([^\s"',)>\]]+)/g, (match, prefix = "", relativePath) => {
    const normalizedPrefix = prefix === "./" ? "./" : "";
    const optimizedTarget = path.posix.join("assets/img/optimized", relativePath);
    const passthroughTarget = path.posix.join("assets/img", relativePath);
    const optimizedFsPath = path.join(ROOT_DIR, ...optimizedTarget.split("/"));
    const sourceFsPath = path.join(ROOT_DIR, "assets", "img", "src", ...relativePath.split("/"));

    if (!path.isAbsolute(optimizedFsPath) || !path.isAbsolute(sourceFsPath)) {
      throw new Error(`Unable to resolve image path for ${match}`);
    }

    return normalizedPrefix + (pathExistsSync(optimizedFsPath) ? optimizedTarget : copyPassthroughAsset(sourceFsPath, relativePath, passthroughImageCopies, passthroughTarget));
  });

  if (html.includes('href="css/style.css"') || html.includes('src="js/script.js"') || html.includes("assets/img/src/")) {
    throw new Error(`Production rewrite incomplete for ${htmlFileName}`);
  }

  return html;
}

function pathExistsSync(absolutePath) {
  return existsSync(absolutePath);
}

function copyPassthroughAsset(sourceFsPath, relativePath, passthroughImageCopies, passthroughTarget) {
  if (!pathExistsSync(sourceFsPath)) {
    throw new Error(`Missing required source image: assets/img/src/${relativePath}`);
  }

  passthroughImageCopies.add(relativePath);
  return passthroughTarget;
}

async function writeDistHtml(htmlPages) {
  const passthroughImageCopies = new Set();
  const rewrittenHtml = new Map();

  for (const htmlPage of htmlPages) {
    rewrittenHtml.set(htmlPage, await rewriteHtmlFile(htmlPage, passthroughImageCopies));
  }

  for (const [htmlPage, content] of rewrittenHtml) {
    await writeFile(path.join(DIST_DIR, htmlPage), content, "utf8");
  }

  return { passthroughImageCopies, rewrittenHtml };
}

async function copyPassthroughImages(imageRelativePaths) {
  for (const relativePath of imageRelativePaths) {
    const sourcePath = path.join(ROOT_DIR, "assets", "img", "src", ...relativePath.split("/"));
    const destinationPath = path.join(DIST_DIR, "assets", "img", ...relativePath.split("/"));
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await cp(sourcePath, destinationPath);
  }
}

function buildCacheVersion(inputs) {
  const hash = createHash("sha256");

  for (const input of inputs) {
    hash.update(input);
  }

  return hash.digest("hex").slice(0, 12);
}

async function buildServiceWorker(htmlPages, cacheVersion) {
  const sourceServiceWorkerPath = path.join(ROOT_DIR, "pwa", "service-worker.js");
  const sourceServiceWorker = await readFile(sourceServiceWorkerPath, "utf8");
  const staticAssets = JSON.stringify([...htmlPages, ...DIST_STATIC_ASSETS], null, 2);

  return sourceServiceWorker
    .replace(/const CACHE_VERSION = ".*?";/, `const CACHE_VERSION = "${cacheVersion}";`)
    .replace(/const STATIC_ASSETS = \[[\s\S]*?\];/, `const STATIC_ASSETS = ${staticAssets};`);
}

async function main() {
  const isCleanOnly = process.argv.includes("--clean");
  await cleanDist();

  if (isCleanOnly) {
    console.log("Removed dist");
    return;
  }

  for (const file of REQUIRED_FILES) {
    await assertExists(file, "file");
  }

  await assertExists("pwa/service-worker.js", "file");

  for (const directory of REQUIRED_DIRS) {
    await assertExists(directory, "directory");
  }

  const htmlPages = await listHtmlPages();
  if (htmlPages.length === 0) {
    throw new Error("No public HTML pages found in project root.");
  }

  await mkdir(DIST_DIR, { recursive: true });

  for (const directory of REQUIRED_DIRS) {
    if (directory === "assets/img/optimized") {
      await copyOptimizedImagesIntoDist();
      continue;
    }

    await copyDirectoryIntoDist(directory);
  }

  await copyFileIntoDist("css/style.min.css");
  await copyFileIntoDist("js/script.min.js");
  await copyFileIntoDist("js/theme-init.js");
  await copyFileIntoDist("site.webmanifest");

  for (const file of OPTIONAL_ROOT_FILES) {
    if (await pathExists(file)) {
      await copyFileIntoDist(file);
    }
  }

  for (const [sourcePath, targetPath] of OPTIONAL_NETLIFY_FILES) {
    if (await pathExists(sourcePath)) {
      await copyFileIntoDist(sourcePath, targetPath);
    }
  }

  const { passthroughImageCopies, rewrittenHtml } = await writeDistHtml(htmlPages);
  await copyPassthroughImages([...passthroughImageCopies].sort((left, right) => left.localeCompare(right)));

  const cacheInputs = [];
  for (const htmlPage of htmlPages) {
    cacheInputs.push(htmlPage, rewrittenHtml.get(htmlPage));
  }

  for (const file of DIST_STATIC_ASSETS) {
    cacheInputs.push(file, await readFile(path.join(ROOT_DIR, file), "utf8"));
  }

  const cacheVersion = buildCacheVersion(cacheInputs);
  const distServiceWorker = await buildServiceWorker(htmlPages, cacheVersion);

  await mkdir(path.join(DIST_DIR, "pwa"), { recursive: true });
  await writeFile(path.join(DIST_DIR, "pwa", "service-worker.js"), distServiceWorker, "utf8");

  console.log(`Built dist with ${htmlPages.length} HTML pages.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
