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
- Added a branded confirmation page for contact inquiries.
- Added offer-aware contact message prefill and corrected homepage offer destinations.
- Added shareable and restorable URL-based room and gallery filters and corrected homepage room links.
- Added accessible photo position indicators to the gallery and homepage lightboxes.

### Documentation

- Corrected project-context descriptions of feature helpers, room/gallery URL state, allowed frame origins, and image variant sizing against their maintained sources.
- Established workflow documentation ownership around `package.json` and `docs/settings.md`, aligned PL/EN README guidance with all four `qa:fast` checks and production preview, and replaced stale page inventories and documentation paths with automatic-discovery guidance and current paths.
- Aligned the terms, privacy policy, and cookies policy with the site's demonstrational scope and the implemented contact form, browser storage, offline caching, and embedded map.
- Replaced the root `LICENSE` with project-specific Polish and English KP_Code proprietary terms.
- Aligned Polish and English README accessibility descriptions with the implemented reveal behavior and form validation.

### Build and Tooling

- Consolidated unchanged `dist/` file mappings for source validation, copying, and destination verification.
- Added ignore rules for generated output, dependencies, local configuration, and test reports while retaining project sources and the lockfile.
- Established modular CSS and JavaScript sources, PostCSS and esbuild asset builds, and a `dist` pipeline that rewrites HTML asset references and generates a content-versioned service worker.
- Included a Sharp-based image pipeline and responsive image assets in AVIF, WebP, and fallback formats.
- Moved CSS and JavaScript production bundles into disposable `dist/` output; both `build` and `build:dist` now rebuild a clean package from current sources, while standalone bundle commands preserve other distribution files. Set Netlify to run the full build and publish `dist/`.
- Limited service worker registration to production-marked HTML, added scoped cleanup of prior Vista registrations and caches during development, and generated the production worker from packaged assets.
- Added a lightweight `npm run dev` server with live reload, secure source-file serving, and no changes to the production build.
- Added `npm run preview` to serve an existing `dist/` package locally at `127.0.0.1:8182`, with safe GET/HEAD access, a clear missing-build error, and the root-scope service-worker header.
- Added `qa:fast` with link-integrity, JavaScript syntax, and JSON syntax checks for everyday verification.
- Moved accessibility checks to project-managed Playwright and axe-core dependencies and synchronized npm and Deno lockfiles.

### Changed

- Consolidated repeated theme colors and gradients into shared palette tokens without changing resolved values or theme selection.
- Consolidated phone and guest validation into local functions shared by contact-form input and submit handlers.
- Replaced the header menu, footer social, lightbox, contact-detail and homepage benefit icons repeated as inline SVG across the root pages with `<use>` references to one external sprite, `assets/img/icons/sprite.svg`, whose 15 `currentColor` symbols reuse the existing geometry; a shared `.icon` rule supplies default sizing while components keep their own sizes and colours. The production worker precaches the sprite so cached and offline pages keep their icons, `check:links` validates sprite files and symbol IDs, and the 404 regression requires root-relative sprite references that resolve. Gave the homepage benefit icons the `0 0 24 24` viewBox they lacked, so they scale to their 22 px box instead of being clipped. Removed unreferenced standalone icons (Facebook, GitHub, X, YouTube, e-mail, phone and a duplicate of the contact illustration), dead `.icon--mono` theme rules and the unused `--footer-icon-filter` token; the raster-based theme-toggle images, logos, favicons and the decorative contact illustration remain standalone.

### Fixed

