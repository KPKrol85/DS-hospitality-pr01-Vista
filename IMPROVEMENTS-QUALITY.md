# Vista — Quality Improvements

**Analysis date:** 2026-09-27
**Project type:** Static multi-page website (HTML, modular CSS, vanilla JavaScript) with a Node.js build pipeline and Netlify configuration
**Analysis mode:** Evidence-based quality improvement review
**Focus:** Project-wide quality

## Improvement overview

Vista's verification stack is intentionally layered: `check:links` and `check:syntax` give a fast, dependency-free static gate, and `test:a11y` adds a slower, browser-based accessibility check over eight scenarios. All archived audits, reviews, and UI/UX improvement reports are closed, and no active `PLAN.md`, `AUDIT.md`, or `IMPROVEMENTS-QUALITY.md` existed before this analysis; `npm run qa:fast` passes cleanly on the current tree (12 HTML files, 27 JavaScript files, 12 JSON files). The main remaining opportunities are not new features but unprotected boundaries around functionality that already works: a URL-fragment filter feature that was only just made shareable can fail on a malformed link instead of degrading to its own designed default; the one server-side rule that stops past-date bookings has never been exercised by an automated test; a deliberately built live-region error-recovery mechanism in the contact form has no regression coverage; a hand-maintained SEO content pair has no equivalence check; and a build tool can report per-file failures to the console while still exiting successfully. Each proposal below strengthens an existing, working mechanism rather than adding new surface area.

## Proposed improvements

### IMP-QUALITY-01 — Harden gallery filter fragment parsing against malformed URLs

**Status (2026-09-27): Completed.** Fragment restoration now compares known `data-filter` values strictly, without URL decoding. Chromium encoded the reported literal quote as `%22` and did not reproduce an initialization exception; `#\wellness` did reproduce an incorrect selection with no visible images and now falls back to all. Six fragment regression scenarios passed alongside the eight existing axe scenarios, including post-malformed-URL controls, hashchange, history, scrolling, lightbox filtering, and DEV `configureSW()` continuation. `qa:fast`, `test:a11y`, `build`, and `git diff --check` passed locally.

- **Affected area:** Gallery category filter restoration from the URL fragment (`gallery.html`), and the rest of `boot()`'s initialization sequence that runs after it.
- **Evidence:** `js/features/gallery-filters.js:42-53`, `js/features/room-filters.js:25,69-72`, `js/script.js:64-84`, `scripts/a11y-axe.mjs:135-144`
- **Current implementation:** `getHashFilter()` reads `window.location.hash` and passes it to `hasFilter()`, which builds a CSS attribute selector by string concatenation: `document.querySelector('#gallery-filters .gallery-cats__link[data-filter="' + value + '"]')` (`gallery-filters.js:42`). A fragment containing a quote or backslash (for example a hand-edited or corrupted `gallery.html#foo"bar` link) produces an invalid selector, and `querySelector` throws rather than returning `null`. Because `boot()` in `js/script.js` calls every feature's `init*` function synchronously with no per-feature `try`/`catch` (`js/script.js:64-84`), an exception here is uncaught and stops the rest of `boot()`, so `initGalleryFilters()`'s own remaining setup (the click handlers and the `hashchange` listener) never finishes and `configureSW()` (called last, at `js/script.js:83`) never runs for that page load. The sibling `room-filters.js` does not have this problem: its `isKnownFilter()` compares the hash against each button's `dataset.roomFilter` with strict equality (`room-filters.js:25,69-72`) instead of interpolating it into a selector, so an arbitrary fragment can only ever fail to match, never throw. `scripts/a11y-axe.mjs` has no scenario that loads either page with a URL fragment (`:135-144` lists only plain `gallery.html`/`contact.html` baseline and lightbox-open scenarios), so neither the happy path nor this edge case is exercised by any current check.
- **Proposed improvement:** Resolve the gallery fragment the same way `room-filters.js` already does — by comparing the decoded hash against each link's known `data-filter` value with strict equality — instead of interpolating it into a `querySelector` selector string. Add one regression scenario (in `test:a11y` or a comparably lightweight check) that loads `gallery.html` with a known-good fragment and confirms the matching category is pre-selected, and one that loads it with a fragment containing a quote character and confirms the page still initializes with the default "all" view instead of failing silently.
- **Expected quality value:** The just-added shareable-link behavior (room and gallery filters recorded in the URL) degrades to its own documented "all" fallback for any unrecognized fragment, including one shaped to break a selector, instead of being able to abort the rest of the page's JavaScript initialization. This also protects the unrelated features that currently happen to run after it in `boot()`.
- **Implementation scope:** `js/features/gallery-filters.js` only (`hasFilter`/`getHashFilter`), following the existing `room-filters.js` pattern. Keep unchanged: the `aria-current` contract, `syncUrl`'s `history.replaceState` behavior, section and lightbox filtering, and the "all"/"wszystkie" fallback semantics. Do not add a global `try`/`catch` around `boot()` as a substitute — that would mask unrelated failures rather than fix this one.
- **Acceptance criteria:** Loading `gallery.html#wellness` still pre-selects the Wellness filter. Loading a fragment containing a quote character no longer throws; the page initializes normally with every category visible, and `configureSW()` still runs. A new focused check covers both cases.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-02 — Add an executable regression test for the booking-date Edge Function

