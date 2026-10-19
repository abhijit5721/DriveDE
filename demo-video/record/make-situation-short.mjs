// Prepares one exam situation for the vertical short (src/ShortSituation.tsx):
// pulls the texts from api/_lib/examScenarios.ts, writes the narration lines
// through edge-tts (record/tts-lines.py), measures each MP3 with ffprobe and
// stores texts plus timings in src/situationShorts.json (keyed by id, then lang).
// Usage: node record/make-situation-short.mjs <scenarioId> [<scenarioId> ...] [--lang de|en]
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEMO = path.join(HERE, '..');
const ROOT = path.join(DEMO, '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const { transformSync } = require('esbuild');

const argv = process.argv.slice(2);
const langs = argv.includes('--lang') ? [argv[argv.indexOf('--lang') + 1]] : ['de', 'en'];
const ids = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--lang');
if (!ids.length) { console.error('usage: make-situation-short.mjs <scenarioId> ... [--lang de|en]'); process.exit(1); }

const src = readFileSync(path.join(ROOT, 'api', '_lib', 'examScenarios.ts'), 'utf8');
const { code } = transformSync(src, { loader: 'ts', format: 'esm', target: 'es2022' });
const tmp = path.join(os.tmpdir(), `drivede-scenarios-${process.pid}.mjs`);
writeFileSync(tmp, code);
const { EXAM_SCENARIOS } = await import(pathToFileURL(tmp).href);
rmSync(tmp, { force: true });

const OUT_JSON = path.join(DEMO, 'src', 'situationShorts.json');
const all = existsSync(OUT_JSON) ? JSON.parse(readFileSync(OUT_JSON, 'utf8')) : {};
const FPS = 30;
const GAP = 0.45; // seconds of silence between narration lines

const lines = (s, lang) => {
  const L = lang;
  const points = s.keyPoints.slice(0, 4).map((p) => p.label[L].replace(/\.$/, ''));
  const severe = s.mistakes.find((m) => m.severe) || s.mistakes[0];
  return {
    hook: L === 'de' ? `${s.title.de}. Was der Prüfer sehen will.` : `${s.title.en}. What the examiner wants to see.`,
    situation: s.situation[L],
    examiner: s.examiner.de, // always the German sentence, as spoken in the real test
    ...Object.fromEntries(points.map((p, i) => [`p${i + 1}`, p])),
    severe: L === 'de' ? `Schwerer Fehler: ${severe.text.de}. ${severe.why.de}` : `Severe mistake: ${severe.text.en}. ${severe.why.en}`,
    cta: L === 'de' ? 'Alle zwanzig Situationen, kostenlos, ohne Konto: drive dee ee punkt app.' : 'All twenty situations, free, no account: drive dee ee dot app.',
  };
};

const duration = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim());

for (const id of ids) {
  const s = EXAM_SCENARIOS.find((x) => x.id === id);
  if (!s) { console.error('unknown scenario', id); continue; }
  all[id] = all[id] || {};
  for (const lang of langs) {
    const L = lang;
    const texts = lines(s, lang);
    const dir = path.join(DEMO, 'public', 'vo-sit', id, lang);
    mkdirSync(dir, { recursive: true });
    const jobs = Object.entries(texts).map(([key, text]) => ({ key, text, voice: key === 'examiner' ? 'de' : lang, file: path.join(dir, `${key}.mp3`) }));
    const r = spawnSync('python', [path.join(HERE, 'tts-lines.py')], { input: JSON.stringify(jobs), encoding: 'utf8' });
    if (r.status !== 0) { console.error(r.stderr.slice(-800)); process.exit(1); }
    // timeline: each line starts after the previous one plus a gap; captions follow the same clock
    let t = 0.3;
    const segments = {};
    for (const j of jobs) {
      const d = duration(j.file);
      segments[j.key] = { from: Math.round(t * FPS), frames: Math.round(d * FPS), text: j.text };
      t += d + GAP;
    }
    const points = s.keyPoints.slice(0, 4).map((p) => ({ label: p.label[L], severe: !!p.severe }));
    const severe = s.mistakes.find((m) => m.severe) || s.mistakes[0];
    all[id][lang] = {
      title: s.title[L], situation: s.situation[L], examinerDe: s.examiner.de, examinerEn: s.examiner.en,
      points, severe: { text: severe.text[L], why: severe.why[L] }, law: s.law[L].split(':')[0],
      segments, totalFrames: Math.round((t + 2.6) * FPS), fps: FPS,
    };
    console.log(`${id}/${lang}: ${Object.keys(segments).length} lines, ${(t + 2.6).toFixed(1)} s`);
  }
}
writeFileSync(OUT_JSON, JSON.stringify(all, null, 1));
console.log('wrote', OUT_JSON);
