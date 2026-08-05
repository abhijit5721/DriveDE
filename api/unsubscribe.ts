import postgres from 'postgres';
import { createHmac } from 'node:crypto';

/**
 * GRO-8: One-click unsubscribe for drip/marketing emails (GDPR / §7 UWG).
 * Link format: /api/unsubscribe?email=<addr>&token=<hmac>
 * Inserts a suppression row (campaign='unsubscribed') that every drip
 * campaign query excludes. Transactional emails are unaffected.
 */

function expectedToken(email: string): string {
  const secret = process.env.CRON_SECRET || process.env.RESEND_API_KEY || '';
  return createHmac('sha256', secret).update(email.toLowerCase()).digest('hex').slice(0, 32);
}

const page = (title: string, body: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="font-family: sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
  <div style="max-width: 420px; text-align: center; padding: 40px 24px;">
    <h1 style="font-size: 22px; color: #ffffff;">${title}</h1>
    <p style="font-size: 15px; line-height: 1.6; color: #94a3b8;">${body}</p>
    <a href="https://drivede.app" style="color: #3b82f6; font-weight: 700;">drivede.app</a>
  </div>
</body></html>`;

export default async function handler(req: any, res: any) {
  const email = typeof req.query?.email === 'string' ? req.query.email.trim().toLowerCase() : '';
  const token = typeof req.query?.token === 'string' ? req.query.token : '';

  if (!email || !token || token !== expectedToken(email)) {
    return res.status(400).send(page('Invalid link', 'This unsubscribe link is invalid or expired. Please contact hello@drivede.app.'));
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[Unsubscribe] DATABASE_URL env var is not set.');
    return res.status(500).send(page('Something went wrong', 'Please try again later or contact hello@drivede.app.'));
  }

  const sql = postgres(connectionString, { max: 1, prepare: false });
  try {
    await sql`
      INSERT INTO public.email_log (email, campaign) VALUES (${email}, 'unsubscribed')
      ON CONFLICT (email, campaign) DO NOTHING
    `;
    return res.status(200).send(page(
      'You are unsubscribed',
      'You will no longer receive marketing emails from DriveDE. Account-related emails (receipts, security) are not affected. / Du erhältst keine Marketing-E-Mails mehr von DriveDE.'
    ));
  } catch (error) {
    console.error('[Unsubscribe] Failed:', error);
    return res.status(500).send(page('Something went wrong', 'Please try again later or contact hello@drivede.app.'));
  } finally {
    await sql.end();
  }
}
