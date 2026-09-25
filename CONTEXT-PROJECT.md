# Vista — Project Context

**Project type:** Static multi-page website (HTML, CSS, vanilla JavaScript) with a Node.js build pipeline and Netlify configuration
**Context status:** Active
**Last reviewed:** 2026-09-25

## Project identity

Vista — Hotels & Travel is a demonstrational static site for a fictional hospitality brand, authored by KP_Code Digital Studio. It presents rooms, offers, a gallery, brand information, legal documents, and a contact inquiry form. All page content, UI copy, ARIA labels, and form messages are Polish (`lang="pl"`).

The site makes no reservations and processes no payments. The contact form sends a project inquiry through Netlify Forms; its stay-date fields are demonstrational.

## Project intent

Vista is a KP_Code Digital Studio reference build (`portfolio` package keyword, `.gitignore` header, contact-page attribution). It is treated as a technically serious reference implementation: semantics, accessibility, progressive enhancement, content integrity, and deployment awareness matter as much as the visuals. Avoid demo shortcuts that would weaken the project's technical credibility.

The project is released under proprietary KP_Code terms (`LICENSE`), not an open-source license.

## Technology stack

- HTML, CSS with custom properties split into `@import`ed modules, and vanilla JavaScript ES modules. No application framework and no runtime npm dependencies.
- Node.js and npm (`package-lock.json`) for tooling only.
- PostCSS with `postcss-import`, Autoprefixer, and cssnano (`postcss.config.cjs`) for CSS bundling.
- esbuild for the JavaScript bundle (IIFE, `es2018` target).
- Sharp and chokidar for the image pipeline.
- Playwright and axe-core for the accessibility check script.
- Netlify: `netlify.toml`, `_headers`, `_redirects`, Netlify Forms, and one Edge Function (Deno runtime; `deno.lock` records its Netlify bootstrap imports).
- Browser APIs used materially: Service Worker and Cache Storage, `localStorage`, `IntersectionObserver`, `matchMedia`, and `inert`.

## Architecture

- **Static MPA.** 11 root-level HTML files, each a complete document: `index.html`, `rooms.html`, `offers.html`, `gallery.html`, `onas.html`, `contact.html`, `regulamin.html`, `polityka-prywatnosci.html`, `cookies.html`, `404.html`, `offline.html`.
- **No templating.** The shared shell (head metadata pattern, header and navigation, theme toggle, project-notice modal, footer with author contact details) is duplicated in every page.
- **Progressive enhancement.** `<html class="no-js">` becomes `js` when `js/script.js` runs. Content and navigation are usable without JavaScript. Menu, tabs, filters, lightbox, reveal animation, enhanced form validation, and the map embed activate only after successful initialization.
- **Two runtime modes:**
  - *Source mode*: the repository root is served directly by any static HTTP server. Pages load `css/style.css` (with `@import`s) and `js/script.js` as an ES module. No service worker is registered. On load, source mode unregisters a leftover Vista production worker for the root scope and deletes Vista-owned caches.
  - *Production mode*: the `dist/` package uses minified bundles, and `<html data-vista-build="production">` enables service worker registration.
- **Root-scope deployment.** The worker is registered from `/pwa/service-worker.js` with scope `/`. The manifest uses `start_url` and `scope` `/`, and `_headers` sets `Service-Worker-Allowed: /`. The site expects to be served from a domain root.
- **Server-side scope.** Limited to Netlify platform features: Netlify Forms (form `booking`) and `netlify/edge-functions/validate-booking-date.js`. The Edge Function handles POST on `/*`. For `form-name=booking` it rejects a missing, malformed, or past `checkin` (Europe/Warsaw date) with HTTP 422. The project has no backend, database, or API of its own.

## Canonical source ownership

- **Canonical sources (edit these):**
  - root `*.html`;
  - `css/style.css` and `css/modules/*.css`;
  - `js/script.js`, `js/features/*.js`, and `js/theme-init.js`;
  - `pwa/service-worker.js` (a build template);
  - `assets/seo/ld-*.json`;
  - `site.webmanifest`, `robots.txt`, and `sitemap.xml`;
  - `netlify.toml` and `netlify/`;
  - `scripts/*.mjs`;
  - `assets/img/src/` (image pipeline input) and the other static assets under `assets/`.
