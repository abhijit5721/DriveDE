/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * umschreibungCountries.ts
 *
 * Country data for the Umschreibung (foreign license conversion) guide.
 * Based on Anlage 11 FeV (Fahrerlaubnis-Verordnung) and EU directives.
 *
 * Three tiers:
 *  - 'eu'       : EU/EEA members — simple card exchange, no tests
 *  - 'annex11'  : Anlage 11 FeV countries — no tests, admin only
 *  - 'other'    : All other countries — theory + practical test required
 */

export type UmschreibungTier = 'eu' | 'annex11' | 'other';

export interface UmschreibungCountry {
  code: string;          // ISO 3166-1 alpha-2
  nameEn: string;
  nameDe: string;
  flag: string;          // emoji flag
  tier: UmschreibungTier;
  /** Extra notes specific to this country (e.g. US state restrictions) */
  noteEn?: string;
  noteDe?: string;
}

export const UMSCHREIBUNG_COUNTRIES: UmschreibungCountry[] = [
  // ─── EU / EEA ──────────────────────────────────────────────────────────────
  { code: 'AT', nameEn: 'Austria',         nameDe: 'Österreich',       flag: '🇦🇹', tier: 'eu' },
  { code: 'BE', nameEn: 'Belgium',         nameDe: 'Belgien',          flag: '🇧🇪', tier: 'eu' },
  { code: 'BG', nameEn: 'Bulgaria',        nameDe: 'Bulgarien',        flag: '🇧🇬', tier: 'eu' },
  { code: 'CY', nameEn: 'Cyprus',          nameDe: 'Zypern',           flag: '🇨🇾', tier: 'eu' },
  { code: 'CZ', nameEn: 'Czech Republic',  nameDe: 'Tschechien',       flag: '🇨🇿', tier: 'eu' },
  { code: 'DK', nameEn: 'Denmark',         nameDe: 'Dänemark',         flag: '🇩🇰', tier: 'eu' },
  { code: 'EE', nameEn: 'Estonia',         nameDe: 'Estland',          flag: '🇪🇪', tier: 'eu' },
  { code: 'FI', nameEn: 'Finland',         nameDe: 'Finnland',         flag: '🇫🇮', tier: 'eu' },
  { code: 'FR', nameEn: 'France',          nameDe: 'Frankreich',       flag: '🇫🇷', tier: 'eu' },
  { code: 'GR', nameEn: 'Greece',          nameDe: 'Griechenland',     flag: '🇬🇷', tier: 'eu' },
  { code: 'HR', nameEn: 'Croatia',         nameDe: 'Kroatien',         flag: '🇭🇷', tier: 'eu' },
  { code: 'HU', nameEn: 'Hungary',         nameDe: 'Ungarn',           flag: '🇭🇺', tier: 'eu' },
  { code: 'IE', nameEn: 'Ireland',         nameDe: 'Irland',           flag: '🇮🇪', tier: 'eu' },
  { code: 'IT', nameEn: 'Italy',           nameDe: 'Italien',          flag: '🇮🇹', tier: 'eu' },
  { code: 'IS', nameEn: 'Iceland',         nameDe: 'Island',           flag: '🇮🇸', tier: 'eu' },
  { code: 'LI', nameEn: 'Liechtenstein',   nameDe: 'Liechtenstein',    flag: '🇱🇮', tier: 'eu' },
  { code: 'LT', nameEn: 'Lithuania',       nameDe: 'Litauen',          flag: '🇱🇹', tier: 'eu' },
  { code: 'LU', nameEn: 'Luxembourg',      nameDe: 'Luxemburg',        flag: '🇱🇺', tier: 'eu' },
  { code: 'LV', nameEn: 'Latvia',          nameDe: 'Lettland',         flag: '🇱🇻', tier: 'eu' },
  { code: 'MT', nameEn: 'Malta',           nameDe: 'Malta',            flag: '🇲🇹', tier: 'eu' },
  { code: 'NL', nameEn: 'Netherlands',     nameDe: 'Niederlande',      flag: '🇳🇱', tier: 'eu' },
  { code: 'NO', nameEn: 'Norway',          nameDe: 'Norwegen',         flag: '🇳🇴', tier: 'eu' },
  { code: 'PL', nameEn: 'Poland',          nameDe: 'Polen',            flag: '🇵🇱', tier: 'eu' },
  { code: 'PT', nameEn: 'Portugal',        nameDe: 'Portugal',         flag: '🇵🇹', tier: 'eu' },
  { code: 'RO', nameEn: 'Romania',         nameDe: 'Rumänien',         flag: '🇷🇴', tier: 'eu' },
  { code: 'SE', nameEn: 'Sweden',          nameDe: 'Schweden',         flag: '🇸🇪', tier: 'eu' },
  { code: 'SI', nameEn: 'Slovenia',        nameDe: 'Slowenien',        flag: '🇸🇮', tier: 'eu' },
  { code: 'SK', nameEn: 'Slovakia',        nameDe: 'Slowakei',         flag: '🇸🇰', tier: 'eu' },
  { code: 'ES', nameEn: 'Spain',           nameDe: 'Spanien',          flag: '🇪🇸', tier: 'eu' },

  // ─── Annex 11 / Anlage 11 FeV ──────────────────────────────────────────────
  { code: 'AD', nameEn: 'Andorra',         nameDe: 'Andorra',          flag: '🇦🇩', tier: 'annex11' },
  { code: 'AU', nameEn: 'Australia',       nameDe: 'Australien',       flag: '🇦🇺', tier: 'annex11' },
  { code: 'BW', nameEn: 'Botswana',        nameDe: 'Botswana',         flag: '🇧🇼', tier: 'annex11' },
  { code: 'CA', nameEn: 'Canada',          nameDe: 'Kanada',           flag: '🇨🇦', tier: 'annex11',
    noteEn: 'Applies to all Canadian provinces and territories.',
    noteDe: 'Gilt für alle kanadischen Provinzen und Territorien.' },
  { code: 'IL', nameEn: 'Israel',          nameDe: 'Israel',           flag: '🇮🇱', tier: 'annex11' },
  { code: 'JP', nameEn: 'Japan',           nameDe: 'Japan',            flag: '🇯🇵', tier: 'annex11' },
  { code: 'KR', nameEn: 'South Korea',     nameDe: 'Südkorea',         flag: '🇰🇷', tier: 'annex11' },
  { code: 'MC', nameEn: 'Monaco',          nameDe: 'Monaco',           flag: '🇲🇨', tier: 'annex11' },
  { code: 'NA', nameEn: 'Namibia',         nameDe: 'Namibia',          flag: '🇳🇦', tier: 'annex11' },
  { code: 'NZ', nameEn: 'New Zealand',     nameDe: 'Neuseeland',       flag: '🇳🇿', tier: 'annex11' },
  { code: 'SG', nameEn: 'Singapore',       nameDe: 'Singapur',         flag: '🇸🇬', tier: 'annex11' },
  { code: 'SM', nameEn: 'San Marino',      nameDe: 'San Marino',       flag: '🇸🇲', tier: 'annex11' },
  { code: 'CH', nameEn: 'Switzerland',     nameDe: 'Schweiz',          flag: '🇨🇭', tier: 'annex11' },
  { code: 'TW', nameEn: 'Taiwan',          nameDe: 'Taiwan',           flag: '🇹🇼', tier: 'annex11' },
  { code: 'US', nameEn: 'United States',   nameDe: 'USA',              flag: '🇺🇸', tier: 'annex11',
    noteEn: 'Applies to all 50 US states and Washington D.C.',
    noteDe: 'Gilt für alle 50 US-Bundesstaaten und Washington D.C.' },
  { code: 'ZA', nameEn: 'South Africa',    nameDe: 'Südafrika',        flag: '🇿🇦', tier: 'annex11' },
  { code: 'ZM', nameEn: 'Zambia',          nameDe: 'Sambia',           flag: '🇿🇲', tier: 'annex11' },
  { code: 'ZW', nameEn: 'Zimbabwe',        nameDe: 'Simbabwe',         flag: '🇿🇼', tier: 'annex11' },

  // ─── Other countries (theory + practical test required) ────────────────────
  { code: 'AF', nameEn: 'Afghanistan',     nameDe: 'Afghanistan',      flag: '🇦🇫', tier: 'other' },
  { code: 'AL', nameEn: 'Albania',         nameDe: 'Albanien',         flag: '🇦🇱', tier: 'other' },
  { code: 'AM', nameEn: 'Armenia',         nameDe: 'Armenien',         flag: '🇦🇲', tier: 'other' },
  { code: 'AO', nameEn: 'Angola',          nameDe: 'Angola',           flag: '🇦🇴', tier: 'other' },
  { code: 'AR', nameEn: 'Argentina',       nameDe: 'Argentinien',      flag: '🇦🇷', tier: 'other' },
  { code: 'AZ', nameEn: 'Azerbaijan',      nameDe: 'Aserbaidschan',    flag: '🇦🇿', tier: 'other' },
  { code: 'BA', nameEn: 'Bosnia & Herzegovina', nameDe: 'Bosnien und Herzegowina', flag: '🇧🇦', tier: 'other' },
  { code: 'BD', nameEn: 'Bangladesh',      nameDe: 'Bangladesch',      flag: '🇧🇩', tier: 'other' },
  { code: 'BR', nameEn: 'Brazil',          nameDe: 'Brasilien',        flag: '🇧🇷', tier: 'other' },
  { code: 'BY', nameEn: 'Belarus',         nameDe: 'Belarus',          flag: '🇧🇾', tier: 'other' },
  { code: 'CI', nameEn: 'Côte d\'Ivoire',  nameDe: 'Elfenbeinküste',   flag: '🇨🇮', tier: 'other' },
  { code: 'CL', nameEn: 'Chile',           nameDe: 'Chile',            flag: '🇨🇱', tier: 'other' },
  { code: 'CM', nameEn: 'Cameroon',        nameDe: 'Kamerun',          flag: '🇨🇲', tier: 'other' },
  { code: 'CN', nameEn: 'China',           nameDe: 'China',            flag: '🇨🇳', tier: 'other' },
  { code: 'CO', nameEn: 'Colombia',        nameDe: 'Kolumbien',        flag: '🇨🇴', tier: 'other' },
  { code: 'DZ', nameEn: 'Algeria',         nameDe: 'Algerien',         flag: '🇩🇿', tier: 'other' },
  { code: 'EC', nameEn: 'Ecuador',         nameDe: 'Ecuador',          flag: '🇪🇨', tier: 'other' },
  { code: 'EG', nameEn: 'Egypt',           nameDe: 'Ägypten',          flag: '🇪🇬', tier: 'other' },
  { code: 'ET', nameEn: 'Ethiopia',        nameDe: 'Äthiopien',        flag: '🇪🇹', tier: 'other' },
  { code: 'GB', nameEn: 'United Kingdom',  nameDe: 'Vereinigtes Königreich', flag: '🇬🇧', tier: 'other',
    noteEn: 'Since Brexit, UK licences are no longer in the EU exchange agreement.',
    noteDe: 'Seit dem Brexit gilt der britische Führerschein nicht mehr als EU-Führerschein.' },
  { code: 'GE', nameEn: 'Georgia',         nameDe: 'Georgien',         flag: '🇬🇪', tier: 'other' },
  { code: 'GH', nameEn: 'Ghana',           nameDe: 'Ghana',            flag: '🇬🇭', tier: 'other' },
  { code: 'HK', nameEn: 'Hong Kong',       nameDe: 'Hongkong',         flag: '🇭🇰', tier: 'other' },
  { code: 'ID', nameEn: 'Indonesia',       nameDe: 'Indonesien',       flag: '🇮🇩', tier: 'other' },
  { code: 'IN', nameEn: 'India',           nameDe: 'Indien',           flag: '🇮🇳', tier: 'other' },
  { code: 'IQ', nameEn: 'Iraq',            nameDe: 'Irak',             flag: '🇮🇶', tier: 'other' },
  { code: 'IR', nameEn: 'Iran',            nameDe: 'Iran',             flag: '🇮🇷', tier: 'other' },
  { code: 'JO', nameEn: 'Jordan',          nameDe: 'Jordanien',        flag: '🇯🇴', tier: 'other' },
  { code: 'KE', nameEn: 'Kenya',           nameDe: 'Kenia',            flag: '🇰🇪', tier: 'other' },
  { code: 'KG', nameEn: 'Kyrgyzstan',      nameDe: 'Kirgisistan',      flag: '🇰🇬', tier: 'other' },
  { code: 'KZ', nameEn: 'Kazakhstan',      nameDe: 'Kasachstan',       flag: '🇰🇿', tier: 'other' },
  { code: 'LB', nameEn: 'Lebanon',         nameDe: 'Libanon',          flag: '🇱🇧', tier: 'other' },
  { code: 'LY', nameEn: 'Libya',           nameDe: 'Libyen',           flag: '🇱🇾', tier: 'other' },
  { code: 'MA', nameEn: 'Morocco',         nameDe: 'Marokko',          flag: '🇲🇦', tier: 'other' },
  { code: 'MD', nameEn: 'Moldova',         nameDe: 'Moldau',           flag: '🇲🇩', tier: 'other' },
  { code: 'MK', nameEn: 'North Macedonia', nameDe: 'Nordmazedonien',   flag: '🇲🇰', tier: 'other' },
  { code: 'MM', nameEn: 'Myanmar',         nameDe: 'Myanmar',          flag: '🇲🇲', tier: 'other' },
  { code: 'MX', nameEn: 'Mexico',          nameDe: 'Mexiko',           flag: '🇲🇽', tier: 'other' },
  { code: 'MY', nameEn: 'Malaysia',        nameDe: 'Malaysia',         flag: '🇲🇾', tier: 'other' },
  { code: 'NG', nameEn: 'Nigeria',         nameDe: 'Nigeria',          flag: '🇳🇬', tier: 'other' },
  { code: 'NP', nameEn: 'Nepal',           nameDe: 'Nepal',            flag: '🇳🇵', tier: 'other' },
  { code: 'PH', nameEn: 'Philippines',     nameDe: 'Philippinen',      flag: '🇵🇭', tier: 'other' },
  { code: 'PK', nameEn: 'Pakistan',        nameDe: 'Pakistan',         flag: '🇵🇰', tier: 'other' },
  { code: 'RU', nameEn: 'Russia',          nameDe: 'Russland',         flag: '🇷🇺', tier: 'other' },
  { code: 'SA', nameEn: 'Saudi Arabia',    nameDe: 'Saudi-Arabien',    flag: '🇸🇦', tier: 'other' },
  { code: 'SD', nameEn: 'Sudan',           nameDe: 'Sudan',            flag: '🇸🇩', tier: 'other' },
  { code: 'SN', nameEn: 'Senegal',         nameDe: 'Senegal',          flag: '🇸🇳', tier: 'other' },
  { code: 'SY', nameEn: 'Syria',           nameDe: 'Syrien',           flag: '🇸🇾', tier: 'other' },
  { code: 'TH', nameEn: 'Thailand',        nameDe: 'Thailand',         flag: '🇹🇭', tier: 'other' },
  { code: 'TJ', nameEn: 'Tajikistan',      nameDe: 'Tadschikistan',    flag: '🇹🇯', tier: 'other' },
  { code: 'TN', nameEn: 'Tunisia',         nameDe: 'Tunesien',         flag: '🇹🇳', tier: 'other' },
  { code: 'TR', nameEn: 'Turkey',          nameDe: 'Türkei',           flag: '🇹🇷', tier: 'other' },
  { code: 'TZ', nameEn: 'Tanzania',        nameDe: 'Tansania',         flag: '🇹🇿', tier: 'other' },
  { code: 'UA', nameEn: 'Ukraine',         nameDe: 'Ukraine',          flag: '🇺🇦', tier: 'other' },
  { code: 'UG', nameEn: 'Uganda',          nameDe: 'Uganda',           flag: '🇺🇬', tier: 'other' },
  { code: 'UZ', nameEn: 'Uzbekistan',      nameDe: 'Usbekistan',       flag: '🇺🇿', tier: 'other' },
  { code: 'VE', nameEn: 'Venezuela',       nameDe: 'Venezuela',        flag: '🇻🇪', tier: 'other' },
  { code: 'VN', nameEn: 'Vietnam',         nameDe: 'Vietnam',          flag: '🇻🇳', tier: 'other' },
  { code: 'YE', nameEn: 'Yemen',           nameDe: 'Jemen',            flag: '🇾🇪', tier: 'other' },
];

