# Raghav Agarwal — The Engineer’s Observatory

A local-first portfolio built with React, TypeScript and Vite. A cinematic, SpaceX-inspired visual rhythm combines an expansive photographic Mars hero, bold uppercase Barlow typography, black backgrounds, restrained controls and an Earth-from-orbit contact scene. Three engineering case studies, three source-verified personal projects, career history and public contact links remain the focus.

The Mars image is a NASA/JPL-Caltech mosaic of Viking Orbiter observations; the Earth horizon is an actual International Space Station photograph. Both are served locally as optimized WebP files. Image credits, original asset links, resizing details and the applicable NASA/JPL reuse policies are documented in [docs/image-credits.md](docs/image-credits.md). The portfolio uses no NASA or SpaceX logos and implies no affiliation or endorsement.

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

Tests cover anchor navigation, case-study keyboard and Escape behavior, no-JavaScript content, reduced motion, bounded pointer parallax, automated WCAG AA checks, metadata and responsive overflow. Screenshots are generated in `test-results/screenshots/` at widths 375, 390, 768, 1280, 1440 and 1920. The 390 and 1440 screenshots include the entire page. Automated checks supplement manual visual and keyboard review; they are not an accessibility certification.

## Structure and content

- `src/data/content.ts`: identity, public links, project content, employer case studies, experience and capabilities.
- `src/App.tsx`: semantic page sections, navigation, About and contact.
- `src/components/ObservatoryVisual.tsx` and `.css`: locally served Mars photography and bounded pointer parallax. Motion stops when the pointer settles and is disabled for reduced-motion preferences and touch input. No WebGL or animation dependency.
- `src/components/EngineeringCaseStudy.tsx`: native expandable details; remains functional without JavaScript. Escape closes and returns focus to the summary when JavaScript is enabled.
- `src/components/EngineeringDiagram.tsx` and `ProjectPreview.tsx`: original conceptual illustrations. Employer diagrams are not internal screenshots or actual architecture documentation.
- `src/styles.css` and `src/scenes.css`: shared design tokens, cinematic layouts, responsive framing, breakpoints and motion preferences. The mobile composition adjusts image placement and type size explicitly.
- `scripts/prerender.mjs`: builds and renders static HTML, then removes its temporary server bundle. The browser hydrates that content for enhancements.
- `public/fonts`: self-hosted Latin WOFF2 files and SIL Open Font Licenses for Barlow display typography, Inter body text and IBM Plex Mono metadata.
- `public/images`: optimized NASA Mars and ISS Earth photography; no generated planetary surface is used.

Keep professional claims consistent with the supplied brief. Polars improvement wording is intentionally qualitative. Applied AI work is explicitly in development. No résumé download is present because a current résumé was not found. Contact email and Unwinding Curiosity link are intentionally public first-party references. LinkedIn restricts direct automated access; the exact supplied profile was corroborated through first-party crosslinks and indexed content. The Sudoku demonstration was inspected, while the transport and recommendation projects link to inspected source repositories. The optional presentation app is omitted because its authenticated journey was not verified. The private verification ledger is local-only and is never included in `dist`.

## Social assets

`public/favicon.svg` uses a planetary-limb mark, and `public/social-preview.png` provides the social sharing image. To regenerate the 1200×630 preview from local fonts and image assets:

```sh
npm run social:generate
```

The build includes title, description, theme colour, Open Graph and Twitter metadata. There is intentionally no invented public domain or canonical URL for this local-only delivery. If a public URL is established later, set a canonical URL, `og:url`, and absolute social-image URLs for that origin before publishing. This project does not publish anything.
