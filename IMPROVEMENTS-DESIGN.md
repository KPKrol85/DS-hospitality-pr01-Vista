# Vista — Design Improvements

**Analysis date:** 2026-11-11
**Project type:** Demonstrational static multi-page website for a fictional hospitality brand (HTML, modular CSS, vanilla JavaScript; Node.js tooling; Netlify configuration)
**Status:** Proposed — awaiting owner review; no implementation authorized
**Analysis mode:** Evidence-based creative design review
**Focus:** Project-wide design

## 1. Methodology and evidence

- **Documentation reviewed:** `README.md`, `docs/CHANGELOG.md`, `docs/VISTA-PRE-RELEASE-CHECK.md`, the archived UI reports (`docs/archive/improvements/IMPROVEMENTS-UI-2026-09-26.md`, `IMPROVEMENTS-UI-2026-09-30.md`), the archived UX report (`IMPROVEMENTS-UX-2026-09-27.md`), and the 2026-10-02 plan and audit archives. No root `PLAN.md`, `AUDIT.md`, `REVIEW.md` or active `IMPROVEMENTS-*.md` exists. No earlier design report exists in the root or the archive.
- **Source reviewed:** all CSS modules (`tokens`, `base`, `layout`, `components`, `sections`, `subpages`, `utilities`, `motion`, `themes`). The content areas of `index.html`, `rooms.html`, `offers.html`, `gallery.html`, `onas.html` and `contact.html`. The reveal, compact-header and lightbox modules. The logo, favicon and icon-sprite SVGs. The photographs in `assets/img/src/` and `assets/img/optimized/`.
- **Runtime and visual evidence:** `node scripts/dev-server.mjs` served the source pages. They were rendered in headless Chromium through the installed Playwright package, using scratch scripts outside the repository, and in the desktop browser pane for computed styles.
  - Full-page captures: `index.html` at 390, 800 and 1280 px (light) and at 1280 px (dark); `rooms.html`, `offers.html`, `gallery.html`, `onas.html` and `contact.html` at 1280 px (light).
  - First-viewport captures: `regulamin.html` and `dziekujemy.html` at 1280 px (light), `404.html` at 1280 px (dark).
  - Geometry and computed type sizes were measured at 390, 800, 1280 and 1440 px in both themes.
  - Photographs were inspected through contact sheets and full-resolution corner crops.
- **Direct visual inspection:** performed.
- **Evidence labels:** `Source`, `Runtime`, `Visual`, `Historical`, `Design judgment`.
- **Capture note:** in full-page screenshots, the fixed `body::before` background covers only the first viewport. This is a capture artefact, not a finding.

## 2. Executive design assessment

**Strengths worth keeping.** The light edition is warm and restrained: a `#faf8f3` ground with a soft gold radial wash. The Manrope/Inter pairing is self-hosted, and all four weights load at runtime. Details are refined: the tracked uppercase tagline and the gradient hairline under headings. The token system is coherent, the dark edition holds together, and the accessibility, theme and interaction contracts were recently verified.

**Principal limitation.** Nearly everything uses one idiom, a white rounded card with a border and a shadow. The homepage alone has 21 of them across six component types. Typography stops at a 19.6 px section heading above 17.4 px body text. Every section therefore carries the same weight. Photography, the brand's richest material, appears as thumbnails inside cards. Design judgment: with the logo removed, nothing would distinguish Vista from a well-built generic hotel template.

**Secondary limitation.** The brand story is split, visually and verbally:

- city-hotel copy;
- tropical-resort imagery and a palm-and-sunset logo;
- photographs of mixed grade, with the logo burned into them.

**Opportunity.** Existing copy already presents Vista as a curated selection: "Starannie wyselekcjonowane hotele i miejsca wypoczynku" (hero) and "starannie wybranych lokalizacjach" (footer). An editorial, image-led "travel journal" direction can turn this content and the best photographs into a recognisable identity. It keeps the architecture, tokens and interaction contracts. **Recommended direction:** *Vista Atlas* (section 6).

## 3. Current design identity

### Brand and first impression

