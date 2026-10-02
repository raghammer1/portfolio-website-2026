import { mkdir } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const chapters = [
  'top',
  'python-performance',
  'applied-ai',
  'full-stack',
  'sudoku-preview',
  'transport-preview',
  'movies-preview',
  'experience',
  'about',
  'contact',
];

const deck = (page: Page) => page.getByRole('region', { name: 'Guided flight controls' });
const narrative = (page: Page) => page.locator('[data-journey-narrative]');

async function expectChapter(page: Page, index: number, focused = true) {
  await expect(page.locator('html')).toHaveAttribute('data-journey', chapters[index]);
  await expect(narrative(page)).toHaveCount(1);
  await expect(narrative(page)).toHaveAttribute('data-journey-narrative', chapters[index]);
  await expect(deck(page).locator('.journey-route [aria-current="step"]')).toHaveCount(1);
  await expect(deck(page).locator('.journey-route [aria-current="step"]')).toHaveAccessibleName(
    new RegExp(`^Go to chapter ${index + 1}:`),
  );
  if (focused) await expect(narrative(page).getByRole('heading')).toBeFocused();
}

async function start(page: Page) {
  await page.locator('#journey-invitation').focus();
  await page.keyboard.press('Enter');
  await expect(deck(page)).toBeVisible();
  await expectChapter(page, 0);
}

async function visitChapter(page: Page, index: number) {
  await deck(page)
    .getByRole('button', { name: new RegExp(`^Go to chapter ${index + 1}:`) })
    .click();
  await expectChapter(page, index);
}

async function expectUncovered(control: Locator) {
  await expect(control).toBeVisible();
  await expect
    .poll(() =>
      control.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const x = bounds.x + bounds.width / 2;
        const y = bounds.y + bounds.height / 2;
        const hit = document.elementFromPoint(x, y);
        return (
          bounds.left >= 0 &&
          bounds.right <= innerWidth &&
          bounds.top >= 0 &&
          bounds.bottom <= innerHeight &&
          hit !== null &&
          (hit === element || element.contains(hit))
        );
      }),
    )
    .toBe(true);
}

test('the flight starts by keyboard, visits all chapters, goes back, restarts and exits', async ({
  page,
}) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });
  page.on('response', (response) => {
    if (response.url().startsWith('http://127.0.0.1:4173/') && response.status() >= 400) {
      failures.push(`${response.status()}: ${response.url()}`);
    }
  });
  await page.goto('/');
  const normalHeading = await page.locator('h1').innerText();
  const experienceEntries = await page.locator('.experience-row').allTextContents();
  expect(experienceEntries.length).toBeGreaterThan(0);
  await expect(deck(page)).toHaveCount(0);
  await start(page);
  await expect(deck(page).getByRole('button', { name: 'Previous chapter' })).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await expectChapter(page, 1);
  await page.keyboard.press('ArrowLeft');
  await expectChapter(page, 0);

  for (let index = 1; index < chapters.length; index += 1) {
    await deck(page).getByRole('button', { name: 'Next chapter', exact: true }).click();
    await expectChapter(page, index);
    if (chapters[index] === 'experience') {
      await expect(page.locator('#experience [data-journey-narrative]')).toBeVisible();
      await expect(page.locator('#experience .experience-row').first()).toBeVisible();
      expect(await page.locator('#experience .experience-row').allTextContents()).toEqual(
        experienceEntries,
      );
    }
  }
  await expect(deck(page).getByRole('button', { name: 'Next chapter', exact: true })).toHaveCount(
    0,
  );
  await deck(page).getByRole('button', { name: 'Previous chapter' }).click();
  await expectChapter(page, chapters.length - 2);
  await deck(page).getByRole('button', { name: 'Next chapter', exact: true }).click();
  await page.getByRole('button', { name: /Restart flight/ }).click();
  await expectChapter(page, 0);
  await visitChapter(page, chapters.length - 1);
  const beforeExit = await page.evaluate(() => scrollY);
  await deck(page).getByRole('button', { name: 'Explore freely', exact: true }).click();
  await expect(deck(page)).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-journey');
  await expect(page.locator('h1')).toHaveText(normalHeading, { useInnerText: true });
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(beforeExit / 2);
  await expect
    .poll(() =>
      page.evaluate(() => document.activeElement?.matches('main, main h1, main h2, main h3')),
    )
    .toBe(true);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Work', exact: true })
    .click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('#work')).toBeInViewport();
  expect(failures).toEqual([]);
});

