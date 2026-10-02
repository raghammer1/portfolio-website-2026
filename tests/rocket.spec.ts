import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });

test('rocket follows native scrolling and supports keyboard navigation to both ends', async ({
  page,
}) => {
  await page.goto('/');
  const rocket = page.getByRole('scrollbar', { name: 'Page scroll' });
  await expect(rocket).toBeVisible();
  await expect(rocket).toHaveAttribute('aria-valuenow', '0');
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'none');
  await rocket.focus();
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(850);
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(930);
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(850);
  await page.keyboard.press('End');
  await expect(rocket).toHaveAttribute('aria-valuenow', '100');
  await expect(page.locator('.image-credits')).toBeInViewport();
  await page.keyboard.press('Home');
  await expect(rocket).toHaveAttribute('aria-valuenow', '0');
  await page.mouse.move(700, 500);
  await page.mouse.wheel(0, 1900);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1500);
  await expect
    .poll(async () => Number(await rocket.getAttribute('aria-valuenow')))
    .toBeGreaterThan(0);
  const expected = await page.evaluate(() =>
    Math.round((window.scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100),
  );
  await expect(rocket).toHaveAttribute('aria-valuenow', String(expected));
});

test('rocket track seeks, thumb drags without a jump, and progress adapts to expanded content', async ({
  page,
}) => {
  await page.goto('/');
  const rocket = page.getByRole('scrollbar', { name: 'Page scroll' });
  const bounds = (await rocket.boundingBox())!;
  const centerX = bounds.x + bounds.width / 2;
  await page.mouse.click(centerX, bounds.y + 24 + (bounds.height - 48) * 0.25);
  await expect(rocket).toHaveAttribute('aria-valuenow', '25');
  const thumb = (await page.locator('.rocket-scroll-thumb').boundingBox())!;
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(centerX, thumb.y + 12);
  await page.mouse.down();
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(2);
  // Pointer capture keeps the drag working even when the pointer leaves the narrow rail.
  await page.mouse.move(centerX - 100, bounds.y + 12 + (bounds.height - 48) * 0.75, { steps: 5 });
  await page.mouse.up();
  await expect(rocket).toHaveAttribute('aria-valuenow', '75');
  await expect(rocket).not.toHaveAttribute('data-dragging');
  await page
    .locator('details.case-details')
    .first()
    .evaluate((element) => {
      (element as HTMLDetailsElement).open = true;
    });
  await expect
    .poll(async () => {
      const expected = await page.evaluate(() =>
        Math.round((window.scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100),
      );
      return Math.abs(Number(await rocket.getAttribute('aria-valuenow')) - expected);
    })
    .toBe(0);
});

test('mobile, forced colours and no JavaScript retain the native scrollbar', async ({
  page,
  browser,
}) => {
  await page.goto('/');
  const rocket = page.getByRole('scrollbar', { name: 'Page scroll' });
  await expect(rocket).toBeVisible();
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(rocket).toBeHidden();
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'auto');
  await page.emulateMedia({ forcedColors: 'none' });
  await expect(rocket).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(rocket).toBeHidden();
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'auto');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(rocket).toBeVisible();
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 1000 },
  });
  const noScript = await context.newPage();
  await noScript.goto('http://127.0.0.1:4173/');
  await expect(noScript.getByRole('scrollbar', { name: 'Page scroll' })).toBeHidden();
  await expect(noScript.locator('html')).toHaveCSS('scrollbar-width', 'auto');
  await context.close();
});
