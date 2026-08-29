/**
 * Vertical Short (GRO-5 video #11): "Can you start a manual car without
 * stalling?" — real cockpit-trainer gameplay (frames recorded by
 * record.ts 'cockpit' scene), TikTok-native captions, engine SFX timed to
 * the scripted gameplay beats, end-card CTA.
 * 1080x1920 @ 30fps. Footage 700 frames + 80-frame end card = 780 (26s).
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

export const SHORT_FRAMES = 780;
const FOOTAGE_FRAMES = 700;

const COPY = {
  en: {
    hook1: 'Can you start a manual car',
    hook2: 'WITHOUT stalling?',
    attempt1: 'Attempt 1',
    stalled: 'STALLED',
    attempt2: 'Attempt 2 — find the biting point',
    go: 'GO!',
    shift: 'shift to 2nd',
    ctaTitle: 'Train it before your first lesson',
    ctaUrl: 'drivede.app',
    ctaHandle: '@drivedeapp',
  },
  de: {
    hook1: 'Kannst du anfahren',
    hook2: 'OHNE abzuwürgen?',
    attempt1: 'Versuch 1',
    stalled: 'ABGEWÜRGT',
    attempt2: 'Versuch 2 — Schleifpunkt finden',
    go: 'LOS!',
    shift: 'in den 2. Gang',
    ctaTitle: 'Üb es vor deiner ersten Fahrstunde',
    ctaUrl: 'drivede.app',
    ctaHandle: '@drivedeapp',
  },
} as const;

const font = {
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
} as const;

/** bold caption chip with the TikTok white-on-dark look */
function Chip({ children, big, color }: { children: React.ReactNode; big?: boolean; color?: string }) {
  return (
    <div
      style={{
        ...font,
        display: 'inline-block',
        background: 'rgba(6, 12, 24, 0.82)',
        color: color ?? '#fff',
        fontWeight: 800,
        fontSize: big ? 84 : 54,
        lineHeight: 1.15,
        padding: big ? '18px 42px' : '12px 30px',
        borderRadius: 22,
        letterSpacing: 0.5,
      }}
    >
      {children}
    </div>
  );
}

/** Fades in over the first 8 frames OF ITS PARENT SEQUENCE. Inside a
 *  <Sequence>, useCurrentFrame() is already sequence-relative, so this must
 *  interpolate from 0 - comparing against the absolute start frame kept every
 *  caption after the first pinned at opacity 0. */
function FadeIn({ children, y = 24 }: { children: React.ReactNode; y?: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)` }}>{children}</div>;
}

export const ShortCockpit: React.FC<{ lang: 'de' | 'en' }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];

  // footage: 780x1688 (DPR2 of 390x844) scaled to cover width 1080 -> 2337px
  // tall; crop the app header off the top, nav bar falls off the bottom.
  const shake = frame >= 132 && frame <= 152 ? Math.sin(frame * 2.2) * 9 : 0;

  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      {frame < FOOTAGE_FRAMES + 15 && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ transform: `translate(${shake}px, ${-165 + shake * 0.4}px)` }}>
            <OffthreadVideo
              src={staticFile(`cockpit-${lang}.mp4`)}
              style={{ width: 1080, height: 2337, objectFit: 'cover' }}
              muted
            />
          </div>
        </AbsoluteFill>
      )}

      {/* captions */}
      <Sequence from={4} durationInFrames={72}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 130 }}>
          <FadeIn>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
              <Chip>{c.hook1}</Chip>
              <Chip big color="#7dd3fc">{c.hook2} 🚗</Chip>
            </div>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={80} durationInFrames={48}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 150 }}>
          <FadeIn><Chip>{c.attempt1}</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={132} durationInFrames={60}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ transform: `rotate(-7deg) scale(${interpolate(frame - 132, [0, 6], [1.6, 1], { extrapolateRight: 'clamp' })})` }}>
            <Chip big color="#f87171">{c.stalled} 💀</Chip>
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={200} durationInFrames={70}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 150 }}>
          <FadeIn><Chip>{c.attempt2}</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={330} durationInFrames={70}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 150 }}>
          <FadeIn><Chip big color="#6ee7b7">{c.go} 🚗💨</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={432} durationInFrames={56}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 150 }}>
          <FadeIn><Chip>{c.shift} ⬆️</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* end card */}
      <Sequence from={FOOTAGE_FRAMES}>
        <AbsoluteFill
          style={{
            background: '#060c18',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: interpolate(frame - FOOTAGE_FRAMES, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
            <img src={staticFile('icon-512.png')} width={200} height={200} style={{ borderRadius: 48 }} />
            <div style={{ ...font, color: '#fff', fontWeight: 800, fontSize: 62, textAlign: 'center', maxWidth: 860 }}>
              {c.ctaTitle}
            </div>
            <div style={{ ...font, color: '#7dd3fc', fontWeight: 800, fontSize: 76 }}>{c.ctaUrl}</div>
            <div style={{ ...font, color: '#94a3b8', fontWeight: 600, fontSize: 40 }}>{c.ctaHandle}</div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* music bed */}
      <Audio src={staticFile('music.mp3')} volume={0.22} />

      {/* engine SFX timed to the scripted gameplay (recorded footage is silent) */}
      {/* attempt 1: ignition at f56, idle loop, cut hard at the stall (f130) */}
      <Sequence from={56} durationInFrames={40}>
        <Audio src={staticFile('sfx/engine-start.mp3')} volume={0.85} />
      </Sequence>
      <Sequence from={92} durationInFrames={38}>
        <Audio src={staticFile('sfx/engine-loop.mp3')} loop volume={0.5} />
      </Sequence>
      {/* attempt 2: ignition f220, idle, revs rise as the car moves off, higher pitch in 2nd */}
      <Sequence from={220} durationInFrames={40}>
        <Audio src={staticFile('sfx/engine-start.mp3')} volume={0.85} />
      </Sequence>
      <Sequence from={256} durationInFrames={174}>
        <Audio src={staticFile('sfx/engine-loop.mp3')} loop volume={(f) => interpolate(f, [0, 60, 173], [0.45, 0.6, 0.66], { extrapolateRight: 'clamp' })} playbackRate={1.15} />
      </Sequence>
      <Sequence from={430} durationInFrames={22}>
        <Audio src={staticFile('sfx/engine-loop.mp3')} loop volume={0.4} playbackRate={0.95} />
      </Sequence>
      <Sequence from={452} durationInFrames={FOOTAGE_FRAMES - 452}>
        <Audio src={staticFile('sfx/engine-loop.mp3')} loop volume={0.6} playbackRate={1.45} />
      </Sequence>
    </AbsoluteFill>
  );
};
