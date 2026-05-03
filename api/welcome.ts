import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verification token from Supabase (optional security)
  const webhookSecret = req.headers['x-supabase-webhook-secret'];
  if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { record } = req.body;
  const email = record.email;
  const fullName = record.raw_user_meta_data?.full_name || 'Future Driver';

  try {
    const data = await resend.emails.send({
      from: 'DriveDE <welcome@drivede.app>',
      to: [email],
      subject: 'Welcome to DriveDE! 🚗',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
          <h1 style="color: #3b82f6; font-size: 32px; font-weight: 900; margin-bottom: 24px;">Welcome aboard, ${fullName}!</h1>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We're thrilled to have you join the DriveDE family. Your account is now confirmed, and you're ready to start your journey towards getting your German driving license.
          </p>
          <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
            <h2 style="font-size: 18px; font-weight: 700; margin-top: 0;">What's next?</h2>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              <li style="margin-bottom: 10px;">Select your driving path (Manual or Automatic).</li>
              <li style="margin-bottom: 10px;">Start with Chapter 1: Basic Rules.</li>
              <li style="margin-bottom: 0;">Track your first driving lesson with the built-in GPS tracker.</li>
            </ul>
          </div>
          <a href="https://drivede.app" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 800; padding: 16px 32px; border-radius: 12px; text-decoration: none; text-align: center;">Go to Dashboard</a>
          <p style="font-size: 14px; color: #64748b; margin-top: 40px;">
            Drive safe,<br />
            The DriveDE Team
          </p>
        </div>
      `
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
