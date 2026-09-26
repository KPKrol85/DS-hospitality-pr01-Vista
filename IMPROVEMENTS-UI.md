# Vista — UI Improvements

**Analysis date:** 2026-09-25
**Project type:** Static multi-page website (HTML, modular CSS, vanilla JavaScript) with a Node.js build pipeline and Netlify configuration
**Analysis mode:** Evidence-based UI improvement review
**Focus:** Project-wide UI

## Improvement overview

Vista has a coherent visual language: a token file with a fluid type scale, spacing, radius and theme colours, BEM-style components, and a consistent card, pill and accent-line vocabulary across 11 pages. All findings from the archived audit and plan are closed, and no active plan covers UI work. The main opportunities lie in how the shared system is applied, not in the visual direction. Subpage headings do not use the type scale's upper tiers. The button, filter and focus styles have partly disconnected ownership. Native form controls do not inherit the project typeface. Each proposal below strengthens an existing pattern and introduces no new visual language.

## Proposed improvements

### IMP-UI-01 — Assign distinct type-scale tiers to page, section and card headings

- **Affected area:** Subpage `h1` headings, legal-page and contact-page headings, gallery section headings, room, benefit and offer card titles.
- **Evidence:** `css/modules/tokens.css:39-45`, `css/modules/sections.css:172-175`, `css/modules/sections.css:301-305`, `css/modules/subpages.css:7-11`, `css/modules/subpages.css:32-40`, `css/modules/subpages.css:119-122`, `css/modules/subpages.css:140-144`, `css/modules/subpages.css:162-168`, `css/modules/subpages.css:392-396`, `css/modules/subpages.css:486-490`, `css/modules/components.css:759-765`, `css/modules/components.css:780-784`, `css/modules/components.css:959-964`, `regulamin.html:137`, `rooms.html:146`, `rooms.html:214`, `contact.html:145-150`
- **Current state:** One `.section-title` rule (`--fs-500`, about 18.9 px at a 1280 px viewport) styles the homepage `h2` headings and the `h1` of every subpage. Only `404.html` and `offline.html` override it, to `--fs-700`. Some `h2` headings on the same page are the same size as the `h1` or larger:
  - The legal-page section `h2` uses `--fs-600` (about 23 px), so it is larger than the page `h1`.
  - The table-of-contents `h2` and the contact-page `h2` headings match the `h1` at `--fs-500`.

  Several titles are smaller than body text (`--fs-400`, about 16.7 px):
  - Gallery section `h2` headings, room card titles and benefit titles use `--fs-300` (about 14.4 px).
  - Offer card titles shrink from `--fs-500` to `--fs-400` at 480 px and wider.

  The uppercase `.offer-card__meta` eyebrow references an undefined `--text-muted` token, so it renders in the inherited text colour. `--fs-800` is defined but unused. Headless Chromium captures of `rooms.html`, `offers.html`, `contact.html` and `regulamin.html` at 1280 px show each page title at about the same size as the subsection headings.
- **Proposed improvement:** Add a page-title tier for subpage `h1` headings using the existing upper scale steps (`--fs-700`/`--fs-800`), for example a `.section-title` modifier or a scoped `h1.section-title` rule. Merge the 404/offline override into that tier. Map section, sub-section and card-title roles to scale steps at or above body text, so each page shows `h1` > `h2` > `h3` ≥ body. Point the offer eyebrow at an existing muted colour token.
- **Expected value:** The visual hierarchy of all subpages matches their semantic outline, and page titles read as page titles. The existing scale is used without new tokens or fonts.
- **Implementation scope:** Title rules in `css/modules/sections.css`, `css/modules/subpages.css` and `css/modules/components.css`. If a CSS-only scope is not enough, add a modifier class to the subpage `h1` markup. Keep unchanged: the homepage hero title, heading levels, IDs and `aria-labelledby` references, the `::after` accent lines, `scroll-margin-top`, card layouts, responsive alignment rules, and the token values themselves.
- **Acceptance criteria:**
  - On every subpage at 390 px and 1280 px, the computed `h1` font size is larger than that of every `h2` on the page.
  - Legal section `h2` headings are smaller than the legal page `h1`.
  - Gallery section `h2` headings and all card titles are at least the body text size.
  - Offer card titles do not get smaller at wider breakpoints.
  - `.offer-card__meta` uses a defined token.
  - The hero and the heading semantics are unchanged.
