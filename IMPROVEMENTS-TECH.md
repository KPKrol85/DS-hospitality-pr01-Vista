# Vista — Technical Improvements

**Analysis date:** 2026-09-30
**Project type:** Demonstrational static multi-page HTML/CSS/vanilla JavaScript website with Node.js tooling and Netlify configuration
**Analysis mode:** Evidence-based technical improvement review
**Focus:** Project-wide technical implementation

## Improvement overview

Vista uses complete root HTML documents, ordered CSS modules, feature-level JavaScript modules, and a separate generated production package. The reviewed areas include initialization, navigation and filters, dialogs, form validation and offer prefill, theme ownership, JSON-LD loading, and source-to-distribution/PWA contracts. Current sources were compared with README, maintained project/build guidance, the changelog, and archived plans, audits, and UI/UX/Quality/Workflow reports. No existing TECH report or uncompleted plan checkbox was found.

Three opportunities qualify: consolidate repeated field validation inside its existing module, give repeated theme values one definition, and consolidate the copied-file mapping within the existing build script. These are maintenance proposals, not defect findings or approved implementation tasks. Existing test coverage, completed interaction improvements, and workflow documentation work are not proposed again. Impact and effort below are relative engineering estimates, not measured outcomes or delivery commitments.

## Proposed improvements

### IMP-TECH-01 — Reuse phone and guest validators across form events

- **Status:** COMPLETED
- **Affected area:** Enhanced contact-form validation in `js/features/form.js`.
- **Evidence:** `js/features/form.js:150–160` repeats the guest parsing/range rule and optional-phone normalization/regex rule that appear again in the submit handler at `176–181` and `193–197`. The same module already shares `validateName`, `validateEmail`, `validateCheckin`, `validateCheckout`, and `validateConsent` between event handlers. `contact.html:243–253,274–276` defines the corresponding native controls and error messages.
- **State before implementation:** Phone and guest input listeners each calculate validity and call `setError`; submission repeats those calculations before updating the aggregate result. Other fields already use local validator functions. The duplication is within one feature and does not require a shared validation framework.
- **Proposed improvement:** Introduce local phone and guest validator functions following the existing pattern: calculate validity, update the field error, and return the result. Call each from both its input listener and the submit handler.
- **Expected engineering value:** Each enhanced field rule and its error update have one implementation, so a later change does not require matching edits to input-time and submit-time branches.
- **Implementation scope:** Limit production-source edits to `js/features/form.js`. Preserve the current phone regex, trimming, optional-empty behavior, guest `parseInt` semantics and bounds, listener timing, and submit validation order. Keep HTML constraints, date handling, offer prefill, honeypot, Netlify identity/action, and native submission unchanged. Changing accepted inputs is a separate task.
- **Acceptance criteria:** Each of the two rules exists once and is called by both event paths; every present field is still evaluated on submit even after an earlier failure. A focused before/after contact-form check produces the same errors for empty/valid/invalid phone values and empty/boundary/out-of-range guest values, preserves first-invalid-field focus, and reaches the same native POST path for valid data. Error IDs, messages, and ARIA updates remain unchanged.
- **Completion summary:** Added local `validatePhone()` and `validateGuests()` functions shared by input and submit handlers, preserving validation and native submission behavior.
- **Verification:** The focused before/after Chromium regression, `npm run build`, `npm run qa:fast`, and `git diff --check` passed.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-02 — Define theme palette values once for explicit and automatic modes

