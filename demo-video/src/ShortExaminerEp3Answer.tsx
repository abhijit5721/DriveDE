/**
 * The Examiner - Episode 3 (answer): lane to lane. Three presenter clips
 * (public/flow/ep3ans-*.mp4) + the lane-turn diagram, animated: the car drives
 * its guide line from the right turning lane into the right target lane.
 * Posts MUST carry AI-generated flags. 1080x1920 @ 30fps.
 */
import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { LaneTurnDiagram } from './LaneTurnDiagram.tsx';

const CLIP = 240;
export const EP3ANS_TOTAL_FRAMES = CLIP * 3 + 90;
const font = { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" } as const;

function Chip({ children, color = '#fff', size = 62 }: { children: React.ReactNode; color?: string; size?: number }) {
  return (
    <div style={{ ...font, display: 'inline-block', background: 'rgba(6,12,24,0.85)', color, fontWeight: 800, fontSize: size, lineHeight: 1.15, padding: '16px 40px', borderRadius: 22, textAlign: 'center', maxWidth: 980 }}>
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
      <div style={{ background: 'rgba(6,12,24,0.7)', color: '#7dd3fc', fontWeight: 800, fontSize: 40, letterSpacing: 4, padding: '10px 30px', borderRadius: 999 }}>THE EXAMINER</div>
    </div>
  );
}

function AnimatedDiagram() {
  const frame = useCurrentFrame();
  // car waits 1 s, drives for 4 s, then holds in the outer lane
  const progress = interpolate(frame, [30, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <LaneTurnDiagram mode="answer" carProgress={progress} highlight={progress > 0.9 ? 'outer' : null} showQuestion={false} />;
}

export const ShortExaminerEp3Answer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      {/* Beat 1: the answer, presenter full frame */}
      <Sequence from={0} durationInFrames={CLIP}>
        <Clip src="flow/ep3ans-answer-cfr.mp4" />
        <BrandTag />
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1500 }}>
          <FadeIn><Chip color="#6ee7b7">Lane to lane. Right lane to right lane.</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Beat 2: animated diagram + presenter bubble (why clip audio) */}
      <Sequence from={CLIP} durationInFrames={CLIP}>
        <AnimatedDiagram />
        <BrandTag />
        <div style={{ position: 'absolute', top: 1560, left: 44, width: 290, height: 290, borderRadius: 145, overflow: 'hidden', border: '6px solid #7dd3fc' }}>
          <OffthreadVideo src={staticFile('flow/ep3ans-why-cfr.mp4')} style={{ width: 520, height: 924, objectFit: 'cover', marginLeft: -165, marginTop: -238 }} />
        </div>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 240 }}>
          <FadeIn><Chip color="#fbbf24" size={54}>Follow your guide line. Inner stays inner, outer stays outer.</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Beat 3: keep-right rule + CTA */}
      <Sequence from={CLIP * 2} durationInFrames={CLIP}>
        <Clip src="flow/ep3ans-cta-cfr.mp4" />
        <BrandTag />
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1500 }}>
          <FadeIn><Chip color="#7dd3fc">One turning lane, two target lanes: keep right.</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* End card */}
      <Sequence from={CLIP * 3}>
        <AbsoluteFill style={{ background: '#060c18', alignItems: 'center', justifyContent: 'center', opacity: interpolate(frame - CLIP * 3, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
            <img src={staticFile('icon-512.png')} width={190} height={190} style={{ borderRadius: 48 }} />
            <div style={{ ...font, color: '#fff', fontWeight: 800, fontSize: 60, textAlign: 'center', maxWidth: 880 }}>Train the lane choice. Free, no account.</div>
            <div style={{ ...font, color: '#7dd3fc', fontWeight: 800, fontSize: 76 }}>drivede.app</div>
            <div style={{ ...font, color: '#94a3b8', fontWeight: 600, fontSize: 40 }}>Link in bio</div>
          </div>
        </AbsoluteFill>
      </Sequence>

      <Audio src={staticFile('music.mp3')} volume={0.08} loop />
    </AbsoluteFill>
  );
};
