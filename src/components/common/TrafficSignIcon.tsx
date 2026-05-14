/**
 * (c) 2026 DriveDE. All rights reserved.
 * TrafficSignIcon.tsx — Authentic German StVO traffic signs as SVG.
 * Based on official Verkehrszeichenkatalog (VzKat) reference images.
 *
 * References:
 * - Bildtafel der Verkehrszeichen in der BRD seit 2017 (Wikipedia)
 * - Wikimedia Commons SVG originals for each Zeichen
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
   INVERTED equilateral triangle (apex DOWN, flat edge TOP): thick red border, white fill.
   StVO Zeichen 205: the SINGLE POINT is at the BOTTOM, flat side at top. */
function YieldSign() {
  return (
    <svg viewBox="0 0 100 92" className={svgClass}>
      <g transform="translate(50,46)">
        <polygon points="-46,-35 46,-35 0,45" fill="#C1121C" strokeLinejoin="round" />
        <polygon points="-30,-22 30,-22 0,30" fill="white" />
      </g>
    </svg>
  );
}

/* ── Zeichen 206 — Halt! Vorfahrt gewähren (Stop) ──
   Red octagon, thin white inner stroke, bold white "STOP". */
function StopSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <g transform="translate(50,50) scale(0.95)">
        <polygon points="-20,-48 20,-48 48,-20 48,20 20,48 -20,48 -48,20 -48,-20" fill="#C1121C" />
        <polygon points="-18,-43 18,-43 43,-18 43,18 18,43 -18,43 -43,18 -43,-18"
          fill="none" stroke="white" strokeWidth="4" />
        <text x="0" y="4" textAnchor="middle" dominantBaseline="middle"
          fontSize="26" fontWeight="900" fill="white"
          fontFamily="'Arial Black', Arial, sans-serif" letterSpacing="1">STOP</text>
      </g>
    </svg>
  );
}

/* ── Zeichen 306 — Vorfahrtstraße (Priority Road) ──
   Diamond (square rotated 45°): thin black outer → white ring → large yellow fill.
   The yellow area dominates. Border proportions: black ~2.5%, white ~4%. */
function PriorityRoadSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      <g transform="translate(50,50) rotate(45)">
        <rect x="-34" y="-34" width="68" height="68" rx="2" fill="white" stroke="#1a1a1a" strokeWidth="4" />
        <rect x="-26" y="-26" width="52" height="52" rx="1" fill="#F5A800" stroke="#1a1a1a" strokeWidth="2.5" />
      </g>
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

/* ── Zeichen 720 — Grünpfeilschild ──
   Official: Black plate with GREEN right-pointing arrow.
   The plate has a thin WHITE BORDER around all edges.
   The arrow is a proper arrow shape (shaft + head, NOT a simple triangle). */
function GreenArrowSign() {
  return (
    <svg viewBox="0 0 100 100" className={svgClass}>
      {/* White border plate */}
      <rect x="2" y="2" width="96" height="96" rx="3" fill="white" />
      {/* Black background */}
      <rect x="6" y="6" width="88" height="88" rx="2" fill="#1a1a1a" />
      {/* Green right-pointing arrow: shaft + triangular head */}
      {/* Arrow shaft */}
      <rect x="18" y="40" width="38" height="20" fill="#00882B" />
      {/* Arrow head (triangle) */}
      <polygon points="52,26 84,50 52,74" fill="#00882B" />
    </svg>
  );
}

/* ── Traffic Light with green arrow signal (Lichtzeichen "Grüner Pfeil") ──
   A standard 3-lens traffic light housing. The green lens shows an arrow
   pointing in the direction of the protected movement.
   direction: 'left' | 'right' | 'straight'
   The other two lenses are dim/off (dark red-brown, dark amber). */
