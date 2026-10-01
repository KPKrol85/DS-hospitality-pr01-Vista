# Vista — Development Plan

**Last reviewed:** 2026-10-01

**Project:** Demonstrational static multi-page hospitality website; HTML, modular CSS, vanilla JavaScript, Node.js tooling and Netlify configuration

**Status:** Open — eight source corrections and one integration-verification objective

**Basis:** Current canonical sources and `AUDIT.md` dated 2026-09-30

Vista presents a fictional hospitality brand. Its contact form sends a project inquiry; it does not reserve accommodation or process payments. This plan addresses confirmed defects in the existing implementation without adding product capabilities or changing the architecture.

## Current priorities

1. `PH1-01` — Reset mobile navigation state when entering desktop layout.
2. `PH1-02` — Make the custom 404 page usable at nested missing URLs.
3. `PH1-03` — Make every form error readable in both themes.

Complete the important corrections in Phase 1 before final presentation or handoff. Phase 2 covers the remaining narrower audit findings. Its items can proceed independently of Phase 1 unless they share CSS tokens or form code; coordinate those edits. Phase 3 verifies the combined result after both correction phases.

## Source ownership and maintenance

- Edit root HTML, `css/style.css` and `css/modules/`, `js/script.js` and `js/features/`, and the relevant metadata, configuration or scripts. `dist/` and production bundles are generated: rebuild through `package.json`, never patch them directly.
- `assets/img/src/` supplies the image pipeline; `assets/img/optimized/` contains generated, tracked variants. The descriptor correction below targets HTML; regenerate images only if an approved physical-size change requires it.
- Preserve paired embedded/external JSON-LD, Netlify form identity, native form constraints, author-contact attribution and the source/production service-worker distinction.
- This is the canonical active work plan. Inspect relevant items before future implementation. Check a main item only when its required subtasks and completion condition are satisfied. Update it only when the active task permits documentation changes; otherwise report the exact pending checkbox updates. Keep unfinished work open and revise unsupported or duplicate items when evidence changes.
- Keep significant completed changes in `docs/CHANGELOG.md` only when the active task permits that update. Pending work belongs here. If a correction changes a documented contract, align the maintained guide identified in `docs/CONTEXT-PROJECT.md` within that implementation's approved scope.

## Completed work and evidence boundaries

The earlier completed plans remain preserved in [the 2026-09-23 plan](docs/archive/plans/PLAN-2026-09-23.md) and [the 2026-09-24 plan](docs/archive/plans/PLAN-2026-09-24.md). Their checkboxes and verification records are historical; their identifiers must be qualified by archive filename when referenced. This active cycle does not recast those milestones or reopen resolved work solely because it was not retested today. The current breakpoint defect is distinct from the earlier closed-mobile-menu correction.

Current inspection confirms the source/production build separation, reveal fallback, native-validation baseline, arrival-date gate and demonstrational content attribution. These existing mechanisms are preservation constraints, not newly completed tasks. `PH1-01` is complete with local source verification; the remaining active-cycle items are open.

Planning used static repository inspection and one read-only Sharp metadata check: 381 distinct image URL/width-descriptor pairs were inspected, with 76 mismatches across the three groups in `PH2-04`. Other audit findings were checked against their current source causes; the audit's browser and contrast results were not rerun. `dist/` is absent. No build, browser suite, deployment or live form delivery was verified during planning. These limits do not create speculative defects or block source corrections. No optional or deferred work is supported by the current scope.

## Phase 1 — Important interaction and recovery corrections

**Goal:** Resolve the three current P1 findings affecting shared navigation, error-page recovery and validation feedback.

- [x] **PH1-01 — Reset mobile navigation across the desktop breakpoint**
  - [x] On entering desktop layout, clear mobile open state, body state, toggle state and stale focus-return state while keeping navigation rendered. Restrict mobile closing and focus trapping to the mobile layout, including link-click handling.
  - [x] Preserve opening, Escape, link selection and focus return on mobile, consistent closed state on return to mobile, and visible no-JavaScript navigation.
  - [x] Add a focused breakpoint-transition regression to `scripts/a11y-axe.mjs`: open at 390 px, cross 960/961 px and widen to desktop, traverse both navigation boundaries with Tab/Shift+Tab, press Escape, then return to mobile. Assert visibility and `aria-expanded`, not just absence of axe violations.
  - **Completion condition:** Desktop navigation remains visible and permits ordinary keyboard traversal after a mobile-open transition; Escape cannot hide it, and returning to mobile restores consistent controls and focus behavior.
  - **Sources:** `js/features/nav.js` (`syncVisibility`, `close`, keyboard/link handlers), `css/modules/layout.css`, shared root-page navigation. **Audit:** `AUDIT.md` P1-01.
  - **Verification (2026-10-01):** `npm run qa:fast` and `npm run test:a11y -- --scenario "nav breakpoint transition"` passed. Local source Chromium assertions cover 390 → 960 → 961 → 1280 → 390 px, state/labels, focus preservation on desktop entry, both desktop Tab boundaries, Escape, link selection, mobile reopening/trapping/focus return, and no-JavaScript visibility/keyboard traversal. Axe reported no violations in the scenario's final state. No production build or deployment verification was run.

