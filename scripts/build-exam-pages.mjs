/**
 * Public pages for the Prüfungssimulation situations (DRI-61, 7 Oct).
 *
 * One static page per situation and language, generated from the same data the app
 * uses (api/_lib/examScenarios.ts), so every new batch of situations gets its pages
 * without extra work:
 *   /pruefung/<id>/   German        /exam/<id>/   English
 *   /pruefung/        index         /exam/        index
 * Each page shows the situation, the examiner's sentence, what the examiner wants to
 * see, the right order, typical mistakes, the model answer, the StVO paragraph and the
 * quick check, and links into the app at that situation (/?exam=<id>). Called from
 * build-blog.mjs, which owns the page shell and the sitemap.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { transformSync } from 'esbuild';

/** The scenario data is TypeScript; strip the types with esbuild and import the result. */
export async function loadScenarios(ROOT) {
  const src = readFileSync(path.join(ROOT, 'api', '_lib', 'examScenarios.ts'), 'utf8');
  const { code } = transformSync(src, { loader: 'ts', format: 'esm', target: 'es2022' });
  const tmp = path.join(os.tmpdir(), `drivede-exam-scenarios-${process.pid}-${Date.now()}.mjs`);
  writeFileSync(tmp, code);
  try {
    return (await import(pathToFileURL(tmp).href)).EXAM_SCENARIOS;
  } finally {
    rmSync(tmp, { force: true });
  }
}

const T = {
  de: {
    section: 'Prüfungssimulation',
    dir: 'pruefung',
    indexTitle: 'Prüfungssituationen der praktischen Fahrprüfung erklärt | DriveDE',
    indexDesc: 'Jede Situation aus der praktischen Fahrprüfung erklärt: was der Prüfer sehen will, die richtige Reihenfolge, typische Fehler und das passende StVO-Gesetz. Mit Trainer zum Selbsttesten.',
    indexH1: 'Was der Prüfer in jeder Situation sehen will',
    indexIntro: 'Die praktische Prüfung besteht aus festen Fahraufgaben. Hier steht für jede Situation, worauf der Prüfer achtet, in welcher Reihenfolge du handelst und welche Fehler Kandidaten dabei machen. In der App tippst du die Schritte in der richtigen Reihenfolge an oder erklärst in eigenen Worten, was du tust, und bekommst sofort eine Auswertung.',
    title: (t) => `${t} in der Fahrprüfung: Was der Prüfer sehen will`,
    situation: 'Die Situation',
    examiner: 'Der Prüfer sagt',
    show: 'Was du zeigen musst',
    order: 'Die richtige Reihenfolge',
    mistakes: 'Typische Fehler',
    model: 'So klingt eine gute Antwort',
    law: 'Was das Gesetz sagt',
    quiz: 'Kurztest',
    reveal: 'Antwort anzeigen',
    ctaTitle: 'Jetzt selbst antworten',
    ctaText: 'Tippe die Schritte in der richtigen Reihenfolge an oder erkläre in eigenen Worten, was du tust. Die App prüft deine Antwort sofort, kostenlos und ohne Anmeldung.',
    ctaBtn: 'Situation in der App üben',
    more: 'Weitere Situationen',
    free: 'Kostenlos',
    pro: 'Mit Pro',
    home: 'Start',
    appLink: (id) => `/?exam=${id}`,
  },
  en: {
    section: 'Exam simulation',
    dir: 'exam',
    indexTitle: 'German practical driving test situations explained | DriveDE',
    indexDesc: 'Every situation from the German practical driving test explained: what the examiner wants to see, the right order, typical mistakes and the StVO rule behind it. With a trainer to test yourself.',
    indexH1: 'What the examiner wants to see in each situation',
    indexIntro: 'The German practical test consists of fixed driving tasks. For each situation this page explains what the examiner watches for, the order in which you act and the mistakes candidates make. In the app you tap the steps in the right order or explain in your own words what you would do, and get an instant check.',
    title: (t) => `${t} in the German driving test: what the examiner looks for`,
    situation: 'The situation',
    examiner: 'The examiner says',
    show: 'What you have to show',
    order: 'The right order',
    mistakes: 'Typical mistakes',
    model: 'A strong answer',
    law: 'What the law says',
    quiz: 'Quick check',
    reveal: 'Show the answer',
    ctaTitle: 'Answer it yourself',
    ctaText: 'Tap the steps in the right order or explain in your own words what you would do. The app checks your answer instantly, free and without registration.',
    ctaBtn: 'Practise this situation in the app',
    more: 'More situations',
    free: 'Free',
    pro: 'With Pro',
    home: 'Home',
    appLink: (id) => `/?lang=en&exam=${id}`,
  },
};

