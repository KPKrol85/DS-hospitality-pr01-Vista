# Vista — Development Plan

**Source:** `AUDIT.md` — Final Technical Front-End Audit, 2026-09-23
**Project:** Demonstrational static multi-page site (HTML, CSS, Vanilla JavaScript)
**Status:** Active; PH1-01 complete, three objectives open

Root HTML, `css/`, `js/`, and `assets/seo/` are canonical sources. Production bundles and `dist/` are generated. Complete an objective only after its implementation and focused verification meet the stated condition. The archived plan and review document completed work; they do not add work to this cycle.

## Current priorities

1. `PH1-01` — Fix closed mobile navigation keyboard access (complete).
2. `PH1-02` — Enforce arrival-date validity; resolve the no-JavaScript submission mechanism before claiming full completion.
3. `PH1-03` — Align indexable hotel claims with the demonstrational project, after the owner identifies which contact details should remain public and how.
4. `PH2-01` — Update both README accessibility descriptions after `PH1-02`, so the form statement reflects the implemented behavior.

The three Phase 1 objectives have no code dependency on one another. The owner decision gates the content choices in `PH1-03`; `PH2-01` depends on the final form behavior in `PH1-02`.

## Phase 1 — Release-relevant corrections

**Goal:** Resolve the three current P1 findings without changing the source-to-`dist/` workflow.

- [x] **PH1-01 — Remove closed mobile navigation from keyboard order**
  - [x] Make the JavaScript-controlled mobile menu non-rendered and non-focusable when closed, including on initial load; keep its open state and desktop menu visible.
  - [x] Preserve toggle, Escape, link-selection and focus-return behavior, plus the visible no-JavaScript navigation.
  - [x] In a browser at mobile width, traverse with Tab and Shift+Tab before opening, while open, and after closing with the toggle and Escape; check first-link focus, focus return, desktop navigation, and navigation with JavaScript disabled. Repeat the relevant checks in a fresh package built from source.
  - **Verification:** Local Chromium at 390 px passed initial closed display and keyboard traversal, open first-link focus and seven-link traversal, toggle/Escape/link closing with focus return, and no-JavaScript visibility and keyboard access. At 1280 px the desktop navigation remained visible and focusable; resizing back to mobile restored the closed state. The same checks passed on root source and freshly built `dist/` (`npm run build:dist`, 11 HTML pages).
  - **Completion condition:** Closed mobile links never enter sequential keyboard focus; opening exposes and focuses the menu, closing restores usable focus, and desktop and no-JavaScript navigation remain usable.
  - **Sources:** `css/modules/layout.css`, `js/features/nav.js`, root-page header markup (for example `index.html`). **Audit:** `AUDIT.md` P1-01.

- [ ] **PH1-02 — Reject past arrival dates on inquiry submission**
  - [x] Validate arrival against the refreshed current local date in the enhanced submit path before `form.submit()`, including dates entered directly; retain the date-field relationship, accessible errors, and Netlify Forms identity and submission path.
  - [x] Preserve native form constraints when JavaScript is absent or initialization fails. Static HTML has no moving arrival minimum; the submission-side gate must cover this path.
  - [x] Verify the new Edge Function on a Netlify deploy: reject malformed and past `booking` POSTs before Forms collection, and confirm valid future submissions are collected. The gate follows Netlify's documented Edge request chain and a Netlify staff Forms validation example, but its Vista platform path has not been tested. The gate uses the Europe/Warsaw date; this can differ from the visitor's local date used by enhanced validation.
  - [x] Focused local Chromium checks passed on source and fresh `dist/`: enhanced past/direct-entry past, equal/earlier departure, missing arrival, stale-date, and other invalid-field cases were blocked; today/future requests reached a local POST interceptor with `form-name=booking`, including with Netlify's stripped attribute simulated. Native `ValidityState` checks passed for required fields, email, phone pattern, guest range/step, and consent; constraints remained active after simulated form initialization failure. With JavaScript disabled, completed past and future forms both POSTed locally as expected without the Edge gate. The Edge handler's local request checks passed, but actual Netlify request processing and Forms collection remain unverified.
  - **Completion condition:** A completed past-arrival inquiry is rejected in both enhanced and no-JavaScript submission paths by verified mechanisms; a valid future-date inquiry retains the Netlify Forms route and existing native baseline. If no no-JavaScript submission-side check is adopted, this condition remains unmet.
  - **Sources:** `contact.html`, `js/features/form.js`; Netlify Forms configuration in the form markup. **Audit:** `AUDIT.md` P1-02.

- [ ] **PH1-03 — Make indexable hotel claims consistent with the fictional brand**
  - [ ] Ask the owner which displayed contact details are real KP_Code contact channels and which fictional address, phone and map details should be retained, labeled or removed from public presentation; do not infer that the fictional hotel operates.
  - [ ] Align the embedded JSON-LD fallbacks and their fetched counterparts on the six indexable pages, removing unsupported `Hotel`, location and customer-service claims and updating references to those entities while retaining valid `WebSite`, page and image structure and unrelated metadata.
  - [ ] Align affected titles, descriptions and visible contact/location claims with the demonstrational disclosure in `regulamin.html`, limited to statements that otherwise imply an operating Vista hotel. Preserve canonical URLs, indexing controls and unrelated SEO fields.
  - [ ] Parse the affected JSON-LD, inspect both fallback and fetched representations in source and a fresh package, and compare their claims with page metadata, visible copy and the legal disclosure. Confirm no indexable representation asserts a real Vista hotel at the fictional address or phone.
  - **Completion condition:** All affected indexable page and JSON-LD claims agree that Vista is a fictional demonstration, without unsupported hotel identity, location or service contacts; retained contact details follow the owner's decision and the structured data remains valid.
  - **Sources:** `index.html`, `rooms.html`, `offers.html`, `gallery.html`, `onas.html`, `contact.html`; corresponding `assets/seo/ld-{index,rooms,offers,gallery,onas,contact}.json`; `regulamin.html` for the existing disclosure; `js/features/seo-jsonld.js` for fallback replacement. **Audit:** `AUDIT.md` P1-03.

## Phase 2 — Documentation alignment

**Goal:** Make the public accessibility description match the corrected behavior.

- [ ] **PH2-01 — Correct bilingual README accessibility statements**
  - [ ] Update only the Polish and English accessibility descriptions of reveal content and form validation: content is visible before successful reveal enhancement, and native constraints remain active without JavaScript while the enhanced handler controls validation after initialization.
  - [ ] After `PH1-02`, describe the verified arrival-date behavior and any remaining no-JavaScript limit accurately, with Polish and English factual parity; preserve unrelated README content.
  - [ ] Compare both descriptions against `css/modules/utilities.css`, `js/features/reveal.js`, `contact.html`, `js/features/form.js`, and the focused form verification from `PH1-02`.
  - **Completion condition:** Both language sections accurately state the current reveal and form-validation behavior, including any verified limit, without claiming accessibility conformance or unverified form delivery.
  - **Depends on:** `PH1-02` final behavior. **Sources:** `README.md` and the cited source files. **Audit:** `AUDIT.md` P2-01.
