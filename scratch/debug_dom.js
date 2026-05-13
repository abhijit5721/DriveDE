import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  
  // Complete onboarding
  const startBtn = page.getByTestId('welcome-start-btn');
  if (await startBtn.isVisible({ timeout: 5000 })) {
    await startBtn.click();
    await page.waitForTimeout(500);
    const manualBtn = page.getByTestId('manual-btn').first();
    await manualBtn.click({ force: true });
    const getStarted = page.getByTestId('welcome-get-started');
    if (await getStarted.isVisible({ timeout: 2000 })) {
      await getStarted.click({ force: true });
    }
  }
  
  await page.waitForTimeout(2000);
  await page.getByTestId('nav-curriculum').filter({ visible: true }).click();
  await page.waitForTimeout(2000);
  
  const html = await page.content();
  console.log(html);
  
  await browser.close();
})();
