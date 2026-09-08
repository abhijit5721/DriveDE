/**
 * Vertical Short: "Why 1 in 3 fail" - AVATAR edition. Same narration and
 * timeline as ShortNarrated, but the synthetic presenter (SoulX-FlashHead,
 * public/avatar-en.mp4, 512x512@25fps, audio embedded = the narration track)
 * speaks on camera: full-frame for hook and cost beats, corner bubble over
 * footage/cards for the evidence beats. Posts MUST carry AI-generated flags.
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

export const AVATAR_TOTAL_FRAMES = NARR_TOTAL_FRAMES;
const AVATAR_FRAMES = Math.floor(33.92 * 30) - 2; // avatar clip length in comp frames

const COPY = {
  en: {
    caps: [
      '1 in 3 FAIL the German driving test',
      'It is not the driving. It is observation.',
      '#1  Right before left',
      '#2  The shoulder check',
      '#3  Speed discipline',
      'about 600 EUR per failed attempt',
      'Stop guessing. Measure it.',
    ],
    ctaTitle: 'Know when you are actually ready',
    ctaUrl: 'drivede.app',
    ctaHandle: '@drivedeapp',
  },
} as const;

const font = { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" } as const;

function Chip({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        ...font,
        display: 'inline-block',
        background: 'rgba(6, 12, 24, 0.82)',
        color: color ?? '#fff',
        fontWeight: 800,
        fontSize: 68,
        lineHeight: 1.15,
        padding: '18px 42px',
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

function FadeIn({ children, y = 24 }: { children: React.ReactNode; y?: number }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * y}px)` }}>{children}</div>;
}

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

function CardStill({ src }: { src: string }) {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 200], [1.0, 1.06], { extrapolateRight: 'clamp' });
  const t = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#060c18', alignItems: 'center', justifyContent: 'center' }}>
      <Img src={staticFile(src)} style={{ width: 1080, height: 1350, transform: `scale(${scale})`, opacity: t }} />
    </AbsoluteFill>
  );
}

// segment layout: 'full' = avatar fills upper frame; bubbles = small circle
type Mode = 'full' | 'bubbleTop' | 'bubbleBottom';
const SEG_MODE: Mode[] = ['full', 'full', 'bubbleTop', 'bubbleBottom', 'bubbleBottom', 'full', 'bubbleBottom'];
const CAP_COLORS = ['#fca5a5', '#7dd3fc', '#fbbf24', '#fbbf24', '#fbbf24', '#fca5a5', '#6ee7b7'];
// caption y per segment (full: below the avatar square; card: below card; footage: lower third)
const CAP_Y = [1480, 1480, 1660, 1240, 1240, 1480, 1240];

export const ShortAvatar: React.FC<{ lang: 'en' }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];

  // which segment are we in?
  let seg = 0;
  for (let i = 0; i < NARR_SEG_STARTS.length; i++) {
    if (frame >= NARR_SEG_STARTS[i]) seg = i;
  }
  const mode = SEG_MODE[seg];

  const bg: (React.ReactNode | null)[] = [
    null, // s1 full avatar
    null, // s2 full avatar
    <CardStill src="card-rvl.jpg" />, // s3
    <Footage src={`maneuvers-${lang}.mp4`} />, // s4
    <Footage src={`tracker-${lang}.mp4`} startFrom={120} />, // s5
    null, // s6 full avatar
    <Footage src={`readiness-${lang}.mp4`} />, // s7
  ];

  const avatarStyle: React.CSSProperties =
    mode === 'full'
      ? { position: 'absolute', top: 260, left: 0, width: 1080, height: 1080, borderRadius: 0 }
      : mode === 'bubbleTop'
        ? { position: 'absolute', top: 16, left: 40, width: 250, height: 250, borderRadius: 125, border: '6px solid #7dd3fc' }
        : { position: 'absolute', top: 1545, left: 40, width: 280, height: 280, borderRadius: 140, border: '6px solid #7dd3fc' };

  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      {/* background visual per segment */}
      {NARR_SEG_STARTS.map((start, i) =>
        bg[i] ? (
          <Sequence key={`bg${i}`} from={start} durationInFrames={NARR_SEG_FRAMES[i]}>
            {bg[i]}
          </Sequence>
        ) : null
      )}

      {/* the avatar: one continuous video, restyled per segment */}
      {frame < AVATAR_FRAMES && (
        <div style={{ ...avatarStyle, overflow: 'hidden' }}>
          <OffthreadVideo
            src={staticFile('avatar-en.mp4')}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* captions */}
      {NARR_SEG_STARTS.map((start, i) => (
        <Sequence key={`cap${i}`} from={start} durationInFrames={NARR_SEG_FRAMES[i]}>
          <AbsoluteFill style={{ alignItems: 'center', paddingTop: CAP_Y[i] }}>
            <FadeIn>
              <Chip color={CAP_COLORS[i]}>{c.caps[i]}</Chip>
            </FadeIn>
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* end card */}
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

      <Audio src={staticFile('music.mp3')} volume={0.1} loop />
    </AbsoluteFill>
  );
};
