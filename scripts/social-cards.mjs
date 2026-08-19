/**
 * Social image-card generator (GRO-5 image track).
 * Renders branded 1080x1350 PNG cards from content/social-cards/cards.json
 * via Playwright. Quiz-style types (lamp, rule) emit a question + answer
 * pair for carousel posts. Output: social-cards-out/ (gitignored).
 *
 * Run: node scripts/social-cards.mjs [--only id1,id2]
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'social-cards-out');
mkdirSync(OUT, { recursive: true });

const cards = JSON.parse(readFileSync(path.join(ROOT, 'content', 'social-cards', 'cards.json'), 'utf-8'));
const onlyArg = process.argv.find((a) => a.startsWith('--only'));
const only = onlyArg ? process.argv[process.argv.indexOf(onlyArg) + 1]?.split(',') : null;

/** warning-lamp glyphs (path data mirrors the in-app PreDriveCheckTrainer icons) */
const LAMPS = {
  oil: `<path d="M10 28 h18 l6 -8 M14 28 v-6 h8"/><path d="M8 34 c0 -3 3 -6 3 -6 s3 3 3 6 a3 3 0 0 1 -6 0Z" fill="currentColor"/><path d="M12 28 a10 8 0 0 0 20 6"/>`,
  battery: `<rect x="10" y="16" width="28" height="20" rx="2"/><path d="M16 12 v4 M32 12 v4 M16 26 h6 M29 26 h6 M32 23 v6"/>`,
  coolant: `<path d="M24 8 v14 M24 22 a4.5 4.5 0 1 0 0.01 0"/><path d="M10 34 q3.5 -3.5 7 0 t7 0 t7 0 t7 0"/><path d="M10 40 q3.5 -3.5 7 0 t7 0 t7 0 t7 0"/>`,
  brake: `<circle cx="24" cy="24" r="12"/><path d="M8 14 a20 20 0 0 0 0 20 M40 14 a20 20 0 0 1 0 20"/><path d="M24 17 v9 M24 30 v1.5" stroke-width="3"/>`,
  abs: `<circle cx="24" cy="24" r="12"/><path d="M8 14 a20 20 0 0 0 0 20 M40 14 a20 20 0 0 1 0 20"/><text x="24" y="28" text-anchor="middle" font-size="10" font-weight="800" fill="currentColor" stroke="none">ABS</text>`,
  engine: `<path d="M14 20 h6 v-4 h10 l4 4 h4 v12 h-4 l-4 4 H18 l-4 -4 h-4 v-8 h4Z"/>`,
};

const ICON = `data:image/png;base64,${readFileSync(path.join(ROOT, 'public', 'icons', 'icon-192.png')).toString('base64')}`;

const shell = (inner, { chip, chipColor }) => `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1350px; background: #0b1220; color: #fff;
         font-family: 'Segoe UI', system-ui, sans-serif; display: flex; flex-direction: column; }
  .top { display: flex; justify-content: space-between; align-items: center; padding: 56px 64px 0; }
  .brand { display: flex; align-items: center; gap: 18px; font-size: 40px; font-weight: 800; letter-spacing: 0.5px; }
  .brand img { width: 72px; height: 72px; border-radius: 18px; }
  .chip { font-size: 28px; font-weight: 700; padding: 12px 28px; border-radius: 999px;
          background: ${chipColor}22; color: ${chipColor}; border: 2px solid ${chipColor}55; }
  .main { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 88px; gap: 40px; }
  .bottom { display: flex; justify-content: space-between; align-items: center; padding: 0 64px 56px;
            font-size: 30px; color: #64748b; font-weight: 600; }
  .bottom .url { color: #3b82f6; font-weight: 800; font-size: 34px; }
</style></head><body>
  <div class="top">
    <div class="brand"><img src="${ICON}">DriveDE</div>
    <div class="chip">${chip}</div>
  </div>
  <div class="main">${inner}</div>
  <div class="bottom"><span class="url">drivede.app</span><span>@drivedeapp</span></div>
</body></html>`;