- **Impact:** High
- **Effort:** Medium
- **Status:** COMPLETED — Established distinct heading type-scale tiers across Vista pages using existing tokens, improved card-title hierarchy, preserved responsive offer-title sizing, and corrected the offer metadata colour token.

### IMP-UI-02 — Make the button base own the border and minimum size for every variant

- **Affected area:** Shared `.btn` component and its `--primary`, `--secondary`, `--ghost` and `--link` variants in all 11 pages, the header CTA, the contact submit button and the project-notice dialog.
- **Evidence:** `css/modules/components.css:33-61`, `css/modules/components.css:76-82`, `css/modules/components.css:94-98`, `css/modules/components.css:110-129`, `css/modules/components.css:133-143`, `css/modules/components.css:597-611`, `css/modules/components.css:773-779`, `css/modules/sections.css:56-58`, `css/modules/sections.css:234-238`, `css/modules/tokens.css:48-50`, `index.html:257`, `contact.html:295`
- **Current state:** Borders are declared but never applied by the base:
  - `.btn` declares `--btn-border`, and every variant redefines it, but no rule applies it as a border.
  - `.btn--primary` sets only `border-color`, and `.btn--ghost` declares its own literal `border`.
  - The dark-theme ghost override assigns `--btn-border` twice, and nothing reads it.
  - As a result, `<a class="btn btn--secondary">` renders without its declared primary-tinted border (borderless pale pills in room and offer cards in the captures).
  - `<button class="btn …">` instances keep the browser's default button border width and style, while `<a>` instances have no border.

  Sizing is fixed in the base and repeated in contexts:
  - The base rule fixes `width: 180px`.
  - The hero and highlight contexts restate 180 px, offer cards override to `100%` with a 180 px maximum, and the project dialog overrides to `100%`/`auto` with a `10rem` minimum.
  - `.btn--link` inherits the fixed width, so section-header links such as "Wszystkie pokoje" sit inside a 180 px box and end short of the section's right edge.

  `--fs-btn-sm` (`0.4rem`) and `--fs-btn-lg` are defined but unused.
- **Proposed improvement:** Give the base `.btn` a single border declaration that reads `--btn-border`. Variants then set only the token, with `transparent` where no border is intended. Replace the fixed base width with a tokenised minimum inline size that still allows longer labels, and let `.btn--link` opt out of it. Remove context rules that only restate the base width. Remove or document the unused button size tokens without adding new variants.
- **Expected value:** Links and buttons with the same classes render the same box. The token defines each variant's border in both themes. Fewer context overrides are needed, and link-style buttons align with their containers.
- **Implementation scope:** The button section of `css/modules/components.css` and the existing button context rules in `css/modules/sections.css` and `css/modules/components.css`. No markup change is expected. Keep unchanged: colours and gradients, radius, hover and active transforms, current rendered button widths at 390 px and 1280 px (unless a label needs more room), and the header, hero, highlight, CTA and dialog layouts. Focus styling is covered by IMP-UI-05.
- **Acceptance criteria:**
  - At the same breakpoint, `<a class="btn btn--primary">` and `<button class="btn btn--primary">` have identical rendered dimensions.
  - Each variant's rendered border matches its `--btn-border` value in the light and dark themes.
  - No `--btn-border` assignment is left without a consumer.
  - Hero, highlight, offer card, CTA, project dialog and 404/offline buttons keep their current alignment at 390 px and 1280 px.
  - `.btn--link` in section headers ends flush with the header's end edge.
  - No button label wraps or overflows.
- **Impact:** High
- **Effort:** Medium
- **Status:** COMPLETED — Centralized button border and minimum-size handling, preserved existing variant and responsive layouts, corrected section-header link alignment, and removed unused button typography tokens.

### IMP-UI-03 — Make native form controls and filter buttons inherit the project typeface

