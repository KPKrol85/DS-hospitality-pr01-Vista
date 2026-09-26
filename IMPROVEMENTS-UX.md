# Vista — UX Improvements

**Analysis date:** 2026-09-26
**Project type:** Static multi-page website (HTML, modular CSS, vanilla JavaScript) with a Node.js build pipeline and Netlify configuration
**Analysis mode:** Evidence-based UX improvement review
**Focus:** Project-wide UX

## Improvement overview

Vista supports a short, clear set of journeys. Visitors browse rooms, offers and the gallery, then send a project inquiry through the contact form. The core interactions are in place: native form constraints with enhanced validation, filters with ARIA state, a focus-managed lightbox, and a no-JavaScript baseline. The archived audits, plans and UI report are closed. No active plan or UX report exists. The main opportunities lie in the transitions between these interactions:

- recovery after a failed form submission;
- what the visitor sees after a successful one;
- context lost on the way from an offer to the form;
- filter selections that cannot be linked or restored;
- lightbox browsing without a sense of position.

Each proposal refines an existing journey. None adds a booking capability or changes the site's demonstrational scope.

## Proposed improvements

### IMP-UX-01 — Guide the visitor from a failed submission to a corrected form

- **Affected journey:** Contact inquiry form on `contact.html`, enhanced-validation path.
- **Evidence:** `js/features/form.js:13-17`, `js/features/form.js:85-104`, `js/features/form.js:106-163`, `contact.html:227-296`
- **Current experience:** On an invalid submission, the handler sets `aria-invalid` and unhides the error text of every failing field. Focus stays on the submit button, and the page does not scroll. Several `aria-live` error paragraphs are revealed at once. On a narrow viewport, the first failing field (for example the name at the top of the form) can be well above the visible area. Only arrival, guests and telephone revalidate as the visitor types. The name, email, departure and consent errors stay visible after correction until the next submission, so a corrected field can still read as invalid.
- **Proposed improvement:** After a failed submission, move focus to the first invalid field in document order. Once a field has been flagged, re-validate it on `input`/`change` so its error clears as soon as the value becomes valid, as the arrival, guests and telephone fields already do.
- **Expected user value:** The visitor lands directly on the first thing to fix, keyboard and screen-reader users start from the relevant field, and each error disappears when resolved rather than on the next attempt. This shortens recovery in the project's only data-entry journey.
- **Implementation scope:** `js/features/form.js` only. Reuse the existing validation rules and `setError`; do not change error copy, markup, IDs, the honeypot early return, `form.submit()` for the `booking` form, the Netlify attributes, or the no-JavaScript native validation baseline. Do not introduce validation on first input for untouched fields.
- **Acceptance criteria:**
  - Submitting with an empty name and invalid email moves focus to `#name`, and the field is scrolled into view.
  - Submitting with only the consent unchecked moves focus to `#consent`.
  - After a failed submission, entering a valid email clears `err-email` and sets `aria-invalid="false"` without another submission. The same applies to name, departure and consent.
  - An untouched field shows no error while the visitor types in another field.
  - A valid submission still reaches `form.submit()` unchanged.
  - With JavaScript disabled, native browser validation behaves as before.
- **Impact:** High
- **Effort:** Small

### IMP-UX-02 — Keep the visitor inside Vista after a successful inquiry

- **Affected journey:** Contact inquiry form submission, the step after a valid `booking` POST.
- **Evidence:** `contact.html:222`, `contact.html:296`, `js/features/form.js:165-175`, `netlify/_redirects`, `docs/CONTEXT-PROJECT.md` (Maintenance rules — "A new root page is packaged and precached automatically")
- **Current experience:** The `booking` form has no `action` attribute, and a valid enhanced submission calls native `form.submit()`. Netlify Forms' documented default without an `action` is a generic, Netlify-branded success page. Vista's navigation, theme and demonstration disclosure are not on that page. The in-page `.form__success` status ("Dziękujemy! Skontaktujemy się wkrótce.") is shown only on a branch for forms not named `booking`, so it never appears for the actual inquiry form. The post-submission screen was not observed on a live deployment.
- **Proposed improvement:** Point the form's `action` at a Vista-owned confirmation page. That page confirms the inquiry was sent to KP_Code Digital Studio, restates that nothing was reserved, and offers a return path (home and the offers or rooms page). It uses the existing shell and the `404.html`/`offline.html` message layout.
- **Expected user value:** The visitor gets confirmation in the site's own language, design and theme, with a clear next step. The page cannot suggest a reservation was made. The inquiry journey ends in Vista instead of on a third-party page.
- **Implementation scope:** A new root page (following the documented new-page contract: asset tags, full shell, `noindex,follow`, JSON-LD fallback plus `assets/seo/ld-<page>.json`, not added to `sitemap.xml`), and the `action` attribute in `contact.html`. Decide whether to remove the unreachable `.form__success` branch or leave it. Keep unchanged: `name="booking"`, the hidden `form-name`, `data-netlify`, the honeypot, the Edge Function, and the client-side validation. The Edge Function's plain-text HTTP 422 response is not part of this proposal.
- **Acceptance criteria:**
  - After a valid submission on a Netlify deploy, the browser shows the Vista confirmation page with the standard header, footer and theme toggle.
  - The page states that the inquiry is not a reservation.
  - The page offers at least one link back into the site.
  - `npm run check:links` passes, and `npm run build` packages and precaches the new page.
  - The page is `noindex,follow` and absent from `sitemap.xml`.
  - Netlify still records the submission under the `booking` form.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-03 — Carry the chosen offer into the inquiry form