- Removed the `noindex,follow` cookies, privacy-policy and terms pages from `sitemap.xml`, preserving their public routes, footer links and self-referencing canonical URLs. The remaining six sitemap entries match their pages' `index,follow` directives and canonical URLs and resolve to local files.
- Matched responsive-image width descriptors to decoded image widths: the six homepage gallery pictures now declare 640/960/1280/1600w instead of 320/480/640/800w in AVIF, WebP and JPEG, the Deluxe JPEG declares 1280w instead of 1208w on the home and rooms pages, and the fourth room-gallery image declares 1536w instead of 1600w in all formats; image paths and lightbox links are unchanged. Gave the homepage gallery's AVIF/WebP `<source>` elements their existing `<img>` `sizes` value, which they previously lacked, so desktop selection no longer falls back to `100vw`. Added a read-only Sharp-metadata `check:image-descriptors` check to `qa:fast` covering every local root-page `srcset`/`imagesrcset` width descriptor, and verified representative 390/1280 px DPR 1/2 Chromium candidate selection against rendered size.
- Raised dark and Auto-dark offer-badge text contrast from 1.92:1 to 8.06:1 through a badge-specific foreground token that pairs the unchanged mint primary surface with the existing dark text color; light badges keep white text at 5.19:1, and the shared `--primary-contrast` used by primary buttons is unchanged. Added focused regression coverage for all four homepage and six offers-page badges across explicit light/dark and Auto with light/dark OS preferences, including a scoped dark-theme axe pass over the offer cards.
- Raised focused skip-link text contrast to 7.26:1 in light and dark themes by pairing its unchanged mint surface with the existing dark text color, preserving its off-screen unfocused state, top-left focused placement, focus ring and same-document navigation to main content. Added a focused light/dark keyboard regression for Tab reveal, contrast, focus visibility and Enter navigation to `#main`.
- Made enhanced guest-count validation check the complete value, rejecting empty, fractional and out-of-range input such as 1.5 and 6.5 without truncation, in agreement with the field's native 1–6 integer constraints. Added a focused regression for exact invalid and valid guest values, error recovery, locally intercepted `booking` submissions and native no-JavaScript validity.
- Made contact-form error text theme-aware across light, dark and Auto settings while retaining the date-fieldset styling. Extended the focused regression to all seven errors, optional-phone validation, focus/ARIA/submission checks and rendered-background contrast measurement with a 4.5:1 minimum.
- Made custom 404 assets, JSON-LD payloads and navigation/recovery links resolve from the domain root at missing URLs, including theme icons and 404 production-bundle references; preserved same-document skip navigation and `noindex,follow`. Added a focused local HTTP 404 regression with and without JavaScript.
- Reset mobile navigation state on entry to desktop layout, preserving visible navigation and ordinary keyboard traversal; restricted mobile interactions to the mobile breakpoint and added a focused source-browser regression.
- Balanced fixed-count room, offer, testimonial and gallery grids across responsive widths while preserving card minimum widths.
- Aligned section headings, intros, gallery and brand copy, highlight content, and testimonial cards with the existing content grid from 760 px.
- Unified contact-form value, label, legend and hint typography and colour across light and dark themes.
- Distinguished current header-navigation links from hover with the existing primary text colour and a single ARIA-based current-state rule; verified both theme contrasts and unchanged desktop/mobile geometry in local Chromium.
- Unified descriptive card and section copy through existing-scale supporting and metadata aliases, corrected offer and highlight text hierarchy, and verified responsive grid counts and button alignment in local Chromium at 390, 800 and 1280 px.
- Made one-shot `img:opt` exit non-zero after per-file failures while preserving continued processing, summary output, successful exit code 0, and watch behavior.
- Hardened gallery URL-fragment matching with strict known-filter comparisons and regression coverage for valid and malformed fragments.
- Made reveal-marked content visible without JavaScript or when reveal initialization fails, while preserving scroll animations and reduced-motion support.
- Restored native contact-form validation without JavaScript while preserving enhanced error messages and Netlify Forms submission.
- Contained keyboard focus within project and gallery dialogs, isolated background interactions, and restored focus after dismissal.
- Aligned Vista package license metadata with the proprietary `LICENSE` while preserving third-party dependency licenses.
- Updated image UI cache headers to revalidate same-URL assets and prevent stale images after future deployments.
- Restored interactive map visibility after delayed iframe loads while preserving the static fallback, accessible loading states, and external Google Maps link.
- Removed closed mobile navigation links from keyboard focus order while preserving menu interactions, desktop navigation, and the no-JavaScript fallback.
- Fixed past-arrival date validation and Netlify Forms submission; verified Edge Function rejection of past dates and collection of valid inquiries.
- Aligned Vista's structured data, metadata, and legal disclosures with its demonstrational scope while preserving real author contact details and adding discreet contact attribution.
- Gave the main contact section a distinct accessible landmark name while preserving its visible heading and form behavior.
- Updated accessibility scenarios to handle the project notice and test the current Deluxe room filter.
- Refined heading typography across subpages and cards using existing type-scale tokens, corrected responsive offer titles, and aligned offer metadata with the defined muted colour.
- Unified button border and minimum-size handling across variants, preserved responsive CTA layouts, corrected section-header link sizing, and removed unused button typography tokens.
- Standardized native control font inheritance so contact form fields and room filter buttons use the project's Inter typeface without changing component sizing or interaction behavior.
- Unified room and gallery filter selected-state styling through existing ARIA attributes, distinguished selected controls from hover, and removed obsolete room-filter tab presentation rules.
- Consolidated keyboard focus indicators through shared theme-aware ring tokens, removed redundant focus declarations, and preserved card focus geometry and invalid-field styling.
- Improved contact-form error recovery with first-invalid-field focus and live validation feedback.
- Refined the shared confirmation, 404, and offline message layout with a restrained heading scale, a common centered measure, a subordinate non-reservation note, and equal-width actions that stack on narrow screens.

### Testing

- Added a dependency-free JSON-LD pair equivalence check to `qa:fast`, comparing each root page's embedded fallback with its referenced external JSON file, and corrected the mismatched regulamin JSON-LD description.
- Added contact-form validation-error regression coverage and corrected error-text contrast across Light, Dark, and Auto themes.
- Added an executable, dependency-free booking-date Edge Function regression check with Warsaw-relative dates and strict HTTP 422/pass-through assertions to `qa:fast`.
- Included local-link integrity checking and a Playwright/axe accessibility audit script.
- Verified clean production builds and source-to-dist behavior for room filters, project notice, reveal animations, contact validation, and modal focus management.
- Verified all eight Playwright/axe accessibility scenarios with no reported violations.
