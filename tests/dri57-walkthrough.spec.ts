import { test, expect, type Page } from '@playwright/test';

// Visual walkthrough of DRI-57 on a phone viewport; screenshots land in demo-video/dri57-*.png.
// Run: npx playwright test tests/dri57-walkthrough.spec.ts --project="Mobile Android (Pixel 7)"
test.describe.configure({ timeout: 120_000 });

const ROUND: Array<[string, string[]]> = [
  ['public-rvl', ['car-blue-car', 'car-red-car']],
  ['public-bending', ['car-blue-car', 'car-red-car']],
  ['public-stop', ['car-red-car', 'car-blue-car']],
];

async function tap(page: Page, id: string) {
  const el = page.getByTestId(id);
  await el.click({ timeout: 5000 }).catch(() => el.click({ force: true }));
}

test('DRI-57 walkthrough with screenshots (German)', async ({ page }) => {
  await page.goto('/?lang=de&trainer=vorfahrt');
  const cookie = page.getByTestId('cookie-accept-all');
  if (await cookie.isVisible({ timeout: 4000 }).catch(() => false)) await cookie.click();
  await expect(page.getByTestId('public-trainer')).toBeVisible();
  await expect(page.getByTestId('simulator-svg')).toBeVisible();
  await page.screenshot({ path: 'demo-video/dri57-1-deeplink-trainer.png' });

  for (const [scenarioId, taps] of ROUND) {
    await expect(page.locator(`[data-testid="simulator-svg"][data-scenario="${scenarioId}"]`)).toBeVisible({ timeout: 10000 });
    for (const car of taps) await tap(page, car);
  }
  await expect(page.getByTestId('public-trainer-result')).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId('public-trainer-exam')).toBeVisible();
  await page.screenshot({ path: 'demo-video/dri57-2-result-examdate.png', fullPage: false });

  const d = new Date(); d.setDate(d.getDate() + 30);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  await page.getByTestId('exam-date-input').fill(iso);
  await page.getByTestId('exam-continue').click();
  await expect(page.getByTestId('public-trainer-prompt')).toBeVisible();
  await expect(page.getByTestId('public-trainer-signup')).toHaveCount(0);
  await page.screenshot({ path: 'demo-video/dri57-3-plan-share.png' });

  await page.getByTestId('public-trainer-more').getByRole('button').click();
  await expect(page.getByTestId('public-locked-preview')).toBeVisible();
  await expect(page.getByTestId('public-trainer-signup')).toBeVisible();
  await page.waitForTimeout(4000);
  const previewSvg = await page.getByTestId('public-locked-preview').locator('svg, canvas').count();
  console.log('locked preview drawable elements:', previewSvg);
  await page.screenshot({ path: 'demo-video/dri57-4-locked-door.png' });
});
