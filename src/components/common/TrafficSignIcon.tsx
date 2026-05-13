/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import type { TrafficSign } from '../../types';
import oilDipstickImg from '../../assets/vehicle-checks/oil-dipstick.webp';
import tyreTreadImg from '../../assets/vehicle-checks/tyre-tread.webp';
import dashboardWarningsImg from '../../assets/vehicle-checks/dashboard-warnings.webp';
import carLightsImg from '../../assets/vehicle-checks/car-lights.webp';

interface TrafficSignIconProps {
  sign: TrafficSign;
  className?: string;
  noFrame?: boolean;
}

const svgClass = 'h-full w-full';

function SignFrame({ children, noFrame }: { children: React.ReactNode; noFrame?: boolean }) {
  if (noFrame) {
    return (
      <div className="flex h-full w-full items-center justify-center overflow-visible">
        {children}
      </div>
    );
  }
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-md ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:h-24 sm:w-24">
      {children}
    </div>
  );
}


function ParkingSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Blue plate with white border */}
      <rect x="6" y="6" width="52" height="52" rx="5" fill="#1a56db" />
      <rect x="9" y="9" width="46" height="46" rx="3" fill="none" stroke="#ffffff" strokeWidth="2" />
      <text
        x="32" y="44"
        textAnchor="middle"
        fontSize="36" fontWeight="800"
        fontFamily="Arial Black, Arial, sans-serif"
        fill="#ffffff"
      >P</text>
    </svg>
  );
}

function NoStoppingSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Zeichen 283 — circular blue with red cross-out */}
      <circle cx="32" cy="32" r="27" fill="#1a56db" />
      <circle cx="32" cy="32" r="27" fill="none" stroke="#d92d20" strokeWidth="7" />
      <line x1="19" y1="19" x2="45" y2="45" stroke="#d92d20" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function MotorwaySign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Blue plate with white border */}
      <rect x="6" y="6" width="52" height="52" rx="5" fill="#1a56db" />
      <rect x="9" y="9" width="46" height="46" rx="3" fill="none" stroke="#ffffff" strokeWidth="2" />
      {/* Motorway "A" road symbol */}
      <path d="M27 46V20L20 30v16" fill="#ffffff" />
      <path d="M37 46V20l7 10v16" fill="#ffffff" />
      <rect x="29" y="17" width="6" height="8" rx="2" fill="#ffffff" />
      <rect x="22" y="35" width="20" height="3" rx="1" fill="#ffffff" />
    </svg>
  );
}


function PedestrianCrossingSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="4" fill="#0f5bd8" />
      <polygon points="32,18 46,44 18,44" fill="#ffffff" />
      <circle cx="32" cy="27" r="3.2" fill="#111827" />
      <path d="M32 30l-3 5m3-5l4 4m-4 0l-5 6m5-6l6 6m-12 2h14" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function RoundaboutSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <circle cx="32" cy="32" r="24" fill="#0f5bd8" />
      <g transform="translate(32 32)">
        <path d="M0 -16c5 1 9 4 12 8l-4 1 7 5 2-9-4 1c-4-6-9-9-16-10l3 4z" fill="#ffffff" />
        <path d="M14 8c-3 4-7 7-13 8l2-4-9 3 7 6 1-4c7-1 13-4 18-10l-6 1z" fill="#ffffff" />
        <path d="M-14 8c-2-4-2-9 1-15l3 3-1-10-9 4 4 2c-3 6-3 13 1 19l1-6z" fill="#ffffff" />
      </g>
    </svg>
  );
}

/**
 * Zusatzzeichen (supplementary sign) showing which road has priority at the bending junction.
 * Rendered as a white square with a + cross, thick line = priority road.
 * Matches the official German StVO Zusatzzeichen 1000-series exactly.
 */
