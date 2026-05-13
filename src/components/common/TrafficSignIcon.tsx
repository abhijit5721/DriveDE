/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * TrafficSignIcon.tsx
 * Renders authentic German StVO traffic signs as SVG.
 * Each sign matches the official visual specification as seen on real German roads.
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
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 sm:h-24 sm:w-24">
      {children}
    </div>
  );
}

// ─── Zeichen 205 – Vorfahrt gewähren (Yield) ─────────────────────────────────
// Inverted red triangle, white fill inside, red outer frame, white border stripe
function YieldSign() {
  return (
    <svg viewBox="0 0 100 90" className={svgClass} aria-hidden="true">
      {/* Red outer triangle */}
      <polygon points="50,4 97,86 3,86" fill="#CC0000" />
      {/* White border stripe (inner) */}
      <polygon points="50,14 89,80 11,80" fill="white" />
      {/* Red inner triangle */}
      <polygon points="50,22 83,76 17,76" fill="#CC0000" />
      {/* White center fill */}
      <polygon points="50,30 77,72 23,72" fill="white" />
    </svg>
  );
}

// ─── Zeichen 206 – Halt! Vorfahrt gewähren (Stop) ────────────────────────────
// Red octagon, white border, white STOP text
function StopSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      {/* White background octagon (border) */}
      <polygon points="32,4 68,4 96,32 96,68 68,96 32,96 4,68 4,32" fill="white" />
      {/* Red octagon fill */}
      <polygon points="34,8 66,8 92,34 92,66 66,92 34,92 8,66 8,34" fill="#CC0000" />
      {/* Thin white inner ring */}
      <polygon points="36,13 64,13 87,36 87,64 64,87 36,87 13,64 13,36"
        fill="none" stroke="white" strokeWidth="2" />
      {/* STOP text */}
      <text x="50" y="58" textAnchor="middle" dominantBaseline="middle"
        fontSize="22" fontWeight="900" fill="white"
        fontFamily="'Arial Black', Arial, Helvetica, sans-serif" letterSpacing="1">
        STOP
      </text>
    </svg>
  );
}

// ─── Zeichen 306 – Vorfahrtstraße (Priority Road) ────────────────────────────
// Yellow diamond with black+white border
function PriorityRoadSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      {/* Black outer diamond */}
      <rect x="10" y="10" width="80" height="80" rx="3"
        transform="rotate(45 50 50)" fill="#1a1a1a" />
      {/* White ring */}
      <rect x="14" y="14" width="72" height="72" rx="2"
        transform="rotate(45 50 50)" fill="white" />
      {/* Yellow inner diamond */}
      <rect x="18" y="18" width="64" height="64" rx="2"
        transform="rotate(45 50 50)" fill="#F5A800" />
    </svg>
  );
}

// ─── Zeichen 215 – Kreisverkehr (Roundabout) ─────────────────────────────────
// Blue circle, three white curved arrows going counter-clockwise
function RoundaboutSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      {/* Blue circle with white border */}
      <circle cx="50" cy="50" r="46" fill="white" />
      <circle cx="50" cy="50" r="44" fill="#003399" />
      {/* Three CCW arrows */}
      <g fill="white">
        {/* Top arrow pointing left */}
        <path d="M50,20 A24,24 0 0,0 26,44 L22,44 L30,36 L38,44 L34,44 A16,16 0 0,1 50,28 Z" />
        {/* Right arrow pointing down */}
        <path d="M80,50 A24,24 0 0,0 56,74 L56,78 L64,70 L56,62 L56,66 A16,16 0 0,1 72,50 Z" />
        {/* Bottom-left arrow pointing up-right */}
        <path d="M20,56 A24,24 0 0,0 44,74 L40,78 L50,74 L44,64 L44,68 A16,16 0 0,1 28,50 Z" />
      </g>
      {/* Center white circle */}
      <circle cx="50" cy="50" r="12" fill="#003399" />
      <circle cx="50" cy="50" r="9" fill="white" opacity="0.3" />
    </svg>
  );
}

