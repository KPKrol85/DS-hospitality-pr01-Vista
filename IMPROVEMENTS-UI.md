# Vista — UI Improvements

**Analysis date:** 2026-09-28
**Project type:** Static multi-page website (HTML, modular CSS, vanilla JavaScript) with a Node.js build pipeline and Netlify configuration
**Analysis mode:** Evidence-based UI improvement review
**Focus:** Project-wide UI

## Improvement overview

Vista's interface is built on one token file (fluid type scale, spacing, radius, theme colours and focus-ring tokens), BEM-style components and shared state patterns across 12 root pages. The five proposals in the archived UI report (`docs/archive/improvements/IMPROVEMENTS-UI-2026-09-26.md`) are implemented in the current source. No active plan or audit covers UI work.

The remaining opportunities lie below the heading level and in layout consistency:

- Descriptive copy uses two type steps with no role rule.
- The header gives the current page the same style as a hovered link.
- The contact form gives values, labels and hints conflicting emphasis.
- Section text and content grids start at different inline edges.
- Several fixed-count grids end with a partial row at common widths.

Each proposal applies existing tokens and patterns more consistently and keeps the current visual identity. All five were confirmed with computed values in Chromium.

## Proposed improvements

### IMP-UI-01 — Map descriptive card and section copy to one supporting-text step

- **Status:** COMPLETED (2026-09-29)
- **Affected area:** Descriptive paragraphs, lists and metadata in these places:
  - `index.html`: benefits, room and offer cards, the highlight block, testimonials and the CTA panel;
  - `offers.html`: offer cards;
  - `rooms.html`: room cards;
  - `onas.html`: brand cards and stats.
- **Evidence:** `css/modules/base.css:5-17`, `css/modules/tokens.css:40-51`, `css/modules/sections.css:180-184`, `css/modules/sections.css:211-218`, `css/modules/sections.css:269-278`, `css/modules/components.css:771-777`, `css/modules/components.css:822-827`, `css/modules/components.css:957-963`, `css/modules/subpages.css:32-47`, `css/modules/subpages.css:107-113`, `css/modules/subpages.css:158-163`, `css/modules/subpages.css:272-277`, `css/modules/subpages.css:310-316`, `css/modules/subpages.css:330-334`, `offers.html:153-164`, `onas.html:184-203`
- **State before implementation:** Body text uses `--fs-400`, which is 16 px at a 390 px viewport and 17.4 px at 1280 px. The legal pages also use this size for their paragraphs. Descriptive copy in the other components uses two smaller steps without a role rule:
  - `--fs-200` (12.8 px at 390 px, 13.4 px at 1280 px): benefit text, room card metadata and text, offer card text, CTA text, the highlight bullet list, the two-sentence brand card paragraphs and stat labels.
  - `--fs-300` (14.4 px at 390 px, 15.0 px at 1280 px): the highlight paragraph, testimonial quotes, the offer card eyebrow and bullet list, and the brand lead.

  Chromium at 1280 px measured two inversions:
  - On `offers.html`, each offer card's description (13.4 px) is smaller than its uppercase eyebrow and its bullet list (both 15.0 px).
  - In the homepage highlight block, the paragraph (15.0 px) is larger than the list after it (13.4 px).
- **Proposed improvement:** Define a size role for each kind of non-heading text, using the existing type scale, and apply it in all these components:
  - Descriptive paragraphs and bullet lists share one step of at least `--fs-300`.
  - Metadata, attributions and stat labels use one smaller step (`--fs-200`).
  - Lead text (hero subtitle, section intro, brand lead) stays at or above the description step.

  Within a component, the description is never smaller than its eyebrow or list. Optionally, add two role aliases in `tokens.css` that point to existing steps.
