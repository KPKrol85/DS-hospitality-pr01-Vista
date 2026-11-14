# Vista — Design Improvements

**Analysis date:** 2026-11-11  
**Completion date:** 2026-11-14  
**Project:** DS-hospitality-pr01-Vista  
**Scope:** Project-wide visual design of a demonstrational hospitality website  
**Status:** COMPLETED — all 9 selected design improvements implemented and verified.

## Implementation closure

The design-improvement cycle is complete (9/9 items). This record summarizes the original design assessment, the implemented outcomes, and the verification reported for each improvement. It is intended for historical reference in `docs/archive/improvements/`.

The approved **Vista Atlas** direction replaced repetitive catalogue-like compositions with image-led editorial layouts, a clearer Manrope/Inter typography hierarchy, and three material roles: **Ground** for static editorial content, **Frame** for photographs, and **Surface** for actionable elements. The work retained Vista's demonstrational identity, existing architecture, and relevant interaction, accessibility, theme, and PWA contracts.

## Original assessment and evidence

The original review examined the project's HTML pages, modular CSS, selected JavaScript presentation behavior, image assets, branding, documentation, and historical reports. Source inspection was supported by Chromium/Playwright renders and computed-style measurements, including 390, 800, 1280, and 1440 px viewports in light and dark themes. The initial evaluation made no changes to the project.

At the **time of the 2026-11-11 analysis**, the principal findings were a near-universal elevated-card visual language, insufficient typographic differentiation, underemphasized photography, repetitive content grids, and inconsistent visual storytelling. The report recommended the Vista Atlas editorial direction while preserving the established structure and interactions. These are historical findings, not claims about the completed implementation.

## Completed improvements

### IMP-DESIGN-01 — Establish an editorial type system with display, kicker, caption and spec voices

- **Status:** COMPLETED — implemented and verified.
- **Result:** Established the Manrope display hierarchy for section headings, a shared card-title scale, tracked Inter kicker labels, and tabular room-spec figures. Preserved the subpage heading hierarchy and existing document semantics.
- **Verification:** `npm run qa:fast`, `npm run build:css`, and `npm run test:a11y` (27 scenarios) passed. Browser checks across 12 pages at 320–1440 px and 200% zoom in both themes confirmed hierarchy, heading/ARIA preservation, font loading, and no overflow; the theme toggle and other browsers were not tested.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-02 — Replace the universal card with a three-role material language

- **Status:** COMPLETED — implemented and verified.
- **Result:** Established Ground for static editorial sections, Frame for photographs, and elevated Surface for actionable components. Removed hover elevation from static content while retaining relevant interactive affordances.
- **Verification:** `npm run build:css`, `npm run qa:fast`, and `npm run test:a11y` (27 scenarios) passed. Light/dark browser checks at 390 and 1280 px confirmed material roles, visible focus rings, no overflow at 320–1440 px, and no static hover rise under reduced motion; other browsers and assistive technologies were not tested.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-03 — Define a Vista photography system and asset brief

- **Status:** COMPLETED — implemented and verified.
- **Result:** Replaced the six key hero/room/About photographs and the 26 homepage/gallery photographs with approved masters and responsive JPEG, WebP, and AVIF variants, updating descriptions and gallery targets. Integrated approved 1200 × 630 and 1200 × 1200 social-sharing graphics, accurate image alternative text, and matching JSON-LD image captions.
- **Verification:** Image-optimization reruns, `qa:fast`, production builds, and `test:a11y` (27 scenarios) passed in the recorded phases; browser checks confirmed image presentation, filters, and lightbox behavior. Production-output checks confirmed image dimensions, metadata, and content equivalence; live social-platform previews and non-Chromium browsers were not verified.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-04 — Re-compose the homepage hero around one dominant photograph

- **Status:** COMPLETED — implemented and verified.
- **Result:** Rebuilt the homepage hero around a dominant framed photograph with a readable, theme-independent content scrim at desktop widths and a photograph-to-ink transition on mobile. Added a responsive 4:5 mobile crop and media-matched image preloads while preserving content and interaction order.
- **Verification:** `npm run qa:fast`, `npm run build`, `npm run test:a11y` (27 scenarios), and an idempotent image-optimization rerun passed. Browser checks at 320–1440 px, 200% zoom, and a short landscape viewport confirmed responsive layout, preload selection, no image layout shift, preserved focus order, and at least 5.75:1 measured text contrast; physical devices and assistive technologies were not tested.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-05 — Present rooms as image-led stays with a typographic spec line