test('Sudoku keeps its own arrow keys and entered values across chapters and exit', async ({
  page,
}) => {
  await page.goto('/');
  await start(page);
  await visitChapter(page, 4);
  await narrative(page).getByRole('button', { name: 'Try the puzzle' }).click();
  const first = page.getByRole('textbox', { name: 'Row 1, column 1', exact: true });
  await expect(first).toBeFocused();
  await expectUncovered(first);
  await first.press('3');
  await expect(first).toHaveAttribute('aria-invalid', 'true');
  await expect(narrative(page).locator('.journey-note')).toHaveClass(/has-discovery/);
  await first.press('Backspace');
  await first.press('2');
  await first.press('ArrowRight');
  await expect(page.getByRole('textbox', { name: 'Row 1, column 2', exact: true })).toBeFocused();
  await expectChapter(page, 4, false);
  await visitChapter(page, 5);
  await visitChapter(page, 4);
  await expect(first).toHaveValue('2');
  await deck(page).getByRole('button', { name: 'Exit journey' }).click();
  await expect(deck(page)).toHaveCount(0);
  await expect(first).toHaveValue('2');
});

test('transport radio keys and real loss feedback work without advancing the story', async ({
  page,
}) => {
  await page.goto('/');
  await start(page);
  await visitChapter(page, 5);
  await narrative(page).getByRole('button', { name: 'Take the controls' }).click();
  const preview = page.locator('.transport-preview');
  const reliable = preview.getByRole('radio', { name: 'Reliable', exact: true });
  await expect(reliable).toBeFocused();
  await reliable.press('ArrowRight');
  await expect(preview.getByRole('radio', { name: 'Data lost', exact: true })).toBeChecked();
  await expectChapter(page, 5, false);
  const step = preview.getByRole('button', { name: 'Step transport simulation' });
  await step.focus();
  await step.press('Space');
  await expect(preview.locator('.transport-status')).toContainText('Sending packet 01');
  await step.press('ArrowRight');
  await expectChapter(page, 5, false);
  for (let count = 0; count < 15; count += 1) {
    if ((await preview.locator('.transport-status').innerText()).includes('was lost')) break;
    await step.click();
  }
  await expect(preview.locator('.transport-status')).toContainText('was lost');
  await expect(narrative(page).locator('.journey-note')).toHaveClass(/has-discovery/);
  const event = await preview.locator('.transport-status').innerText();
  await visitChapter(page, 6);
  await visitChapter(page, 5);
  await expect(preview.getByRole('radio', { name: 'Data lost', exact: true })).toBeChecked();
  await expect(preview.locator('.transport-status')).toHaveText(event, { useInnerText: true });
});

test('movie keyboard selection and Escape stay native and selections survive chapter changes', async ({
  page,
}) => {
  await page.goto('/');
  await start(page);
  await visitChapter(page, 6);
  await narrative(page).getByRole('button', { name: 'Choose a film' }).click();
  const preview = page.locator('.movie-preview');
  const select = preview.getByRole('combobox', { name: 'Sample catalogue', exact: true });
  await expect(select).toBeFocused();
  await expectUncovered(select);
  await select.press('m');
  await select.press('Enter');
  await expect(select).toHaveValue('moon');
  await select.press('Escape');
  await expectChapter(page, 6, false);
  await expect(preview.getByRole('status')).toContainText('Top match for Moon');
  await expect(narrative(page).locator('.journey-note')).toHaveClass(/has-discovery/);
  const genres = preview.getByRole('button', { name: 'Genres only', exact: true });
  await genres.focus();
  await genres.press('Space');
  await genres.press('ArrowLeft');
  await expect(genres).toHaveAttribute('aria-pressed', 'true');
  await expectChapter(page, 6, false);
  await visitChapter(page, 7);
  await visitChapter(page, 6);
  await expect(select).toHaveValue('moon');
  await expect(genres).toHaveAttribute('aria-pressed', 'true');
});

