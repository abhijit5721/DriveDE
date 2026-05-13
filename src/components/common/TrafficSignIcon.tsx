/**
 * (c) 2026 DriveDE. All rights reserved.
 * TrafficSignIcon.tsx — Authentic German StVO traffic signs as SVG.
 * Based on official Verkehrszeichenkatalog (VzKat) reference images.
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
  if (noFrame) return <div className="flex h-full w-full items-center justify-center overflow-visible">{children}</div>;
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 sm:h-24 sm:w-24">
      {children}
    </div>
  );
}

/* ── Zeichen 205 — Vorfahrt gewähren (Yield) ──
   Inverted equilateral triangle: thick red border (~12% of side), white fill.
   Corners slightly rounded. ONE border band only. */
function YieldSign() {
  return (
    <svg viewBox="0 0 100 87" className={svgClass}>
      {/* Red outer triangle (pointing down) */}
      <polygon points="50,2 98,85 2,85" fill="#C1121C" stroke="#C1121C" strokeWidth="1" strokeLinejoin="round" />
      {/* White inner triangle */}
      <polygon points="50,18 86,78 14,78" fill="white" />
    </svg>
  );
}

/* ── Zeichen 206 — Halt! Vorfahrt gewähren (Stop) ──
   Red octagon, thin white inner stroke, bold white "STOP". */
function StopSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <polygon points="30,3 70,3 97,30 97,70 70,97 30,97 3,70 3,30" fill="#C1121C" />
      {/* White inner border ring */}
      <polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32"
        fill="none" stroke="white" strokeWidth="3" />
      <text x="50" y="58" textAnchor="middle" dominantBaseline="middle"
        fontSize="26" fontWeight="900" fill="white"
        fontFamily="'DIN 1451 Mittelschrift', 'Arial Black', Arial, sans-serif"
        letterSpacing="2">STOP</text>
    </svg>
  );
}

/* ── Zeichen 301 — Vorfahrt (Priority at next junction) ──
   Same diamond shape as 306 but smaller, single-use. */

/* ── Zeichen 306 — Vorfahrtstraße (Priority Road) ──
   Diamond (square rotated 45°): black outer → white ring → yellow fill. */
function PriorityRoadSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <rect x="14" y="14" width="72" height="72" rx="2"
        transform="rotate(45 50 50)" fill="#1a1a1a" />
      <rect x="17" y="17" width="66" height="66" rx="2"
        transform="rotate(45 50 50)" fill="white" />
      <rect x="21" y="21" width="58" height="58" rx="1"
        transform="rotate(45 50 50)" fill="#F5A800" />
    </svg>
  );
}

/* ── Zeichen 215 — Kreisverkehr (Roundabout) ──
   Blue circle, white border, three white curved CCW arrows. */
function RoundaboutSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <circle cx="50" cy="50" r="47" fill="white" />
      <circle cx="50" cy="50" r="44" fill="#003893" />
      {/* Three curved arrows going counter-clockwise */}
      <g fill="none" stroke="white" strokeWidth="5" strokeLinecap="round">
        {/* Arc segments around the center */}
        <path d="M50,22 A28,28 0 0,0 22,50" />
        <path d="M22,50 A28,28 0 0,0 50,78" />
        <path d="M50,78 A28,28 0 0,0 78,50" />
      </g>
      {/* Arrowheads */}
      <polygon points="22,50 30,42 30,54" fill="white" />
      <polygon points="50,78 42,70 54,70" fill="white" />
      <polygon points="78,50 70,58 70,46" fill="white" />
    </svg>
  );
}

/* ── Zeichen 350 — Fußgängerüberweg ── */
function PedestrianCrossingSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <rect x="3" y="3" width="94" height="94" rx="5" fill="white" />
      <rect x="5" y="5" width="90" height="90" rx="4" fill="#003893" />
      {/* White triangle pointing right for crossing background */}
      <polygon points="22,20 78,50 22,80" fill="#003893" />
      {/* Pedestrian figure */}
      <circle cx="42" cy="26" r="6" fill="white" />
      <line x1="42" y1="32" x2="42" y2="52" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="42" y1="39" x2="30" y2="47" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="42" y1="39" x2="56" y2="37" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="42" y1="52" x2="34" y2="68" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="42" y1="52" x2="52" y2="68" stroke="white" strokeWidth="4" strokeLinecap="round" />
      {/* Zebra stripes */}
      {[0,1,2,3].map(i => (
        <rect key={i} x={24 + i * 14} y="72" width="8" height="14" rx="1" fill="white" />
      ))}
    </svg>
  );
}