- **Expected value:** Descriptive text is the same size on every page. In offer cards and the highlight block, text size follows content importance. New components have a documented size to use instead of an ad hoc step. No new type steps or fonts are needed.
- **Implementation scope:** The cited rules in `sections.css`, `components.css` and `subpages.css`, and optionally two aliases in `tokens.css`. No markup changes. Keep unchanged:
  - the heading sizes set by the completed heading-tier work, and the hero title;
  - buttons, badges, the breadcrumb, the footer and the legal pages;
  - the contact form (IMP-UI-03);
  - line heights, colours, card layouts and button alignment.
- **Acceptance criteria:**
  - At 390 px and 1280 px, `.benefit__text`, `.room-card__text`, `.offer-card__text`, `.offer-card__list`, `.highlight p`, `.list`, `.cta-text`, `.testimonial__quote` and `.brand__text` share one computed font size, at least the computed `--fs-300`.
  - `.room-card__meta`, `.testimonial__author` and `.brand__stat-label` share one smaller computed size.
  - In every offer card, the description is at least as large as the card's eyebrow and list.
  - At 390, 800 and 1280 px, card grids keep their column counts and card buttons keep their alignment. No text overflows.
- **Impact:** High
- **Effort:** Medium

- **Completion:** Added `--fs-supporting: var(--fs-300)` and `--fs-meta: var(--fs-200)` in `tokens.css`. All nine descriptive selectors in the acceptance criteria use the supporting role; room metadata, testimonial attributions, brand stat labels and offer eyebrows (`.offer-card__meta`) use the metadata role. `.list` occurs only in the homepage highlight block. Lead sizes remain unchanged; offer descriptions match their lists and exceed their eyebrows, and the highlight paragraph and list share one size. Only font-size references and the two aliases changed; HTML, JavaScript, headings, buttons, badges, form/legal typography, line-height declarations, colours, spacing and layout rules are unchanged.
- **Verification:** Local source-mode Playwright/Chromium measurements before and after the change passed on `index.html`, `offers.html`, `rooms.html` and `onas.html` at 390, 800 and 1280 px (12 page/viewport combinations). Supporting sizes: 14.4 / 14.688 / 15.0336 px; metadata: 12.8 / 13.056 / 13.3632 px. Role sizes, lead hierarchy, both resolved inversions, unchanged grid column counts, button horizontal positions and offsets from card bottoms passed; no in-scope text or page overflow was detected. Existing automatic grid stretching changes some button heights as text reflows, while typography and alignment remain unchanged. `npm run build` passed (12 HTML pages), all four `qa:fast` checks passed, and `git diff --check` passed. Non-blocking warnings: old Browserslist data and Node module-type detection. No `test:a11y`, other-browser, production-browser or live-deployment checks were run; all required verification was available.

### IMP-UI-02 — Give the current navigation link a state distinct from hover

- **Status:** COMPLETED (2026-09-29)
- **Affected area:** The shared header navigation on all 12 root pages, in the desktop bar (from 961 px) and the mobile menu panel.
- **Evidence:** `css/modules/layout.css:112-126`, `css/modules/layout.css:133-138`, `css/modules/layout.css:152-164`, `css/modules/layout.css:425-429`, `css/modules/components.css:883-901`, `css/modules/tokens.css:3-4`, `css/modules/tokens.css:19-20`, `css/modules/tokens.css:32-33`, `js/features/aria-current.js:11-17`
- **State before implementation:** One rule gave the current-page link and any hovered link the same `--bg-elev` background and `--elev` shadow (`0 10px 30px rgba(0, 0, 0, 0.06)`). All links had the same text colour and weight. On `contact.html` at 1280 px, hovering "Pokoje" produced computed styles identical to the current "Kontakt" link.

  The current link differed from the others only by a small surface change:
  - In the light theme, a white background on the `#faf8f3` header and menu background, about 1.06:1.
  - In the dark theme, `#141a24` on `#0a0d11`, about 1.12:1. The black 6% shadow is not visible there.

  Two rules declared the current state. The second also targeted `.is-active`, which `aria-current.js` adds alongside `aria-current`.

  Other site components already separate selected and hover states. The footer marks its current link with `--primary`. The room and gallery filters use a selected style that differs from hover.