const PAGE_CSS = `
.sit{border-radius:20px;padding:22px 24px;background:var(--surface);border:1px solid var(--line);box-shadow:var(--shadow);margin:0 0 28px}
.sit p{margin:0 0 14px}
.sit blockquote{margin:0;padding:14px 18px;border-left:4px solid var(--accent);background:var(--accent-soft);border-radius:0 12px 12px 0;font-weight:700;color:var(--ink)}
.sit blockquote small{display:block;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--accent-strong);margin-bottom:4px}
.mistake{border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin:0 0 10px;background:var(--surface)}
.mistake strong{display:block;color:#b91c1c}
@media(prefers-color-scheme:dark){.mistake strong{color:#fca5a5}}
.mistake span{color:var(--muted);font-size:15px}
.quiz{border:1px solid var(--line);border-radius:16px;padding:18px 20px;background:var(--surface)}
.quiz ol{margin:12px 0 14px 22px}
.quiz details{margin-top:6px}.quiz summary{cursor:pointer;font-weight:700;color:var(--accent)}
.quiz .ans{margin-top:10px;padding:12px 14px;border-radius:12px;background:var(--good-soft);color:var(--ink)}
.badge{display:inline-block;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;background:var(--accent-soft);color:var(--accent-strong);margin-left:8px;vertical-align:middle}
.sitlist{list-style:none;margin:0;display:grid;gap:12px}
.sitlist li{border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:var(--shadow)}
.sitlist a{display:flex;align-items:center;gap:14px;padding:16px 18px;color:var(--ink);font-weight:700}
.sitlist .num{flex-shrink:0;width:34px;height:34px;border-radius:10px;background:var(--accent-soft);color:var(--accent-strong);display:flex;align-items:center;justify-content:center;font-size:14px}
.sitlist small{display:block;font-weight:500;color:var(--muted);font-size:14px;margin-top:2px}
`;

const trim = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

function pageBody({ s, i, all, lang, t, esc }) {
  const L = lang;
  const other = all.filter((x) => x.id !== s.id);
  return `
<div class="crumbs"><a href="/">${t.home}</a> <span>›</span> <a href="/${t.dir}/">${t.section}</a> <span>›</span> <span>${esc(s.title[L])}</span></div>
<span class="eyebrow">${t.section} · ${i + 1} / ${all.length}</span>
<h1>${esc(t.title(s.title[L]))}</h1>
<p class="meta"><span>${esc(s.law[L].split(':')[0])}</span><span>·</span><span>${s.free ? t.free : t.pro}</span></p>
<article>
<div class="sit">
  <p>${esc(s.situation[L])}</p>
  <blockquote><small>${t.examiner}</small>„${esc(s.examiner.de)}“${L === 'en' ? `<br><span style="font-weight:500;color:var(--muted)">"${esc(s.examiner.en)}"</span>` : ''}</blockquote>
</div>
<h2>${t.show}</h2>
<ul>${s.keyPoints.map((p) => `<li>${esc(p.label[L])}</li>`).join('')}</ul>
<h2>${t.order}</h2>
<ol>${s.steps.map((st) => `<li>${esc(st[L])}</li>`).join('')}</ol>
<h2>${t.mistakes}</h2>
${s.mistakes.map((m) => `<div class="mistake"><strong>${esc(m.text[L])}</strong><span>${esc(m.why[L])}</span></div>`).join('')}
<h2>${t.model}</h2>
<p>${esc(s.modelAnswer[L])}</p>
<h2>${t.law}</h2>
<p>${esc(s.law[L])}</p>
<h2>${t.quiz}</h2>
<div class="quiz">
  <p><strong>${esc(s.miniTest.question[L])}</strong></p>
  <ol type="A">${s.miniTest.options.map((o) => `<li>${esc(o[L])}</li>`).join('')}</ol>
  <details><summary>${t.reveal}</summary><div class="ans"><strong>${String.fromCharCode(65 + s.miniTest.correct)}.</strong> ${esc(s.miniTest.explanation[L])}</div></details>
</div>
<div class="cta"><strong>${t.ctaTitle}</strong><p>${t.ctaText}</p><a href="${esc(t.appLink(s.id))}">${t.ctaBtn}</a></div>
</article>
<section class="related"><h2>${t.more}</h2>
<ul class="sitlist">${other.map((x) => `<li><a href="/${t.dir}/${x.id}/"><span class="num">${all.indexOf(x) + 1}</span><span>${esc(x.title[L])}<small>„${esc(x.examiner.de)}“</small></span></a></li>`).join('')}</ul>
</section>`;
}

