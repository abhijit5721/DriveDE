const { chromium } = require('playwright');

async function runPerformanceTest() {
  console.log('Starting performance test (Run 2)...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } }); // Ensure desktop view for sidebar
  const page = await context.newPage();
  
  const results = {};

  // 1. Initial Load Time
  console.log('Navigating to Home...');
  const startLoad = Date.now();
  await page.goto('http://localhost:5177/');
  // Wait for the app to be fully loaded (e.g., waiting for the main container)
  await page.waitForLoadState('networkidle');
  const endLoad = Date.now();
  results['Initial Load (ms)'] = endLoad - startLoad;
  console.log(`Initial Load Time: ${results['Initial Load (ms)']}ms`);

  // Define tabs to click - trying to use role or generic text matching
  const tabs = [
    { name: 'Curriculum', selector: 'text=Curriculum' },
    { name: 'Maneuvers', selector: 'text=Grundfahraufgaben' }, // German for Maneuvers
    { name: 'Achievements', selector: 'text=Erfolge' },
    { name: 'Tracker', selector: 'text=Tracker' },
    { name: 'Finance', selector: 'text=Finanzen' },
    { name: 'Account', selector: 'text=Account' },
    { name: 'Home', selector: 'text=Home' }
  ];

  for (const tab of tabs) {
    console.log(`Looking for ${tab.name}...`);
    // Find the button in the sidebar (aside) to avoid clicking titles or headers
    const locator = page.locator(`aside >> ${tab.selector}`).first();
    
    try {
      // Check if it's visible before clicking
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`Clicking on ${tab.name}...`);
      const startNav = Date.now();
      await locator.click();
      await page.waitForTimeout(300); // Give React time to swap DOM
      const endNav = Date.now();
      results[`Nav to ${tab.name} (ms)`] = endNav - startNav;
      console.log(`Navigation to ${tab.name} took ${endNav - startNav}ms`);
    } catch (e) {
      console.log(`Could not find or click ${tab.name} in sidebar.`);
    }
  }

  // Check Dashboard card 'Instructor Review Pack'
  console.log('Going back to Home for Dashboard checks...');
  try {
     await page.locator(`aside >> text=Home`).first().click();
     await page.waitForTimeout(500);
  } catch(e) {}

  console.log('Looking for Review Pack card...');
  // The review pack card has a clipboard icon usually, or text "Prüfer-Pack" / "Review Pack"
  const reviewCard = page.locator('text=Review').first(); 
  // Fallback to clipboard icon if text fails
  const fallbackCard = page.locator('svg.lucide-clipboard-check').locator('..').locator('..');

  try {
    const startReview = Date.now();
    try {
       await reviewCard.click({ timeout: 2000 });
    } catch(e) {
       await fallbackCard.click({ timeout: 2000 });
    }
    await page.waitForTimeout(300);
    const endReview = Date.now();
    results['Nav to Review Pack (ms)'] = endReview - startReview;
    console.log(`Navigation to Review Pack took ${endReview - startReview}ms`);
  } catch (e) {
    console.log('Review Pack card not found on dashboard or could not be clicked.');
  }

  // Get basic performance metrics from the browser
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  results['DomContentLoaded (ms)'] = Math.max(0, performanceTiming.domContentLoadedEventEnd - performanceTiming.navigationStart);
  results['Load Event (ms)'] = Math.max(0, performanceTiming.loadEventEnd - performanceTiming.navigationStart);

  console.log('\n--- Performance Results ---');
  console.table(results);

  await browser.close();
}

runPerformanceTest().catch(console.error);
