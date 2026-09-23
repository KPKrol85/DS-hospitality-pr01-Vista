# Vista — Focused Front-End Review

**Review date:** 2026-09-20
**Project type:** Static multi-page HTML, CSS, and Vanilla JavaScript site
**Review mode:** Focused static repository review

## P0 — Critical risks

None detected.

## P1 — Important issues worth fixing next

### [P1-01] Reveal styles hide primary content without JavaScript

- **Status:** RESOLVED — implemented and verified. Details are recorded in `doc/CHANGELOG.md`.
- **Classification:** Defect
- **Affected area:** Progressive enhancement, content visibility
- **Evidence:** `css/modules/utilities.css:11-21`, `js/features/reveal.js:1-15`, `index.html:182-219`
- **Current behavior:** Every `[data-reveal]` element starts at `opacity: 0`; only JavaScript adds `is-revealed`. There is no `no-js` visibility override.
- **Impact:** The homepage hero and many sections across the site remain visually absent when JavaScript is unavailable or fails before reveal initialization.
- **Recommended direction:** Make content visible by default and apply the hidden animation state only after JavaScript is active.

### [P1-02] Checked-in production bundles lag behind canonical sources

- **Status:** RESOLVED — implemented and verified. Details are recorded in `doc/CHANGELOG.md`.
- **Classification:** Contract mismatch
- **Affected area:** Distribution build, room filters, project disclosure
- **Evidence:** `js/script.js:9-15`, `js/script.js:44-49`, `js/script.min.js:1`, `css/modules/subpages.css:81-83`, `css/style.min.css:1`, `scripts/build-dist.mjs:225-226`
- **Current behavior:** The tracked JS bundle omits room-filter and project-banner initialization, and the tracked CSS bundle omits the rule that hides filtered room cards. `build:dist` copies these bundles as they are; the full `build` script regenerates them first.
- **Impact:** Packaging the current checkout with `build:dist` alone creates a distribution with inactive room filters and no project disclosure dialog.
- **Recommended direction:** Regenerate the bundles from canonical sources and make distribution packaging reject or refresh stale bundles.

### [P1-03] Modal focus can escape to the page behind it

- **Status:** RESOLVED — implemented and verified. Details are recorded in `doc/CHANGELOG.md`.
- **Classification:** Source-visible risk
- **Affected area:** Keyboard accessibility, project dialog, lightbox
- **Evidence:** `js/features/project-banner.js:47-75`, `js/features/lightbox.js:71-83`, `js/features/lightbox.js:132-143`
- **Current behavior:** Both dialogs initially focus a `tabindex="-1"` container, while their Tab handlers wrap focus only from the first or last focusable control. Neither makes the underlying page inert.
- **Impact:** Reverse tabbing from the initial dialog focus can reach controls behind an open `aria-modal` dialog.
- **Recommended direction:** Contain focus from the initial container and prevent background controls from receiving focus while either dialog is open.

### [P1-04] Repository license metadata contradicts LICENSE

- **Status:** RESOLVED — implemented and verified. Details are recorded in `doc/CHANGELOG.md`.
- **Classification:** Contract mismatch
- **Affected area:** Licensing metadata, project documentation
- **Evidence:** `LICENSE:15-22`, `package.json:30`, `package-lock.json:10`, `doc/README.md:74`, `doc/README.md:143`
- **Current behavior:** `LICENSE` identifies Vista as proprietary, while the root package metadata and both README language sections describe the project as MIT licensed.
- **Impact:** Package consumers and readers receive conflicting permissions for the project's own material.
- **Recommended direction:** Align root package metadata and README license statements with `LICENSE`, preserving separate third-party dependency licenses.

### [P1-05] Contact form loses required-field validation without JavaScript

- **Status:** RESOLVED — implemented and verified. Details are recorded in `doc/CHANGELOG.md`.
- **Classification:** Defect
- **Affected area:** Contact form, progressive enhancement
- **Evidence:** `contact.html:254-269`, `contact.html:293-318`, `js/features/form.js:75-143`
- **Current behavior:** The form has `novalidate`; its required-field checks run only in the JavaScript submit handler. Native submission still remains available when the handler does not run.
- **Impact:** A visitor without JavaScript can submit an empty or malformed contact request without browser validation.
- **Recommended direction:** Preserve native constraint validation for the no-JavaScript path while retaining the enhanced error messages.

## P2 — Minor refinements

### [P2-01] Image-only updates do not invalidate service-worker caches

- **Status:** RESOLVED — implemented and verified. Details are recorded in `doc/CHANGELOG.md`.
- **Classification:** Source-visible risk
- **Affected area:** Service worker, asset freshness
- **Evidence:** `scripts/build-dist.mjs:245-255`, `pwa/service-worker.js:64-74`
- **Current behavior:** The generated cache version hashes HTML and four static files but not image contents. The service worker serves cached non-HTML requests before checking the network.
- **Impact:** Replacing an image at the same URL without changing hashed inputs can leave returning visitors with the older cached image.
- **Recommended direction:** Include published image changes in cache invalidation or use an update-aware strategy for mutable assets.

### [P2-02] Map fallback becomes permanent after a slow or deferred load

- **Status:** RESOLVED — implemented and verified. Details are recorded in `doc/CHANGELOG.md`.
- **Classification:** Source-visible risk
- **Affected area:** Contact map
- **Evidence:** `contact.html:223-234`, `js/features/map-embed.js:25-41`
- **Current behavior:** The iframe starts hidden with lazy loading. A six-second timer marks the map settled, and the load handler ignores any subsequent successful load.
- **Impact:** On slow connections or when iframe loading is deferred, the interactive map can remain hidden for the entire visit despite loading later; the external map link remains available.
- **Recommended direction:** Allow a late successful load to reveal the iframe and avoid expiring the map before a deferred load can start.
