# Vista — Final Technical Front-End Audit

**Audit date:** 2026-09-23  
**Project type:** Demonstrational static multi-page hospitality site (HTML, CSS, Vanilla JavaScript)  
**Audit mode:** Final repository and implementation review  
**Current readiness:** Needs important fixes

## 1. Executive assessment

Vista has a coherent source-to-distribution pipeline, and its 11-page package built successfully in this checkout. Local Chromium checks found no page script errors or missing local assets on the packaged routes sampled below. Core room filtering, lightbox dismissal, and one cached offline navigation worked in those checks. Three current issues warrant correction before final public presentation: closed mobile navigation remains keyboard-focusable, the inquiry form accepts a past arrival date, and indexable structured data describes the explicitly fictional brand as a physical hotel. Live Netlify behavior and form delivery were not verified.

## 2. Audit scope and verification

### Areas inspected

- All 11 root HTML routes, with focused review of navigation, rooms, gallery, contact, error, offline, and legal-page contracts; shared CSS modules and JavaScript features; local links, metadata, JSON-LD, image and font references.
- Build and validation scripts, `package.json` and root lockfile metadata, `netlify.toml`, Netlify headers and redirects, manifest, service worker, image pipeline, license, README, settings, and archived review and plan. Archived findings were treated as historical context.
- Canonical source versus newly generated `dist/` output; Git state and ignored-output ownership.

### Verification performed

- `npm run check:links` — executed and passed for 11 HTML files and `sitemap.xml`.
- `node --check` — executed and passed for 23 JavaScript files under `js/`, `pwa/`, and `scripts/`.
- `npm run build` — executed and passed; generated the ignored `dist/` package with 11 HTML pages and verified its bundles and package references. The build did not change tracked source files.
- Parsed all 11 `assets/seo/*.json` files — executed and passed.
- Local Headless Chromium — inspected all 11 source and packaged HTML routes at desktop width; each had one `h1`, a `main`, no page script error, and no failed local asset response in the test server. Five representative packaged routes at 390 px showed no horizontal document overflow. Tested mobile menu keyboard traversal, room filtering, lightbox open/dismissal, no-JavaScript homepage visibility and form constraints, and enhanced form submission with `form.submit()` intercepted. The form tests did not send an inquiry.
- Local Headless Chromium with a test server supplying `Service-Worker-Allowed: /` — production worker controlled the page, created Vista static and HTML caches, and served a previously packaged rooms page while offline.

### Verification limitations

- No live URL was supplied for this audit. Current public deployment, Netlify Forms processing, Netlify's actual headers and redirects, third-party map rendering, and real search-engine treatment were not tested. The local server simulated the worker scope header; it was not a Netlify deployment.
- `npm run test:a11y` was not executed: its `npm exec --yes --package=...` command may install `axe-core`, which is absent locally, and this audit prohibits dependency installation. Browser checks do not establish WCAG conformance. Other browsers, assistive technologies, and production performance were not tested.
- The build created ignored `dist/` output. It was not edited by hand or tracked in Git.

## 3. Verified strengths

- The full build regenerates CSS and JavaScript from `css/style.css` and `js/script.js`, packages all 11 pages, checks production references, and derives the worker version from packaged bytes (`package.json`, `scripts/build-dist.mjs`). This path passed in the current checkout.
- Root pages retain readable source assets; production pages receive distinct minified references and the marker that enables worker registration (`scripts/build-dist.mjs`, `js/script.js`). The no-JavaScript homepage kept reveal content visible in local Chromium (`css/modules/utilities.css`, `css/modules/layout.css`).
- The packaged room filter hid nonmatching cards, and the gallery lightbox opened with focus inside and closed with Escape in local Chromium (`js/features/room-filters.js`, `js/features/lightbox.js`).
- Worker cache names and cleanup are scoped to Vista-owned patterns, and the production worker has an offline navigation fallback (`pwa/service-worker.js`, `js/script.js`). One cached offline route was verified locally.
- The contact form retains native required-field, email, phone-pattern, guest-range, and consent constraints when JavaScript is disabled, while the enhanced path preserves the Netlify Forms markup (`contact.html`, `js/features/form.js`). This strength does not extend to date-range validation, as described below.

## 4. P0 — Critical risks

None detected.

## 5. P1 — Important issues worth fixing next

### [P1-01] Closed mobile navigation leaves invisible links in keyboard order