- [ ] **PH1-02 — Resolve custom 404 assets and recovery links from any missing path**
  - [ ] Correct the canonical error document's URL resolution for styles, scripts, images, metadata payloads and navigation/recovery links. Preserve its in-page skip link and the domain-root hosting contract.
  - [ ] Make any necessary corresponding change to `scripts/build-dist.mjs` source-tag matching, rewriting and package assertions; keep the other root pages' bundle contract intact. Check compatibility with the existing CSP and link/JSON-LD validators.
  - [ ] Serve the corrected document with HTTP 404 at a shallow missing URL, a nested missing URL and a trailing-slash missing URL. Check asset responses, Home/Contact destinations and skip navigation with JavaScript enabled and disabled; repeat against generated HTML during `PH3-01`.
  - **Completion condition:** A missing path displays the styled error document with working assets and links to valid root routes, while retaining HTTP 404 and its existing noindex policy.
  - **Sources:** `404.html`, `netlify/_redirects`, `netlify/_headers`, `scripts/build-dist.mjs`, `scripts/check-link-integrity.mjs`, `scripts/check-jsonld-pairs.mjs`.
  - **Verification boundary:** `npm run preview` does not reproduce the Netlify catch-all. Use a local 404-response fixture or request interception for URL-resolution checks; a direct visit to `/404.html` is insufficient. Actual hosting behavior requires separate authorized live verification.
  - **Audit:** `AUDIT.md` P1-02.

- [ ] **PH1-03 — Apply readable error text to every form surface**
  - [ ] Replace the fixed non-fieldset error foreground with theme-aware semantic styling appropriate to its rendered surface; retain readable date-fieldset errors and existing validation associations.
  - [ ] Extend the existing invalid-form scenario to trigger every implemented error, including optional-phone invalid input, in light and dark themes and the corresponding Auto settings. Preserve first-invalid-field focus, live feedback and blocked invalid submission.
  - [ ] Measure normal-size error text against the actual rendered backgrounds, including gradients. Supplement axe when transparent layers prevent reliable background detection.
  - **Completion condition:** Every displayed error has at least 4.5:1 text contrast in the tested theme states; error associations, focus recovery and submission blocking still work.
  - **Sources:** `css/modules/components.css` (`.form__error`, fieldset override), `css/modules/tokens.css`, `css/modules/base.css` (`body::before`), `contact.html`, `scripts/a11y-axe.mjs`. **Audit:** `AUDIT.md` P1-03.

## Phase 2 — Validation, readability and metadata consistency

**Goal:** Correct the five remaining P2 findings within their existing source contracts.

- [ ] **PH2-01 — Validate the complete guest-count value**
  - [ ] Make the shared input/submit validator reject empty, invalid, fractional and out-of-range values without truncation; agree with the number field's integer range of 1–6.
  - [ ] Extend the contact regression with empty input, 0, 7, 1.5 and 6.5, plus every allowed integer. Invalid cases must expose `err-guests`, set `aria-invalid` and send no POST; valid cases must retain their exact value in a locally intercepted submission.
  - [ ] Confirm native validation still enforces the same range and step when JavaScript is disabled. Preserve offer prefill, arrival/departure validation and the `booking` submission identity.
  - **Completion condition:** Enhanced validation accepts only integers 1–6 and cannot submit a value rejected by the field's guest-count constraints; error recovery remains usable.
  - **Sources:** `contact.html` (`#guests`), `js/features/form.js` (`validateGuests`, `form.noValidate`, submit handler), `scripts/a11y-axe.mjs`. **Audit:** `AUDIT.md` P2-01.

- [ ] **PH2-02 — Make the focused skip link readable**
  - [ ] Give the shared skip link a foreground/background pair with sufficient contrast; preserve its focused placement and visible focus indicator. Check other consumers before changing a shared token.
  - [ ] Add a focused keyboard scenario in light and dark themes that exposes the link, checks its text contrast and activates the jump to main content; account for the project-notice overlay during setup.
  - **Completion condition:** The focused skip link has at least 4.5:1 normal-size text contrast and provides usable keyboard movement to main content in both themes.
  - **Sources:** `css/modules/utilities.css` (`.skip-link`), `css/modules/tokens.css` (`--focus`), shared root-page skip links, `scripts/a11y-axe.mjs`. **Audit:** `AUDIT.md` P2-02.