- **Status:** COMPLETED — implemented and verified.
- **Result:** Presented the three rooms as full-width, ruled Ground entries with dominant 3:2 photographs, alternating desktop composition, display titles, and tabular spec lines. Rebuilt the homepage Luxury Room highlight as an asymmetric chapter while preserving the existing room filters, links, and content.
- **Verification:** `npm run qa:fast`, `npm run build`, and `npm run test:a11y` (27 scenarios) passed. Browser checks at 390–1440 px in light, dark, and auto verified image sizing, filter states, URL/history behavior, focus order, reduced motion, and no overflow at the tested zoom; physical devices and other browsers were not tested.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-06 — Lead offers with the occasion, not the discount

- **Status:** COMPLETED — implemented and verified.
- **Result:** Reordered the six offer-card presentations around the occasion, title, description, inclusions, discount, and CTA, and aligned the homepage teasers with the same kicker voice. Replaced prominent filled discounts with restrained tabular tags while preserving offer content and contact-prefill destinations.
- **Verification:** `npm run qa:fast`, `npm run build`, and `npm run test:a11y` (27 scenarios) passed. Browser checks at 390, 800, and 1280 px in both themes confirmed readable labels/discounts, unchanged offer-link prefill behavior, focus and heading order, and no card clipping; the theme toggle and assistive technologies were not tested.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-07 — Curate the galleries as sequenced, mixed-format mosaics

- **Status:** COMPLETED — implemented and verified.
- **Result:** Replaced uniform homepage and gallery layouts with sequenced responsive mosaics led by dominant photographs. Made the 20 gallery captions visible and associated them with image links while preserving filter, lightbox, and keyboard sequence contracts.
- **Verification:** `npm run qa:fast`, `npm run build`, and `npm run test:a11y` (27 scenarios) passed. Browser checks at 320–1920 px across light/dark/auto confirmed responsive mosaics, source/caption relationships, URL/filter and lightbox behavior, image selection, and no gallery overflow; screen-reader announcements and other browsers were not verified.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-08 — Give Vista a theme-stable accent and material palette

- **Status:** COMPLETED — implemented and verified.
- **Result:** Unified both themes around a Sea Blue accent family (`#155e82` light; `#7dbde4` dark), with coordinated buttons, focus styling, and restrained brass/sea background washes. Retained neutral surfaces, the logo, and error/success colors; corrected selected filter borders.
- **Verification:** `npm run qa:fast`, `npm run build`, and `npm run test:a11y` (27 scenarios) passed. Rendered checks at 390, 800, and 1280 px measured primary-button contrast of at least 6.91:1 (light) and 5.45:1 (dark), accent text of at least 4.65:1, and preserved focus/selection visibility; the separately noted neutral input-border contrast and metadata/manifest colors were outside this item.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-09 — Recompose "O nas" as an editorial brand story

- **Status:** COMPLETED — implemented and verified.
- **Result:** Enlarged the framed About photograph to three fifths of the desktop introduction, differentiated display and reading copy, and presented philosophy and values as numbered, ruled principles. Added a visually prominent duplicate of an existing statement, hidden from assistive technologies, and retained all three statistics as a restrained group while preserving headings, disclosures, and contact links.
- **Verification:** `npm run qa:fast` and `npm run build:css` passed. Browser checks at 320–1440 px in both themes found no overflow or card surfaces, text measures at or below 60ch, and unchanged heading/focus order; a focused axe run found no light-theme violations, while dark-theme background-detection flags also occurred on an unchanged page. The full `test:a11y` command, theme-toggle interaction, other browsers, and screen readers were not tested.
- **Impact:** Medium
- **Effort:** Medium

## Verification history and limitations

The initial 2026-11-11 design review used source inspection and browser-based measurements; it did **not** run `qa:fast`, `test:a11y`, `build`, or `img:opt`. Successful commands and browser checks listed in the nine records above were reported during their **subsequent implementation phases**, not during this archival redaction.

The implementation records document extensive Chromium and Playwright verification, but they do not establish live social-platform preview behavior, complete cross-browser/physical-device compatibility, or screen-reader validation. Individual qualifications—such as the `body::before` background-detection limitation in the focused About-page axe run—remain attached to the relevant item.

The review also raised decisions and observations outside the nine approved design tasks, including the brand mark and photography provenance. This closure does not claim that every broader content, legal, branding, or release-readiness question was resolved. Those matters belong to separately approved work.

## Archive record

**Final disposition:** COMPLETED — 9 of 9 design improvements implemented and verified according to the recorded task evidence.  
**Historical source:** Original design analysis dated 2026-11-11.  
**Intended archive location:** `docs/archive/improvements/IMPROVEMENTS-DESIGN-2026-11-11.md`.  
**Editorial verification:** No new application build, test, browser review, or deployment was performed as part of this document preparation.
