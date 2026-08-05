import { Resend } from 'resend';
import postgres from 'postgres';
import { createHmac } from 'node:crypto';

/**
 * GRO-8: Daily drip email job, invoked by Vercel Cron (see vercel.json).
 *
 * Campaigns (idempotent via email_log UNIQUE(email, campaign)):
 *  - day3_nudge:  signed up 3+ days ago, never completed a lesson or logged a
 *                 drive → "your first practice drive is waiting"
 *  - day7_upsell: signed up 7+ days ago, still not premium and no active
 *                 subscription → soft Pro upsell
 *
 * Guards: recency windows so a first run never blasts the historical user
 * base; per-campaign batch cap; suppression via campaign='unsubscribed'.
 */

const resend = new Resend(process.env.RESEND_API_KEY);
const BATCH_LIMIT = 50;
const APP_URL = 'https://drivede.app';

function unsubscribeToken(email: string): string {
  const secret = process.env.CRON_SECRET || process.env.RESEND_API_KEY || '';
  return createHmac('sha256', secret).update(email.toLowerCase()).digest('hex').slice(0, 32);
}

function unsubscribeFooter(email: string, isDe: boolean): string {
  const url = `${APP_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken(email)}`;
  return `
    <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
      DriveDE, Hamburg, Germany ·
      <a href="${url}" style="color: #94a3b8;">${isDe ? 'Keine weiteren E-Mails erhalten' : 'Unsubscribe from these emails'}</a>
    </p>`;
}

function day3Email(name: string, isDe: boolean): { subject: string; html: string } {
  const subject = isDe
    ? 'Deine erste Übungsfahrt wartet auf dich 🚗'
    : 'Your first practice drive is waiting 🚗';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h1 style="color: #3b82f6; font-size: 26px; font-weight: 900;">${isDe ? `Hey ${name}, bereit für den Start?` : `Hey ${name}, ready to get rolling?`}</h1>
      <p style="font-size: 16px; line-height: 1.6;">
        ${isDe
          ? 'Du hast dich vor ein paar Tagen bei DriveDE angemeldet, aber noch keine Lektion abgeschlossen oder Fahrt aufgezeichnet. Der schnellste Weg zur Prüfungsreife beginnt mit einer einzigen Fahrstunde:'
          : 'You joined DriveDE a few days ago but haven\'t completed a lesson or tracked a drive yet. The fastest path to exam readiness starts with a single lesson:'}
      </p>
      <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <ol style="padding-left: 20px; margin: 0; line-height: 1.9;">
          <li>${isDe ? 'Öffne DriveDE vor deiner nächsten Fahrstunde' : 'Open DriveDE before your next driving lesson'}</li>
          <li>${isDe ? 'Tippe auf „Start" — GPS zeichnet Route und Tempolimits auf' : 'Tap "Start" — GPS records your route and speed limits'}</li>
          <li>${isDe ? 'Erhalte danach deine KI-Auswertung und Prüfungsreife' : 'Get your AI debriefing and exam-readiness score after'}</li>
        </ol>
      </div>
      <a href="${APP_URL}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 800; padding: 14px 28px; border-radius: 12px; text-decoration: none;">${isDe ? 'Jetzt loslegen' : 'Start now'}</a>
    </div>`;
  return { subject, html };
}

function day7Email(name: string, isDe: boolean): { subject: string; html: string } {
  const subject = isDe
    ? 'So bestehen DriveDE-Nutzer im ersten Anlauf'
    : 'How DriveDE users pass on the first try';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h1 style="color: #3b82f6; font-size: 26px; font-weight: 900;">${isDe ? `${name}, eine Woche geschafft!` : `${name}, one week in!`}</h1>
      <p style="font-size: 16px; line-height: 1.6;">
        ${isDe
          ? 'Eine Fahrstunde kostet bis zu 95 €. Wer durchfällt, zahlt 600 €+ für Zusatzstunden und neue Prüfungsgebühren. DriveDE Pro kostet weniger als 15 Minuten einer einzigen Fahrstunde:'
          : 'A driving lesson costs up to €95. Failing the exam costs €600+ in extra lessons and re-test fees. DriveDE Pro costs less than 15 minutes of a single lesson:'}
      </p>
      <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <ul style="padding-left: 20px; margin: 0; line-height: 1.9;">
          <li>${isDe ? 'Unbegrenztes GPS-Fahrtenbuch mit Tempolimit-Warnungen' : 'Unlimited GPS drive tracking with speed-limit warnings'}</li>
          <li>${isDe ? 'KI-Fahrlehrer-Auswertung nach jeder Fahrt' : 'AI instructor debriefing after every drive'}</li>
          <li>${isDe ? '3D-Manöversimulationen (Einparken, Autobahn)' : '3D maneuver simulations (Einparken, Autobahn)'}</li>
          <li>${isDe ? 'Objektive Prüfungsreife — wisse genau, wann du bereit bist' : 'Objective exam readiness — know exactly when you\'re ready'}</li>
        </ul>
      </div>
      <p style="font-size: 15px; line-height: 1.6;">
        ${isDe
          ? '90 Tage voller Zugang für einmalig 19,99 € — kein Abo.'
          : '90 days of full access for a one-time €19.99 — no subscription.'}
      </p>
      <a href="${APP_URL}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 800; padding: 14px 28px; border-radius: 12px; text-decoration: none;">${isDe ? 'Pro freischalten' : 'Unlock Pro'}</a>
    </div>`;
  return { subject, html };
}