/* ── Zeichen 220 — Einbahnstraße ── */
function OneWaySign() {
  return (
    <svg viewBox="0 0 140 60" className={svgClass}>
      <rect x="2" y="2" width="136" height="56" rx="4" fill="white" />
      <rect x="4" y="4" width="132" height="52" rx="3" fill="#003893" />
      <path d="M18,30 L90,30" stroke="white" strokeWidth="14" strokeLinecap="round" />
      <polygon points="86,14 122,30 86,46" fill="white" />
    </svg>
  );
}

/* ── Zeichen 267 — Verbot der Einfahrt (No Entry) ── */
function NoEntrySign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <circle cx="50" cy="50" r="47" fill="white" />
      <circle cx="50" cy="50" r="44" fill="#C1121C" />
      <rect x="16" y="40" width="68" height="20" rx="3" fill="white" />
    </svg>
  );
}

/* ── Zeichen 283 — Absolutes Halteverbot (No Stopping) ── */
function NoStoppingSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <circle cx="50" cy="50" r="47" fill="#C1121C" />
      <circle cx="50" cy="50" r="38" fill="#003893" />
      {/* Two red diagonal bands forming an X */}
      <line x1="20" y1="20" x2="80" y2="80" stroke="#C1121C" strokeWidth="9" />
      <line x1="80" y1="20" x2="20" y2="80" stroke="#C1121C" strokeWidth="9" />
    </svg>
  );
}

/* ── Zeichen 314 — Parken ── */
function ParkingSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <rect x="3" y="3" width="94" height="94" rx="6" fill="white" />
      <rect x="5" y="5" width="90" height="90" rx="5" fill="#003893" />
      <text x="50" y="70" textAnchor="middle" fontSize="66" fontWeight="800"
        fill="white" fontFamily="'DIN 1451 Mittelschrift', Arial, sans-serif">P</text>
    </svg>
  );
}

/* ── Zeichen 330.1 — Autobahn ── */
function MotorwaySign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <rect x="3" y="3" width="94" height="94" rx="6" fill="white" />
      <rect x="5" y="5" width="90" height="90" rx="5" fill="#003893" />
      {/* Motorway bridge/road symbol */}
      <path d="M24,76 L36,24 L50,50 L64,24 L76,76" fill="none"
        stroke="white" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
      <line x1="32" y1="54" x2="68" y2="54" stroke="white" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

/* ── Zeichen 720 — Grünpfeilschild ── */
function GreenArrowSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <rect x="3" y="3" width="94" height="94" rx="4" fill="#1a1a1a" />
      <polygon points="20,50 60,50 60,32 88,50 60,68 60,50" fill="#00882B" />
    </svg>
  );
}

/* ── Traffic Light with green arrow ── */
function GreenArrowSignal() {
  return (
    <svg viewBox="0 0 60 120" className={svgClass}>
      <rect x="12" y="2" width="36" height="86" rx="6" fill="#2a2a2a" />
      <circle cx="30" cy="22" r="12" fill="#3a0000" />
      <circle cx="30" cy="46" r="12" fill="#3a2a00" />
      <circle cx="30" cy="70" r="12" fill="#003a00" />
      <circle cx="30" cy="70" r="9" fill="#00cc00" />
      {/* Arrow inside green light */}
      <polygon points="26,70 34,70 34,64 40,70 34,76 34,70" fill="white" />
      <rect x="27" y="88" width="6" height="28" rx="3" fill="#666" />
    </svg>
  );
}

