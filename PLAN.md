# Vista — Development Plan

**Last reviewed:** 2026-09-20  
**Project type:** Demonstrational static multi-page hospitality site (HTML, CSS, Vanilla JavaScript)  
**Plan status:** Active

Root HTML, `css/style.css` and `css/modules/`, and `js/script.js` and `js/features/` are the canonical page, style, and behavior sources. The tracked `.min` files are built assets; `dist/` is generated. Complete an item only after its outcome and focused verification are satisfied. An existing review finding alone does not establish completion.

## Current priorities

1. `PH1-01` — Keep page content visible when JavaScript is unavailable.
2. `PH1-02` — Restore native validation for contact inquiries without JavaScript.
3. `PH2-01` — Synchronize production bundles after source corrections and prevent stale distribution packages.

## Phase 1 — Visitor-facing behavior

**Goal:** Preserve access to existing content and interactions across JavaScript and keyboard paths.

- [ ] **PH1-01 — Make reveal content visible by default**
  - [ ] Change the reveal styling so `[data-reveal]` content is visible before JavaScript activates animations, including when initialization fails.
  - [ ] Preserve the intended reveal transition when JavaScript is active.
  - [ ] Verify representative homepage and subpage content with JavaScript disabled and enabled.
  - **Completion condition:** The hero and other reveal-marked content remain visible without JavaScript and still reveal with it.
  - **Evidence:** `css/modules/utilities.css`, `js/features/reveal.js`, `index.html`; `REVIEW.md` P1-01.

- [ ] **PH1-02 — Preserve native contact-form validation**
  - [ ] Remove or conditionally apply `novalidate` so required fields, email, phone pattern, guest bounds, and consent retain browser constraint validation when JavaScript is unavailable.
  - [ ] Keep the enhanced messages and valid Netlify Forms submission path in `js/features/form.js`.
  - [ ] Verify invalid submissions without JavaScript are blocked by the browser and the enhanced path still handles valid and invalid inputs.
  - **Completion condition:** Empty or malformed inquiries cannot bypass browser validation without JavaScript; valid inquiries retain the existing submission route. Live delivery is outside this local verification.
  - **Evidence:** `contact.html`, `js/features/form.js`; `REVIEW.md` P1-05.

- [ ] **PH1-03 — Contain focus in open dialogs**
  - [ ] Update the project notice and gallery lightbox so Tab and Shift+Tab stay inside each dialog, including from the initially focused dialog container.
  - [ ] Prevent background controls from receiving focus while a dialog is open; restore the previous focus target on close.
  - [ ] Verify forward and reverse keyboard traversal for both dialogs.
  - **Completion condition:** Focus cannot reach page controls behind either open `aria-modal` dialog and returns to its origin after closing.
  - **Evidence:** `js/features/project-banner.js`, `js/features/lightbox.js`, dialog markup in `index.html` and `gallery.html`; `REVIEW.md` P1-03.

## Phase 2 — Distribution and project declarations

**Goal:** Make published assets and repository rights metadata agree with their canonical sources.

- [ ] **PH2-01 — Keep production bundles aligned with source**
  - [ ] Rebuild the tracked CSS and JavaScript bundles from `css/style.css` and `js/script.js` after relevant source changes.
  - [ ] Make `build:dist` reject stale bundles or generate current bundles before packaging, so it cannot silently copy outdated assets.
  - [ ] Verify the packaged room filters, filtered-card hiding, and project notice against the current source behavior.
  - **Depends on:** `PH1-01` and `PH1-03` for the final bundle synchronization; include any JavaScript changes from `PH1-02`.
  - **Completion condition:** The tracked bundles and a fresh distribution package include the current room-filter, project-notice, and reveal behavior, with a guard against later stale packaging.
  - **Evidence:** `js/script.js`, `js/script.min.js`, `css/modules/subpages.css`, `css/style.min.css`, `scripts/build-dist.mjs`; `REVIEW.md` P1-02.

- [ ] **PH2-02 — Align project license declarations**
  - [ ] Replace the root project's MIT declarations in `package.json` and the root package entry of `package-lock.json` with metadata consistent with the proprietary `LICENSE`.
  - [ ] Correct the Polish and English license statements in `doc/README.md`; retain separate third-party dependency licenses.
  - [ ] Verify the root package metadata and both README language sections agree with `LICENSE` and the already aligned root `README.md`.
  - **Completion condition:** Repository readers and package consumers receive one consistent statement of rights for Vista's original materials.
  - **Evidence:** `LICENSE`, `package.json`, `package-lock.json`, `doc/README.md`, `README.md`; `REVIEW.md` P1-04.

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