// ─── Zeichen 350 – Fußgängerüberweg (Pedestrian Crossing / Zebra) ────────────
// Blue square sign, white walking figure + zebra stripes
function PedestrianCrossingSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      {/* Blue square with white border */}
      <rect x="4" y="4" width="92" height="92" rx="5" fill="white" />
      <rect x="6" y="6" width="88" height="88" rx="4" fill="#003399" />
      {/* Zebra stripes at bottom */}
      {[0,1,2,3].map(i => (
        <rect key={i} x={22 + i * 14} y="72" width="8" height="16" rx="1" fill="white" />
      ))}
      {/* Walking figure */}
      {/* Head */}
      <circle cx="45" cy="24" r="7" fill="white" />
      {/* Body */}
      <line x1="45" y1="31" x2="45" y2="52" stroke="white" strokeWidth="5" strokeLinecap="round" />
      {/* Left arm */}
      <line x1="45" y1="38" x2="32" y2="46" stroke="white" strokeWidth="4" strokeLinecap="round" />
      {/* Right arm */}
      <line x1="45" y1="38" x2="58" y2="36" stroke="white" strokeWidth="4" strokeLinecap="round" />
      {/* Left leg */}
      <line x1="45" y1="52" x2="36" y2="68" stroke="white" strokeWidth="4" strokeLinecap="round" />
      {/* Right leg */}
      <line x1="45" y1="52" x2="56" y2="68" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Zeichen 220 – Einbahnstraße (One-Way Street) ────────────────────────────
// Blue rectangle, bold white arrow pointing right
function OneWaySign() {
  return (
    <svg viewBox="0 0 120 60" className={svgClass} aria-hidden="true">
      <rect x="2" y="2" width="116" height="56" rx="5" fill="white" />
      <rect x="4" y="4" width="112" height="52" rx="4" fill="#003399" />
      {/* Bold white arrow */}
      <path d="M16,30 L78,30" stroke="white" strokeWidth="14" strokeLinecap="round" />
      <polygon points="74,14 106,30 74,46" fill="white" />
    </svg>
  );
}

// ─── Zeichen 267 – Verbot der Einfahrt (No Entry) ────────────────────────────
// Red circle, white horizontal bar
function NoEntrySign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      {/* White border ring */}
      <circle cx="50" cy="50" r="47" fill="white" />
      {/* Red circle */}
      <circle cx="50" cy="50" r="45" fill="#CC0000" />
      {/* White horizontal bar */}
      <rect x="14" y="38" width="72" height="24" rx="3" fill="white" />
    </svg>
  );
}

// ─── Zeichen 283 – Absolutes Halteverbot (No Stopping) ───────────────────────
// Blue circle, red diagonal cross-out band
function NoStoppingSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      <circle cx="50" cy="50" r="47" fill="white" />
      <circle cx="50" cy="50" r="45" fill="#003399" />
      {/* Red band diagonal */}
      <line x1="18" y1="18" x2="82" y2="82" stroke="#CC0000" strokeWidth="16" strokeLinecap="round" />
      {/* Red border ring */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="#CC0000" strokeWidth="10" />
    </svg>
  );
}

// ─── Zeichen 314 – Parken (Parking) ──────────────────────────────────────────
// Blue square, white "P"
function ParkingSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="white" />
      <rect x="6" y="6" width="88" height="88" rx="5" fill="#003399" />
      <text x="50" y="72" textAnchor="middle" fontSize="72" fontWeight="900"
        fill="white" fontFamily="'Arial Black', Arial, Helvetica, sans-serif">
        P
      </text>
    </svg>
  );
}

// ─── Zeichen 330.1 – Autobahn (Motorway) ─────────────────────────────────────
// Blue rectangle, white highway "A" symbol (two roads merging)
function MotorwaySign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="white" />
      <rect x="6" y="6" width="88" height="88" rx="5" fill="#003399" />
      {/* Two road shapes */}
      <path d="M30,82 L40,20 L50,38 L60,20 L70,82" fill="none" stroke="white" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
      {/* Cross bar */}
      <line x1="35" y1="56" x2="65" y2="56" stroke="white" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