- **Affected journey:** Offer browsing on `offers.html` → "Skorzystaj" → contact form.
- **Evidence:** `offers.html:153-229`, `index.html:459-486`, `contact.html:279-282`, `js/features/form.js:1-12`
- **Current experience:** Each of the six offer cards on `offers.html` has a "Skorzystaj" link, and each has an accessible name for its offer ("Skorzystaj z oferty Weekend dla dwojga"). All six point to the same `contact.html#form`. The form has no field or text that reflects the chosen offer, so a visitor who picked an offer arrives at a generic form and has to retype the offer name in "Wiadomość". On the homepage, the "Zostań dłużej" card also links directly to the form; the other three cards link to offer anchors on `offers.html`.
- **Proposed improvement:** Give each offer's "Skorzystaj" link an identifier of the offer. The existing card `id`s are candidates, for example `contact.html?oferta=weekend#form`. On the contact page, pre-fill the empty "Wiadomość" textarea with a short Polish line naming that offer (for example "Zapytanie dotyczy oferty: Weekend dla dwojga."). The visitor can still edit or delete the line.
- **Expected user value:** The visitor's choice survives the page change. The form confirms they arrived from the right offer, and the inquiry carries that context without extra typing.
- **Implementation scope:** The "Skorzystaj" `href` values in `offers.html` (and the homepage card that links straight to the form), plus a small enhancement in `js/features/form.js` or a sibling feature module called from `boot()`. Map only known offer identifiers to fixed offer names, and never write raw URL text into the page. Do not overwrite a textarea that already contains text. Do not add a new form field, change the Netlify field set, or imply a price or reservation. Without JavaScript, the links still open the form unchanged.
- **Acceptance criteria:**
  - Following "Skorzystaj" on the "Weekend dla dwojga" card opens `contact.html` at the form with the message field containing a line naming that offer; the same holds for each of the six offers.
  - An unknown or tampered `oferta` value leaves the textarea empty.
  - Opening `contact.html#form` directly leaves the textarea empty.
  - The pre-filled text can be edited and is submitted as the normal `message` field.
  - With JavaScript disabled, every "Skorzystaj" link still reaches the form.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Make room and gallery filter selections linkable and restorable

- **Affected journey:** Homepage room teasers → `rooms.html`; category filtering on `rooms.html` and `gallery.html`.
- **Evidence:** `index.html:301`, `index.html:344`, `index.html:387`, `index.html:444`, `rooms.html:149-168`, `rooms.html:220`, `rooms.html:272`, `js/features/room-filters.js:55-56`, `js/features/gallery-filters.js:33-44`
- **Current experience:** The homepage "Szczegóły" buttons for Classic, Deluxe and Luxury Suite, and the highlight's "Zobacz szczegóły", link to `rooms.html#rooms-panel-classic`, `#rooms-panel-deluxe`, `#rooms-panel-luxury` and `#luxury`. No element on `rooms.html` has those `id`s, and the room filter ignores the URL, so every link opens the unfiltered page at the top. The visitor then has to find and select the room category they just chose. The gallery reads a category from the URL hash on load, but its click handler calls `preventDefault()` without updating the hash. A selected gallery category is lost on reload and cannot be shared or bookmarked.
- **Proposed improvement:** Use one hash convention for filter state on both pages. `rooms.html` applies a category from a matching hash on load (for example `#deluxe`), and the homepage room links use that convention. Selecting a filter on either page records the category in the URL without adding a history entry per click. Room cards can carry matching `id`s so the same links still scroll to the card without JavaScript.
- **Expected user value:** A room chosen on the homepage opens already filtered to that category. A gallery or room selection survives reload and can be shared as a link. The pages behave consistently.
- **Implementation scope:** `js/features/room-filters.js`, `js/features/gallery-filters.js`, the four homepage room `href` values, and optional `id`s on the three room cards. Keep unchanged: the `aria-pressed`/`aria-current` state contract, the Arrow/Home/End focus handling, the `all` behavior, gallery section scrolling, the lightbox's use of `data-gallery-filter`, and no-JavaScript anchor navigation. Do not add ARIA tab semantics.
- **Acceptance criteria:**
  - Following the homepage "Szczegóły" link for Deluxe shows only Deluxe cards, with the Deluxe filter `aria-pressed="true"`. The same holds for Classic and Luxury Suite, including the highlight button.
  - After selecting "Wellness" in the gallery and reloading, the Wellness filter is still selected.
  - Repeated filter clicks do not add Back-button entries.
  - An unknown hash falls back to "all" on both pages.
  - With JavaScript disabled, the homepage room links open `rooms.html` with all cards visible.
