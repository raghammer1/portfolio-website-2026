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

Open **http://127.0.0.1:4173**. Both servers bind to loopback. No hosting configuration, account, external runtime API, analytics, paid service or deployment is required or included.

## Verify

```sh
npm run check
```

This runs TypeScript, ESLint, formatting, the production build and Playwright acceptance tests. Playwright uses installed Google Chrome on macOS when available; otherwise install its Chromium browser with `npx playwright install chromium`.

Tests cover anchor navigation, case-study keyboard and Escape behavior, no-JavaScript content, reduced motion, bounded pointer parallax, automated WCAG AA checks, metadata and responsive overflow. Dedicated planet tests exercise actual WebGL rotation, keyboard playback controls, offscreen and hidden-tab suspension, reduced-motion loading, texture failures and context loss. Project tests check Sudoku keyboard input, conflicts, valid solving, reset and responsive layouts. Screenshots are generated in `test-results/screenshots/` at widths 375, 390, 768, 1280, 1440 and 1920. The 390 and 1440 screenshots include the entire page. Automated checks supplement manual visual and keyboard review; they are not an accessibility certification.

## Structure and content

- `src/data/content.ts`: identity, public links, project content, employer case studies, experience and capabilities.
- `src/App.tsx`: semantic page sections, navigation, About and contact.
- `src/components/ObservatoryVisual.tsx` and `.css`: photographic fallback, bounded pointer parallax and an accessible play/pause control. Pointer parallax settles when input stops and is disabled for reduced-motion preferences and touch input.
- `src/components/marsRenderer.ts`: a lazy-loaded native WebGL renderer, under 5 KB in the production bundle, with no 3D or animation dependency. The observational surface completes one rotation in 150 seconds under fixed directional lighting. Rendering stops offscreen and in hidden tabs. Reduced-motion users keep the photograph without downloading the map unless they explicitly press play; WebGL or texture failure restores the photograph.
- `src/components/EngineeringCaseStudy.tsx`: three photographic chapters with native expandable details that remain functional without JavaScript. Their conceptual engineering diagrams appear inside the expanded content. Escape closes a disclosure and returns focus to its summary when JavaScript is enabled.
- `src/components/EngineeringDiagram.tsx`: original conceptual illustrations, not internal screenshots or actual employer architecture documentation.
- `src/components/PersonalProjects.tsx` and `.css`: a playable Sudoku preview with a preset from the original live project, keyboard navigation, conflict feedback, recursive backtracking and reset. Compact rows link to the inspected reliable-UDP simulation and TF-IDF/cosine-similarity movie recommendation source repositories. The full Sudoku project remains linked separately.
- `src/styles.css`, `src/scenes.css` and `src/chapters.css`: shared design tokens, cinematic layouts, photographic middle chapters, responsive framing and motion preferences. The mobile composition adjusts image placement and type size explicitly.
- `scripts/prerender.mjs`: builds and renders static HTML, then removes its temporary server bundle. The browser hydrates that content for enhancements.
- `public/fonts`: self-hosted Latin WOFF2 files and SIL Open Font Licenses for Barlow display typography, Inter body text and IBM Plex Mono metadata.
- `public/images`: optimized NASA photographs and the NASA Ames/USGS Mars map; no generated planetary terrain is used.

Keep professional claims consistent with the supplied brief. Polars improvement wording is intentionally qualitative. Applied AI work is explicitly in development. No résumé download is present because a current résumé was not found. Contact email and Unwinding Curiosity link are intentionally public first-party references. LinkedIn restricts direct automated access; the exact supplied profile was corroborated through first-party crosslinks and indexed content. The Sudoku demonstration was inspected, while the transport and recommendation projects link to inspected source repositories. The optional presentation app is omitted because its authenticated journey was not verified. The private verification ledger is local-only and is never included in `dist`.

## Social assets

`public/favicon.svg` uses a planetary-limb mark, and `public/social-preview.png` provides the social sharing image. To regenerate the 1200×630 preview from local fonts and image assets:

```sh
npm run social:generate
```

The build includes title, description, theme colour, Open Graph and Twitter metadata. There is intentionally no invented public domain or canonical URL for this local-only delivery. If a public URL is established later, set a canonical URL, `og:url`, and absolute social-image URLs for that origin before publishing. This project does not publish anything.