function GreenArrowSignal({ direction = 'right' }: { direction?: 'left' | 'right' | 'straight' }) {
  /* Rotation angle around lens center (cx=30, cy=82):
     right = 0°, left = 180°, straight (up) = -90° */
  const rotate = direction === 'left' ? 180 : direction === 'straight' ? -90 : 0;
  return (
    <svg viewBox="0 0 60 140" className={svgClass}>
      {/* Traffic light housing */}
      <rect x="10" y="2" width="40" height="100" rx="6" fill="#2a2a2a" />
      {/* Red lens (off) */}
      <circle cx="30" cy="22" r="14" fill="#3a0000" />
      {/* Yellow lens (off) */}
      <circle cx="30" cy="52" r="14" fill="#3a2a00" />
      {/* Green lens (active glow) */}
      <circle cx="30" cy="82" r="14" fill="#004400" />
      <circle cx="30" cy="82" r="11" fill="#00cc00" />
      {/* Directional arrow — rotated around lens center */}
      <g transform={`rotate(${rotate}, 30, 82)`}>
        {/* Arrow shaft */}
        <rect x="21" y="79" width="10" height="6" fill="white" />
        {/* Arrow head */}
        <polygon points="30,74 40,82 30,90" fill="white" />
      </g>
      {/* Post */}
      <rect x="27" y="102" width="6" height="34" rx="3" fill="#666" />
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

   Based on official Bildtafel reference images (Wikipedia):
   - White square plate, thin black border
   - Priority road = VERY THICK black lines (pw), squared ends
   - Secondary roads = THIN black lines (sw), squared ends  
   - Right-angle corners — NOT smooth curves
   - ClipPath prevents strokes from bleeding outside sign boundary
   ══════════════════════════════════════════════════════════════════════════════ */
function BendingSubSign({ variant, uid = '0' }: { variant?: string; uid?: string }) {
  const v = variant || 'bottom-left';
  const c = 50;   // center
  const pw = 22;  // priority road stroke (very thick, ~3.3x secondary)
  const sw = 6;   // secondary road stroke (thin)
  const edge = 2; // endpoint right at the edge

  /* Points: edge of the sign in each cardinal direction */
  const pts: Record<string, [number, number]> = {
    top:    [c, edge],
    bottom: [c, 100 - edge],
    left:   [edge, c],
    right:  [100 - edge, c],
  };

  /* Configurations: which two arms form the priority road, rest are secondary */
  const configs: Record<string, { p: [string, string]; s: string[] }> = {
    'bottom-left':  { p: ['bottom', 'left'],  s: ['top', 'right'] },
    'bottom-right': { p: ['bottom', 'right'], s: ['top', 'left'] },
    'top-left':     { p: ['top', 'left'],     s: ['bottom', 'right'] },
    'top-right':    { p: ['top', 'right'],    s: ['bottom', 'left'] },
    'left-top':     { p: ['left', 'top'],     s: ['bottom', 'right'] },
    'left-bottom':  { p: ['left', 'bottom'],  s: ['top', 'right'] },
    'right-top':    { p: ['right', 'top'],    s: ['bottom', 'left'] },
    'right-bottom': { p: ['right', 'bottom'], s: ['top', 'left'] },
    'priority-left-right': { p: ['left', 'right'], s: ['top', 'bottom'] },
    'priority-top-bottom': { p: ['top', 'bottom'], s: ['left', 'right'] },
  };

  const cfg = configs[v] || configs['bottom-left'];
  const [p1, p2] = cfg.p;
  const [px1, py1] = pts[p1];
  const [px2, py2] = pts[p2];

  const bendPts: Record<string, [number, number]> = {
    top: [c, c - 15],
    bottom: [c, c + 15],
    left: [c - 15, c],
    right: [c + 15, c]
  };

  /* Is the priority road straight (opposite directions)? */
  const isStraight = (p1 === 'left' && p2 === 'right') || (p1 === 'right' && p2 === 'left') ||
    (p1 === 'top' && p2 === 'bottom') || (p1 === 'bottom' && p2 === 'top');

  const clipId = `bsc-${uid}`;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <rect x="4" y="4" width="92" height="92" />
        </clipPath>
      </defs>
      {/* White background */}
      <rect x="2" y="2" width="96" height="96" rx="3" fill="white" />
      {/* Clipped road lines */}
      <g clipPath={`url(#${clipId})`}>
        {/* Secondary roads — thin, drawn first so priority covers center */}
        {cfg.s.map(dir => {
          const isTop = dir === 'top';
          const isBottom = dir === 'bottom';
          const isLeft = dir === 'left';
          const isRight = dir === 'right';

          const ex = isLeft ? edge : isRight ? 100 - edge : c;
          const ey = isTop ? edge : isBottom ? 100 - edge : c;
          
          const sx = isLeft ? 32 : isRight ? 68 : c;
          const sy = isTop ? 32 : isBottom ? 68 : c;

          return <line key={dir} x1={sx} y1={sy} x2={ex} y2={ey}
            stroke="#1a1a1a" strokeWidth={sw} strokeLinecap="square" />;
        })}
        {/* Priority road — thick, drawn last (on top) */}
        {isStraight
          ? <line x1={px1} y1={py1} x2={px2} y2={py2}
              stroke="#1a1a1a" strokeWidth={pw} strokeLinecap="square" />
          : <path d={`M${px1},${py1} L${bendPts[p1][0]},${bendPts[p1][1]} Q${c},${c} ${bendPts[p2][0]},${bendPts[p2][1]} L${px2},${py2}`}
              fill="none" stroke="#1a1a1a" strokeWidth={pw}
              strokeLinecap="square" strokeLinejoin="round" />
        }
      </g>
      {/* Black border drawn last so it appears on top of any lines at edge */}
      <rect x="2" y="2" width="96" height="96" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="3" />
    </g>
  );
}

/* ── Bending Priority Road — Zeichen 306 + Zusatzzeichen 1002 on a post ──
   The diamond sign sits on top, with the sub-sign plate mounted below. */
function BendingPrioritySign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 120 250" className={svgClass}>
      {/* Grey post */}
      <rect x="56" y="10" width="8" height="222" rx="4" fill="#888" />
      {/* Zeichen 306 diamond (top) */}
      <g transform="translate(60,65) rotate(45)">
        <rect x="-34" y="-34" width="68" height="68" rx="2" fill="white" stroke="#1a1a1a" strokeWidth="4" />
        <rect x="-26" y="-26" width="52" height="52" rx="1" fill="#F5A800" stroke="#1a1a1a" strokeWidth="2.5" />
      </g>
      {/* Zusatzzeichen 1002 (bottom) */}
      <g transform="translate(20,130) scale(0.8)">
        <BendingSubSign variant={variant} uid="bp" />
      </g>
    </svg>
  );
}

