# Changelog

All significant changes to this project are documented in this file.

## [Unreleased]

### Added

- Imported the existing Vista static multi-page site into its dedicated repository, including room, offer, gallery, contact, legal, error, and offline pages.
- Included room and gallery filters, tabs, a keyboard-operated lightbox, and light/dark/auto theme preferences stored in `localStorage`.
- Included mobile navigation with keyboard focus handling, visible focus styles, reduced-motion rules, and a project-demo notice whose dismissal is stored in `localStorage`.
- Included a Netlify Forms-configured contact inquiry form with client-side validation and date constraints; the form does not make a reservation.
- Included a web app manifest and service worker with cached assets, cached HTML, and an offline page fallback.
- Included per-page metadata, sitemap and robots files, and embedded JSON-LD fallbacks with optional page-specific payloads.
- Included Netlify redirect and response-header configuration, including a custom 404 route.

### Documentation

- Aligned the terms, privacy policy, and cookies policy with the site's demonstrational scope and the implemented contact form, browser storage, offline caching, and embedded map.
- Replaced the root `LICENSE` with project-specific Polish and English KP_Code proprietary terms.

### Build and Tooling

- Added ignore rules for generated output, dependencies, local configuration, and test reports while retaining project sources and the lockfile.
- Established modular CSS and JavaScript sources, PostCSS and esbuild asset builds, and a `dist` pipeline that rewrites HTML asset references and generates a content-versioned service worker.
- Included a Sharp-based image pipeline and responsive image assets in AVIF, WebP, and fallback formats.
- Moved CSS and JavaScript production bundles into disposable `dist/` output; both `build` and `build:dist` now rebuild a clean package from current sources, while standalone bundle commands preserve other distribution files. Set Netlify to run the full build and publish `dist/`.
- Limited service worker registration to production-marked HTML, added scoped cleanup of prior Vista registrations and caches during development, and generated the production worker from packaged assets.

### Fixed

- Made reveal-marked content visible without JavaScript or when reveal initialization fails, while preserving scroll animations and reduced-motion support.
- Restored native contact-form validation without JavaScript while preserving enhanced error messages and Netlify Forms submission.
- Contained keyboard focus within project and gallery dialogs, isolated background interactions, and restored focus after dismissal.
- Aligned Vista package license metadata with the proprietary `LICENSE` while preserving third-party dependency licenses.
- Updated image UI cache headers to revalidate same-URL assets and prevent stale images after future deployments.

### Testing

- Included local-link integrity checking and a Playwright/axe accessibility audit script.
- Verified clean production builds and source-to-dist behavior for room filters, project notice, reveal animations, contact validation, and modal focus management.
