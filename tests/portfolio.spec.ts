import { mkdir } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Layout/accessibility checks use the static view; real GPU motion has its own suite.
test.use({ reducedMotion: 'reduce' });

test('navigation reaches each section without broken local destinations', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  const heroPhoto = page.locator('.hero img.observatory-planet');
  await expect(heroPhoto).toBeVisible();
  await expect
    .poll(() =>
      heroPhoto.evaluate(
        (image) =>
          image instanceof HTMLImageElement &&
          image.complete &&
          image.naturalWidth > 0 &&
          image.naturalHeight > 0,
      ),
    )
    .toBe(true);

  for (const label of ['Work', 'Experience', 'About', 'Contact']) {
    const link = page.getByRole('navigation').getByRole('link', { name: label, exact: true });
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^#[a-z][a-z0-9-]*$/);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator(href!)).toBeInViewport();
  }

  const brokenAnchors = await page.locator('a').evaluateAll((links) =>
    links.flatMap((link) => {
      const href = link.getAttribute('href');
      if (
        !href ||
        href === '#' ||
        /javascript:|example\.com|your[-_]?(name|username)/i.test(href)
      ) {
        return [`${link.textContent?.trim()}: ${href}`];
      }
      if (href.startsWith('#') && !document.getElementById(href.slice(1))) {
        return [`Missing target: ${href}`];
      }
      return [];
    }),
  );
  expect(brokenAnchors).toEqual([]);
  expect(errors).toEqual([]);
});

test('case studies open by keyboard and Escape returns focus to the summary', async ({ page }) => {
  await page.goto('/');
  const details = page.locator('details.case-details');
  await expect(details).toHaveCount(3);

  for (const detail of await details.all()) {
    const summary = detail.locator('summary');
    await expect(summary).toContainText('View case study');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(detail).toHaveAttribute('open', '');
    await expect(detail.locator('.case-expanded')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(detail).not.toHaveAttribute('open');
    await expect(summary).toBeFocused();
  }
});

test('prerendered content and native disclosures work with JavaScript disabled', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('h1')).toHaveText(/\S/);
  await expect(page.locator('main')).toBeVisible();
  const hiddenHeadings = await page.locator('main h2').evaluateAll((headings) =>
    headings
      .filter((heading) => {
        for (let element: Element | null = heading; element; element = element.parentElement) {
          const style = window.getComputedStyle(element);
          if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            Number(style.opacity) === 0
          ) {
            return true;
          }
        }
        return false;
      })
      .map((heading) => heading.textContent),
  );
  expect(hiddenHeadings).toEqual([]);
  const details = page.locator('details.case-details');
  await expect(details).toHaveCount(3);
  for (const detail of await details.all()) {
    await detail.locator('summary').click();
    await expect(detail).toHaveAttribute('open', '');
    await expect(detail.locator('.case-expanded')).toBeVisible();
    await detail.locator('summary').click();
    await expect(detail).not.toHaveAttribute('open');
  }
  await context.close();
});

test('reduced motion preserves visible content and disables repeating animation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('details.case-details')).toHaveCount(3);
  await page.locator('details.case-details').first().locator('summary').click();
  await expect(page.locator('.case-expanded').first()).toBeVisible();
  const repeatingAnimations = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations === Infinity).length,
  );
  expect(repeatingAnimations).toBe(0);
});

test('decorative pointer parallax settles and respects changes to reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const visual = page.locator('.hero');
  const scene = page.locator('.observatory-scene');
  const position = async () =>
    scene.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).getPropertyValue('--observatory-x')),
    );
  const bounds = await visual.boundingBox();
  expect(bounds).not.toBeNull();
  await page.mouse.move(bounds!.x + bounds!.width * 0.8, bounds!.y + bounds!.height * 0.4);
  await expect.poll(position).toBeGreaterThan(0.5);
  expect(await position()).toBeLessThanOrEqual(4.5);
  await page.mouse.move(10, 10);
  await expect.poll(async () => Math.abs(await position())).toBeLessThan(0.02);

  await page.mouse.move(bounds!.x + bounds!.width * 0.2, bounds!.y + bounds!.height * 0.4);
  await expect.poll(position).toBeLessThan(-0.5);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(position).toBe(0);
  await page.mouse.move(bounds!.x + bounds!.width * 0.8, bounds!.y + bounds!.height * 0.4);
  await expect.poll(position).toBe(0);
});

test('WCAG AA checks pass with case studies collapsed and expanded', async ({ page }) => {
  await page.goto('/');
  const scan = () =>
    new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
  expect((await scan()).violations).toEqual([]);
  for (const summary of await page.locator('details.case-details summary').all()) {
    await summary.click();
  }
  expect((await scan()).violations).toEqual([]);
});

test('search and sharing metadata has meaningful content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Raghav Agarwal/i);
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
  ]) {
    await expect(page.locator(selector)).toHaveAttribute('content', /\S.{15,}/);
  }
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /width=device-width/,
  );
});

for (const width of [375, 390, 768, 1280, 1440, 1920]) {
  test(`layout stays within a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toBeVisible();
    const overflow = await page.evaluate(() => {
      const viewport = document.documentElement.clientWidth;
      return {
        pageWidth: document.documentElement.scrollWidth,
        viewport,
        offenders: [...document.querySelectorAll('main *')]
          .filter((element) => element.getBoundingClientRect().right > viewport + 1)
          .map((element) => `${element.tagName.toLowerCase()}.${element.className}`)
          .slice(0, 10),
      };
    });
    expect(overflow.pageWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(width + 1);

    // Trigger real lazy image loads before capturing the full document.
    for (const photo of await page.locator('.case-photograph').all()) {
      await photo.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          photo.evaluate(
            (image) =>
              image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await mkdir('test-results/screenshots', { recursive: true });
    await page.screenshot({
      path: `test-results/screenshots/portfolio-${width}.png`,
      fullPage: width === 390 || width === 1440,
      animations: 'disabled',
    });

    if (width === 1440 || width === 390) {
      for (const number of ['01', '02', '03']) {
        const filename = number === '01' ? `work-${width}` : `work-${number}-${width}`;
        await page.locator(`.case-study-${number}`).screenshot({
          path: `test-results/screenshots/${filename}.png`,
          style: '.site-header, .skip-link { visibility: hidden !important; }',
        });
      }
      await page.locator('.personal-work').screenshot({
        path: `test-results/screenshots/projects-${width}.png`,
        style: '.site-header, .skip-link { visibility: hidden !important; }',
      });
    }
    for (const summary of await page.locator('details.case-details summary').all()) {
      await summary.click();
    }
    const expandedWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(expandedWidth).toBeLessThanOrEqual(width + 1);
  });
}
