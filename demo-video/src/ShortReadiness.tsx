/**
 * Vertical Short: "How do you know you are actually ready?" - the exam
 * readiness gauge as the answer. Footage recorded by record.ts 'readiness'
 * scene (dashboard, 300 frames / 10s at 30fps).
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

export const READINESS_FRAMES = 380;
const FOOTAGE_FRAMES = 300;

const COPY = {
  en: {
    hook1: 'Your instructor says',
    hook2: '"maybe a few more lessons"',
    beat1: 'Every lesson costs 90 euros',
    beat2: 'So know before you book',
    beat3: 'Readiness from your real drives',
    ctaTitle: 'Stop guessing when you are ready',
    ctaUrl: 'drivede.app',
    ctaHandle: '@drivedeapp',
  },
  de: {
    hook1: 'Dein Fahrlehrer sagt',
    hook2: '"vielleicht noch ein paar Stunden"',
    beat1: 'Jede Fahrstunde kostet 90 Euro',
    beat2: 'Wisse es, bevor du buchst',
    beat3: 'Prüfungsreife aus echten Fahrten',
    ctaTitle: 'Schluss mit Raten',
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

export const ShortReadiness: React.FC<{ lang: 'de' | 'en' }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];

  // footage 390x844 -> cover 1080 wide (2337 tall); pull up so the gauge card
  // sits in the upper third where the eye lands first in a vertical feed.
  const drift = interpolate(frame, [0, FOOTAGE_FRAMES], [-120, -210], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      {frame < FOOTAGE_FRAMES + 15 && (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ transform: `translateY(${drift}px)` }}>
            <OffthreadVideo
              src={staticFile(`readiness-${lang}.mp4`)}
              style={{ width: 1080, height: 2337, objectFit: 'cover' }}
              muted
            />
          </div>
        </AbsoluteFill>
      )}

      <Sequence from={4} durationInFrames={70}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1180 }}>
          <FadeIn>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', maxWidth: 960 }}>
              <Chip>{c.hook1}</Chip>
              <Chip big color="#fca5a5">{c.hook2}</Chip>
            </div>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={80} durationInFrames={62}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1240 }}>
          <FadeIn><Chip big color="#fbbf24">{c.beat1}</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={150} durationInFrames={64}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1240 }}>
          <FadeIn><Chip big color="#7dd3fc">{c.beat2}</Chip></FadeIn>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={222} durationInFrames={FOOTAGE_FRAMES - 222}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1240 }}>
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
