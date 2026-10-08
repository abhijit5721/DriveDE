// @vitest-environment node
// esbuild (used by the generator) needs real Node globals, not jsdom's TextEncoder.
import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildExamPages } from '../../scripts/build-exam-pages.mjs';
import { EXAM_SCENARIOS } from '../data/examScenarios';

const ROOT = path.resolve(__dirname, '../..');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const shell = ({ lang, title, description, canonical, head = '', body }: { lang: string; title: string; description: string; canonical: string; head?: string; body: string }) =>
  `<!doctype html><html lang="${lang}"><head><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}">${head}</head><body>${body}</body></html>`;

describe('public exam situation pages', () => {
  it('generates DE and EN pages with the content, hreflang, the app link and sitemap entries', async () => {
    const out = mkdtempSync(path.join(os.tmpdir(), 'exam-pages-'));
    try {
      const urls = await buildExamPages({ shell, esc, SITE: 'https://www.drivede.app', ROOT, outRoot: out, today: '2026-10-07' });
      const de = readFileSync(path.join(out, 'pruefung', 'zebrastreifen', 'index.html'), 'utf8');
      expect(de).toContain('<html lang="de">');
      expect(de).toContain('Zebrastreifen in der Fahrprüfung');
      expect(de).toContain('§ 26 StVO');
      expect(de).toContain('Die richtige Reihenfolge');
      expect(de).toContain('href="/?exam=zebrastreifen"');
      expect(de).toContain('hreflang="en" href="https://www.drivede.app/exam/zebrastreifen/"');
      expect(de).not.toMatch(/[\u2013\u2014]/);
      const en = readFileSync(path.join(out, 'exam', 'zebrastreifen', 'index.html'), 'utf8');
      expect(en).toContain('<html lang="en">');
      expect(en).toContain('href="/?lang=en&amp;exam=zebrastreifen"');
      expect(existsSync(path.join(out, 'pruefung', 'index.html'))).toBe(true);
      expect(existsSync(path.join(out, 'exam', 'index.html'))).toBe(true);
      expect(urls.join('\n')).toContain('<loc>https://www.drivede.app/pruefung/zebrastreifen/</loc>');
      expect(de).toContain('Was der Prüfer im Protokoll bewertet');
      expect(de).toContain('Verkehrsbeobachtung');
      expect(de).toContain('schwerer Fehler');
      const ev = readFileSync(path.join(out, 'pruefung', 'so-bewertet-der-pruefer', 'index.html'), 'utf8');
      expect(ev).toContain('elektronische Prüfprotokoll');
      expect(ev).toContain('Geradeausfahren');
      expect(ev).toContain('youtube.com/watch?v=3Oxq727_6k0');
      expect(ev).not.toMatch(/[\u2013\u2014]/);
      expect(existsSync(path.join(out, 'exam', 'how-the-examiner-grades', 'index.html'))).toBe(true);
      expect(urls.length).toBe(4 + 2 * EXAM_SCENARIOS.length);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
