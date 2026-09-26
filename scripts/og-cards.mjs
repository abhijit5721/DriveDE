/**
 * Link-preview cards (Open Graph, 1200x630) for the landing page and every blog post.
 *
 * WhatsApp, Facebook and LinkedIn show og:image when a link is shared; until 26 Sep
 * every page used the square app icon. Renders branded JPEG cards via Playwright into
 * public/og/ (committed): landing-de.jpg, landing-en.jpg and <slug>.jpg per post.
 * build-blog.mjs uses public/og/<slug>.jpg when it exists, otherwise the landing card,
 * so a new post still gets a proper card before this script is rerun.
 *
 * Run: node scripts/og-cards.mjs [--only slug1,slug2]
 */
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const OUT = path.join(ROOT, 'public', 'og');
const CONTENT = path.join(ROOT, 'content', 'blog');
const only = (() => { const i = process.argv.indexOf('--only'); return i > -1 ? new Set(process.argv[i + 1].split(',')) : null; })();
mkdirSync(OUT, { recursive: true });

const logo = `data:image/webp;base64,${readFileSync(path.join(ROOT, 'src', 'assets', 'logo-256.webp')).toString('base64')}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function frontmatter(file) {
  const raw = readFileSync(path.join(CONTENT, file), 'utf-8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  for (const line of (m ? m[1] : '').split(/\r?\n/)) { const i = line.indexOf(':'); if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  return fm;
}

const cards = [
  { file: 'landing-de', eyebrow: 'Führerschein-App für die praktische Prüfung', title: 'Bestehe die Fahrprüfung beim ersten Versuch', text: 'Kostenlose Trainer für Vorfahrt, Kreisverkehr und Einparken. Ein Fehlversuch kostet schnell bis zu 600 €.', pill: 'Kostenlos · ohne Konto' },
  { file: 'landing-en', eyebrow: 'The app for the German practical driving test', title: 'Pass the German driving test first time', text: 'Free trainers for right of way, roundabouts and parking. A failed attempt can easily cost up to €600.', pill: 'Free · no account · in English' },
];
for (const f of readdirSync(CONTENT).filter((x) => x.endsWith('.md'))) {
  const fm = frontmatter(f);
  if (!fm.slug) continue;
  const de = fm.lang === 'de';
  const text = fm.description.length > 150 ? fm.description.slice(0, 147).replace(/\s+\S*$/, '') + '…' : fm.description;
  const cps = [...(fm.flag || '')].map((ch) => ch.codePointAt(0));
  const isFlag = cps.length === 2 && cps.every((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff);
  const flagCode = isFlag ? cps.map((cp) => String.fromCharCode(cp - 0x1f1e6 + 97)).join('') : null;
  cards.push({ file: fm.slug, flagCode, eyebrow: `${fm.flag && !isFlag ? fm.flag + ' ' : ''}${de ? 'Ratgeber' : 'Guide'}`, title: fm.title, text, pill: de ? 'drivede.app/blog' : 'drivede.app/blog · English' });
}

const html = (c) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;font-family:Inter,'Segoe UI',Arial,sans-serif;color:#fff;
 background:radial-gradient(1000px 500px at 85% -10%,#2563eb 0%,rgba(37,99,235,0) 60%),linear-gradient(135deg,#0b1220 0%,#12234d 55%,#1e3a8a 100%);
 padding:64px 72px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;gap:18px}
.top .tile{width:84px;height:84px;border-radius:22px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.top .tile img{width:62px;height:62px}
.eyebrow img{height:26px;vertical-align:-4px;margin-right:10px;border-radius:4px;box-shadow:0 0 0 1px rgba(255,255,255,.25)}
.brand{font-size:34px;font-weight:800;letter-spacing:-.5px}
.brand span{color:#60a5fa}
.eyebrow{margin-top:44px;font-size:26px;font-weight:700;color:#93c5fd;letter-spacing:.2px}
h1{margin-top:14px;font-size:${c.title.length > 60 ? 54 : 64}px;line-height:1.08;font-weight:800;letter-spacing:-1.2px;max-width:1040px}
p{margin-top:22px;font-size:28px;line-height:1.35;color:#cbd5e1;max-width:980px;font-weight:500}
.pill{margin-top:auto;align-self:flex-start;background:#fff;color:#1e3a8a;font-weight:800;font-size:24px;padding:12px 24px;border-radius:999px}
</style></head><body>
<div class="top"><div class="tile"><img src="${logo}"></div><div class="brand">Drive<span>DE</span></div></div>
<div class="eyebrow">${c.flagCode ? `<img src="https://flagcdn.com/h40/${c.flagCode}.png">` : ""}${esc(c.eyebrow)}</div>
<h1>${esc(c.title)}</h1>
<p>${esc(c.text)}</p>
<div class="pill">${esc(c.pill)}</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
let n = 0;
for (const c of cards) {
  if (only && !only.has(c.file)) continue;
  await page.setContent(html(c), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, `${c.file}.jpg`), type: 'jpeg', quality: 86 });
  n++;
}
await browser.close();
console.log(`og cards: ${n} written to public/og/ (${existsSync(OUT) ? readdirSync(OUT).length : 0} files there)`);
