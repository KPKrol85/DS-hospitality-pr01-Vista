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

- **Status:** Proposed
- **Priority:** P1
- **Affected area:** homepage benefits, testimonials, rooms, offers, gallery tiles and CTA panel; `rooms.html` room cards; `onas.html` brand cards and stats; the surface and elevation tokens.
- **Evidence:**
  - Runtime: 21 surfaces on `index.html` at every tested width share a border, a radius of 10 px or more and a shadow, across six classes.
  - Source: the shared surface recipe and the hover-lift rules listed in section 3, the repeated literal hover shadow, and the undefined `--elev-soft` in `.legal-card`.
  - Visual: uniform white rectangles in every homepage section.
  - Historical: hover elevation on static cards was ranked lower in the archived 2026-09-30 UI report.
- **Current state:** informational content, photographs and actionable items share one elevated treatment. Some non-interactive surfaces lift on hover.
- **Design judgment:** when everything is a card, nothing is featured, and elevation no longer tells visitors what they can use.
- **Proposed improvement:** assign three material roles:
  - *Ground*: editorial content set directly on the page and separated by hairline rules and kickers. This covers benefits, testimonials as editorial quotes, intros and about-page principles.
  - *Frame*: photographs with a consistent radius, a minimal edge and an optional caption.
  - *Surface*: elevated only for actionable groups and controls, such as offer entries with actions, the form, the filter panel, the header and the lightbox.

  Hover elevation applies only to Surface items. The closing CTA becomes a composed Ground band. Shadows resolve to resting and raised elevation tokens.
- **Expected value:** clear section hierarchy and calm pages. Photography and type carry the identity, and interactive and informational roles are visually distinct.
- **Implementation scope:** elevation tokens in `tokens.css`; surface rules in `components.css`, `sections.css` and `subpages.css`. Possible slices: tokens → homepage editorial sections → photo frames → about page and CTA.

  Keep:
  - DOM order and semantics (`article`, `figure`, `blockquote`);
  - the focus-ring tokens and the room and offer `:focus-within` outlines;
  - filter selected states and form surfaces;
  - the legal card layout and the IMP-UI-05 grid balancing;
  - the `motion.css` reduced-motion overrides.
- **Dependencies:** IMP-DESIGN-01 is recommended in the same cycle, because its rules and kickers replace the separation boxes provide.
- **Acceptance criteria:**
  - These conditions hold on `index.html`, `rooms.html` and `onas.html` at 390 and 1280 px in light and dark:
    - Elevated surfaces appear only on elements containing a link, button or form control, or on the header and the lightbox.
    - No non-interactive element changes its transform or shadow on hover.
  - Every shadow resolves to a defined elevation token.
  - Groups remain identifiable without boxes.
  - Focus is visible at every stop.
  - `npm run test:a11y` reports no new violations.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-03 — Define a Vista photography system and asset brief

- **Status:** Proposed
- **Priority:** P1
- **Affected area:** the hero, room and featured-room images, the homepage gallery, the `gallery.html` categories, the about image and the OG images; the `assets/img/src/` → `npm run img:opt` pipeline.
- **Evidence:**
  - Visual: contact sheets of all room, homepage-gallery and gallery-page photographs show mixed white balance, exposure and geography. A staff photograph sits among the interiors. The burned-in badge is confirmed in the sampled source files. The about image is unbadged and has the most coherent warm, soft grade.
  - Source: fixed crops `.room-card__img` (3:2), `.highlight__media img` (16:9) and `.brand__media img` (5:4); no portrait or wide-opener crops; unused `hero-*` variants.
- **Current state:** the photographs come from unrelated visual worlds, and most carry a visible mark.
- **Design judgment:** without a shared light and subject logic, no layout change can make the imagery read as one brand.
- **Proposed improvement:** an approved photo brief covering:
  - **Light:** warm, natural and softly directional, with a white balance consistent with the about image.
  - **Palette:** sand, stone and brass, with deep ink or sea accents.
  - **Subjects:** for each chosen category, one wide establishing view plus close details (room, table, ritual, material).
  - **People:** natural and unposed, with representation agreed by the owner.
  - **Crop set:** 16:9 or wider for openers, 3:2 standard, 4:5 portrait for mobile and editorial use, with focal-point notes per image.
  - **Clean files:** no burned-in marks or text.
  - **Themes:** images must hold up against both theme grounds.