- **Affected area:** `netlify/edge-functions/validate-booking-date.js`, the sole server-side rule rejecting invalid or past arrival dates on the `booking` form.
- **Evidence:** `netlify/edge-functions/validate-booking-date.js:1-48`, `scripts/qa-syntax.mjs:15,43-52`, `docs/archive/audits/AUDIT-2026-09-24.md:64`
- **Current implementation:** `validateBookingDate` parses `checkin` and `form-name` out of the submitted `FormData`, validates the calendar date with a hand-written regex-and-`Date` check (`validCalendarDate`, lines 12-23), and rejects with HTTP 422 when the form is `booking` and the date is missing, malformed, or earlier than "today" in the `Europe/Warsaw` timezone (`currentWarsawDate`, lines 1-10). `qa-syntax.mjs` only confirms this file parses as a valid ES module (`checkModule`, lines 43-52); it never calls `validateBookingDate` or asserts a single input/output pair. The only other verification on record is the archived audit's closure note, which describes one manual, live-deployment check of one past date and one valid date, not a repeatable, automated case (`AUDIT-2026-09-24.md:64`). This function was the fix for a previously confirmed P1 defect (arrival dates in the past reaching submission), so it is the one place a silent regression would be most consequential.
- **Proposed improvement:** Add one small, dependency-free Node script that imports `validateBookingDate` directly and invokes it with a handful of constructed `Request` objects (standard Web API, available in Node without Deno or a live deploy): a valid future arrival, a past arrival, a malformed date string, a missing `checkin` field, a non-`booking` form, and a non-form-encoded request. Assert the expected `Response` status (or pass-through `undefined`) for each.
- **Expected quality value:** The one server-side gate against re-accepting past-arrival bookings gets a fast, repeatable check that does not depend on a live Netlify deployment, catching a future regression in the date-parsing or timezone logic before it reaches production rather than relying on manual spot checks.
- **Implementation scope:** One new script (for example `scripts/check-booking-date.mjs`), optionally wired into `qa:fast` since it needs no browser or build. Do not change `validate-booking-date.js` itself, its exported shape, or its `config` route declaration.
- **Acceptance criteria:** The new check passes against the current implementation and covers at least the six cases above; it fails if the past-date comparison or date-format validation is broken. It runs with plain `node`, without `npx playwright install` or network access.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-03 — Cover the contact form's live validation-error state in the accessibility check

- **Affected area:** Contact inquiry form error recovery (`contact.html`, `js/features/form.js`), the site's only data-entry journey.
- **Evidence:** `js/features/form.js:26-30,162-213`, `contact.html:231,237,252,262,267,276,293`, `scripts/a11y-axe.mjs:144`
- **Current implementation:** Each form field has a paired `<p class="form__error" aria-live="polite" hidden>` message (`contact.html:231` etc.), and `setError()` toggles `aria-invalid` and that message's `hidden` state (`form.js:26-30`); the submit handler runs every validator, focuses the first invalid field on failure, and re-validates touched fields live (`form.js:162-213`). This is deliberately built assistive-technology behavior, not incidental markup. `scripts/a11y-axe.mjs` lists `contact.html` only as a plain baseline load (`:144`), with no scenario that submits the form or triggers any `aria-invalid`/`aria-live` state, so axe never inspects the page in the one state where its live-region and invalid-field wiring is actually active.
- **Proposed improvement:** Add one `test:a11y` scenario that submits the contact form empty (or with a mix of valid and invalid fields) and runs the existing axe rule set against the resulting error state, the same way the existing "rooms.html (Deluxe filter active)" and "index.html (mobile nav open)" scenarios already check an interactive state rather than only the initial page.
- **Expected quality value:** Regression protection for the form's accessible-error mechanism specifically, extending verification confidence to the state visited by every visitor who makes a mistake in the site's primary conversion path, using the project's existing axe/Playwright setup rather than a new tool.
- **Implementation scope:** `scripts/a11y-axe.mjs` only, adding one `scenarios` entry with a `setup` step (submit the form, wait for at least one `[aria-invalid="true"]` field). Keep unchanged: the other seven scenarios, the axe rule set (`wcag2a`, `wcag2aa`, `best-practice`), and `js/features/form.js` and `contact.html` themselves.
- **Acceptance criteria:** `npm run test:a11y`, when run with the required Chromium browser installed, includes a contact-form error-state scenario in its output and reports its result (pass, or any newly surfaced violation) alongside the existing eight scenarios.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Verify embedded and external JSON-LD payloads stay identical

