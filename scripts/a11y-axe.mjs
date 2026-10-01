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
    for (const node of violation.nodes) {
      console.error(`  ${node.target.join(', ')}: ${node.failureSummary}`);
    }
  }
}

async function runAxe(page, options = {}) {
  // Inject test instrumentation through Playwright without weakening the page's CSP.
  await page.evaluate(axeSource);
  return page.evaluate(async (scenarioOptions) => {
    return window.axe.run(document, {
      resultTypes: ['violations'],
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'best-practice']
      },
      ...scenarioOptions
    });
  }, options);
}

async function runScenario(page, baseUrl, spec) {
  const targetUrl = `${baseUrl}/${spec.path}`;
  if (spec.beforeLoad) {
    await spec.beforeLoad(page);
  }
  const response = await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');

  if (spec.setup) {
    await spec.setup(page, response);
  }

  const result = await runAxe(page, spec.axeOptions);
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

function luminance(rgb) {
  const linear = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

async function assertErrorContrast(page, ids, label) {
  // Decode rendered pixels with the project's existing image-tooling dependency.
  const sharp = projectRequire('sharp');
  await page.evaluate(() => document.fonts.ready);
  const ratios = [];
  for (const id of ids) {
    const error = page.locator(`#err-${id}`);
    const foreground = await error.evaluate((element) => {
      const style = getComputedStyle(element);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = style.color;
      ctx.fillRect(0, 0, 1, 1);
      const opaqueAncestors = [];
      for (let node = element; node; node = node.parentElement) {
        opaqueAncestors.push(getComputedStyle(node).opacity === '1');
      }
      return { rgba: [...ctx.getImageData(0, 0, 1, 1).data], opaque: opaqueAncestors.every(Boolean) };
    });
    assert.ok(foreground.opaque && foreground.rgba[3] === 255,
      `${label}: err-${id} measurement requires opaque text and ancestors`);
    const textLuminance = luminance(foreground.rgba.slice(0, 3));
    let minimum = Infinity;
    // body::before is fixed: exercise each surface at three viewport positions.
    for (const position of [0.25, 0.5, 0.75]) {
      await error.evaluate((element, fraction) => {
        const rect = element.getBoundingClientRect();
        window.scrollBy({ top: rect.top + rect.height / 2 - innerHeight * fraction, behavior: 'instant' });
      }, position);
      const painted = await error.screenshot({ animations: 'disabled' });
      // Hide only glyph paint during capture; retain layout, page gradients and
      // every composited background, including the translucent date fieldset.
      // Playwright restores this screenshot-only style before axe runs.
      const screenshot = await error.screenshot({
        animations: 'disabled',
        style: '.form__error { -webkit-text-fill-color: transparent !important; text-shadow: none !important; }'
      });
      const visible = await sharp(painted).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      assert.deepEqual(info, visible.info, 'Glyph masking must preserve screenshot geometry');
      assert.equal(info.channels, 3);
      let glyphPixels = 0;
      for (let offset = 0; offset < data.length; offset += 3) {
        // The paired images locate actual glyphs, excluding line-box whitespace
        // and neighboring input outlines. Use un-antialiased computed text color
        // against the composited background underneath every painted glyph pixel.
        if (data[offset] === visible.data[offset] && data[offset + 1] === visible.data[offset + 1] &&
          data[offset + 2] === visible.data[offset + 2]) continue;
        glyphPixels += 1;
        const background = luminance([data[offset], data[offset + 1], data[offset + 2]]);
        const ratio = (Math.max(textLuminance, background) + 0.05) / (Math.min(textLuminance, background) + 0.05);
        minimum = Math.min(minimum, ratio);
      }
      assert.ok(glyphPixels > 0, `err-${id} must paint visible text at viewport position ${position}`);
    }
    console.log(`${label}: err-${id} minimum rendered contrast ${minimum.toFixed(3)}:1`);
    assert.ok(minimum >= 4.5, `${label}: err-${id} contrast ${minimum.toFixed(3)}:1 must reach 4.5:1`);
    ratios.push(minimum);
  }
  console.log(`${label}: minimum across all errors ${Math.min(...ratios).toFixed(3)}:1 (required 4.5:1).`);
}

function contactValidationScenario(preference, colorScheme) {
  const effective = preference === 'auto' ? colorScheme : preference;
  const label = `contact.html (validation errors visible) [${preference}, OS ${colorScheme}]`;
  return {
    label,
    path: 'contact.html',
    // Only PH1-03: axe treats transparent/gradient page surfaces as white in
    // dark mode. assertErrorContrast() checks every error's rendered pixels at
    // >= 4.5:1 instead; unrelated link contrast is outside this scenario's scope.
    axeOptions: { rules: { 'color-contrast': { enabled: false } } },
    beforeLoad: async (page) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.addInitScript((pref) => {
        if (pref === 'auto') localStorage.removeItem('theme-pref');
        else localStorage.setItem('theme-pref', pref);
      }, preference);
    },
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
      const theme = await page.evaluate(() => ({
        stored: localStorage.getItem('theme-pref'),
        effective: document.documentElement.dataset.theme,
        osDark: matchMedia('(prefers-color-scheme: dark)').matches,
        background: getComputedStyle(document.body, '::before').backgroundColor,
        foreground: getComputedStyle(document.querySelector('#err-name')).color,
        gradients: getComputedStyle(document.body, '::before').backgroundImage
      }));
      assert.equal(theme.stored, preference === 'auto' ? null : preference);
      assert.equal(theme.effective, effective, `${label}: effective theme`);
      assert.equal(theme.osDark, colorScheme === 'dark');
      assert.equal(theme.background, effective === 'dark' ? 'rgb(10, 13, 17)' : 'rgb(250, 248, 243)');
      assert.equal(theme.foreground, effective === 'dark' ? 'rgb(248, 113, 113)' : 'rgb(185, 28, 28)');
      assert.match(theme.gradients, /radial-gradient/, 'Measure with the real page gradients enabled');

      const contactUrl = page.url();
      const formAction = new URL(await form.evaluate((element) => element.action));
      assert.equal(formAction.origin, new URL(contactUrl).origin, 'Vista form action must remain same-origin');
      const formPosts = [];
      page.on('request', (request) => {
        if (request.method() !== 'POST') return;
        const destination = new URL(request.url());
        // Embedded Google Maps POSTs are not Vista contact-form submissions.
        if (destination.origin === formAction.origin && destination.pathname === formAction.pathname) {
          formPosts.push(request.url());
        }
      });
      const phone = page.locator('#phone');
      assert.equal(await phone.evaluate((element) => element.required), false, 'Phone must remain optional');
      await phone.fill('123');
      await phone.fill('');
      assert.equal(await phone.getAttribute('aria-invalid'), 'false', 'Empty optional phone must be valid');
      assert.equal(await page.locator('#err-phone').isVisible(), false);
      await phone.fill('123');
      assert.equal(await phone.evaluate((element) => element.validity.patternMismatch), true,
        'Non-empty optional phone must actually violate its pattern');
      await page.locator('#guests').fill('0');
      await form.getByRole('button', { name: 'Wyślij zapytanie', exact: true }).click();

      const ids = ['name', 'email', 'phone', 'checkin', 'checkout', 'guests', 'consent'];
      for (const id of ids) {
        const control = page.locator(`#${id}`);
        const error = page.locator(`#err-${id}`);
        assert.equal(await control.getAttribute('aria-invalid'), 'true', `${id} must be invalid`);
        assert.ok((await control.getAttribute('aria-describedby') || '').split(/\s+/).includes(`err-${id}`),
          `${id} must reference its error message`);
        assert.equal(await error.isVisible(), true, `err-${id} must be visible`);
        assert.ok((await error.innerText()).trim(), `err-${id} must contain feedback`);
        assert.equal(await error.getAttribute('aria-live'), 'polite', `err-${id} must retain live feedback`);
      }
      await page.waitForFunction(() => document.activeElement === document.querySelector('#name'));
      await assertErrorContrast(page, ids, label);
      assert.equal(page.url(), contactUrl, 'Invalid submission must remain on contact.html');
      assert.equal(await form.locator('.form__success').isVisible(), false, 'Invalid submission must not show success');
      assert.deepEqual(formPosts, [], 'Invalid submission must not POST to the Vista form action');
      // The runner shares a context; do not leave this preference for unrelated scenarios.
      await page.evaluate(() => localStorage.removeItem('theme-pref'));
      console.log(`${label}: all seven errors, optional phone, focus, ARIA/live feedback and blocked submission passed.`);
    }
  };
}

