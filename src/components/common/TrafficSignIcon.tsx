/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import type { TrafficSign } from '../../types';

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

function YieldSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <polygon points="32,8 56,52 8,52" fill="#d92d20" />
      <polygon points="32,16 48.5,46 15.5,46" fill="#ffffff" />
    </svg>
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

function PriorityRoadSign() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <g transform="translate(32 32) rotate(45) translate(-32 -32)">
        <rect x="14" y="14" width="36" height="36" fill="#ffffff" stroke="#111827" strokeWidth="3" />
        <rect x="20" y="20" width="24" height="24" fill="#f5c542" stroke="#111827" strokeWidth="2" />
      </g>
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
      <g transform="translate(32 20) rotate(45) translate(-32 -20)">
        <rect x="18" y="6" width="28" height="28" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
        <rect x="22" y="10" width="20" height="20" fill="#f5c542" stroke="#111827" strokeWidth="1.5" />
      </g>
      <rect x="18" y="36" width="28" height="16" rx="2" fill="#ffffff" stroke="#111827" strokeWidth="2" />
      <path d="M25 47V39h8v4h6" stroke="#111827" strokeWidth="4" strokeLinecap="square" fill="none" />
      <path d="M39 39h-4" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 43h-5" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />
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

function DipstickCheckIcon() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="8" y="18" width="38" height="28" rx="10" fill="#334155" />
      <rect x="14" y="24" width="18" height="4" rx="2" fill="#f59e0b" />
      <rect x="14" y="31" width="12" height="4" rx="2" fill="#e5e7eb" />
      <path d="M40 32h12" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
      <path d="M52 32l4-4v8z" fill="#f59e0b" />
      <circle cx="18" cy="38" r="3" fill="#ef4444" />
      <circle cx="27" cy="38" r="3" fill="#22c55e" />
    </svg>
  );
}

function TyreTreadIcon() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill="#111827" />
      <circle cx="32" cy="32" r="10" fill="#cbd5e1" />
      <path d="M20 14v36M26 12v40M32 10v44M38 12v40M44 14v36" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <rect x="46" y="16" width="6" height="28" rx="3" fill="#0f5bd8" />
      <rect x="48" y="22" width="2" height="16" rx="1" fill="#ffffff" />
    </svg>
  );
}

function DashboardWarningIcon() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="10" y="14" width="44" height="34" rx="10" fill="#1e293b" />
      <circle cx="22" cy="31" r="6" fill="#ef4444" />
      <circle cx="32" cy="31" r="6" fill="#f59e0b" />
      <circle cx="42" cy="31" r="6" fill="#22c55e" />
      <rect x="18" y="50" width="28" height="4" rx="2" fill="#94a3b8" />
      <path d="M22 28v6M22 37h.01" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M29 31h6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 28l2 2 4-4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function LightsCheckIcon() {
  return (
    <svg viewBox="0 0 64 64" className={svgClass} aria-hidden="true">
      <rect x="12" y="18" width="22" height="28" rx="10" fill="#2563eb" />
      <path d="M20 26h7M20 32h9M20 38h7" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 22l10-6M40 28l12-2M40 36l12 2M38 42l10 6" stroke="#facc15" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="50" r="4" fill="#ef4444" />
    </svg>
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
    case 'sign-green-arrow':
      return <GreenArrowSign />;
    case 'visual-dipstick':
      return <DipstickCheckIcon />;
    case 'visual-tyre':
      return <TyreTreadIcon />;
    case 'visual-dashboard':
      return <DashboardWarningIcon />;
    case 'visual-lights':
      return <LightsCheckIcon />;
    default:
      if (sign.code === 'Zeichen 205') return <YieldSign />;
      if (sign.code === 'Zeichen 314') return <ParkingSign />;
      if (sign.code === 'Zeichen 283') return <NoStoppingSign />;
      if (sign.code === 'Zeichen 330.1') return <MotorwaySign />;
      if (sign.code === 'Zeichen 215') return <RoundaboutSign />;
      if (sign.code === 'Zeichen 350') return <PedestrianCrossingSign />;
      if (sign.code === 'Zeichen 306') return <PriorityRoadSign />;
      return <FallbackSign code={sign.code} />;
  }
}

export function TrafficSignIcon({ sign }: TrafficSignIconProps) {
  return <SignFrame>{getSignGraphic(sign)}</SignFrame>;
}