// ─── Zeichen 720 – Grünpfeil (Green Arrow sign) ───────────────────────────────
// Dark rectangular sign, green arrow pointing right
function GreenArrowSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      <rect x="4" y="4" width="92" height="92" rx="6" fill="#1a1a1a" />
      <rect x="7" y="7" width="86" height="86" rx="4" fill="none" stroke="#333" strokeWidth="2" />
      {/* Green arrow */}
      <path d="M16,50 L64,50" stroke="#00CC44" strokeWidth="12" strokeLinecap="round" />
      <polygon points="58,32 86,50 58,68" fill="#00CC44" />
    </svg>
  );
}

// ─── Traffic Light with green arrow signal ────────────────────────────────────
function GreenArrowSignal() {
  return (
    <svg viewBox="0 0 60 120" className={svgClass} aria-hidden="true">
      {/* Traffic light housing */}
      <rect x="10" y="4" width="40" height="88" rx="8" fill="#1a1a1a" />
      {/* Red light (off) */}
      <circle cx="30" cy="24" r="13" fill="#4a0000" />
      <circle cx="30" cy="24" r="10" fill="#330000" />
      {/* Amber light (off) */}
      <circle cx="30" cy="50" r="13" fill="#3a2d00" />
      <circle cx="30" cy="50" r="10" fill="#2a2000" />
      {/* Green arrow light (on) */}
      <circle cx="30" cy="76" r="13" fill="#003300" />
      <circle cx="30" cy="76" r="10" fill="#00aa00" />
      <path d="M22,76 L34,76" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="32,70 40,76 32,82" fill="white" />
      {/* Mount post */}
      <rect x="27" y="92" width="6" height="24" rx="3" fill="#555" />
    </svg>
  );
}

// ─── Zusatzzeichen 1022-10 – Radfahrer frei ──────────────────────────────────
// White rectangle with black border, bicycle pictogram + "frei"
function CyclistsAllowedSign() {
  return (
    <svg viewBox="0 0 120 60" className={svgClass} aria-hidden="true">
      <rect x="2" y="2" width="116" height="56" rx="4" fill="white" stroke="#1a1a1a" strokeWidth="3" />
      {/* Bicycle wheels */}
      <circle cx="38" cy="36" r="12" fill="none" stroke="#1a1a1a" strokeWidth="3" />
      <circle cx="66" cy="36" r="12" fill="none" stroke="#1a1a1a" strokeWidth="3" />
      {/* Frame */}
      <path d="M38,36 L52,20 L66,36 M52,20 L52,36 M38,36 L52,28" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {/* Handlebars */}
      <path d="M62,20 L70,20 M66,20 L66,26" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      {/* Seat */}
      <path d="M48,20 L56,20" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      {/* "frei" text */}
      <text x="93" y="38" textAnchor="middle" fontSize="16" fontWeight="700"
        fill="#1a1a1a" fontFamily="Arial, sans-serif">frei</text>
    </svg>
  );
}

