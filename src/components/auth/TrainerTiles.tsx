/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * TrainerTiles (DRI-45): the trainers, directly under the hero, before any
 * explanation. Each tile is a small static diagram with a one-line caption and
 * a "Try it" that opens the public trainer ladder at the matching rung. The
 * two that need an account say so on the tile instead of hiding it.
 */
import { ArrowRight, Lock } from 'lucide-react';
import type { Rung } from './TrainerLadder';

interface TrainerTilesProps {
  language: 'de' | 'en';
  onOpen: (rung: Rung, trainer: string) => void;
  onLockedAccount: () => void;
}

/* One art style for all four tiles (27 Sep): the brand navy surface of the hero,
   dark roads with faint markings, YOUR car in brand blue and every other car in
   muted slate. The tiles used to be mint, grey and light blue with red, green and
   yellow accents, four looks that matched nothing else on the page. */
const ART = {
  road: '#1e293b',
  edge: '#334155',
  mark: 'rgba(255,255,255,0.28)',
  you: '#3b82f6',
  youGlow: 'rgba(59,130,246,0.45)',
  other: '#64748b',
  hint: '#93c5fd',
};

function ArtFrame({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="55%" stopColor="#12234d" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={ART.youGlow} />
        </filter>
      </defs>
      <rect width="120" height="120" fill={`url(#${id}-bg)`} />
      {children}
    </svg>
  );
}

