import http from 'node:http';
import assert from 'node:assert/strict';
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
  if (spec.beforeLoad) {
    await spec.beforeLoad(page);
  }
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');

  if (spec.setup) {
    await spec.setup(page);
  }

  const result = await runAxe(page);
  return { ...spec, result };
}

async function assertGalleryFilter(page, filter) {
  const state = await page.evaluate((expected) => {
    const items = [...document.querySelectorAll('.gallery-grid [data-cat-item]')];
    const sections = [...document.querySelectorAll('.gallery-section')];
    return {
      filter: document.body.dataset.galleryFilter,
      selected: [...document.querySelectorAll('#gallery-filters [aria-current]')]
        .map((link) => [link.dataset.filter, link.getAttribute('aria-current')]),
      itemCount: items.length,
      sectionCount: sections.length,
      itemsMatch: items.every((item) => {
        const visible = expected === 'all' || item.dataset.catItem === expected;
        return Boolean(item.getClientRects().length) === visible &&
          Boolean(item.querySelector('img')?.getClientRects().length) === visible;
      }),
      sectionsMatch: sections.every((section) =>
        Boolean(section.getClientRects().length) === (expected === 'all' || section.id === expected))
    };
  }, filter);
  assert.equal(state.filter, filter, 'Lightbox category must match the selected filter');
  assert.deepEqual(state.selected, [[filter, 'true']], 'Exactly one category must have aria-current="true"');
  assert.ok(state.itemCount > 0 && state.sectionCount > 0, 'Gallery content must exist');
  assert.ok(state.itemsMatch && state.sectionsMatch, 'Only matching sections, items and images must be visible');
}

function galleryFragmentScenario(fragment, filter, exerciseControls = false) {
  const errors = [];
  return {
    label: `gallery.html${fragment} (fragment restoration)`,
    path: `gallery.html${fragment}`,
    beforeLoad: async (page) => {
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript(() => {
        // Observe the real DEV branch after initGalleryFilters(), without registering a production worker.
        window.gallerySwScopes = [];
        const getRegistration = navigator.serviceWorker.getRegistration;
        navigator.serviceWorker.getRegistration = function (...args) {
          window.gallerySwScopes.push(args[0]);
          return getRegistration.apply(this, args);
        };
        window.galleryScrollCalls = [];
        const scrollIntoView = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function (options) {
          window.galleryScrollCalls.push({ id: this.id, options });
          return scrollIntoView.call(this, options);
        };
      });
    },
    setup: async (page) => {
      await assertGalleryFilter(page, filter);
      assert.deepEqual(await page.evaluate(() => window.gallerySwScopes),
        [new URL('/', page.url()).href], 'Initialization must reach configureSW() in source mode');

      if (exerciseControls) {
        assert.equal(new URL(page.url()).hash, '#foo%22bar', 'Chromium percent-encodes the literal quote');
        const historyLength = await page.evaluate(() => history.length);
        await page.locator('#gallery-filters [data-filter="wellness"]').click();
        await assertGalleryFilter(page, 'wellness');
        assert.equal(new URL(page.url()).hash, '#wellness');
        assert.equal(await page.evaluate(() => history.length), historyLength, 'Category clicks must replace history');

        const wellnessItems = page.locator('.gallery-grid [data-lightbox-item][data-cat-item="wellness"]');
        const total = await wellnessItems.count();
        await wellnessItems.first().click();
        await page.locator('.lightbox:not([hidden])').waitFor({ state: 'visible' });
        assert.equal(await page.locator('[data-lightbox-counter]').textContent(), `1 / ${total}`);
        await page.locator('[data-lightbox-next]').click();
        assert.equal(await page.locator('[data-lightbox-counter]').textContent(), `2 / ${total}`);
        assert.equal(await page.locator('.lightbox__img').getAttribute('src'), await wellnessItems.nth(1).getAttribute('href'));
        await page.keyboard.press('Escape');
        await page.locator('.lightbox').waitFor({ state: 'hidden' });

        for (const [hash, expected] of [['#main', 'wellness'], ['#lobby', 'lobby'], ['#\\wellness', 'lobby']]) {
          await page.evaluate((value) => new Promise((resolve) => {
            window.addEventListener('hashchange', () => resolve(), { once: true });
            location.hash = value;
          }), hash);
          await assertGalleryFilter(page, expected);
        }

        const historyBeforeAll = await page.evaluate(() => history.length);
        await page.locator('#gallery-filters [data-filter="all"]').click();
        await assertGalleryFilter(page, 'all');
        assert.equal(new URL(page.url()).hash, '#wszystkie');
        assert.equal(await page.evaluate(() => history.length), historyBeforeAll);
        assert.deepEqual(await page.evaluate(() => window.galleryScrollCalls), [
          { id: 'wellness-heading', options: { behavior: 'smooth', block: 'start' } },
          { id: 'gallery-heading', options: { behavior: 'smooth', block: 'start' } }
        ], 'Category clicks must retain their scroll targets; hashchange must not add scripted scrolling');
      }

      assert.deepEqual(errors, [], 'Gallery fragments must not cause uncaught initialization or interaction errors');
      console.log(`Gallery fragment behavior passed: ${JSON.stringify(fragment)}`);
    }
  };
}