// ─── Bending Priority Zusatzzeichen ──────────────────────────────────────────
// White square, thin grey roads, THICK black line = priority road path
function BendingSubSign({ variant }: { variant?: string }) {
  const layout = variant || 'bottom-left';
  const cx = 50; const cy = 50;
  const bw = 7;   // priority road stroke width
  const tw = 2;   // thin road stroke width

  return (
    <g>
      {/* White rect with black border */}
      <rect x="1" y="1" width="98" height="98" rx="3" fill="white" stroke="#1a1a1a" strokeWidth="3" />
      {/* Thin roads (all four arms) */}
      <line x1={cx} y1="6" x2={cx} y2={cy - 4} stroke="#888" strokeWidth={tw} />
      <line x1={cx} y1={cy + 4} x2={cx} y2="94" stroke="#888" strokeWidth={tw} />
      <line x1="6" y1={cy} x2={cx - 4} y2={cy} stroke="#888" strokeWidth={tw} />
      <line x1={cx + 4} y1={cy} x2="94" y2={cy} stroke="#888" strokeWidth={tw} />
      {/* Thick priority road path */}
      {layout === 'bottom-left' && <path d={`M${cx} 94 Q${cx} ${cy} 6 ${cy}`} fill="none" stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />}
      {layout === 'bottom-right' && <path d={`M${cx} 94 Q${cx} ${cy} 94 ${cy}`} fill="none" stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />}
      {layout === 'top-left' && <path d={`M${cx} 6 Q${cx} ${cy} 6 ${cy}`} fill="none" stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />}
      {layout === 'top-right' && <path d={`M${cx} 6 Q${cx} ${cy} 94 ${cy}`} fill="none" stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />}
      {layout === 'left-top' && <path d={`M6 ${cy} Q${cx} ${cy} ${cx} 6`} fill="none" stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />}
      {layout === 'left-bottom' && <path d={`M6 ${cy} Q${cx} ${cy} ${cx} 94`} fill="none" stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />}
      {layout === 'right-top' && <path d={`M94 ${cy} Q${cx} ${cy} ${cx} 6`} fill="none" stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />}
      {layout === 'right-bottom' && <path d={`M94 ${cy} Q${cx} ${cy} ${cx} 94`} fill="none" stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" strokeLinejoin="round" />}
      {layout === 'priority-left-right' && <line x1="6" y1={cy} x2="94" y2={cy} stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" />}
      {layout === 'priority-top-bottom' && <line x1={cx} y1="6" x2={cx} y2="94" stroke="#1a1a1a" strokeWidth={bw} strokeLinecap="round" />}
    </g>
  );
}

// ─── Zeichen 306 + Zusatzzeichen — Bending Priority Road ─────────────────────
// Yellow diamond (top sign) + Zusatzzeichen (bottom sign) on a post
function BendingPrioritySign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 100 200" className={svgClass} aria-hidden="true">
      {/* Vertical post */}
      <rect x="47" y="0" width="6" height="200" rx="3" fill="#888" />
      {/* Priority Road diamond — top sign (40×40, centered at x=50 y=45) */}
      <g transform="translate(50,45) rotate(45)">
        <rect x="-22" y="-22" width="44" height="44" rx="2" fill="#1a1a1a" />
        <rect x="-20" y="-20" width="40" height="40" rx="2" fill="white" />
        <rect x="-16" y="-16" width="32" height="32" rx="1" fill="#F5A800" />
      </g>
      {/* Zusatzzeichen — bottom sign (80×80, centered at x=50 y=145) */}
      <g transform="translate(10,105)">
        <BendingSubSign variant={variant} />
      </g>
    </svg>
  );
}

// ─── Zeichen 205 + Zusatzzeichen — Bending Yield ─────────────────────────────
function YieldBendingSign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 100 200" className={svgClass} aria-hidden="true">
      <rect x="47" y="0" width="6" height="200" rx="3" fill="#888" />
      {/* Yield triangle — top (scaled to fit ~50px wide at y=10..60) */}
      <polygon points="50,10 85,60 15,60" fill="#CC0000" />
      <polygon points="50,16 81,56 19,56" fill="white" />
      <polygon points="50,22 77,52 23,52" fill="#CC0000" />
      <polygon points="50,28 73,48 27,48" fill="white" />
      {/* Zusatzzeichen */}
      <g transform="translate(10,105)">
        <BendingSubSign variant={variant} />
      </g>
    </svg>
  );
}

