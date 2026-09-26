/**
 * Vercel Routing Middleware: English link previews for https://www.drivede.app/?lang=en
 *
 * WhatsApp, Facebook and LinkedIn read only the static index.html (they do not run
 * the app), and that file is German. So a shared ?lang=en link showed a German
 * preview card. For that one case this fetches index.html and swaps the <head> tags
 * for English ones; every other request passes through untouched (feedback 26 Sep).
 */
import { next } from '@vercel/functions';

export const config = { matcher: '/' };

const EN = {
  title: 'Free German Driving Test App for the Practical Exam | DriveDE',
  description: 'Free app for the German practical driving test: practise right of way, roundabouts and parking, log your lessons with GPS. In English, with Umschreibung guides.',
  ogTitle: 'DriveDE: Free app for the German practical driving test',
  ogDescription: 'Practise right of way, roundabouts and parking, log your lessons. Free, no account, in English.',
  image: 'https://www.drivede.app/og/landing-en.jpg',
  url: 'https://www.drivede.app/?lang=en',
};

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function toEnglishHead(html: string): string {
  const set = (re: RegExp, value: string) => { html = html.replace(re, (_m, a: string, b: string) => `${a}${attr(value)}${b}`); };
  html = html.replace(/<html lang="[^"]*"/, '<html lang="en"');
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${attr(EN.title)}</title>`);
  set(/(<meta name="description" content=")[^"]*(")/, EN.description);
  set(/(<meta property="og:title" content=")[^"]*(")/, EN.ogTitle);
  set(/(<meta property="og:description" content=")[^"]*(")/, EN.ogDescription);
  set(/(<meta property="og:image" content=")[^"]*(")/, EN.image);
  set(/(<meta property="og:url" content=")[^"]*(")/, EN.url);
  set(/(<meta property="og:locale" content=")[^"]*(")/, 'en_US');
  set(/(<meta name="twitter:title" content=")[^"]*(")/, EN.ogTitle);
  set(/(<meta name="twitter:description" content=")[^"]*(")/, EN.ogDescription);
  set(/(<meta name="twitter:image" content=")[^"]*(")/, EN.image);
  set(/(<meta name="twitter:url" content=")[^"]*(")/, EN.url);
  return html;
}

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get('lang') !== 'en') return next();
  try {
    // Same deployment's static file; forward cookies so protected previews work too.
    const res = await fetch(new URL('/index.html', url), { headers: { cookie: request.headers.get('cookie') || '' } });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !type.includes('text/html')) return next();
    const html = toEnglishHead(await res.text());
    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=0, must-revalidate', 'x-drivede-og': 'en' },
    });
  } catch {
    return next();
  }
}
