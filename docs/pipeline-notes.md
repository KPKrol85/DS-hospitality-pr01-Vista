# Vista — Pipeline Notes

This document summarizes the current development, build, verification, and deployment pipeline for Vista.

[`package.json`](../package.json) is the authoritative source for npm scripts. Detailed command descriptions are maintained in [settings.md](settings.md), while [dist-notes.md](dist-notes.md) documents production packaging.

## Source entrypoints

- **HTML:** Root `*.html` files.
- **CSS:** `css/style.css`, with modules in `css/modules/`.
- **JavaScript:** `js/script.js`, with features in `js/features/`.
- **Images:** `assets/img/src/`, with optimized variants in `assets/img/optimized/`.

Canonical source files remain directly usable during development. Production bundles and distribution files are generated in `dist/` and must not be edited manually or committed.

## Development and production

- `npm run dev` serves canonical sources with live reload at `http://127.0.0.1:8181`.
- `npm run build` executes the complete production pipeline through `build:dist`.
- The production build cleans `dist/`, generates and verifies CSS and JavaScript bundles, packages public files, rewrites HTML asset references, generates the production Service Worker, and verifies the distribution.
- Production HTML receives `data-vista-build="production"` to enable Service Worker registration.
- `npm run preview` serves an existing production package at `http://127.0.0.1:8182/` without rebuilding it.

Development mode does not require production bundles or register the production Service Worker. The generated distribution remains separate from canonical sources.

## Current npm scripts

### Development

- `dev`
- `preview`

### Production build

- `build`
- `build:dist`
- `dist:clean`
- `build:css`
- `build:js`

### Image processing

- `img:opt`
- `img:clean`
- `img:watch`

### Quality assurance

- `qa:fast`
- `check:links`
- `check:syntax`
- `check:booking-date`
- `check:jsonld`
- `check:image-descriptors`
- `test:a11y`

### Placeholder

- `test` — intentionally exits with an error; not used for project verification.

## Continuous integration

GitHub Actions is configured in [ci.yml](../.github/workflows/ci.yml).

The workflow runs on pushes and pull requests targeting `main`, as well as manual dispatches.

**Quality & Build:**

1. Install dependencies using `npm ci`.
2. Run `npm run qa:fast`.
3. Run `npm run build`.

**Accessibility:**

- Runs on pull requests and manual workflow dispatches.
- Installs Playwright Chromium.
- Executes `npm run test:a11y` using Playwright and axe-core.

Accessibility checks are not automatically executed on ordinary pushes to `main`.

## Deployment

Root [netlify.toml](../netlify.toml) defines:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

The production package includes the generated assets and hosting configuration required by the existing build pipeline.

Local development, production preview, and CI checks do not independently verify live Netlify Forms delivery, Edge Functions, production security headers, redirects, or deployment availability. These require separate production verification.

## Maintenance rules

- Keep npm script definitions authoritative in `package.json`.
- Maintain detailed developer instructions in `docs/settings.md`.
- Maintain production packaging details in `docs/dist-notes.md`.
- Update this document only when the pipeline structure or its operational contracts change.
- Preserve the separation between canonical sources and generated production output.