- **Runtime (1280 px):**
  - The `h1` reads "Vista" (47.3 px), followed by the tracked "HOTELS & TRAVEL" line (15.0 px).
  - The positioning sentence is 15.0 px in `--muted`, smaller than body text.
  - The lobby photograph is framed at 541 × 304 px, about 45% of the 1200 px container. The hero is 516 px tall in an 800 px viewport.
- **Source:** the logo (`assets/img/logo/*.svg`) shows palm trees, a sunset and the sea in `#f69d1f` and `#4181c3`. The UI accent is `#0f6fbf` (light) and `#34d1b2` (dark); `msapplication-TileColor` is `#2dc7a6`. The largest instance of the mark is in the footer, at about 120 px.
- **Design judgment:** the first impression is a brand name next to a stock-style image, not a proposition. The sentence that defines Vista is the quietest text in the hero. The mark's tropical, clip-art vocabulary connects neither to the UI palette nor to the city-hotel copy.

### Typography and editorial hierarchy

- **Runtime (1280 px):** hero title 47.3 px; homepage section titles 19.6 px; room and benefit titles 17.4 px, the same as body; supporting text 15.0 px. Section titles are 1.13 × body size. `--fs-900`/`--fs-1000` appear only in the hero, so the homepage has no tier between 47 px and 19.6 px.
- **Historical:** the archived IMP-UI-01 (2026-09-26) established the `h1 > h2 > h3 ≥ body` order. That order is preserved and not proposed again here.
- **Strength:** the tracked uppercase label voice (hero tagline, `.offer-card__meta`, footer headings) is distinctive but underused.

### Composition and rhythm

- **Source/Visual:** the homepage runs hero → benefits (4 cards) → rooms (3 cards) → "Luxury Room" highlight → offers (4 cards) → testimonials (3 cards) → gallery (6 equal tiles) → CTA card. Each section has the same left heading with a hairline, the same container width and the same `--space-3xl` padding.
- **Design judgment:** the composition is consistent but monotone. The featured-room chapter is composed like the catalogue around it. The page has no deliberate moments of emphasis or quiet.

### Color and material language

- **Source:** `.benefit`, `.testimonial`, `.offer-card`, `.room-card`, `.gallery-grid__item`, `.cta-panel`, `.brand__card` and `.brand__stat` all combine `--bg-elev`, a 1 px `--border`, `--radius-md` and `--elev`.
  - Hover lifts apply to non-interactive surfaces too: `.benefit:hover`, `.section--cta .cta-panel:hover`, and `.room-card:hover` on `rooms.html`, where the cards contain no control.
  - The hover shadow `0 8px 20px rgba(0, 0, 0, 0.15)` is repeated as a literal value.
  - `.legal-card` references an undefined `--elev-soft`.
- **Historical:** the archived 2026-09-30 UI report ranked hover elevation on static cards lower and did not act on it.
- **Runtime:** `--primary` is `#0f6fbf` in light and `#34d1b2` in dark. The dark primary gradient runs from `#0b7564` to `#0a5ca0`.
- **Design judgment:** each edition is coherent on its own, but the accent changes hue between themes (blue → mint). Neither accent relates to the gold ground, the mark or the photography, so the brand has no stable colour signature. Elevation no longer signals what can be used.

### Imagery and visual storytelling

- **Visual:**
  - **Rooms:** the room photographs differ in grade. Classic is bright and warm, Deluxe dark and cool, Luxury Suite bright and neutral.
  - **Homepage gallery:** a reception-desk staff photograph, a villa pool at dusk, a bathroom, a corridor, a Mediterranean terrace and a garden villa pool.
  - **"Okolica" category:** palm-lined pools, overwater bungalows and a palm beach.
  - **Watermark:** a palm-and-sunset badge is burned into the bottom-right corner of the photographs. It was confirmed at full resolution in the `hero-01`, `classic`, `gallery-02` and `okolica-03` source files and is visible on most room and gallery photographs in the contact sheets.
  - **About image:** `wnetrze-hotelu-vista.png` carries no badge. Its warm, soft, architectural light suits the light theme best.
- **Source:** the `hero-*` variants in `assets/img/optimized/hero/` (a beach and suitcase scene) are not referenced by any page.
- **Design judgment:** the photographs share no light, palette, geography or crop logic, so they do not tell one story.

