import { Resend } from 'resend';

import { bodyTooLarge, clientIp, hasDottedDomain, honeypotFilled, overLimit } from './_lib/rateLimit.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const CONTACT_MAX_PER_HOUR = 5;

// User input goes into an HTML mail: escape it so a sender cannot inject markup or links.
const escapeHtml = (value: unknown) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (bodyTooLarge(req)) {
    return res.status(413).json({ error: 'Payload too large' });
  }
  // Honeypot: bots fill the hidden field. Pretend success, send nothing.
  if (honeypotFilled(req.body)) {
    return res.status(200).json({ ok: true });
  }

  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string' || !hasDottedDomain(email.trim())) {
    return res.status(400).json({ error: 'Invalid fields' });
  }

  if (await overLimit('contact', clientIp(req), CONTACT_MAX_PER_HOUR)) {
    return res.status(429).json({ error: 'Too many requests, try again later' });
  }

  const contactEmail = process.env.CONTACT_EMAIL;
  if (!contactEmail) {
    console.error('[Contact] CONTACT_EMAIL env var is not set.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const data = await resend.emails.send({
      from: 'DriveDE Feedback <hello@drivede.app>',
      to: [contactEmail],
      replyTo: email,
      subject: `New Feedback: ${String(subject || 'General Inquiry').replace(/[\r\n]+/g, ' ').slice(0, 150)}`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px;">
          <h2 style="color: #3b82f6;">New Feedback from ${escapeHtml(name)}</h2>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject || 'N/A')}</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-top: 20px;">
            ${escapeHtml(message).replace(/\n/g, '<br />')}
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