const scenarios = [
  { label: 'index.html (baseline)', path: 'index.html' },
  {
    label: 'index.html (nav breakpoint transition)',
    path: 'index.html',
    beforeLoad: (page) => page.setViewportSize({ width: 390, height: 844 }),
    setup: async (page) => {
      const nav = page.locator('#site-nav');
      const toggle = page.locator('#nav-toggle');
      const first = nav.locator('a').first();
      const last = nav.locator('a').last();
      const assertFocused = async (locator, message) => {
        assert.equal(await locator.evaluate((el) => el === document.activeElement), true, message);
      };
      const assertState = async (mobile, open) => {
        // Wait for the asynchronous matchMedia change event after resizing.
        await page.waitForFunction(({ mobile, open }) => {
          const nav = document.getElementById('site-nav');
          const toggle = document.getElementById('nav-toggle');
          return window.matchMedia('(max-width: 960px)').matches === mobile &&
            nav.hidden === (mobile && !open) &&
            nav.classList.contains('is-open') === open &&
            document.body.classList.contains('is-nav-open') === open &&
            toggle.getAttribute('aria-expanded') === String(open) &&
            toggle.getAttribute('aria-label') === (open ? 'Zamknij menu' : 'Otwórz menu');
        }, { mobile, open });
        assert.equal(await nav.isVisible(), !mobile || open, 'Navigation visibility must match layout and state');
      };

      const banner = page.locator('#projectBanner');
      if (await banner.isVisible()) {
        await page.locator('#projectBannerAccept').click();
        await banner.waitFor({ state: 'hidden' });
      }
      await assertState(true, false);
      await toggle.click();
      await assertState(true, true);
      await assertFocused(first, 'Opening mobile navigation must focus its first link');
      await page.setViewportSize({ width: 960, height: 844 });
      await assertState(true, true);

      for (const width of [961, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        await assertState(false, false);
        await assertFocused(first, 'Entering or resizing desktop must not restore focus to the hidden toggle');
      }
      await last.focus();
      await page.keyboard.press('Tab');
      assert.equal(await nav.evaluate((el) => el.contains(document.activeElement)), false,
        'Desktop Tab must leave the end of navigation');
      await first.focus();
      await page.keyboard.press('Shift+Tab');
      assert.equal(await nav.evaluate((el) => el.contains(document.activeElement)), false,
        'Desktop Shift+Tab must leave the beginning of navigation');
      await first.focus();
      await page.keyboard.press('Escape');
      await assertState(false, false);
      await assertFocused(first, 'Desktop Escape must not restore mobile focus');
      // Use the existing in-page link so a reload cannot conceal a stale close state.
      await nav.locator('a[href="#book"]').click();
      await assertState(false, false);

      await page.setViewportSize({ width: 390, height: 844 });
      await assertState(true, false);
      await toggle.click();
      await assertState(true, true);
      await assertFocused(first, 'Mobile navigation must reopen with first-link focus');
      await page.keyboard.press('Shift+Tab');
      await assertFocused(last, 'Mobile Shift+Tab must wrap to the last link');
      await page.keyboard.press('Tab');
      await assertFocused(first, 'Mobile Tab must wrap to the first link');
      await page.keyboard.press('Escape');
      await assertState(true, false);
      await assertFocused(toggle, 'Mobile Escape must restore focus to the toggle');
      await toggle.click();
      await nav.locator('a[href="#book"]').click();
      await assertState(true, false);
      // Native fragment navigation may move focus after the menu's close handler.
      assert.equal(new URL(page.url()).hash, '#book', 'Mobile link selection must retain its destination');
      await toggle.click();
      await toggle.click();
      await assertState(true, false);
      await assertFocused(toggle, 'Mobile toggle close must retain focus');

      const noJsContext = await page.context().browser().newContext({
        javaScriptEnabled: false, viewport: { width: 390, height: 844 }
      });
      try {
        const noJsPage = await noJsContext.newPage();
        await noJsPage.goto(page.url(), { waitUntil: 'networkidle' });
        for (const width of [390, 961, 1280, 390]) {
          await noJsPage.setViewportSize({ width, height: 844 });
          assert.equal(await noJsPage.locator('#site-nav').isVisible(), true, 'No-JS navigation must remain visible');
          const links = noJsPage.locator('#site-nav a');
          await links.first().focus();
          await noJsPage.keyboard.press('Tab');
          assert.equal(await links.nth(1).evaluate((el) => el === document.activeElement), true,
            'No-JS navigation must retain keyboard traversal');
        }
      } finally {
        await noJsContext.close();
      }
      console.log('Navigation breakpoint, desktop/mobile keyboard and no-JS assertions passed.');
    }
  },
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
  { label: 'gallery.html (baseline)', path: 'gallery.html', setup: (page) => assertGalleryFilter(page, 'all') },
  galleryFragmentScenario('#wellness', 'wellness'),
  galleryFragmentScenario('#foo"bar', 'all', true),
  galleryFragmentScenario('#\\wellness', 'all'),
  galleryFragmentScenario('#%E0%A4%A', 'all'),
  galleryFragmentScenario('#main', 'all'),
  galleryFragmentScenario('#wszystkie', 'all'),
  {
    label: 'gallery.html (lightbox open)',
    path: 'gallery.html',
    setup: async (page) => {
      await page.locator('[data-lightbox-item]').first().click();
      await page.locator('.lightbox:not([hidden])').waitFor({ state: 'visible' });
    }
  },
  { label: 'contact.html (baseline)', path: 'contact.html' },
  {
    label: 'contact.html (validation errors visible)',
    path: 'contact.html',
    setup: async (page) => {
      const banner = page.locator('#projectBanner');
      if (await banner.isVisible()) {
        await page.locator('#projectBannerAccept').click();
        await banner.waitFor({ state: 'hidden' });
      }

      const form = page.locator('form[data-form]');
      await page.waitForFunction(() => document.querySelector('form[data-form]')?.noValidate === true);
      assert.equal(await form.evaluate((element) => element.noValidate), true,
        'Enhanced JavaScript validation must be initialized before submission');

      const contactUrl = page.url();
      const posts = [];
      page.on('request', (request) => {
        if (request.method() === 'POST') posts.push(request.url());
      });
      await form.getByRole('button', { name: 'Wyślij zapytanie', exact: true }).click();
      await page.locator('#name[aria-invalid="true"]').waitFor({ state: 'visible' });
      await page.locator('#err-name').waitFor({ state: 'visible' });
      assert.ok((await page.locator('#name').getAttribute('aria-describedby') || '').split(/\s+/).includes('err-name'),
        'The invalid name field must reference its error message');
      await page.waitForFunction(() => document.activeElement === document.querySelector('#name'));
      assert.equal(page.url(), contactUrl, 'Invalid submission must remain on contact.html');
      assert.equal(await form.locator('.form__success').isVisible(), false, 'Invalid submission must not show success');
      assert.deepEqual(posts, [], 'Invalid submission must not send a POST request');
      console.log('Contact validation error-state assertions passed.');
    }
  },
  { label: 'regulamin.html (baseline)', path: 'regulamin.html' }
];

// Example: npm run test:a11y -- --scenario "nav breakpoint transition"
const scenarioFlag = process.argv.indexOf('--scenario');
const scenarioFilter = scenarioFlag === -1 ? null : process.argv[scenarioFlag + 1];
assert.ok(scenarioFlag === -1 || (scenarioFilter && !scenarioFilter.startsWith('--')),
  '--scenario requires a label filter');
const selectedScenarios = scenarioFilter
  ? scenarios.filter((scenario) => scenario.label.includes(scenarioFilter))
  : scenarios;
assert.ok(selectedScenarios.length, `No scenarios match: ${scenarioFilter}`);

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

  for (const scenario of selectedScenarios) {
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
    console.log(`Axe accessibility checks passed for ${selectedScenarios.length} selected scenario(s).`);
  }
} finally {
  await context?.close();
  await browser?.close();
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}
