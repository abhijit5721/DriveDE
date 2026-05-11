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
}

const svgClass = 'h-full w-full';

function SignFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-md ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 sm:h-24 sm:w-24">
      {children}
    </div>
  );
}


function ParkingSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="4" fill="#0f5bd8" />
      <text
        x="32"
        y="43"
        textAnchor="middle"
        fontSize="34"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
        fill="#ffffff"
      >
        P
      </text>
    </svg>
  );
}

function NoStoppingSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <circle cx="32" cy="32" r="24" fill="#0f5bd8" stroke="#d92d20" strokeWidth="8" />
      <line x1="18" y1="18" x2="46" y2="46" stroke="#d92d20" strokeWidth="6" strokeLinecap="round" />
      <line x1="46" y1="18" x2="18" y2="46" stroke="#d92d20" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function MotorwaySign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="4" fill="#0f5bd8" />
      <path d="M28 48V18L21 28v20" fill="#ffffff" />
      <path d="M36 48V18l7 10v20" fill="#ffffff" />
      <rect x="30" y="16" width="4" height="10" rx="2" fill="#ffffff" />
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

function BendingPrioritySign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Priority Diamond */}
      <g transform="translate(32 20) rotate(45) translate(-32 -20)">
        <rect x="18" y="6" width="28" height="28" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
        <rect x="22" y="10" width="20" height="20" fill="#f5c542" stroke="#111827" strokeWidth="1.5" />
      </g>
      {/* Supplementary Sign Box */}
      <rect x="16" y="34" width="32" height="22" rx="1.5" fill="#ffffff" stroke="#111827" strokeWidth="1.5" />
      {/* Thick Priority Line (Bottom to Left) */}
      <path d="M32 56V45H16" stroke="#111827" strokeWidth="5" strokeLinecap="square" fill="none" />
      {/* Thin Side Street Lines */}
      <path d="M32 45V34" stroke="#111827" strokeWidth="1.5" strokeLinecap="square" fill="none" />
      <path d="M32 45H48" stroke="#111827" strokeWidth="1.5" strokeLinecap="square" fill="none" />
    </svg>
  );
}

function GreenArrowSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="6" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
      <path d="M20 32h16" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
      <path d="M32 20l12 12-12 12" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function YieldBendingSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Yield Triangle (Inverted) */}
      <g transform="translate(32 18) translate(-32 -18)">
        <polygon points="10,2 54,2 32,32" fill="#d92d20" />
        <polygon points="18,5 46,5 32,27" fill="#ffffff" />
      </g>
      {/* Supplementary Sign Box */}
      <rect x="16" y="34" width="32" height="22" rx="1.5" fill="#ffffff" stroke="#111827" strokeWidth="1.5" />
      {/* Thick Priority Line */}
      <path d="M32 56V45H16" stroke="#111827" strokeWidth="5" strokeLinecap="square" fill="none" />
      {/* Thin Side Street Lines */}
      <path d="M32 45V34" stroke="#111827" strokeWidth="1.5" strokeLinecap="square" fill="none" />
      <path d="M32 45H48" stroke="#111827" strokeWidth="1.5" strokeLinecap="square" fill="none" />
    </svg>
  );
}

function StopBendingSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      {/* Stop Octagon */}
      <g transform="translate(32 18) scale(0.65) translate(-32 -18)">
        <path 
          d="M22 2h20l12 12v20L42 46H22L10 34V14L22 2z" 
          fill="#ef4444" 
          stroke="#ffffff" 
          strokeWidth="3" 
        />
        <text x="32" y="29" textAnchor="middle" fontSize="14" fontWeight="900" fill="#ffffff" fontFamily="Arial, sans-serif">STOP</text>
      </g>
      {/* Supplementary Sign Box */}
      <rect x="16" y="34" width="32" height="22" rx="1.5" fill="#ffffff" stroke="#111827" strokeWidth="1.5" />
      {/* Thick Priority Line */}
      <path d="M32 56V45H16" stroke="#111827" strokeWidth="5" strokeLinecap="square" fill="none" />
      {/* Thin Side Street Lines */}
      <path d="M32 45V34" stroke="#111827" strokeWidth="1.5" strokeLinecap="square" fill="none" />
      <path d="M32 45H48" stroke="#111827" strokeWidth="1.5" strokeLinecap="square" fill="none" />
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
      <path 
        d="M22 6h20l14 14v24L42 58H22L8 44V20L22 6z" 
        fill="#ef4444" 
        stroke="#ffffff" 
        strokeWidth="3" 
      />
      <text x="32" y="38" textAnchor="middle" fontSize="15" fontWeight="900" fill="#ffffff" fontFamily="Arial, sans-serif">STOP</text>
    </svg>
  );
}

function YieldSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <polygon points="6,10 58,10 32,54" fill="#d92d20" />
      <polygon points="16,15 48,15 32,43" fill="#ffffff" />
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
      <rect x="10" y="10" width="44" height="44" rx="4" fill="#3b82f6" />
      <path d="M16 32h32" stroke="#ffffff" strokeWidth="8" strokeLinecap="square" />
      <path d="M40 20l12 12-12 12" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

function PriorityRoadSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <g transform="translate(32 32) rotate(45) translate(-32 -32)">
        <rect x="14" y="14" width="36" height="36" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
        <rect x="20" y="20" width="24" height="24" fill="#f5c542" stroke="#111827" strokeWidth="1.5" />
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
      <circle cx="32" cy="32" r="26" fill="#ef4444" />
      <rect x="14" y="27" width="36" height="10" fill="#ffffff" />
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
      return <BendingPrioritySign />;
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
      return <YieldBendingSign />;
    case 'sign-stop-bending':
      return <StopBendingSign />;
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

export function TrafficSignIcon({ sign }: TrafficSignIconProps) {
  return <SignFrame>{getSignGraphic(sign)}</SignFrame>;
}
