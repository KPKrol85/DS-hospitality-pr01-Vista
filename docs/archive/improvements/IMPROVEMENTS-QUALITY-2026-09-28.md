# Vista — Quality Improvements

**Analysis date:** 2026-09-27

**Completion date:** 2026-09-28

**Project type:** Static multi-page website (HTML, modular CSS, vanilla JavaScript) with a Node.js build pipeline and Netlify configuration

**Focus:** Project-wide quality

**Status:** COMPLETED — all five selected quality improvements implemented and verified.

## Implementation closure

The quality-improvement cycle is complete (5/5 items). The completed work strengthened gallery fragment handling, booking-date regression coverage, contact-form accessibility testing, JSON-LD equivalence verification, and image-pipeline failure reporting. No new runtime dependencies or architectural changes were introduced.

## Original assessment and evidence

The original evidence-based review found a layered verification stack: the dependency-free `check:links` and `check:syntax` gate and the browser-based `test:a11y` check over eight scenarios. All earlier audits, reviews, and UI/UX reports were closed, and `npm run qa:fast` passed on the reviewed tree (12 HTML, 27 JavaScript, and 12 JSON files).

At the **time of the 2026-09-27 analysis**, the principal findings concerned unprotected boundaries around working functionality:

- Gallery fragment restoration interpolated `window.location.hash` into a `querySelector` attribute selector, unlike the strict-equality approach in `room-filters.js`; source tracing predicted that a malformed fragment could throw and abort the rest of `boot()`.
- The booking-date Edge Function, the fix for an earlier P1 past-arrival defect, had only a module-syntax check and one manual live check recorded in `AUDIT-2026-09-24.md`.
- The contact form's `aria-invalid`/`aria-live` error state was not covered by any `test:a11y` scenario.
- No check compared embedded JSON-LD fallbacks with their hand-maintained `assets/seo/ld-<page>.json` counterparts.
- `npm run img:opt` logged per-file failures but still exited 0.

These are historical findings, not claims about the current implementation.

## Completed improvements

### IMP-QUALITY-01 — Harden gallery filter fragment parsing against malformed URLs

- **Status:** COMPLETED — implemented and verified.
- **Result:** Gallery fragment restoration compared known `data-filter` values strictly, without URL decoding or selector interpolation, and unrecognized fragments fell back to the "all" view.
- **Verification:** Chromium encoded the originally reported literal quote as `%22` and did not reproduce the predicted initialization exception, whereas `#\wellness` reproduced an incorrect selection with no visible images before the fix and fell back to all after it. Six fragment regression scenarios passed alongside the eight existing axe scenarios, covering post-malformed-URL controls, `hashchange`, history, scrolling, lightbox filtering, and DEV `configureSW()` continuation. `qa:fast`, `test:a11y`, `build`, and `git diff --check` passed locally.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-02 — Add an executable regression test for the booking-date Edge Function

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added a dependency-free check that executes the unchanged Edge Function across 11 Warsaw-relative date and pass-through scenarios, integrated into `qa:fast`.
- **Verification:** Detection of past-date, format, and calendar regressions was verified on isolated copies of the function.
- **Impact:** High
- **Effort:** Small

### IMP-QUALITY-03 — Cover the contact form's live validation-error state in the accessibility check

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added real contact-form validation-error assertions and axe coverage of the error state, and corrected error-text contrast across Light, Dark, and Auto themes.
- **Verification:** All 15 accessibility scenarios and `qa:fast` passed.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-04 — Verify embedded and external JSON-LD payloads stay identical

- **Status:** COMPLETED — implemented and verified.
- **Result:** Added a mismatch-detecting JSON-LD equivalence check to `qa:fast` and corrected an existing description inconsistency in the regulamin JSON-LD pair.
- **Verification:** The check verified all 12 embedded/external pairs.
- **Impact:** Medium
- **Effort:** Small

### IMP-QUALITY-05 — Make the image pipeline's exit code reflect per-file failures

- **Status:** COMPLETED — implemented and verified.
- **Result:** One-shot image optimization exited non-zero on per-file failures while continuing to process valid files.
- **Verification:** Isolated fixtures verified valid output generation and exit codes 1 on failure and 0 on success.
- **Impact:** Low
- **Effort:** Small

## Selection notes

The five items were selected because each protected a working mechanism against a realistic input or regression not covered by existing verification, without new tooling, dependencies, or architecture. IMP-QUALITY-01 and IMP-QUALITY-03 extended `scripts/a11y-axe.mjs`; IMP-QUALITY-02 and IMP-QUALITY-04 extended the dependency-free `qa:fast` gate; IMP-QUALITY-05 was independent. No item depended on another, and all were rated Small effort.

## Verification history and limitations

The original 2026-09-27 analysis was static: `npm run qa:fast` was run and passed, but `test:a11y` was not run because `node_modules` was not installed, and no browser session or live deployment was used. The malformed-fragment failure in IMP-QUALITY-01 was traced from source and `querySelector` semantics; later browser verification did not reproduce it with a literal quote but confirmed a different malformed-fragment defect.

The original statement that JSON-LD pairs matched was based on one spot-checked pair (`index.html`); implementation of IMP-QUALITY-04 subsequently found and corrected the regulamin inconsistency. The account of the Edge Function's earlier verification relied on the archived audit's closure note, not a re-run of that live check. Successful checks listed in the records above were reported during their **subsequent implementation phases**, not during this archival redaction.
