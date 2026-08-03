import { Resend } from 'resend';
import postgres from 'postgres';
import {
  UMSCHREIBUNG_COUNTRIES,
  TIER_CONFIG,
} from './_lib/umschreibungCountries';
import type { UmschreibungCountry, UmschreibungTier } from './_lib/umschreibungCountries';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** 'XX' = license from a country not in our list → legally tier 'other' (not EU, not Anlage 11) */
const OTHER_COUNTRY_CODE = 'XX';
const VALID_COUNTRY_CODES = new Set([
  ...UMSCHREIBUNG_COUNTRIES.map((c) => c.code),
  OTHER_COUNTRY_CODE,
]);

// ─── Email building blocks ────────────────────────────────────────────────────

const list = (items: readonly string[]) =>
  items.map((i) => `<li style="margin-bottom: 8px;">${i}</li>`).join('');

const section = (title: string, items: readonly string[]) => `
  <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
    <h2 style="font-size: 18px; font-weight: 700; margin-top: 0;">${title}</h2>
    <ul style="padding-left: 20px; margin-bottom: 0;">${list(items)}</ul>
  </div>`;

const note = (text: string) => `
  <p style="font-size: 14px; line-height: 1.6; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px;">💡 ${text}</p>`;

function firstLicenseBlocks(isDe: boolean): string {
  const t = isDe
    ? {
        docsTitle: '📄 Dokumente & Anmeldung',
        docs: ['Personalausweis oder Reisepass', 'Biometrisches Passfoto', 'Sehtest-Bescheinigung (max. 2 Jahre alt)', 'Erste-Hilfe-Kurs Nachweis (9 Einheiten)', 'Führerscheinantrag bei der Fahrerlaubnisbehörde'],
      }
    : {
        docsTitle: '📄 Documents & Registration',
        docs: ['ID card or passport', 'Biometric passport photo', 'Eye test certificate (max. 2 years old)', 'First aid course certificate (9 units)', 'License application at the Fahrerlaubnisbehörde'],
      };
  return section(t.docsTitle, t.docs);
}

function examBlocks(isDe: boolean): string {
  const t = isDe
    ? {
        examTitle: '✅ Praktische Prüfung — darauf achten die Prüfer',
        exam: ['Schulterblick bei jedem Abbiegen und Spurwechsel', 'Tempolimits exakt einhalten (häufigster Durchfallgrund!)', 'Vorfahrt an rechts-vor-links Kreuzungen', 'Korrektes Verhalten an Zebrastreifen und Bushaltestellen', 'Einparken: Parallel- und Querparken sicher beherrschen', 'Autobahn: Auffahren, Abstand halten, Ausfahren'],
        mistakesTitle: '⚠️ Die 3 häufigsten Fehler',
        mistakes: ['Zu schnell in 30er-Zonen — nutze GPS-Warnungen beim Üben', 'Vergessener Schulterblick — trainiere die Routine bewusst', 'Unsicherheit beim Einparken — mental mit 3D-Simulationen vorbereiten'],
      }
    : {
        examTitle: '✅ Practical Exam — What Examiners Watch For',
        exam: ['Schulterblick (shoulder check) on every turn and lane change', 'Exact speed limit compliance (the #1 reason people fail!)', 'Right-before-left priority at unmarked intersections', 'Correct behavior at zebra crossings and bus stops', 'Parking: master parallel and perpendicular parking', 'Autobahn: merging, safe distance, exiting'],
        mistakesTitle: '⚠️ The 3 Most Common Mistakes',
        mistakes: ['Speeding in 30 km/h zones — practice with GPS warnings', 'Forgotten shoulder check — consciously drill the routine', 'Parking nerves — prepare mentally with 3D simulations'],
      };
  return section(t.examTitle, t.exam) + section(t.mistakesTitle, t.mistakes);
}

function genericUmschreibungBlock(isDe: boolean): string {
  return isDe
    ? section('🌍 Umschreibung (ausländischer Führerschein)', ['Übersetzung/Klassifizierung deines Führerscheins (z.B. ADAC)', 'Meldebescheinigung (Wohnsitz in Deutschland)', 'Je nach Herkunftsland: Theorie- und/oder Praxisprüfung nötig', 'Antrag innerhalb von 6 Monaten nach Einreise empfohlen'])
    : section('🌍 Umschreibung (Foreign License Conversion)', ['Translation/classification of your license (e.g. via ADAC)', 'Registration certificate (Meldebescheinigung)', 'Depending on your country: theory and/or practical exam required', 'Apply within 6 months of arrival (recommended)']);
}

function conversionBlock(tier: UmschreibungTier, country: UmschreibungCountry | null, isDe: boolean): string {
  const cfg = TIER_CONFIG[tier];
  const countryLabel = country
    ? `${country.flag} ${isDe ? country.nameDe : country.nameEn}`
    : isDe ? 'Dein Land' : 'Your country';
  const title = `${cfg.iconEmoji} ${countryLabel} — ${isDe ? cfg.labelDe : cfg.labelEn}`;

  let html = `
    <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h2 style="font-size: 18px; font-weight: 700; margin-top: 0;">${title}</h2>
      <p style="font-size: 14px; line-height: 1.6;">${isDe ? cfg.summaryDe : cfg.summaryEn}</p>
      <p style="font-size: 13px; font-weight: 700; color: #475569;">⏱️ ${isDe ? 'Zeitrahmen' : 'Timeline'}: ${isDe ? cfg.timelineDe : cfg.timelineEn}</p>
      <ol style="padding-left: 20px; margin-bottom: 0;">${(isDe ? cfg.stepsDe : cfg.stepsEn).map((s) => `<li style="margin-bottom: 8px;">${s}</li>`).join('')}</ol>
    </div>`;

  const countryNote = country ? (isDe ? country.noteDe : country.noteEn) : undefined;
  if (countryNote) html += note(countryNote);
  html += note(
    isDe
      ? 'Wichtig: Stelle den Umschreibungsantrag möglichst innerhalb von 6 Monaten nach deiner Einreise — danach darfst du mit dem ausländischen Führerschein nicht mehr in Deutschland fahren.'
      : 'Important: Apply for the conversion within 6 months of arriving in Germany — after that, your foreign license is no longer valid for driving here.'
  );
  return html;
}

