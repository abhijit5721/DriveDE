/**
 * Vertical Short: "Why 1 in 3 fail" - fully narrated (Chatterbox TTS, MIT
 * licence, synthetic voice - posts MUST carry the AI-generated flags).
 * Seven narration segments (public/vo-narrator/<lang>/s1..s7.wav), each with
 * its own visual: app footage for motion beats, styled card stills for the
 * rule beats, end card CTA. Timings come from src/narratorTimings.ts which is
 * generated from the real WAV durations by scripts/gen-narrator-timings.mjs.
 * 1080x1920 @ 30fps.
 */
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {
  NARR_SEG_FRAMES,
  NARR_SEG_STARTS,
  NARR_SPEECH_FRAMES,
  NARR_TOTAL_FRAMES,
} from './narratorTimings.ts';

export { NARR_TOTAL_FRAMES };

const COPY = {
  en: {
    caps: [
      '1 in 3 FAIL the German driving test',
      'It is not the driving. It is observation.',
      '#1  Right before left',
      '#2  The shoulder check',
      '#3  Speed discipline',
      '',
      'Stop guessing. Measure it.',
    ],
    ctaTitle: 'Know when you are actually ready',
    ctaUrl: 'drivede.app',
    ctaHandle: '@drivedeapp',
  },
  de: {
    caps: [
      'Jeder Dritte fällt durch',
      'Es liegt nicht am Fahren. Sondern am Blick.',
      '#1  Rechts vor links',
      '#2  Der Schulterblick',
      '#3  Das Tempo',
      '',
      'Rate nicht. Miss es.',
    ],
    ctaTitle: 'Wisse, wann du wirklich bereit bist',
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
        fontSize: big ? 72 : 52,
        lineHeight: 1.15,
        padding: big ? '18px 42px' : '12px 30px',
        borderRadius: 22,
        letterSpacing: 0.5,
        textAlign: 'center',
        maxWidth: 960,
      }}
    >
      {children}
    </div>
  );
}

/** Sequence-relative fade (useCurrentFrame() is relative inside <Sequence>). */
function FadeIn({ children, y = 24 }: { children: React.ReactNode; y?: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)` }}>{children}</div>;
}

/** App footage (390x844 recording) scaled to cover 1080 wide with slow drift. */
function Footage({ src, startFrom = 0, pullUp = -140 }: { src: string; startFrom?: number; pullUp?: number }) {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 240], [pullUp, pullUp - 70], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#060c18' }}>
      <div style={{ transform: `translateY(${drift}px)` }}>
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={startFrom}
          style={{ width: 1080, height: 2337, objectFit: 'cover' }}
          muted
        />
      </div>
    </AbsoluteFill>
  );
}

/** 1080x1350 card centered with a slow zoom on the dark brand background. */
function CardStill({ src }: { src: string }) {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 200], [1.0, 1.06], { extrapolateRight: 'clamp' });
  const t = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#060c18', alignItems: 'center', justifyContent: 'center' }}>
      <Img
        src={staticFile(src)}
        style={{ width: 1080, height: 1350, transform: `scale(${scale})`, opacity: t }}
      />
    </AbsoluteFill>
  );
}

/** Full-screen brand-style stat for the cost beat. */
function BigStat({ title, sub }: { title: string; sub: string }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const grow = interpolate(frame, [0, 14], [0.92, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#060c18', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ opacity: t, transform: `scale(${grow})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        <div style={{ ...font, color: '#fca5a5', fontWeight: 800, fontSize: 108, letterSpacing: 1, textAlign: 'center', maxWidth: 960 }}>{title}</div>
        <div style={{ ...font, color: '#94a3b8', fontWeight: 700, fontSize: 54, textAlign: 'center' }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
}

const CAP_COLORS = ['#fca5a5', '#7dd3fc', '#fbbf24', '#fbbf24', '#fbbf24', '#fca5a5', '#6ee7b7'];
// caption vertical position per segment: over footage -> lower third; over
// cards -> below the card art (cards are 1350 tall, centered -> ends at 1635).
const CAP_TOP = [1180, 1240, 1660, 1240, 1240, 1660, 1240];

export const ShortNarrated: React.FC<{ lang: 'de' | 'en' }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];

  // Visual per segment index (0-based)
  const visuals: React.ReactNode[] = [
    <Footage src={`tracker-${lang}.mp4`} />,            // s1 hook: live drive map
    <Footage src={`tracker-${lang}.mp4`} startFrom={105} />, // s2: observation
    <CardStill src="card-rvl.jpg" />,                    // s3: rechts vor links card
    <Footage src={`maneuvers-${lang}.mp4`} />,           // s4: maneuver steps incl. observation checks
    <Footage src={`tracker-${lang}.mp4`} startFrom={120} />, // s5: speed HUD
    <BigStat title={lang === 'de' ? 'rund 600 EUR' : 'about 600 EUR'} sub={lang === 'de' ? 'pro Fehlversuch' : 'per failed attempt'} />, // s6
    <Footage src={`readiness-${lang}.mp4`} />,           // s7 CTA: readiness gauge
  ];

  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      {NARR_SEG_STARTS.map((start, i) => (
        <Sequence key={`v${i}`} from={start} durationInFrames={NARR_SEG_FRAMES[i]}>
          {visuals[i]}
          {c.caps[i] !== '' && (
            <AbsoluteFill style={{ alignItems: 'center', paddingTop: CAP_TOP[i] }}>
              <FadeIn>
                <Chip big color={CAP_COLORS[i]}>{c.caps[i]}</Chip>
              </FadeIn>
            </AbsoluteFill>
          )}
          <Audio src={staticFile(`vo-narrator/${lang}/s${i + 1}.wav`)} />
        </Sequence>
      ))}

      <Sequence from={NARR_SPEECH_FRAMES}>
        <AbsoluteFill
          style={{
            background: '#060c18',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: interpolate(frame - NARR_SPEECH_FRAMES, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
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

      <Audio src={staticFile('music.mp3')} volume={0.12} loop />
    </AbsoluteFill>
  );
};
