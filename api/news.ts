/**
 * GRO-9 addendum: German driving/traffic news headlines for the blog index.
 *
 * Aggregates public RSS feeds, filters for driving-relevant items, and returns
 * ONLY headline + link + source + date (no article content is republished —
 * linking with attribution is the legally safe form of aggregation).
 *
 * Cached at the CDN edge for 1 hour via s-maxage; a failing feed is skipped.
 */

const FEEDS: Array<{ source: string; url: string }> = [
  { source: 'n-tv Auto', url: 'https://www.n-tv.de/auto/rss' },
  { source: 'FOCUS Auto', url: 'https://rss.focus.de/auto/' },
  { source: 'ZEIT Mobilität', url: 'https://newsfeed.zeit.de/mobilitaet/index' },
];

// driving-licence / traffic-law relevance filter (case-insensitive)
const RELEVANT = /f(ü|ue)hrerschein|fahrschul|fahrpr(ü|ue)fung|stvo|verkehrsregel|bu(ß|ss)geld|tempolimit|blitzer|promille|probezeit|t(ü|ue)v|dekra|autobahn|verkehrssicherheit|punkte in flensburg|fahranf(ä|ae)nger/i;

interface NewsItem {
  title: string;
  link: string;
  source: string;
  date: string; // ISO
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function parseFeed(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)) {
    const block = m[0];
    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1];
    const link = block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1];
    const date = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1]
      ?? block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/)?.[1];
    if (!title || !link) continue;
    const parsed = date ? new Date(decodeEntities(date)) : new Date();
    items.push({
      title: decodeEntities(title),
      link: decodeEntities(link),
      source,
      date: isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString(),
    });
  }
  return items;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      try {
        const r = await fetch(f.url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'DriveDE-Blog/1.0 (+https://www.drivede.app)' },
        });
        if (!r.ok) throw new Error(`${f.source}: ${r.status}`);
        return parseFeed(await r.text(), f.source);
      } finally {
        clearTimeout(timer);
      }
    }),
  );

  const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  const relevant = all.filter((i) => RELEVANT.test(i.title));
  // fall back to the freshest general auto items if the strict filter is thin
  const pool = relevant.length >= 4 ? relevant : all;
  const items = pool
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ items, filtered: relevant.length >= 4 });
}
