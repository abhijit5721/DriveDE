/**
 * The Examiner - Episode 1 ANSWER: "Red first. Then you. Green last."
 * Same formula as the quiz: three Veo clips of the DriveDE Instructor
 * (public/flow/ep1ans-*.mp4) + the exact intersection diagram, now ANIMATED
 * to show the crossing order red -> blue(you) -> green with numbered badges.
 * Posts MUST carry AI-generated flags. 1080x1920 @ 30fps.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';

const CLIP = 240;
export const EP1ANS_TOTAL_FRAMES = CLIP * 3 + 75;

const font = { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" } as const;

function Chip({ children, color, size = 62 }: { children: React.ReactNode; color?: string; size?: number }) {
  return (
    <div
      style={{
        ...font,
        display: 'inline-block',
        background: 'rgba(6, 12, 24, 0.85)',
        color: color ?? '#fff',
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.15,
        padding: '16px 40px',
        borderRadius: 22,
        letterSpacing: 0.5,
        textAlign: 'center',
        maxWidth: 980,
      }}
    >
      {children}
    </div>
  );
}

function FadeIn({ children, y = 24 }: { children: React.ReactNode; y?: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)` }}>{children}</div>;
}

function Clip({ src }: { src: string }) {
  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      <OffthreadVideo src={staticFile(src)} style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
    </AbsoluteFill>
  );
}

function BrandTag() {
  return (
    <div style={{ ...font, position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <div style={{ background: 'rgba(6, 12, 24, 0.7)', color: '#7dd3fc', fontWeight: 800, fontSize: 40, letterSpacing: 4, padding: '10px 30px', borderRadius: 999 }}>
        THE EXAMINER
      </div>
    </div>
  );
}

/** Animated resolution: red crosses (frames 20-80), blue 90-150, green 160-220. */
function AnimatedDiagram() {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const road = '#2b3446';
  const line = '#4a5670';

  const move = (a: number, b: number) =>
    interpolate(frame, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const redT = move(20, 80);    // heading left: x 800 -> 60
  const blueT = move(90, 150);  // heading up: y 1230 -> 380
  const greenT = move(160, 220); // heading right: x 190 -> 900

  const car = (color: string, x: number, y: number, rot: number) => (
    <div style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)` }}>
      <div style={{ width: 90, height: 150, background: color, borderRadius: 22, border: '5px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 24px rgba(0,0,0,0.45)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 18, left: 12, right: 12, height: 34, background: 'rgba(255,255,255,0.35)', borderRadius: 10 }} />
      </div>
    </div>
  );

  const badge = (n: string, x: number, y: number, active: boolean) => (
    <div
      style={{
        ...font,
        position: 'absolute',
        left: x,
        top: y,
        width: 76,
        height: 76,
        borderRadius: 38,
        background: active ? '#fbbf24' : 'rgba(6,12,24,0.8)',
        color: active ? '#0b1220' : '#94a3b8',
        border: '4px solid rgba(255,255,255,0.7)',
        fontWeight: 800,
        fontSize: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {n}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: '#060c18', opacity: t }}>
      <div style={{ position: 'absolute', left: 390, top: 250, width: 300, height: 1300, background: road }} />
      <div style={{ position: 'absolute', left: 0, top: 750, width: 1080, height: 300, background: road }} />
      {[0, 1, 2, 3].map((i) => (
        <div key={`v${i}`} style={{ position: 'absolute', left: 533, top: 300 + i * 180, width: 14, height: 90, background: line, opacity: 0.8 }} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <div key={`v2${i}`} style={{ position: 'absolute', left: 533, top: 1130 + i * 180, width: 14, height: 90, background: line, opacity: 0.8 }} />
      ))}
      {[0, 1, 2].map((i) => (
        <div key={`h${i}`} style={{ position: 'absolute', left: 60 + i * 120, top: 893, width: 90, height: 14, background: line, opacity: 0.8 }} />
      ))}
      {[0, 1, 2].map((i) => (
        <div key={`h2${i}`} style={{ position: 'absolute', left: 720 + i * 120, top: 893, width: 90, height: 14, background: line, opacity: 0.8 }} />
      ))}

      {/* moving cars */}
      {car('#ef4444', 800 - 740 * redT, 810, 90)}
      {car('#3b82f6', 495, 1230 - 850 * blueT, 0)}
      {car('#22c55e', 190 + 710 * greenT, 810, -90)}

      {/* order badges near each start position */}
      {badge('1', 880, 700, frame >= 20)}
      {badge('2', 590, 1260, frame >= 90)}
      {badge('3', 130, 700, frame >= 160)}
    </AbsoluteFill>
  );
}

export const ShortExaminerEp1Answer: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      <Sequence from={0} durationInFrames={CLIP}>
        <Clip src="flow/ep1ans-answer.mp4" />
        <BrandTag />
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1500 }}>
          <FadeIn>
            <Chip color="#6ee7b7">RED first. Then YOU. GREEN last.</Chip>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={CLIP} durationInFrames={CLIP}>
        <AnimatedDiagram />
        <BrandTag />
        <div style={{ position: 'absolute', top: 1560, left: 44, width: 290, height: 290, borderRadius: 145, overflow: 'hidden', border: '6px solid #7dd3fc' }}>
          <OffthreadVideo
            src={staticFile('flow/ep1ans-why.mp4')}
            style={{ width: 520, height: 924, objectFit: 'cover', marginLeft: -144, marginTop: -194 }}
          />
        </div>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 240 }}>
          <FadeIn>
            <Chip color="#fbbf24" size={54}>Priority comes from your RIGHT</Chip>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={CLIP * 2} durationInFrames={CLIP}>
        <Clip src="flow/ep1ans-cta.mp4" />
        <BrandTag />
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1500 }}>
          <FadeIn>
            <Chip color="#fca5a5">One missed check = exam over</Chip>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={CLIP * 3}>
        <AbsoluteFill
          style={{
            background: '#060c18',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: interpolate(frame - CLIP * 3, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
            <img src={staticFile('icon-512.png')} width={190} height={190} style={{ borderRadius: 48 }} />
            <div style={{ ...font, color: '#fff', fontWeight: 800, fontSize: 60, textAlign: 'center', maxWidth: 880 }}>
              Never fail a priority check
            </div>
            <div style={{ ...font, color: '#7dd3fc', fontWeight: 800, fontSize: 76 }}>drivede.app</div>
            <div style={{ ...font, color: '#94a3b8', fontWeight: 600, fontSize: 40 }}>@drivedeapp</div>
          </div>
        </AbsoluteFill>
      </Sequence>

      <Audio src={staticFile('music.mp3')} volume={0.08} loop />
    </AbsoluteFill>
  );
};