- **Status:** COMPLETED
- **Affected area:** Palette ownership in `css/modules/tokens.css`.
- **Evidence:** `css/modules/tokens.css:1–24` defines default light values and named dark values. Explicit theme selectors at `103–126` and automatic-mode media rules at `128–157` repeat the light color literals, gradient expressions, and dark error-text value. `css/modules/base.css:31` consumes `--bg-gradients`; `css/modules/components.css:187` consumes `--form-error-text-elevated`. `js/theme-init.js` resolves the pre-paint theme, while `js/features/theme.js` manages later preference changes.
- **State before implementation:** Explicit Light/Dark and CSS Auto fallback assign the same semantic tokens through separate selectors. Most dark colors already reference named palette tokens, but light colors and both gradient definitions are maintained in multiple places. Updating those values requires synchronizing the explicit and automatic branches.
- **Proposed improvement:** Extend the existing palette-token approach only to repeated theme values: maintain each light palette value, each theme gradient, and the dark form-error color once, then reference them from the existing semantic assignments. Retain the selectors that decide when each palette applies.
- **Expected engineering value:** A palette adjustment has one value definition regardless of whether the theme is selected by JavaScript or the CSS system-preference fallback. Existing component consumers keep their semantic token names.
- **Implementation scope:** Limit production-source edits to `css/modules/tokens.css`; reuse the existing dark palette tokens. Preserve all resolved colors and gradient parameters, selector precedence, the root `--bg-gradients: none` baseline, explicit preference precedence over the OS, and Auto/no-attribute fallback behavior. Keep typography, spacing, component rules, theme scripts, and storage unchanged; no CSS preprocessor or theme framework is needed.
- **Acceptance criteria:** The identified repeated palette literals and gradient definitions each have one maintained definition, with explicit and automatic branches referencing it. Computed semantic tokens and body backgrounds match the baseline for explicit Light/Dark under both OS preferences and for Auto/missing `data-theme` under each preference. Form-error text retains its existing resolved colors. Source-mode and bundled CSS retain the same theme selection behavior, including the no-JavaScript fallback.
- **Completion summary:** Added shared definitions for repeated Light colors, Light/Dark gradients, and dark elevated form-error text, preserving resolved values and theme selection.
- **Verification:** Source/bundle before/after computed-style checks, `npm run build`, `npm run qa:fast`, and `git diff --check` passed.
- **Impact:** Medium
- **Effort:** Small

### IMP-TECH-03 — Use one mapping for unchanged files copied into dist

- **Affected area:** Source-to-output file ownership in `scripts/build-dist.mjs`.
- **Evidence:** `scripts/build-dist.mjs:10–14` declares required inputs and Netlify source/destination pairs. `main()` separately names `js/theme-init.js`, `site.webmanifest`, `robots.txt`, and `sitemap.xml` for copying at `327–332`, then copies Netlify mappings at `334–336`. `verifyDistribution()` repeats their destination paths at `244–249`. `copyFileIntoDist()` already accepts source and destination arguments at `75–80`.
- **Current implementation:** The same six files copied without content transformation are represented across input validation, copy operations, and output validation. Netlify files have an explicit mapping, while the other four use separate declarations. The worker template is also a required input, but its output is generated rather than copied unchanged.
- **Proposed improvement:** Maintain one local source/destination mapping for these six copied files and consume it for input existence checks, copying, and required destination checks. Keep the worker template and generated outputs explicitly separate from that mapping.
- **Expected engineering value:** The build's unchanged-file contract can be reviewed and updated in one place without synchronizing independent inventories. This is a bounded source-ownership change inside the existing pipeline, not a new workflow or build system.
- **Implementation scope:** Limit production-source edits to `scripts/build-dist.mjs`. Preserve automatic HTML discovery, bundle generation, required directories, optimized-image exclusions, passthrough images, Netlify filenames, and failure on missing inputs/outputs. Keep `DIST_STATIC_ASSETS` as a distinct precache policy; do not infer caching from the copy mapping. Preserve worker template substitution, content hashing, package verification, npm commands, and deployment configuration. Any output is regenerated by the existing build, never edited manually.
- **Acceptance criteria:** Exactly the current six unchanged files are declared in one mapping used by all three phases; the worker remains generated. A before/after build from identical application sources yields the same package paths and file contents, including the worker version and precache list. Missing declared inputs still fail the build, and output verification still checks every declared destination. Existing HTML rewrite and development-file exclusion checks remain in place.
- **Impact:** Medium
- **Effort:** Medium

## Selection summary

The proposals remove concrete duplication while preserving the current architecture and public behavior. They touch separate source files, have no implementation dependency on one another, and can be selected independently. The form proposal comes first because it reuses an established local pattern with the smallest scope; palette consolidation follows; build mapping consolidation needs a package comparison and therefore carries more verification work.

Together they form a bounded candidate backlog for focused development, without a guaranteed one-day completion time. Only three were selected: broader changes to repeated HTML/JSON-LD ownership would affect more source and fallback contracts, while additional small helper extractions offered insufficient value to justify separate tasks. Completed Quality and Workflow objectives remain outside this set.

## Analysis limitations

This review is based on current source, configuration, module relationships, documentation, and read-only Git inspection. No application tests, build, browser session, or live Netlify request was run. The duplication is source-visible; behavior preservation and package equivalence are acceptance criteria for future implementation, not verified outcomes of this analysis. Historical verification records were used to avoid recycling completed work and were not treated as current runtime evidence.
