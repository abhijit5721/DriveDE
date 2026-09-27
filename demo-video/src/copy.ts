/** Captions per language. Honesty rules (DRI-14): real footage, concrete numbers, no "guaranteed pass".
 *  27 Sep: aligned with the landing page (600 € failed attempt, one-time passes), no 3D and no app-store claims. */
export type Lang = 'de' | 'en';

export const COPY: Record<Lang, {
  hook: string;
  tracker: string;
  readiness: string;
  curriculum: string;
  maneuvers: string;
  devices: string;
  ctaTitle: string;
  ctaSub: string;
  domain: string;
}> = {
  en: {
    hook: 'Practise the situations most learners fail on.',
    tracker: 'Track every real lesson: GPS route + one-tap mistake log',
    readiness: 'Your exam readiness after every drive, in clear numbers',
    curriculum: 'A structured path through every Sonderfahrt & maneuver',
    maneuvers: 'Every maneuver step by step, before the real car',
    devices: 'In the browser on phone and laptop, nothing to install',
    ctaTitle: 'A failed test can quickly cost up to €600.',
    ctaSub: 'Free to start · Pro passes from €9.99 one-time, no subscription',
    domain: 'drivede.app',
  },
  de: {
    hook: 'Übe die Situationen, an denen die meisten scheitern.',
    tracker: 'Jede Fahrstunde tracken: GPS-Route + Fehler-Log per Tipp',
    readiness: 'Deine Prüfungsreife nach jeder Fahrt, klar in Zahlen',
    curriculum: 'Strukturierter Weg durch alle Sonderfahrten & Manöver',
    maneuvers: 'Jedes Manöver Schritt für Schritt, vor dem echten Auto',
    devices: 'Im Browser auf Handy und Laptop, ohne Installation',
    ctaTitle: 'Ein Fehlversuch kostet schnell bis zu 600 €.',
    ctaSub: 'Kostenlos starten · Pro-Pässe ab 9,99 € einmalig, kein Abo',
    domain: 'drivede.app',
  },
};
