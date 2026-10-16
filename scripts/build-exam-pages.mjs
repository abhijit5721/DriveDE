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

/** The data files are TypeScript; strip the types with esbuild and import the result. */
async function loadTs(ROOT, rel) {
  const src = readFileSync(path.join(ROOT, 'api', '_lib', rel), 'utf8');
  const { code } = transformSync(src, { loader: 'ts', format: 'esm', target: 'es2022' });
  const tmp = path.join(os.tmpdir(), `drivede-${rel.replace(/\W/g, '-')}-${process.pid}-${Date.now()}.mjs`);
  writeFileSync(tmp, code);
  try {
    return await import(pathToFileURL(tmp).href);
  } finally {
    rmSync(tmp, { force: true });
  }
}
export async function loadScenarios(ROOT) {
  return (await loadTs(ROOT, 'examScenarios.ts')).EXAM_SCENARIOS;
}
export async function loadEvaluation(ROOT) {
  return loadTs(ROOT, 'examEvaluation.ts');
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
    evalSlug: 'so-bewertet-der-pruefer',
    grid: 'Was der Prüfer im Protokoll bewertet',
    gridIntro: 'Der Prüfer trägt jede Situation nach fünf Kompetenzbereichen in sein elektronisches Prüfprotokoll ein. So verteilen sich die Punkte dieser Situation:',
    severe: 'schwerer Fehler',
    evalLink: 'So bewertet der Prüfer: das elektronische Prüfprotokoll erklärt',
    tasks: 'Die acht Fahraufgaben',
    areasH: 'Die fünf Kompetenzbereiche',
    video: 'Erklärvideo von TÜV SÜD ansehen (YouTube)',
    answerLead: 'Kurz gesagt',
    answerShow: (title) => `Der Prüfer will bei „${title}“ vor allem sehen:`,
    answerSevere: 'Ein schwerer Fehler, der die Prüfung beenden kann:',
    updated: 'Stand',
    source: 'Gesetzestext',
    faqShow: (title) => `Was will der Prüfer bei „${title}“ sehen?`,
    faqSevere: (title) => `Was ist bei „${title}“ ein schwerer Fehler?`,
    faqLaw: (title) => `Welche Regel gilt bei „${title}“?`,
    faqSevereIntro: 'Als schwerer Fehler gilt:',
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
    evalSlug: 'how-the-examiner-grades',
    grid: 'What the examiner records in the protocol',
    gridIntro: 'The examiner files every situation under five competence areas in the electronic test protocol. This is how the points of this situation are spread:',
    severe: 'severe mistake',
    evalLink: 'How the examiner grades: the electronic test protocol explained',
    tasks: 'The eight driving tasks',
    areasH: 'The five areas of driving competence',
    video: 'Watch TÜV SÜD\'s explainer (YouTube)',
    answerLead: 'In short',
    answerShow: (title) => `At "${title}" the examiner mainly wants to see:`,
    answerSevere: 'A severe mistake that can end the test:',
    updated: 'Updated',
    source: 'Legal text',
    faqShow: (title) => `What does the examiner want to see at "${title}"?`,
    faqSevere: (title) => `What counts as a severe mistake at "${title}"?`,
    faqLaw: (title) => `Which rule applies at "${title}"?`,
    faqSevereIntro: 'Counted as a severe mistake:',
  },
};

// First publication dates, kept stable so dateModified can move without datePublished drifting.
const PUBLISHED = { default: '2026-10-06', batch1: '2026-10-14' };
const BATCH1 = new Set(['linksabbiegen-gegenverkehr', 'abknickende-vorfahrt', 'gruenpfeil', 'bahnuebergang', 'strassenbahnhaltestelle', 'radfahrer-ueberholen', 'tempo-30-zone', 'autobahn-verlassen', 'ueberholen-landstrasse', 'reissverschluss', 'verkehrsberuhigter-bereich', 'polizist-handzeichen']);
const publishedOn = (s) => (BATCH1.has(s.id) ? PUBLISHED.batch1 : PUBLISHED.default);

