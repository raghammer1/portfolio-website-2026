import { mkdir } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('Sudoku accepts keyboard input, reports conflicts, and supports arrow navigation', async ({
  page,
}) => {
  await page.goto('/');
  const preview = page.locator('.personal-work-preview');
  const first = preview.getByRole('textbox', { name: 'Row 1, column 1', exact: true });
  await first.focus();
  await first.press('3');
  await expect(first).toHaveValue('3');
  await expect(first).toHaveAttribute('aria-invalid', 'true');
  await expect(preview.getByRole('status')).toContainText('repeats');

  await first.press('Backspace');
  await expect(first).toHaveValue('');
  await expect(first).not.toHaveAttribute('aria-invalid');
  await first.press('2');
  await expect(first).toHaveValue('2');
  await expect(first).not.toHaveAttribute('aria-invalid');
  await first.press('ArrowRight');
  await expect(
    preview.getByRole('textbox', { name: 'Row 1, column 2', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('ArrowDown');
  const given = preview.getByRole('textbox', {
    name: 'Row 2, column 2, given number',
    exact: true,
  });
  await expect(given).toBeFocused();
  await expect(given).toHaveAttribute('readonly', '');
  await given.press('1');
  await expect(given).toHaveValue('9');
});

test('Sudoku solves a valid board and reset restores the original nonempty preset', async ({
  page,
}) => {
  await page.goto('/');
  const preview = page.locator('.personal-work-preview');
  const cells = preview.getByRole('textbox');
  await expect(cells).toHaveCount(81);
  const values = () =>
    cells.evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  const original = await values();
  const clues = original.filter(Boolean).length;
  expect(clues).toBeGreaterThan(0);
  expect(clues).toBeLessThan(81);

  await preview.getByRole('button', { name: 'Solve preview', exact: true }).click();
  await expect(preview.getByRole('status')).toContainText('Solved');
  const solved = (await values()).map(Number);
  expect(solved.every((value) => value >= 1 && value <= 9)).toBe(true);
  expect(original.every((value, index) => !value || solved[index] === Number(value))).toBe(true);
  const required = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let group = 0; group < 9; group++) {
    const row = solved.slice(group * 9, group * 9 + 9);
    const column = solved.filter((_, index) => index % 9 === group);
    const boxRow = Math.floor(group / 3) * 3;
    const boxColumn = (group % 3) * 3;
    const box = Array.from(
      { length: 9 },
      (_, index) => solved[(boxRow + Math.floor(index / 3)) * 9 + boxColumn + (index % 3)],
    );
    expect(row.sort()).toEqual(required);
    expect(column.sort()).toEqual(required);
    expect(box.sort()).toEqual(required);
  }

  await preview.getByRole('button', { name: 'Reset', exact: true }).click();
  expect(await values()).toEqual(original);
  await expect(preview.getByRole('button', { name: 'Solve preview', exact: true })).toBeEnabled();
  await expect(preview.locator('[aria-invalid="true"]')).toHaveCount(0);
});

test('personal projects fit mobile and desktop viewports', async ({ page }) => {
  await mkdir('test-results/screenshots', { recursive: true });
  await page.goto('/');
  const projects = page.locator('.personal-work');
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await projects.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const board = await page.locator('.personal-work-board').boundingBox();
    expect(board).not.toBeNull();
    expect(board!.x).toBeGreaterThanOrEqual(0);
    expect(board!.x + board!.width).toBeLessThanOrEqual(width);
    expect(Math.abs(board!.width - board!.height)).toBeLessThan(2);
    expect(await projects.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await projects.screenshot({
      path: `test-results/screenshots/projects-${width}.png`,
      animations: 'disabled',
      style: '.site-header, .skip-link { visibility: hidden !important; }',
    });
  }
});
