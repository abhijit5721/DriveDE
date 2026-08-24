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
const readingTime = (body) => Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));

// ---------- shared page shell ----------
const CSS = `
:root{
  --paper:#f8fafc;--surface:#ffffff;--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;
  --accent:#2563eb;--accent-strong:#1d4ed8;--accent-soft:#eff6ff;
  --good:#059669;--good-soft:#ecfdf5;
  --shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -12px rgba(15,23,42,.12);
  color-scheme:light dark;
}
@media(prefers-color-scheme:dark){:root{
  --paper:#0b1220;--surface:#111a2c;--ink:#e8ecf5;--muted:#94a3b8;--line:#233149;
  --accent:#60a5fa;--accent-strong:#93c5fd;--accent-soft:#152238;
  --good:#34d399;--good-soft:#0f2a22;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -12px rgba(0,0,0,.5);
}}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--paper);line-height:1.7;font-size:17px}
a{color:var(--accent);text-decoration:none}
h1,h2,h3{font-family:'Inter',sans-serif;letter-spacing:-.02em;font-weight:800}
header{position:sticky;top:0;z-index:10;border-bottom:1px solid var(--line);background:var(--surface)}
.nav{max-width:840px;margin:0 auto;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{font-weight:900;font-size:20px;letter-spacing:-.03em;color:var(--ink)}.brand span{color:var(--accent)}
.nav>div{display:flex;align-items:center;gap:14px}
.nav-link{font-weight:600;color:var(--ink)}
.nav-lang{font-size:13px;color:var(--muted);display:flex;align-items:center;gap:4px}
.nav-lang a{color:var(--muted);font-weight:600}
.nav-lang a.active{color:var(--ink);font-weight:700}
.nav a.btn{background:var(--accent);color:#fff;font-weight:700;font-size:14px;padding:9px 18px;border-radius:12px;white-space:nowrap}
.nav a.btn:hover{background:var(--accent-strong)}
main{max-width:720px;margin:0 auto;padding:40px 24px 72px}
.crumbs{font-size:13px;color:var(--muted);margin-bottom:20px;display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.crumbs a{color:var(--muted);font-weight:600}.crumbs a:hover{color:var(--accent)}
.eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--accent-soft);color:var(--accent-strong);font-weight:700;font-size:13px;padding:6px 14px;border-radius:999px;margin-bottom:16px}
h1{font-size:clamp(28px,4.5vw,38px);line-height:1.18;letter-spacing:-.03em;margin-bottom:14px}
.meta{color:var(--muted);font-size:14px;margin-bottom:36px;display:flex;flex-wrap:wrap;gap:6px}
article h2{font-size:23px;font-weight:800;color:var(--ink);margin:40px 0 14px;padding-left:14px;border-left:4px solid var(--accent);letter-spacing:-.01em}
article h3{font-size:18px;font-weight:700;margin:26px 0 10px;color:var(--ink)}
article p{margin:0 0 18px;color:var(--ink)}
article ul,article ol{margin:0 0 18px 22px}
article li{margin-bottom:8px}
article li::marker{color:var(--accent);font-weight:700}
article strong{font-weight:700;color:var(--ink)}
article a{text-decoration:underline;text-decoration-color:color-mix(in srgb,var(--accent) 40%,transparent);text-underline-offset:2px;font-weight:600}
article a:hover{text-decoration-color:var(--accent)}
article table{border-collapse:separate;border-spacing:0;width:100%;margin:0 0 22px;font-size:15px;border:1px solid var(--line);border-radius:12px;overflow:hidden}
article th,article td{padding:11px 14px;text-align:left;border-bottom:1px solid var(--line)}
article tr:last-child td{border-bottom:none}
article th{background:var(--accent-soft);color:var(--accent-strong);font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.03em}
article tbody tr:nth-child(even){background:var(--paper)}
.cta{border-radius:20px;padding:28px;margin:44px 0;background:var(--accent);color:#fff;box-shadow:var(--shadow)}
.cta p{margin:0 0 16px;color:rgba(255,255,255,.92);font-size:16px}
.cta strong{display:block;color:#fff;font-size:21px;font-weight:800;margin-bottom:6px;letter-spacing:-.01em}
.cta a{display:inline-block;background:#fff;color:var(--accent-strong);font-weight:800;padding:13px 26px;border-radius:12px}
.cta a:hover{background:var(--accent-soft)}
.related{margin-top:52px;border-top:1px solid var(--line);padding-top:28px}
.related h2{font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:16px}
.postlist{list-style:none;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.postlist li{border:1px solid var(--line);border-radius:16px;padding:20px;background:var(--surface);box-shadow:var(--shadow);transition:transform .15s ease,box-shadow .15s ease}
.postlist li:hover{transform:translateY(-2px);box-shadow:0 4px 8px rgba(15,23,42,.06),0 16px 32px -14px rgba(15,23,42,.18)}
.postlist a{display:flex;align-items:center;gap:10px;font-size:17px;font-weight:700;color:var(--ink);text-decoration:none}
.postlist a:hover{color:var(--accent)}
.postlist .card-flag{font-size:22px;line-height:1;flex-shrink:0}
.postlist .card-title{line-height:1.3}
.postlist p{color:var(--muted);font-size:14px;margin:8px 0 0;line-height:1.5}
footer{border-top:1px solid var(--line);color:var(--muted);font-size:14px;background:var(--surface)}
footer .inner{max-width:840px;margin:0 auto;padding:28px 24px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between}
footer a{color:var(--muted);font-weight:600}footer a:hover{color:var(--accent)}
`;