const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const joinList = (items, L) => {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${L === 'de' ? 'und' : 'and'} ${items[items.length - 1]}`;
};

/** The 40 to 60 word direct answer at the top of a situation page: the key points the
 *  examiner files, and the one severe mistake. Self-contained so an answer engine can lift it. */
function directAnswer(s, L, t) {
  // the labels are short imperative phrases; semicolons keep them readable as a list
  const points = s.keyPoints.slice(0, 4).map((p) => p.label[L].replace(/\.$/, ''));
  const severe = s.mistakes.find((m) => m.severe) || s.mistakes[0];
  return `${t.answerLead}: ${t.answerShow(s.title[L])} ${points.join('; ')}. ${t.answerSevere} ${lower(severe.text[L])}.`;
}

/** Links into gesetze-im-internet.de for every StVO paragraph and Anlage named in the law text. */
function lawLinks(lawText) {
  const links = [];
  const seen = new Set();
  for (const m of lawText.matchAll(/§\s*(\d+[a-z]?)/g)) {
    const key = `§ ${m[1]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ label: `${key} StVO`, href: `https://www.gesetze-im-internet.de/stvo_2013/__${m[1]}.html` });
  }
  for (const m of lawText.matchAll(/(?:Anlage|annex)\s*(\d)/gi)) {
    const key = `Anlage ${m[1]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    links.push({ label: `${key} StVO`, href: `https://www.gesetze-im-internet.de/stvo_2013/anlage_${m[1]}.html` });
  }
  if (/Zeichen\s*\d{3}|sign\s*\d{3}/i.test(lawText) && !seen.has('Anlage 2')) {
    links.push({ label: 'Anlage 2 StVO (Verkehrszeichen)', href: 'https://www.gesetze-im-internet.de/stvo_2013/anlage_2.html' });
  }
  return links;
}

const monthName = (iso, L) => new Date(iso + 'T00:00:00Z').toLocaleDateString(L === 'de' ? 'de-DE' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function pageJsonLd({ s, L, t, SITE, today, canonical }) {
  const title = s.title[L];
  const severePoints = s.keyPoints.filter((p) => p.severe).map((p) => p.label[L]);
  const severeMistakes = s.mistakes.filter((m) => m.severe).map((m) => m.text[L]);
  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t.title(title),
    description: trim(s.situation[L], 155),
    datePublished: publishedOn(s),
    dateModified: today,
    inLanguage: L,
    mainEntityOfPage: canonical,
    image: `${SITE}/icons/icon-512.png`,
    author: { '@type': 'Organization', name: 'DriveDE', url: SITE },
    publisher: { '@type': 'Organization', name: 'DriveDE', logo: { '@type': 'ImageObject', url: `${SITE}/icons/icon-512.png` } },
    citation: lawLinks(s.law[L]).map((l) => l.href),
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: t.faqShow(title), acceptedAnswer: { '@type': 'Answer', text: s.keyPoints.map((p) => p.label[L]).join('. ') + '.' } },
      { '@type': 'Question', name: t.faqSevere(title), acceptedAnswer: { '@type': 'Answer', text: `${t.faqSevereIntro} ${[...severePoints, ...severeMistakes].join('. ')}.` } },
      { '@type': 'Question', name: t.faqLaw(title), acceptedAnswer: { '@type': 'Answer', text: s.law[L] } },
      { '@type': 'Question', name: s.miniTest.question[L], acceptedAnswer: { '@type': 'Answer', text: `${s.miniTest.options[s.miniTest.correct][L]}. ${s.miniTest.explanation[L]}` } },
    ],
  };
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.home, item: SITE },
      { '@type': 'ListItem', position: 2, name: t.section, item: `${SITE}/${t.dir}/` },
      { '@type': 'ListItem', position: 3, name: title, item: canonical },
    ],
  };
  return [article, faq, crumbs].map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n');
}

