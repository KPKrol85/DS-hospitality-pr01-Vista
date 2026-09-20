import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");

const REQUIRED_FILES = ["js/theme-init.js", "site.webmanifest", "robots.txt", "sitemap.xml", "pwa/service-worker.js"];
const NETLIFY_FILES = [
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

const BUNDLE_FILES = ["css/style.min.css", "js/script.min.js"];

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

async function assertDistExists(relativePath, typeLabel) {
  try {
    const item = await stat(path.join(DIST_DIR, relativePath));
    if (item.isFile()) return;
  } catch {
    // Report the missing distribution input below.
  }

  throw new Error(`Missing required dist ${typeLabel}: ${relativePath}. Run npm run build:dist.`);
}

async function cleanDist() {
  await rm(DIST_DIR, { recursive: true, force: true });
}

async function listHtmlPages() {
  const entries = await readdir(ROOT_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => entry.name)
    .sort();
}

async function copyFileIntoDist(sourceRelativePath, destinationRelativePath = sourceRelativePath) {
  await assertExists(sourceRelativePath, "file");
  const destinationPath = path.join(DIST_DIR, destinationRelativePath);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await cp(path.join(ROOT_DIR, sourceRelativePath), destinationPath);
}

async function copyDirectoryIntoDist(sourceRelativePath, destinationRelativePath = sourceRelativePath) {
  await assertExists(sourceRelativePath, "directory");
  const destinationPath = path.join(DIST_DIR, destinationRelativePath);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await cp(path.join(ROOT_DIR, sourceRelativePath), destinationPath, {
    recursive: true,
    force: true,
  });
}

async function copyOptimizedImagesIntoDist() {
  const sourceRoot = path.join(ROOT_DIR, "assets", "img", "optimized");
  const destinationRoot = path.join(DIST_DIR, "assets", "img", "optimized");

  await mkdir(path.dirname(destinationRoot), { recursive: true });
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

  const htmlTag = /<html\b[^>]*>/gi;
  const sourceCss = /href="css\/style\.css"/g;
  const sourceScript = /<script\b[^>]*src="js\/script\.js\?vista-dev-1"[^>]*><\/script>/g;
  if (
    [...html.matchAll(htmlTag)].length !== 1 ||
    html.includes('data-vista-build=') ||
    [...html.matchAll(sourceCss)].length !== 1 ||
    [...html.matchAll(sourceScript)].length !== 1
  ) {
    throw new Error(`Expected one HTML root, source stylesheet, and source script in ${htmlFileName}`);
  }

  html = html.replace(/<html\b/i, '<html data-vista-build="production"');
  html = html.replace(sourceCss, 'href="css/style.min.css"');
  html = html.replace(sourceScript, '<script defer src="js/script.min.js"></script>');

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

  if (html.includes('href="css/style.css"') || html.includes('src="js/script.js') || html.includes("assets/img/src/")) {
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

async function listDistFiles(directory = DIST_DIR) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listDistFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(path.relative(DIST_DIR, entryPath).split(path.sep).join("/"));
    }
  }
  return files.sort();
}

async function buildCacheVersion(distFiles, sourceServiceWorker) {
  const hash = createHash("sha256");
  for (const file of distFiles) {
    hash.update(file).update("\0").update(await readFile(path.join(DIST_DIR, ...file.split("/")))).update("\0");
  }
  hash.update(sourceServiceWorker);
  return hash.digest("hex").slice(0, 12);
}

function replaceExactlyOnce(source, literal, replacement) {
  if (source.split(literal).length !== 2) {
    throw new Error(`Service Worker template must contain exactly one ${literal}`);
  }
  return source.replace(literal, replacement);
}

async function buildServiceWorker(distFiles, htmlPages) {
  const sourceServiceWorkerPath = path.join(ROOT_DIR, "pwa", "service-worker.js");
  const sourceServiceWorker = await readFile(sourceServiceWorkerPath, "utf8");
  const requiredPrecache = [...htmlPages, ...DIST_STATIC_ASSETS];
  for (const file of requiredPrecache) {
    if (!distFiles.includes(file)) {
      throw new Error(`Missing required precache asset in dist: ${file}`);
    }
  }
  const precacheSet = new Set(requiredPrecache);
  const precachePaths = distFiles.filter((file) => precacheSet.has(file)).map((file) => `/${file}`);
  const staticAssets = JSON.stringify(precachePaths, null, 2);
  const cacheVersion = await buildCacheVersion(distFiles, sourceServiceWorker);

  return replaceExactlyOnce(
    replaceExactlyOnce(sourceServiceWorker, 'const CACHE_VERSION = "SOURCE_ONLY";', `const CACHE_VERSION = "${cacheVersion}";`),
    "const STATIC_ASSETS = [];",
    `const STATIC_ASSETS = ${staticAssets};`
  );
}

