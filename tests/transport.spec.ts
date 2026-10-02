import { expect, test } from '@playwright/test';
import type { Locator } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

const receivedMessage = 'MAKE EVERY PACKET FIND ITS WAY.';

async function finishManually(preview: Locator) {
  const step = preview.getByRole('button', { name: 'Step transport simulation' });
  let steps = 0;
  while ((await step.isEnabled()) && steps < 60) {
    await step.click();
    steps += 1;
  }
  expect(steps).toBeLessThan(60);
  await expect(preview.getByRole('status', { name: 'Received message' })).toHaveText(
    receivedMessage,
  );
  await expect(preview.locator('[data-counter="confirmed"]')).toHaveText('6');
  await expect(preview.locator('.transport-sequence [data-state="confirmed"]')).toHaveCount(6);
  await expect(preview.locator('.transport-status')).toContainText('All six packets confirmed');
}

test('a reliable connection delivers all six packets once using keyboard and manual steps', async ({
  page,
}) => {
  await page.goto('/');
  const preview = page.locator('.transport-preview');
  const step = preview.getByRole('button', { name: 'Step transport simulation' });
  await step.focus();
  await page.keyboard.press('Space');
  await expect(preview.locator('.transport-status')).toContainText('Sending packet 01');
  await expect(step).toBeFocused();
  await finishManually(preview);
  await expect(preview.locator('[data-counter="retries"]')).toHaveText('0');
  await expect(preview.locator('[data-counter="duplicates"]')).toHaveText('0');
});

test('lost data is retried, early packets are buffered, and repeated ACKs cannot duplicate delivery', async ({
  page,
}) => {
  await page.goto('/');
  const preview = page.locator('.transport-preview');
  await preview.getByRole('radio', { name: 'Data lost', exact: true }).check();
  const step = preview.getByRole('button', { name: 'Step transport simulation' });
  let sawLoss = false;
  let sawBuffer = false;
  let sawRepeatedAck = false;
  for (let index = 0; index < 60 && (await step.isEnabled()); index += 1) {
    await step.click();
    const status = await preview.locator('.transport-status').innerText();
    sawLoss ||= status.includes('Packet 02 was lost');
    sawBuffer ||= (await preview.locator('[data-state="buffered"]').count()) > 0;
    sawRepeatedAck ||= status.includes('Repeated ACK');
  }
  expect(sawLoss).toBe(true);
  expect(sawBuffer).toBe(true);
  expect(sawRepeatedAck).toBe(true);
  await expect(preview.getByRole('status', { name: 'Received message' })).toHaveText(
    receivedMessage,
  );
  await expect(preview.locator('[data-counter="confirmed"]')).toHaveText('6');
  expect(Number(await preview.locator('[data-counter="retries"]').innerText())).toBeGreaterThan(0);
  expect(Number(await preview.locator('[data-counter="duplicates"]').innerText())).toBeGreaterThan(
    0,
  );
  await expect(preview.locator('[data-state="buffered"]')).toHaveCount(0);
});

test('a lost final ACK keeps transmission open, retransmits safely, and reset clears every state', async ({
  page,
}) => {
  await page.goto('/');
  const preview = page.locator('.transport-preview');
  await preview.getByRole('radio', { name: 'ACK lost', exact: true }).check();
  const step = preview.getByRole('button', { name: 'Step transport simulation' });
  for (let index = 0; index < 18; index += 1) await step.click();
  await expect(preview.locator('.transport-status')).toContainText('ACK 06 was lost');
  await expect(preview.getByRole('status', { name: 'Received message' })).toHaveText(
    receivedMessage,
  );
  await expect(preview.locator('[data-counter="confirmed"]')).toHaveText('5');
  await expect(step).toBeEnabled();
  await finishManually(preview);
  await expect(preview.locator('[data-counter="retries"]')).toHaveText('1');
  await expect(preview.locator('[data-counter="duplicates"]')).toHaveText('1');

  await preview.getByRole('button', { name: 'Reset transport simulation' }).click();
  await expect(preview.getByRole('radio', { name: 'ACK lost', exact: true })).toBeChecked();
  await expect(preview.getByRole('status', { name: 'Received message' })).toHaveText(
    'Waiting for the first packet.',
  );
  await expect(preview.locator('.transport-sequence [data-state="waiting"]')).toHaveCount(6);
  await expect(preview.locator('[data-counter="confirmed"]')).toHaveText('0');
  await expect(preview.locator('[data-counter="retries"]')).toHaveText('0');
  await expect(preview.locator('[data-counter="duplicates"]')).toHaveText('0');

  await preview.getByRole('button', { name: 'Run transport simulation' }).click();
  await expect(preview.locator('.transport-status')).toContainText('Sending packet 01');
  await preview.getByRole('button', { name: 'Reset transport simulation' }).click();
  await page.waitForTimeout(650);
  await expect(preview.locator('.transport-status')).toContainText('Ready to send');
  await expect(preview.locator('.transport-datagram')).toHaveCount(0);
});

test('autoplay pauses offscreen and the complete preview fits a 375px viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/');
  const preview = page.locator('.transport-preview');
  await preview.scrollIntoViewIfNeeded();
  const bounds = await preview.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  expect(await preview.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  );
  await preview.getByRole('button', { name: 'Run transport simulation' }).click();
  await expect(preview.getByRole('button', { name: 'Pause transport simulation' })).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(preview.getByRole('button', { name: 'Run transport simulation' })).toBeAttached();
  const lastEvent = await preview.locator('.transport-status').innerText();
  await page.waitForTimeout(650);
  expect(await preview.locator('.transport-status').innerText()).toBe(lastEvent);
});
