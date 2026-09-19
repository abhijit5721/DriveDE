import { test, expect } from '@playwright/test';

// Visual check of the German landing copy pass (r/hamburg feedback, 19 Sep).
// Run: npx playwright test tests/de-copy-check.spec.ts --project="Mobile Android (Pixel 7)"
test.describe.configure({ timeout: 120_000 });

test('German landing copy reads correctly and hyphenates', async ({ page }) => {
  await page.goto('/?lang=de');
  await page.getByTestId('cookie-accept-all').click({ timeout: 4000 }).catch(() => undefined);

  // the document language must be German, otherwise the hyphenation rule never applies
  await expect.poll(() => page.evaluate(() => document.documentElement.lang)).toBe('de');
  const hyphenated = await page.evaluate(() => {
    const p = document.querySelector('p');
    return p ? getComputedStyle(p).hyphens || getComputedStyle(p).webkitHyphens : null;
  });
  expect(hyphenated, 'German running text must be allowed to hyphenate').toBe('auto');

  // Expand every FAQ entry first: collapsed answers are not in innerText, which
  // is how "Umschreibungspfad" survived the first version of this check.
  const faqButtons = page.locator('#faq button');
  const count = await faqButtons.count();
  for (let i = 0; i < count; i++) {
    await faqButtons.nth(i).click({ timeout: 4000 }).catch(() => undefined);
    await page.waitForTimeout(150);
  }

  // none of the corrected phrasings may survive anywhere on the page
  const body = await page.evaluate(() => document.body.innerText);
  for (const gone of [
    'während der Fahrt',
    'Wisse genau',
    'bestehst im ersten Anlauf',
    'Umschreibungspfad',
    'Gefahren-Hotspots',
    '3D Manöversimulationen',
    'Wie hilft mir DriveDE Geld zu sparen',
  ]) {
    expect(body, `old wording still on the page: ${gone}`).not.toContain(gone);
  }

  // how it works
  const how = page.locator('#how-it-works');
  await how.scrollIntoViewIfNeeded();
  await how.screenshot({ path: 'demo-video/de-how.png' });

  // the FAQ answers that changed
  const faq = page.locator('#faq');
  await faq.scrollIntoViewIfNeeded();
  await page.getByText('Wie hilft mir DriveDE, Geld zu sparen?').click();
  await page.waitForTimeout(500);
  await faq.screenshot({ path: 'demo-video/de-faq.png' });
});