- **Classification:** Defect
- **Affected area:** Mobile navigation, keyboard accessibility
- **Evidence:** `css/modules/layout.css:99-102`, `css/modules/layout.css:152-165`, `js/features/nav.js:34-42`
- **Current behavior:** The close handler sets `nav.hidden = true`, but `.site-nav` still computes to `display: flex` and `opacity: 0` at 390 px. In local Chromium, after closing the menu with Escape, Tab reached all seven visually hidden navigation links before the main-page links.
- **Impact:** Keyboard users traverse and focus controls they cannot see, including whenever the mobile menu is closed.
- **Recommended direction:** Make the closed JavaScript navigation non-rendered and non-focusable, while preserving the visible no-JavaScript navigation and desktop layout.
- **Verification criteria:** At mobile width, closing or initially loading the menu removes its links from sequential keyboard focus; opening it exposes and focuses the intended links, and desktop and no-JavaScript navigation remain usable.

### [P1-02] Inquiry form accepts arrival dates in the past

- **Classification:** Defect
- **Affected area:** Contact form, date validation, progressive enhancement
- **Evidence:** `contact.html:292-299`, `js/features/form.js:36-61`, `js/features/form.js:101-109`, `js/features/form.js:133-146`
- **Current behavior:** The arrival input has no static `min`. JavaScript adds today's date as `min` but later sets `form.noValidate = true`; its submit handler only checks that arrival is nonempty. In local Chromium, an arrival of `2020-01-01` produced `ValidityState.rangeUnderflow` yet still reached the form's submission path. With JavaScript disabled, the same completed form passed native `checkValidity()` because no date minimum was present.
- **Impact:** The active inquiry path can send impossible past-stay requests. The date rule differs between visible input constraints and actual submission behavior.
- **Recommended direction:** Enforce the current arrival-date rule in the enhanced submit validation and retain an appropriate no-JavaScript validation baseline for date fields.
- **Verification criteria:** A completed inquiry with a past arrival cannot submit with or without JavaScript; valid future dates still reach the Netlify Forms submission path.

### [P1-03] Indexable structured data presents the fictional brand as a real hotel

- **Classification:** Content integrity risk
- **Affected area:** Structured data, public metadata, project disclosure
- **Evidence:** `index.html:87-116`, `assets/seo/ld-index.json:37-66`, `contact.html:87-113`, `regulamin.html:204-214`, `robots.txt:1-2`
- **Current behavior:** The project terms explicitly call Vista a fictional brand and its hotel address, phone, and map conceptual. Indexable pages nevertheless publish a `Hotel` entity with that address, phone, and customer-service contact in both embedded and fetched JSON-LD. This is a source-level contradiction; no search-engine display was tested.
- **Impact:** Machines consuming the structured data may treat a demonstrational business and location as an operating hotel, while visitors may interpret its contact details as real hospitality service details.
- **Recommended direction:** Align indexable structured data and public contact claims with the demonstrational scope; retain only business facts the owner intends to represent as real.
- **Verification criteria:** Indexable metadata no longer asserts an operating Vista hotel at a fictional address or phone, and the retained page and structured-data claims agree with the project disclosure.

## 6. P2 — Minor refinements

### [P2-01] README accessibility description contradicts the current no-JavaScript baseline

- **Classification:** Documentation mismatch
- **Affected area:** Public project documentation, progressive enhancement
- **Evidence:** `README.md:79`, `README.md:177`, `css/modules/utilities.css:10-26`, `contact.html:254`, `js/features/form.js:146`
- **Current behavior:** Both README languages say reveal content is hidden until JavaScript runs and that a form `novalidate` attribute disables browser validation. Current source leaves reveal content visible by default; the HTML form has no `novalidate` attribute, and JavaScript sets `noValidate` only after installing enhanced handlers. Local no-JavaScript checks confirmed visible reveal content and active native constraints.
- **Impact:** Maintainers and portfolio reviewers receive an outdated account of two important accessibility fallbacks.
- **Recommended direction:** Update both language sections to describe the current default and enhanced behavior accurately.
- **Verification criteria:** Polish and English README accessibility statements match the source and the observed no-JavaScript baseline.

## 7. Extra quality improvements

None detected.

## 8. Current readiness conclusion

**Status:** Needs important fixes

The repository builds and its sampled core interactions work locally, but the three P1 issues should be resolved before final public portfolio presentation or release. This assessment concerns the current source and local production package; it does not certify a live deployment, inquiry delivery, accessibility compliance, or search-engine outcome.

## 9. Senior rating

**Rating:** 7/10

The source ownership and production packaging are coherent and passed focused local checks. The rating reflects the confirmed mobile keyboard and inquiry-date defects plus the public structured-data contradiction. The remaining README mismatch is minor; unavailable live and assistive-technology checks limit the conclusion rather than constituting additional defects.
