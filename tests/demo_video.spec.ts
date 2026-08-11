import { test, expect, type Page } from '@playwright/test';

/**
 * DRI-17: the Watch Demo modal plays a real, language-aware MP4
 * with controls, closes on Escape, and restores body scroll.
 */

async function openDemo(page: Page, lang: 'de' | 'en') {
  await page.goto(`/?lang=${lang}`);
  const cookie = page.getByTestId('cookie-accept-all');
  if (await cookie.isVisible({ timeout: 4000 }).catch(() => false)) {
    await cookie.click();
  }
  await page.getByRole('button', { name: lang === 'de' ? 'Demo ansehen' : 'Watch Demo' }).click();
  return page.getByTestId('demo-video');
}

for (const lang of ['en', 'de'] as const) {
  test(`demo modal plays demo-${lang}.mp4`, async ({ page }) => {
    const video = await openDemo(page, lang);
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('src', `/demo-${lang}.mp4`);

    // playback actually starts (readyState >= 2 and currentTime advances)
    await expect
      .poll(async () => video.evaluate((v: HTMLVideoElement) => v.readyState), { timeout: 15000 })
      .toBeGreaterThanOrEqual(2);
    await expect
      .poll(async () => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 15000 })
      .toBeGreaterThan(0.5);
  });
}

test('Escape closes the demo modal and restores scroll', async ({ page }) => {
  const video = await openDemo(page, 'en');
  await expect(video).toBeVisible();
  await expect
    .poll(async () => page.evaluate(() => document.body.style.overflow))
    .toBe('hidden');

  await page.keyboard.press('Escape');
  await expect(video).not.toBeVisible();
  await expect
    .poll(async () => page.evaluate(() => document.body.style.overflow))
    .not.toBe('hidden');
});