/* ── Zusatzzeichen 1022-10 — Radfahrer frei ── */
function CyclistsAllowedSign() {
  return (
    <svg viewBox="0 0 120 60" className={svgClass}>
      <rect x="2" y="2" width="116" height="56" rx="3" fill="white" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="36" cy="36" r="10" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
      <circle cx="62" cy="36" r="10" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
      <path d="M36,36 L49,22 L62,36 M49,22 L49,36 M36,36 L49,28"
        fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M58,22 L66,22" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      <path d="M45,22 L53,22" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      <text x="96" y="40" textAnchor="middle" fontSize="15" fontWeight="700"
        fill="#1a1a1a" fontFamily="Arial, sans-serif">frei</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Zusatzzeichen 1002 — Verlauf der Vorfahrtstraße (Bending Priority Sub-Sign)
   
   Based on official VzKat reference: white square, black border.
   The intersection is drawn with:
   - THICK black lines (~12px stroke) for the priority road
   - MEDIUM black lines (~6px stroke) for secondary roads  
   - Lines have flat/square ends and meet at a center point
   ══════════════════════════════════════════════════════════════════════════════ */
function BendingSubSign({ variant }: { variant?: string }) {
  const v = variant || 'bottom-left';
  const c = 50; // center
  const pw = 12; // priority road width (thick)
  const sw = 6;  // secondary road width (medium)

  /* Each arm extends from the center to the edge.
     The priority road connects two arms with a smooth curve. */
  const arm = (x1: number, y1: number, x2: number, y2: number, w: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1a1a" strokeWidth={w} />
  );

  /* Priority curves — smooth 90° bend through the center */
  const curve = (from: string, to: string) => {
    const pts: Record<string, [number, number]> = {
      top: [c, 8], bottom: [c, 92], left: [8, c], right: [92, c],
    };
    const [x1, y1] = pts[from];
    const [x2, y2] = pts[to];
    return (
      <path d={`M${x1},${y1} Q${c},${c} ${x2},${y2}`}
        fill="none" stroke="#1a1a1a" strokeWidth={pw} strokeLinecap="butt" />
    );
  };

  /* Determine which arms are priority and which are secondary */
  const configs: Record<string, { priority: [string, string]; secondary: string[] }> = {
    'bottom-left':  { priority: ['bottom', 'left'],  secondary: ['top', 'right'] },
    'bottom-right': { priority: ['bottom', 'right'], secondary: ['top', 'left'] },
    'top-left':     { priority: ['top', 'left'],     secondary: ['bottom', 'right'] },
    'top-right':    { priority: ['top', 'right'],    secondary: ['bottom', 'left'] },
    'left-top':     { priority: ['left', 'top'],     secondary: ['bottom', 'right'] },
    'left-bottom':  { priority: ['left', 'bottom'],  secondary: ['top', 'right'] },
    'right-top':    { priority: ['right', 'top'],    secondary: ['bottom', 'left'] },
    'right-bottom': { priority: ['right', 'bottom'], secondary: ['top', 'left'] },
    'priority-left-right': { priority: ['left', 'right'], secondary: ['top', 'bottom'] },
    'priority-top-bottom': { priority: ['top', 'bottom'], secondary: ['left', 'right'] },
  };

  const armCoords: Record<string, [number, number, number, number]> = {
    top:    [c, 8, c, c],
    bottom: [c, c, c, 92],
    left:   [8, c, c, c],
    right:  [c, c, 92, c],
  };

  const cfg = configs[v] || configs['bottom-left'];

  return (
    <g>
      {/* White background with black border */}
      <rect x="2" y="2" width="96" height="96" rx="3" fill="white" stroke="#1a1a1a" strokeWidth="3" />
      {/* Secondary roads (thinner lines) */}
      {cfg.secondary.map(dir => {
        const [x1, y1, x2, y2] = armCoords[dir];
        return <g key={dir}>{arm(x1, y1, x2, y2, sw)}</g>;
      })}
      {/* Priority road (thick curved line or straight) */}
      {cfg.priority[0] === 'left' && cfg.priority[1] === 'right'
        ? arm(8, c, 92, c, pw)
        : cfg.priority[0] === 'top' && cfg.priority[1] === 'bottom'
        ? arm(c, 8, c, 92, pw)
        : curve(cfg.priority[0], cfg.priority[1])}
    </g>
  );
}

/* ── Bending Priority Road — Zeichen 306 + Zusatzzeichen 1002 on a post ── */
function BendingPrioritySign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 120 220" className={svgClass}>
      {/* Grey post */}
      <rect x="56" y="0" width="8" height="220" rx="4" fill="#888" />
      {/* Zeichen 306 diamond (top) — centered, ~60px */}
      <g transform="translate(60,48) rotate(45)">
        <rect x="-28" y="-28" width="56" height="56" rx="2" fill="#1a1a1a" />
        <rect x="-25" y="-25" width="50" height="50" rx="2" fill="white" />
        <rect x="-21" y="-21" width="42" height="42" rx="1" fill="#F5A800" />
      </g>
      {/* Zusatzzeichen 1002 (bottom) — 90x90 */}
      <g transform="translate(15,110) scale(0.9)">
        <BendingSubSign variant={variant} />
      </g>
    </svg>
  );
}

