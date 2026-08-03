import { Resend } from 'resend';
import postgres from 'postgres';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function checklistHtml(isDe: boolean): string {
  const t = isDe
    ? {
        title: 'Deine Checkliste für die deutsche Fahrprüfung 🚗',
        intro: 'Hier ist deine kompakte Checkliste — alle Prüfungspunkte, häufige Fehler und Umschreibungs-Dokumente auf einen Blick.',
        docsTitle: '📄 Dokumente & Anmeldung',
        docs: ['Personalausweis oder Reisepass', 'Biometrisches Passfoto', 'Sehtest-Bescheinigung (max. 2 Jahre alt)', 'Erste-Hilfe-Kurs Nachweis (9 Einheiten)', 'Führerscheinantrag bei der Fahrerlaubnisbehörde'],
        examTitle: '✅ Praktische Prüfung — darauf achten die Prüfer',
        exam: ['Schulterblick bei jedem Abbiegen und Spurwechsel', 'Tempolimits exakt einhalten (häufigster Durchfallgrund!)', 'Vorfahrt an rechts-vor-links Kreuzungen', 'Korrektes Verhalten an Zebrastreifen und Bushaltestellen', 'Einparken: Parallel- und Querparken sicher beherrschen', 'Autobahn: Auffahren, Abstand halten, Ausfahren'],
        mistakesTitle: '⚠️ Die 3 häufigsten Fehler',
        mistakes: ['Zu schnell in 30er-Zonen — nutze GPS-Warnungen beim Üben', 'Vergessener Schulterblick — trainiere die Routine bewusst', 'Unsicherheit beim Einparken — mental mit 3D-Simulationen vorbereiten'],
        umTitle: '🌍 Umschreibung (ausländischer Führerschein)',
        um: ['Übersetzung/Klassifizierung deines Führerscheins (z.B. ADAC)', 'Meldebescheinigung (Wohnsitz in Deutschland)', 'Je nach Herkunftsland: Theorie- und/oder Praxisprüfung nötig', 'Antrag innerhalb von 6 Monaten nach Einreise empfohlen'],
        cta: 'Mit DriveDE üben',
        outro: 'Bereit für die Prüfung? DriveDE trackt deine Fahrstunden per GPS, warnt bei Tempolimits und zeigt dir deine Prüfungsreife.',
        signoff: 'Gute Fahrt,<br />Dein DriveDE Team',
      }
    : {
        title: 'Your German Driving Exam Checklist 🚗',
        intro: 'Here is your compact checklist — every exam checkpoint, common mistakes, and Umschreibung documents at a glance.',
        docsTitle: '📄 Documents & Registration',
        docs: ['ID card or passport', 'Biometric passport photo', 'Eye test certificate (max. 2 years old)', 'First aid course certificate (9 units)', 'License application at the Fahrerlaubnisbehörde'],
        examTitle: '✅ Practical Exam — What Examiners Watch For',
        exam: ['Schulterblick (shoulder check) on every turn and lane change', 'Exact speed limit compliance (the #1 reason people fail!)', 'Right-before-left priority at unmarked intersections', 'Correct behavior at zebra crossings and bus stops', 'Parking: master parallel and perpendicular parking', 'Autobahn: merging, safe distance, exiting'],
        mistakesTitle: '⚠️ The 3 Most Common Mistakes',
        mistakes: ['Speeding in 30 km/h zones — practice with GPS warnings', 'Forgotten shoulder check — consciously drill the routine', 'Parking nerves — prepare mentally with 3D simulations'],
        umTitle: '🌍 Umschreibung (Foreign License Conversion)',
        um: ['Translation/classification of your license (e.g. via ADAC)', 'Registration certificate (Meldebescheinigung)', 'Depending on your country: theory and/or practical exam required', 'Apply within 6 months of arrival (recommended)'],
        cta: 'Practice with DriveDE',
        outro: 'Ready to prepare? DriveDE tracks your driving lessons via GPS, warns you about speed limits, and shows your exam readiness.',
        signoff: 'Drive safe,<br />The DriveDE Team',
      };

  const list = (items: string[]) =>
    items.map((i) => `<li style="margin-bottom: 8px;">${i}</li>`).join('');
  const section = (title: string, items: string[]) => `
    <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h2 style="font-size: 18px; font-weight: 700; margin-top: 0;">${title}</h2>
      <ul style="padding-left: 20px; margin-bottom: 0;">${list(items)}</ul>
    </div>`;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h1 style="color: #3b82f6; font-size: 28px; font-weight: 900; margin-bottom: 16px;">${t.title}</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${t.intro}</p>
      ${section(t.docsTitle, t.docs)}
      ${section(t.examTitle, t.exam)}
      ${section(t.mistakesTitle, t.mistakes)}
      ${section(t.umTitle, t.um)}
      <p style="font-size: 15px; line-height: 1.6; margin: 24px 0;">${t.outro}</p>
      <a href="https://drivede.app" style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 800; padding: 16px 32px; border-radius: 12px; text-decoration: none; text-align: center;">${t.cta}</a>
      <p style="font-size: 14px; color: #64748b; margin-top: 40px;">${t.signoff}</p>
    </div>`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, language } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const lang = language === 'de' ? 'de' : 'en';

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[Lead] DATABASE_URL env var is not set.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const sql = postgres(connectionString, { max: 1, prepare: false });

  try {
    // Store the lead; duplicate signups are fine — we still (re)send the checklist
    await sql`
      INSERT INTO public.marketing_leads (email, source, language)
      VALUES (${normalizedEmail}, 'landing_lead_magnet', ${lang})
      ON CONFLICT (email, source) DO NOTHING
    `;

    await resend.emails.send({
      from: 'DriveDE <hello@drivede.app>',
      to: [normalizedEmail],
      subject:
        lang === 'de'
          ? 'Deine Checkliste für die deutsche Fahrprüfung 🚗'
          : 'Your Free German Driving Exam Checklist 🚗',
      html: checklistHtml(lang === 'de'),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Lead] Failed:', error);
    return res.status(500).json({ error: 'Failed to process lead' });
  } finally {
    await sql.end();
  }
}