test('Escape closes a native disclosure before exiting the journey', async ({ page }) => {
  await page.goto('/');
  await start(page);
  await visitChapter(page, 1);
  const detail = page.locator('#python-performance details');
  const summary = detail.locator('summary');
  await summary.focus();
  await summary.press('Enter');
  await expect(detail).toHaveAttribute('open', '');
  await summary.press('Escape');
  await expect(detail).not.toHaveAttribute('open');
  await expect(summary).toBeFocused();
  await expectChapter(page, 1, false);
  await summary.press('Escape');
  await expect(deck(page)).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-journey');
});

test('the flight plan owns its keyboard interaction and returns focus when closing or visiting a chapter', async ({
  page,
}) => {
  await page.goto('/');
  const experienceEntries = await page.locator('.experience-row').allTextContents();
  await start(page);
  const opener = page.getByRole('button', { name: 'Open flight plan', exact: true });
  await opener.focus();
  await opener.press('Enter');
  const plan = page.getByRole('dialog');
  await expect(plan).toBeVisible();
  await expect(plan).toHaveAccessibleName(/\S/);
  await expect(opener).toHaveAttribute('aria-expanded', 'true');
  await expect(plan.getByRole('heading')).toBeFocused();
  await expect(plan.getByRole('button', { name: /^Visit / })).toHaveCount(chapters.length);
  await plan.getByRole('heading').press('ArrowRight');
  await expectChapter(page, 0, false);
  await page.keyboard.press('Tab');
  await expect
    .poll(() => plan.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true);
  const finalStop = plan.getByRole('button', { name: /^Visit / }).last();
  await finalStop.focus();
  await finalStop.press('Tab');
  // Native Chrome may visit browser chrome at the boundary; background page controls stay inert.
  expect(
    await page.evaluate(
      () => !document.hasFocus() || Boolean(document.activeElement?.closest('dialog')),
    ),
  ).toBe(true);
  await page.keyboard.press('Shift+Tab');
  await expect(finalStop).toBeFocused();
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(plan).toBeHidden();
  await expect(opener).toBeFocused();
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
  await expectChapter(page, 0, false);
  await page.keyboard.press('Escape');
  await expect(deck(page)).toHaveCount(0);

  await start(page);
  await opener.click();
  await plan.getByRole('button', { name: 'Close flight plan', exact: true }).click();
  await expect(opener).toBeFocused();
  await opener.click();
  await plan.getByRole('button', { name: 'Visit The trajectory', exact: true }).click();
  await expect(plan).toBeHidden();
  await expectChapter(page, chapters.indexOf('experience'));
  expect(await page.locator('#experience .experience-row').allTextContents()).toEqual(
    experienceEntries,
  );
  // Selecting the current chapter must still return to its reading position and heading.
  await opener.click();
  await plan.getByRole('button', { name: 'Visit The trajectory', exact: true }).click();
  await expectChapter(page, chapters.indexOf('experience'));
});