### Components, iconography and motion

- **Source:** pill buttons with a gradient primary and a tinted secondary; the offer discount pill is the only solid-accent element in each offer card. The 15-symbol sprite uses consistent 2 px line icons. Motion is limited to the reveal (fade and a 10 px rise, aware of reduced motion), hover lifts, and a 1.03 hero image scale on fine pointers.
- **Design judgment:** the restraint is right. Only the use of lift on static surfaces is a problem.

### Responsive art direction

- **Runtime (390 px):**
  - The hero image is 358 × 201 px, followed by centred text and stacked CTAs.
  - The homepage is 10,144 px tall. The gallery takes 2,456 px for six full-width tiles; rooms take 1,401 px, offers 1,184 px and testimonials 977 px.
- **Runtime (800 px):** the hero is 885 px tall.
- **Design judgment:** mobile is the desktop collapsed to one column, with no mobile-specific crop, density or sequence.

### Closing composition and supporting pages

- **Source/Visual — closing:** the same CTA panel closes `index.html`, `offers.html` and `onas.html`. The footer follows, with the mark at about 120 px, four columns, a social row and the demonstration disclosure. `rooms.html` ends after three short cards, at 1523 px total height (1280 px).
- **Source/Visual — `onas.html`:** an intro with an image, then three rows of three equal boxes. The stats row includes "Premium" as a value.
- **Source/Visual — utility pages:** the legal card and the 404/offline/thank-you layouts are proportionate and need no bespoke treatment.
- **Design judgment:** the closing is truthful but generic. The rooms and about pages repeat the catalogue idiom where a narrative is expected.

## 4. Design prerequisites

| Prerequisite | Evidence | Follow-up boundary |
| --- | --- | --- |
| The brand narrative is undecided: a single city hotel or a curated collection of places | Source: `index.html` benefit "W samym sercu miasta…"; `offers.html` "Biznes w mieście" and "Rodzinny city break … blisko centrum". The hero speaks of "Starannie wyselekcjonowane hotele i miejsca wypoczynku" and the footer of "starannie wybranych lokalizacjach". The `gallery.html` "Okolica" captions are tropical, the logo shows palm trees and sea, and the OG alt text reads "hotel z widokiem na morze". | Owner decision before IMP-DESIGN-03, -04, -05, -07 and -09 are finalised. Copy changes are separate content work. |
| Image alternative text and captions do not describe several photographs | Source/Visual: in the `index.html` gallery, `gallery-01` ("Lobby…") shows reception staff and a guest. `gallery-02` ("Pokój dwuosobowy…") shows a pool at dusk. `gallery-03` ("Restauracja…") shows a bathroom. `gallery-04` ("Strefa relaksu…") shows a corridor. `gallery-05` ("Panorama miasta…") shows a terrace restaurant with a pool. In `gallery.html`, item 4 of every category repeats item 1's `data-caption` and `alt` but shows a different photograph. | Content and accessibility correction through a separately authorised audit or plan task. Required before IMP-DESIGN-07 makes captions visible. |
| Photographs carry a burned-in brand mark, and their provenance is undocumented | Visual: a badge in the bottom-right corner of the sampled source and optimised photographs. Source: `README.md` has only a general third-party licence statement; no asset provenance record was found. | Owner to confirm the rights and supply clean or approved sources before large-format use (IMP-DESIGN-03, -04, -07). |

No font-loading, theme-rendering or layout defect blocks design evaluation. All four font files load, and both themes render as intended.

## 5. Creative design directions

