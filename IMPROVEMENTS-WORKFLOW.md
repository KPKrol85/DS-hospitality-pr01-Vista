# Vista — Workflow Improvements

**Analysis date:** 2026-09-28  
**Project type:** Static multi-page HTML/CSS/vanilla JavaScript site with Node.js tooling and Netlify configuration  
**Analysis mode:** Evidence-based workflow improvement review  
**Focus:** Project-wide development and maintenance workflow

## Improvement overview

The project has a source-mode development server, a clean source-to-`dist/` build, a dependency-free static verification gate, and a separate browser accessibility check. Two distinct workflow opportunities qualified: make the generated package straightforward to inspect locally, and reduce manual synchronization of repeated workflow documentation. IMP-WORKFLOW-01 has since been completed; IMP-WORKFLOW-02 remains a proposal.

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

- **Affected workflow:** Updating developer command and generated-page guidance when scripts or public pages change.
- **Evidence:** `package.json:16-21`; `README.md:73-79,183-189`; `docs/settings.md:5-22`; `docs/CONTEXT-PROJECT.md:32,158-170,202-214`; `docs/dist-notes.md:5-16`; `scripts/build-dist.mjs:67-73,313-315`.
- **Current workflow:** `package.json` defines the commands, while the README, project context, and settings guide repeat details of `qa:fast`. The README and context describe its earlier two-check sequence, although the current script also runs booking-date and JSON-LD checks. The context and dist notes enumerate 11 pages, while the build discovers root HTML files automatically and the repository now contains 12. The project context also uses historical `doc/` paths where the current folder is `docs/`. These factual discrepancies are documentation defects; the workflow opportunity is the repeated maintenance that allows them to recur.
- **Proposed improvement:** Define a compact ownership rule for command and page-inventory descriptions: `package.json` remains the command authority, one maintained guide carries command details, and other documents link to it or state only stable use cases. Describe automatic page discovery instead of maintaining independent page lists where an exact list is unnecessary. State which documentation is checked when scripts or root pages change.
- **Expected practical value:** Fewer manually synchronized descriptions and a clearer update path for future build or verification changes.
- **Implementation scope:** Narrow edits to the relevant README and `docs/` workflow sections only. Correct the identified stale claims as factual maintenance while establishing ownership; retain Polish/English README parity and the existing build, QA, Git, and Netlify contracts. No new generator, dependency, or broad documentation rewrite.
- **Acceptance criteria:** The published command descriptions agree with `package.json`; the README's Polish and English sections remain factually equivalent; no maintained document asserts a fixed 11-page package or a `doc/` directory; a maintainer can identify the document to update when an npm command or root HTML page is added; no script behavior changes.
- **Impact:** Medium (qualitative estimate).
- **Effort:** Small (qualitative estimate).

## Selection summary

Both proposals address existing workflows and can be implemented in focused sessions. IMP-WORKFLOW-01 concerns local inspection of the production package; IMP-WORKFLOW-02 concerns maintenance of the instructions for that workflow. They are technically independent, though documenting a new preview command is simplest after it exists. No additional proposal was added merely to reach five: the completed Quality report already covers booking-date, JSON-LD, accessibility, and image-pipeline safeguards, and the archived UI/UX reports concern visitor-facing behavior.

## Analysis limitations

This was a static repository and documentation review with read-only Git inspection. No build, browser session, deployment, Netlify Forms request, or CI run was performed. An attempted `npm run qa:fast` did not start because the command runner failed while creating the process; its current result is therefore unverified here. The report does not infer live-platform behavior from configuration. Existing factual documentation discrepancies are identified as corrections, not counted as separate optional improvements. No proposed improvement was implemented.
