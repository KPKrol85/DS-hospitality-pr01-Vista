import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import chokidar from "chokidar";
import sharp from "sharp";

const SRC_ROOT = path.resolve("assets", "img", "src");
const OUT_ROOT = path.resolve("assets", "img", "optimized");
const MAX_WIDTH = 2000;
const WEBP_QUALITY = 80;
const AVIF_QUALITY = 50;
const AVIF_EFFORT = 4;
const SUPPORTED_EXTS = new Set([".jpg", ".jpeg", ".png"]);

function isSupportedImage(filePath) {
  return SUPPORTED_EXTS.has(path.extname(filePath).toLowerCase());
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getMtimeMs(filePath) {
  const stats = await fs.stat(filePath);
  return stats.mtimeMs;
}

function getOutputPaths(inputPath) {
  const relative = path.relative(SRC_ROOT, inputPath);
  const parsed = path.parse(relative);
  const outputDir = path.join(OUT_ROOT, parsed.dir);
  const outputBase = path.join(outputDir, parsed.name);
  return {
    outputDir,
    originalPath: path.join(outputDir, parsed.base),
    webpPath: `${outputBase}.webp`,
    avifPath: `${outputBase}.avif`,
  };
}

async function collectInputFiles(rootDir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (entry.isFile() && isSupportedImage(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  if (!(await pathExists(rootDir))) {
    return files;
  }

  await walk(rootDir);
  return files;
}

async function isOutputFresh(outputPath, inputMtimeMs) {
  if (!(await pathExists(outputPath))) return false;
  const outputMtimeMs = await getMtimeMs(outputPath);
  return outputMtimeMs >= inputMtimeMs;
}

async function processImage(inputPath, stats) {
  const { outputDir, originalPath, webpPath, avifPath } = getOutputPaths(inputPath);
  await fs.mkdir(outputDir, { recursive: true });

  const inputMtimeMs = await getMtimeMs(inputPath);
  const originalFresh = await isOutputFresh(originalPath, inputMtimeMs);
  const webpFresh = await isOutputFresh(webpPath, inputMtimeMs);
  const avifFresh = await isOutputFresh(avifPath, inputMtimeMs);

  if (originalFresh && webpFresh && avifFresh) {
    stats.skipped += 1;
    return;
  }

  const source = sharp(inputPath).rotate().resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
    fit: "inside",
  });

  const tasks = [];
  if (!originalFresh) {
    tasks.push(fs.copyFile(inputPath, originalPath));
  }
  if (!webpFresh) {
    tasks.push(source.clone().webp({ quality: WEBP_QUALITY }).toFile(webpPath));
  }
  if (!avifFresh) {
    tasks.push(
      source
        .clone()
        .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
        .toFile(avifPath)
    );
  }

  await Promise.all(tasks);
  stats.generated += tasks.length;
}

async function runOptimization({ watch }) {
  await fs.mkdir(SRC_ROOT, { recursive: true });
  await fs.mkdir(OUT_ROOT, { recursive: true });

  const stats = {
    found: 0,
    generated: 0,
    skipped: 0,
    errors: 0,
  };

  const inputFiles = await collectInputFiles(SRC_ROOT);
  stats.found = inputFiles.length;
  console.log(`[img] Found ${stats.found} source file(s) in ${SRC_ROOT}`);

  for (const inputPath of inputFiles) {
    try {
      await processImage(inputPath, stats);
    } catch (error) {
      stats.errors += 1;
      console.error(`[img] Failed: ${path.relative(process.cwd(), inputPath)}`);
      console.error(error instanceof Error ? error.message : String(error));
    }
  }

  console.log(
    `[img] Generated: ${stats.generated}, skipped: ${stats.skipped}, errors: ${stats.errors}`
  );

  if (!watch) return;

  console.log(`[img] Watching ${SRC_ROOT} for changes...`);

  const watcher = chokidar.watch(SRC_ROOT, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100,
    },
  });

  watcher.on("add", async (filePath) => {
    if (!isSupportedImage(filePath)) return;
    try {
      const eventStats = { generated: 0, skipped: 0 };
      await processImage(filePath, eventStats);
      console.log(
        `[img] add ${path.relative(process.cwd(), filePath)} | generated: ${eventStats.generated}, skipped: ${eventStats.skipped}`
      );
    } catch (error) {
      console.error(`[img] add failed: ${path.relative(process.cwd(), filePath)}`);
      console.error(error instanceof Error ? error.message : String(error));
    }
  });

  watcher.on("change", async (filePath) => {
    if (!isSupportedImage(filePath)) return;
    try {
      const eventStats = { generated: 0, skipped: 0 };
      await processImage(filePath, eventStats);
      console.log(
        `[img] change ${path.relative(process.cwd(), filePath)} | generated: ${eventStats.generated}, skipped: ${eventStats.skipped}`
      );
    } catch (error) {
      console.error(
        `[img] change failed: ${path.relative(process.cwd(), filePath)}`
      );
      console.error(error instanceof Error ? error.message : String(error));
    }
  });

  watcher.on("unlink", async (filePath) => {
    if (!isSupportedImage(filePath)) return;
    const { originalPath, webpPath, avifPath } = getOutputPaths(filePath);
    await Promise.all([
      fs.rm(originalPath, { force: true }),
      fs.rm(webpPath, { force: true }),
      fs.rm(avifPath, { force: true }),
    ]);
    console.log(`[img] removed outputs for ${path.relative(process.cwd(), filePath)}`);
  });

  watcher.on("error", (error) => {
    console.error("[img] Watcher error:", error);
  });
}

async function runClean() {
  await fs.rm(OUT_ROOT, { recursive: true, force: true });
  console.log(`[img] Cleaned output directory: ${OUT_ROOT}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const shouldClean = args.has("--clean");
  const shouldWatch = args.has("--watch");

  if (shouldClean && shouldWatch) {
    console.error("[img] Use either --clean or --watch, not both.");
    process.exitCode = 1;
    return;
  }

  if (shouldClean) {
    await runClean();
    return;
  }

  await runOptimization({ watch: shouldWatch });
}

main().catch((error) => {
  console.error("[img] Fatal error:", error);
  process.exitCode = 1;
});