test('optional experiments record actual interaction, allow revisits, and reset only on reload', async ({
  page,
}) => {
  await page.goto('/');
  await start(page);
  const end = chapters.length - 1;
  await visitChapter(page, end);
  const logButtons = page.locator('.journey-flight-log').getByRole('button');
  await expect(logButtons).toHaveCount(3);
  await expect(page.locator('.journey-flight-log [data-complete="true"]')).toHaveCount(0);
  for (const button of await logButtons.all()) await expect(button).toBeEnabled();
  // No activity is required to reach the ending; its log can take the visitor back to a demo.
  await logButtons.nth(0).click();
  await expectChapter(page, 4);
  const challenge = narrative(page).locator('.journey-challenge');
  await expect(challenge).not.toHaveAttribute('data-complete', 'true');
  const first = page.getByRole('textbox', { name: 'Row 1, column 1', exact: true });
  await first.fill('3');
  await expect(first).toHaveAttribute('aria-invalid', 'true');
  await expect(challenge).not.toHaveAttribute('data-complete', 'true');
  await first.fill('2');
  await expect(first).not.toHaveAttribute('aria-invalid');
  await expect(challenge).toHaveAttribute('data-complete', 'true');

  await visitChapter(page, 5);
  const transport = page.locator('.transport-preview');
  await transport.getByRole('radio', { name: 'Data lost', exact: true }).check();
  const step = transport.getByRole('button', { name: 'Step transport simulation' });
  for (let count = 0; count < 15; count += 1) {
    if ((await transport.locator('.transport-status').innerText()).includes('was lost')) break;
    await step.click();
  }
  await expect(transport.locator('.transport-status')).toContainText('was lost');
  await expect(challenge).not.toHaveAttribute('data-complete', 'true');
  for (let count = 0; count < 45; count += 1) {
    if (Number(await transport.locator('[data-counter="retries"]').innerText()) > 0) break;
    await step.click();
  }
  expect(Number(await transport.locator('[data-counter="retries"]').innerText())).toBeGreaterThan(
    0,
  );
  await expect(challenge).toHaveAttribute('data-complete', 'true');

  await visitChapter(page, 6);
  await expect(challenge).not.toHaveAttribute('data-complete', 'true');
  await page.getByRole('combobox', { name: 'Sample catalogue', exact: true }).selectOption('moon');
  await expect(page.locator('.movie-preview').getByRole('status')).toContainText(
    'Top match for Moon',
  );
  await expect(challenge).toHaveAttribute('data-complete', 'true');
  await visitChapter(page, end);
  await expect(page.locator('.journey-flight-log [data-complete="true"]')).toHaveCount(3);
  await logButtons.nth(2).click();
  await expectChapter(page, 6);
  await expect(challenge).toHaveAttribute('data-complete', 'true');
  await visitChapter(page, end);
  await page.getByRole('button', { name: /Restart flight/ }).click();
  await expectChapter(page, 0);
  await visitChapter(page, end);
  await expect(page.locator('.journey-flight-log [data-complete="true"]')).toHaveCount(3);
  await deck(page).getByRole('button', { name: 'Exit journey' }).click();
  await start(page);
  await visitChapter(page, end);
  await expect(page.locator('.journey-flight-log [data-complete="true"]')).toHaveCount(3);
  await page.reload();
  await expect(deck(page)).toHaveCount(0);
  await start(page);
  await visitChapter(page, end);
  await expect(page.locator('.journey-flight-log [data-complete="true"]')).toHaveCount(0);
});

test('native scrolling and the rocket remain controllable without timed chapter changes', async ({
  page,
}) => {
  await page.goto('/');
  await start(page);
  await visitChapter(page, 1);
  const initialScroll = await page.evaluate(() => scrollY);
  await page.mouse.move(650, 350);
  await page.mouse.wheel(0, 1600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initialScroll + 1000);
  await expectChapter(page, 1, false);
  const rocket = page.getByRole('scrollbar', { name: 'Page scroll' });
  await rocket.focus();
  await rocket.press('End');
  await expect(rocket).toHaveAttribute('aria-valuenow', '100');
  await expect(deck(page)).toContainText('Exploring freely');
  const stopped = await page.evaluate(() => scrollY);
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => scrollY)).toBe(stopped);
  await expectChapter(page, 1, false);
  await deck(page).getByRole('button', { name: 'Return to current chapter' }).click();
  await expectChapter(page, 1);
  await expect(page.locator('#python-performance')).toBeInViewport();
});