- **Proposed improvement:** Give `a[aria-current="page"]` its own style that stays recognisable while another link is hovered. Use existing tokens, for example a primary-tinted text colour, a heavier weight or an indicator line, consistent with the footer and filter selected states. Keep hover as a lighter preview. Declare the current state in one rule keyed to `aria-current`.
- **Expected value:** Visitors can see the current section at a glance on every page, in both themes and in the mobile menu. The header's selected state matches the site's other selected-state patterns, and one rule defines it.
- **Implementation scope:** The navigation rules in `css/modules/layout.css`. No markup or JavaScript changes. `aria-current.js` can keep adding `is-active`.

  Keep unchanged:
  - link order and labels, pill shape and spacing, and compact-header sizing;
  - the mobile menu's opening, closing and focus handling, and the 960/961 px boundary;
  - the no-JavaScript navigation, the header CTA, the focus ring and the footer.

  During implementation, check any new text colour against both header backgrounds. This report makes no contrast claim.
- **Acceptance criteria:**
  - These conditions hold on `index.html`, `rooms.html`, `offers.html`, `gallery.html`, `onas.html` and `contact.html`, at 1280 px and at 390 px with the menu open, in the light and dark themes:
    - The current link differs from a hovered link in at least one computed property other than `background-color` and `box-shadow`.
    - Hovering a non-current link never produces computed styles identical to the current link.
  - A single selector group keyed to `aria-current="page"` styles the current state.
  - Pages without a current header link render as before: the legal pages, `404.html`, `offline.html` and `dziekujemy.html`.
- **Impact:** Medium
- **Effort:** Small
- **Completion summary:** Separated header hover and current-page states: hover now applies only to non-current links, while `aria-current="page"` uses `var(--primary)` for a persistent selected state. Header CSS no longer depends on `.is-active`.
- **Verification:** Chromium checks passed at 390 px and 1280 px in light and dark themes across the target pages; current-link contrast passed in both themes, header geometry remained unchanged, and `npm run build`, `npm run qa:fast` and `git diff --check` passed.

### IMP-UI-03 — Unify contact form value, label and hint presentation

- **Status:** COMPLETED (2026-09-29)
- **Affected area:** The contact inquiry form on `contact.html`:
  - the text, email, telephone, date and number inputs, and the textarea;
  - the field labels and the stay-date fieldset legend;
  - the hints and the consent label.
- **Evidence:** `css/modules/components.css:151-171`, `css/modules/components.css:192-205`, `css/modules/components.css:218-222`, `css/modules/components.css:240-250`, `contact.html:227-281`
- **State before implementation:** Measured in Chromium at 1280 px, where body text is 17.4 px:
  - Values in the text, email, telephone and date inputs and the textarea are 13.4 px (12.8 px at 390 px). They use weight 400, full text colour and 0.04em letter spacing.
  - The guest count is pre-filled with "2" (`contact.html:274`) and renders at 70% text opacity and weight 500. It looks different from every other value and similar to the placeholder style (`--muted` at 0.7 opacity).
  - Field labels are 13.4 px at 75% text opacity. The arrival and departure labels in the fieldset use `--muted` instead. The "Termin pobytu" legend is 15.0 px in `--muted`.
  - Hints such as "Minimum 2 znaki." and "Zakres 1–6." are 11.7 px in full text colour. They are smaller than the labels but darker.
- **Proposed improvement:**
  - Give every control that holds a value one value style: the same size, weight and full text colour. Placeholders stay visibly distinct.
  - Use one label style for the field labels, the date labels and the legend. The legend can keep its group emphasis through weight, not a different colour.
  - Make hints clearly subordinate to labels in colour and size.
  - Base control text on the body text size, so fields are not smaller than the surrounding text.
