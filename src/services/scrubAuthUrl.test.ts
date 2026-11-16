import { describe, it, expect, vi } from 'vitest';
import { scrubAuthUrl, hasAuthUrlParams, scrubAnalyticsValue } from './AnalyticsService';

// AnalyticsService imports the store and Vercel Analytics at module load; neither is needed here.
vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));
vi.mock('../store/useAppStore', () => ({
  useAppStore: { getState: () => ({}), subscribe: () => () => {} },
}));

const TOKEN_SUBSTRINGS = ['aaa', 'bbb', 'ccc', 'access_token=', 'refresh_token='];

describe('scrubAuthUrl', () => {
  it('drops the whole token fragment and leaves no token values', () => {
    const out = scrubAuthUrl('https://www.drivede.app/#access_token=aaa&refresh_token=bbb&expires_in=3600&token_type=bearer&provider_token=ccc');
    expect(out).not.toContain('#');
    for (const t of TOKEN_SUBSTRINGS) expect(out).not.toContain(t);
    expect(out).toBe('https://www.drivede.app/');
  });

  it('keeps the query and drops the token fragment', () => {
    expect(scrubAuthUrl('https://www.drivede.app/?lang=en#access_token=aaa')).toBe('https://www.drivede.app/?lang=en');
  });

  it('removes the error keys from an error redirect', () => {
    const out = scrubAuthUrl('https://www.drivede.app/?error=invalid_request&error_code=bad_oauth_state&error_description=OAuth+state+not+found+or+expired');
    expect(out).not.toContain('error');
    expect(out).not.toContain('bad_oauth_state');
    expect(out).not.toContain('OAuth');
    expect(out).toBe('https://www.drivede.app/');
  });

  it('removes code but keeps lang and utm_source with their values', () => {
    const out = scrubAuthUrl('https://www.drivede.app/?lang=de&code=abc123&utm_source=reddit');
    expect(out).not.toContain('code=');
    expect(out).not.toContain('abc123');
    expect(out).toBe('https://www.drivede.app/?lang=de&utm_source=reddit');
  });

  it('leaves a plain #plan fragment unchanged', () => {
    expect(scrubAuthUrl('https://www.drivede.app/?lang=en#plan')).toBe('https://www.drivede.app/?lang=en#plan');
  });

  it('leaves a plain path unchanged', () => {
    expect(scrubAuthUrl('https://www.drivede.app/pruefung/kreisverkehr/')).toBe('https://www.drivede.app/pruefung/kreisverkehr/');
  });

  it('leaves a Stripe session_id query unchanged', () => {
    expect(scrubAuthUrl('https://www.drivede.app/?session_id=cs_test_123')).toBe('https://www.drivede.app/?session_id=cs_test_123');
  });

  it('handles a relative URL', () => {
    expect(scrubAuthUrl('/?utm_source=x#access_token=aaa&refresh_token=bbb')).toBe('/?utm_source=x');
  });

  it('returns empty and non-URL strings without throwing', () => {
    expect(() => scrubAuthUrl('')).not.toThrow();
    expect(scrubAuthUrl('')).toBe('');
    expect(() => scrubAuthUrl('not a url')).not.toThrow();
    expect(scrubAuthUrl('not a url')).toBe('not a url');
  });

  it('removes tokens from a malformed URL', () => {
    const out = scrubAuthUrl('%%%#access_token=aaa');
    expect(out).not.toContain('access_token=');
    expect(out).not.toContain('aaa');
  });
});

describe('hasAuthUrlParams', () => {
  it('is true for a token URL', () => {
    expect(hasAuthUrlParams('https://www.drivede.app/#access_token=aaa&refresh_token=bbb')).toBe(true);
  });

  it('is true for an error URL', () => {
    expect(hasAuthUrlParams('https://www.drivede.app/?error=invalid_request&error_code=bad_oauth_state')).toBe(true);
  });

  it('is false for a #plan URL', () => {
    expect(hasAuthUrlParams('https://www.drivede.app/?lang=en#plan')).toBe(false);
  });

  it('is false for a plain URL', () => {
    expect(hasAuthUrlParams('https://www.drivede.app/pruefung/kreisverkehr/')).toBe(false);
  });
});

describe('scrubAnalyticsValue', () => {
  it('cleans a token URL', () => {
    const out = scrubAnalyticsValue('https://www.drivede.app/#access_token=aaa&refresh_token=bbb');
    expect(out).toBe('https://www.drivede.app/');
  });

  it('drops code from a query but keeps lang', () => {
    expect(scrubAnalyticsValue('https://www.drivede.app/?code=abc&lang=en')).toBe('https://www.drivede.app/?lang=en');
  });

  it('redacts a bare token value', () => {
    expect(scrubAnalyticsValue('access_token=aaa')).toBe('[redacted]');
  });

  it('leaves an ordinary sentence and URL unchanged', () => {
    expect(scrubAnalyticsValue('Learner passed the roundabout lesson')).toBe('Learner passed the roundabout lesson');
    expect(scrubAnalyticsValue('https://www.drivede.app/pruefung/kreisverkehr/?lang=en')).toBe('https://www.drivede.app/pruefung/kreisverkehr/?lang=en');
  });
});
