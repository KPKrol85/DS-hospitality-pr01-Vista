import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const host = '127.0.0.1';
const rootDir = process.cwd();
const projectRequire = createRequire(path.join(rootDir, 'package.json'));

function resolveModule(specifier) {
  try {
    return projectRequire.resolve(specifier);
  } catch {
    throw new Error(`Cannot resolve "${specifier}" from project devDependencies. Run "npm ci" to install them.`);
  }
}

const playwrightModulePath = resolveModule('playwright');
const axeMinPath = resolveModule('axe-core/axe.min.js');
const playwrightModule = await import(pathToFileURL(playwrightModulePath).href);
const playwright = playwrightModule.default ?? playwrightModule;
const chromium = playwright.chromium;

if (!chromium?.launch) {
  throw new Error('Playwright chromium launcher is unavailable. Check module resolution/runtime export shape.');
}

const axeSource = await readFile(axeMinPath, 'utf8');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function createStaticServer() {
  return http.createServer(async (req, res) => {
    try {
      const reqPath = new URL(req.url, `http://${host}`).pathname;
      let relPath = decodeURIComponent(reqPath);

      if (relPath === '/') relPath = '/index.html';

      const normalized = path.normalize(relPath).replace(/^([.][./\\])+/, '');
      const filePath = path.join(rootDir, normalized);

      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      const data = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404).end('Not found');
    }
  });
}

function summarizeViolations(label, violations) {
  for (const violation of violations) {
    console.error(`- ${label} -> ${violation.id} (${violation.impact || 'unknown'}) [nodes: ${violation.nodes.length}]`);
  }
}

async function runAxe(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    return window.axe.run(document, {
      resultTypes: ['violations'],
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'best-practice']
      }
    });
  });
}

async function runScenario(page, baseUrl, spec) {
  const targetUrl = `${baseUrl}/${spec.path}`;
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');

  if (spec.setup) {
    await spec.setup(page);
  }

  const result = await runAxe(page);
  return { ...spec, result };
}

const scenarios = [
  { label: 'index.html (baseline)', path: 'index.html' },
  {
    label: 'index.html (mobile nav open)',
    path: 'index.html',
    setup: async (page) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.getByRole('button', { name: 'Akceptuję' }).click();
      await page.locator('#projectBanner').waitFor({ state: 'hidden' });
      await page.getByRole('button', { name: 'Otwórz menu' }).click();
      await page.locator('#site-nav.is-open').waitFor({ state: 'visible' });
    }
  },
  { label: 'rooms.html (baseline)', path: 'rooms.html' },
  {
    label: 'rooms.html (Deluxe filter active)',
    path: 'rooms.html',
    setup: async (page) => {
      await page.locator('#rooms-filter-deluxe').click();
      await page.locator('#rooms-filter-deluxe[aria-pressed="true"]').waitFor();
      await page.locator('.room-card[data-room-type="deluxe"]').waitFor({ state: 'visible' });
      for (const card of await page.locator('.room-card[data-room-type]:not([data-room-type="deluxe"])').all()) {
        await card.waitFor({ state: 'hidden' });
      }
    }
  },
  { label: 'gallery.html (baseline)', path: 'gallery.html' },
  {
    label: 'gallery.html (lightbox open)',
    path: 'gallery.html',
    setup: async (page) => {
      await page.locator('[data-lightbox-item]').first().click();
      await page.locator('.lightbox:not([hidden])').waitFor({ state: 'visible' });
    }
  },
  { label: 'contact.html (baseline)', path: 'contact.html' },
  { label: 'regulamin.html (baseline)', path: 'regulamin.html' }
];

const server = createStaticServer();
let browser;
let context;

try {
  await new Promise((resolve) => {
    server.listen(0, host, resolve);
  });

  const port = server.address().port;
  const baseUrl = `http://${host}:${port}`;

  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({ viewport: { width: 1280, height: 720 } });

  const allViolations = [];

  for (const scenario of scenarios) {
    const page = await context.newPage();
    const { result } = await runScenario(page, baseUrl, scenario);
    const violations = result.violations || [];

    if (violations.length) {
      summarizeViolations(scenario.label, violations);
      allViolations.push({ label: scenario.label, violations });
    }

    await page.close();
  }

  if (allViolations.length) {
    const count = allViolations.reduce((acc, item) => acc + item.violations.length, 0);
    console.error(`\nAccessibility violations found: ${count}`);
    process.exitCode = 1;
  } else {
    console.log('Axe accessibility checks passed for all scenarios.');
  }
} finally {
  await context?.close();
  await browser?.close();
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}