- **Expected value:** Entered and pre-filled values read as values, not as hints or placeholders. In every field of the site's only data-entry journey, labels, values and hints have the same order of emphasis.

  iOS Safari zooms the page when a text field smaller than 16 px receives focus. This is known platform behaviour, not tested on a device for this report. Control text of 16 px or more avoids it.
- **Implementation scope:** The form rules in `css/modules/components.css`. No markup changes. Keep unchanged:
  - the invalid-state border and outline, and the `.form__error` colours (see Analysis limitations);
  - the focus-ring tokens and the autofill rule;
  - disabled and read-only states and the checkbox size;
  - the honeypot, native constraints and Netlify attributes;
  - the `.form__note` text and the form's width and layout.
- **Acceptance criteria:**
  - At 390 px and 1280 px, in the light and dark themes:
    - `#name`, `#email`, `#phone`, `#checkin`, `#checkout`, `#guests` and `#message` have the same computed font size, weight and colour.
    - That colour differs from the placeholder colour.
  - The computed font size of each control is at least the computed body font size.
  - All field labels, including those for `#checkin` and `#checkout`, share one computed colour and size. The legend uses the same colour.
  - Every `.form__hint` has a muted computed colour and is no larger than its label.
  - Enhanced and native validation, error display, focus on the first invalid field and submission all work as before.
- **Impact:** Medium
- **Effort:** Small
- **Completion summary:** Unified form values at `--fs-400` in full text colour, labels and legend at `--fs-200` in muted colour, and hints at `--fs-100` in muted colour; removed the guest-count override while keeping placeholders distinct.
- **Verification:** Chromium checks at 390 px and 1280 px in both themes, focused validation regression, `npm run build`, `npm run qa:fast` and `git diff --check` passed.

### IMP-UI-04 — Align section headings, intros and copy to the content grid edge

- **Status:** COMPLETED (2026-09-30)
- **Affected area:**
  - section headers and intros on `index.html`, `rooms.html`, `offers.html`, `gallery.html` and `onas.html`;
  - the homepage highlight block and testimonials.
- **Evidence:** `css/modules/layout.css:1-4`, `css/modules/sections.css:211-215`, `css/modules/sections.css:227-230`, `css/modules/sections.css:246-263`, `css/modules/sections.css:337-349`, `css/modules/subpages.css:20-28`, `css/modules/subpages.css:341-343`, `css/modules/subpages.css:359-361`
- **State before implementation:** From 760 px, content grids start at the container edge, but the text above them is indented by different spacing tokens:
  - `--space-md` for section headers, gallery section titles and brand subtitles;
  - `--space-sm` for section intros;
  - `--space-lg` for the highlight paragraph and its button.

  Testimonial cards also have a `--space-xs` margin on each card, on top of the grid gap. Chromium at 1280 px measured these left edges (x positions); the container edge is at x = 33:
  - `index.html`:
    - room, offer and gallery grids, and the highlight image: 33;
    - testimonial cards: 41;
    - section titles: 49;
    - highlight paragraph and button: 694, while the highlight list starts at 669.
  - `offers.html`: cards at 33, the intro at 45 and the `h1` at 49.
  - `rooms.html`, `gallery.html` and `onas.html`: grids at 33, and the `h1` and section titles at 49.
- **Proposed improvement:** From 760 px, apply one inline-alignment rule to all sections. Headings, intros and body copy start at the same edge as the grid or media below them, or at one shared inset token applied to both. This rule replaces the individual component insets and the per-card testimonial margin.
- **Expected value:** Each section reads as one aligned block, and text lines up with content the same way on every page. One rule controls alignment instead of five separate spacing choices.
- **Implementation scope:** The cited rules. Keep unchanged:
  - centred alignment below 760 px;
  - the `.section-header` flex layout with the right-aligned `.btn--link`;
  - heading accent lines and `scroll-margin-top`;
  - the contact page's centred header override (`css/modules/subpages.css:440-449`);
  - the hero, the legal card and all vertical spacing.