async function verifyDistribution(htmlPages) {
  const requiredFiles = [
    ...htmlPages,
    ...BUNDLE_FILES,
    "js/theme-init.js",
    "site.webmanifest",
    "robots.txt",
    "sitemap.xml",
    "_headers",
    "_redirects",
    "pwa/service-worker.js",
  ];
  for (const file of requiredFiles) {
    await assertDistExists(file, "file");
  }

  for (const htmlPage of htmlPages) {
    const html = await readFile(path.join(DIST_DIR, htmlPage), "utf8");
    if (
      !html.includes('data-vista-build="production"') ||
      !html.includes('href="css/style.min.css"') ||
      !html.includes('src="js/script.min.js"') ||
      html.includes('href="css/style.css"') ||
      html.includes('src="js/script.js') ||
      html.includes("assets/img/src/")
    ) {
      throw new Error(`Invalid production asset references in ${htmlPage}`);
    }
  }

  const distFiles = await listDistFiles();
  if (distFiles.some((file) => file === "css/style.css" || file === "js/script.js" || file.startsWith("js/features/") || file.startsWith("assets/img/src/"))) {
    throw new Error("Development-only source files were packaged into dist.");
  }

  const worker = await readFile(path.join(DIST_DIR, "pwa", "service-worker.js"), "utf8");
  const precacheMatch = worker.match(/const STATIC_ASSETS = (\[[\s\S]*?\]);/);
  if (!/const CACHE_VERSION = "[a-f0-9]{12}";/.test(worker) || !precacheMatch) {
    throw new Error("Production Service Worker generation is incomplete.");
  }
  const precache = JSON.parse(precacheMatch[1]);
  const expected = distFiles
    .filter((file) => htmlPages.includes(file) || DIST_STATIC_ASSETS.includes(file))
    .map((file) => `/${file}`);
  if (JSON.stringify(precache) !== JSON.stringify(expected)) {
    throw new Error("Production Service Worker precache does not match dist assets.");
  }
}

async function main() {
  const isCleanOnly = process.argv.includes("--clean");
  if (isCleanOnly) {
    await cleanDist();
    console.log("Removed dist");
    return;
  }

  for (const file of REQUIRED_FILES) {
    await assertExists(file, "file");
  }

  for (const file of BUNDLE_FILES) {
    await assertDistExists(file, "bundle");
  }

  for (const [sourcePath] of NETLIFY_FILES) {
    await assertExists(sourcePath, "Netlify file");
  }

  for (const directory of REQUIRED_DIRS) {
    await assertExists(directory, "directory");
  }

  const htmlPages = await listHtmlPages();
  if (htmlPages.length === 0) {
    throw new Error("No public HTML pages found in project root.");
  }

  for (const directory of REQUIRED_DIRS) {
    if (directory === "assets/img/optimized") {
      await copyOptimizedImagesIntoDist();
      continue;
    }

    await copyDirectoryIntoDist(directory);
  }

  await copyFileIntoDist("js/theme-init.js");
  await copyFileIntoDist("site.webmanifest");

  for (const file of ["robots.txt", "sitemap.xml"]) {
    await copyFileIntoDist(file);
  }

  for (const [sourcePath, targetPath] of NETLIFY_FILES) {
    await copyFileIntoDist(sourcePath, targetPath);
  }

  const { passthroughImageCopies } = await writeDistHtml(htmlPages);
  await copyPassthroughImages([...passthroughImageCopies].sort());

  const distFiles = (await listDistFiles()).filter((file) => file !== "pwa/service-worker.js");
  const distServiceWorker = await buildServiceWorker(distFiles, htmlPages);

  await mkdir(path.join(DIST_DIR, "pwa"), { recursive: true });
  await writeFile(path.join(DIST_DIR, "pwa", "service-worker.js"), distServiceWorker, "utf8");
  await verifyDistribution(htmlPages);

  console.log(`Built dist with ${htmlPages.length} HTML pages.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
