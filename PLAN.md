# Vista — Development Plan

**Last reviewed:** 2026-09-20  
**Project type:** Demonstrational static multi-page hospitality site (HTML, CSS, Vanilla JavaScript)  
**Plan status:** Active

Root HTML, `css/style.css` and `css/modules/`, and `js/script.js` and `js/features/` are the canonical page, style, and behavior sources. Production `.min` files and `dist/` are generated output. Complete an item only after its outcome and focused verification are satisfied. An existing review finding alone does not establish completion.

The owner has chosen to establish a clean production build before continuing visitor-facing corrections. This changes the work order, not the completion conditions for those corrections or the final behavior verification in `PH2-01`.

## Current priorities

1. `PH2-01` — Establish a fresh source-to-`dist/` workflow and prevent stale distribution packages; retain final behavior verification after the visitor-facing corrections.
2. `PH1-01` — Keep page content visible when JavaScript is unavailable.
3. `PH1-02` — Restore native validation for contact inquiries without JavaScript.
4. `PH1-03` — Contain focus in open dialogs.

## Phase 1 — Visitor-facing behavior

**Goal:** Preserve access to existing content and interactions across JavaScript and keyboard paths.

- [x] **PH1-01 — Make reveal content visible by default**
  - [x] Change the reveal styling so `[data-reveal]` content is visible before JavaScript activates animations, including when initialization fails.
  - [x] Preserve the intended reveal transition when JavaScript is active.
  - [x] Verify representative homepage and subpage content with JavaScript disabled and enabled.
  - **Completion condition:** The hero and other reveal-marked content remain visible without JavaScript and still reveal with it.
  - **Evidence:** `css/modules/utilities.css`, `js/features/reveal.js`, `index.html`; `REVIEW.md` P1-01.

- [x] **PH1-02 — Preserve native contact-form validation**
  - [x] Remove or conditionally apply `novalidate` so required fields, email, phone pattern, guest bounds, and consent retain browser constraint validation when JavaScript is unavailable.
  - [x] Keep the enhanced messages and valid Netlify Forms submission path in `js/features/form.js`.
  - [x] Verify invalid submissions without JavaScript are blocked by the browser and the enhanced path still handles valid and invalid inputs.
  - **Completion condition:** Empty or malformed inquiries cannot bypass browser validation without JavaScript; valid inquiries retain the existing submission route. Live delivery is outside this local verification.
  - **Evidence:** `contact.html`, `js/features/form.js`; `REVIEW.md` P1-05.

- [x] **PH1-03 — Contain focus in open dialogs**
  - [x] Update the project notice and gallery lightbox so Tab and Shift+Tab stay inside each dialog, including from the initially focused dialog container.
  - [x] Prevent background controls from receiving focus while a dialog is open; restore the previous focus target on close.
  - [x] Verify forward and reverse keyboard traversal for both dialogs.
  - **Completion condition:** Focus cannot reach page controls behind either open `aria-modal` dialog and returns to its origin after closing.
  - **Evidence:** `js/features/project-banner.js`, `js/features/lightbox.js`, dialog markup in `index.html` and `gallery.html`; `REVIEW.md` P1-03.

## Phase 2 — Distribution and project declarations

**Goal:** Make published assets and repository rights metadata agree with their canonical sources.

- [x] **PH2-01 — Keep production bundles aligned with source**
  - [x] Generate CSS and JavaScript bundles directly in `dist/` from `css/style.css` and `js/script.js`, without maintaining tracked source-tree `.min` files.
  - [x] Make both `build` and direct `build:dist` clean and rebuild the complete production package from current sources, with no stale-bundle path.
  - [x] Verify production-only Service Worker registration, a generated worker with current distribution paths, and safe cleanup of any prior Vista worker and caches during development.
  - [x] Verify the packaged room filters, filtered-card hiding, and project notice against the current source behavior.
  - [x] After `PH1-01`, `PH1-02`, and `PH1-03`, rebuild and verify the final reveal, contact-form, and dialog behavior in the packaged site.
  - **Build evidence:** The previously completed pipeline and Service Worker separation remain in place. For final PH2-01 integration, fresh `npm run build:dist` and `npm run build` runs passed, each packaging 11 HTML pages; bundle verification, production-reference inspection, link integrity, syntax checks, and `git diff --check` passed. Isolated local Headless Chromium 147 compared source and production behavior for room filters, computed filtered-card hiding, project-notice persistence, reveal fallbacks, native and enhanced contact validation, and project-notice/lightbox focus management. A dedicated fresh production context confirmed the generated worker controlled `/` with the current static and HTML caches. The valid Netlify Forms POST was intercepted locally; no live Netlify deploy, inquiry, or delivery was tested.
  - **Depends on:** `PH1-01` and `PH1-03` for final reveal and dialog verification; include any JavaScript changes from `PH1-02`.
  - **Completion condition:** A fresh distribution package contains current source behavior for room filters, filtered-card hiding, project notice, reveal, contact form, and dialogs; direct `build:dist` cannot package stale bundles, and relevant development and production behavior has been verified.
  - **Evidence:** `js/script.js`, `css/style.css`, `css/modules/subpages.css`, `scripts/build-dist.mjs`, `pwa/service-worker.js`, generated `dist/`; `REVIEW.md` P1-02.

- [x] **PH2-02 — Align project license declarations**
  - [x] Align `package.json` and the root `package-lock.json` entry with `LICENSE`.
  - [x] Verify the existing Polish and English license statements in the root `README.md`.
  - [x] Preserve third-party dependency licenses.
  - [x] Confirm consistency across the canonical `LICENSE` and project metadata.
  - **Completion condition:** Repository readers and package consumers receive one consistent statement of rights for Vista's original materials.
  - **Evidence:** `LICENSE`, `package.json`, `package-lock.json`, `README.md`; `REVIEW.md` P1-04.
  - **Status:** Completed.

## Optional future improvements

These review findings are source-visible risks and do not block the required phases.

- [ ] **O-01 — Refresh cached images after same-URL updates**
  - [ ] Make a changed published image invalidate its old cache entry or use an update-aware fetch strategy for images.
  - [ ] Verify that a returning visitor can receive a replacement image at the same URL after an updated distribution is installed.
  - **Completion condition:** A published image replacement reaches returning visitors at its existing URL.
  - **Value:** Avoid persistent stale imagery for returning visitors.
  - **Evidence:** `scripts/build-dist.mjs`, `pwa/service-worker.js`; `REVIEW.md` P2-01.

- [ ] **O-02 — Reveal the map after a late successful load**
  - [ ] Keep the fallback available for failed or slow map loads while allowing a later successful iframe load to reveal the map.
  - [ ] Verify the delayed-load and failed-load paths, including the external map link.
  - **Completion condition:** A late iframe load displays the interactive map; failed loads retain a usable fallback and external link.
  - **Value:** Recover the interactive map on slow or deferred loads.
  - **Evidence:** `contact.html`, `js/features/map-embed.js`; `REVIEW.md` P2-02.