/* ── Yield + Bending ── */
function YieldBendingSign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 120 220" className={svgClass}>
      <rect x="56" y="0" width="8" height="220" rx="4" fill="#888" />
      {/* Yield triangle (top, inverted, ~55px wide) */}
      <polygon points="60,12 92,66 28,66" fill="#C1121C" strokeLinejoin="round" />
      <polygon points="60,24 84,60 36,60" fill="white" />
      {/* Zusatzzeichen 1002 */}
      <g transform="translate(15,110) scale(0.9)">
        <BendingSubSign variant={variant} />
      </g>
    </svg>
  );
}

/* ── Stop + Bending ── */
function StopBendingSign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 120 220" className={svgClass}>
      <rect x="56" y="0" width="8" height="220" rx="4" fill="#888" />
      {/* Stop octagon (top, ~55px) */}
      <g transform="translate(60,42)">
        <polygon points="-14,-28 14,-28 28,-14 28,14 14,28 -14,28 -28,14 -28,-14" fill="#C1121C" />
        <polygon points="-12,-24 12,-24 24,-12 24,12 12,24 -12,24 -24,12 -24,-12"
          fill="none" stroke="white" strokeWidth="1.5" />
        <text x="0" y="4" textAnchor="middle" dominantBaseline="middle"
          fontSize="14" fontWeight="900" fill="white"
          fontFamily="'Arial Black', Arial, sans-serif" letterSpacing="1">STOP</text>
      </g>
      {/* Zusatzzeichen 1002 */}
      <g transform="translate(15,110) scale(0.9)">
        <BendingSubSign variant={variant} />
      </g>
    </svg>
  );
}

function VehicleCheckImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="h-full w-full rounded-lg object-cover" loading="lazy" />;
}

function FallbackSign({ code }: { code?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <rect x="5" y="5" width="90" height="90" rx="10" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3" />
      <text x="50" y="55" textAnchor="middle" fontSize="13" fontWeight="700"
        fontFamily="Arial, sans-serif" fill="#334155">{code ?? 'StVO'}</text>
    </svg>
  );
}

function getSignGraphic(sign: TrafficSign) {
  switch (sign.id) {
    case 'sign-yield':              return <YieldSign />;
    case 'sign-stop':               return <StopSign />;
    case 'sign-priority-road':      return <PriorityRoadSign />;
    case 'sign-roundabout':         return <RoundaboutSign />;
    case 'sign-crosswalk':          return <PedestrianCrossingSign />;
    case 'sign-one-way':            return <OneWaySign />;
    case 'sign-no-entry':           return <NoEntrySign />;
    case 'sign-no-stopping':        return <NoStoppingSign />;
    case 'sign-parking':            return <ParkingSign />;
    case 'sign-motorway':           return <MotorwaySign />;
    case 'sign-green-arrow':        return <GreenArrowSign />;
    case 'sign-green-arrow-signal': return <GreenArrowSignal />;
    case 'sign-cyclists-allowed':   return <CyclistsAllowedSign />;
    case 'sign-bending-priority':   return <BendingPrioritySign variant={sign.variant} />;
    case 'sign-yield-bending':      return <YieldBendingSign variant={sign.variant} />;
    case 'sign-stop-bending':       return <StopBendingSign variant={sign.variant} />;
    case 'visual-dipstick':         return <VehicleCheckImage src={oilDipstickImg} alt="Oil dipstick check" />;
    case 'visual-tyre':             return <VehicleCheckImage src={tyreTreadImg} alt="Tyre tread inspection" />;
    case 'visual-dashboard':        return <VehicleCheckImage src={dashboardWarningsImg} alt="Dashboard warnings" />;
    case 'visual-lights':           return <VehicleCheckImage src={carLightsImg} alt="Car lights check" />;
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
