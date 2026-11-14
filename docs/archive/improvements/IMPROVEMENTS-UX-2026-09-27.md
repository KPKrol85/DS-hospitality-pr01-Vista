# Vista — UX Improvements

**Analysis date:** 2026-09-26

**Completion date:** 2026-09-27 (implementation review)

**Project type:** Static multi-page website (HTML, modular CSS, vanilla JavaScript) with a Node.js build pipeline and Netlify configuration

**Focus:** Project-wide UX

**Status:** COMPLETED — all five UX improvements implemented and accepted; IMP-UX-02 verified by live acceptance.

## Implementation closure

The UX-improvement cycle was closed in the 2026-09-27 implementation review, which recorded all five improvements as implemented and accepted. The work refined the transitions between existing journeys, from browsing rooms, offers, and the gallery to sending a project inquiry, without adding a booking capability or changing the site's demonstrational scope. Remaining unrelated defects and lower-priority opportunities were left for separate handling.

## Original assessment and evidence

The original evidence-based review found the core interactions in place: native form constraints with enhanced validation, filters with ARIA state, a focus-managed lightbox, and a no-JavaScript baseline. At the **time of the 2026-09-26 analysis**, the principal findings were:

- After a failed submission, focus stayed on the submit button, and the name, email, departure, and consent errors remained visible after correction until the next submission.
- The `booking` form had no `action`, so a successful submission would reach Netlify's generic success page outside Vista; the in-page success status was unreachable for this form.
- All six offer "Skorzystaj" links pointed to the same `contact.html#form`, so the chosen offer was lost on the way to the form.
- Homepage room links targeted `rooms.html` IDs that did not exist, the room filter ignored the URL, and gallery selections were not written to the URL.
- The lightbox showed no position or total, wrapped silently, and did not announce image changes.

These are historical findings, not claims about the current implementation.

## Completed improvements

### IMP-UX-01 — Guide the visitor from a failed submission to a corrected form

- **Status:** COMPLETED — implemented and accepted; no specific verification recorded.
- **Result:** Improved invalid-field focus and live error recovery in the contact form.
- **Verification:** Accepted in the 2026-09-27 implementation review; no specific checks or results were recorded.
- **Impact:** High
- **Effort:** Small

### IMP-UX-02 — Keep the visitor inside Vista after a successful inquiry

- **Status:** COMPLETED — implemented and verified.
- **Result:** Directed successful `booking` submissions to a Vista-owned confirmation page instead of Netlify's generic success page.
- **Verification:** Live acceptance on 2026-09-27: a successful form POST on Netlify redirected to the Vista confirmation page, and Netlify Forms recorded the `booking` submission, which was classified as spam.
- **Impact:** High
- **Effort:** Medium

### IMP-UX-03 — Carry the chosen offer into the inquiry form

- **Status:** COMPLETED — implemented and accepted; no specific verification recorded.
- **Result:** Offer selection was preserved in the contact form through validated URL identifiers and editable message prefill. The incorrect homepage "Dla całej rodziny" link to `offers.html#biz`, noted during analysis, was resolved in this item.
- **Verification:** Accepted in the 2026-09-27 implementation review; no specific checks or results were recorded.
- **Impact:** Medium
- **Effort:** Small

### IMP-UX-04 — Make room and gallery filter selections linkable and restorable

- **Status:** COMPLETED — implemented and accepted; no specific verification recorded.
- **Result:** Room and gallery filters supported shareable URL fragments and restored the selected category on reload.
- **Verification:** Accepted in the 2026-09-27 implementation review; no specific checks or results were recorded.
- **Impact:** Medium
- **Effort:** Medium

### IMP-UX-05 — Show the visitor's position while browsing the lightbox

- **Status:** COMPLETED — implemented and accepted; no specific verification recorded.
- **Result:** Both Vista lightboxes displayed an accessible position indicator based on the current navigable photo set.
- **Verification:** Accepted in the 2026-09-27 implementation review; no specific checks or results were recorded.
- **Impact:** Medium
- **Effort:** Small

## Selection and out-of-scope notes

The five items covered the site's main path, from browsing through the inquiry to its result. Original dependency notes: IMP-UX-01 and IMP-UX-03 both touched `js/features/form.js`; IMP-UX-02 was independent of client-side changes but could only be confirmed on a Netlify deploy; IMP-UX-04 and IMP-UX-05 both touched the gallery, with IMP-UX-05 relying on the filter state preserved by IMP-UX-04.

Three lower-ranked opportunities were not included:

- `rooms.html` ended after the room grid with no inquiry prompt, unlike `index.html` and `offers.html`.
- Changing the arrival date silently moved an earlier departure date forward.
- `offline.html` asked the visitor to "spróbuj ponownie" without offering a retry action.

The analysis also recorded candidate defects for an audit rather than this report: the homepage family-offer link (resolved in IMP-UX-03), gallery filter scrolling with `behavior: "smooth"` regardless of `prefers-reduced-motion`, and "Rezerwuj" / "Zarezerwuj swój pobyt" CTA wording that conflicted with statements that no reservation was possible.

## Verification history and limitations

The original analysis was static: no browser session, screen reader, or Netlify deployment was used, and statements about screen-reader output, scroll position, and the Netlify post-submission page were source-based or relied on Netlify's documented defaults. `npm run check:links` passed; it checks file references and does not validate `#fragment` targets.

Only IMP-UX-02 has recorded verification evidence, from the 2026-09-27 live acceptance. The other four items are recorded as implemented and accepted, without specific checks or results; their status is preserved as originally recorded, and no verification has been inferred or added during this archival redaction.