- **Affected area:** Contact inquiry form fields, room filter buttons on `rooms.html`.
- **Evidence:** `css/modules/base.css:5-17`, `css/modules/components.css:43`, `css/modules/components.css:159-172`, `css/modules/components.css:225-229`, `css/modules/components.css:862-883`, `rooms.html:152-161`, `contact.html:229-281`
- **Current state:** `html` and `body` use `--font-sans`, and `.btn` sets `font-family` explicitly. No rule passes the family to `input`, `textarea`, `select`, or buttons without the `.btn` class. The `.form__field` control rules set size, line height and letter spacing only. `.gallery-cats__link` sets no family; it styles `<button>` elements for room filters and `<a>` elements for gallery filters. In the Chromium captures, contact field values and placeholders and the room filter labels render in the browser's default sans-serif. The adjacent labels and the link-based gallery filters render in Inter.
- **Proposed improvement:** Add a base-level rule that makes native form controls and buttons inherit the document font family. Component-level size, weight and letter-spacing tokens stay in place, so every text-bearing control uses the project typeface.
- **Expected value:** The inquiry form, the project's main interactive surface, gets consistent typography. The room and gallery filters, which share one component class, match each other.
- **Implementation scope:** `css/modules/base.css` or the form and filter component rules. Keep unchanged: current font sizes and letter spacing, invalid and disabled states, autofill styling, checkbox dimensions, native date and number inputs, the honeypot field, and the visual size of icon-only buttons (theme toggle, menu toggle, lightbox controls).
- **Acceptance criteria:**
  - The computed `font-family` matches the body's `--font-sans` stack for the contact text, email, telephone, date and number inputs, the textarea, the submit button and the room filter buttons.
  - Room and gallery filters render with identical typography at 390 px and 1280 px.
  - `.btn` rendering is unchanged.
  - Native and enhanced form validation behave as before.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-04 — Give the filter controls a selected state that differs from hover

- **Affected area:** Room filters (`rooms.html`) and gallery category filters (`gallery.html`), which share the `.gallery-cats` component.
- **Evidence:** `css/modules/components.css:862-905`, `css/modules/subpages.css:57-76`, `rooms.html:149-161`, `gallery.html:149-156`, `js/features/room-filters.js:13-16`, `js/features/gallery-filters.js:85-87`
- **Current state:** Three selectors in two files style the selected filter:
  - `.gallery-cats__link[aria-current="true"]` (gallery).
  - `[aria-selected="true"]`, which no current page produces.
  - `.tabs__tab.is-active`, which applies because the room filter markup still carries the legacy `tabs` and `tabs__tab` classes. The room filters expose their state through `aria-pressed="true"`, which has no style hook.

  The selected background is identical to the hover background (`--bg-elev` 95% mixed with `--focus` 3%). The two states differ only in a `--focus` border mix of 35% versus 25%. In the captures, the active "Wszystkie" and "Pokaż wszystko" filters are distinguishable only by a faint tinted border.
- **Proposed improvement:** Define one selected-state rule on `.gallery-cats__link` keyed to the ARIA state each filter already sets (`aria-current="true"` for gallery links, `aria-pressed="true"` for room buttons). It should use existing tokens to differ from hover by more than a border tint, for example a primary-tinted surface or a heavier weight. Room filter presentation should no longer depend on the `.tabs` and `.tabs__tab` classes, and the unused selectors can then be removed.
- **Expected value:** The active category is identifiable at a glance on both pages. The selected style follows the accessible state and has a single owner in the stylesheet.
- **Implementation scope:** The filter section of `css/modules/components.css`, the room filter rules in `css/modules/subpages.css`, and optionally the presentation-only `tabs` and `tabs__tab` classes in `rooms.html`. Keep unchanged: `rooms-filters`, `data-room-filter`, `aria-pressed`, IDs, the filter JavaScript behaviour and keyboard handling, grid layouts, and no-JavaScript gallery anchors. `js/features/tabs.js` is out of scope.
- **Acceptance criteria:**
  - At 390 px and 1280 px, in the light and dark themes, the selected filter is visibly distinct from both the default and the hovered filter without relying only on a border tint.
  - The selected style is driven by `aria-pressed` or `aria-current`.
  - No filter style depends on `aria-selected` or `.tabs__tab.is-active`.
  - Room filtering still hides non-matching cards.
- **Impact:** Medium
- **Effort:** Small

### IMP-UI-05 — Consolidate focus-visible styling into shared focus-ring tokens

