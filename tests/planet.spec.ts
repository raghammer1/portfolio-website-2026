import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

declare global {
  interface Window {
    __marsProbe: { contexts: number; draws: number; rotation: number };
  }
}

async function observeRenderer(page: Page) {
  await page.addInitScript(() => {
    window.__marsProbe = { contexts: 0, draws: 0, rotation: 0 };
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      const context = Reflect.apply(getContext, this, [kind, ...args]);
      if (kind === 'webgl' && context) window.__marsProbe.contexts += 1;
      return context;
    } as typeof getContext;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      window.__marsProbe.draws += 1;
      return draw.apply(this, args);
    };
    const uniform = WebGLRenderingContext.prototype.uniform1f;
    WebGLRenderingContext.prototype.uniform1f = function (location, value) {
      window.__marsProbe.rotation = value;
      return uniform.call(this, location, value);
    };
  });
}

const drawCount = (page: Page) => page.evaluate(() => window.__marsProbe.draws);

async function expectRendering(page: Page) {
  await expect.poll(() => page.evaluate(() => window.__marsProbe.contexts)).toBeGreaterThan(0);
  await expect.poll(() => drawCount(page)).toBeGreaterThan(2);
  const previous = await page.evaluate(() => window.__marsProbe.rotation);
  await expect.poll(() => page.evaluate(() => window.__marsProbe.rotation)).not.toBe(previous);
}

async function expectStopped(page: Page) {
  // Allow a queued observer callback to complete before measuring the rendering loop.
  await page.waitForTimeout(100);
  const previous = await drawCount(page);
  await page.waitForTimeout(350);
  expect(await drawCount(page)).toBe(previous);
}

test.beforeEach(async ({ page }) => {
  await observeRenderer(page);
});

test('real WebGL surface rotation pauses and resumes with keyboard controls', async ({ page }) => {
  await page.goto('/');
  await expectRendering(page);
  const pause = page.getByRole('button', { name: 'Pause planet rotation' });
  await pause.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Play planet rotation' })).toBeFocused();
  await expectStopped(page);
  const previous = await drawCount(page);
  await page.keyboard.press('Space');
  await expect.poll(() => drawCount(page)).toBeGreaterThan(previous + 2);
});

test('rotation stops outside the viewport and resumes when the hero returns', async ({ page }) => {
  await page.goto('/');
  await expectRendering(page);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('.hero')).not.toBeInViewport();
  await expectStopped(page);
  const previous = await drawCount(page);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => drawCount(page)).toBeGreaterThan(previous + 2);
});

test('reduced motion keeps the photograph without a map request until explicit play', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const textureRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('mars-color-map')) textureRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Play planet rotation' })).toBeVisible();
  await expect(page.locator('.observatory-photo')).toHaveCSS('opacity', '1');
  await page.waitForTimeout(350);
  expect(textureRequests).toHaveLength(0);
  expect(await page.evaluate(() => window.__marsProbe.contexts)).toBe(0);
  expect(await drawCount(page)).toBe(0);
  await page.getByRole('button', { name: 'Play planet rotation' }).click();
  await expectRendering(page);
  expect(textureRequests).toHaveLength(1);
});

test('a texture failure leaves the real photograph visible and removes unavailable controls', async ({
  page,
}) => {
  await page.route('**/images/mars-color-map*.webp', (route) => route.abort());
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => window.__marsProbe.contexts)).toBeGreaterThan(0);
  await expect(page.locator('.observatory-motion-control')).toHaveCount(0);
  await expect(page.locator('.observatory-photo')).toHaveCSS('opacity', '1');
  expect(await drawCount(page)).toBe(0);
  await expect(page.locator('h1')).toBeVisible();
});

test('a lost WebGL context restores the photograph and stops drawing', async ({ page }) => {
  await page.goto('/');
  await expectRendering(page);
  const supportsLoss = await page.locator('.observatory-canvas').evaluate((element) => {
    const context = (element as HTMLCanvasElement).getContext('webgl');
    const extension = context?.getExtension('WEBGL_lose_context');
    if (!extension) return false;
    extension.loseContext();
    return true;
  });
  expect(supportsLoss).toBe(true);
  await expect(page.locator('.observatory-motion-control')).toHaveCount(0);
  await expect(page.locator('.observatory-photo')).toHaveCSS('opacity', '1');
  await expectStopped(page);
});

test('a hidden document suspends rendering without changing the requested playback state', async ({
  page,
}) => {
  await page.goto('/');
  await expectRendering(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expectStopped(page);
  await expect(page.getByRole('button', { name: 'Pause planet rotation' })).toBeVisible();
  const previous = await drawCount(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect.poll(() => drawCount(page)).toBeGreaterThan(previous + 2);
});