- **Affected area:** Per-page structured data: the embedded `<script data-seo-jsonld="fallback">` block and its paired `assets/seo/ld-<page>.json` file, present on all 12 root pages.
- **Evidence:** `docs/CONTEXT-PROJECT.md:56`, `js/features/seo-jsonld.js:1-50`, `scripts/qa-syntax.mjs:18,58-59`, pairing confirmed via `index.html:13,50` against `assets/seo/ld-index.json`
- **Current implementation:** `js/features/seo-jsonld.js` fetches the file named in `<meta name="ld-json">` and overwrites the embedded fallback script's content with it at runtime, so the no-JavaScript and post-JavaScript experiences are meant to show equivalent data; the project's own maintenance rules call the two copies "hand-maintained" and require them to "stay semantically identical" (`CONTEXT-PROJECT.md:56`). `qa-syntax.mjs` only confirms each `assets/seo/*.json` file is syntactically valid JSON (`:58-59`); it never reads the corresponding HTML fallback or compares the two. Spot-checking `index.html`'s embedded fallback against `assets/seo/ld-index.json` today shows them identical, so this is an unprotected contract rather than a current defect.
- **Proposed improvement:** Extend the static QA pipeline with a focused check that, for every root HTML page carrying an `ld-json` meta tag, parses the embedded fallback JSON-LD and the referenced `assets/seo/` file and fails if the two are not deeply equal.
- **Expected quality value:** A future content or metadata edit that updates only one half of a JSON-LD pair is caught by `npm run qa:fast` before it reaches a page, instead of silently shipping inconsistent structured data to search engines versus JavaScript-enabled browsers.
- **Implementation scope:** One new check, either a small addition to `scripts/check-link-integrity.mjs` (which already parses these HTML files with the same lightweight regex approach) or a new sibling script wired into `qa:fast`. No new dependency is required. Do not evaluate JSON-LD content against schema.org itself — only equivalence between the two existing copies.
- **Acceptance criteria:** The check passes today against all 12 current pairs. Temporarily editing either half of one pair causes it to fail and name the affected page.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-05 — Make the image pipeline's exit code reflect per-file failures

- **Affected area:** `npm run img:opt` (`scripts/optimize-images.mjs`), the tool that produces the tracked, HTML-referenced files in `assets/img/optimized/`.
- **Evidence:** `scripts/optimize-images.mjs:132-146,216-217,229-232`
- **Current implementation:** `runOptimization()` processes each source image in a loop, catching and counting per-file failures individually (`stats.errors += 1`, lines 133-139) so that one bad file does not stop the rest, then logs a summary including the error count and returns (lines 142-146). Nothing in that return path sets `process.exitCode`; the only places the script sets a non-zero exit code are the mutually-exclusive-flags guard (`:216-217`) and the top-level fatal handler in `main()` (`:229-232`), neither of which is reached by a per-file processing failure. A source image `sharp` cannot decode is logged as an error, but `npm run img:opt` still exits 0.
- **Proposed improvement:** After the one-shot optimization loop, set `process.exitCode = 1` when `stats.errors > 0`, leaving the per-file continue-on-error behavior and console summary unchanged.
- **Expected quality value:** A script or CI step that chains on `img:opt`'s exit code (for example running it before `npm run build`) actually stops when an image fails to process, instead of proceeding to package a build that is silently missing a responsive image variant.
- **Implementation scope:** `scripts/optimize-images.mjs`, the end of the one-shot branch of `runOptimization()` only. Keep unchanged: incremental skip-if-fresh behavior, the `--watch` handlers (which already log per-event failures independently and are not gated by a single process exit code), and `--clean`.
- **Acceptance criteria:** Running `img:opt` over a source set containing one file the pipeline cannot process still generates output for the valid files, still logs the same summary line, and now exits non-zero. Running it over an all-valid source set still exits 0.
- **Impact:** Low
- **Effort:** Small

## Selection summary

These five proposals were selected because each protects a specific, currently working mechanism against a realistic input or regression that the project's own verification does not yet cover, without adding new tooling, dependencies, or architecture:

- IMP-QUALITY-01 and IMP-QUALITY-03 both extend `scripts/a11y-axe.mjs` with an additional interactive scenario, the same way the existing Deluxe-filter and mobile-nav scenarios already do; they can be implemented independently of each other.
- IMP-QUALITY-02 and IMP-QUALITY-04 both extend the dependency-free static gate (`qa:fast`) with a new sibling script, without touching `check:links` or `check:syntax` internals.
- IMP-QUALITY-05 is fully independent and the smallest of the five.

None depends on another being implemented first. All five are Small effort and stay within the current architecture: no new test framework, no new runtime dependency, and no change to supported functionality or page content. This is an appropriately scoped set for a single focused development session.

## Analysis limitations

- **Static analysis only.** No browser session was run. `npm run qa:fast` was executed and passed (12 HTML files, 27 JavaScript files, 12 JSON files); `npm run test:a11y` was not run, since `node_modules` is not installed in this environment and this task does not install dependencies or browsers. The malformed-fragment behavior described in IMP-QUALITY-01 is traced from the source and from `querySelector`'s documented behavior for invalid selectors, not confirmed in a live browser.
- **No live deployment was queried.** IMP-QUALITY-04's claim that the current JSON-LD pairs already match is based on one spot-checked pair (`index.html`) against the checked-in source, not all 12; IMP-QUALITY-02's account of the edge function's verification history is based on the archived audit's written closure note, not a re-run of that live check.
