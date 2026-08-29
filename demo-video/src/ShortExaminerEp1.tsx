/**
 * The Examiner - Episode 1 (quiz): "Right before left: who goes first?"
 * Three Veo clips of the recurring synthetic presenter (public/flow/ep1-*.mp4,
 * 720x1280@8s, dialog audio embedded) + an exact top-down intersection diagram
 * drawn here (never AI-generated). Posts MUST carry AI-generated flags.
 * 1080x1920 @ 30fps.
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

const CLIP = 240; // each Veo clip is 8s
export const EP1_TOTAL_FRAMES = CLIP * 3 + 75;

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

/** Veo clip (720x1280) scaled to fill 1080x1920. */
function Clip({ src, muted = false }: { src: string; muted?: boolean }) {
  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      <OffthreadVideo src={staticFile(src)} style={{ width: 1080, height: 1920, objectFit: 'cover' }} muted={muted} />
    </AbsoluteFill>
  );
}

/** Small brand tag shown over the clips. */
function BrandTag() {
  return (
    <div
      style={{
        ...font,
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(6, 12, 24, 0.7)',
          color: '#7dd3fc',
          fontWeight: 800,
          fontSize: 40,
          letterSpacing: 4,
          padding: '10px 30px',
          borderRadius: 999,
        }}
      >
        THE EXAMINER
      </div>
    </div>
  );
}

/** Exact top-down unmarked intersection: blue (bottom, heading up), red (right,
 *  heading left), green (left, heading right). Correct order: red, blue, green. */
function IntersectionDiagram() {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const pulse = 1 + 0.03 * Math.sin(frame / 8);
  const road = '#2b3446';
  const line = '#4a5670';

  const car = (color: string, x: number, y: number, rot: number) => (
    <div style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)` }}>
      <div
        style={{
          width: 90,
          height: 150,
          background: color,
          borderRadius: 22,
          border: '5px solid rgba(255,255,255,0.85)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
          position: 'relative',
        }}
      >
        {/* windshield */}
        <div style={{ position: 'absolute', top: 18, left: 12, right: 12, height: 34, background: 'rgba(255,255,255,0.35)', borderRadius: 10 }} />
      </div>
    </div>
  );

  const label = (text: string, x: number, y: number, color: string) => (
    <div style={{ position: 'absolute', left: x, top: y, width: 160, textAlign: 'center', ...font, color, fontWeight: 800, fontSize: 36 }}>{text}</div>
  );

  const arrow = (x: number, y: number, rot: number, color: string) => (
    <div style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) scale(${pulse})`, ...font, color, fontSize: 90, fontWeight: 800 }}>↑</div>
  );

  return (
    <AbsoluteFill style={{ background: '#060c18', opacity: t }}>
      {/* roads: vertical + horizontal, centered around (540, 900) */}
      <div style={{ position: 'absolute', left: 390, top: 250, width: 300, height: 1300, background: road }} />
      <div style={{ position: 'absolute', left: 0, top: 750, width: 1080, height: 300, background: road }} />
      {/* center dashes */}
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

      {/* cars: blue bottom heading up; red right heading left; green left heading right */}
      {car('#3b82f6', 495, 1230, 0)}
      {car('#ef4444', 800, 810, 90)}
      {car('#22c55e', 190, 810, -90)}
      {label('YOU', 460, 1395, '#93c5fd')}
      {label('RED', 795, 990, '#fca5a5')}
      {label('GREEN', 185, 990, '#86efac')}

      {/* direction arrows */}
      {arrow(510, 1090, 0, '#93c5fd')}
      {arrow(700, 855, -90, '#fca5a5')}
      {arrow(310, 855, 90, '#86efac')}

      {/* question mark in the middle */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', ...font, color: '#fbbf24', fontWeight: 800, fontSize: 130, transform: `scale(${pulse})` }}>?</div>
    </AbsoluteFill>
  );
}

export const ShortExaminerEp1: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      {/* Beat 1: hook clip full-frame */}
      <Sequence from={0} durationInFrames={CLIP}>
        <Clip src="flow/ep1-hook.mp4" />
        <BrandTag />
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1500 }}>
          <FadeIn>
            <Chip color="#fca5a5">Three cars. No signs. Who goes first?</Chip>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Beat 2: diagram + presenter bubble (setup clip audio) */}
      <Sequence from={CLIP} durationInFrames={CLIP}>
        <IntersectionDiagram />
        <BrandTag />
        <div
          style={{
            position: 'absolute',
            top: 1560,
            left: 44,
            width: 290,
            height: 290,
            borderRadius: 145,
            overflow: 'hidden',
            border: '6px solid #7dd3fc',
          }}
        >
          <OffthreadVideo
            src={staticFile('flow/ep1-setup.mp4')}
            style={{ width: 520, height: 924, objectFit: 'cover', marginLeft: -115, marginTop: -175 }}
          />
        </div>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 240 }}>
          <FadeIn>
            <Chip color="#fbbf24" size={54}>Unmarked intersection: right before left</Chip>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Beat 3: cliffhanger clip full-frame */}
      <Sequence from={CLIP * 2} durationInFrames={CLIP}>
        <Clip src="flow/ep1-cliffhanger.mp4" />
        <BrandTag />
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1500 }}>
          <FadeIn>
            <Chip color="#6ee7b7">Answer tomorrow. Follow!</Chip>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* End card */}
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
              Think you would pass? Prove it.
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