function shell({ lang, title, description, canonical, head = '', body }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#2563eb">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" type="image/png" href="/icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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
    <a class="nav-link" href="${lang === 'de' ? '/blog/' : '/blog/en/'}">Blog</a>
    <span class="nav-lang"><a href="/blog/"${lang === 'de' ? ' class="active"' : ''}>DE</a> <span>|</span> <a href="/blog/en/"${lang !== 'de' ? ' class="active"' : ''}>EN</a></span>
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

  // Breadcrumb schema mirrors the visible .crumbs trail below (Home > Blog > post).
  const breadcrumbJsonld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}${post.lang === 'de' ? '/blog/' : '/blog/en/'}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ],
  };

  // Related guides: same-language posts ranked by shared keywords first (so
  // the widget reflects topical fit), then by recency (updated || date) as
  // the tiebreaker. A pure date sort here previously meant the same fixed
  // top-4 newest posts appeared as "related" on nearly every page, while
  // older-but-relevant posts (and the EN cost hub) never surfaced anywhere.
  const keywordSet = (p) => new Set(
    (p.keywords || '').toLowerCase().split(',').map((k) => k.trim()).filter(Boolean)
  );
  const postKeywords = keywordSet(post);
  const sharedScore = (p) => {
    const pk = keywordSet(p);
    let score = 0;
    for (const k of pk) if (postKeywords.has(k)) score += 1;
    // Country conversion guides (frontmatter `country`) rarely share an exact
    // keyword phrase with each other (each targets its own nationality), so
    // exact-phrase matching alone left them permanently unable to surface as
    // "related" to one another. They are still a genuine reading cluster
    // (someone reading one Umschreibung guide plausibly wants another), so
    // give same-cluster country guides a flat bonus on top of keyword overlap.
    if (post.country && p.country) score += 2;
    return score;
  };
  const related = posts
    .filter((p) => p.slug !== post.slug && p.lang === post.lang)
    .sort((a, b) => {
      const scoreDiff = sharedScore(b) - sharedScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return (b.updated || b.date).localeCompare(a.updated || a.date);
    })
    .slice(0, 4);
  const relatedHtml = related.length
    ? `<div class="related"><h2>${post.lang === 'de' ? 'Weitere Guides' : 'More guides'}</h2><ul class="postlist">${related
        .map((p) => `<li><a href="/blog/${p.slug}/"><span class="card-flag">${p.flag || '📄'}</span><span class="card-title">${esc(p.title)}</span></a></li>`)
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
      `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonld)}</script>`,
    ].filter(Boolean).join('\n'),
    body: `
<div class="crumbs"><a href="/">Home</a> <span>›</span> <a href="${post.lang === 'de' ? '/blog/' : '/blog/en/'}">Blog</a> <span>›</span> <span>${esc(post.title)}</span></div>
<div class="eyebrow">${post.flag ? post.flag + ' ' : ''}${post.lang === 'de' ? 'Ratgeber' : 'Guide'}</div>
<h1>${esc(post.title)}</h1>
<p class="meta"><span>${post.lang === 'de' ? 'Aktualisiert' : 'Updated'}: ${post.updated || post.date}</span><span>·</span><span>${readingTime(post.body)} ${post.lang === 'de' ? 'Min. Lesezeit' : 'min read'}</span><span>·</span><span>DriveDE</span></p>
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
      .map((p) => `<li><a href="/blog/${p.slug}/"><span class="card-flag">${p.flag || '📄'}</span><span class="card-title">${esc(p.title)}</span></a><p>${esc(p.description)}</p></li>`)
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