| Dimension | A — Vista Atlas (curated travel editorial) | B — Quiet Address (single urban residence) | C — Sun & Horizon (coastal leisure brand) |
| --- | --- | --- | --- |
| Philosophy | Vista as a curated collection of places; each page is a chapter of a travel journal. Photography leads, and type narrates. | One calm city hotel. Architecture, stillness and discretion. | Leans into the existing mark: sun, sea, horizon, holiday ease. |
| Typography | Manrope 700 display lines from the existing upper scale, tracked Inter kickers, and caption and spec styles. | A small display tier, generous whitespace, mostly Inter. | Large, friendly display; a lighter tone. |
| Color / material | The existing warm paper ground, ink text and one deep accent. Few elevated surfaces; hairline rules. | Stone and sand neutrals, brass accent, near-monochrome. | Logo orange and sea blue, sunlit whites. |
| Composition | Wide image chapters alternate with quiet text bands; asymmetric features; mixed-format mosaics. | Strict symmetric grid with architectural framing. | Full-bleed horizon images and open layouts. |
| Imagery | Consistent warm natural light; establishing views plus details. City and coast can coexist under "collection". | Interiors and architecture only; the tropical sets are removed. | Resorts, pools and beaches. |
| Motion | The existing reveal only. | Minimal. | Pressure towards more expressive motion (a risk). |
| Mobile | Dedicated crops, compact chapters, 2-up mosaics. | Quiet single column. | Image-first full bleed. |
| Advantages | Fits the existing hero and footer copy and "Hotels & Travel". Reconciles the mixed geography. Uses the current stack and tokens. | Strongest match with the lobby and about imagery and with the city and business offers. | Matches the logo and the "Okolica" imagery. Instantly legible. |
| Trade-offs | Depends on photography quality; needs art direction per section. | Contradicts "Hotels & Travel" and the resort and wellness sets; about a quarter of the gallery must go. Risks becoming understated. | Contradicts the city and business copy, the lobby hero and the room interiors. Saturated orange strains contrast and the premium tone. Highest content-rewrite cost. |
| Technical implications | CSS, modest markup class changes and the existing image pipeline; no new dependencies. | Similar CSS, plus asset removal and copy edits. | A palette overhaul with full contrast re-verification, plus a content rewrite. |

## 6. Recommended direction

**Recommendation:** A — *Vista Atlas*.

- **Rationale:** it is the only direction consistent with the copy that defines the brand (hero, footer, "Hotels & Travel") without discarding large parts of the current content. It turns the split between city and coast from a contradiction into a curated range. It is achievable with the current HTML, CSS, tokens and image pipeline.
- **Strengths preserved:** the warm light ground and gold wash, the Manrope/Inter pairing, the tracked label voice, the hairline accent, the verified focus, contrast and reduced-motion contracts, the page set, navigation, filters, lightbox and form.
- **Primary design objective:** give photography and typography the leading roles, and keep elevated surfaces for things people use.
- **Distinctiveness:** a recognisable editorial voice built from chapter kickers, display lines, captioned photographs and spec lines. It does not rely on decoration or motion.
- **Intentional boundaries:** no framework, library, font file or animation is added. Routes, IDs, `data-*` hooks and DOM order stay unchanged. The approach does not redesign the logo, invent content or claims, or authorise a rebrand.
- **Guiding hierarchy:** `place (photograph) → proposition (display line) → stay (rooms, offers) → proof (voices, gallery) → one quiet invitation`.

## 7. Prioritized design improvements

Priorities express design value and dependency order, not defect severity. P1 items establish the direction; P2 items extend it. These proposals do not authorise implementation. Acceptance criteria describe future verification, not the current state.

### IMP-DESIGN-01 — Establish an editorial type system with display, kicker, caption and spec voices

- **Status:** COMPLETED — implemented and verified.
- **Result:** Homepage and CTA section titles use the Manrope 700 display voice at `--fs-700`, between subpage `h1` titles (`--fs-800`) and gallery and "O nas" section titles (`--fs-600`); card titles share the new `--fs-card-title` alias. The hero statement is body size, offer occasion labels share the hero tagline's tracked Inter 500 kicker voice, and room specs use Inter 500 tabular figures like the discount badge.
- **Verification:** `npm run qa:fast`, `npm run build:css` and `npm run test:a11y` (27 scenarios) passed. Playwright checks of all 12 pages at 320–1440 px and 200% zoom, in light and dark, confirmed the size order, unchanged headings, IDs and `aria-labelledby`, no overflow, only the four project woff2 files and web-font diacritics; legal and utility pages were unchanged. Captions contain no figures, so tabular figures apply to specs only; the theme toggle and other browsers were not tested.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-02 — Replace the universal card with a three-role material language

