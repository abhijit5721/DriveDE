/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * seoSchema.ts
 *
 * Language-matched Schema.org structured data. The static index.html ships the
 * German block (the default page language); when the app renders in English —
 * the ?lang=en hreflang alternate targeted at expats — the JSON-LD is swapped
 * so crawlers see a description in the same language as the page content.
 */

const BASE = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  url: 'https://www.drivede.app',
  applicationCategory: 'EducationApplication',
  operatingSystem: 'Web, iOS, Android',
  inLanguage: ['de', 'en'],
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '0',
    highPrice: '29.99',
    priceCurrency: 'EUR',
    offerCount: '4',
  },
  screenshot: 'https://www.drivede.app/icons/icon-512.png',
  author: {
    '@type': 'Organization',
    name: 'DriveDE',
    url: 'https://www.drivede.app',
    // ties the social profiles to the brand for knowledge-panel/entity SEO
    sameAs: [
      'https://www.tiktok.com/@drivede20',
      'https://www.instagram.com/drivedeapp/',
      'https://www.youtube.com/@drivedeapp',
    ],
  },
};

const SCHEMA_DE = {
  ...BASE,
  name: 'DriveDE – Führerschein & Fahrschule App',
  description:
    'Kostenlose Führerschein App für Deutschland: Theorie lernen, Fahrstunden per GPS aufzeichnen, KI-Auswertungen erhalten und die Fahrprüfung im ersten Versuch bestehen. Inklusive Umschreibungs-Modus für ausländische Führerscheine.',
  featureList: [
    'GPS Fahrstunden-Tracking mit Tempolimit-Warnungen',
    'KI-Fahrlehrer Auswertungen nach jeder Fahrt',
    '3D Manöversimulationen (Einparken, Autobahn)',
    'Objektive Prüfungsreife-Anzeige',
    'Theorie-Lehrplan',
    'Umschreibungs-Modus für ausländische Führerscheine',
  ],
};

const SCHEMA_EN = {
  ...BASE,
  name: 'DriveDE – German Driving License App',
  description:
    'The free app for your German driving license: learn theory, track driving lessons via GPS, get AI instructor debriefings, and pass your Fahrprüfung on the first try. Includes an Umschreibung mode that guides foreign license holders through conversion, country by country.',
  featureList: [
    'GPS driving lesson tracking with speed limit warnings',
    'AI instructor debriefings after every drive',
    '3D maneuver simulations (parking, Autobahn)',
    'Objective exam readiness score',
    'Theory curriculum',
    'Umschreibung mode for foreign license conversion',
  ],
};

/** Replaces the page's JSON-LD block to match the active language. */
export function syncStructuredData(language: string): void {
  const script = document.querySelector('script[type="application/ld+json"]');
  if (!script) return;
  script.textContent = JSON.stringify(language === 'de' ? SCHEMA_DE : SCHEMA_EN);
}