- **Impact:** Medium
- **Effort:** Medium

### IMP-UX-05 — Show the visitor's position while browsing the lightbox

- **Affected journey:** Photo browsing in the `gallery.html` lightbox, across all categories and filtered subsets.
- **Evidence:** `js/features/lightbox.js:16-24`, `js/features/lightbox.js:32-59`, `js/features/lightbox.js:107-112`, `js/features/lightbox.js:148-149`, `gallery.html:1172-1206`
- **Current experience:** The lightbox shows the image and its caption, with "Poprzednie"/"Następne" buttons and Arrow-key navigation. It shows no position or total. Navigation wraps silently from the last image to the first, within the 20 photos or a filtered subset of four. When the image changes, only the `<img>` and a plain `figcaption` are updated. No status tells a screen-reader user that the image changed or which image is shown, because focus stays on the control.
- **Proposed improvement:** Add a compact position indicator (for example "3 / 4", with an accessible form such as "Zdjęcie 3 z 4") to the lightbox. It is computed from the same filtered item list the lightbox already navigates, updated on every open and step, and exposed through a polite status so image changes are announced.
- **Expected user value:** Visitors know how far through a category they are, notice when navigation wraps, and hear a concise confirmation when the image changes.
- **Implementation scope:** `js/features/lightbox.js`, one element in the lightbox markup in `gallery.html`, and minimal positioning in the existing lightbox CSS. Keep unchanged: the focus trap and restore via `modal-focus.js`, Escape handling, wrap-around behavior, fullscreen gestures, captions and alt text, and filter-aware item selection.
- **Acceptance criteria:**
  - Opening the third photo under "Pokaż wszystko" shows "3 / 20".
  - Under "Lobby", the first photo shows "1 / 4", and pressing ArrowLeft shows "4 / 4".
  - Each Next/Previous step updates the indicator, and a polite status announces the new position.
  - Keyboard focus stays on the activated control during navigation.
  - The open-lightbox scenario in `npm run test:a11y` reports no new violations when run.
- **Impact:** Medium
- **Effort:** Small

## Selection summary

The five proposals cover the site's main path, from browsing through the inquiry to its result. Each is grounded in current source behavior, not in a preferred alternative pattern.

Dependencies and grouping:

- IMP-UX-01 and IMP-UX-03 both touch `js/features/form.js`. Implement them in sequence, or put the offer pre-fill in its own feature module.
- IMP-UX-02 is independent of the client-side changes, but its final behavior can only be confirmed on a Netlify deploy.
- IMP-UX-04 and IMP-UX-05 both touch the gallery, and IMP-UX-05 must keep reading the filter state that IMP-UX-04 preserves. They can be implemented separately.

All five are Small or Medium and fit a focused backlog. IMP-UX-02 carries the most coordination because of the new-page contract.

Three further source-backed opportunities were ranked lower and not included:

- `rooms.html` ends after the room grid with no inquiry prompt. Room cards have no action, while `index.html` and `offers.html` close with the shared `section--cta` panel.
- Changing the arrival date silently moves an earlier departure date forward (`js/features/form.js:62`), and the visitor is not told.
- `offline.html` asks the visitor to "spróbuj ponownie" but offers no retry action.

## Analysis limitations

- **Static analysis only:** no browser session, screen reader or Netlify deployment was used. Statements about screen-reader output, scroll position and the Netlify post-submission page are source-based or rely on Netlify's documented default behavior.
- **Checks run:** `npm run check:links` passed. It checks file references and does not validate `#fragment` targets. No other checks were run.
- **Candidate defects outside this report:** these observations point to defects rather than optional improvements. They belong in an audit and are not proposals here:
  - The homepage "Dla całej rodziny" card links to `offers.html#biz` instead of `#family` (`index.html:485`).
  - Gallery filter scrolling uses `behavior: "smooth"` regardless of `prefers-reduced-motion` (`js/features/gallery-filters.js:48-62`).
  - The header CTA on every page and the homepage/offers CTA panels use "Rezerwuj" / "Zarezerwuj swój pobyt", while the legal pages and the form note state that no reservation is possible.