function BendingSubSign({ variant }: { variant?: string }) {
  const layout = variant || 'bottom-left';

  // The sub-sign sits at x=34..62, y=28..56 (a 28×28 square)
  const sx = 35; // sub-sign left
  const sy = 28; // sub-sign top
  const sw = 28; // sub-sign width/height (square)
  const cx = sx + sw / 2; // center x = 49
  const cy = sy + sw / 2; // center y = 42

  // Thin grey cross lines (all 4 arms of intersection)
  const tw = 1.2; // thin road stroke

  // Bold priority road stroke width
  const bw = 4.5;

  return (
    <g>
      {/* Sub-sign white rectangle with black border */}
      <rect x={sx} y={sy} width={sw} height={sw} rx="1.5" fill="#ffffff" stroke="#111827" strokeWidth="1.2" />

      {/* Thin lines: all 4 roads of the intersection (grey) */}
      <line x1={cx} y1={sy + 2} x2={cx} y2={cy - 2} stroke="#555" strokeWidth={tw} />
      <line x1={cx} y1={cy + 2} x2={cx} y2={sy + sw - 2} stroke="#555" strokeWidth={tw} />
      <line x1={sx + 2} y1={cy} x2={cx - 2} y2={cy} stroke="#555" strokeWidth={tw} />
      <line x1={cx + 2} y1={cy} x2={sx + sw - 2} y2={cy} stroke="#555" strokeWidth={tw} />

      {/* Bold black line: the priority road path */}
      {/* bottom-left: comes from bottom, bends left */}
      {layout === 'bottom-left' && (
        <path d={`M ${cx} ${sy + sw - 2} Q ${cx} ${cy} ${sx + 2} ${cy}`}
          fill="none" stroke="#111827" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* bottom-right: comes from bottom, bends right */}
      {layout === 'bottom-right' && (
        <path d={`M ${cx} ${sy + sw - 2} Q ${cx} ${cy} ${sx + sw - 2} ${cy}`}
          fill="none" stroke="#111827" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* top-left: comes from top, bends left */}
      {layout === 'top-left' && (
        <path d={`M ${cx} ${sy + 2} Q ${cx} ${cy} ${sx + 2} ${cy}`}
          fill="none" stroke="#111827" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* top-right: comes from top, bends right */}
      {layout === 'top-right' && (
        <path d={`M ${cx} ${sy + 2} Q ${cx} ${cy} ${sx + sw - 2} ${cy}`}
          fill="none" stroke="#111827" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* left-top: comes from left, bends up */}
      {layout === 'left-top' && (
        <path d={`M ${sx + 2} ${cy} Q ${cx} ${cy} ${cx} ${sy + 2}`}
          fill="none" stroke="#111827" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* left-bottom: comes from left, bends down */}
      {layout === 'left-bottom' && (
        <path d={`M ${sx + 2} ${cy} Q ${cx} ${cy} ${cx} ${sy + sw - 2}`}
          fill="none" stroke="#111827" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* right-top: comes from right, bends up */}
      {layout === 'right-top' && (
        <path d={`M ${sx + sw - 2} ${cy} Q ${cx} ${cy} ${cx} ${sy + 2}`}
          fill="none" stroke="#111827" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* right-bottom: comes from right, bends down */}
      {layout === 'right-bottom' && (
        <path d={`M ${sx + sw - 2} ${cy} Q ${cx} ${cy} ${cx} ${sy + sw - 2}`}
          fill="none" stroke="#111827" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* straight left-right */}
      {layout === 'priority-left-right' && (
        <line x1={sx + 2} y1={cy} x2={sx + sw - 2} y2={cy}
          stroke="#111827" strokeWidth={bw} strokeLinecap="round" />
      )}
      {/* straight top-bottom */}
      {layout === 'priority-top-bottom' && (
        <line x1={cx} y1={sy + 2} x2={cx} y2={sy + sw - 2}
          stroke="#111827" strokeWidth={bw} strokeLinecap="round" />
      )}
    </g>
  );
}

/**
 * Priority road sign (yellow diamond) stacked above the Zusatzzeichen.
 * Layout: post | [diamond on left] [sub-sign on right] — matching reference image.
 */
function BendingPrioritySign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 70 64" className={svgClass} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Vertical post */}
      <rect x="30" y="0" width="2.5" height="64" fill="#6b7280" />

      {/* Yellow priority diamond — centered left portion (x=2..30) */}
      <g transform="translate(16 18) rotate(45) translate(-16 -18)">
        <rect x="4" y="6" width="24" height="24" fill="#ffffff" stroke="#111827" strokeWidth="1.2" />
        <rect x="7" y="9" width="18" height="18" fill="#f9c802" />
      </g>

      {/* Zusatzzeichen sub-sign */}
      <BendingSubSign variant={variant} />
    </svg>
  );
}

/**
 * Yield sign (inverted red triangle) with Zusatzzeichen below.
 */
function YieldBendingSign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 70 64" className={svgClass} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Vertical post */}
      <rect x="30" y="0" width="2.5" height="64" fill="#6b7280" />

      {/* Yield triangle — centered in left portion */}
      <g transform="translate(16 16) scale(0.55) translate(-32 -16)">
        <polygon points="8,4 56,4 32,40" fill="#d92d20" />
        <polygon points="16,8 48,8 32,34" fill="#ffffff" />
      </g>

      {/* Zusatzzeichen sub-sign */}
      <BendingSubSign variant={variant} />
    </svg>
  );
}

/**
 * Stop sign (red octagon) with Zusatzzeichen below.
 */
function StopBendingSign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 70 64" className={svgClass} aria-hidden="true" style={{ overflow: 'visible' }}>
      {/* Vertical post */}
      <rect x="30" y="0" width="2.5" height="64" fill="#6b7280" />

      {/* Stop octagon — centered in left portion */}
      <g transform="translate(16 16) scale(0.52) translate(-32 -16)">
        <path
          d="M22 2h20l12 12v20L42 46H22L10 34V14L22 2z"
          fill="#d92d20"
          stroke="#ffffff"
          strokeWidth="2.5"
        />
        <text x="32" y="30" textAnchor="middle" fontSize="13" fontWeight="900"
          fill="#ffffff" fontFamily="Arial Black, Arial, sans-serif" letterSpacing="-0.5">
          STOP
        </text>
      </g>

      {/* Zusatzzeichen sub-sign */}
      <BendingSubSign variant={variant} />
    </svg>
  );
}


/**
 * Zeichen 206: Stopp! Vorfahrt gewähren.
 * Classic octagonal shape with red background and white border.
 */
function StopSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Zeichen 206 — Red octagon, white outer border, white inner ring */}
      <path
        d="M21 3h22l15 15v22L43 55H21L6 40V18L21 3z"
        fill="#d92d20"
      />
      <path
        d="M21 3h22l15 15v22L43 55H21L6 40V18L21 3z"
        fill="none" stroke="#ffffff" strokeWidth="3"
      />
      <path
        d="M23 9h18l10 10v18L41 47H23L13 37V19L23 9z"
        fill="none" stroke="#ffffff" strokeWidth="1.5"
      />
      <text
        x="32" y="32"
        textAnchor="middle" dominantBaseline="central"
        fontSize="14" fontWeight="900"
        fill="#ffffff" fontFamily="Arial Black, Arial, sans-serif"
        letterSpacing="0.5"
      >STOP</text>
    </svg>
  );
}

function YieldSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Zeichen 205 — Inverted red triangle with white inner ring */}
      <polygon points="32,5 61,57 3,57" fill="#d92d20" />
      <polygon points="32,5 61,57 3,57" fill="none" stroke="#ffffff" strokeWidth="3" />
      <polygon points="32,16 52,51 12,51" fill="#ffffff" />
      <polygon points="32,16 52,51 12,51" fill="none" stroke="#d92d20" strokeWidth="1" />
    </svg>
  );
}

/**
 * Zeichen 220: Einbahnstraße (One-Way Street).
 * Blue square with a white horizontal arrow pointing in the direction of travel.
 */
function OneWaySign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Zeichen 220 — Blue plate, white arrow */}
      <rect x="4" y="18" width="56" height="28" rx="4" fill="#1a56db" />
      <rect x="7" y="21" width="50" height="22" rx="2" fill="none" stroke="#ffffff" strokeWidth="1.5" />
      <path d="M12 32h28" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
      <path d="M34 23l14 9-14 9" fill="#ffffff" />
    </svg>
  );
}

function PriorityRoadSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Zeichen 306 — Yellow diamond with white border and black outline */}
      <g transform="translate(32 32) rotate(45) translate(-32 -32)">
        <rect x="9" y="9" width="46" height="46" fill="#111827" rx="2" />
        <rect x="11" y="11" width="42" height="42" fill="#ffffff" rx="1" />
        <rect x="15" y="15" width="34" height="34" fill="#f9c802" rx="1" />
      </g>
    </svg>
  );
}

/**
 * Zeichen 267: Verbot der Einfahrt (No Entry).
 * Red circle with a white horizontal bar.
 */
function NoEntrySign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Zeichen 267 — Red circle, white border ring, white horizontal bar */}
      <circle cx="32" cy="32" r="28" fill="#d92d20" />
      <circle cx="32" cy="32" r="28" fill="none" stroke="#ffffff" strokeWidth="3" />
      <circle cx="32" cy="32" r="23" fill="none" stroke="#ffffff" strokeWidth="1" />
      <rect x="12" y="27" width="40" height="10" rx="1" fill="#ffffff" />
    </svg>
  );
}

/**
 * Zusatzzeichen 1022-10: Radfahrer frei (Cyclists allowed).
 * Supplementary sign indicating cyclists may travel against the one-way direction.
 */
function CyclistsAllowedSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="4" y="10" width="56" height="44" rx="4" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
      <g transform="translate(32 26) scale(0.7) translate(-32 -32)">
        <path d="M12 28a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M52 28a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" fill="none" stroke="#111827" strokeWidth="4"/>
        <path d="M12 22l10-12h20l10 12 M32 10v6 M24 16h16" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round"/>
      </g>
      <text x="32" y="44" textAnchor="middle" fontSize="10" fontWeight="700" fill="#111827">frei</text>
    </svg>
  );
}