- **Acceptance criteria:**
  - At 800 px and 1280 px on the five listed pages, each section's title, intro and first grid item or media start at the same left edge. Alternatively, they differ by exactly one shared inset token, applied the same way on every page.
  - The highlight paragraph, list and button start at the same left edge.
  - Homepage testimonial cards start at the same edge as the other homepage grids. The space between them comes only from the grid gap.
  - The layout at 390 px is unchanged.
- **Impact:** Medium
- **Effort:** Small
- **Completion summary:** Removed desktop/tablet insets from section text, gallery and brand headings, and homepage highlight content; testimonial cards now use the grid gap for spacing. The 390 px layout remains unchanged.
- **Verification:** Chromium checks at 390, 800 and 1280 px, `npm run build`, `npm run qa:fast` and `git diff --check` passed.

### IMP-UI-05 — Choose grid column counts that divide each grid's item count

- **Affected area:**
  - the room, offer, testimonial and gallery grids on the homepage;
  - the five category grids on `gallery.html`;
  - the three `.grid-3` groups on `onas.html`;
  - the unfiltered room grid on `rooms.html`.
- **Evidence:** `css/modules/utilities.css:69-91`, `css/modules/components.css:678-721`, `css/modules/sections.css:246-250`, `css/modules/subpages.css:68-81`, `index.html:260`, `index.html:458`, `index.html:498`, `index.html:525`, `gallery.html:163`, `gallery.html:341`, `gallery.html:519`, `gallery.html:697`, `gallery.html:875`, `onas.html:182`, `onas.html:210`, `onas.html:232`, `rooms.html:166`
- **Current state:** Each grid class sets its column counts per breakpoint without regard to how many items the grid holds. As a result, several grids end with a partial last row. Chromium measured these row patterns:
  - `index.html`:
    - The 4 offer cards use 3 columns from 1024 px and render 3 + 1 at 1280 px.
    - The 6 gallery photos use 4 columns and render 4 + 2 at 1280 px.
    - The 3 room cards use 2 columns from 480 to 1023 px and render 2 + 1 at 600, 800 and 1000 px.
    - The 3 testimonials render 2 + 1 at 600 px.
  - `gallery.html`: each of the five 4-photo sections uses 3 columns from 760 to 1023 px and renders 3 + 1 at 800 px.
  - `onas.html`: each 3-item `.grid-3` group renders 2 + 1 at 800 px.
  - `rooms.html`: the unfiltered 3-card grid renders 2 + 1 at 700 px.

  In each 3 + 1 and 2 + 1 case, the last item sits alone in one column, next to empty tracks.
- **Proposed improvement:** For grids with a fixed item count in the markup, use column counts that divide that count at each breakpoint. For example, four items go from 1 to 2 to 4 columns, and three items go from 1 to 3 columns. Alternatively, a trailing item can span the remaining tracks. Implement this with modifiers of the existing grid classes or with count-aware selectors, not page-specific overrides. Keep the current minimum card widths.
- **Expected value:** At common tablet and desktop widths, card and photo rows end evenly, so sections look complete. The same rule still works if the number of items in a grid changes.
- **Implementation scope:** Grid rules in `utilities.css`, `components.css`, `sections.css` and `subpages.css`. Where selectors alone are not enough, add modifier classes to the listed containers. Keep unchanged:
  - gap tokens, card contents and `data-reveal` behaviour;
  - gallery category filtering, lightbox item order and position counts;
  - room filtering. A filtered `rooms.html` grid shows fewer cards by design and is exempt.
- **Acceptance criteria:**
  - At 390, 600, 700, 800, 1000 and 1280 px, no listed grid in its unfiltered state ends with a single-item row, unless that item spans the full row.
  - The last row of the homepage gallery is complete at 1280 px.
  - No card becomes narrower than its current minimum: 280 px on `rooms.html`, 300 px for `.grid-3` and 240 px for testimonials.
  - No horizontal overflow appears.
  - Room and gallery filtering work as before.
