// Print the gutefrage account logged in inside the automation Chrome (port 9222 by default).
import { chromium } from 'playwright';
const b = await chromium.connectOverCDP(process.env.CDP_URL || 'http://127.0.0.1:9222', { timeout: 15000 });
const p = await b.contexts()[0].newPage();
await p.goto('https://www.gutefrage.net/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(3000);
try { await p.getByRole('button', { name: /Accept all|Alle akzeptieren/i }).first().click({ timeout: 2500 }); } catch {}
const r = await p.evaluate(() => {
  const user = [...document.querySelectorAll('a[href^="/nutzer/"]')].map(a => a.getAttribute('href')).find(Boolean);
  const loggedOut = /Einloggen|Registrieren/.test(document.querySelector('header')?.innerText || '');
  return { user, loggedOut, header: (document.querySelector('header')?.innerText || '').replace(/\n+/g, ' | ').slice(0, 200) };
});
console.log(JSON.stringify(r));
await p.close(); await b.close();