- **Generated and tracked:** `assets/img/optimized/`, produced by `npm run img:opt` from `assets/img/src/` and committed. HTML references these paths directly.
- **Generated and untracked:** `dist/` (gitignored). Source-tree `css/style.min.css` and `js/script.min.js` are obsolete and ignored.
- **Service worker template:** `pwa/service-worker.js` must contain exactly one `const CACHE_VERSION = "SOURCE_ONLY";` and one `const STATIC_ASSETS = [];`. The build replaces them. In source form the worker logic is inert.
- **JSON-LD pairs:** each page embeds a fallback `<script type="application/ld+json" data-seo-jsonld="fallback">`. It also points `<meta name="ld-json">` to `assets/seo/ld-<page>.json`. `js/features/seo-jsonld.js` fetches that file and replaces the fallback. Both copies are hand-maintained and must stay semantically identical.
- **Hardcoded public origin:** `https://hospitality-pr01-vista.netlify.app` appears in canonical links, Open Graph and Twitter metadata, JSON-LD, `sitemap.xml`, and `robots.txt`.

## Project structure

```text
.
├── *.html                  # 11 canonical pages (complete documents)
├── css/
│   ├── style.css           # CSS entry; @imports modules in cascade order
│   └── modules/            # tokens, base, layout, components, sections,
│                           # utilities, themes, motion, print, subpages
├── js/
│   ├── theme-init.js       # blocking pre-paint theme resolver (copied, not bundled)
│   ├── script.js           # ES module entry: boot() and service worker configuration
│   └── features/           # one module per feature
├── pwa/service-worker.js   # service worker template
├── assets/
│   ├── seo/                # per-page JSON-LD payloads
│   ├── img/src/            # image pipeline input (never packaged)
│   ├── img/optimized/      # generated responsive variants (tracked)
│   └── fonts/, img/{icons,logo,og,ui,screenshots,shortcuts}/
├── netlify/                # _headers, _redirects, edge-functions/
├── scripts/                # build, image, link-check, and a11y scripts
├── doc/                    # CHANGELOG, pipeline notes, archive/
└── netlify.toml, site.webmanifest, robots.txt, sitemap.xml
```

## Development conventions

- **CSS naming:** BEM-style blocks, elements, and modifiers (`site-header__inner`, `btn--primary`, `form__field--checkbox`). JavaScript toggles `is-*` state classes (`is-open`, `is-active`, `is-compact`, `is-revealed`, `is-nav-open`).
- **Design tokens:** `css/modules/tokens.css` defines colors, fluid type scale, spacing, radius, line height, letter spacing, layout, and z-index. Use tokens instead of literal values.
- **Theming:**
  - `data-theme` on `<html>`: source markup ships `auto`, and `js/theme-init.js` resolves it to `light` or `dark` before first paint. It is loaded synchronously in `<head>` before the stylesheet.
  - Theme token overrides live in `tokens.css`; theme-specific component adjustments live in `themes.css`.
  - The preference is stored in `localStorage` key `theme-pref`. `auto` removes the key, and Shift+click on the toggle resets to `auto`.
- **Responsive:** mobile-first `min-width` breakpoints, mainly 480px, 760px, and 1024px. The mobile navigation boundary is shared by `js/features/nav.js` (`max-width: 960px`) and `layout.css` (`min-width: 961px`).
- **Fonts:** self-hosted WOFF2 (Inter, Manrope) with `font-display: swap`.
- **Images:** `<picture>` with AVIF, WebP, and fallback `srcset` from `assets/img/optimized/`, plus explicit `width` and `height`. Below-the-fold images use `loading="lazy"`.
- **JavaScript modules:**
  - Each `js/features/*.js` module exports an `init*` (or setup) function. It finds its own hooks (`data-*` attributes or IDs), returns early when they are absent, and is called from `boot()` in `js/script.js` on `DOMContentLoaded`.
  - Dialog focus handling (activation, background `inert` isolation, focus trap, focus restore) is shared in `js/features/modal-focus.js`. The lightbox and project notice both use it.
  - `localStorage` access is wrapped in `try`/`catch` and degrades silently.
  - Logging goes through `js/features/logger.js`, which prints only when the URL contains `?debug=1`.
