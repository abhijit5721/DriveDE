import { test, expect } from '@playwright/test';

/**
 * Install hint (27 Sep): shown only where installing works. Facebook/Instagram in-app
 * browsers have no "Add to Home Screen", and most visitors arrive through Facebook.
 */
const SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const CHROME_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1';
const FACEBOOK_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.40.108;FBBV/617016004;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBCR/;FBID/phone;FBLC/de_DE;FBOP/5]';
const INSTAGRAM_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 339.0.3.12.91 (iPhone15,2; iOS 17_5; de_DE; de; scale=3.00; 1179x2556; 614966064)';

for (const [name, ua, shown, text] of [
  ['iPhone Safari', SAFARI, true, 'Teilen antippen'],
  ['iPhone Chrome', CHROME_IOS, true, 'Teilen oben rechts antippen'],
  ['Facebook in-app browser', FACEBOOK_IOS, false, ''],
  ['Instagram in-app browser', INSTAGRAM_IOS, false, ''],
] as const) {
  test(`install hint: ${name}`, async ({ browser }) => {
    const context = await browser.newContext({ userAgent: ua, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'de-DE' });
    const page = await context.newPage();
    await page.goto('/?lang=de&noanalytics');
    await page.waitForTimeout(2500);
    const hint = page.getByTestId('pwa-install-hint');
    if (shown) {
      await expect(hint).toBeVisible({ timeout: 8000 });
      await expect(hint).toContainText(text);
    } else {
      await expect(hint).toHaveCount(0);
    }
    await context.close();
  });
}
