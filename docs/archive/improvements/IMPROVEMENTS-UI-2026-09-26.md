# Vista — UI Improvements

**Analysis date:** 2026-09-25

**Completion date:** Not recorded

**Project type:** Static multi-page website (HTML, modular CSS, vanilla JavaScript) with a Node.js build pipeline and Netlify configuration

**Focus:** Project-wide UI

**Status:** COMPLETED — all five selected UI improvements implemented; no implementation-phase verification was recorded.

## Implementation closure

This record covers the first UI-improvement cycle (5/5 items implemented). It is separate from the later cycle archived in `IMPROVEMENTS-UI-2026-09-30.md`. The work applied the existing token system more consistently to headings, buttons, native controls, filter states, and focus rings without introducing a new visual language.

## Original assessment and evidence

The original evidence-based review found a coherent visual language across 11 pages: a token file with a fluid type scale, spacing, radius, and theme colours, BEM-style components, and a consistent card, pill, and accent-line vocabulary. The opportunities lay in how the shared system was applied, not in the visual direction.

At the **time of the 2026-09-25 analysis**, the principal findings were:

- One `.section-title` rule (`--fs-500`, about 18.9 px at 1280 px) styled both homepage `h2` headings and every subpage `h1`; legal-section `h2` headings were larger than the page `h1`, several card and gallery titles were smaller than body text, and `.offer-card__meta` referenced an undefined `--text-muted` token.
- `.btn` declared `--btn-border` without applying it, so `<a class="btn btn--secondary">` rendered borderless while `<button>` instances kept browser default borders; a fixed 180 px base width was restated or overridden in several contexts, and `--fs-btn-sm`/`--fs-btn-lg` were unused.
- Native form controls and the room filter buttons rendered in the browser's default sans-serif instead of the project typeface.
- The selected filter background was identical to hover, differing only by a faint border tint, and was styled through three selectors, including the legacy `.tabs__tab.is-active`.
- More than a dozen component rules overrode the global focus ring with differing colours, widths, and offsets; `.btn:focus-visible` was duplicated, and several focus rules targeted non-focusable elements.

IMP-UI-01, IMP-UI-03, and IMP-UI-04 were also confirmed in rendered captures. These are historical findings, not claims about the current implementation.

## Completed improvements

### IMP-UI-01 — Assign distinct type-scale tiers to page, section and card headings

- **Status:** COMPLETED — implemented; no verification evidence recorded.
- **Result:** Established distinct heading type-scale tiers across Vista pages using existing tokens, improved card-title hierarchy, preserved responsive offer-title sizing, and corrected the offer metadata colour token.
- **Verification:** No implementation-phase checks or results were recorded in this archive.
- **Impact:** High
- **Effort:** Medium

### IMP-UI-02 — Make the button base own the border and minimum size for every variant

- **Status:** COMPLETED — implemented; no verification evidence recorded.
- **Result:** Centralized button border and minimum-size handling, preserved existing variant and responsive layouts, corrected section-header link alignment, and removed unused button typography tokens.
- **Verification:** No implementation-phase checks or results were recorded in this archive.
- **Impact:** High
- **Effort:** Medium

### IMP-UI-03 — Make native form controls and filter buttons inherit the project typeface

- **Status:** COMPLETED — implemented; no verification evidence recorded.
- **Result:** Native form controls and room filter buttons inherited the project typeface. Existing room/gallery filter line-height differences remained outside this task's scope.
- **Verification:** No implementation-phase checks or results were recorded in this archive.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-04 — Give the filter controls a selected state that differs from hover

- **Status:** COMPLETED — implemented; no verification evidence recorded.
- **Result:** Unified selected-state styling for room and gallery filters using `aria-pressed` and `aria-current`, introduced a distinct selected appearance, and removed legacy tab presentation dependencies while preserving filter behaviour and layout.
- **Verification:** No implementation-phase checks or results were recorded in this archive.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-05 — Consolidate focus-visible styling into shared focus-ring tokens

- **Status:** COMPLETED — implemented; no verification evidence recorded.
- **Result:** Centralized focus-ring colour, width, and offset across interactive controls, removed duplicate and unreachable focus rules, and preserved required card and invalid-field exceptions.
- **Verification:** No implementation-phase checks or results were recorded in this archive.
- **Impact:** Medium
- **Effort:** Medium

## Selection and out-of-scope notes

The five items were selected because each was source-visible, applied to shared components on several pages, and strengthened the existing token system. Original dependency notes: IMP-UI-03 and IMP-UI-04 both edited `.gallery-cats__link`; IMP-UI-02 and IMP-UI-05 both touched `.btn` rules, with the duplicated `.btn:focus-visible` assigned to IMP-UI-05; IMP-UI-01 was independent.

Two lower-ranked patterns were not included:

- Five card types repeated the same literal hover elevation instead of a token, and `.legal-card` referenced an undefined `--elev-soft`.
- Section-header and intro insets (`--space-md`, `--space-sm`, `--space-lg`) differed from the flush edges of the content grids below them.

**Out of scope — possible dark-theme defect:** the dark theme redefined `--primary` as `#34d1b2` but kept the white `--primary-contrast`, calculating to about 1.9:1 for `.offer-card__badge` and the start of the `.btn--primary` gradient. It was recorded from token values only, as an audit candidate rather than a proposal, and IMP-UI-02 did not address it.

## Verification history and limitations

The original analysis used headless Chromium captures from `file://` URLs with the project-notice dialog suppressed, covering the light theme at 1280 px (index, rooms, offers, gallery, contact, regulamin) and 390 px (rooms). Hover states, the rendered dark theme, and other browsers were not captured, so dark-theme statements were source-based. `npm run qa:fast` and `npm run test:a11y` were not run because `node_modules` was absent.

This archive records the completion of all five items but no implementation-phase checks, test results, or completion date. The completion status is preserved as originally recorded; no verification has been inferred or added during this archival redaction.