export const TIER_CONFIG = {
  eu: {
    labelEn: 'EU / EEA Member',
    labelDe: 'EU / EWR-Mitglied',
    badgeColor: 'emerald',
    iconEmoji: '🇪🇺',
    summaryEn: 'Your licence is automatically recognised in Germany. You only need to exchange it for a German one — no theory or practical test required.',
    summaryDe: 'Dein Führerschein wird in Deutschland automatisch anerkannt. Du musst ihn nur gegen einen deutschen umtauschen — keine Theorie- oder Praxisprüfung nötig.',
    stepsEn: [
      'Visit your local Führerscheinstelle (driving licence office)',
      'Bring your valid EU licence + passport/ID + biometric photo',
      'Pay the exchange fee (approx. €25–€35)',
      'Receive your German licence — usually within 2–4 weeks',
    ],
    stepsDe: [
      'Gehe zur zuständigen Führerscheinstelle',
      'Mitbringen: gültiger EU-Führerschein + Reisepass/Ausweis + biometrisches Foto',
      'Gebühr bezahlen (ca. 25–35 €)',
      'Deutschen Führerschein erhalten — in der Regel innerhalb von 2–4 Wochen',
    ],
    testsRequired: false,
    timelineEn: '2–4 weeks (admin only)',
    timelineDe: '2–4 Wochen (nur Verwaltung)',
  },
  annex11: {
    labelEn: 'Annex 11 Partner Country',
    labelDe: 'Anlage 11 Partnerland',
    badgeColor: 'blue',
    iconEmoji: '🤝',
    summaryEn: 'Germany has a simplified exchange agreement with your country (Anlage 11 FeV). No theory or practical test is required — you only need to complete the administrative process.',
    summaryDe: 'Deutschland hat mit deinem Land ein vereinfachtes Umschreibungsabkommen (Anlage 11 FeV). Keine Theorie- oder Praxisprüfung nötig — nur Verwaltungsprozess.',
    stepsEn: [
      'Book an appointment at your local Führerscheinstelle',
      'Bring: valid foreign licence + passport + biometric photo + certified German translation (if licence is not in Latin script)',
      'Submit a completed application form (Antrag auf Erteilung einer Fahrerlaubnis)',
      'Pay the fee (approx. €25–€50)',
      'Receive your German licence within 2–6 weeks',
    ],
    stepsDe: [
      'Termin bei der Führerscheinstelle vereinbaren',
      'Mitbringen: gültiger ausländischer Führerschein + Reisepass + Foto + beglaubigte Übersetzung (falls nicht lateinische Schrift)',
      'Ausgefüllten Antrag auf Erteilung einer Fahrerlaubnis einreichen',
      'Gebühr bezahlen (ca. 25–50 €)',
      'Deutschen Führerschein innerhalb von 2–6 Wochen erhalten',
    ],
    testsRequired: false,
    timelineEn: '2–6 weeks (admin only)',
    timelineDe: '2–6 Wochen (nur Verwaltung)',
  },
  other: {
    labelEn: 'Standard Conversion',
    labelDe: 'Vollständige Umschreibung',
    badgeColor: 'amber',
    iconEmoji: '📋',
    summaryEn: 'Your country is not in the EU/EEA or Anlage 11 list. You must pass both the theory exam and the practical driving test. However, mandatory driving hours (Pflichtstunden) are waived — you can go straight to tests.',
    summaryDe: 'Dein Land gehört nicht zur EU/EWR oder Anlage 11. Du musst Theorie- und Praxisprüfung ablegen. Aber: Pflichtstunden entfallen — du kannst direkt zur Prüfung.',
    stepsEn: [
      'Register at a German driving school (Fahrschule) — required to take the exams',
      'Study for the theory exam (Theorieprüfung) — 30 questions, max 10 wrong',
      'Pass the theory test at TÜV or DEKRA (approx. €22 fee)',
      'Complete enough practice drives to feel ready (no mandatory hours — your decision)',
      'Pass the practical exam (Fahrprüfung) — approx. €90–€120 fee',
      'Exchange your foreign licence at the Führerscheinstelle',
    ],
    stepsDe: [
      'Bei einer Fahrschule anmelden (Pflicht für die Prüfungsanmeldung)',
      'Für die Theorieprüfung lernen — 30 Fragen, max. 10 Fehler erlaubt',
      'Theorieprüfung bei TÜV oder DEKRA ablegen (ca. 22 €)',
      'Ausreichend Fahrstunden absolvieren (keine Pflichtstunden — deine Entscheidung)',
      'Fahrprüfung bestehen (ca. 90–120 €)',
      'Ausländischen Führerschein bei der Führerscheinstelle abgeben',
    ],
    testsRequired: true,
    timelineEn: '4–12 weeks depending on study speed',
    timelineDe: '4–12 Wochen je nach Lerngeschwindigkeit',
  },
} as const;
