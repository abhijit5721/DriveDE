import { describe, it, expect } from 'vitest';
import { shareCaption, shareHeadline, SHARE_URL } from './shareCard';

describe('shareCard text', () => {
  const de = { language: 'de' as const, correct: 6, total: 8, seconds: '9,3' };
  const en = { language: 'en' as const, correct: 6, total: 6, seconds: '7.1' };

  it('builds the caption in the visitor language with the share URL', () => {
    expect(shareCaption(de)).toBe(`Rechts vor links, Kreisverkehr, Stoppschild: 6 von 8 richtig in 9,3 Sekunden. Schaffst du das schneller? ${SHARE_URL}`);
    expect(shareCaption(en)).toBe(`Right before left, roundabout, stop sign: 6 of 6 correct in 7.1 seconds. Can you beat that? ${SHARE_URL}`);
  });

  it('keeps the UTM source distinct so the visits show up separately in analytics', () => {
    expect(SHARE_URL).toContain('utm_source=share');
    expect(SHARE_URL).not.toContain('utm_source=reddit');
  });

  it('headline is short enough for the card', () => {
    expect(shareHeadline(de)).toBe('6 von 8 richtig in 9,3 s');
    expect(shareHeadline(en)).toBe('6 of 6 correct in 7.1 s');
  });
});