- **Expected value:** one visual world. This is the foundation for IMP-DESIGN-04, -05 and -07.
- **Implementation scope:** an owner-approved brief, then replacement of the source files, regeneration of the variants, and updates to `srcset`, `sizes`, `width`, `height` and `alt`. Keep the naming conventions and the `check:image-descriptors` contract. Slices: brief → hero and rooms → gallery categories → OG images.
- **Dependencies:** the narrative decision (section 4), confirmation of rights and provenance, and corrected alt text for replaced images.
- **Acceptance criteria:**
  - A side-by-side contact sheet of all published photographs shows one consistent grade, with no burned-in marks.
  - Each category has at least one establishing view and one detail image.
  - Focal points stay in frame at 390, 800 and 1280 px.
  - Every `alt` describes its actual image.
  - `npm run check:image-descriptors`, `npm run check:links` and `npm run build` pass.
  - Final balance is approved only with approved assets, not placeholders.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-04 — Re-compose the homepage hero around one dominant photograph

- **Status:** Proposed
- **Priority:** P1
- **Affected area:** the `.hero` section of `index.html`, the hero rules in `sections.css`, and the hero `<link rel="preload">`.
- **Evidence:**
  - Runtime: at 1280 px the image is 541 × 304 px (about 45% of the container) and the hero is 516 px tall; at 1440 px the image is 538 × 302 px. At 390 px the image is 358 × 201 px, the title starts at about y = 414 and the CTAs at about y = 624. At 800 px the hero is 885 px tall.
  - Source: `.hero__inner` uses `1fr 1.6fr` from 1024 px and `.hero__media` is limited to 80% from 480 px. The preload `imagesizes` is tied to `628px`.
  - Visual: the badge in `hero-01` is visible at the current size.
- **Current state:** a brand lockup sits beside a framed image of moderate size. The positioning statement is small and muted.
- **Design judgment:** the image reads as a thumbnail, not a place, and the opening establishes no proposition.
- **Proposed improvement:** an image-led opening:
  - One wide photograph spans the full content width, or the full bleed, as the dominant element.
  - The positioning statement is set in the display voice, and the brand `h1` semantics are retained.
  - The existing CTA pair stays visible in the first viewport.
  - Mobile gets a dedicated crop, with text on a solid or scrimmed area that guarantees contrast.
  - No video, parallax or autoplay.
- **Expected value:** a distinctive first view that states what Vista is and immediately shows the place.
- **Implementation scope:** hero markup (an optional `<source media>` for art direction), hero CSS, and matching preload candidates and `sizes`.

  Keep:
  - one `h1` and the hero `aria-label`;
  - CTA labels and destinations;
  - the current DOM order;
  - the reveal fallback.

  Any change to the `h1` text is an owner content decision. Slices: desktop layout → mobile art direction → preload alignment.
- **Dependencies:** IMP-DESIGN-01 and IMP-DESIGN-02. Final sign-off requires a clean wide asset and a mobile crop from IMP-DESIGN-03.
- **Acceptance criteria:**
  - At 1280 and 1440 px, the photograph spans the container width or more and is the largest element in the first viewport.
  - At 390 × 844 px, the dedicated crop keeps its subject in frame, and the headline, statement and primary CTA are within the first viewport.
  - Text over imagery measures at least 4.5:1 against the actual image region in light and dark.
  - The network log shows a single hero download that matches the preload.
  - The hero image causes no layout shift.
  - Under reduced motion, the image has no transform.
  - The hero stays readable at 200% zoom, and keyboard order is unchanged.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-05 — Present rooms as image-led stays with a typographic spec line

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** the `index.html` rooms teaser and "Luxury Room" highlight; the `rooms.html` room grid.
- **Evidence:**
  - Source: on `rooms.html`, each of the three `.room-card` items has one `.room-card__text` sentence and a "18 m² • 1–2 os." style meta line, and the page ends after the grid. On the homepage, `.section--highlight` reuses `.section-title` and a framed 16:9 image. Both the "Luxury Room" highlight and the "Luxury Suite" card link to `rooms.html#luxury`.
  - Runtime: `rooms.html` is 1523 px tall at 1280 px.