function buildEmail(isDe: boolean, country: UmschreibungCountry | null, countryCode: string | null): { subject: string; html: string } {
  // Tier: null = first license; unlisted country ('XX') = legally 'other'
  const tier: UmschreibungTier | null = country ? country.tier : countryCode === OTHER_COUNTRY_CODE ? 'other' : null;
  const needsExams = tier === null || tier === 'other';

  let subject: string;
  let title: string;
  let intro: string;
  let body: string;

  if (tier === 'eu' || tier === 'annex11') {
    subject = isDe ? 'Deine Umschreibungs-Checkliste für Deutschland 🚗' : 'Your German License Conversion Checklist 🚗';
    title = isDe ? 'Gute Nachrichten: Keine Prüfungen nötig! 🎉' : 'Good News: No Exams Required! 🎉';
    intro = isDe
      ? 'Hier ist deine persönliche Checkliste für die Umschreibung deines Führerscheins — zugeschnitten auf dein Herkunftsland.'
      : 'Here is your personal checklist for converting your license to a German one — tailored to your country.';
    body = conversionBlock(tier, country, isDe);
  } else if (tier === 'other') {
    subject = isDe ? 'Deine Checkliste für die deutsche Fahrprüfung 🚗' : 'Your German Driving Exam Checklist 🚗';
    title = isDe ? 'Deine Umschreibungs- & Prüfungs-Checkliste 🚗' : 'Your Conversion & Exam Checklist 🚗';
    intro = isDe
      ? 'Für dein Herkunftsland sind Theorie- und Praxisprüfung erforderlich. Hier ist dein kompletter Fahrplan — von der Umschreibung bis zur bestandenen Prüfung.'
      : 'Your country requires both the theory and practical exam. Here is your complete roadmap — from conversion paperwork to passing the test.';
    body = conversionBlock(tier, country, isDe) + examBlocks(isDe);
  } else {
    subject = isDe ? 'Deine Checkliste für die deutsche Fahrprüfung 🚗' : 'Your Free German Driving Exam Checklist 🚗';
    title = isDe ? 'Deine Checkliste für die deutsche Fahrprüfung 🚗' : 'Your German Driving Exam Checklist 🚗';
    intro = isDe
      ? 'Hier ist deine kompakte Checkliste — alle Prüfungspunkte, häufige Fehler und Umschreibungs-Dokumente auf einen Blick.'
      : 'Here is your compact checklist — every exam checkpoint, common mistakes, and Umschreibung documents at a glance.';
    body = firstLicenseBlocks(isDe) + examBlocks(isDe) + genericUmschreibungBlock(isDe);
  }

  const outro = needsExams
    ? isDe
      ? 'Bereit für die Prüfung? DriveDE trackt deine Fahrstunden per GPS, warnt bei Tempolimits und zeigt dir deine Prüfungsreife — inklusive Umschreibungs-Modus.'
      : 'Ready to prepare? DriveDE tracks your driving lessons via GPS, warns you about speed limits, and shows your exam readiness — including a dedicated Umschreibung mode.'
    : isDe
      ? 'Auch ohne Prüfung: DriveDE begleitet dich mit dem Umschreibungs-Modus Schritt für Schritt durch den Prozess und macht dich fit für den deutschen Straßenverkehr.'
      : 'Even without exams, DriveDE guides you step by step through the conversion process and gets you confident with German traffic rules.';
  const cta = isDe ? 'Mit DriveDE starten' : 'Get Started with DriveDE';
  const signoff = isDe ? 'Gute Fahrt,<br />Dein DriveDE Team' : 'Drive safe,<br />The DriveDE Team';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <h1 style="color: #3b82f6; font-size: 28px; font-weight: 900; margin-bottom: 16px;">${title}</h1>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${intro}</p>
      ${body}
      <p style="font-size: 15px; line-height: 1.6; margin: 24px 0;">${outro}</p>
      <a href="https://drivede.app" style="display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 800; padding: 16px 32px; border-radius: 12px; text-decoration: none; text-align: center;">${cta}</a>
      <p style="font-size: 14px; color: #64748b; margin-top: 40px;">${signoff}</p>
    </div>`;

  return { subject, html };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, language, country } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const lang = language === 'de' ? 'de' : 'en';
  const countryCode =
    typeof country === 'string' && VALID_COUNTRY_CODES.has(country.toUpperCase())
      ? country.toUpperCase()
      : null;

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
    // Store the lead; re-submissions update language/country and re-send the checklist
    await sql`
      INSERT INTO public.marketing_leads (email, source, language, country)
      VALUES (${normalizedEmail}, 'landing_lead_magnet', ${lang}, ${countryCode})
      ON CONFLICT (email, source)
      DO UPDATE SET language = EXCLUDED.language, country = EXCLUDED.country
    `;

    const countryEntry = UMSCHREIBUNG_COUNTRIES.find((c) => c.code === countryCode) ?? null;
    const { subject, html } = buildEmail(lang === 'de', countryEntry, countryCode);

    await resend.emails.send({
      from: 'DriveDE <hello@drivede.app>',
      to: [normalizedEmail],
      subject,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Lead] Failed:', error);
    return res.status(500).json({ error: 'Failed to process lead' });
  } finally {
    await sql.end();
  }
}