/* ── Yield + Bending ── */
function YieldBendingSign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 120 250" className={svgClass}>
      <rect x="56" y="10" width="8" height="222" rx="4" fill="#888" />
      {/* Yield triangle — apex DOWN, flat edge at top */}
      <g transform="translate(60,65)">
        <polygon points="-46,-35 46,-35 0,45" fill="#C1121C" strokeLinejoin="round" />
        <polygon points="-30,-22 30,-22 0,30" fill="white" />
      </g>
      {/* Zusatzzeichen 1002 */}
      <g transform="translate(20,130) scale(0.8)">
        <BendingSubSign variant={variant} uid="yb" />
      </g>
    </svg>
  );
}

/* ── Stop + Bending ── */
function StopBendingSign({ variant }: { variant?: string }) {
  return (
    <svg viewBox="0 0 120 250" className={svgClass}>
      <rect x="56" y="10" width="8" height="222" rx="4" fill="#888" />
      {/* Stop octagon (top) */}
      <g transform="translate(60,65) scale(0.95)">
        <polygon points="-20,-48 20,-48 48,-20 48,20 20,48 -20,48 -48,20 -48,-20" fill="#C1121C" />
        <polygon points="-18,-43 18,-43 43,-18 43,18 18,43 -18,43 -43,18 -43,-18"
          fill="none" stroke="white" strokeWidth="4" />
        <text x="0" y="4" textAnchor="middle" dominantBaseline="middle"
          fontSize="26" fontWeight="900" fill="white"
          fontFamily="'Arial Black', Arial, sans-serif" letterSpacing="1">STOP</text>
      </g>
      {/* Zusatzzeichen 1002 */}
      <g transform="translate(20,130) scale(0.8)">
        <BendingSubSign variant={variant} uid="sb" />
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
    case 'sign-green-arrow-signal': return <GreenArrowSignal direction={sign.variant as 'left' | 'right' | 'straight' | undefined} />;
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
