# Dist Pipeline Notes

`npm run build` and `npm run build:dist` both create a fresh, complete `dist/` from canonical sources. The workflow removes the old package, generates and verifies CSS and JavaScript directly in `dist/`, copies public assets, rewrites packaged HTML, generates the production service worker, and verifies the package. Standalone `build:css` and `build:js` write only their respective bundles without clearing other output. Source HTML remains readable and usable without generated `.min` files. Packaged HTML receives `data-vista-build="production"` to enable the installation and offline controls. Root `netlify.toml` runs the full build and publishes `dist/`.

## Copied HTML pages

`scripts/build-dist.mjs` automatically discovers all regular root `*.html` files. It packages them according to the source asset-tag contract, rewrites their production references, and includes them in the generated worker's precache list. The worker uses the list after explicit offline activation or when updating a confirmed offline installation. No separate page list or fixed package page count is maintained here; see the [project context](CONTEXT-PROJECT.md#maintenance-rules) for page-maintenance requirements.

## Generated production paths

- `css/style.min.css`
- `js/script.min.js`
- `pwa/service-worker.js`, generated from current distribution assets

## Copied asset paths

- `js/theme-init.js`
- `site.webmanifest`
- `robots.txt`
- `sitemap.xml`
- `_headers`
- `_redirects`
- `assets/fonts/`
- `assets/seo/`
- `assets/img/icons/`
- `assets/img/logo/`
- `assets/img/og/`
- `assets/img/optimized/`
- `assets/img/screenshots/`
- `assets/img/shortcuts/`
- `assets/img/ui/`

## Licensing documents

The build copies the two root documents directly and the upstream license files with their asset directories. Distribution verification requires all five files.

- `LICENSE.md`
- `THIRD-PARTY-NOTICES.md`
- `assets/fonts/Inter-OFL.txt`
- `assets/fonts/Manrope-OFL.txt`
- `assets/img/icons/Tabler-Icons-MIT.txt`

## Excluded development-only paths

- `css/style.css`
- `css/modules/`
- `js/script.js`
- `js/features/`
- `assets/img/src/`
- `assets/img/optimized/test/`
- `assets/img/optimized/.gitkeep`
- `scripts/`
- `node_modules/`
- `postcss.config.cjs`
- `docs/`
- `README.md`
- `package-lock.json`

## Final npm scripts related to dist

- `npm run dist:clean`
- `npm run build:css`
- `npm run build:js`
- `npm run build:dist`
- `npm run build` (alias of `build:dist`)
- `npm run preview` (inspects an already built `dist/`; does not rebuild)

[`package.json`](../package.json) is authoritative for these scripts; the maintained [workflow guide](settings.md) covers command usage and local preview.

The output paths above are relative to `dist/`. Source-tree copies of `css/style.min.css` and `js/script.min.js` are obsolete and ignored. `dist/` is generated and must not be edited or committed.
