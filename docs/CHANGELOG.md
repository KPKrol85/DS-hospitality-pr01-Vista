# Changelog

All significant changes to Vista Hotels & Travel are documented in this file.

## Entry policy

A change is significant when a future maintainer or the project owner would reasonably need to know that one of the following changed:

- user-visible behavior, including meaningful UI, UX, or public content changes;
- accessibility behavior or accessibility contracts;
- build behavior, build guards, or npm scripts;
- test infrastructure or verification tooling;
- the dependency set;
- deployment or hosting workflow;
- PWA, service-worker, cache, or offline behavior;
- architecture, sources of truth, or important project maintenance contracts.

Judge by impact, not by file count. A small visual change is recorded when it affects behavior, accessibility, or a shared component contract. Editing a file alone does not justify an entry.

Not recorded: improvement-report status updates and archiving, commit-only or tracking-document changes, temporary verification probes, minor internal documentation corrections, and isolated cosmetic adjustments without broader impact.

For each implementation task, determine `Changelog: yes` or `Changelog: no`. Add entries only when authorized within the approved task scope.

## [Unreleased]

### Added

- Imported the Vista multi-page hospitality demonstration with room, offer, gallery, contact, legal, error, and offline pages.
- Added URL-persistent room and gallery filters, tabs, keyboard-accessible lightboxes, and photo-position indicators.
- Added responsive navigation, persisted light/dark/auto theme preferences, and a dismissible project notice.
- Implemented a validated Netlify Forms inquiry flow with offer prefill and a confirmation page, without reservation processing.
- Introduced a web app manifest, versioned service worker, cached assets and pages, and an offline fallback.
- Added page metadata, JSON-LD, sitemap and robots rules, Netlify headers and redirects, and a custom 404 route.

### Documentation

- Adopted bilingual KP_Code proprietary licensing and aligned package license metadata.
- Updated legal disclosures for the demonstration, inquiry form, browser storage, offline caching, and embedded map.

### Build and Tooling

- Established modular CSS and JavaScript sources with PostCSS, esbuild, and reproducible clean `dist/` builds.
- Added Sharp image optimization and responsive AVIF, WebP, and fallback assets.
- Configured Netlify to publish `dist/` with rewritten asset references and a content-versioned service worker.
- Restricted service worker registration to production builds and scoped development cache cleanup.
- Added local development with live reload and production-package preview servers.
- Introduced `qa:fast` validation for links, syntax, structured data, image descriptors, and booking-date behavior.
- Added GitHub Actions CI running `qa:fast` and production builds for `main`, with accessibility checks on pull requests and manual runs.

### Changed

- Identified testimonials and offers as fictional demonstration content and broadened contact messaging to all KP_Code Digital Studio projects.
- Replaced the automatic project modal with permanent footer disclosures identifying the fictional brand, illustrative content, and KP_Code authorship.
- Clarified contact CTAs and the PWA shortcut to distinguish project inquiries from hotel reservations.
- Consolidated theme colours and gradients into shared palette tokens.
- Replaced repeated inline SVG icons with a cached, reusable 15-symbol sprite.
- Redesigned the contact page with a responsive two-column layout, integrated map, and clearer form hierarchy.
- Refined responsive grids, content alignment, heading scales, and button sizing.
- Standardized theme-aware focus rings, form typography, and active navigation and filter states.
- Consolidated phone and guest validation across contact-form input and submission handlers.

### Fixed

- Corrected footer contact addresses and identified Kamil Król as the data controller.
- Excluded `noindex` legal pages from the sitemap while retaining their public routes and canonical URLs.
- Corrected responsive-image width and `sizes` descriptors to match generated assets and rendered layouts.
- Improved offer-badge, skip-link, and form-error contrast across supported themes.
- Enforced integer guest counts from 1 to 6 and restored native form validation without JavaScript.
- Corrected past-arrival date rejection and valid Netlify Forms inquiry submission.
- Improved first-invalid-field focus, live validation feedback, and error recovery.
- Resolved custom 404 assets, structured data, and recovery links from the domain root.
- Removed hidden mobile navigation links from keyboard traversal and reset menu state at desktop widths.
- Preserved reveal content without JavaScript and contained dialog focus with restoration on dismissal.
- Hardened room and gallery URL-filter handling against malformed fragments.
- Restored interactive map visibility after delayed iframe loading while retaining its fallback.
- Updated image cache revalidation to prevent stale same-URL assets after deployment.
- Made one-shot image optimization report processing failures through a non-zero exit status.
- Aligned contact landmarks and structured data with the site's demonstrational scope.

### Testing

- Added JSON-LD fallback equivalence and Warsaw-relative booking-date Edge Function checks.
- Added responsive-image descriptor validation and browser candidate-selection coverage.
- Added focused regression coverage for form validation, theme contrast, navigation, dialogs, and 404 behavior.
- Verified clean production builds and eight Playwright/axe accessibility scenarios without reported violations.