type Candidate = { email: string; display_name: string | null; language: string };

export default async function handler(req: any, res: any) {
  // Vercel Cron sends GET with Authorization: Bearer <CRON_SECRET> when configured
  const expected = process.env.CRON_SECRET;
  if (expected && req.headers['authorization'] !== `Bearer ${expected}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[Drip] DATABASE_URL env var is not set.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // ?dryRun=1 reports campaign candidates without claiming or sending anything
  const dryRun = req.query?.dryRun === '1';

  const sql = postgres(connectionString, { max: 1, prepare: false });
  const results: Record<string, { sent: number; failed: number }> = {};

  try {
    const campaigns: Array<{ name: string; candidates: Candidate[]; build: typeof day3Email }> = [];

    // Day 3 nudge: 3-14 days old, zero activity, not yet contacted, not suppressed
    const day3 = await sql<Candidate[]>`
      SELECT p.email, p.display_name, p.language::text AS language
      FROM public.profiles p
      WHERE p.email IS NOT NULL
        AND p.created_at BETWEEN now() - interval '14 days' AND now() - interval '3 days'
        AND NOT EXISTS (SELECT 1 FROM public.lesson_progress lp WHERE lp.user_id = p.id AND lp.status = 'completed')
        AND NOT EXISTS (SELECT 1 FROM public.driving_sessions ds WHERE ds.user_id = p.id)
        AND NOT EXISTS (SELECT 1 FROM public.email_log el WHERE el.email = p.email AND el.campaign IN ('day3_nudge', 'unsubscribed'))
      LIMIT ${BATCH_LIMIT}
    `;
    campaigns.push({ name: 'day3_nudge', candidates: day3, build: day3Email });

    // Day 7 upsell: 7-28 days old, still free, not yet contacted, not suppressed
    const day7 = await sql<Candidate[]>`
      SELECT p.email, p.display_name, p.language::text AS language
      FROM public.profiles p
      WHERE p.email IS NOT NULL
        AND p.created_at BETWEEN now() - interval '28 days' AND now() - interval '7 days'
        AND p.is_premium = false
        AND NOT EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id AND s.status = 'active')
        AND NOT EXISTS (SELECT 1 FROM public.email_log el WHERE el.email = p.email AND el.campaign IN ('day7_upsell', 'unsubscribed'))
      LIMIT ${BATCH_LIMIT}
    `;
    campaigns.push({ name: 'day7_upsell', candidates: day7, build: day7Email });

    if (dryRun) {
      const preview = Object.fromEntries(campaigns.map((c) => [
        c.name,
        {
          candidates: c.candidates.length,
          // mask addresses: ab***@domain.com
          emails: c.candidates.map((u) => u.email.replace(/^(.{2}).*(@.*)$/, '$1***$2')),
        },
      ]));
      return res.status(200).json({ success: true, dryRun: true, preview });
    }

    for (const c of campaigns) {
      results[c.name] = { sent: 0, failed: 0 };
      for (const user of c.candidates) {
        // Claim the send first (UNIQUE constraint = idempotency even across concurrent runs)
        const claimed = await sql`
          INSERT INTO public.email_log (email, campaign) VALUES (${user.email}, ${c.name})
          ON CONFLICT (email, campaign) DO NOTHING RETURNING id
        `;
        if (claimed.length === 0) continue;

        try {
          const isDe = user.language === 'de';
          const name = user.display_name || (isDe ? 'Fahrschüler' : 'future driver');
          const { subject, html } = c.build(name, isDe);
          await resend.emails.send({
            from: 'DriveDE <hello@drivede.app>',
            to: [user.email],
            subject,
            html: html + unsubscribeFooter(user.email, isDe),
          });
          results[c.name].sent++;
        } catch (err) {
          // Release the claim so tomorrow's run retries this user
          await sql`DELETE FROM public.email_log WHERE email = ${user.email} AND campaign = ${c.name}`;
          results[c.name].failed++;
          console.error(`[Drip] ${c.name} failed for a recipient:`, err);
        }
      }
    }

    console.log('[Drip] Run complete:', JSON.stringify(results));
    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('[Drip] Run failed:', error);
    return res.status(500).json({ error: 'Drip run failed' });
  } finally {
    await sql.end();
  }
}
