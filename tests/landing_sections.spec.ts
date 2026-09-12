import { test, expect, type Page } from '@playwright/test';

/**
 * DRI-45: the landing page shows before it explains. Trainer tiles sit under
 * the hero and open the public trainer ladder; the cost argument is three
 * bullets; pricing is demoted and opens with "all trainers stay free"; no
 * "Pricing" link next to the free trainer button.
 */

async function openLanding(page: Page, lang: 'de' | 'en') {
  await page.goto(`/?lang=${lang}`);
  const cookie = page.getByTestId('cookie-accept-all');
  if (await cookie.isVisible({ timeout: 4000 }).catch(() => false)) await cookie.click();
}

test('nav names what is free, tiles sit under the hero, pricing opens with the free line', async ({ page, isMobile }) => {
  await openLanding(page, 'en');
  if (isMobile) await page.getByTestId('mobile-menu-toggle').click();
  const nav = page.locator('nav');
  await expect(nav.getByRole('link', { name: 'Free vs Pro' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Trainers' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Pricing', exact: true })).toHaveCount(0);
  if (isMobile) await page.getByTestId('mobile-menu-toggle').click();

  const tiles = page.getByTestId('trainer-tiles');
  await expect(tiles).toBeVisible();
  await expect(tiles).toContainText('The trainers. Free, no account needed.');
  await expect(page.getByTestId('tile-vorfahrt')).toContainText('Try it');
  await expect(page.getByTestId('tile-parking')).toContainText('With account');

  await expect(page.getByTestId('problem-bullets').locator('li')).toHaveCount(3);
  await expect(page.getByTestId('pricing-heading')).toHaveText('All trainers stay free');
  // The old trial framing is gone from the mid-page CTAs
  await expect(page.getByText('7-Day Free Pro Trial')).toHaveCount(0);
  await expect(page.getByText('Start your 7-day free Pro trial today.')).toHaveCount(0);
});

test('on a phone the first trainer tile is within one screen of scrolling from the top', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile acceptance criterion');
  await openLanding(page, 'de');
  const box = await page.getByTestId('tile-vorfahrt').boundingBox();
  const viewport = page.viewportSize()!;
  expect(box).not.toBeNull();
  // scrollY is 0 at load, so the tile's top must be below the fold by less than one viewport height
  expect(box!.y).toBeLessThan(viewport.height * 2);
});

test('tiles open the ladder at the matching rung', async ({ page }) => {
  await openLanding(page, 'de');
  // Roundabout tile opens rung 2 directly
  await page.getByTestId('tile-roundabout').click();
  // two lazy chunks (trainer overlay + roundabout) may compile on first hit in dev
  await expect(page.getByTestId('public-roundabout')).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('ladder-rung-2')).toHaveAttribute('data-state', 'active');
  await page.getByTestId('public-trainer-close').click();

  // Parking tile opens the locked prompt naming what unlocks
  await page.getByTestId('tile-parking').click();
  await expect(page.getByTestId('public-locked-preview')).toBeVisible();
  await expect(page.getByText('Einparken freischalten?')).toBeVisible();
  await page.getByTestId('public-trainer-close').click();

  // Right-before-left tile opens rung 1 like the hero button
  await page.getByTestId('tile-vorfahrt').click();
  await expect(page.locator('[data-testid="simulator-svg"][data-scenario="public-rvl"]')).toBeVisible();
});