- **Affected area:** Keyboard focus indicators across navigation, buttons, form fields, filters, cards, lightbox controls, footer and legal pages.
- **Evidence:** `css/modules/utilities.css:56-60`, `css/modules/tokens.css:8`, `css/modules/tokens.css:15`, `css/modules/components.css:69-72`, `css/modules/components.css:173-177`, `css/modules/components.css:409-412`, `css/modules/components.css:443-447`, `css/modules/components.css:692-695`, `css/modules/components.css:740-743`, `css/modules/components.css:890-893`, `css/modules/components.css:937-944`, `css/modules/layout.css:381-385`, `css/modules/layout.css:416-425`, `css/modules/layout.css:445-449`, `css/modules/sections.css:168-171`, `css/modules/sections.css:287-290`, `css/modules/subpages.css:224-228`
- **Current state:** The global `:where(…):focus-visible` rule draws a 2 px `--primary` outline with a 2 px offset. More than a dozen component rules override it with different values:
  - Colour: `--focus` (teal `#2dc7a6` in light) or `--primary` (blue `#0f6fbf` in light), some at 55–60% transparency.
  - Width and offset: 2 px or 3 px outlines, with 2, 3 or 4 px offsets.
  - Gallery items use a box-shadow ring instead of an outline.

  In the light theme, neighbouring controls therefore show different focus hues. Navigation and breadcrumb links use blue from the global rule; buttons, form fields and footer links use teal.

  Several rules are redundant or cannot take effect:
  - `.btn:focus-visible` appears twice in `components.css`, and the later rule overrides the earlier one.
  - `.benefit:focus-visible` targets a non-focusable `<article>`.
  - The testimonial `:focus-within` rule targets figures with no focusable descendants.
  - The footer has four overlapping focus rules.
  - The form-field rule uses the self-referencing fallback `var(--focus, var(--focus))`.
- **Proposed improvement:** Define focus-ring tokens (colour, width, offset) in `tokens.css`, with one ring colour per theme. Make the global `:focus-visible` rule their default consumer, keep component overrides only where the geometry must differ (for example card `:focus-within` rings), and remove duplicate and unreachable rules.
- **Expected value:** Keyboard focus looks the same on all pages and in both themes. Ring colour and weight can be tuned in one place, and the focus CSS becomes shorter and easier to audit.
- **Implementation scope:** `css/modules/tokens.css`, `css/modules/utilities.css`, and the focus rules in `components.css`, `layout.css`, `sections.css` and `subpages.css`. Keep unchanged: a visible indicator on every focusable control, the `--danger` invalid-field outline, the skip link, and the dialog focus management in JavaScript. Check the chosen ring colour against both themes' surfaces during implementation; this report makes no contrast claim.
- **Acceptance criteria:**
  - Every focus outline resolves to the focus tokens, with a single ring colour per theme.
  - `.btn:focus-visible` is defined once.
  - No focus rule targets non-focusable elements.
  - Keyboard traversal of `index.html`, `rooms.html`, `gallery.html` (including the open lightbox), `contact.html` and `regulamin.html` shows a visible ring at every stop.
  - `npm run test:a11y` reports no new violations when run.
- **Impact:** Medium
- **Effort:** Medium

## Selection summary

These five proposals were selected because each is visible in the source, applies to shared components used on several pages, and strengthens the existing token system rather than replacing it. IMP-UI-01, IMP-UI-03 and IMP-UI-04 were also confirmed in rendered captures.

Implementation dependencies:

- IMP-UI-03 and IMP-UI-04 both edit `.gallery-cats__link`, so implement them in sequence or together.
- IMP-UI-02 and IMP-UI-05 both touch `.btn` rules. The duplicated `.btn:focus-visible` belongs to IMP-UI-05 only.
- IMP-UI-01 is independent of the others.

Two further source-visible patterns were ranked lower and not included:

- Five card types (benefit, testimonial, offer, room, gallery item) repeat the same literal hover elevation instead of a token, and `.legal-card` references an undefined `--elev-soft`.
- The insets of section headers and intros (`--space-md`, `--space-sm`, `--space-lg`) differ from the flush edges of the content grids below them.

## Analysis limitations

- **Visual evidence:** captures were taken in headless Chromium from `file://` URLs, using a scratch browser profile that suppressed the project-notice dialog. They cover the light theme at 1280 px (index, rooms, offers, gallery, contact, regulamin) and 390 px (rooms). Hover states, the rendered dark theme and other browsers were not captured, so statements about dark-theme presentation are source-based.
- **Checks not run:** `npm run qa:fast` and `npm run test:a11y` were not run. `node_modules` is absent, and no dependencies were installed.
- **Out of scope — possible dark-theme defect:** the dark theme redefines `--primary` as `#34d1b2` but keeps the white `--primary-contrast` and does not redefine `--primary-alt`. From token values, white on `#34d1b2` calculates to about 1.9:1. This affects `.offer-card__badge` and the start of the `.btn--primary` gradient. It was not verified in a rendered dark theme and is a candidate defect for an audit, not a proposal in this report; IMP-UI-02 does not address it.
