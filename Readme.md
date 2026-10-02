# Raghav Agarwal — The Engineer’s Observatory

A local-first portfolio built with React, TypeScript and Vite. A cinematic, SpaceX-inspired visual rhythm combines an expansive rotating Mars hero, bold uppercase Barlow typography, black backgrounds, restrained controls and an Earth-from-orbit contact scene. Three photographic engineering chapters lead into playable and source-verified personal projects, career history and public contact links.

The hero projects a NASA Ames/USGS Viking observational map onto a rotating sphere, with a NASA/JPL-Caltech Mars photograph as its fallback. Curiosity's dunes, Apollo 8 Earthrise and city lights photographed from the International Space Station fill the three engineering chapters; another ISS photograph forms the contact scene. All images are served locally as optimized WebP files. Sources, original asset links, processing details and image-specific reuse terms are documented in [docs/image-credits.md](docs/image-credits.md) and the public copy [public/image-credits.txt](public/image-credits.txt), linked from the footer. The MSSS-credited dunes are used under its personal, noncommercial terms. The portfolio uses no NASA or SpaceX logos and implies no affiliation or endorsement.

## Run locally

Requires Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. For the production version, including prerendered HTML:

```sh
npm run build
npm run preview -- --port 4173
```

Open **http://127.0.0.1:4173**. Both local servers bind to loopback. The portfolio needs no external runtime API, database, analytics or paid service.

## Cloudflare hosting

