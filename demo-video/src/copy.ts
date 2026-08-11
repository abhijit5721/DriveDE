/** Captions per language. Honesty rules (DRI-14): real footage, concrete numbers, no "guaranteed pass". */
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
    hook: 'Know the exact day you’re ready to pass your Fahrprüfung.',
    tracker: 'Track every real lesson — GPS + live speed limits',
    readiness: 'An objective exam-readiness score. Not a gut feeling.',
    curriculum: 'A structured path through every Sonderfahrt & maneuver',
    maneuvers: 'Practice Einparken in 3D — before the real car',
    devices: 'Everything syncs — Web, iOS & Android',
    ctaTitle: 'Save €800–€1,200 on driving lessons.',
    ctaSub: '7-day free Pro trial · No credit card required',
    domain: 'drivede.app',
  },
  de: {
    hook: 'Wisse genau, wann du bereit für die Fahrprüfung bist.',
    tracker: 'Jede Fahrstunde tracken — GPS + Tempolimits live',
    readiness: 'Objektiver Prüfungs-Score. Kein Bauchgefühl.',
    curriculum: 'Strukturierter Weg durch alle Sonderfahrten & Manöver',
    maneuvers: 'Einparken in 3D üben — vor dem echten Auto',
    devices: 'Alles synchron — Web, iOS & Android',
    ctaTitle: 'Spare 800–1.200 € an Fahrstunden.',
    ctaSub: '7 Tage Pro gratis testen · Keine Kreditkarte nötig',
    domain: 'drivede.app',
  },
};