function custom404Scenario() {
  const missingPaths = ['/missing-vista-page', '/missing-vista/nested/page', '/missing-vista/nested/'];
  let trace;

  async function prepare(page) {
    const html = await readFile(path.join(rootDir, '404.html'), 'utf8');
    const headers = await readFile(path.join(rootDir, 'netlify/_headers'), 'utf8');
    const csp = headers.match(/^\s+Content-Security-Policy: (.+)$/m)?.[1].trim();
    assert.ok(csp, 'Use the current source CSP in the local 404 fixture');
    await page.route((url) => missingPaths.includes(url.pathname), (route) => route.fulfill({
      status: 404, contentType: 'text/html; charset=utf-8', body: html,
      headers: { 'Content-Security-Policy': csp }
    }));
    const observed = { requests: [], responses: [], errors: [] };
    page.on('request', (request) => observed.requests.push(request));
    page.on('response', (response) => observed.responses.push(response));
    page.on('requestfailed', (request) => observed.errors.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on('pageerror', (error) => observed.errors.push(error.message));
    return observed;
  }

  async function verify(page, response, observed, missingPath, javaScriptEnabled) {
    const origin = new URL(page.url()).origin;
    assert.equal(response.status(), 404, 'Missing document must retain HTTP 404');
    assert.equal(page.url(), origin + missingPath, 'Fixture must preserve the requested URL');
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow');
    assert.equal(await page.locator('meta[name="ld-json"]').getAttribute('content'), '/assets/seo/ld-404.json');
    assert.equal(await page.locator('#not-found-heading').isVisible(), true);
    assert.match(await page.locator('#not-found-heading').innerText(), /Nie znaleziono strony/);
    assert.equal(await page.locator('body').evaluate((el) => getComputedStyle(el).marginTop), '0px',
      'Source stylesheet must be applied');

    if (javaScriptEnabled) {
      await page.locator('#projectBannerAccept').click();
      await page.locator('#projectBanner').waitFor({ state: 'hidden' });
      assert.equal(await page.locator('html').getAttribute('class'), 'js');
      assert.match(await page.locator('[data-year]').innerText(), /^\d{4}$/);
      const initialTheme = await page.locator('html').getAttribute('data-theme');
      await page.locator('#theme-toggle').click();
      assert.notEqual(await page.locator('html').getAttribute('data-theme'), initialTheme);
      await page.locator('#theme-toggle').click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), initialTheme);
    } else {
      assert.equal(await page.locator('html').getAttribute('class'), 'no-js');
      assert.equal(await page.locator('#site-nav').isVisible(), true, 'No-JS mobile navigation must remain visible');
      const navLinks = page.locator('#site-nav a');
      await navLinks.first().focus();
      await page.keyboard.press('Tab');
      assert.equal(await navLinks.nth(1).evaluate((el) => el === document.activeElement), true);
    }

    await page.locator('.footer__brand-img').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
    const links = await page.locator('a[href]').evaluateAll((anchors) => anchors
      .filter((a) => a.origin === location.origin && !a.getAttribute('href').startsWith('#'))
      .map((a) => ({ raw: a.getAttribute('href'), url: a.href })));
    for (const { raw, url } of links) {
      assert.ok(raw.startsWith('/') && !raw.startsWith('//'), `Root-safe link required: ${raw}`);
      assert.equal((await page.request.get(url)).status(), 200, `Valid local route required: ${url}`);
    }
    for (const [selector, expected] of [
      ['.not-found__actions a:first-child', '/index.html'],
      ['.not-found__actions a:last-child', '/contact.html'],
      ['#site-nav li:first-child a', '/index.html'],
      ['#site-nav .btn', '/contact.html#form'],
      ['.footer__legal li:first-child a', '/polityka-prywatnosci.html']
    ]) {
      assert.equal(await page.locator(selector).evaluate((el) => el.href), origin + expected);
    }

    const skip = page.locator('.skip-link');
    assert.equal(await skip.getAttribute('href'), '#main');
    const documentRequests = observed.requests.filter((request) => request.isNavigationRequest()).length;
    await skip.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(origin + missingPath + '#main');
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.not-found__actions a:first-child').evaluate((el) => el === document.activeElement), true,
      'Native skip navigation must move keyboard traversal into main');
    assert.equal(observed.requests.filter((request) => request.isNavigationRequest()).length, documentRequests,
      'Skip link must not load another document');

    await page.waitForLoadState('networkidle');
    const required = ['/css/style.css', '/assets/img/logo/logo-128x128.svg', '/assets/img/logo/logo-160x160.svg',
      '/assets/img/icons/sun-40x40.svg'];
    if (javaScriptEnabled) required.push('/js/theme-init.js', '/js/script.js', '/assets/seo/ld-404.json', '/assets/img/icons/moon-40x40.svg');
    for (const asset of required) {
      assert.ok(observed.responses.some((item) => new URL(item.url()).pathname === asset && item.status() === 200),
        `Expected successful root asset response: ${asset}`);
    }
    for (const request of observed.requests.filter((item) => !item.isNavigationRequest())) {
      const url = new URL(request.url());
      assert.equal(url.origin, origin, '404 assets must stay same-origin');
      assert.match(url.pathname, /^\/(css|js|assets)\//, `Unexpected asset path: ${url.pathname}`);
    }
    assert.deepEqual(observed.responses.filter((item) => !item.request().isNavigationRequest() && item.status() >= 400)
      .map((item) => item.url()), [], 'No failed local asset responses');
    assert.deepEqual(observed.errors, [], 'No script errors or failed requests');
    console.log(`404 routing assertions passed: ${missingPath} (${javaScriptEnabled ? 'JS' : 'no-JS'}).`);
  }

  return {
    label: '404.html (missing-path recovery)',
    path: missingPaths[0].slice(1),
    beforeLoad: async (page) => { trace = await prepare(page); },
    setup: async (page, firstResponse) => {
      const origin = new URL(page.url()).origin;
      for (const [index, missingPath] of missingPaths.entries()) {
        if (index > 0) {
          trace.requests.length = trace.responses.length = trace.errors.length = 0;
        }
        const response = index === 0 ? firstResponse : await page.goto(origin + missingPath, { waitUntil: 'networkidle' });
        // Exercise real notice dismissal on each JS document.
        await verify(page, response, trace, missingPath, true);
        await page.evaluate(() => localStorage.removeItem('vista_project_banner_accepted'));
      }
      const context = await page.context().browser().newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
      try {
        for (const missingPath of missingPaths) {
          const noJsPage = await context.newPage();
          const observed = await prepare(noJsPage);
          const response = await noJsPage.goto(origin + missingPath, { waitUntil: 'networkidle' });
          await verify(noJsPage, response, observed, missingPath, false);
          await noJsPage.close();
        }
      } finally {
        await context.close();
      }
    }
  };
}

const scenarios = [
  custom404Scenario(),
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
      const banner = page.locator('#projectBanner');
      if (await banner.isVisible()) {
        await page.locator('#projectBannerAccept').click();
        await banner.waitFor({ state: 'hidden' });
      }
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
  contactValidationScenario('light', 'dark'),
  contactValidationScenario('dark', 'light'),
  contactValidationScenario('auto', 'light'),
  contactValidationScenario('auto', 'dark'),
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