- **Status:** COMPLETED — implemented and verified.
- **Result:** Benefits, testimonials, "O nas" principles and stats, and the closing CTA sit on the page as Ground, divided by a shared `--rule`; photographs use one Frame radius and hairline edge without shadow. The `--elev-rest`, `--elev-raised` and `--elev-high` tokens and the `--surface-lift` hover rise are reserved for offer cards, homepage room cards (`room-card--surface`), lightbox tiles on hover, filters, the form, the legal sheet and the lightbox; the static hero image no longer zooms on hover.
- **Verification:** `npm run build:css`, `npm run qa:fast` and `npm run test:a11y` (27 scenarios) passed. Playwright checks of the primary pages at 390 and 1280 px in light and dark found card-level shadows only on elements containing controls, no hover transform or shadow change on static content, a visible ring at every focus stop, no overflow from 320 to 1440 px and no rise under reduced motion. Button, theme-toggle and filter-chip shadows stay as control states, the contact map keeps its resting shadow, and the toggle control, other browsers and assistive technologies were not tested.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-03 — Define a Vista photography system and asset brief

- **Status:** COMPLETED — implemented and verified.
- **Result:** Phase 1 replaced the hero, Classic, Deluxe, Luxury Suite, featured Luxury Room and About photographs with six approved masters, which `npm run img:opt` centre-crops to their display ratios and exports as JPEG, WebP and AVIF without upscaling. Phase 2 replaced the six homepage and 20 `gallery.html` photographs with 26 approved 3:2 masters at 640–1536 px, with updated `alt`, captions and lightbox targets, and removed the legacy sources and variants. Phase 3 integrated the approved 1200 × 630 and 1200 × 1200 Open Graph JPEGs: all ten sharing pages carry an accurate `og:image:alt` and a new `twitter:image:alt`, X cards use the landscape graphic because a simulated 2:1 `summary_large_image` crop clipped the square's logo and attribution, and the five JSON-LD `ImageObject` caption pairs match.
- **Verification:** Phases 1–2: idempotent `npm run img:opt` reruns, `qa:fast` (421 width descriptors), `npm run build` and `npm run test:a11y` (27 scenarios) passed, and browser checks at 390–1280 px in both themes showed correct, in-frame images, no overflow, and working filters and lightbox. Phase 3: `check:links`, `check:jsonld`, `check:syntax` and `npm run build` passed; a `dist/` check confirmed byte-identical JPEGs whose decoded format and dimensions match the metadata, absolute HTTPS image URLs, one alt text on every page and synchronised captions. Live Facebook, LinkedIn and X previews and browsers other than Chromium were not verified.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-04 — Re-compose the homepage hero around one dominant photograph

- **Status:** COMPLETED — implemented and verified.
- **Result:** The approved lobby photograph fills the content container: from 760 px the heading, a Manrope 600 statement and both CTAs sit on a theme-independent ink scrim, and below 760 px the photograph fades into a solid ink panel, with the DOM order unchanged. `img:opt` now exports several focus-positioned crops per master, adding a 4:5 portrait Hero crop served below 480 px through `<picture>` media sources. Each crop has one media-scoped AVIF preload matching the rendered `sizes`.
- **Verification:** `npm run qa:fast`, `npm run build`, `npm run test:a11y` (27 scenarios) and an idempotent `img:opt` rerun passed. Playwright checks at 320–1440 px, 200% zoom and 844 × 390 px in light and dark measured a 1200 × 675 px photograph at 1280 and 1440 px, all Hero content within 390 × 844 px, a worst-case 5.75:1 for text over the photograph, one preload-initiated Hero download per viewport and DPR in source and `dist/`, no Hero layout shift, no reduced-motion image transform and an unchanged tab order. Safari, physical devices and assistive technologies were not tested; Playwright WebKit without AVIF loaded one WebP fallback.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-05 — Present rooms as image-led stays with a typographic spec line

