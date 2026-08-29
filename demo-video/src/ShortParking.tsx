/**
 * Vertical Short: the 3D parallel-parking trainer, step by step. Footage
 * recorded by record.ts 'maneuvers' scene (animated maneuver player,
 * 300 frames / 10s at 30fps).
 * 1080x1920 @ 30fps. 300 footage frames + 80-frame end card = 380 (~12.7s).
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

export const PARKING_FRAMES = 380;
const FOOTAGE_FRAMES = 300;

const COPY = {
  en: {
    hook1: 'Parallel parking',
    hook2: 'is just 5 reference points',
    beat1: 'Not talent. A sequence.',
    beat2: 'Watch it before the lesson',
    beat3: 'Then it works under pressure',
    ctaTitle: 'Free 3D parking trainer',
    ctaUrl: 'drivede.app',
    ctaHandle: '@drivedeapp',
  },
  de: {
    hook1: 'Einparken',
    hook2: 'sind nur 5 Referenzpunkte',
    beat1: 'Kein Talent. Eine Abfolge.',
    beat2: 'Üb es vor der Fahrstunde',
    beat3: 'Dann klappt es auch nervös',
    ctaTitle: 'Kostenloser 3D-Einparktrainer',
    ctaUrl: 'drivede.app',
    ctaHandle: '@drivedeapp',
  },
} as const;

const font = { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" } as const;

function Chip({ children, big, color }: { children: React.ReactNode; big?: boolean; color?: string }) {
  return (
    <div
      style={{
        ...font,
        display: 'inline-block',
        background: 'rgba(6, 12, 24, 0.82)',
        color: color ?? '#fff',
        fontWeight: 800,
        fontSize: big ? 78 : 52,
        lineHeight: 1.15,
        padding: big ? '18px 42px' : '12px 30px',
        borderRadius: 22,
        letterSpacing: 0.5,
        textAlign: 'center',
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

export const ShortParking: React.FC<{ lang: 'de' | 'en' }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];

  // keep the animated car diagram (upper-middle of the phone) centred in frame
  const drift = interpolate(frame, [0, FOOTAGE_FRAMES], [-260, -320], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      {frame < FOOTAGE_FRAMES + 15 && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ transform: `translateY(${drift}px)` }}>
            <OffthreadVideo
              src={staticFile(`maneuvers-${lang}.mp4`)}
              style={{ width: 1080, height: 2337, objectFit: 'cover' }}
              muted
            />
          </div>
        </AbsoluteFill>
      )}

      <Sequence from={4} durationInFrames={70}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1490 }}>
          <FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', maxWidth: 960 }}>
              <Chip>{c.hook1}</Chip>
              <Chip big color="#7dd3fc">{c.hook2}</Chip>
            </div>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={80} durationInFrames={62}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1540 }}>
          <FadeIn><Chip big color="#fbbf24">{c.beat1}</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={150} durationInFrames={64}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1540 }}>
          <FadeIn><Chip big>{c.beat2}</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={222} durationInFrames={FOOTAGE_FRAMES - 222}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1540 }}>
          <FadeIn><Chip big color="#6ee7b7">{c.beat3}</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

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

      <Audio src={staticFile('music.mp3')} volume={0.24} />
    </AbsoluteFill>
  );
};
