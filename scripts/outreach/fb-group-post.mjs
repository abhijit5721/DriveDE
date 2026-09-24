// Post in a Facebook group from the founder's logged-in Chrome (port 9222).
// Uses the group's anonymous-post option when the group offers it (--anonymous), otherwise
// posts under the account name. Verifies by looking for the text in the group feed or in the
// "pending approval" state. One group per run; never run two in parallel against one Chrome.
// Usage: node scripts/outreach/fb-group-post.mjs <group-url> --file post.txt [--anonymous]
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { readGroupRules, rulesForbidPromotion } from './fb-group-rules.mjs';

const argv = process.argv.slice(2);
const groupUrl = argv[0];
const file = argv[argv.indexOf('--file') + 1];
const anonymous = argv.includes('--anonymous');
const force = argv.includes('--force');
if (!groupUrl || !file) { console.error('usage: fb-group-post.mjs <group-url> --file post.txt [--anonymous] [--force]'); process.exit(1); }
const text = readFileSync(file, 'utf8').trim();
const needle = text.slice(0, 50);

const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 20000 });
const p = await b.contexts()[0].newPage();

// Rules first (founder's rule, 23 Sep): a group that bans self-promotion is skipped, no exceptions
// without --force, and --force is only for a group whose admin gave explicit permission.
const rules = await readGroupRules(p, groupUrl);
console.log(`rules of ${rules.name} (${rules.members}):\n${rules.rules.split('\n').slice(0, 30).join('\n')}`);
if (rulesForbidPromotion(rules.rules) && !force) {
  console.log(`\nSKIPPED ${rules.name}: the rules forbid self-promotion or links.`);
  await p.close(); await b.close(); process.exit(0);
}

await p.goto(groupUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(8000);
const groupName = (await p.title()).replace(/^\(\d+\)\s*/, '').replace(/\s*\|.*$/, '');

// Only members can post. A non-member's composer click opens a join prompt, and the text then
// sits unsent in a dialog, which once read as "posted" (24 Sep). Join first with fb-join.mjs.
const member = await p.evaluate(() => {
  const main = document.querySelector('div[role="main"]') || document.body;
  return ![...main.querySelectorAll('div[role="button"], button')].some((e) => /^(Join group|Gruppe beitreten|Cancel request|Anfrage zurückziehen)$/i.test(e.innerText.trim()));
});
if (!member) { console.log(`NOT A MEMBER of ${groupName}, nothing posted. Run fb-join.mjs first.`); await p.close(); await b.close(); process.exit(1); }

// duplicate guard: our text already visible in this group's feed?
if (await p.evaluate((n) => document.body.innerText.includes(n), needle)) {
  console.log(`ALREADY IN FEED of ${groupName}, nothing posted`); await p.close(); await b.close(); process.exit(0);
}

// open the composer
let opened = false;
if (anonymous) {
  const anon = p.locator('div[role="button"], span').filter({ hasText: /^Anonymous post$|^Anonymer Beitrag$/ }).first();
  if (await anon.count()) { await anon.click(); opened = true; await p.waitForTimeout(3000); }
  if (!opened) console.log('no anonymous option here, posting under the account name');
}
if (!opened) {
  const composer = p.locator('div[role="button"]').filter({ hasText: /Write something|Schreib etwas|What's on your mind|Was machst du gerade/ }).first();
  await composer.waitFor({ timeout: 15000 });
  await composer.click();
  await p.waitForTimeout(3000);
}
// The Messenger side panel is also a role=dialog, so scope everything to the dialog that
// holds the post composer (its textbox), not to the first dialog on the page.
const composerDialog = () => p.locator('div[role="dialog"]').filter({ has: p.locator('div[role="textbox"][contenteditable="true"]') }).filter({ hasText: /Create post|Anonymous post|Beitrag erstellen|Anonymer Beitrag|Post to|Posten in/ }).last();
// anonymous flow may show an explanation step with a "Continue" button
const cont = p.locator('div[role="dialog"] div[role="button"]').filter({ hasText: /^Continue$|^Weiter$|^Create anonymous post$/ }).first();
if (await cont.count()) { await cont.click(); await p.waitForTimeout(2500); }

await composerDialog().waitFor({ timeout: 15000 });
// Some groups put anonymity inside the composer as a "Post anonymously" switch instead of a
// separate button. Clicking its label does not flip it (24 Sep, a post went out under the real
// name), so click the switch itself and refuse to post unless it reads as on.
if (anonymous && !opened) {
  const sw = composerDialog().locator('[role="switch"], input[type="checkbox"]').first();
  if (await sw.count()) {
    if ((await sw.getAttribute('aria-checked')) !== 'true') { await sw.click({ force: true }); await p.waitForTimeout(2500); }
    const cont2 = p.locator('div[role="dialog"] div[role="button"]').filter({ hasText: /^Continue$|^Got it$|^OK$|^Weiter$/ }).first();
    if (await cont2.count()) { await cont2.click(); await p.waitForTimeout(2000); }
    const on = (await composerDialog().locator('[role="switch"], input[type="checkbox"]').first().getAttribute('aria-checked')) === 'true';
    if (!on) { console.log('anonymous switch did not turn on, nothing posted'); await p.close(); await b.close(); process.exit(1); }
    console.log('anonymous switch on');
  } else if (/Post anonymously|Anonym posten/i.test(await composerDialog().innerText())) {
    console.log('anonymous option present but no switch found, nothing posted'); await p.close(); await b.close(); process.exit(1);
  }
}
const box = composerDialog().locator('div[role="textbox"][contenteditable="true"]').first();
await box.click();
await p.keyboard.insertText(text);
await p.waitForTimeout(4000); // link preview
const dialogText = await composerDialog().innerText();
console.log('composer mode:', /anonymous|anonym/i.test(dialogText) ? 'anonymous' : 'named');
const post = composerDialog().locator('div[aria-label="Post"], div[aria-label="Posten"], div[role="button"]').filter({ hasText: /^Post$|^Posten$/ }).last();
await post.click();
// wait until the composer has closed ("Posting" spinner done) before leaving the page
for (let i = 0; i < 20 && (await composerDialog().count()); i++) await p.waitForTimeout(1500);
await p.waitForTimeout(4000);

// Verify on the group's "Your content" pages, never on the current page: the unsent text in an
// open composer would match too.
const base = groupUrl.replace(/\/$/, '');
let verdict = 'NOT FOUND in your content, check the group manually';
for (const [tab, label] of [['my_posted_content', 'POSTED (published)'], ['my_pending_content', 'SUBMITTED, pending admin approval'], ['my_declined_content', 'DECLINED by the admins']]) {
  await p.goto(`${base}/${tab}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(7000);
  if (await p.evaluate((n) => document.body.innerText.includes(n), needle)) { verdict = label; break; }
}
console.log(`${groupName}: ${verdict}`);
// Facebook's feed keeps loading fonts for a long time; a screenshot can hang, so it is best effort.
await p.screenshot({ path: 'scripts/outreach/fb-post-result.png', timeout: 8000 }).catch(() => {});
await p.close(); await b.close();