- **Status:** COMPLETED — implemented and verified.
- **Result:** `rooms.html` presents the three rooms as full-width Ground entries divided by rules: from 760 px the framed 3:2 photograph takes three fifths of the row and Deluxe is mirrored through grid areas, with `--fs-700` titles and a tabular spec line under a hairline. The homepage "Luxury Room" highlight is an asymmetric chapter from 1024 px, its photograph beside the title, statement, hairline-divided feature list and unchanged `rooms.html#luxury` CTA; the Surface teaser cards are unchanged. Room content, DOM order, IDs and filter hooks are preserved, and both images use `sizes` matching the new geometry.
- **Verification:** `npm run qa:fast` (433 width descriptors), `npm run build` and `npm run test:a11y` (27 scenarios) passed. Playwright checks at 390–1440 px in light, dark and auto confirmed dominant, undistorted photographs, alternating and image-first order, tabular figures, all four filter states without empty tracks, fragment, `hashchange`, Back/Forward and homepage-link filtering, expected `srcset` candidates at DPR 1 and 2, no overflow at 200% zoom, static reduced motion, unchanged focus order and no image layout shift. The theme toggle, other browsers, physical devices and assistive technologies were not tested.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-06 — Lead offers with the occasion, not the discount

- **Status:** COMPLETED — implemented and verified.
- **Result:** The six `offers.html` cards follow occasion kicker → title → description → inclusions → discount → CTA in source order, and the four homepage teasers reuse the existing occasion labels without inclusions. The kicker uses the tracked Inter 500 voice in `--primary`, titles are Manrope 700, inclusions are hairline-divided spec rows, and the discount is an unfilled, hairline-framed tabular tag aligned with the CTA across each grid row. All offer content, discount values, IDs, CTA labels, `href` and `aria-label` values, the disclosure and grid balancing are unchanged; the unused `--offer-badge-text` token was removed.
- **Verification:** `npm run qa:fast`, `npm run build` and `npm run test:a11y` (27 scenarios; the offer scenario now asserts an unfilled tag) passed. Playwright checks at 390, 800 and 1280 px in light and dark measured discounts at 15.52:1 (light) and 14.49:1 (dark) and kickers at 5.19:1 and 9.07:1, with no page overflow or in-card clipping; all six offer links pre-filled the form, the homepage teasers kept their destinations, and focus rings, heading order and reduced-motion hover were unchanged. 200% zoom was approximated by halved viewports (no overflow at 400 and 640 px); the 12–17 px page overflow below 240 px exists in `HEAD`, and the theme toggle, other browsers and assistive technologies were not tested.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-07 — Curate the galleries as sequenced, mixed-format mosaics

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** the homepage gallery (six items) and the five four-item categories on `gallery.html`. The lightbox behaviour is unchanged.
- **Evidence:**
  - Source: `.gallery-grid` uses equal columns (2/3/4) with `--balanced-four`, and every tile is 3:2. Captions exist only in the lightbox (`data-caption`/`alt`).
  - Runtime: the homepage gallery is 861 px tall at 1280 px and 2,456 px at 390 px. `gallery.html` is 2,641 px tall at 1280 px.
  - Visual: equal tiles with no lead image; captions are not visible.
- **Current state:** both galleries are uniform indexes of thumbnails.
- **Design judgment:** the grid catalogues the photographs instead of telling a story. On mobile it becomes a long, undifferentiated scroll.
- **Proposed improvement:**
  - Give each collection one lead image (wide or tall) and supporting tiles in mixed formats on a consistent CSS grid.
  - Show short captions in the caption voice on `gallery.html`.
  - Turn the homepage gallery into a curated sequence; the selection is owner-approved.
  - On mobile, use a full-width lead with a two-column mosaic.
  - No masonry library and no horizontal scrolling.
- **Expected value:** the galleries become the visual proof of the "Atlas" story, at a much lower mobile scroll cost.
- **Implementation scope:** gallery CSS and item modifier classes, and visible caption markup that keeps link accessible names.

  Keep:
  - DOM order, which is the lightbox order;
  - `data-lightbox-item`, `data-cat-item` and `data-caption`;
  - the filter anchors and hash restore;
  - the position counter;
  - focus behaviour.

  Intrinsic `width`/`height` attributes must match the files.