- **Current state:** the rooms, the core product, are presented as a short catalogue, and the featured room is composed like the teaser grid.
- **Design judgment:** the rooms page is the thinnest primary page. It has photographs and specs but no presentation that gives them weight.
- **Proposed improvement:**
  - On `rooms.html`, present each room as an alternating wide image-and-text entry with only the existing content. The title uses the display voice, and area and occupancy form a spec line with tabular figures.
  - On the homepage, make the featured room a full-width, asymmetric chapter with larger media and its list set as specs, distinct from the three-up teaser.
  - A closing band on `rooms.html` is an owner decision.
- **Expected value:** rooms read as places to stay, not as listings. The featured chapter adds the emphasis the homepage lacks.
- **Implementation scope:** room markup classes and CSS.

  Keep:
  - the filters (`aria-pressed`, `data-room-filter`, hash restore);
  - the card IDs `#classic`, `#deluxe` and `#luxury`, and `scroll-margin-top`;
  - the image → title → meta → text DOM order.

  Do not invent room content.
- **Dependencies:** IMP-DESIGN-01 and IMP-DESIGN-02. IMP-DESIGN-03 for final image balance. Owner decisions on the "Luxury Room"/"Luxury Suite" naming and on any richer room descriptions.
- **Acceptance criteria:**
  - At 390, 800 and 1280 px in both themes, imagery is the dominant element of each room entry.
  - The spec line uses tabular figures.
  - Each filtered state remains a composed layout with no empty tracks.
  - `#classic`, `#deluxe` and `#luxury` still filter and scroll.
  - The homepage featured room is visibly distinct from the teaser grid.
  - No room content is added without approval.
- **Impact:** Medium
- **Effort:** Medium

### IMP-DESIGN-06 — Lead offers with the occasion, not the discount

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** the `index.html` offers teaser and the six offer cards on `offers.html`.
- **Evidence:**
  - Source: `.offer-card__badge` is a solid `--primary` pill, the only filled accent element in each card. The occasion label `.offer-card__meta` ("Dla par", "Dla biznesu"…) appears only on `offers.html`. The homepage teasers mix "Skorzystaj" (three cards) and "Zapytaj o projekt" (one card).
  - Visual: the badge is the strongest element in each card in both themes.
  - Source: the section disclosure marks the offers as illustrative.
- **Current state:** each offer is a text card anchored by a percentage pill.
- **Design judgment:** a discount-led layout reads like a deals site. The occasion and the inclusions are the real content.
- **Proposed improvement:**
  - Compose each offer as kicker (occasion) → title → description → inclusions set as a spec list.
  - Restyle the discount as a secondary typographic tag.
  - Reuse the existing occasion text in the homepage teasers.
  - Add a per-offer image only if IMP-DESIGN-03 supplies one; never use a placeholder.
  - Harmonising the action labels is a content/UX decision for the owner.
- **Expected value:** offers read as curated stays, consistent with the recommended direction.
- **Implementation scope:** offer rules in `components.css` and `subpages.css`; homepage teaser markup reuses the existing meta text. Keep the card IDs, the `?oferta=` links (IMP-UX-03 contract), the `aria-label` values, the disclosure and grid balancing.
- **Dependencies:** IMP-DESIGN-01 and IMP-DESIGN-02.
- **Acceptance criteria:**
  - In every offer card at 390 and 1280 px in light and dark, the occasion and the title precede the discount and outweigh it visually, and the discount is not the only filled-colour element.
  - Discount text measures at least 4.5:1.
  - The offer links still pre-fill the contact form.
  - The disclosure remains visible below the grid.
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
