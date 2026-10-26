/**
 * DRI-78: fail the build when the landing entry chunk (the script dist/index.html
 * loads first) grows past MAX_RAW_KB. Runs after `vite build`.
 *
 * Target is 400 KB raw / 150 KB gzipped. The ceiling below is a ratchet set just above
 * the current size (822 KB after moving supabase-js out of the entry); lower it as
 * translations and framer-motion get split out. Override once with BUNDLE_MAX_RAW_KB=n.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const MAX_RAW_KB = Number(process.env.BUNDLE_MAX_RAW_KB) || 900;

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const html = readFileSync(path.join(dist, 'index.html'), 'utf8');
const match = html.match(/<script[^>]+src="\/?(assets\/index-[^"]+\.js)"/);
if (!match) {
  console.error('[bundle-size] entry script not found in dist/index.html');
  process.exit(1);
}

const file = readFileSync(path.join(dist, match[1]));
const rawKb = file.length / 1024;
const gzipKb = gzipSync(file).length / 1024;
console.log(`[bundle-size] ${match[1]}: ${rawKb.toFixed(1)} KB raw, ${gzipKb.toFixed(1)} KB gzip (limit ${MAX_RAW_KB} KB raw)`);

if (rawKb > MAX_RAW_KB) {
  console.error(`[bundle-size] entry chunk exceeds ${MAX_RAW_KB} KB raw. Lazy-load the new import or raise the limit on purpose.`);
  process.exit(1);
}
