# Portfolio working instructions

Applies to this repository. Keep this file current when the user changes project constraints, design decisions, architecture, or verification workflows. Replace stale guidance rather than appending a conversation log. Current user instructions take precedence.

## User constraints and publishing status

- Work in this repository. Preserve unrelated and uncommitted work; do not reset it or overwrite another agent's edits.
- Spend no money. Do not purchase domains, upgrade plans, or enable paid or metered add-ons.
- The current guided-journey feature is **local development only**, on `feature/guided-portfolio-journey-v0.1`, created from verified, fetched `main` commit `54aa7caa962240e873a1cf3913e5f6bcae7d7a16`. Keep all feature work on this branch. Do not modify, merge into or push `main`.
- Do not deploy, configure hosting, change infrastructure or touch production for this feature. This explicit restriction supersedes the earlier deployment permission for the current task. The previously published portfolio remains live and untouched at [raghav-agarwal.raghagarwal.workers.dev](https://raghav-agarwal.raghagarwal.workers.dev/). Historical hosting instructions below are reference material, not permission to execute them.
- Public GitHub, LinkedIn, and other first-party sources may be inspected when needed to verify portfolio content. Do not invent professional achievements, measurements, or project capabilities.
- If deployment is separately authorized in the future, upload only the public production output in `dist/`. The previous publication does not authorize uploading private repository files or changing repository visibility.

## Design direction to preserve

- The user likes the cinematic SpaceX-inspired direction: black backgrounds, large uppercase Barlow headings, generous space, restrained outline controls, authentic planetary photography, and the current navbar/contact composition.
- Use original identity and graphics; do not imply SpaceX or NASA affiliation. Avoid replacing authentic Mars imagery with synthetic-looking planetary artwork.
- The brand mark is now the custom **RA ascent monogram**, with angular initials, an amber star, and an open flight path. Keep `src/components/Icons.tsx` and `public/favicon.svg` visually consistent. Navbar/footer hover and focus motion must respect reduced-motion preferences.
- Keep desktop and mobile compositions intentional. Inspect actual screenshots after visible design changes; passing overflow checks alone does not verify visual quality.
- Retain visible focus, keyboard interaction, semantic headings, and reduced-motion behavior when refining the presentation.

## Guided journey feature

- The optional ten-chapter journey starts from the hero's **Let me show you around** invitation. Its chapters are Liftoff, Performance, Human judgement, The whole system, Your move, Break the connection, Find a connection, The trajectory, Beyond the code and What's next. The trajectory adds narration above the existing Experience timeline; retain its actual roles, dates and details. Preserve normal browsing, section navigation, photography, personal projects and public information. Do not turn the page into a mandatory tour or broadly redesign it.
- Use concise first-person narration grounded in verified content. Integrate narration with the current sections rather than a generic tooltip tour; do not invent personal history, achievements, numerical results or project capabilities.
- Keep journey state in React memory only. Do not write tour state to URLs, browser history or persistent storage. Refresh returns to normal browsing; normal anchor navigation and browser-history navigation exit the journey.
- Progress is visitor-controlled through Next, Back, Exit, Escape and chapter selection. Chapter changes use instant scroll cuts and focus the chapter heading; reduced motion disables the brief visual settling effect. Do not add timed progression or scroll locks. Free scrolling offers a return-to-chapter control. Exit restores a visible heading or main-region focus without forcing the visitor back to the hero. Keep restoration synchronous with the DOM update so it cannot steal focus from an immediate keyboard restart.
- `FlightPlan.tsx` and `.css` provide a native dialog for jumping to any chapter, with current-location and completed-experiment indicators. Preserve modal focus, close/return focus and Escape handling without accidentally exiting the journey. Chapter selection must focus the destination heading.
- Preserve native keyboard ownership: form controls and the rocket retain arrow keys, native selects retain Escape, and an open case-study disclosure handles Escape before the journey. Respect `defaultPrevented`. Keep the keyboard skip-to-controls and demo-focus actions usable.
- Keep the existing demos mounted so their state persists across chapter changes, exit and restart. Restarting the journey does not reset demos. Narration feedback must come from real demo events. Their controls, source links and explanatory caveats remain usable. Retain the rocket scrollbar's normal native-scroll behavior; its ten journey markers are decorative and positioned from actual section locations.
- Three optional discovery milestones record a valid Sudoku move or solve, an actual transport timeout retry, and a changed movie selection or feature mode. Never gate navigation on completion. Retain discoveries in React memory for the current page session, including exit/restart, and clear them on refresh. The ending presents all three states and buttons to revisit demos; these indicators must reflect real interactions.
- Use the existing React/CSS/SVG architecture. No new backend, accounts, analytics, paid API, LLM service or large tour/animation dependency is needed.
- Verify normal mode as well as every journey chapter on desktop and mobile. `tests/journey.spec.ts` covers entry, progression, chapter selection, exit/Escape, navigation/history exit, refresh, reduced motion, focus and demo state preservation. Include the Experience chapter, flight-plan keyboard/focus behavior, optional milestone triggers and ending revisit controls. Preserve the no-JavaScript normal page with its hidden invitation. Inspect screenshots as well as automated results, and do not report test coverage as proof that a new run passed.

## Architecture and feature boundaries

- React + TypeScript + Vite, requiring Node.js 22.12 or newer. Production builds are static files in `dist/`.
- `scripts/prerender.mjs` generates HTML at build time; the browser hydrates it. There is no production Node server, live backend, database, or external runtime API required by this portfolio.
- `src/data/content.ts` owns identity, public links, professional content, and project descriptions. `src/data/journey.ts` owns chapter narration and targets; keep both sources factually consistent. `JourneyProvider`, `JourneyContext` and `JourneyCopy` in `src/components/journey/` supply the optional journey without remounting the page. `Readme.md` describes the component structure in detail.
- Shared styles load in this order: `styles.css`, `scenes.css`, `chapters.css`, then `components/journey/Journey.css`. Check existing overrides before adding more. Keep new component styles scoped and preserve the normal composition when journey mode is inactive.
- `ObservatoryVisual.tsx` and `marsRenderer.ts` render a rotating NASA/USGS surface map using native WebGL. Preserve the photographic fallback, explicit play/pause, reduced-motion loading behavior, mobile texture, and offscreen/hidden-tab suspension. Avoid adding a large graphics dependency for cosmetic changes.
- Engineering case studies use native `<details>` disclosures, remain readable without JavaScript, and support Escape-to-close with focus restoration. Their diagrams are conceptual illustrations, not actual employer architecture or internal screenshots.
- `RocketScrollbar.tsx` enhances desktop fine-pointer screens at least 900px wide after hydration. Preserve dragging, track clicks, keyboard controls, page-length recalculation, and cleanup. Touch/narrow screens, forced colors, and no-JavaScript browsing retain the native scrollbar. Do not intercept wheel or trackpad scrolling.
- Personal project previews run locally in the browser. Preserve the original project/source links and distinguish these previews from the original applications:
  - **Sudoku:** a preset from the original live project, editable cells, conflict feedback, keyboard navigation, recursive backtracking, and reset. Do not claim procedural puzzle generation or guaranteed uniqueness.
  - **Transport:** a simplified deterministic six-segment simulation with a three-packet window, cumulative acknowledgments, data/ACK loss, timeout retries, ordered buffering, and duplicate suppression. It does not send real network packets or reproduce the entire Python protocol. Autoplay must be user-initiated and pause offscreen or when the tab is hidden.
  - **Movies:** a hand-curated sample catalogue, raw term counts, smoothed TF-IDF, L2 normalization, and cosine similarity. Results are calculated, not canned. Scores mean content similarity, not confidence or accuracy. Do not imply a live movie catalogue, running Python backend, or continuously learning model.

## Content and asset integrity

- Keep the Polars performance improvement qualitative unless the user supplies a verified measurement. Applied AI work is explicitly in development.
- Do not add a résumé download until a current résumé is supplied or verified. Do not add an unverified authenticated project journey as a working demo.
- Do not use, test, copy, or expose credentials encountered in upstream project sources. Local previews must not connect to those projects' databases or backends.
- Keep private verification notes out of public files, build output, and commits. Do not copy the private verification ledger into this file.
- Images and fonts are self-hosted. Preserve font licenses and image-specific attribution/reuse terms in `docs/image-credits.md` and its public counterpart, `public/image-credits.txt`. Do not assume all NASA-associated imagery has identical reuse terms.
- The production origin is `https://raghav-agarwal.raghagarwal.workers.dev`. Keep canonical metadata, `og:url`, and absolute social-image URLs aligned with it. The current feature must not change production or hosting configuration. Any future, separately authorized deployment should verify the published site and affected assets.

## Existing Cloudflare hosting — reference only

The initial deployment was authorized and completed on 2026-10-02. **Do not run deployment or hosting-configuration steps for the current local-only guided-journey task.** Retain this information for a future, separately authorized release.

- Platform: **Cloudflare Workers Static Assets on the Free plan**. Worker name: `raghav-agarwal`; Cloudflare account/subdomain: `raghagarwal`; production origin: `https://raghav-agarwal.raghagarwal.workers.dev`. The dashboard deployment, $0 plan and public HTTP 200 response were verified on 2026-10-02.
- `wrangler.jsonc` is assets-only, with `assets.directory` set to `./dist`, no server entry point and no service bindings. Preserve that boundary unless the user requests a change; the portfolio requires no deployed backend.
- Initial deployment used the dashboard's **Upload your static files** flow with the built `dist/` folder. Never upload the repository itself. The local Wrangler CLI is not yet authenticated; dashboard login does not establish CLI authentication.
- Repeatable CLI path, using the existing `raghagarwal` account: `npm run build`, `npx wrangler@4.146.0 login` when authentication is needed, then `npx wrangler@4.146.0 deploy`. Check the target account and Worker before deploying. Do not add credentials to source files or commits.
- Use the included `workers.dev` address and preserve the no-spend constraint. Do not purchase a domain, upgrade the account or enable paid add-ons. Update this file and `Readme.md` when the hosting status, public origin or deployment workflow changes.
- Static asset requests are free and unlimited, with no additional asset-storage charge under current documentation. This static architecture avoids an application server sleeping after inactivity. It is not a guarantee of uninterrupted uptime or permanent pricing.
- Keep the distinction between static asset hosting and billable Worker execution or optional services. Recheck relevant free-plan terms and limits when changing deployment scope; no paid product is selected or authorized.
- GitHub Pages is another free option for a public repository. Do not make a private repository public merely to qualify. If using a repository-path URL, audit the site's root-relative asset paths first.
- Official references: [Cloudflare recommendation](https://developers.cloudflare.com/pages/), [static asset pricing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [included address](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/), [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Verification workflow

| Purpose                        | Command                                        |
| ------------------------------ | ---------------------------------------------- |
| Install dependencies           | `npm ci`                                       |
| Development server             | `npm run dev` (`127.0.0.1:5173`)               |
| Production build and prerender | `npm run build`                                |
| Production preview             | `npm run preview -- --port 4173`               |
| Full verification              | `npm run check`                                |
| Focused browser checks         | `npx playwright test tests/<relevant>.spec.ts` |
| Regenerate social image        | `npm run social:generate`                      |

- Playwright tests use the production preview on port 4173. Rebuild before testing changed application code; reusing the preview server does not rebuild `dist/`. Reload a manually inspected production-preview tab after a build.
- `npm run check` includes TypeScript, ESLint, formatting, build/prerender, and Playwright. Suites cover page navigation/accessibility/responsiveness, Mars rendering/fallbacks, all three project previews, the rocket scrollbar and the optional guided journey.
- Run checks appropriate to the change. For documentation-only edits, verify formatting and the diff; no browser rebuild or new tests are needed. Do not add tests that merely mirror low-impact cosmetic implementation details.
- Responsive checks cover 375, 390, 768, 1280, 1440, and 1920px. Inspect mobile and desktop screenshots in `test-results/screenshots/` for visual changes.
- Parallel agents must own separate files. Concurrent Playwright runs need separate output directories and `--reporter=list` to avoid deleting shared artifacts. Coordinate builds so tests inspect the intended version.
- Keep `dist/`, `.prerender/`, test artifacts, dependencies, and credentials out of source commits. Do not report historical test results as verification of new changes.
- Update `Readme.md` when setup or public behavior changes, and update this file when durable working guidance changes.