function indexBody({ all, lang, t, esc }) {
  const L = lang;
  return `
<div class="crumbs"><a href="/">${t.home}</a> <span>›</span> <span>${t.section}</span></div>
<span class="eyebrow">${t.section}</span>
<h1>${t.indexH1}</h1>
<p class="meta"><span>${all.length} ${L === 'de' ? 'Situationen' : 'situations'}</span></p>
<article><p>${t.indexIntro}</p></article>
<ul class="sitlist">${all.map((x, i) => `<li><a href="/${t.dir}/${x.id}/"><span class="num">${i + 1}</span><span>${esc(x.title[L])}${x.free ? '' : `<span class="badge">${t.pro}</span>`}<small>„${esc(x.examiner.de)}“</small></span></a></li>`).join('')}</ul>
<div class="cta"><strong>${t.ctaTitle}</strong><p>${t.ctaText}</p><a href="${esc(t.appLink(all[0].id))}">${t.ctaBtn}</a></div>`;
}

/**
 * Writes the pages under outRoot (default public/) and returns sitemap <url> entries.
 * shell/esc come from build-blog.mjs so the pages share the blog's look.
 */
export async function buildExamPages({ shell, esc, SITE, ROOT, outRoot = path.join(ROOT, 'public'), today = new Date().toISOString().slice(0, 10) }) {
  const all = await loadScenarios(ROOT);
  const urls = [];
  for (const lang of ['de', 'en']) {
    const t = T[lang];
    const otherLang = lang === 'de' ? 'en' : 'de';
    const dir = path.join(outRoot, t.dir);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });

    const hreflang = (pathDe, pathEn) => `
<link rel="alternate" hreflang="de" href="${SITE}${pathDe}">
<link rel="alternate" hreflang="en" href="${SITE}${pathEn}">
<link rel="alternate" hreflang="x-default" href="${SITE}${pathDe}">
<style>${PAGE_CSS}</style>`;

    writeFileSync(path.join(dir, 'index.html'), shell({
      lang, title: t.indexTitle, description: t.indexDesc, canonical: `${SITE}/${t.dir}/`,
      head: hreflang('/pruefung/', '/exam/'), body: indexBody({ all, lang, t, esc }),
    }));
    urls.push(`  <url>
    <loc>${SITE}/${t.dir}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="de" href="${SITE}/pruefung/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/exam/" />
  </url>`);

    all.forEach((s, i) => {
      mkdirSync(path.join(dir, s.id), { recursive: true });
      writeFileSync(path.join(dir, s.id, 'index.html'), shell({
        lang,
        title: `${t.title(s.title[lang])} | DriveDE`,
        description: trim(s.situation[lang], 155),
        canonical: `${SITE}/${t.dir}/${s.id}/`,
        head: hreflang(`/pruefung/${s.id}/`, `/exam/${s.id}/`),
        body: pageBody({ s, i, all, lang, t, esc }),
      }));
      urls.push(`  <url>
    <loc>${SITE}/${t.dir}/${s.id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="de" href="${SITE}/pruefung/${s.id}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/exam/${s.id}/" />
  </url>`);
    });
    void otherLang;
  }
  return urls;
}
