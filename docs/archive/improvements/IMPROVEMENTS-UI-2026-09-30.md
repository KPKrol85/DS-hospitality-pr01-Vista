# Vista — UI Improvements

**Analysis date:** 2026-09-28

**Completion date:** 2026-09-30

**Project type:** Static multi-page website (HTML, modular CSS, vanilla JavaScript) with a Node.js build pipeline and Netlify configuration

**Focus:** Project-wide UI

**Status:** COMPLETED — all five selected UI improvements implemented and verified.

## Implementation closure

This record covers the second UI-improvement cycle (5/5 items), following the five completed proposals archived in `IMPROVEMENTS-UI-2026-09-26.md`. The work applied existing tokens and patterns to supporting-text sizes, navigation state, contact-form presentation, inline alignment, and fixed-count grids while keeping the visual identity.

## Original assessment and evidence

At the time of the original evidence-based analysis, Vista's interface used one token file (fluid type scale, spacing, radius, theme colours, and focus-ring tokens), BEM-style components, and shared state patterns across 12 root pages. No active plan or audit covered UI work. Findings were confirmed with computed values and element geometry in Chromium.

At the **time of the 2026-09-28 analysis**, the principal findings were:

- Descriptive copy used `--fs-200` and `--fs-300` without a role rule; at 1280 px, offer descriptions (13.4 px) were smaller than their eyebrows and lists (15.0 px), and the homepage highlight paragraph (15.0 px) was larger than its list (13.4 px).
- The current header link and any hovered link had identical computed styles, differing from other links only by a surface change of about 1.06:1 (light) and 1.12:1 (dark).
- Contact-form values were 13.4 px at 1280 px against 17.4 px body text, the pre-filled guest count resembled a placeholder, labels and the legend used inconsistent colours, and hints were smaller than labels but darker.
- From 760 px, section text was indented by `--space-sm`, `--space-md`, or `--space-lg` while grids started at the container edge (for example x = 49 versus x = 33 at 1280 px), and testimonial cards carried an extra per-card margin.
- Several fixed-count grids ended with partial rows, such as the four homepage offer cards rendering 3 + 1 at 1280 px and the six homepage gallery photos rendering 4 + 2.

These are historical findings, not claims about the current implementation.

## Completed improvements

### IMP-UI-01 — Map descriptive card and section copy to one supporting-text step

- **Status:** COMPLETED (2026-09-29) — implemented and verified.
- **Result:** Added `--fs-supporting: var(--fs-300)` and `--fs-meta: var(--fs-200)` and applied them to the nine descriptive selectors and to room metadata, testimonial attributions, brand stat labels, and offer eyebrows. Offer descriptions matched their lists and exceeded their eyebrows, and the highlight paragraph and list shared one size; only font-size references and the two aliases changed.
- **Verification:** Before/after Playwright/Chromium source-mode measurements passed on `index.html`, `offers.html`, `rooms.html`, and `onas.html` at 390, 800, and 1280 px, with supporting sizes of 14.4 / 14.688 / 15.0336 px, metadata sizes of 12.8 / 13.056 / 13.3632 px, both inversions resolved, unchanged grid columns and button alignment, and no in-scope overflow; grid stretching changed some button heights as text reflowed. `npm run build` (12 HTML pages), all four `qa:fast` checks, and `git diff --check` passed. `test:a11y`, other-browser, production-browser, and live-deployment checks were not run.
- **Impact:** High
- **Effort:** Medium

### IMP-UI-02 — Give the current navigation link a state distinct from hover

- **Status:** COMPLETED (2026-09-29) — implemented and verified.
- **Result:** Separated header hover and current-page states: hover applied only to non-current links, while `aria-current="page"` used `var(--primary)` for a persistent selected state. Header CSS no longer depended on `.is-active`.
- **Verification:** Chromium checks passed at 390 and 1280 px in light and dark themes across the target pages, including current-link contrast in both themes and unchanged header geometry. `npm run build`, `npm run qa:fast`, and `git diff --check` passed.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-03 — Unify contact form value, label and hint presentation

