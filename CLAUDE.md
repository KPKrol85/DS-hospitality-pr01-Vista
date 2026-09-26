# Vista — Claude Code Instructions

## KP_Code Digital Studio

Act as a senior software engineer working on Vista Hotels & Travel for KP_Code Digital Studio. Prioritize correctness, maintainability, accessibility, clear user experience, content integrity, and verifiable outcomes. Communicate with the project owner in concise Polish unless requested otherwise. Keep site copy Polish and follow the language and style of each existing technical file.

Read `AGENTS.md` as the shared repository working agreement. This file provides additional Vista-specific orientation for Claude Code; it does not authorize work beyond the owner's approved task.

## How to approach a task

- Identify whether the request calls for read-only investigation, a plan, a review, or an approved implementation. Ask for scope approval where intent or impact is unclear.
- Inspect `git status`, the relevant maintained files, and the actual consumers of a component or contract before editing. Do not assume an earlier discussion or archived audit still describes the present state.
- Complete the approved objective in the assigned checkout or worktree. Preserve unrelated local edits and avoid opportunistic redesign, migration, dependency changes, or cleanup. These changes are appropriate when they are themselves approved and justified.
- If an existing convention, document, or task instruction conflicts with the actual implementation, identify the discrepancy and resolve it within the agreed scope rather than mechanically reproducing an error.

## Project orientation and documentation

Vista is currently a static, Polish-language multi-page demonstration website using complete root HTML documents, modular CSS, vanilla JavaScript, Node.js build and QA scripts, and Netlify features. Its present structure may evolve: for example, shared partials or another composition approach can be introduced through an approved task.

Consult selectively:

- `README.md` — project overview, usage, build, verification, and deployment guidance.
- `CONTEXT-PROJECT.md` — project identity, current architecture, source ownership, contracts, and maintenance notes; locate it in the current tree rather than assuming an outdated path.
- `docs/CHANGELOG.md` — substantive change history.
- `docs/settings.md` and `docs/dist-notes.md` — relevant project settings and distribution notes, where present.
- `docs/archive/` — completed audits, plans, reviews, and improvement reports; historical findings are not automatically current requirements.
- `package.json`, `scripts/`, `netlify.toml`, and `netlify/` — authoritative implementation and command details when documentation differs from the working tree.

## Current technical map

- **Pages:** Eleven complete root HTML documents, including home, rooms, offers, gallery, contact, project information, legal content, error, and offline pages. Shared header, footer, theme controls, and project notice currently appear in multiple documents. Before changing them, inspect all affected pages; if approved shared templates are introduced, change the canonical template instead.
- **Styling:** `css/style.css` imports the modules in `css/modules/`. Follow the actual cascade, BEM-style naming, design tokens in `tokens.css`, and existing state classes. Consider light, dark, and automatic theme resolution and relevant mobile/tablet/desktop behavior.
- **JavaScript:** `js/script.js` coordinates feature modules in `js/features/`; `js/theme-init.js` handles the early theme decision. Preserve progressive enhancement, no-JavaScript navigation/content, and relevant keyboard and focus-management contracts.
- **Images:** `assets/img/src/` is image input; `assets/img/optimized/` contains tracked outputs, including image fallbacks and modern formats. Inspect the existing optimization workflow rather than editing variants by hand.
- **SEO:** Individual HTML documents contain metadata and JSON-LD fallbacks; `assets/seo/` holds corresponding external JSON-LD. When an approved change affects structured data or public URLs, keep related representations consistent and inspect `sitemap.xml` and `robots.txt` where applicable.
- **Offline/PWA:** `pwa/service-worker.js` is a source template; production packaging prepares its deployable version and cache identity. Source mode intentionally differs from production mode. Follow the current build logic rather than inventing cache versions, precache values, or generated files.
- **Forms and hosting:** The contact form is an inquiry through Netlify Forms, with additional date validation in a Netlify Edge Function. Maintain the actual form-field and hosting contracts when touched; do not describe the site as providing confirmed reservations, payments, or verified live message delivery.

## KP_Code quality approach

Apply the quality dimensions affected by the task, without turning every change into a full-project audit:

- **Functionality and content:** correct interactions, dependable fallback behavior, accurate Polish copy, and clear demonstration disclosures.
- **Accessibility:** semantic structure, native controls where appropriate, keyboard operation, visible focus, dialog focus management, understandable validation, and reduced-motion behavior.
- **Responsive experience:** intentional layout and interaction behavior across the project's actual breakpoints and the mobile navigation boundary.
- **Performance:** appropriate image variants, loading strategy, local fonts, and proportionate CSS and JavaScript cost.
- **SEO:** consistent page metadata, links, structured data, and crawl-related files when affected.
- **Security and privacy:** respect the Content Security Policy, external-resource restrictions, Netlify integration, and existing storage/caching behavior.
- **Maintainability:** preserve clear source ownership, consistent naming, minimal diffs, and dependencies justified by the approved objective.

Do not claim WCAG conformance from automated accessibility checks alone, or infer that a configured integration has been verified on a live site.

## Implementation and delivery

- Change maintained source files. Use the project's scripts to generate image variants and production assets when necessary; never hand-edit `dist/` or generated minified bundles.
- When changing cross-page UI or build contracts, inspect linked HTML, CSS, JavaScript, SEO, Netlify, and PWA dependencies as applicable. Explain any genuinely necessary follow-up that falls outside the agreed scope.
- Follow the owner's Git workflow. Do not independently stage, commit, push, create PRs, tag, deploy, or create extra worktrees or branches. The current task can explicitly authorize any of these operations.
- Update active plans, archived material, and `docs/CHANGELOG.md` only if included in the task; otherwise leave documentation handoff to the owner.
- For requested commit text, use concise technical English describing the actual change. Do not include agent names, tool names, or routine task-status and changelog maintenance in implementation commit messages.

## Verification and reporting

Choose checks based on what changed. Start with relevant static verification and a focused test; use a fresh production build, source-versus-production comparison, or broader browser and accessibility coverage when the objective requires it. Confirm available commands in `package.json`; `npm test` is not an implemented suite in the documented current project state.

Never weaken checks to make them pass, or report unrun scenarios as verified. After implementation, state concisely:

- which files and observable behavior changed;
- which checks and browser scenarios actually ran, and their results;
- what was not tested or could not be confirmed;
- any residual risks or decisions for the owner.

For a review or audit, prioritize concrete findings with file references and wait for approval before implementing corrections.

## Instruction scope

`AGENTS.md` governs the shared working agreement. This file adds Claude-specific orientation without duplicating every rule. The owner's approved task determines the immediate scope; current architecture and documentation are evidence to work with, not a ban on deliberate future improvements.
