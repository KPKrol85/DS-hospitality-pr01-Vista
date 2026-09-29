# Vista — Workflow Improvements

**Analysis date:** 2026-09-28
**Project type:** Static multi-page HTML/CSS/vanilla JavaScript site with Node.js tooling and Netlify configuration
**Analysis mode:** Evidence-based workflow improvement review
**Focus:** Project-wide development and maintenance workflow

## Improvement overview

The project has a source-mode development server, a clean source-to-`dist/` build, a dependency-free verification gate, and a separate browser accessibility check. Two distinct workflow opportunities qualified: make the generated package straightforward to inspect locally, and reduce manual synchronization of repeated workflow documentation. IMP-WORKFLOW-01 and IMP-WORKFLOW-02 have since been completed.

## Proposed improvements

### IMP-WORKFLOW-01 — Provide a local preview for the generated package

- **Status:** COMPLETED (2026-09-28).
- **Completion summary:** `npm run preview` serves an existing `dist/` package at `http://127.0.0.1:8182/` without rebuilding or live reload. It limits GET and HEAD requests to package files, rejects unsafe paths, and supplies `Service-Worker-Allowed: /` for `/pwa/service-worker.js`. A missing package exits non-zero with a `npm run build` instruction.
- **Completion verification:** Missing-package exit, clean production build, generated HTML and asset responses, worker header, HEAD without a body, inaccessible repository files, malformed paths, unchanged package contents, port-in-use error, and Chromium registration at scope `/` passed. `npm run qa:fast` and `git diff --check` passed. Netlify platform features were not tested or emulated.
- **Affected workflow:** Production-build inspection before deployment.
- **Evidence:** `package.json:6-11,21`; `scripts/dev-server.mjs:7-9,18-21,66-69,128-168`; `scripts/build-dist.mjs:67-73,219-238,313-348`; `docs/CONTEXT-PROJECT.md:35-38,141-155,169`; `netlify.toml:1-3`.
- **Workflow before implementation:** `npm run dev` serves canonical source files and excludes `dist/`. `npm run build` creates a separate production package whose HTML references bundled assets and registers a generated service worker. The project had no npm command dedicated to serving that package locally; the configured `test:a11y` check serves source pages.
- **Proposed improvement:** Add one explicit, read-only local preview command for an already built `dist/` package. Reuse the existing HTTP-serving conventions where practical. Keep source development and Netlify-specific behavior clearly separate.
- **Expected practical value:** A repeatable way to inspect the exact packaged HTML, bundles, asset paths, and service-worker registration before handing the package to Netlify, without an ad hoc server setup.
- **Implementation scope:** A focused npm script and the minimum server code needed to serve `dist/` at a local root origin with correct content types and a clear error when the package is absent. Do not rebuild on preview, expose repository sources, emulate Netlify Forms/Edge Functions, or change deployment configuration.
- **Acceptance criteria:** After `npm run build`, one documented command serves the generated root pages and assets from `dist/`; a missing package fails clearly; requests cannot access source/tooling files; the command makes no project-file changes; a focused browser check can distinguish production-marked HTML and worker registration from source mode.
- **Impact:** Medium (qualitative estimate).
- **Effort:** Medium (qualitative estimate).

### IMP-WORKFLOW-02 — Give workflow documentation one maintenance path

- **Status:** COMPLETED (2026-09-29).
- **Completion summary:** Established `package.json` as command authority and `docs/settings.md` as the detailed workflow guide, with concise PL/EN README usage, stable project-context maintenance rules, and distribution-specific dist notes. Documented all four `qa:fast` checks and the existing production preview, replaced fixed page inventories with automatic root HTML discovery, and corrected active documentation paths. Historical records remain unchanged.
- **Completion verification:** Compared all 17 command-table entries with `package.json`; reviewed preview and page discovery against their source scripts; checked README PL/EN factual parity, matching code spans and links, and absence of stale paths/page counts in maintained guides. `git diff --check` passed. No QA suite, build, browser check, or deployment was run for these documentation-only changes.
- **Affected workflow:** Updating developer command and generated-page guidance when scripts or public pages change.
- **Evidence:** `package.json:16-21`; `README.md:73-79,183-189`; `docs/settings.md:5-22`; `docs/CONTEXT-PROJECT.md:32,158-170,202-214`; `docs/dist-notes.md:5-16`; `scripts/build-dist.mjs:67-73,313-315`.
- **Workflow before implementation:** `package.json` defines the commands, while the README, project context, and settings guide repeat details of `qa:fast`. The README and context describe its earlier two-check sequence, although the current script also runs booking-date and JSON-LD checks. The context and dist notes enumerate 11 pages, while the build discovers root HTML files automatically and the repository now contains 12. The project context also uses historical `doc/` paths where the current folder is `docs/`. These factual discrepancies are documentation defects; the workflow opportunity is the repeated maintenance that allows them to recur.
- **Proposed improvement:** Define a compact ownership rule for command and page-inventory descriptions: `package.json` remains the command authority, one maintained guide carries command details, and other documents link to it or state only stable use cases. Describe automatic page discovery instead of maintaining independent page lists where an exact list is unnecessary. State which documentation is checked when scripts or root pages change.
- **Expected practical value:** Fewer manually synchronized descriptions and a clearer update path for future build or verification changes.
- **Implementation scope:** Narrow edits to the relevant README and `docs/` workflow sections only. Correct the identified stale claims as factual maintenance while establishing ownership; retain Polish/English README parity and the existing build, QA, Git, and Netlify contracts. No new generator, dependency, or broad documentation rewrite.
- **Acceptance criteria:** The published command descriptions agree with `package.json`; the README's Polish and English sections remain factually equivalent; no maintained document asserts a fixed 11-page package or a `doc/` directory; a maintainer can identify the document to update when an npm command or root HTML page is added; no script behavior changes.
- **Impact:** Medium (qualitative estimate).
- **Effort:** Small (qualitative estimate).

## Selection summary

Both proposals address existing workflows and were implemented in focused sessions. IMP-WORKFLOW-01 concerns local inspection of the production package; IMP-WORKFLOW-02 concerns maintenance of the instructions for that workflow. They are technically independent, though documenting a new preview command was simplest after it existed. No additional proposal was added merely to reach five: the completed Quality report already covers booking-date, JSON-LD, accessibility, and image-pipeline safeguards, and the archived UI/UX reports concern visitor-facing behavior.

## Completion summary

- **Status:** COMPLETED
- **Completion date:** 2026-09-29
- Both selected workflow improvements were implemented and verified.
- Vista now has a dedicated read-only local preview for the generated `dist/` package at `127.0.0.1:8182`.
- Workflow documentation ownership is established around `package.json` as the command authority and `docs/settings.md` as the maintained detailed workflow guide.
- Maintained documentation now reflects the current `qa:fast` chain, production preview workflow, automatic root HTML discovery, and active `docs/` paths.
- No new runtime dependencies, deployment changes, or architectural changes were introduced.
- This report is archived as the completed record of the workflow-improvement cycle.

## Original analysis limitations

The original analysis was a static repository and documentation review with read-only Git inspection. At that stage, no build, browser session, deployment, Netlify Forms request, or CI run was performed. An attempted `npm run qa:fast` did not start because the command runner failed while creating the process.

These limitations describe the initial analysis only. Subsequent implementation verification is recorded under the individual completed improvement entries above.