// ─── Zeichen 206 + Zusatzzeichen — Bending Stop ──────────────────────────────
function StopBendingSign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 100 200" className={svgClass} aria-hidden="true">
      <rect x="47" y="0" width="6" height="200" rx="3" fill="#888" />
      {/* Stop octagon — top (~50px, centered at 50,40) */}
      <g transform="translate(50,40) scale(0.44)">
        <polygon points="32,4 68,4 96,32 96,68 68,96 32,96 4,68 4,32" fill="white" />
        <polygon points="34,8 66,8 92,34 92,66 66,92 34,92 8,66 8,34" fill="#CC0000" />
        <text x="50" y="58" textAnchor="middle" dominantBaseline="middle"
          fontSize="22" fontWeight="900" fill="white"
          fontFamily="'Arial Black', Arial, Helvetica, sans-serif" letterSpacing="1">
          STOP
        </text>
      </g>
      {/* Zusatzzeichen */}
      <g transform="translate(10,105)">
        <BendingSubSign variant={variant} />
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
    <svg viewBox="0 0 100 100" className={svgClass} aria-hidden="true">
      <rect x="5" y="5" width="90" height="90" rx="10" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" />
      <text x="50" y="55" textAnchor="middle" fontSize="14" fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif" fill="#334155">
        {code ?? 'StVO'}
      </text>
    </svg>
  );
}

function getSignGraphic(sign: TrafficSign) {
  switch (sign.id) {
    case 'sign-yield':          return <YieldSign />;
    case 'sign-stop':           return <StopSign />;
    case 'sign-priority-road':  return <PriorityRoadSign />;
    case 'sign-roundabout':     return <RoundaboutSign />;
    case 'sign-crosswalk':      return <PedestrianCrossingSign />;
    case 'sign-one-way':        return <OneWaySign />;
    case 'sign-no-entry':       return <NoEntrySign />;
    case 'sign-no-stopping':    return <NoStoppingSign />;
    case 'sign-parking':        return <ParkingSign />;
    case 'sign-motorway':       return <MotorwaySign />;
    case 'sign-green-arrow':    return <GreenArrowSign />;
    case 'sign-green-arrow-signal': return <GreenArrowSignal />;
    case 'sign-cyclists-allowed':   return <CyclistsAllowedSign />;
    case 'sign-bending-priority':   return <BendingPrioritySign variant={sign.variant} />;
    case 'sign-yield-bending':      return <YieldBendingSign variant={sign.variant} />;
    case 'sign-stop-bending':       return <StopBendingSign variant={sign.variant} />;
    case 'visual-dipstick':   return <VehicleCheckImage src={oilDipstickImg} alt="Oil dipstick check" />;
    case 'visual-tyre':       return <VehicleCheckImage src={tyreTreadImg} alt="Tyre tread inspection" />;
    case 'visual-dashboard':  return <VehicleCheckImage src={dashboardWarningsImg} alt="Dashboard warning lights" />;
    case 'visual-lights':     return <VehicleCheckImage src={carLightsImg} alt="Car lights check" />;
    default:
      if (sign.code === 'Zeichen 205')  return <YieldSign />;
      if (sign.code === 'Zeichen 206')  return <StopSign />;
      if (sign.code === 'Zeichen 306')  return <PriorityRoadSign />;
      if (sign.code === 'Zeichen 215')  return <RoundaboutSign />;
      if (sign.code === 'Zeichen 350')  return <PedestrianCrossingSign />;
      if (sign.code === 'Zeichen 220')  return <OneWaySign />;
      if (sign.code === 'Zeichen 267')  return <NoEntrySign />;
      if (sign.code === 'Zeichen 283')  return <NoStoppingSign />;
      if (sign.code === 'Zeichen 314')  return <ParkingSign />;
      if (sign.code === 'Zeichen 330.1') return <MotorwaySign />;
      if (sign.code === 'Zeichen 720')  return <GreenArrowSign />;
      if (sign.code === 'Lichtzeichen') return <GreenArrowSignal />;
      if (sign.code === 'Zusatzzeichen 1022-10') return <CyclistsAllowedSign />;
      return <FallbackSign code={sign.code} />;
  }
}

export function TrafficSignIcon({ sign, noFrame }: TrafficSignIconProps) {
  return <SignFrame noFrame={noFrame}>{getSignGraphic(sign)}</SignFrame>;
}
