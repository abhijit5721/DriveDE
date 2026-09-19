import { test, expect } from '@playwright/test';

// Visual check for the single-lane roundabout fix (r/hamburg feedback, 19 Sep).
// Run: npx playwright test tests/roundabout-check.spec.ts --project="Mobile Android (Pixel 7)"
test.describe.configure({ timeout: 90_000 });

test('roundabout tile and trainer show one lane, no dashed divider', async ({ page }) => {
  await page.goto('/?lang=de');
  const cookie = page.getByTestId('cookie-accept-all');
  if (await cookie.isVisible({ timeout: 4000 }).catch(() => false)) await cookie.click();

  const tile = page.getByTestId('tile-roundabout');
  await tile.scrollIntoViewIfNeeded();
  await expect(tile).toBeVisible();
  await tile.screenshot({ path: 'demo-video/rb-tile.png' });

  // The banner was already accepted above; on WebKit it can still be mid-detach here,
  // so the second dismissal must never block the test.
  await page.goto('/?lang=de&trainer=roundabout');
  await cookie.click({ timeout: 3000 }).catch(() => undefined);
  const rb = page.getByTestId('public-roundabout');
  await expect(rb).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1500);
  await rb.screenshot({ path: 'demo-video/rb-trainer-entry.png' });

  // drive into the roundabout so the car sits on the circular lane
  await page.getByTestId('roundabout-action-btn').click();
  await page.waitForTimeout(2500);
  await rb.screenshot({ path: 'demo-video/rb-trainer-inside.png' });

  // no dashed circle anywhere in either SVG
  const dashed = await page.evaluate(() =>
    [...document.querySelectorAll('circle')].filter((c) => c.getAttribute('stroke-dasharray')).length
  );
  expect(dashed, 'no dashed circle may remain inside the circular carriageway').toBe(0);
});