- **Dependencies:** the alt and caption prerequisite (section 4), IMP-DESIGN-03 (formats and crops), IMP-DESIGN-02 (Frame role) and IMP-DESIGN-01 (caption voice).
- **Acceptance criteria:**
  - From 760 px, each collection's lead image is visibly larger than its siblings.
  - At 390 px, the homepage gallery is substantially shorter than 2,456 px, with every image fully visible and tappable.
  - Visible captions match the lightbox captions and the image content.
  - Lightbox order, the counter and filter hash behaviour are unchanged, and the existing `test:a11y` gallery scenarios pass.
  - The pages have no horizontal overflow, and loading images cause no layout shift.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-08 — Give Vista a theme-stable accent and material palette

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** the palette and gradient tokens in `tokens.css`; accent consumers (primary button, badges, links, kickers); the theme-colour metadata as a separate configuration slice.
- **Evidence:**
  - Source: `--primary` is `#0f6fbf` in light and `#34d1b2` in dark. `--primary-alt` stays `#0a5ca0` in both themes, so the dark gradient runs from `#0b7564` to `#0a5ca0`. `--focus` is `#2dc7a6`. The washes are `#ffd37a` (light) and `#2d9bf0` (dark). The logo uses `#f69d1f` and `#4181c3`. `msapplication-TileColor` is `#2dc7a6`. The `theme-color` values `#f7f6f3`/`#0d0f14` differ from `--bg` (`#faf8f3`/`#0a0d11`).
  - Runtime: the computed `--primary` changes per theme.
- **Current state:** blue identifies the light theme, mint and teal the dark theme, and orange appears only in the logo.
- **Design judgment:** the two editions read as two brands, and the palette is unrelated to both the mark and the photography.
- **Proposed improvement:** define one accent family once and tune it per theme. The hue stays the same; only lightness and chroma adjust. Derive it from the approved direction: for *Atlas*, a warm sand and brass neutral system with one deep ink or sea accent, or a reconciliation with the mark if the owner keeps it. Develop the dark edition as an intentional "evening" variant, not an inversion. The change is limited to tokens.
- **Expected value:** a stable colour signature that links the UI, the mark and the photography in both themes.
- **Implementation scope:** the `tokens.css` palettes and gradients. Align the `theme-color` and manifest values later in a separate slice. Keep the theme switch, the `theme-pref` storage, auto mode and the focus-ring tokens. Re-verify the contrast fixes recorded in `docs/CHANGELOG.md`.
- **Dependencies:** owner decisions on the direction and the brand mark. Sequence after IMP-DESIGN-02, because both edit `tokens.css`.
- **Acceptance criteria:**
  - Light and dark accents share one hue family.
  - Contrast is measured in light, dark and auto, and nothing is assumed: normal text pairs reach at least 4.5:1 and UI component boundaries at least 3:1.
  - These states pass again: primary buttons with hover and active, offer badges, the skip link, form errors and placeholders.
  - `npm run test:a11y` reports no new violations.
  - The owner approves the relationship between the mark and the palette.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-09 — Recompose "O nas" as an editorial brand story

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** `onas.html` and the `.brand__*` rules in `subpages.css`.
- **Evidence:**
  - Source: a `grid-2` intro with text and a 5:4 image, then three `.grid-3` groups with nine boxed items in total. The stat values are "24/7", "Premium" and "100%". A section disclosure follows.
  - Runtime: the page is 2,698 px tall at 1280 px.
  - Visual: three consecutive rows of equal boxes. The unbadged interior image is the strongest asset on the page.
- **Current state:** the brand page repeats the catalogue idiom used everywhere else.
- **Design judgment:** the page meant to carry the brand voice has the least voice.
- **Proposed improvement:**
  - Enlarge the intro image, with the lead in the display and reading voices.
  - Set philosophy and values as numbered typographic principles on the Ground role.
  - Add one pull statement taken from existing copy.
  - Show the stats only if the owner keeps them, as a quiet line rather than as feature cards.
  - Keep the disclosure adjacent to the story.
