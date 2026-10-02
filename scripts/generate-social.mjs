import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// A standalone local composition: no running app, network, or external service required.
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const [mars, displayFont, bodyFont] = await Promise.all([
  readFile(resolve(projectRoot, 'public/images/mars.webp')),
  readFile(resolve(projectRoot, 'public/fonts/barlow-latin-600-normal.woff2')),
  readFile(resolve(projectRoot, 'public/fonts/inter-latin-400-normal.woff2')),
]);
const browser = await chromium.launch({
  channel: existsSync('/Applications/Google Chrome.app') ? 'chrome' : undefined,
});

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    @font-face {
      font-family: Barlow;
      src: url(data:font/woff2;base64,${displayFont.toString('base64')}) format('woff2');
      font-weight: 600;
    }
    @font-face {
      font-family: Inter;
      src: url(data:font/woff2;base64,${bodyFont.toString('base64')}) format('woff2');
      font-weight: 400;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
    body { position: relative; background: #000; color: #fff; font-family: Inter, sans-serif; }
    .planet { position: absolute; right: -150px; top: -87px; width: 870px; height: 870px; }
    .shade { position: absolute; inset: 0; background: linear-gradient(90deg, #000 0%, #000 29%, #000b 43%, #0000 65%), linear-gradient(0deg, #000b 0%, #0000 25%); }
    .name { position: absolute; top: 53px; left: 65px; font-family: Barlow, sans-serif; font-size: 24px; font-weight: 600; letter-spacing: 1.7px; text-transform: uppercase; }
    .copy { position: absolute; top: 178px; left: 65px; }
    .eyebrow { margin: 0 0 23px; font-size: 11px; letter-spacing: 1.8px; }
    h1 { margin: 0; font-family: Barlow, sans-serif; font-size: 91px; font-weight: 600; line-height: .97; letter-spacing: -2px; text-transform: uppercase; }
    h1 span { display: block; width: fit-content; white-space: nowrap; }
    .focus { position: absolute; left: 65px; bottom: 48px; margin: 0; color: #c3c5c7; font-size: 10px; letter-spacing: 1.1px; }
    .credit { position: absolute; right: 31px; bottom: 27px; margin: 0; color: #a1a5a9; font-size: 8px; letter-spacing: .6px; }
  </style>
</head>
<body>
  <img class="planet" src="data:image/webp;base64,${mars.toString('base64')}" width="1400" height="1400" alt="">
  <div class="shade"></div>
  <div class="name">Raghav Agarwal</div>
  <main class="copy">
    <p class="eyebrow">SOFTWARE ENGINEER · SYDNEY</p>
    <h1><span>Engineering</span><span>Intelligent</span><span>Systems.</span></h1>
  </main>
  <p class="focus">PYTHON &nbsp; / &nbsp; APPLIED AI &nbsp; / &nbsp; FULL-STACK SYSTEMS</p>
  <p class="credit">IMAGE: NASA/JPL-CALTECH</p>
</body>
</html>`);
  await Promise.all([
    page.evaluate(() => globalThis.document.fonts.ready),
    page.locator('.planet').evaluate((image) => image.decode()),
  ]);
  const headingFits = await page.locator('h1 span').evaluateAll((lines) =>
    lines.every((line) => {
      const bounds = line.getBoundingClientRect();
      return bounds.left >= 0 && bounds.top >= 0 && bounds.right <= 1200 && bounds.bottom <= 535;
    }),
  );
  if (!headingFits) throw new Error('The social preview heading exceeds its safe area.');
  const destination = resolve(projectRoot, 'public/social-preview.png');
  await page.screenshot({ path: destination, animations: 'disabled' });
  console.info(`Created 1200 × 630 photographic social preview: ${destination}`);
} finally {
  await browser.close();
}
