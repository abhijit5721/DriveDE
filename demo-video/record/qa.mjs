/**
 * QA the rendered demo videos: ffprobe assertions + scene-midpoint stills
 * (written to out/qa/ for visual review). Requires system ffmpeg/ffprobe.
 */
import { execFileSync } from 'node:child_process';
import { statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(ROOT, '..', '..', 'public');
const QA_DIR = path.join(ROOT, '..', 'out', 'qa');
mkdirSync(QA_DIR, { recursive: true });

// keep in sync with src/timings.ts (plain node script — values inlined)
const FPS = 30;
const SCENES = {
  hook: { from: 0, dur: 150 },
  tracker: { from: 150, dur: 240 },
  readiness: { from: 390, dur: 240 },
  curriculum: { from: 630, dur: 240 },
  maneuvers: { from: 870, dur: 240 },
  cta: { from: 1110, dur: 240 },
};
const EXPECTED_DURATION = 1350 / FPS;

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failed++;
};

for (const lang of ['de', 'en']) {
  const file = path.join(PUB, `demo-${lang}.mp4`);
  const size = statSync(file).size;
  check(`${lang}: size < 4MB`, size < 4_000_000, `${(size / 1e6).toFixed(2)} MB`);

  const probe = JSON.parse(
    execFileSync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', file]).toString()
  );
  const v = probe.streams.find((s) => s.codec_type === 'video');
  const audio = probe.streams.filter((s) => s.codec_type === 'audio');
  const dur = parseFloat(probe.format.duration);
  check(`${lang}: duration ~${EXPECTED_DURATION}s`, Math.abs(dur - EXPECTED_DURATION) < 0.2, `${dur.toFixed(2)}s`);
  check(`${lang}: h264 yuv420p 1920x1080`, v.codec_name === 'h264' && v.pix_fmt === 'yuv420p' && v.width === 1920 && v.height === 1080, `${v.codec_name} ${v.pix_fmt} ${v.width}x${v.height}`);
  check(`${lang}: 30fps`, v.r_frame_rate === '30/1', v.r_frame_rate);
  check(`${lang}: no audio track`, audio.length === 0, `${audio.length} audio streams`);

  for (const [scene, { from, dur: d }] of Object.entries(SCENES)) {
    const t = (from + d / 2) / FPS;
    execFileSync('ffmpeg', ['-y', '-ss', String(t), '-i', file, '-frames:v', '1', path.join(QA_DIR, `${lang}-${scene}.png`)], { stdio: 'ignore' });
  }
  console.log(`${lang}: stills extracted to out/qa/`);
}

console.log(failed ? `\n${failed} checks FAILED` : '\nall checks passed');
process.exit(failed ? 1 : 0);