- **Asset tags are a build contract.** Every root page must have:
  - exactly one `<html>` element, without `data-vista-build`;
  - exactly one `href="css/style.css"`;
  - exactly one `<script type="module" defer src="js/script.js?vista-dev-1"></script>`.

  The build fails otherwise.
- **Content Security Policy** (`netlify/_headers`): `script-src 'self'`, `style-src 'self'`, and `frame-src` limited to Google Maps. Do not use inline scripts (JSON-LD data blocks excepted), `<style>` blocks, `style` attributes, inline event handlers, or third-party scripts, styles, or fonts without updating the CSP.
- **Language:** site content is Polish. `README.md` is bilingual PL/EN, and its two sections must stay factually equivalent. `doc/` files and commit messages are in English.

## Quality contracts

- Semantic landmarks, a skip link to `#main`, and visible `:focus-visible` styles on every page.
- **Keyboard support:**
  - The closed mobile menu is out of the focus order. Escape closes it, and focus returns to the element that was focused before it opened.
  - Tabs use `role="tab"` and `role="tablist"`, and the URL hash can select the initial panel.
  - The lightbox and project-notice dialogs contain focus and restore it on close.
- `prefers-reduced-motion` is respected (`motion.css`). `[data-reveal]` content is visible by default and animates only after `reveal` initialization succeeds (`reveal-ready`, `reveal-animated`).
- **Contact form:**
  - Native HTML constraints are the no-JavaScript baseline. Enhanced validation sets `noValidate`, manages `aria-invalid` and `aria-live` errors, and checks arrival against the browser-local date.
  - Keep `name="booking"`, the hidden `form-name=booking`, `data-netlify="true"`, and the `website` honeypot. Netlify Forms and the Edge Function depend on them.
- **Map embed:** the static fallback is shown until the Google Maps iframe loads (6 s timeout), and an external map link is always present.
- **Metadata on each page:** title, description, robots directive, Open Graph and Twitter tags, and JSON-LD. Indexable pages also have a canonical URL. Legal pages and `404.html` are `noindex,follow`.
- **Content integrity:**
  - Vista is fictional. The published address, telephone, email, and map location are the author's real details and are labelled as KP_Code Digital Studio contacts.
  - Do not add visible text or structured data (for example `Hotel`, location, or customer-service entities) that presents Vista as a real business.
- Documentation describes accessibility mechanisms and must not claim WCAG conformance.

## Data and state

- All content is static HTML. There is no application data store.
- **`localStorage`:** `theme-pref` stores the theme preference, and `vista_project_banner_accepted` stores dismissal of the project-notice modal.
- **URL hash:** selects the initial tab panel and the gallery filter.
- **Cache Storage (production worker only):** caches are named `vista-static-<hash>` and `vista-html-<hash>`.
  - Navigations are network-first with fallback to a cached page, then `index.html` for `/`, then `offline.html`.
  - Other same-origin GET requests are cache-first.
  - Older Vista caches, including legacy `th-*` names, are deleted on activation.
- Form submissions go to Netlify Forms. The application persists nothing itself.

## Build and generated output

- **Install:** `npm ci`.
- **Source-mode development:** serve the repository root with any static HTTP server. No build or dev-server script is required or configured.
- **`npm run build`** (alias of `build:dist`) runs:
  1. `dist:clean`: removes `dist/`.
  2. `build:css`: PostCSS writes `dist/css/style.min.css`, and `scripts/verify-build.mjs` rejects any remaining `@import`.
  3. `build:js`: esbuild writes `dist/js/script.min.js`, and the verifier rejects any remaining `import`/`export`.
  4. `scripts/build-dist.mjs`:
     - copies the listed asset directories (`REQUIRED_DIRS`), `js/theme-init.js`, the manifest, `robots.txt`, `sitemap.xml`, and `netlify/_headers` and `netlify/_redirects` into the `dist/` root;
     - auto-discovers every root `*.html`, adds `data-vista-build="production"`, points CSS and JS at the bundles, and rewrites any `assets/img/src/` reference;
     - generates `dist/pwa/service-worker.js` with a precache list (all HTML pages, both bundles, `js/theme-init.js`, the manifest) and a 12-hex content-hash cache version;
     - verifies the package: required files, rewritten references, no development sources, and precache consistency.