- **Status:** COMPLETED (2026-09-29) — implemented and verified.
- **Result:** Unified form values at `--fs-400` in full text colour, labels and the legend at `--fs-200` in muted colour, and hints at `--fs-100` in muted colour. Removed the guest-count override while keeping placeholders distinct.
- **Verification:** Chromium checks at 390 and 1280 px in both themes, a focused validation regression, `npm run build`, `npm run qa:fast`, and `git diff --check` passed.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-04 — Align section headings, intros and copy to the content grid edge

- **Status:** COMPLETED (2026-09-30) — implemented and verified.
- **Result:** Removed desktop/tablet insets from section text, gallery and brand headings, and homepage highlight content; testimonial cards used the grid gap for spacing. The 390 px layout remained unchanged.
- **Verification:** Chromium checks at 390, 800, and 1280 px, `npm run build`, `npm run qa:fast`, and `git diff --check` passed.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-05 — Choose grid column counts that divide each grid's item count

- **Status:** COMPLETED (2026-09-30) — implemented and verified.
- **Result:** Fixed-count grids used balanced column counts or a full-width trailing card, with reusable modifiers for three and four items. Room, brand, and testimonial minimum widths remained enforced.
- **Verification:** Chromium layout and filter checks at the required widths, `npm run build`, `npm run qa:fast`, and `git diff --check` passed.
- **Impact:** Medium
- **Effort:** Medium

## Selection and out-of-scope notes

The five items were selected because each was based on source rules shared by several components or pages, was confirmed with computed values in Chromium, and could reuse existing tokens and state patterns. Original dependency notes: IMP-UI-04 and IMP-UI-05 overlapped on the homepage testimonial grid; IMP-UI-01 excluded the contact form, which IMP-UI-03 covered; IMP-UI-02 was independent.

One lower-ranked opportunity remained outside the cycle: hover elevation on static cards. Benefits, testimonials, the CTA panel, and `rooms.html` room cards (which contained no focusable element) lifted on hover like interactive cards, five rules repeated the same literal lift and shadow, and `.legal-card` referenced an undefined `--elev-soft`.

The original analysis also recorded candidate defects outside the five improvements, intended for an audit rather than this report:

- **Dark-theme primary colour:** white `--primary-contrast` on the dark `--primary` (`#34d1b2`) computed to 1.93:1, affecting `.offer-card__badge` and the start of the `.btn--primary` gradient; the 2026-09-26 report first noted this.
- **Dark-theme form errors:** `.form__error` outside the date fieldset used the literal `#b91c1c`, about 3.0:1 against `#0a0d11`; for this reason, IMP-UI-03 left error colours out of scope.
- **Homepage gallery markup:** images declared `width="800" height="800"` for 3:2 files, `w` descriptors were half the actual widths, and `<source>` elements lacked `sizes`, causing a 285 × 285 to 285 × 190 px shift at 1280 px and loading of the 1600 px AVIF.
- **Contact page decoration:** `.contact-info::after` overlapped the map caption and form heading at 390 px.
- **Gallery scrolling:** gallery filter scrolling used `behavior: "smooth"` without a reduced-motion check, as the archived UX report also noted.

## Verification history and limitations

The original analysis served pages in source mode through `scripts/dev-server.mjs` and measured computed styles and geometry in Chromium at 390, 600, 700, 800, 1000, and 1280 px. The browser pane was hidden, so no screenshots were captured; dark-theme values were read after setting `data-theme="dark"`, and hover was tested on one navigation link and one room card. No project source was changed, so `npm run qa:fast`, `npm run test:a11y`, and the build were not run at that stage.

The original analysis did not test other browsers, real devices (including the iOS small-text focus-zoom behaviour cited for IMP-UI-03), or assistive technologies. Successful checks listed in the records above were reported during their **subsequent implementation phases**, not during this archival redaction.
