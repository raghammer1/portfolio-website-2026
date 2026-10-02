# Portfolio working instructions

Applies to this repository. Keep this file current when the user changes project constraints, design decisions, architecture, or verification workflows. Replace stale guidance rather than appending a conversation log. Current user instructions take precedence.

## User constraints and publishing status

- Work in this repository. Preserve unrelated and uncommitted work; do not reset it or overwrite another agent's edits.
- Spend no money. Do not purchase domains, upgrade plans, or enable paid or metered add-ons.
- The user initially prohibited hosting and subsequently requested research into completely free hosting without inactivity sleep. Research is complete; deployment has not been requested or performed. A later explicit deployment request can change this status; do not turn this historical restriction into an unnecessary approval loop.
- Public GitHub, LinkedIn, and other first-party sources may be inspected when needed to verify portfolio content. Do not invent professional achievements, measurements, or project capabilities.
- Keep work local unless the current task authorizes an external action. A request to find hosting does not itself authorize publishing, uploading the repository, or changing repository visibility.

## Design direction to preserve

- The user likes the cinematic SpaceX-inspired direction: black backgrounds, large uppercase Barlow headings, generous space, restrained outline controls, authentic planetary photography, and the current navbar/contact composition.
- Use original identity and graphics; do not imply SpaceX or NASA affiliation. Avoid replacing authentic Mars imagery with synthetic-looking planetary artwork.
- The brand mark is now the custom **RA ascent monogram**, with angular initials, an amber star, and an open flight path. Keep `src/components/Icons.tsx` and `public/favicon.svg` visually consistent. Navbar/footer hover and focus motion must respect reduced-motion preferences.
- Keep desktop and mobile compositions intentional. Inspect actual screenshots after visible design changes; passing overflow checks alone does not verify visual quality.
- Retain visible focus, keyboard interaction, semantic headings, and reduced-motion behavior when refining the presentation.

## Architecture and feature boundaries

- React + TypeScript + Vite, requiring Node.js 22.12 or newer. Production builds are static files in `dist/`.
- `scripts/prerender.mjs` generates HTML at build time; the browser hydrates it. There is no production Node server, live backend, database, or external runtime API required by this portfolio.
- `src/data/content.ts` owns identity, public links, professional content, and project descriptions. `Readme.md` describes the component structure in detail.
- Shared styles load in this order: `styles.css`, `scenes.css`, `chapters.css`. Check existing overrides before adding more. Keep new component styles scoped.
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
- A public origin has not been chosen. Once an actual deployment URL is established, update canonical metadata, `og:url`, and absolute social-image URLs for that origin; do not invent a domain.

## Hosting research, checked 2026-10-02

- Recommended candidate: **Cloudflare Workers Static Assets on the Free plan**, serving only the built `dist/` files with the included `workers.dev` address. Cloudflare now recommends Workers for new projects; Pages remains an alternative.
- Static asset requests are free and unlimited, with no additional asset-storage charge under current documentation. This static architecture avoids an application server sleeping after inactivity. It is not a guarantee of uninterrupted uptime or permanent pricing.
- Keep the distinction between static asset hosting and billable Worker execution or optional services. Recheck current terms and limits before any future deployment; research has not selected or enabled a paid product.
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
- `npm run check` includes TypeScript, ESLint, formatting, build/prerender, and Playwright. Existing suites cover page navigation/accessibility/responsiveness, Mars rendering/fallbacks, all three project previews, and the rocket scrollbar.
- Run checks appropriate to the change. For documentation-only edits, verify formatting and the diff; no browser rebuild or new tests are needed. Do not add tests that merely mirror low-impact cosmetic implementation details.
- Responsive checks cover 375, 390, 768, 1280, 1440, and 1920px. Inspect mobile and desktop screenshots in `test-results/screenshots/` for visual changes.
- Parallel agents must own separate files. Concurrent Playwright runs need separate output directories and `--reporter=list` to avoid deleting shared artifacts. Coordinate builds so tests inspect the intended version.
- Keep `dist/`, `.prerender/`, test artifacts, dependencies, and credentials out of source commits. Do not report historical test results as verification of new changes.
- Update `Readme.md` when setup or public behavior changes, and update this file when durable working guidance changes.