- [ ] **PH2-03 — Correct offer-badge contrast in dark mode**
  - [ ] Use a theme-appropriate foreground/background pair for `.offer-card__badge`. Inspect primary-button and other token consumers before changing `--primary-contrast`; keep the correction local if a shared change would reduce their contrast.
  - [ ] Verify every badge on `offers.html` and `index.html` in light and dark themes, including Auto resolution, and add the missing dark-offer state to the existing accessibility scenarios.
  - **Completion condition:** All offer badges have at least 4.5:1 normal-size text contrast, with no contrast regression in other components affected by a shared-token change.
  - **Sources:** `css/modules/components.css`, `css/modules/tokens.css`, `offers.html`, `index.html`, `scripts/a11y-axe.mjs`. **Audit:** `AUDIT.md` P2-03.

- [ ] **PH2-04 — Match responsive-image descriptors to actual widths**
  - [ ] Correct all formats in the six homepage gallery pictures: declared 320/480/640/800 widths currently refer to 640/960/1280/1600 px files.
  - [ ] Correct the Deluxe JPEG descriptor from 1208 to its measured 1280 px in `index.html` and `rooms.html`, and the fourth gallery-room image from 1600 to 1536 px in AVIF, WebP and JPEG in `gallery.html`. Preserve valid `sizes`, links and layout.
  - [ ] Repeat a read-only binary-metadata comparison of every source HTML width descriptor, then inspect representative mobile/desktop and DPR 1/2 candidate selection in a browser. Use measured widths rather than filenames as evidence.
  - **Completion condition:** Every width descriptor equals the referenced image's actual width; affected pictures load and select candidates consistent with their declared sizes and viewport/DPR, without changing their intended layout.
  - **Sources:** `index.html`, `rooms.html`, `gallery.html`; referenced variants under `assets/img/optimized/gallery/`, `assets/img/optimized/rooms/` and `assets/img/optimized/subpage-gallery/pokoje/`; `scripts/optimize-images.mjs` for generation ownership. **Audit:** `AUDIT.md` P2-04.

- [ ] **PH2-05 — Align sitemap membership with the noindex policy**
  - [ ] Remove the cookies, privacy-policy and terms URLs from `sitemap.xml`; preserve their existing `noindex,follow` directives and public navigation access.
  - [ ] Compare all remaining sitemap entries with current root-page indexing directives and canonical URLs, and run `npm run check:links` to check local targets.
  - **Completion condition:** The sitemap lists the intended indexable canonical pages and excludes noindex pages; legal pages retain their approved indexing policy.
  - **Sources:** `sitemap.xml`, root-page robots/canonical metadata, `cookies.html`, `polityka-prywatnosci.html`, `regulamin.html`, `scripts/check-link-integrity.mjs`. **Audit:** `AUDIT.md` P2-05.

## Phase 3 — Verify the integrated production package

**Goal:** Establish that the combined source corrections survive production bundling and packaging.

- [ ] **PH3-01 — Verify corrected states in a fresh distribution**
  - [ ] After the source corrections and their focused checks, run `npm run qa:fast` and the updated `npm run test:a11y`. Keep failures actionable; do not treat the placeholder `npm test` as a verification gate.
  - [ ] Run one full `npm run build` from the corrected sources, inspect its package-verification result and use `npm run preview` for the generated output. Confirm rewritten assets, production marker, current worker/precache references and packaged sitemap/descriptors.
  - [ ] Run focused packaged-page checks for the breakpoint transition, nested 404 response, invalid/valid guest values, error/skip-link/badge contrast and representative image selection. Use local POST interception for valid inquiries and an explicit 404 fixture for missing routes. Keep source and production browser state isolated.
  - [ ] Record the actual results and remaining limits in this plan when its update is authorized; update affected audit statuses only within an explicitly permitted documentation scope.
  - **Depends on:** `PH1-01`–`PH1-03` and `PH2-01`–`PH2-05`.
  - **Completion condition:** The fast checks, updated source scenarios, full build and focused production-package checks pass for the final combined sources. No generated file is manually patched. Local results remain explicitly distinct from live Netlify behavior, inquiry delivery and broader accessibility conformance.
  - **Sources:** `package.json`, `scripts/build-dist.mjs`, `scripts/verify-build.mjs`, `scripts/preview-dist.mjs`, `js/script.js`, `pwa/service-worker.js`, `docs/settings.md`, `docs/dist-notes.md`; `AUDIT.md` section 8.
