import { test, expect } from '@playwright/test';

test.describe('Mobile Premium Experience Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Capacitor.isNativePlatform() to return true
    await page.addInitScript(() => {
      const win = window as any;
      win.isNativePlatform = true;
      win.Capacitor = {
        isNativePlatform: () => true,
        getPlatform: () => 'android'
      };
    });
    
    await page.goto('/');
    
    // Accept cookies if the banner appears to avoid blocking clicks
    const cookieBanner = page.getByTestId('cookie-accept-all');
    if (await cookieBanner.isVisible()) {
      await cookieBanner.click();
    }
  });

  test('should bypass welcome page and show premium license selector on native mobile', async ({ page }) => {
    // 1. Verify we DON'T see the welcome page "Start Now" button
    const startBtn = page.getByTestId('welcome-start-btn');
    await expect(startBtn).not.toBeVisible();

    // 2. Verify we DO see the License Selector (German or English)
    const licenseTitle = page.locator('h1');
    await expect(licenseTitle).toHaveText(/Select your driving license path|Lernpfad wählen/i);

    // 3. Check for premium font loading (Outfit for headings)
    const fontResult = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? window.getComputedStyle(h1).fontFamily : '';
    });
    console.log(`Detected Heading Font: ${fontResult}`);
    // Check if Outfit is present (it might be wrapped in quotes or followed by fallbacks)
    expect(fontResult.toLowerCase()).toContain('outfit');
  });

  test('should handle setup wizard flow with smooth transitions', async ({ page }) => {
    // Select Standard Path (Neuer Führerschein)
    const standardPath = page.getByTestId('path-standard');
    await standardPath.click();

    // Verify Transmission section appears (Select your transmission type / Getriebe wählen)
    const transmissionTitle = page.locator('h2').filter({ hasText: /Select your transmission type|Getriebe wählen/i });
    await expect(transmissionTitle).toBeVisible();

    // Select Manual (Schaltgetriebe)
    await page.getByTestId('manual-btn').click();

    // Continue button should be enabled (App starten / Start App)
    const continueBtn = page.getByTestId('license-continue-btn');
    await expect(continueBtn).toBeEnabled();
  });
});