Live at **[raghav-agarwal.raghagarwal.workers.dev](https://raghav-agarwal.raghagarwal.workers.dev/)** on **Cloudflare Workers Static Assets, Free plan**. The Worker is `raghav-agarwal` in the `raghagarwal` account. The dashboard deployment and a public HTTP 200 response were verified on 2 October 2026; the account remains on the $0 plan.

`wrangler.jsonc` serves only the production `dist/` directory. It contains no Worker server entry point or paid-service bindings. The initial deployment used the Cloudflare dashboard's **Upload your static files** flow with the built `dist/` folder. Never upload the repository, dependencies, private verification notes or credentials.

For a repeatable CLI deployment after authentication:

```sh
npm run build
npx wrangler@4.146.0 login
npx wrangler@4.146.0 deploy
```

The CLI is not yet authenticated for this workspace; the initial dashboard deployment does not authenticate Wrangler. Use the existing `raghagarwal` Cloudflare account. Keep the Free plan and included `workers.dev` address; do not purchase domains, upgrade plans or enable paid add-ons. Static asset requests and storage are currently free under [Cloudflare's static asset pricing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/). Static hosting does not require a server to wake after inactivity; it is not a guarantee of uninterrupted uptime or permanent pricing.

## Verify

```sh
npm run check
```

This runs TypeScript, ESLint, formatting, the production build and Playwright acceptance tests. Playwright uses installed Google Chrome on macOS when available; otherwise install its Chromium browser with `npx playwright install chromium`.

Tests cover anchor navigation, case-study keyboard and Escape behavior, no-JavaScript content, reduced motion, bounded pointer parallax, automated WCAG AA checks, metadata and responsive overflow. Dedicated planet tests exercise actual WebGL rotation, keyboard playback controls, offscreen and hidden-tab suspension, reduced-motion loading, texture failures and context loss. Project tests check Sudoku input and solving; transport delivery, loss recovery, duplicate suppression, reset and offscreen pause; and movie similarity against independent numerical fixtures, feature selection and keyboard interaction. Rocket tests cover native-scroll progress, keyboard endpoints, track clicks, dragging, content-height changes and native fallbacks. Screenshots are generated in `test-results/screenshots/` at widths 375, 390, 768, 1280, 1440 and 1920. The 390 and 1440 screenshots include the entire page; focused project screenshots cover mobile and desktop previews. Automated checks supplement manual visual and keyboard review; they are not an accessibility certification.

## Structure and content

- `src/data/content.ts`: identity, public links, project content, employer case studies, experience and capabilities.
- `src/App.tsx`: semantic page sections, navigation, About and contact.
- `src/components/RocketScrollbar.tsx` and `.css`: a rocket-shaped page scrollbar with a progress readout, dragging, track clicks and keyboard controls. It replaces the visible native bar only after JavaScript initializes on fine-pointer screens at least 900px wide. Narrow screens, touch-first devices, forced colors and no-JavaScript browsing retain the native scrollbar. Wheel and trackpad scrolling remain native; reduced motion disables the decorative flame.
- `src/components/ObservatoryVisual.tsx` and `.css`: photographic fallback, bounded pointer parallax and an accessible play/pause control. Pointer parallax settles when input stops and is disabled for reduced-motion preferences and touch input.
- `src/components/marsRenderer.ts`: a lazy-loaded native WebGL renderer, under 5 KB in the production bundle, with no 3D or animation dependency. The observational surface completes one rotation in 150 seconds under fixed directional lighting. Rendering stops offscreen and in hidden tabs. Reduced-motion users keep the photograph without downloading the map unless they explicitly press play; WebGL or texture failure restores the photograph.
- `src/components/EngineeringCaseStudy.tsx`: three photographic chapters with native expandable details that remain functional without JavaScript. Their conceptual engineering diagrams appear inside the expanded content. Escape closes a disclosure and returns focus to its summary when JavaScript is enabled.
- `src/components/EngineeringDiagram.tsx`: original conceptual illustrations, not internal screenshots or actual employer architecture documentation.
- `src/components/PersonalProjects.tsx` and `.css`: three interactive project previews. Sudoku uses a preset from the original live project, with keyboard navigation, conflict feedback, recursive backtracking and reset. Each preview retains a link to the original project or source.
- `src/components/TransportPreview.tsx` and `src/lib/transportSimulation.ts`: an educational browser simulation of six numbered segments in a three-packet window. Choose no loss, a dropped data packet or a dropped acknowledgment; run, pause, step or reset to inspect retransmission, ordered buffering and confirmation. Its events and counters come from a deterministic state machine. It uses no sockets and is distinct from the original Python UDP file-transfer project, which also implements SYN/FIN, byte sequence numbers and configurable loss.
- `src/components/MoviePreview.tsx`, `src/lib/movieSimilarity.ts` and `src/data/movieCatalogue.ts`: an educational browser version of content-based movie discovery using ten hand-curated sample titles. Raw term counts, smoothed TF-IDF, L2 normalization and cosine similarity compute the three closest matches. Visitors can compare genres with or without keywords; percentages mean content similarity. This local preview is separate from the original React/Node.js/MongoDB application and its Python/Flask recommendation service. It makes no database or API requests.
- `src/styles.css`, `src/scenes.css` and `src/chapters.css`: shared design tokens, cinematic layouts, photographic middle chapters, responsive framing and motion preferences. The mobile composition adjusts image placement and type size explicitly.
- `scripts/prerender.mjs`: builds and renders static HTML, then removes its temporary server bundle. The browser hydrates that content for enhancements.
- `wrangler.jsonc`: Cloudflare Workers Static Assets configuration for the built `dist/` directory, with no production server or service bindings.
- `public/fonts`: self-hosted Latin WOFF2 files and SIL Open Font Licenses for Barlow display typography, Inter body text and IBM Plex Mono metadata.
- `public/images`: optimized NASA photographs and the NASA Ames/USGS Mars map; no generated planetary terrain is used.

Keep professional claims consistent with the supplied brief. Polars improvement wording is intentionally qualitative. Applied AI work is explicitly in development. No résumé download is present because a current résumé was not found. Contact email and Unwinding Curiosity link are intentionally public first-party references. LinkedIn restricts direct automated access; the exact supplied profile was corroborated through first-party crosslinks and indexed content. The original Sudoku demonstration was inspected, and the transport and recommendation sources were reviewed. Their new browser previews demonstrate the underlying ideas without claiming the original backend systems are deployed or reproducing the original movie dataset. The optional presentation app is omitted because its authenticated journey was not verified. The private verification ledger is local-only and is never included in `dist`.

## Social assets

`public/favicon.svg` uses the same custom RA ascent monogram as the navbar and footer: angular initials, an open flight path and an amber star. The inline mark in `src/components/Icons.tsx` has a brief hover/focus animation that respects reduced motion. `public/social-preview.png` provides the social sharing image. To regenerate the 1200×630 preview from local fonts and image assets:

```sh
npm run social:generate
```

The build includes title, description, theme colour, Open Graph and Twitter metadata. Canonical metadata, `og:url` and absolute social-image URLs use the production origin `https://raghav-agarwal.raghagarwal.workers.dev`. If the public address changes later, update those values together and verify the published image URLs.
