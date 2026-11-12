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
const JPEG_QUALITY = 80;
const SUPPORTED_EXTS = new Set([".jpg", ".jpeg", ".png"]);

// Single-master photographs, keyed by path under SRC_ROOT. Each master is cropped to its display
// ratio and exported as `<name>-<w>x<h>` JPEG/WebP/AVIF variants instead of being copied.
// Widths must fit inside the cropped master; the build fails rather than upscale.
// A master may list several crops for art direction. A crop is centred unless `focus` places it
// like CSS `object-position`: [x, y] fractions of the width and height left outside the crop.
const ROOM_CARD = { ratio: [3, 2], widths: [640, 960, 1280, 1536] };
const GALLERY_TILE = { ratio: [3, 2], widths: [640, 960, 1280, 1536] };

// Numbered gallery masters (`<prefix>-01.png` … `<prefix>-<count>.png`) keep their committed filenames.
function galleryMasters(prefix, count) {
  return Array.from({ length: count }, (_, index) => [
    `${prefix}-${String(index + 1).padStart(2, "0")}.png`,
    GALLERY_TILE,
  ]);
}

const RESPONSIVE_MASTERS = new Map([
  [
    "hero/hero.png",
    [
      { ratio: [16, 9], widths: [640, 960, 1200, 1600] },
      // Portrait crop for narrow viewports, keeping the reception, brand wall and chandeliers in frame.
      { ratio: [4, 5], widths: [480, 640, 752], focus: [0.8, 0.5] },
    ],
  ],
  ["rooms/classic.png", ROOM_CARD],
  ["rooms/deluxe.png", ROOM_CARD],
  ["rooms/luxury.png", { ...ROOM_CARD, name: "luxury-suite" }],
  ["rooms/luxury-room.png", { ratio: [16, 9], widths: [640, 960, 1280, 1536] }],
  ["about/hero-about.png", { ratio: [5, 4], widths: [640, 960, 1280] }],
  ...galleryMasters("gallery/gallery", 6),
  ...galleryMasters("subpage-gallery/pokoje/room", 4),
  ...galleryMasters("subpage-gallery/lobby/lobby", 4),
  ...galleryMasters("subpage-gallery/restauracja/restaurant", 4),
  ...galleryMasters("subpage-gallery/wellness/wellnes", 4),
  ...galleryMasters("subpage-gallery/okolica/surroundings", 4),
]);

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

// Returns the master's crops as an array, or undefined for images that are copied and converted.
function getMasterCrops(inputPath) {
  const key = path.relative(SRC_ROOT, inputPath).split(path.sep).join("/");
  const config = RESPONSIVE_MASTERS.get(key);
  return config === undefined ? undefined : [config].flat();
}

function getVariantPaths(inputPath, config) {
  const parsed = path.parse(path.relative(SRC_ROOT, inputPath));
  const outputDir = path.join(OUT_ROOT, parsed.dir);
  const name = config.name ?? parsed.name;
  const [ratioWidth, ratioHeight] = config.ratio;

  return config.widths.map((width) => {
    const height = Math.round((width * ratioHeight) / ratioWidth);
    const outputBase = path.join(outputDir, `${name}-${width}x${height}`);
    return {
      width,
      height,
      outputDir,
      files: [`${outputBase}.jpg`, `${outputBase}.webp`, `${outputBase}.avif`],
    };
  });
}

async function processMaster(inputPath, crops, stats) {
  const inputMtimeMs = await getMtimeMs(inputPath);
  const { width, height, orientation = 1 } = await sharp(inputPath).metadata();
  const [masterWidth, masterHeight] = orientation >= 5 ? [height, width] : [width, height];

  const encoders = [
    (image) => image.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }),
    (image) => image.webp({ quality: WEBP_QUALITY }),
    (image) => image.avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT }),
  ];

  const tasks = [];
  for (const config of crops) {
    const variants = getVariantPaths(inputPath, config);
    await fs.mkdir(variants[0].outputDir, { recursive: true });

    const [ratioWidth, ratioHeight] = config.ratio;
    const cropWidth = Math.min(masterWidth, Math.floor((masterHeight * ratioWidth) / ratioHeight));
    const cropHeight = Math.min(masterHeight, Math.floor((masterWidth * ratioHeight) / ratioWidth));
    const region = config.focus && {
      left: Math.round((masterWidth - cropWidth) * config.focus[0]),
      top: Math.round((masterHeight - cropHeight) * config.focus[1]),
      width: cropWidth,
      height: cropHeight,
    };

    for (const variant of variants) {
      if (variant.width > cropWidth) {
        throw new Error(
          `${variant.width}px variant exceeds the ${cropWidth}px ${ratioWidth}:${ratioHeight} crop of the master`
        );
      }

      const oriented = sharp(inputPath).rotate();
      const resized = (region ? oriented.extract(region) : oriented).resize({
        width: variant.width,
        height: variant.height,
        fit: "cover",
        position: "centre",
      });

      for (const [index, outputPath] of variant.files.entries()) {
        if (await isOutputFresh(outputPath, inputMtimeMs)) continue;
        tasks.push(encoders[index](resized.clone()).toFile(outputPath));
      }
    }
  }

  await Promise.all(tasks);
  if (tasks.length === 0) stats.skipped += 1;
  stats.generated += tasks.length;
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
  const masterCrops = getMasterCrops(inputPath);
  if (masterCrops) {
    await processMaster(inputPath, masterCrops, stats);
    return;
  }

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

  if (!watch) {
    if (stats.errors > 0) process.exitCode = 1;
    return;
  }

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
    const masterCrops = getMasterCrops(filePath);
    let outputFiles;
    if (masterCrops) {
      outputFiles = masterCrops.flatMap((config) => getVariantPaths(filePath, config)).flatMap((variant) => variant.files);
    } else {
      const { originalPath, webpPath, avifPath } = getOutputPaths(filePath);
      outputFiles = [originalPath, webpPath, avifPath];
    }
    await Promise.all(outputFiles.map((outputPath) => fs.rm(outputPath, { force: true })));
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
