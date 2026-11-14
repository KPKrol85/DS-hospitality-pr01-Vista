# Vista — Workflow Improvements

**Analysis date:** 2026-09-28

**Completion date:** 2026-09-29

**Project type:** Static multi-page HTML/CSS/vanilla JavaScript site with Node.js tooling and Netlify configuration

**Focus:** Project-wide development and maintenance workflow

**Status:** COMPLETED — both selected workflow improvements implemented and verified.

## Implementation closure

The workflow-improvement cycle is complete (2/2 items). Vista gained a dedicated read-only local preview for the generated `dist/` package, and workflow documentation ownership was established around `package.json` as the command authority and `docs/settings.md` as the detailed workflow guide. No new runtime dependencies, deployment changes, or architectural changes were introduced.

## Original assessment and evidence

The original evidence-based review found a source-mode development server, a clean source-to-`dist/` build, a dependency-free verification gate, and a separate browser accessibility check. At the **time of the 2026-09-28 analysis**, two workflow opportunities qualified:

- No npm command served the generated `dist/` package locally; `npm run dev` and the `test:a11y` check served source pages.
- Command and page-inventory details were repeated across README, project context, and settings documentation. The README and context still described an earlier two-check `qa:fast` sequence, the context and dist notes enumerated 11 pages while the build discovered 12 root HTML files automatically, and the context used historical `doc/` paths.

These are historical findings, not claims about the current implementation.

## Completed improvements

### IMP-WORKFLOW-01 — Provide a local preview for the generated package

- **Status:** COMPLETED (2026-09-28) — implemented and verified.
- **Result:** `npm run preview` served an existing `dist/` package at `http://127.0.0.1:8182/` without rebuilding or live reload, limited GET and HEAD requests to package files, rejected unsafe paths, and supplied `Service-Worker-Allowed: /` for `/pwa/service-worker.js`. A missing package exited non-zero with a `npm run build` instruction.
- **Verification:** Missing-package exit, clean production build, generated HTML and asset responses, worker header, HEAD without a body, inaccessible repository files, malformed paths, unchanged package contents, port-in-use error, and Chromium registration at scope `/` passed. `npm run qa:fast` and `git diff --check` passed. Netlify platform features were not tested or emulated.
- **Impact:** Medium (qualitative estimate)
- **Effort:** Medium (qualitative estimate)

### IMP-WORKFLOW-02 — Give workflow documentation one maintenance path

- **Status:** COMPLETED (2026-09-29) — implemented and verified.
- **Result:** Established `package.json` as command authority and `docs/settings.md` as the detailed workflow guide, with concise PL/EN README usage, stable project-context maintenance rules, and distribution-specific dist notes. Documented all four `qa:fast` checks and the production preview, replaced fixed page inventories with automatic root HTML discovery, and corrected active documentation paths; historical records remained unchanged.
- **Verification:** Compared all 17 command-table entries with `package.json`; reviewed preview and page discovery against their source scripts; checked README PL/EN factual parity, matching code spans and links, and absence of stale paths/page counts in maintained guides. `git diff --check` passed. No QA suite, build, browser check, or deployment was run for these documentation-only changes.
- **Impact:** Medium (qualitative estimate)
- **Effort:** Small (qualitative estimate)

## Selection notes

IMP-WORKFLOW-01 concerned local inspection of the production package, and IMP-WORKFLOW-02 concerned maintenance of the instructions for that workflow. They were technically independent, although documenting the preview command was simplest after it existed. No additional proposal was added merely to reach five: the completed Quality report already covered booking-date, JSON-LD, accessibility, and image-pipeline safeguards, and the archived UI/UX reports concerned visitor-facing behavior.

## Verification history and limitations

The original analysis was a static repository and documentation review with read-only Git inspection. No build, browser session, deployment, Netlify Forms request, or CI run was performed at that stage, and an attempted `npm run qa:fast` did not start because the command runner failed while creating the process. Successful checks listed in the records above were reported during their **subsequent implementation phases**, not during this archival redaction.