const renderers = {
  vocab: (c) => [shell(`
    <div style="font-size:34px;font-weight:700;color:#64748b;letter-spacing:2px;text-transform:uppercase">German driving school vocab</div>
    <div style="font-size:108px;font-weight:800;line-height:1.05;color:#3b82f6">${c.term}</div>
    ${c.pron ? `<div style="font-size:38px;color:#64748b;font-style:italic">${c.pron}</div>` : ''}
    <div style="font-size:52px;font-weight:600;line-height:1.35">${c.meaning}</div>
    ${c.example ? `<div style="font-size:38px;color:#94a3b8;line-height:1.4;border-left:6px solid #10b981;padding-left:28px">${c.example}</div>` : ''}
  `, { chip: 'VOCAB', chipColor: '#3b82f6' })],

  stat: (c) => [shell(`
    <div style="font-size:200px;font-weight:800;color:#3b82f6;line-height:1">${c.big}</div>
    <div style="font-size:64px;font-weight:800;line-height:1.2">${c.label}</div>
    <div style="font-size:42px;color:#94a3b8;line-height:1.45">${c.sub}</div>
  `, { chip: 'DID YOU KNOW', chipColor: '#10b981' })],

  lamp: (c) => {
    const color = c.severity === 'red' ? '#ef4444' : '#f59e0b';
    const glyph = `<svg viewBox="0 0 48 48" width="360" height="360" style="color:${color}" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LAMPS[c.lampId]}</svg>`;
    return [
      shell(`
        <div style="display:flex;justify-content:center">${glyph}</div>
        <div style="font-size:72px;font-weight:800;text-align:center;line-height:1.2">${c.question}</div>
        <div style="font-size:40px;color:#64748b;text-align:center">Answer on the next slide →</div>
      `, { chip: 'DASHBOARD QUIZ', chipColor: color }),
      shell(`
        <div style="display:flex;justify-content:center">${glyph}</div>
        <div style="font-size:64px;font-weight:800;text-align:center;color:${color}">${c.name}</div>
        <div style="font-size:46px;font-weight:600;text-align:center;line-height:1.4">${c.answer}</div>
        <div style="font-size:38px;color:#94a3b8;text-align:center;line-height:1.4">${c.action}</div>
      `, { chip: 'ANSWER', chipColor: color }),
    ];
  },

  rule: (c) => [
    shell(`
      <div style="font-size:34px;font-weight:700;color:#64748b;letter-spacing:2px;text-transform:uppercase">True or false?</div>
      <div style="font-size:76px;font-weight:800;line-height:1.25">${c.question}</div>
      <div style="font-size:40px;color:#64748b">Answer on the next slide →</div>
    `, { chip: 'RULE CHECK', chipColor: '#3b82f6' }),
    shell(`
      <div style="font-size:120px;font-weight:800;color:${c.answer ? '#10b981' : '#ef4444'}">${c.answer ? 'TRUE' : 'FALSE'}</div>
      <div style="font-size:52px;font-weight:600;line-height:1.4">${c.explanation}</div>
    `, { chip: 'ANSWER', chipColor: c.answer ? '#10b981' : '#ef4444' }),
  ],

  country: (c) => [shell(`
    <div style="font-size:120px">${c.flag}</div>
    <div style="font-size:80px;font-weight:800;line-height:1.15">License from ${c.country}?</div>
    <div style="font-size:50px;font-weight:700;color:${c.tierColor};line-height:1.35">${c.tier}</div>
    <div style="font-size:42px;color:#94a3b8;line-height:1.45">${c.note}</div>
  `, { chip: 'UMSCHREIBUNG', chipColor: '#10b981' })],
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
let n = 0;
for (const card of cards) {
  if (only && !only.includes(card.id)) continue;
  const htmls = renderers[card.type](card);
  for (let slide = 0; slide < htmls.length; slide++) {
    await page.setContent(htmls[slide], { waitUntil: 'networkidle' });
    const name = htmls.length > 1 ? `${card.id}-${slide + 1}` : card.id;
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    n++;
  }
  console.log(`✓ ${card.id} (${card.type})`);
}
await browser.close();
console.log(`${n} images -> ${OUT}`);