- `build:css` and `build:js` on their own write into `dist/` without cleaning it.
- **Image pipeline:** `img:opt` mirrors `assets/img/src/` (JPEG/PNG) into `assets/img/optimized/` as a copy of the original plus WebP and AVIF, max width 2000px. It is incremental by modification time. `img:watch` runs the same process continuously. `img:clean` deletes all of `assets/img/optimized/`, which includes tracked files.

## Testing and verification

- **No unit or integration test suite.** `npm test` is a placeholder that exits with an error.
- **`npm run check:links`:** static check of local `href`, `src`, and `srcset` references in root HTML, plus `sitemap.xml` `<loc>` paths mapped to root files.
- **`npm run test:a11y`:** serves the repository root (source pages, not `dist/`) and runs axe-core rules (`wcag2a`, `wcag2aa`, `best-practice`) in headless Chromium. It covers 8 scenarios: index baseline and open mobile menu, rooms baseline and Deluxe tab, gallery baseline and open lightbox, contact, and regulamin. It uses `npm exec --yes` with pinned Playwright and axe-core versions, so it may download packages.
- `npm run build` also checks the integrity of the production package.
- **Verification model:**
  - Prefer fast static checks and focused verification tied to the change.
  - When behavior can differ between modes (asset references, service worker, bundling), check both source pages and a freshly built `dist/`.
  - Run broad regression only when the task requires it.

## Deployment

- `netlify.toml` sets the build command to `npm run build` and publishes `dist`.
- **`netlify/_headers`:**
  - security headers and the CSP for all paths;
  - the manifest content type;
  - `no-cache` and `Service-Worker-Allowed: /` for the worker;
  - revalidation for `/assets/img/ui/*`.
- **`netlify/_redirects`:** `/index.html` returns 301 to `/`, and the catch-all `/*` serves `/404.html` with status 404.
- The Edge Function lives in `netlify/edge-functions/` and declares its route inline (`path: "/*"`, `method: "POST"`).
- The repository documents deployment configuration only. This context does not assert a live deployment or confirmed form delivery.

## Project boundaries

- A fictional, demonstrational brand. There is no booking engine, availability, pricing logic, payment, user account, CMS, or backend.
- The inquiry form contacts the project author and does not reserve anything. The client-side (browser-local) and Edge (Europe/Warsaw) date checks can differ by design.
- Polish-only site with no internationalization layer.
- Service worker and offline behavior exist only in the production package. Source mode intentionally never registers the worker.
- Deployment at a domain root is assumed. Subpath hosting is not supported by the current worker, manifest, and header configuration.

## Maintenance rules

- **Build output:** never edit or commit `dist/`; rebuild it from sources.
- **Optimized images:**
  - Do not hand-edit `assets/img/optimized/`. Change `assets/img/src/`, run `npm run img:opt`, and commit the regenerated variants.
  - After `img:clean`, regenerate before building.
- **Shell and page changes:**
  - Apply shared shell changes (header, navigation, footer, project notice, head patterns) to all 11 root pages.
  - A new root page is packaged and precached automatically. It must meet the asset-tag contract, replicate the shell, and add a JSON-LD fallback with a matching `assets/seo/ld-<page>.json`. Add it to `sitemap.xml` when it is indexable.
- **Coordinated edits:**
  - Update each embedded JSON-LD fallback and its `assets/seo/` file together.
  - Change the public origin in every canonical URL, Open Graph and Twitter tag, both JSON-LD copies, `sitemap.xml`, and `robots.txt` at once.
- **Build script and headers:**
  - Keep the service worker template placeholders intact. Precache scope is set in `scripts/build-dist.mjs` (`DIST_STATIC_ASSETS`), and packaged asset directories in `REQUIRED_DIRS`. A new public asset directory not listed there will be missing from `dist/`.
  - Any new external resource or embed requires a matching CSP change in `netlify/_headers`.
- **Script references:** `package.json` is authoritative for available scripts. `doc/settings.md` and `doc/dist-notes.md` describe the current pipeline. `doc/pipeline-notes.md` is a historical record.
- **Project documents:**
  - Active `PLAN.md` and `AUDIT.md` live at the repository root while in use. Completed ones move to `doc/archive/plans/PLAN-YYYY-MM-DD.md` and `doc/archive/audits/{AUDIT,REVIEW}-YYYY-MM-DD.md`.
  - Significant completed changes go in `doc/CHANGELOG.md`.
