// Render a tutorial composition in frame chunks (little temp space, little RAM), then
// concatenate the chunks losslessly. Usage: node record/render-tutorial.mjs de [chunkFrames]
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const lang = process.argv[2] || 'de';
const CHUNK = Number(process.argv[3] || 450);
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const OUT = path.join(ROOT, 'out');
const TMP = path.join(OUT, `chunks-${lang}`);
mkdirSync(TMP, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src', 'index.ts'), publicDir: path.join(ROOT, 'public') });
const composition = await selectComposition({ serveUrl, id: `tutorial-${lang}`, inputProps: { lang } });
const total = composition.durationInFrames;
console.log(`tutorial-${lang}: ${total} frames, chunks of ${CHUNK}`);

const parts = [];
for (let a = 0; a < total; a += CHUNK) {
  const b = Math.min(total - 1, a + CHUNK - 1);
  const file = path.join(TMP, `part-${String(a).padStart(5, '0')}.mp4`);
  parts.push(file);
  if (existsSync(file)) { console.log(`  ${a}-${b} exists`); continue; }
  await renderMedia({
    composition, serveUrl, codec: 'h264', crf: 18, colorSpace: 'bt709', concurrency: 1, jpegQuality: 85, timeoutInMilliseconds: 180000,
    frameRange: [a, b], outputLocation: file, inputProps: { lang },
    onProgress: ({ renderedFrames }) => { if (renderedFrames % 150 === 0) process.stdout.write(`  ${a}-${b}: ${renderedFrames}\r`); },
  });
  console.log(`  ${a}-${b} done`);
}
const list = path.join(TMP, 'list.txt');
writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n') + '\n');
const raw = path.join(OUT, `tutorial-${lang}-raw.mp4`);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', raw], { stdio: 'inherit' });
rmSync(TMP, { recursive: true, force: true });
console.log(`-> ${raw}`);
process.exit(0);
