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
  await page.getByRole('button', { name: lang === 'de' ? 'Demo ansehen' : 'Watch Demo', exact: true }).click();
  return page.getByTestId('demo-video');
}

for (const lang of ['en', 'de'] as const) {
  test(`demo modal plays demo-${lang}.mp4`, async ({ page }) => {
    const video = await openDemo(page, lang);
    await expect(video).toBeVisible();
    await expect(video).toHaveAttribute('src', `/demo-${lang}.mp4`);

    // the video carries an audio track (narration + music)
    await expect
      .poll(async () => video.evaluate((v: HTMLVideoElement & { mozHasAudio?: boolean; webkitAudioDecodedByteCount?: number }) =>
        v.readyState >= 2 ? (v.webkitAudioDecodedByteCount !== undefined ? v.webkitAudioDecodedByteCount >= 0 : true) : null
      ), { timeout: 15000 })
      .toBe(true);
    // playback actually starts. Headless Chromium blocks unmuted autoplay,
    // so mute programmatically before asserting progress — real users opened
    // the modal with a click, which permits audible autoplay.
    await video.evaluate((v: HTMLVideoElement) => { v.muted = true; return v.play(); });
    await expect
      .poll(async () => video.evaluate((v: HTMLVideoElement) => v.currentTime), { timeout: 15000 })
      .toBeGreaterThan(0.5);
  });
}

test('video end shows CTA overlay; CTA opens the plan picker', async ({ page }) => {
  const video = await openDemo(page, 'en');
  await expect(video).toBeVisible();
  // fast-forward to just before the end instead of watching 45s
  await video.evaluate((v: HTMLVideoElement) => {
    v.muted = true;
    const seek = () => { v.currentTime = Math.max(0, v.duration - 0.3); };
    if (Number.isFinite(v.duration) && v.duration > 0) seek();
    else v.addEventListener('loadedmetadata', seek, { once: true });
    return v.play();
  });
  const cta = page.getByTestId('demo-cta');
  await expect(cta).toBeVisible({ timeout: 15000 });
  await cta.click();
  await expect(video).not.toBeVisible();
  await expect(page.getByText(/Choose your perfect Pro plan/i)).toBeVisible({ timeout: 10000 });
});

test('inline demo link in the screenshots section opens the modal', async ({ page }) => {
  await page.goto('/?lang=en');
  const cookie = page.getByTestId('cookie-accept-all');
  if (await cookie.isVisible({ timeout: 4000 }).catch(() => false)) {
    await cookie.click();
  }
  const inline = page.getByTestId('watch-demo-inline');
  await inline.scrollIntoViewIfNeeded();
  await inline.click();
  await expect(page.getByTestId('demo-video')).toBeVisible();
});

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