/** Your car: brand blue with a soft glow, so it is the first thing the eye finds. */
function YouCar({ id, x, y, w, h, rotate }: { id: string; x: number; y: number; w: number; h: number; rotate?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx="3" fill={ART.you} filter={`url(#${id}-glow)`} transform={rotate} />;
}

function IntersectionArt() {
  const id = 'art-vorfahrt';
  return (
    <ArtFrame id={id}>
      <rect x="45" y="0" width="30" height="120" fill={ART.road} />
      <rect x="0" y="45" width="120" height="30" fill={ART.road} />
      <path d="M60 0 V40 M60 80 V120 M0 60 H40 M80 60 H120" stroke={ART.mark} strokeWidth="1.2" strokeDasharray="4 4" />
      <rect x="45" y="45" width="30" height="30" fill="none" stroke={ART.edge} strokeWidth="1" />
      {/* the car from the right has priority; you wait at the bottom */}
      <rect x="82" y="47" width="18" height="11" rx="3" fill={ART.other} />
      <YouCar id={id} x={62} y={84} w={11} h={18} />
    </ArtFrame>
  );
}

function RoundaboutArt() {
  const id = 'art-roundabout';
  return (
    <ArtFrame id={id}>
      <rect x="48" y="0" width="24" height="120" fill={ART.road} />
      <rect x="0" y="48" width="120" height="24" fill={ART.road} />
      {/* One circular lane, no marking inside it; the lighter band is the Innenring
          (overrun strip for long vehicles), not a lane divider. */}
      <circle cx="60" cy="60" r="40" fill={ART.road} />
      <circle cx="60" cy="60" r="26" fill={ART.edge} />
      <circle cx="60" cy="60" r="21" fill="#12234d" />
      {/* anticlockwise, passing the island on its right */}
      <path d="M 88 44 A 33 33 0 0 0 44 32" fill="none" stroke={ART.hint} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
      <rect x="84" y="46" width="11" height="17" rx="3" fill={ART.other} transform="rotate(-30 89 54)" />
      <YouCar id={id} x={54} y={92} w={12} h={18} />
    </ArtFrame>
  );
}

function ParkingArt() {
  const id = 'art-parking';
  return (
    <ArtFrame id={id}>
      <rect x="0" y="0" width="120" height="20" fill="#0b1220" opacity="0.6" />
      <path d="M0 20 H120" stroke={ART.edge} strokeWidth="2" />
      <rect x="0" y="22" width="120" height="98" fill={ART.road} opacity="0.55" />
      <path d="M0 96 H120" stroke={ART.mark} strokeWidth="1.2" strokeDasharray="6 5" />
      <rect x="8" y="28" width="30" height="16" rx="4" fill={ART.other} />
      <rect x="82" y="28" width="30" height="16" rx="4" fill={ART.other} />
      <path d="M 70 68 Q 60 40 62 34" fill="none" stroke={ART.hint} strokeWidth="2" strokeDasharray="3 3" />
      <YouCar id={id} x={40} y={62} w={30} h={16} rotate="rotate(25 55 70)" />
    </ArtFrame>
  );
}

function MirrorArt() {
  const id = 'art-mirror';
  return (
    <ArtFrame id={id}>
      {/* your car seen from above: the head turns, the sight line reaches the blind spot */}
      <rect x="0" y="0" width="120" height="120" fill={ART.road} opacity="0.35" />
      <path d="M78 0 V120" stroke={ART.mark} strokeWidth="1.2" strokeDasharray="6 5" />
      <rect x="40" y="50" width="30" height="48" rx="8" fill={ART.you} filter={`url(#${id}-glow)`} />
      <rect x="44" y="58" width="22" height="13" rx="3" fill="#0b1220" opacity="0.55" />
      <rect x="35" y="62" width="6" height="4" rx="1.5" fill={ART.you} />
      <rect x="69" y="62" width="6" height="4" rx="1.5" fill={ART.you} />
      <circle cx="55" cy="64" r="4" fill="#e2e8f0" />
      <path d="M 58 66 L 88 84" stroke={ART.hint} strokeWidth="2" strokeDasharray="3 3" />
      <rect x="84" y="80" width="16" height="26" rx="4" fill={ART.other} />
    </ArtFrame>
  );
}

export function TrainerTiles({ language, onOpen, onLockedAccount }: TrainerTilesProps) {
  const de = language === 'de';
  const tiles: Array<{ key: string; rung: Rung | null; title: string; caption: string; art: React.ReactNode }> = [
    { key: 'vorfahrt', rung: 1, title: de ? 'Rechts vor links' : 'Right before left', caption: de ? 'Drei Kreuzungen. Tippe die Autos in der richtigen Reihenfolge an.' : 'Three intersections. Tap the cars in the right order.', art: <IntersectionArt /> },
    { key: 'roundabout', rung: 2, title: de ? 'Kreisverkehr' : 'Roundabout', caption: de ? 'Einfahren ohne Blinker, ausfahren mit. Einmal richtig machen.' : 'Enter without a signal, leave with one. Get it right once.', art: <RoundaboutArt /> },
    { key: 'parking', rung: 3, title: de ? 'Einparken' : 'Parallel parking', caption: de ? 'Fünf Referenzpunkte in fester Reihenfolge.' : 'Five reference points in a fixed order.', art: <ParkingArt /> },
    { key: 'mirror', rung: null, title: de ? 'Schulterblick' : 'Shoulder check', caption: de ? 'Wann der Prüfer den Kopf sehen will, und wann nicht.' : 'When the examiner wants to see your head turn, and when not.', art: <MirrorArt /> },
  ];

  return (
    <section id="trainers" className="relative z-10 bg-white px-6 pb-20 pt-4 sm:pt-8" data-testid="trainer-tiles">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-4xl">
            {de ? 'Die Trainer. Kostenlos, ohne Anmeldung.' : 'The trainers. Free, no account needed.'}
          </h2>
          <p className="mt-3 text-slate-600">
            {de ? 'Zwei davon direkt hier, ohne Konto. Die anderen mit Konto, sieben Tage kostenlos.' : 'Two of them right here, no account. The rest with an account, free for seven days.'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {tiles.map((tile) => {
            const locked = tile.rung === 3 || tile.rung === null;
            return (
              <button
                key={tile.key}
                type="button"
                data-testid={`tile-${tile.key}`}
                onClick={() => (tile.rung === null ? onLockedAccount() : onOpen(tile.rung, tile.key))}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  {tile.art}
                  {locked && (
                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-bold text-white">
                      <Lock className="h-3 w-3" />
                      {de ? 'Mit Konto' : 'With account'}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">{tile.title}</h3>
                  <p className="mt-1 flex-1 text-xs text-slate-500 sm:text-sm">{tile.caption}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:gap-2">
                    {locked ? (de ? 'Freischalten' : 'Unlock') : (de ? 'Ausprobieren' : 'Try it')}
                    <ArrowRight className="h-4 w-4 transition-all" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
