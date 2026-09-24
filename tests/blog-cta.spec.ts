import { test, expect } from '@playwright/test';

/**
 * Blog articles end with a topic-matched trainer link (scripts/build-blog.mjs, 24 Sep).
 * The link must open the trainer directly and carry utm_source=blog + the article slug.
 */
for (const [q, label] of [['trainer=vorfahrt&utm_source=blog&utm_campaign=schulterblick', 'vorfahrt'], ['trainer=roundabout&lang=en&utm_source=blog&utm_campaign=convert-uk-driving-licence-germany', 'roundabout']] as const) {
  test(`blog link opens the ${label} trainer and tags the article`, async ({ page }) => {
    // Vercel Analytics logs each event in dev together with its data object; collect those.
    const events: unknown[] = [];
    page.on('console', async (m) => {
      if (!m.text().includes('[event]')) return;
      const args = await Promise.all(m.args().map((a) => a.jsonValue().catch(() => null)));
      events.push(...args);
    });
    await page.goto(`/?${q}`);
    // the right-of-way rung draws junctions, the roundabout rung has its own controls
    const trainer = label === 'roundabout' ? page.getByTestId('roundabout-signal-btn') : page.locator('[data-testid="simulator-svg"]').first();
    await expect(trainer).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1500);
    const payload = JSON.stringify(events);
    expect(payload).toContain('try_click');
    expect(payload).toContain('utm_source=blog');
  });
}
