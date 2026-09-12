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

function IntersectionArt() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <rect width="120" height="120" fill="#dcfce7" />
      <rect x="45" y="0" width="30" height="120" fill="#334155" />
      <rect x="0" y="45" width="120" height="30" fill="#334155" />
      <rect x="45" y="45" width="30" height="30" fill="none" stroke="#fff" strokeWidth="1.5" />
      <rect x="80" y="54" width="18" height="12" rx="3" fill="#3b82f6" />
      <rect x="54" y="82" width="12" height="18" rx="3" fill="#ef4444" />
    </svg>
  );
}

function RoundaboutArt() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <rect width="120" height="120" fill="#dcfce7" />
      <rect x="48" y="0" width="24" height="120" fill="#334155" />
      <rect x="0" y="48" width="120" height="24" fill="#334155" />
      <circle cx="60" cy="60" r="40" fill="#334155" />
      <circle cx="60" cy="60" r="16" fill="#15803d" />
      <circle cx="60" cy="60" r="28" fill="none" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
      <rect x="54" y="92" width="12" height="18" rx="3" fill="#ef4444" />
    </svg>
  );
}

function ParkingArt() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <rect width="120" height="120" fill="#e2e8f0" />
      <rect x="0" y="0" width="120" height="22" fill="#94a3b8" />
      <rect x="8" y="28" width="30" height="16" rx="4" fill="#0f172a" />
      <rect x="82" y="28" width="30" height="16" rx="4" fill="#c2a878" />
      <rect x="40" y="62" width="30" height="16" rx="4" fill="#16a34a" transform="rotate(25 55 70)" />
      <path d="M 70 68 Q 60 40 62 34" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}

function MirrorArt() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <rect width="120" height="120" fill="#e0f2fe" />
      <rect x="20" y="70" width="80" height="30" rx="8" fill="#1e293b" />
      <rect x="30" y="40" width="60" height="30" rx="6" fill="#0f172a" />
      <rect x="12" y="50" width="14" height="8" rx="2" fill="#1e293b" />
      <rect x="94" y="50" width="14" height="8" rx="2" fill="#1e293b" />
      <circle cx="60" cy="55" r="7" fill="#fbbf24" />
      <path d="M 60 55 L 96 30" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
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
