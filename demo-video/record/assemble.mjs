/**
 * Assemble recorded PNG frames into near-lossless H.264 intermediates.
 * Output goes to demo-video/public/ (Remotion's staticFile root).
 * Requires system ffmpeg.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FRAMES = path.join(ROOT, '..', 'frames');
const OUT = path.join(ROOT, '..', 'public');
mkdirSync(OUT, { recursive: true });

const dirs = readdirSync(FRAMES, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  // optional prefix filter: node record/assemble.mjs tut-
  .filter((name) => !process.argv[2] || name.startsWith(process.argv[2]));

for (const dir of dirs) {
  const src = path.join(FRAMES, dir, 'frame_%04d.png');
  const dest = path.join(OUT, `${dir}.mp4`);
  if (!existsSync(path.join(FRAMES, dir, 'frame_0000.png'))) {
    console.warn(`skip ${dir}: no frames`);
    continue;
  }
  console.log(`assembling ${dir}.mp4 ...`);
  const manifest = path.join(FRAMES, dir, 'frames.json');
  if (existsSync(manifest)) {
    // real-time capture: variable-rate frames + timestamps -> constant 30fps
    const { frames, end } = JSON.parse(readFileSync(manifest, 'utf-8'));
    const lines = [];
    for (let i = 0; i < frames.length; i++) {
      // the last frame is held until the capture ended (screencast sends frames only on change)
      const dur = i + 1 < frames.length ? Math.max(0.001, frames[i + 1].ts - frames[i].ts) : Math.max(1 / 30, (end ?? frames[i].ts) - frames[i].ts);
      lines.push(`file '${path.join(FRAMES, dir, frames[i].file).replace(/\\/g, '/')}'`, `duration ${dur.toFixed(4)}`);
    }
    // the concat demuxer ignores the last entry's duration unless the file is listed once more
    lines.push(`file '${path.join(FRAMES, dir, frames[frames.length - 1].file).replace(/\\/g, '/')}'`, 'duration 0.0333');
    const total = end ? (end - frames[0].ts).toFixed(3) : null;
    const concat = path.join(FRAMES, dir, 'concat.txt');
    writeFileSync(concat, lines.join('\n') + '\n');
    execFileSync('ffmpeg', [
      '-y', '-f', 'concat', '-safe', '0', '-i', concat, ...(total ? ['-t', total] : []),
      '-vf', 'fps=30,scale=out_color_matrix=bt709:flags=accurate_rnd,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '12',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
      '-movflags', '+faststart',
      dest,
    ], { stdio: ['ignore', 'ignore', 'inherit'] });
    continue;
  }
  execFileSync('ffmpeg', [
    '-y', '-framerate', '30', '-i', src,
    '-vf', 'scale=out_color_matrix=bt709:flags=accurate_rnd,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '12',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-movflags', '+faststart',
    dest,
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
}
console.log('done');
