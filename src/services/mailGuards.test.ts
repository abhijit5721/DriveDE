// @vitest-environment node
/**
 * Abuse-guard tests for api/lead.ts and api/contact.ts (DRI-77): body cap, honeypot,
 * email validation and the per-IP hourly limiter. Postgres and Resend are mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const state = vi.hoisted(() => ({ hits: 1, queries: 0, sent: 0, scopes: [] as string[] }));

vi.mock('postgres', () => ({
  default: () => {
    const sql: any = async (_strings: TemplateStringsArray, ...values: unknown[]) => {
      state.queries++;
      const first = String(values[0] ?? '');
      // limiter insert binds the hashed key first; lead inserts bind the email first
      if (first.includes('|') && !first.includes('@')) {
        state.scopes.push(first.split('|')[0]);
        return [{ hits: state.hits }];
      }
      return [{ id: 1 }];
    };
    sql.end = async () => undefined;
    return sql;
  },
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: async () => { state.sent++; return { id: 'x' }; } };
  },
}));

import lead from '../../api/lead';
import contact from '../../api/contact';
import { bodyTooLarge, hasDottedDomain, honeypotFilled, rateLimitKey } from '../../api/_lib/rateLimit';

function mockRes() {
  const res: any = { statusCode: 0, body: null, headers: {} as Record<string, string> };
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (payload: unknown) => { res.body = payload; return res; };
  res.setHeader = (k: string, v: string) => { res.headers[k] = v; };
  return res;
}

const req = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'x-forwarded-for': '203.0.113.9', ...headers },
  body,
});

const goodLead = { email: 'a@example.com', language: 'en', country: null };
const goodContact = { name: 'Ann', email: 'a@example.com', subject: 'Hi', message: 'Hello' };

beforeEach(() => {
  state.hits = 1;
  state.queries = 0;
  state.sent = 0;
  state.scopes = [];
  process.env.DATABASE_URL = 'postgres://test';
  process.env.CONTACT_EMAIL = 'owner@example.com';
});

describe('rateLimit helpers', () => {
  it('scopes the key so endpoints never share a counter', () => {
    expect(rateLimitKey('lead', '1.1.1.1')).not.toBe(rateLimitKey('contact', '1.1.1.1'));
    expect(rateLimitKey('lead', '1.1.1.1').startsWith('lead|')).toBe(true);
  });

  it.each([
    ['a@b.co', true],
    ['a@localhost', false],
    ['a@b.', false],
    ['a@.com', false],
    ['nope', false],
    ['@b.com', false],
  ])('hasDottedDomain(%s) = %s', (email, ok) => {
    expect(hasDottedDomain(email)).toBe(ok);
  });

  it('flags bodies over 4 KB', () => {
    expect(bodyTooLarge({ headers: {}, body: { message: 'x'.repeat(5000) } })).toBe(true);
    expect(bodyTooLarge({ headers: { 'content-length': '9000' }, body: {} })).toBe(true);
    expect(bodyTooLarge({ headers: {}, body: { message: 'ok' } })).toBe(false);
  });

  it('honeypot only trips on a non-empty value', () => {
    expect(honeypotFilled({ website: 'http://spam' })).toBe(true);
    expect(honeypotFilled({ website: '  ' })).toBe(false);
    expect(honeypotFilled({})).toBe(false);
  });
});

describe.each([
  ['lead', lead, goodLead, 3],
  ['contact', contact, goodContact, 5],
] as const)('api/%s guards', (scope, handler, good, max) => {
  it('413 on a body over 4 KB', async () => {
    const res = mockRes();
    await handler(req({ ...good, message: 'x'.repeat(5000) }), res);
    expect(res.statusCode).toBe(413);
    expect(state.queries).toBe(0);
  });

  it('honeypot returns 200 {ok:true} with no DB write and no mail', async () => {
    const res = mockRes();
    await handler(req({ ...good, website: 'http://spam.example' }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(state.queries).toBe(0);
    expect(state.sent).toBe(0);
  });

  it('400 when the email domain has no dot', async () => {
    const res = mockRes();
    await handler(req({ ...good, email: 'a@localhost' }), res);
    expect(res.statusCode).toBe(400);
    expect(state.sent).toBe(0);
  });

  it(`429 once hits pass ${max} per hour, with its own scope`, async () => {
    state.hits = max + 1;
    const res = mockRes();
    await handler(req(good), res);
    expect(res.statusCode).toBe(429);
    expect(typeof res.body.error).toBe('string');
    expect(state.scopes).toEqual([scope]);
    expect(state.sent).toBe(0);
  });

  it(`allows hit number ${max}`, async () => {
    state.hits = max;
    const res = mockRes();
    await handler(req(good), res);
    expect(res.statusCode).toBe(200);
    expect(state.sent).toBe(1);
  });
});