/**
 * Zeichen 720: Grünpfeil (Green Arrow Sign).
 * Metal sign next to a red light allowing right turn after stopping.
 */
function GreenArrowSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Zeichen 720 — Dark metal plate, green arrow */}
      <rect x="6" y="6" width="52" height="52" rx="5" fill="#1f2937" />
      <rect x="9" y="9" width="46" height="46" rx="3" fill="none" stroke="#374151" strokeWidth="1.5" />
      <path d="M14 32h26" stroke="#22c55e" strokeWidth="7" strokeLinecap="round" />
      <path d="M34 20l16 12-16 12" fill="#22c55e" />
    </svg>
  );
}

/**
 * Lichtzeichen: Grüner Pfeil (Green Arrow Signal).
 * Traffic light variant where the green light is an arrow shape.
 */
function GreenArrowSignal() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="22" y="10" width="20" height="44" rx="3" fill="#111827" />
      <circle cx="32" cy="18" r="4" fill="#374151" />
      <circle cx="32" cy="32" r="4" fill="#374151" />
      <g transform="translate(32 46)">
        <path d="M-4 0h8 M2 -4l4 4-4 4" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

function VehicleCheckImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full rounded-lg object-cover"
      loading="lazy"
    />
  );
}

function FallbackSign({ code }: { code?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="12" fill="#e2e8f0" />
      <text
        x="32"
        y="36"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#334155"
      >
        {code ?? 'StVO'}
      </text>
    </svg>
  );
}

/**
 * Maps a TrafficSign object to its visual representation.
 * Prioritizes matching by ID (defined in curriculum.ts), 
 * falls back to StVO code matching for robustness.
 */
function getSignGraphic(sign: TrafficSign) {
  switch (sign.id) {
    case 'sign-yield':
      return <YieldSign />;
    case 'sign-parking':
      return <ParkingSign />;
    case 'sign-no-stopping':
      return <NoStoppingSign />;
    case 'sign-motorway':
      return <MotorwaySign />;
    case 'sign-roundabout':
      return <RoundaboutSign />;
    case 'sign-crosswalk':
      return <PedestrianCrossingSign />;
    case 'sign-bending-priority':
      return <BendingPrioritySign variant={sign.variant} />;
    case 'sign-priority-road':
      return <PriorityRoadSign />;
    case 'sign-green-arrow':
      return <GreenArrowSign />;
    case 'sign-stop':
      return <StopSign />;
    case 'sign-one-way':
      return <OneWaySign />;
    case 'sign-no-entry':
      return <NoEntrySign />;
    case 'sign-cyclists-allowed':
      return <CyclistsAllowedSign />;
    case 'sign-green-arrow-signal':
      return <GreenArrowSignal />;
    case 'sign-yield-bending':
      return <YieldBendingSign variant={sign.variant} />;
    case 'sign-stop-bending':
      return <StopBendingSign variant={sign.variant} />;
    case 'visual-dipstick':
      return <VehicleCheckImage src={oilDipstickImg} alt="Oil dipstick check" />;
    case 'visual-tyre':
      return <VehicleCheckImage src={tyreTreadImg} alt="Tyre tread inspection" />;
    case 'visual-dashboard':
      return <VehicleCheckImage src={dashboardWarningsImg} alt="Dashboard warning lights" />;
    case 'visual-lights':
      return <VehicleCheckImage src={carLightsImg} alt="Car lights check" />;
    default:
      if (sign.code === 'Zeichen 205') return <YieldSign />;
      if (sign.code === 'Zeichen 314') return <ParkingSign />;
      if (sign.code === 'Zeichen 283') return <NoStoppingSign />;
      if (sign.code === 'Zeichen 330.1') return <MotorwaySign />;
      if (sign.code === 'Zeichen 215') return <RoundaboutSign />;
      if (sign.code === 'Zeichen 350') return <PedestrianCrossingSign />;
      if (sign.code === 'Zeichen 306') return <PriorityRoadSign />;
      if (sign.code === 'Zeichen 206') return <StopSign />;
      if (sign.code === 'Zeichen 220') return <OneWaySign />;
      if (sign.code === 'Zeichen 267') return <NoEntrySign />;
      if (sign.code === 'Zusatzzeichen 1022-10') return <CyclistsAllowedSign />;
      if (sign.code === 'Zeichen 720') return <GreenArrowSign />;
      if (sign.code === 'Lichtzeichen') return <GreenArrowSignal />;
      return <FallbackSign code={sign.code} />;
  }
}

export function TrafficSignIcon({ sign, noFrame }: TrafficSignIconProps) {
  return <SignFrame noFrame={noFrame}>{getSignGraphic(sign)}</SignFrame>;
}
