// Print a Facebook group's rules and membership numbers (read-only, port 9222 Chrome).
// Usage: node scripts/outreach/fb-group-rules.mjs <group-url> [<group-url> ...]
import { chromium } from 'playwright';

export async function readGroupRules(p, groupUrl) {
  await p.goto(groupUrl.replace(/\/$/, '') + '/about', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(7000);
  for (const el of await p.locator('div[role="button"]').filter({ hasText: /^See more$|^Mehr anzeigen$/ }).all()) await el.click().catch(() => {});
  await p.waitForTimeout(1000);
  return p.evaluate(() => {
    const t = document.body.innerText.replace(/[ \t]+/g, ' ');
    const name = document.title.replace(/^\(\d+\)\s*/, '').replace(/\s*\|.*$/, '');
    const members = (t.match(/([\d.,]+[KM]?)\s*(members|Mitglieder)/i) || [])[0] || '';
    const i = t.search(/Group rules from the admins|Gruppenregeln|Group rules/i);
    const rules = i >= 0 ? t.slice(i, i + 2500).split('\n').map(s => s.trim()).filter(Boolean).slice(0, 40).join('\n') : '(no rules section found)';
    const about = (t.match(/About[\s\S]{0,600}/) || [''])[0].split('\n').map(s => s.trim()).filter(Boolean).slice(1, 8).join(' ');
    return { name, members, about, rules };
  });
}

/** True when the rules text forbids what post B is: a product/self-promotion post with a link. */
export function rulesForbidPromotion(rules) {
  const r = rules.replace(/\s+/g, ' ');
  return /no (self[- ]?promotion|promotion|advertis\w*|ads\b|spam|business posts|selling|links)/i.test(r)
    || /keine (werbung|eigenwerbung)/i.test(r)
    || /(self[- ]?promotion|promotion\w*|advertis\w*|spam|irrelevant links)[^.]{0,80}(aren't allowed|are not allowed|not allowed|prohibited|banned|will be (deleted|removed|not approved))/i.test(r)
    || /(not allowed|prohibited|banned)[^.]{0,60}(self[- ]?promotion|promotion|advertis)/i.test(r);
}

const isMain = process.argv[1] && /fb-group-rules\.mjs$/.test(process.argv[1]);
if (isMain) {
  const urls = process.argv.slice(2);
  if (!urls.length) { console.error('usage: fb-group-rules.mjs <group-url> ...'); process.exit(1); }
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 20000 });
  const p = await b.contexts()[0].newPage();
  for (const u of urls) {
    const r = await readGroupRules(p, u);
    console.log(`\n=== ${r.name} (${r.members}) ${u}\n${r.about}\n--- rules ---\n${r.rules}\n--- verdict: ${rulesForbidPromotion(r.rules) ? 'PROMOTION FORBIDDEN, do not post B' : 'no explicit promotion ban found, read above before posting'}`);
  }
  await p.close(); await b.close();
}