const PAGE_CSS = `
.answer{font-size:17px;line-height:1.55;padding:14px 18px;border-radius:14px;background:var(--accent-soft);color:var(--ink);margin:0 0 20px}
.source{font-size:14px;color:var(--muted)}
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

const GRID_CSS = `
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:0 0 18px}
.area{border:1px solid var(--line);border-radius:12px;padding:12px 14px;background:var(--surface)}
.area strong{display:block;margin-bottom:6px;color:var(--accent-strong)}
.area ul{margin:0 0 0 18px;font-size:15px}.area li{margin-bottom:4px}
.sev{font-style:normal;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#b91c1c;background:#fee2e2;padding:1px 6px;border-radius:999px;margin-left:4px}
@media(prefers-color-scheme:dark){.sev{color:#fecaca;background:#4c1d1d}}
.evalcard{border:1px solid var(--line);border-radius:16px;padding:18px 20px;background:var(--surface);box-shadow:var(--shadow);margin:0 0 20px}
.evalcard a{font-weight:700}
`;

const trim = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…');

function gridHtml({ s, lang, t, esc, areas }) {
  const L = lang;
  const present = areas.filter((a) => s.keyPoints.some((p) => p.area === a.id));
  return `<h2>${t.grid}</h2>
<p>${t.gridIntro}</p>
<div class="grid">${present.map((a) => `<div class="area"><strong>${esc(a.label[L])}</strong><ul>${s.keyPoints.filter((p) => p.area === a.id).map((p) => `<li>${esc(p.label[L])}${p.severe ? ` <em class="sev">${t.severe}</em>` : ''}</li>`).join('')}</ul></div>`).join('')}</div>
<p><a href="/${t.dir}/${t.evalSlug}/">${t.evalLink} →</a></p>`;
}

function pageBody({ s, i, all, lang, t, esc, areas, today }) {
  const L = lang;
  const other = all.filter((x) => x.id !== s.id);
  const links = lawLinks(s.law[L]);
  return `
<div class="crumbs"><a href="/">${t.home}</a> <span>›</span> <a href="/${t.dir}/">${t.section}</a> <span>›</span> <span>${esc(s.title[L])}</span></div>
<span class="eyebrow">${t.section} · ${i + 1} / ${all.length}</span>
<h1>${esc(t.title(s.title[L]))}</h1>
<p class="meta"><span>${esc(s.law[L].split(':')[0])}</span><span>·</span><span>${s.free ? t.free : t.pro}</span><span>·</span><span>${t.updated}: ${esc(monthName(today, L))}</span><span>·</span><span>DriveDE</span></p>
<article>
<p class="answer">${esc(directAnswer(s, L, t))}</p>
<div class="sit">
  <p>${esc(s.situation[L])}</p>
  <blockquote><small>${t.examiner}</small>„${esc(s.examiner.de)}“${L === 'en' ? `<br><span style="font-weight:500;color:var(--muted)">"${esc(s.examiner.en)}"</span>` : ''}</blockquote>
</div>
<h2>${t.show}</h2>
<ul>${s.keyPoints.map((p) => `<li>${esc(p.label[L])}</li>`).join('')}</ul>
<h2>${t.order}</h2>
<ol>${s.steps.map((st) => `<li>${esc(st[L])}</li>`).join('')}</ol>
<h2>${t.mistakes}</h2>
${s.mistakes.map((m) => `<div class="mistake"><strong>${esc(m.text[L])}${m.severe ? ` <em class="sev">${t.severe}</em>` : ''}</strong><span>${esc(m.why[L])}</span></div>`).join('')}
${gridHtml({ s, lang, t, esc, areas })}
<h2>${t.model}</h2>
<p>${esc(s.modelAnswer[L])}</p>
<h2>${t.law}</h2>
<p>${esc(s.law[L])}</p>
${links.length ? `<p class="source">${t.source}: ${links.map((l) => `<a href="${l.href}" rel="noopener" target="_blank">${esc(l.label)}</a>`).join(' · ')} (gesetze-im-internet.de)</p>` : ''}
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
<div class="evalcard"><a href="/${t.dir}/${t.evalSlug}/">${t.evalLink} →</a></div>
<ul class="sitlist">${all.map((x, i) => `<li><a href="/${t.dir}/${x.id}/"><span class="num">${i + 1}</span><span>${esc(x.title[L])}${x.free ? '' : `<span class="badge">${t.pro}</span>`}<small>„${esc(x.examiner.de)}“</small></span></a></li>`).join('')}</ul>
<div class="cta"><strong>${t.ctaTitle}</strong><p>${t.ctaText}</p><a href="${esc(t.appLink(all[0].id))}">${t.ctaBtn}</a></div>`;
}

function evalBody({ E, areas, tasks, lang, t, esc, all }) {
  const L = lang;
  return `
<div class="crumbs"><a href="/">${t.home}</a> <span>›</span> <a href="/${t.dir}/">${t.section}</a> <span>›</span> <span>${esc(E.title[L])}</span></div>
<span class="eyebrow">${t.section}</span>
<h1>${esc(E.title[L])}</h1>
<article>
<p>${esc(E.intro[L])}</p>
${E.sections.map((sec, i) => `<h2>${esc(sec.h[L])}</h2>${sec.p.map((p) => `<p>${esc(p[L])}</p>`).join('')}${i === 1 ? `<ol>${tasks.map((x) => `<li><strong>${esc(x.title[L])}</strong>${x.parts.length ? `<br><span style="color:var(--muted);font-size:15px">${x.parts.map((q) => esc(q[L])).join(' · ')}</span>` : ''}</li>`).join('')}</ol>` : ''}${i === 2 ? `<div class="grid">${areas.map((a) => `<div class="area"><strong>${esc(a.label[L])}</strong><span style="font-size:15px;color:var(--muted)">${esc(a.desc[L])}</span></div>`).join('')}</div>` : ''}`).join('')}
<p style="color:var(--muted);font-size:14px">${esc(E.source[L])} <a href="${E.videoUrl}" rel="noopener" target="_blank">${t.video}</a></p>
<div class="cta"><strong>${t.ctaTitle}</strong><p>${t.ctaText}</p><a href="${esc(t.appLink(all[0].id))}">${t.ctaBtn}</a></div>
</article>
<section class="related"><h2>${t.more}</h2>
<ul class="sitlist">${all.map((x, i) => `<li><a href="/${t.dir}/${x.id}/"><span class="num">${i + 1}</span><span>${esc(x.title[L])}<small>„${esc(x.examiner.de)}“</small></span></a></li>`).join('')}</ul>
</section>`;
}

/**
 * Writes the pages under outRoot (default public/) and returns sitemap <url> entries.
 * shell/esc come from build-blog.mjs so the pages share the blog's look.
 */
export async function buildExamPages({ shell, esc, SITE, ROOT, outRoot = path.join(ROOT, 'public'), today = new Date().toISOString().slice(0, 10), scenarios = null }) {
  const all = scenarios ?? await loadScenarios(ROOT);
  const { EXAM_EVALUATION: E, COMPETENCE_AREAS: areas, DRIVING_TASKS: tasks } = await loadEvaluation(ROOT);
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
<style>${PAGE_CSS}${GRID_CSS}</style>`;

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

    mkdirSync(path.join(dir, t.evalSlug), { recursive: true });
    writeFileSync(path.join(dir, t.evalSlug, 'index.html'), shell({
      lang, title: `${E.title[lang]} | DriveDE`, description: trim(E.intro[lang], 155), canonical: `${SITE}/${t.dir}/${t.evalSlug}/`,
      head: hreflang('/pruefung/so-bewertet-der-pruefer/', '/exam/how-the-examiner-grades/'),
      body: evalBody({ E, areas, tasks, lang, t, esc, all }),
    }));
    urls.push(`  <url>
    <loc>${SITE}/${t.dir}/${t.evalSlug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="de" href="${SITE}/pruefung/so-bewertet-der-pruefer/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/exam/how-the-examiner-grades/" />
  </url>`);

    all.forEach((s, i) => {
      mkdirSync(path.join(dir, s.id), { recursive: true });
      const canonical = `${SITE}/${t.dir}/${s.id}/`;
      writeFileSync(path.join(dir, s.id, 'index.html'), shell({
        lang,
        title: `${t.title(s.title[lang])} | DriveDE`,
        description: trim(s.situation[lang], 155),
        canonical,
        head: hreflang(`/pruefung/${s.id}/`, `/exam/${s.id}/`) + '\n' + pageJsonLd({ s, L: lang, t, SITE, today, canonical }),
        body: pageBody({ s, i, all, lang, t, esc, areas, today }),
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