test('native links, browser history and refresh leave a clean normal page', async ({ page }) => {
  await page.goto('/');
  const work = page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Work', exact: true });
  await work.click();
  await expect(page).toHaveURL(/#work$/);
  const historyLength = await page.evaluate(() => history.length);
  await start(page);
  await visitChapter(page, 6);
  await expect(page).toHaveURL(/#work$/);
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  await page.goBack();
  await expect(deck(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/#work$/);
  await page.goForward();
  await expect(page).toHaveURL(/#work$/);
  await expect(deck(page)).toHaveCount(0);
  await start(page);
  await visitChapter(page, 4);
  await page.reload();
  await expect(deck(page)).toHaveCount(0);
  await expect(narrative(page)).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-journey');
  await expect(page.locator('main')).toBeVisible();
  await start(page);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Contact', exact: true })
    .click();
  await expect(page).toHaveURL(/#contact$/);
  await expect(deck(page)).toHaveCount(0);
  await expect(page.locator('#contact')).toBeInViewport();
});

test('reduced-motion opening, discovery and ending pass WCAG AA checks', async ({ page }) => {
  await page.goto('/');
  await start(page);
  for (const index of [0, 4, chapters.length - 1]) {
    if (index) await visitChapter(page, index);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
    expect(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getTiming().iterations === Infinity).length,
      ),
    ).toBe(0);
    await expect(narrative(page).getByRole('heading')).toBeVisible();
    await expectUncovered(deck(page).getByRole('button', { name: 'Exit journey' }));
  }
});

for (const width of [375, 390, 768, 1280, 1440, 1920]) {
  test(`guided controls and the puzzle remain reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.goto('/');
    await start(page);
    await page.evaluate(() => document.fonts.ready);
    await mkdir('test-results/screenshots', { recursive: true });
    for (const index of [0, 4, chapters.length - 1]) {
      if (index) await visitChapter(page, index);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width + 1,
      );
      await expectUncovered(deck(page).getByRole('button', { name: 'Exit journey' }));
      await expectUncovered(deck(page).locator('.journey-next'));
      const openPlan = page.getByRole('button', { name: 'Open flight plan', exact: true });
      await expectUncovered(openPlan);
      if (width === 390 || width === 1440 || index === 4) {
        await page.screenshot({
          path: `test-results/screenshots/journey-${width}-${chapters[index]}.png`,
          animations: 'disabled',
        });
      }
      if (index === 0) {
        await openPlan.click();
        const plan = page.getByRole('dialog');
        await expect(plan).toBeVisible();
        await expectUncovered(plan.getByRole('button', { name: 'Close flight plan', exact: true }));
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width + 1,
        );
        if (width === 390 || width === 1440) {
          await page.screenshot({
            path: `test-results/screenshots/journey-${width}-flight-plan.png`,
            animations: 'disabled',
          });
        }
        await plan.getByRole('button', { name: 'Close flight plan', exact: true }).click();
      }
      if (index === 4) {
        await narrative(page).getByRole('button', { name: 'Try the puzzle' }).click();
        const first = page.getByRole('textbox', { name: 'Row 1, column 1', exact: true });
        await expect(first).toBeFocused();
        await expectUncovered(first);
        await first.press('2');
        await expect(first).toHaveValue('2');
        await expectUncovered(
          deck(page).getByRole('button', { name: 'Next chapter', exact: true }),
        );
      }
    }
  });
}

test('short landscape keeps demo input and exit reachable', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await start(page);
  await visitChapter(page, 4);
  await narrative(page).getByRole('button', { name: 'Try the puzzle' }).click();
  const first = page.getByRole('textbox', { name: 'Row 1, column 1', exact: true });
  await expectUncovered(first);
  await first.press('2');
  await expect(first).toHaveValue('2');
  await expectUncovered(deck(page).getByRole('button', { name: 'Exit journey' }));
  await mkdir('test-results/screenshots', { recursive: true });
  await page.screenshot({
    path: 'test-results/screenshots/journey-844-landscape.png',
    animations: 'disabled',
  });
  await deck(page).getByRole('button', { name: 'Exit journey' }).click();
  await expect(deck(page)).toHaveCount(0);
});

test('without JavaScript the invitation is hidden and the normal portfolio remains usable', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#journey-invitation')).toBeHidden();
  await expect(deck(page)).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Contact', exact: true })
    .click();
  await expect(page.locator('#contact')).toBeInViewport();
  await context.close();
});
