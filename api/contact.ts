import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const data = await resend.emails.send({
      from: 'DriveDE Feedback <system@drivede.app>',
      to: ['your-personal-email@example.com'], // The user should replace this or we can use an env var
      replyTo: email,
      subject: `New Feedback: ${subject || 'General Inquiry'}`,
      html: `
        <div style="font-family: sans-serif; color: #1e293b; max-width: 600px;">
          <h2 style="color: #3b82f6;">New Feedback from ${name}</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-top: 20px;">
            ${message.replace(/\n/g, '<br />')}
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