- **Expected value:** the clearest single expression of the *Atlas* voice, using content already on the page.
- **Implementation scope:** `onas.html` classes and brand rules. Keep the heading outline (including the `sr-only` `h2`), `aria-labelledby`, the disclosure text and the CTA destination. Add no new claims.
- **Dependencies:** IMP-DESIGN-01 and IMP-DESIGN-02; an owner decision on the stats content.
- **Acceptance criteria:**
  - At 390 and 1280 px in both themes, philosophy and values render without card surfaces.
  - Reading lines stay within 72ch.
  - The heading outline is unchanged.
  - The disclosure is visible in the same section.
  - No content is added without approval.
- **Impact:** Medium
- **Effort:** Medium

## 8. Suggested implementation sequence and dependencies

1. **Owner decisions:** narrative and direction, the brand mark, photography rights and provenance, and the content items in section 10.
2. **Prerequisite correction (separate task):** image `alt` text and gallery captions.
3. **Foundation:** IMP-DESIGN-01 and IMP-DESIGN-02. They are independent but both edit shared CSS, so coordinate the edits. IMP-DESIGN-08 follows IMP-DESIGN-02 because both touch `tokens.css`.
4. **Assets:** the IMP-DESIGN-03 brief, owner-supplied sources, then `npm run img:opt`. This runs in parallel with step 3.
5. **Primary composition:** IMP-DESIGN-04. Layout work can start after step 3; final sign-off waits for the step 4 assets.
6. **Central content:** IMP-DESIGN-05 and IMP-DESIGN-06, which are independent of each other.
7. **Media:** IMP-DESIGN-07, after steps 2 and 4.
8. **Supporting page:** IMP-DESIGN-09.
9. **Integration review:** all primary pages at 320, 390, 800, 1280 and 1440 px, plus a short landscape viewport, in light, dark and auto. Also check reduced motion, 200% zoom and keyboard traversal. Run `npm run qa:fast`, `npm run test:a11y` and `npm run build`.

Each Large item should be delivered as the slices named in its scope, never as one combined redesign change.

## 9. Verification performed and limitations

- **Source inspection:** the CSS modules, the main page markup, JavaScript behaviour relevant to presentation, SVG brand assets, and photographs. Image dimensions were read with the installed Sharp package; contact sheets were written outside the repository.
- **Commands executed:**
  - `git ls-files` and read-only file inspection;
  - `node scripts/dev-server.mjs` (serves files; writes nothing);
  - Playwright capture and measurement scripts, kept outside the repository.
- **Not run:** `npm run qa:fast`, `npm run test:a11y`, `npm run build` and `npm run img:opt`. No project source changed.
- **Viewports and themes:** 390 × 844, 800 × 1024, 1280 × 800 and 1440 × 900, in light and dark through `prefers-color-scheme` with the default `auto` preference. Captures used reduced motion and forced the final reveal state.
- **Not verified:**
  - the theme toggle interaction;
  - hover states visually;
  - the open lightbox;
  - 200% zoom, short and landscape viewports;
  - other browsers, physical devices and assistive technologies.

  No contrast measurements were taken, and this report makes no contrast or WCAG claim.
- **Out-of-scope candidate observations** (for an audit or plan, not proposals):
  - The homepage gallery `<img>` elements declare `width="800" height="800"` for 3:2 files. In the browser pane, unloaded tiles reserved 387 × 387 px boxes, a layout-shift risk.
  - `onas.html` serves the PNG only, although AVIF and WebP variants exist.
  - The `hero-*` variants are unused.
  - The homepage "Luxury Room" and the `rooms.html` "Luxury Suite" share the `#luxury` target but differ in name and image.

## 10. Owner decisions required

- **Direction and narrative:** A, B or C, and whether Vista is one city hotel or a curated collection.
- **Brand mark:** keep the palm-and-sunset mark, refine it, or commission a mark aligned with the chosen direction. This affects IMP-DESIGN-08.
- **Photography:** rights and provenance, clean files without the burned-in badge, whether representative imagery is acceptable, and the representation of people.
- **Hero `h1`:** keep the brand name as the `h1` text or promote the proposition.
- **Content:** richer room descriptions, the "Luxury Room"/"Luxury Suite" naming, the "O nas" stats ("Premium", "100%"), any new kicker labels, and the offer action labels and discount prominence.
- **Rooms page:** whether `rooms.html` gets the shared closing band.
