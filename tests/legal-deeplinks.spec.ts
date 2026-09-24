/** Public addresses of the legal pages; Google's OAuth consent screen links to them (24 Sep). */
import { test, expect } from '@playwright/test';
for (const [q, text] of [['privacy', /Datenschutz/], ['terms', /AGB|Nutzungsbedingungen/], ['impressum', /Impressum/]] as const) {
  test(`?legal=${q} opens the page`, async ({ page }) => {
    await page.goto(`/?lang=de&legal=${q}`);
    await expect(page.getByRole('heading', { name: text }).first()).toBeVisible({ timeout: 15000 });
  });
}
