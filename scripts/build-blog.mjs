/**
 * GRO-9: static blog generator.
 *
 * Reads content/blog/*.md (frontmatter + markdown), renders each post to
 * public/blog/<slug>/index.html as full standalone HTML (crawlable without
 * JS), builds /blog/ index, and regenerates public/sitemap.xml with real
 * lastmod dates. Runs before `vite build` so the output ships in dist/.
 *
 * Frontmatter fields:
 *   title, description, slug, lang (en|de|…), date (YYYY-MM-DD),
 *   updated (optional), keywords (comma list), country (optional ISO code),
 *   flag (optional emoji), variants (optional comma list of sibling slugs
 *   in other languages — wired into hreflang, see GRO-10)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content', 'blog');
const OUT = path.join(ROOT, 'public', 'blog');
const SITE = 'https://www.drivede.app';

// ---------- frontmatter ----------
function parsePost(file) {
  const raw = readFileSync(path.join(CONTENT, file), 'utf-8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing frontmatter`);
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const req of ['title', 'description', 'slug', 'lang', 'date']) {
    if (!fm[req]) throw new Error(`${file}: frontmatter missing "${req}"`);
  }
  return { ...fm, body: m[2], file };
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- shared page shell ----------
const CSS = `
:root{color-scheme:light}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#fff;line-height:1.7}
a{color:#2563eb;text-decoration:none}a:hover{text-decoration:underline}
header{border-bottom:1px solid #e2e8f0;background:#fff}
.nav{max-width:760px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
.brand{font-weight:900;font-size:20px;letter-spacing:-.5px;color:#0f172a}.brand span{color:#2563eb}
.nav a.btn{background:#2563eb;color:#fff;font-weight:700;font-size:14px;padding:9px 18px;border-radius:12px}
.nav a.btn:hover{text-decoration:none;background:#1d4ed8}
main{max-width:760px;margin:0 auto;padding:48px 24px 64px}
.crumbs{font-size:13px;color:#64748b;margin-bottom:24px}
h1{font-size:34px;line-height:1.2;letter-spacing:-.5px;margin-bottom:12px}
.meta{color:#64748b;font-size:14px;margin-bottom:32px}
article h2{font-size:24px;margin:36px 0 12px;letter-spacing:-.3px}
article h3{font-size:19px;margin:28px 0 10px}
article p{margin:0 0 16px}
article ul,article ol{margin:0 0 16px 24px}
article li{margin-bottom:6px}
article strong{font-weight:700}
article table{border-collapse:collapse;width:100%;margin:0 0 16px;font-size:15px}
article th,article td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}
article th{background:#f8fafc}
.cta{border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin:36px 0;background:#f8fafc}
.cta p{margin:0 0 14px;color:#334155}
.cta strong{color:#0f172a}
.cta a{display:inline-block;background:#2563eb;color:#fff;font-weight:700;padding:12px 24px;border-radius:12px}
.cta a:hover{text-decoration:none;background:#1d4ed8}
.related{margin-top:48px;border-top:1px solid #e2e8f0;padding-top:24px}
.related h2{font-size:18px;margin-bottom:12px}
.related li{margin-bottom:8px}
.postlist{list-style:none;margin:0}
.postlist li{border:1px solid #e2e8f0;border-radius:16px;padding:20px 24px;margin-bottom:16px}
.postlist a{font-size:19px;font-weight:700;color:#0f172a}
.postlist a:hover{color:#2563eb;text-decoration:none}
.postlist p{color:#64748b;font-size:15px;margin:6px 0 0}
footer{border-top:1px solid #e2e8f0;color:#64748b;font-size:14px}
footer .inner{max-width:760px;margin:0 auto;padding:24px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between}
`;

function shell({ lang, title, description, canonical, head = '', body }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/png" href="/icons/icon-192.png">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/icons/icon-512.png">
<meta property="og:site_name" content="DriveDE">
<meta name="twitter:card" content="summary">
${head}
<style>${CSS}</style>
</head>
<body>
<header><nav class="nav">
  <a class="brand" href="/">Drive<span>DE</span></a>
  <div>
    <a href="${lang === 'de' ? '/blog/' : '/blog/en/'}" style="margin-right:14px;font-weight:600;color:#334155">Blog</a>
    <span style="margin-right:14px;font-size:13px;color:#94a3b8"><a href="/blog/"${lang === 'de' ? ' style="font-weight:700;color:#0f172a"' : ''}>DE</a> | <a href="/blog/en/"${lang !== 'de' ? ' style="font-weight:700;color:#0f172a"' : ''}>EN</a></span>
    <a class="btn" href="${lang === 'de' ? '/' : '/?lang=en'}">${lang === 'de' ? 'Gratis testen' : 'Try DriveDE free'}</a>
  </div>
</nav></header>
<main>${body}</main>
<footer><div class="inner">
  <span>© ${new Date().getFullYear()} DriveDE · Hamburg, Germany</span>
  <span><a href="/">Home</a> · <a href="${lang === 'de' ? '/blog/' : '/blog/en/'}">Blog</a> · <a href="/">Impressum &amp; Datenschutz</a></span>
</div></footer>
</body>
</html>`;
}

// ---------- build ----------
const posts = readdirSync(CONTENT).filter((f) => f.endsWith('.md')).map(parsePost)
  .sort((a, b) => b.date.localeCompare(a.date));

const slugs = new Set();
for (const p of posts) {
  if (slugs.has(p.slug)) throw new Error(`duplicate slug: ${p.slug}`);
  if (p.slug === 'en') throw new Error('slug "en" is reserved for the English index');
  slugs.add(p.slug);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const ctaHtml = (lang) => lang === 'de'
  ? `<div class="cta"><p><strong>Bereit für die praktische Prüfung?</strong> DriveDE trackt deine Fahrstunden per GPS, erkennt Fehler automatisch und zeigt dir objektiv, wann du prüfungsreif bist.</p><a href="/">7 Tage Pro gratis testen</a></div>`
  : `<div class="cta"><p><strong>Getting ready for the practical exam?</strong> DriveDE tracks your driving lessons with GPS, catches mistakes automatically and shows you objectively when you are exam-ready.</p><a href="/?lang=en">Try DriveDE free for 7 days</a></div>`;

for (const post of posts) {
  const canonical = `${SITE}/blog/${post.slug}/`;
  const bodyHtml = marked.parse(post.body);

  // hreflang: self + declared language variants (GRO-10 architecture)
  const variants = (post.variants || '').split(',').map((v) => v.trim()).filter(Boolean);
  const variantLinks = variants.map((slug) => {
    const sibling = posts.find((p) => p.slug === slug);
    if (!sibling) throw new Error(`${post.file}: variant slug not found: ${slug}`);
    return `<link rel="alternate" hreflang="${sibling.lang}" href="${SITE}/blog/${sibling.slug}/">`;
  });
  const hreflang = variants.length
    ? [`<link rel="alternate" hreflang="${post.lang}" href="${canonical}">`, ...variantLinks].join('\n')
    : '';

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: post.lang,
    mainEntityOfPage: canonical,
    image: `${SITE}/icons/icon-512.png`,
    author: { '@type': 'Organization', name: 'DriveDE', url: SITE },
    publisher: {
      '@type': 'Organization',
      name: 'DriveDE',
      logo: { '@type': 'ImageObject', url: `${SITE}/icons/icon-512.png` },
    },
  };

  // related guides: other posts in the same language, up to 4
  const related = posts.filter((p) => p.slug !== post.slug && p.lang === post.lang).slice(0, 4);
  const relatedHtml = related.length
    ? `<div class="related"><h2>${post.lang === 'de' ? 'Weitere Guides' : 'More guides'}</h2><ul>${related
        .map((p) => `<li><a href="/blog/${p.slug}/">${p.flag ? p.flag + ' ' : ''}${esc(p.title)}</a></li>`)
        .join('')}</ul></div>`
    : '';

  const html = shell({
    lang: post.lang,
    title: `${post.title} | DriveDE Blog`,
    description: post.description,
    canonical,
    head: [
      post.keywords ? `<meta name="keywords" content="${esc(post.keywords)}">` : '',
      hreflang,
      `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>`,
    ].filter(Boolean).join('\n'),
    body: `
<div class="crumbs"><a href="/">Home</a> › <a href="${post.lang === 'de' ? '/blog/' : '/blog/en/'}">Blog</a> › ${esc(post.title)}</div>
<h1>${post.flag ? post.flag + ' ' : ''}${esc(post.title)}</h1>
<p class="meta">${post.lang === 'de' ? 'Aktualisiert' : 'Updated'}: ${post.updated || post.date} · DriveDE</p>
<article>${bodyHtml}</article>
${ctaHtml(post.lang)}
${relatedHtml}`,
  });

  mkdirSync(path.join(OUT, post.slug), { recursive: true });
  writeFileSync(path.join(OUT, post.slug, 'index.html'), html);
}

// ---------- per-language indexes ----------
// /blog/ = German (site default), /blog/en/ = English, cross-linked via
// the DE|EN toggle in the header plus hreflang alternates.
// news block: headlines fetched client-side from /api/news (progressive
// enhancement — the section stays hidden if the endpoint is unreachable)
const newsBlock = (lang) => `
<section id="news" hidden>
  <h2 style="font-size:22px;margin:40px 0 4px;letter-spacing:-.3px">${lang === 'de' ? 'Aktuelles rund ums Fahren' : 'Driving news from Germany'}</h2>
  <p class="meta" style="margin-bottom:16px">${lang === 'de' ? 'Schlagzeilen aus deutschen Verkehrs-Medien, verlinkt zur Quelle.' : 'Headlines from German traffic media (in German), linked to the source.'}</p>
  <ul id="news-list" class="postlist"></ul>
</section>
<script>
fetch('/api/news').then(function(r){return r.json()}).then(function(d){
  if(!d.items||!d.items.length)return;
  var ul=document.getElementById('news-list');
  d.items.forEach(function(i){
    var li=document.createElement('li');
    var a=document.createElement('a');
    a.href=i.link;a.rel='noopener nofollow';a.target='_blank';a.textContent=i.title;
    var p=document.createElement('p');
    p.textContent=i.source+' · '+new Date(i.date).toLocaleDateString('de-DE');
    li.appendChild(a);li.appendChild(p);ul.appendChild(li);
  });
  document.getElementById('news').hidden=false;
}).catch(function(){});
</script>`;

const INDEXES = [
  {
    lang: 'de',
    dir: OUT,
    canonical: `${SITE}/blog/`,
    title: 'DriveDE Blog: Führerschein-Guides auf Deutsch',
    description: 'Praktische Guides rund um den Führerschein in Deutschland: Kosten, Fahrstunden, praktische Prüfung und Fahrschul-Wissen.',
    heading: 'DriveDE Blog',
    sub: 'Praktische Guides rund um Führerschein und Fahrprüfung in Deutschland.',
  },
  {
    lang: 'en',
    dir: path.join(OUT, 'en'),
    canonical: `${SITE}/blog/en/`,
    title: 'DriveDE Blog: German driving licence guides in English',
    description: 'Practical guides for getting and converting a driving licence in Germany: Umschreibung country guides, exam preparation and costs, in English.',
    heading: 'DriveDE Blog (English)',
    sub: 'Practical guides for the German driving licence, written from real Anlage 11 FeV rules.',
  },
];

const indexHreflang = `
<link rel="alternate" hreflang="de" href="${SITE}/blog/">
<link rel="alternate" hreflang="en" href="${SITE}/blog/en/">
<link rel="alternate" hreflang="x-default" href="${SITE}/blog/">`;

for (const idx of INDEXES) {
  const langPosts = posts.filter((p) => p.lang === idx.lang);
  const html = shell({
    lang: idx.lang,
    title: idx.title,
    description: idx.description,
    canonical: idx.canonical,
    head: indexHreflang,
    body: `
<h1>${idx.heading}</h1>
<p class="meta">${idx.sub}</p>
<ul class="postlist">${langPosts
      .map((p) => `<li><a href="/blog/${p.slug}/">${p.flag ? p.flag + ' ' : ''}${esc(p.title)}</a><p>${esc(p.description)}</p></li>`)
      .join('\n')}</ul>
${newsBlock(idx.lang)}`,
  });
  mkdirSync(idx.dir, { recursive: true });
  writeFileSync(path.join(idx.dir, 'index.html'), html);
}

// ---------- sitemap ----------
const today = new Date().toISOString().slice(0, 10);
const urls = [
  `  <url>
    <loc>${SITE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="de" href="${SITE}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/?lang=en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/" />
    <image:image>
      <image:loc>${SITE}/icons/icon-512.png</image:loc>
      <image:title>DriveDE: Führerschein &amp; Fahrschule App</image:title>
    </image:image>
  </url>`,
  `  <url>
    <loc>${SITE}/blog/</loc>
    <lastmod>${posts[0]?.updated || posts[0]?.date || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="de" href="${SITE}/blog/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/blog/en/" />
  </url>`,
  `  <url>
    <loc>${SITE}/blog/en/</loc>
    <lastmod>${posts[0]?.updated || posts[0]?.date || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="de" href="${SITE}/blog/" />
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/blog/en/" />
  </url>`,
  ...posts.map((p) => `  <url>
    <loc>${SITE}/blog/${p.slug}/</loc>
    <lastmod>${p.updated || p.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`),
];
writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`);

console.log(`blog: ${posts.length} posts + index + sitemap generated`);
