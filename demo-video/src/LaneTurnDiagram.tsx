/**
 * Exact-geometry diagram for The Examiner ep. 3: two left-turn lanes at the
 * bottom, a two-lane target road to the left, dashed guide lines through the
 * intersection. Drawn here, never generated. Matches the app's
 * InteractiveLaneTurn geometry (approach from the bottom, inner lane next to
 * the centre line). 1080x1920 canvas; the intersection centre sits at (540, 960).
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const font = { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" } as const;
const ROAD = '#2b3446';
const LINE = 'rgba(255,255,255,0.75)';
const CENTER_LINE = '#fbbf24';

// scale: app viewBox 300 -> 1080 px => 3.6; lanes are 30 app units = 108 px
const S = 3.6;
const ox = 0;
const oy = 960 - 150 * S; // vertical offset so the app's (150,150) lands at (540,960)
const X = (v: number) => ox + v * S;
const Y = (v: number) => oy + v * S;

/** Quadratic guide path in canvas px from approach lane centre x (app units) to target lane centre y. */
function guide(fromX: number, toY: number) {
  return `M ${X(fromX)} ${Y(210)} Q ${X(fromX)} ${Y(toY)} ${X(90)} ${Y(toY)}`;
}

export function LaneTurnDiagram({
  mode,
  showQuestion = true,
  carProgress = 0,
  highlight,
}: {
  mode: 'quiz' | 'answer';
  showQuestion?: boolean;
  /** 0..1 along the right-lane guide line (answer mode) */
  carProgress?: number;
  /** 'outer' | 'inner' target lane to light up */
  highlight?: 'outer' | 'inner' | null;
}) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const pulse = 1 + 0.03 * Math.sin(frame / 8);

  // Quadratic bezier for the outer (right) lane: from the waiting position (195,262)
  // via (195,105) to (90,105). Starting behind the stop line keeps the two cars
  // apart in the quiz frame and gives the answer a visible approach.
  const p = carProgress;
  const bx = (1 - p) * (1 - p) * 195 + 2 * (1 - p) * p * 195 + p * p * 90;
  const by = (1 - p) * (1 - p) * 262 + 2 * (1 - p) * p * 105 + p * p * 105;
  const dx = 2 * p * (90 - 195);
  const dy = 2 * (1 - p) * (105 - 262);
  const angle = p === 0 ? -90 : (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <AbsoluteFill style={{ background: '#060c18', opacity: t }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {/* roads */}
        <rect x={X(90)} y={0} width={120 * S} height={1920} fill={ROAD} />
        <rect x={0} y={Y(90)} width={1080} height={120 * S} fill={ROAD} />
        {/* centre lines */}
        <line x1={X(150)} y1={0} x2={X(150)} y2={Y(90)} stroke={CENTER_LINE} strokeWidth={6} />
        <line x1={X(150)} y1={Y(210)} x2={X(150)} y2={1920} stroke={CENTER_LINE} strokeWidth={6} />
        <line x1={0} y1={Y(150)} x2={X(90)} y2={Y(150)} stroke={CENTER_LINE} strokeWidth={6} />
        <line x1={X(210)} y1={Y(150)} x2={1080} y2={Y(150)} stroke={CENTER_LINE} strokeWidth={6} />
        {/* lane dividers */}
        {[120, 180].map((v) => (
          <g key={v}>
            <line x1={X(v)} y1={0} x2={X(v)} y2={Y(90)} stroke={LINE} strokeWidth={4} strokeDasharray="26 26" />
            <line x1={X(v)} y1={Y(210)} x2={X(v)} y2={1920} stroke={LINE} strokeWidth={4} strokeDasharray="26 26" />
            <line x1={0} y1={Y(v)} x2={X(90)} y2={Y(v)} stroke={LINE} strokeWidth={4} strokeDasharray="26 26" />
            <line x1={X(210)} y1={Y(v)} x2={1080} y2={Y(v)} stroke={LINE} strokeWidth={4} strokeDasharray="26 26" />
          </g>
        ))}
        {/* stop line */}
        <line x1={X(150)} y1={Y(210)} x2={X(210)} y2={Y(210)} stroke="#fff" strokeWidth={10} />
        {/* guide lines: inner->inner (135), outer->outer (105) */}
        <path d={guide(165, 135)} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="18 18" opacity={0.85} />
        <path d={guide(195, 105)} fill="none" stroke="#fff" strokeWidth={5} strokeDasharray="18 18" opacity={0.85} />
        {/* turn arrows on approach lanes */}
        {[165, 195].map((x) => (
          <g key={x} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.95}>
            <line x1={X(x)} y1={Y(292)} x2={X(x)} y2={Y(272)} />
            <path d={`M ${X(x)} ${Y(272)} Q ${X(x)} ${Y(264)} ${X(x - 10)} ${Y(264)}`} />
            <path d={`M ${X(x - 6)} ${Y(259)} L ${X(x - 11)} ${Y(264)} L ${X(x - 6)} ${Y(269)}`} />
          </g>
        ))}
        {/* target lanes */}
        {(['outer', 'inner'] as const).map((side) => {
          const y0 = side === 'inner' ? 120 : 90;
          const lit = highlight === side;
          return (
            <g key={side}>
              <rect x={0} y={Y(y0)} width={X(90)} height={30 * S} fill={lit ? '#22c55e' : '#3b82f6'} opacity={lit ? 0.55 : mode === 'quiz' ? 0.3 : 0.12} />
              {showQuestion && mode === 'quiz' && (
                <text x={X(45)} y={Y(y0 + 15) + 22} textAnchor="middle" fontSize={64} fontWeight={800} fill="#fbbf24" style={font} transform={`scale(${pulse}) translate(${(X(45) * (1 - pulse)) / pulse}, ${(Y(y0 + 15) * (1 - pulse)) / pulse})`}>?</text>
              )}
              {mode === 'answer' && (
                <text x={X(45)} y={Y(y0 + 15) + 14} textAnchor="middle" fontSize={40} fontWeight={800} fill="#fff" style={font}>{side === 'inner' ? 'INNER' : 'OUTER'}</text>
              )}
            </g>
          );
        })}
        {/* YOU car in the outer (right) turning lane, animated along its guide line in answer mode */}
        <g transform={`translate(${X(bx)} ${Y(by)}) rotate(${angle})`}>
          <rect x={-60} y={-32} width={120} height={64} rx={16} fill="#3b82f6" stroke="rgba(255,255,255,0.9)" strokeWidth={5} />
          <rect x={10} y={-22} width={26} height={44} rx={8} fill="rgba(255,255,255,0.35)" />
        </g>
        {carProgress === 0 && (
          <text x={X(195)} y={Y(285) + 60} textAnchor="middle" fontSize={40} fontWeight={800} fill="#93c5fd" style={font}>YOU</text>
        )}
        {/* the other car in the inner lane: static in the quiz, turning alongside in the answer
            (inner guide line: from (165,210) via (165,135) to (90,135)), slightly ahead of us */}
        {(() => {
          // inner lane: from the waiting position (165,262) via (165,135) to (90,135), a little ahead of us
          const q = mode === 'answer' ? Math.min(1, carProgress * 1.08) : 0;
          const rx = (1 - q) * (1 - q) * 165 + 2 * (1 - q) * q * 165 + q * q * 90;
          const ry = (1 - q) * (1 - q) * 262 + 2 * (1 - q) * q * 135 + q * q * 135;
          const rdx = 2 * q * (90 - 165);
          const rdy = 2 * (1 - q) * (135 - 262);
          const rAngle = q === 0 ? -90 : (Math.atan2(rdy, rdx) * 180) / Math.PI;
          const tx = X(rx);
          const ty = Y(ry);
          return (
            <g transform={`translate(${tx} ${ty}) rotate(${rAngle})`}>
              <rect x={-60} y={-32} width={120} height={64} rx={16} fill="#ef4444" stroke="rgba(255,255,255,0.9)" strokeWidth={5} />
              <rect x={10} y={-22} width={26} height={44} rx={8} fill="rgba(255,255,255,0.35)" />
            </g>
          );
        })()}
        {mode === 'answer' && carProgress > 0.9 && (
          <rect x={0} y={Y(120)} width={X(90)} height={30 * S} fill="#22c55e" opacity={0.35} />
        )}
      </svg>
    </AbsoluteFill>
  );
}