- **Impact:** Medium
- **Effort:** Medium

## Selection summary

These five proposals were selected because each one:

- is based on source rules shared by several components or pages;
- was confirmed with computed values in Chromium;
- reuses existing tokens and state patterns without changing the visual identity.

Dependencies:

- IMP-UI-04 and IMP-UI-05 both edit the homepage testimonial grid (the `.testimonials` gap and columns, and the `.testimonial` margin). Implement them one after the other.
- IMP-UI-01 excludes the contact form, which IMP-UI-03 covers. The two can be implemented independently.
- IMP-UI-02 is independent of the others.

One opportunity was ranked lower and not included: hover elevation on static cards.

- Benefits, testimonials, the CTA panel and the `rooms.html` room cards lift on hover like the interactive offer and gallery cards. The `rooms.html` room cards contain no focusable element.
- A Chromium hover check on a `rooms.html` card confirmed the lift, the stronger shadow and the tinted border.
- Five rules repeat the same literal hover lift and shadow, and the CTA panel uses a sixth variant (`css/modules/sections.css:160-164`, `css/modules/components.css:928-932`, `css/modules/components.css:813-817`).
- `.legal-card` references an undefined `--elev-soft` (`css/modules/subpages.css:100`).

## Analysis limitations

- **Browser evidence:**
  - The project's `scripts/dev-server.mjs` served the pages in source mode. They were inspected in Chromium (the Claude desktop browser pane) at 390, 600, 700, 800, 1000 and 1280 px.
  - All values come from computed styles and element geometry. The browser pane was hidden, so no screenshots were captured, and statements about appearance rely on these measurements.
  - Dark-theme values were read after setting `data-theme="dark"` in the page, with transitions suppressed during measurement.
  - Hover was tested on one navigation link and one room card.
  - Other browsers, real devices (including the iOS behaviour cited in IMP-UI-03) and assistive technologies were not tested.
- **Checks not run:** `npm run qa:fast`, `npm run test:a11y` and the build were not run, because no project source was changed.
- **Out of scope — candidate defects observed:** These belong in an audit, not in this report.
  - **Primary colour in the dark theme:** white `--primary-contrast` on the dark `--primary` (`#34d1b2`) computes to 1.93:1. This affects `.offer-card__badge` and the start of the `.btn--primary` gradient (`css/modules/tokens.css:8-10`, `css/modules/tokens.css:111-122`). The archived 2026-09-26 report first noted this, and it is still present.
  - **Form errors in the dark theme:** `.form__error` outside the date fieldset uses the literal colour `#b91c1c` (`css/modules/components.css:181-184`). Against the dark page colour `#0a0d11`, this computes to about 3.0:1, not counting the background gradient. Only the errors inside the fieldset use the theme-aware `--form-error-text-elevated`. For this reason, IMP-UI-03 leaves error colours unchanged.
  - **Homepage gallery markup** (`index.html:525-736`):
    - The images declare `width="800" height="800"` for 3:2 files.
    - Their `w` descriptors are half the actual file widths.
    - The `<source>` elements have no `sizes` attribute.

    At 1280 px, each tile reserves a 285 × 285 px box until its image loads, then shrinks to 285 × 190 px. Each tile loads the 1600 px AVIF.
  - **Contact page decoration:** `.contact-info::after` is placed at fixed offsets of 130 px and 520 px (`css/modules/subpages.css:400-411`). At 390 px, it overlaps the map caption and the form heading, at opacity 0.1 in the light theme and 0.25 in the dark theme.
  - **Gallery scrolling:** gallery filter scrolling still uses `behavior: "smooth"` without a reduced-motion check (`js/features/gallery-filters.js:66-80`). The archived UX report also noted this.
