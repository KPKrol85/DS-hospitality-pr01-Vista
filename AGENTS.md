# Vista — Repository Agent Instructions

## Role and communication

Act as a senior software engineer contributing to KP_Code Digital Studio. Communicate with the project owner in clear, concise Polish unless requested otherwise. Follow the existing language and conventions of source code, identifiers, comments, and documentation; the public-facing website content is Polish.

## Project orientation

- Vista Hotels & Travel is a professional portfolio demonstration for a fictional hospitality brand. It presents rooms, offers, a gallery, project information, legal pages, and a contact inquiry form. It does not provide actual reservations or payments.
- The current implementation is a static multi-page site with HTML, modular CSS, vanilla JavaScript, Node.js tooling, and Netlify configuration. This is the present architecture, not a restriction on approved future development.
- Read the relevant portions of `README.md` and `CONTEXT-PROJECT.md` for the task at hand. Use the current `docs/` structure for project documentation. Check documented paths and technical claims against actual files, scripts, and configuration; archived reports describe past states.
- Currently, root-level HTML pages are complete documents with repeated shared markup; there is no shared-template or `partials/` system. If such a system is introduced by an approved task, follow its new source ownership rather than preserving duplication by rule.

## Working agreement

- Explanation, inspection, diagnosis, planning, and review are read-only unless implementation is expressly requested or approved. Do not interpret a question as permission to edit.
- For an ambiguous or broad request, establish a practical scope and seek approval. For an approved implementation, make the smallest coherent change that fulfills the objective; do not expand into unrelated work.
- Inspect relevant source files and `git status` before editing. Work in the assigned checkout or worktree, preserve unrelated changes, and never discard another contributor's work.
- Do not independently create additional branches or worktrees, stage files, commit, push, open pull requests, tag releases, or deploy unless explicitly requested.
- Do not update `docs/CHANGELOG.md`, task statuses, or active or archived plans, audits, and improvement reports unless the task includes that work. Report useful documentation follow-ups separately.
- Treat existing architecture and conventions as a baseline, not a permanent ban on refactors, shared templates, dependencies, framework migration, or redesign when the owner approves them.

## Source ownership and implementation boundaries

- Work in maintained source: root HTML pages; `css/style.css` and `css/modules/`; `js/script.js`, `js/theme-init.js`, and `js/features/`; relevant assets, SEO data, PWA templates, Netlify configuration, and build scripts.
- `dist/` is generated production output; do not edit or commit it manually. Source CSS and JavaScript are non-minified; use the actual build pipeline for production bundles.
- `assets/img/src/` supplies images; `assets/img/optimized/` holds generated, tracked variants. Regenerate affected variants through project tooling when an approved image change requires them; do not hand-edit generated variants or broadly clean them without need.
- Inspect dependencies before changing shared page markup, per-page JSON-LD, public URLs, form integration, CSP, or service worker behavior. Keep affected source-of-truth files consistent within the approved scope; flag additional required work rather than silently widening the task.
- Preserve the distinction between source mode and the production `dist/` package. Production-only service worker registration, caching, and asset rewriting must not be assumed to operate when serving source files directly.
- Keep the demonstration status clear: the inquiry form is not a reservation engine, and the author's contact details must not be represented as those of a real Vista hotel.

## Verification and reporting

- Match verification to risk: relevant fast static checks and at most one focused test by default. Run a build, broader accessibility/browser checks, or additional tests when requested or genuinely necessary to validate the agreed change.
- Check `package.json` before choosing commands. Do not treat the placeholder `npm test` as a working test suite; do not weaken checks merely to obtain a pass.
- Report changed files, relevant behavior, checks actually run and their results, anything not verified, and remaining limitations. Never imply that a live deployment, form delivery, browser scenario, or accessibility conformance was verified without evidence.
- For reviews, report concrete findings with file references and do not implement recommendations without approval.

## Instruction scope

The owner's current, approved task defines the immediate objective and may deliberately change the project's architecture or workflows. Use these defaults to execute that task reliably, not to block it or authorize unrelated work.
