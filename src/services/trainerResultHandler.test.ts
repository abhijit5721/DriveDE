/**
 * Contract tests for api/trainer-result.ts that need no database: method and
 * payload validation must reject before any connection is attempted.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('postgres', () => ({
  default: () => {
    throw new Error('postgres must not be constructed for rejected requests');
  },
}));

import handler from '../../api/trainer-result';

function mockRes() {
  const res: any = { statusCode: 0, body: null, headers: {} as Record<string, string> };
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (payload: unknown) => { res.body = payload; return res; };
  res.setHeader = (k: string, v: string) => { res.headers[k] = v; };
  return res;
}

const good = { scenarioId: 'public-rvl', cars: 2, wrongTaps: 1, durationMs: 4200 };

describe('api/trainer-result validation', () => {
  it('rejects anything but POST', async () => {
    const res = mockRes();
    await handler({ method: 'GET', headers: {} }, res);
    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe('POST');
  });

  it.each([
    ['missing body', undefined],
    ['bad scenario id', { ...good, scenarioId: 'DROP TABLE;' }],
    ['scenario id too long', { ...good, scenarioId: 'a'.repeat(65) }],
    ['negative wrong taps', { ...good, wrongTaps: -1 }],
    ['too many wrong taps', { ...good, wrongTaps: 51 }],
    ['impossibly fast', { ...good, durationMs: 100 }],
    ['ten minutes plus', { ...good, durationMs: 600001 }],
    ['zero cars', { ...good, cars: 0 }],
    ['non-numeric duration', { ...good, durationMs: 'fast' }],
  ])('rejects %s with 400', async (_label, body) => {
    const res = mockRes();
    await handler({ method: 'POST', headers: {}, body }, res);
    expect(res.statusCode).toBe(400);
  });

  it('fails closed with 500 when DATABASE_URL is missing', async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      const res = mockRes();
      await handler({ method: 'POST', headers: {}, body: good }, res);
      expect(res.statusCode).toBe(500);
    } finally {
      if (prev !== undefined) process.env.DATABASE_URL = prev;
    }
  });
});
