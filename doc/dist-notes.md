# Dist Pipeline Notes

`npm run build` and `npm run build:dist` both create a fresh, complete `dist/` from canonical sources. The workflow removes the old package, generates and verifies CSS and JavaScript directly in `dist/`, copies public assets, rewrites packaged HTML, generates the production service worker, and verifies the package. Standalone `build:css` and `build:js` write only their respective bundles without clearing other output. Source HTML remains readable and usable without generated `.min` files; packaged HTML receives `data-vista-build="production"` to enable service worker registration. Root `netlify.toml` runs the full build and publishes `dist/`.

## Copied HTML pages

- `404.html`
- `contact.html`
- `cookies.html`
- `gallery.html`
- `index.html`
- `offers.html`
- `offline.html`
- `onas.html`
- `polityka-prywatnosci.html`
- `regulamin.html`
- `rooms.html`

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
- `doc/`
- `README.md`
- `package-lock.json`

## Final npm scripts related to dist

- `npm run dist:clean`
- `npm run build:css`
- `npm run build:js`
- `npm run build:dist`
- `npm run build` (alias of `build:dist`)

The output paths above are relative to `dist/`. Source-tree copies of `css/style.min.css` and `js/script.min.js` are obsolete and ignored. `dist/` is generated and must not be edited or committed.
