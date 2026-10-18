/**
 * Feature short: the Prüfungssimulation (20 exam situations). 1080x1920 @ 30fps.
 * Footage: the vertical tutorial screencasts tut-steps-<lang>.mp4 (order the steps) and
 * tut-free-<lang>.mp4 (free answer), 390x844 scaled to cover the width like ShortCockpit.
 * Timeline: steps 0-360 (clip from 4 s, so the check result is in shot), free answer 360-780, end card 780-870 (29 s).
 * Voice-over: public/vo-short-sim/<lang>/{hook,steps,free,cta}.mp3 (record/make-vo-short-sim.py).
 */
import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';

export const SIM_SHORT_FRAMES = 870;
const STEPS_FRAMES = 360;
const FREE_START = 360;
const END_START = 780;

const COPY = {
  en: {
    hook1: 'New in DriveDE',
    hook2: 'The exam situations,\nbefore the exam',
    steps: 'Tap the steps in the right order',
    checked: 'Checked at once ✅',
    free: 'Or explain it in your own words',
    graded: 'Graded like the examiner grades',
    ctaTitle: '20 exam situations',
    ctaSub: 'Free, no account',
    ctaUrl: 'drivede.app',
    ctaHandle: '@drivedeapp',
  },
  de: {
    hook1: 'Neu in DriveDE',
    hook2: 'Die Prüfungssituationen,\nvor der Prüfung',
    steps: 'Tippe die Schritte in der richtigen Reihenfolge',
    checked: 'Sofort geprüft ✅',
    free: 'Oder erkläre es in eigenen Worten',
    graded: 'Bewertet wie beim Prüfer',
    ctaTitle: '20 Prüfungssituationen',
    ctaSub: 'Kostenlos, ohne Konto',
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
        whiteSpace: 'pre-line',
        textAlign: 'center',
        maxWidth: 940,
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

const Caption: React.FC<{ from: number; duration: number; top?: number; children: React.ReactNode }> = ({ from, duration, top = 140, children }) => (
  <Sequence from={from} durationInFrames={duration}>
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: top }}>
      <FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>{children}</div>
      </FadeIn>
    </AbsoluteFill>
  </Sequence>
);

export const ShortSimulation: React.FC<{ lang: 'de' | 'en' }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];
  // 390x844 clips scaled to cover 1080 wide -> 2337 tall; the app header is cropped off the top
  const clipStyle = { width: 1080, height: 2337, objectFit: 'cover' as const };

  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      <Sequence from={0} durationInFrames={STEPS_FRAMES + 10}>
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ transform: 'translateY(-165px)' }}>
            <OffthreadVideo src={staticFile(`tut-steps-${lang}.mp4`)} startFrom={120} style={clipStyle} muted />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={FREE_START} durationInFrames={END_START - FREE_START + 10}>
        <AbsoluteFill style={{ overflow: 'hidden' }}>
          <div style={{ transform: 'translateY(-165px)' }}>
            <OffthreadVideo src={staticFile(`tut-free-${lang}.mp4`)} style={clipStyle} muted />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* captions */}
      <Caption from={4} duration={86} top={120}>
        <Chip>{c.hook1}</Chip>
        <Chip big color="#7dd3fc">{c.hook2}</Chip>
      </Caption>
      <Caption from={110} duration={120}>
        <Chip>{c.steps}</Chip>
      </Caption>
      <Caption from={296} duration={64}>
        <Chip big color="#6ee7b7">{c.checked}</Chip>
      </Caption>
      <Caption from={FREE_START + 10} duration={160}>
        <Chip>{c.free}</Chip>
      </Caption>
      <Caption from={FREE_START + 200} duration={200}>
        <Chip big color="#7dd3fc">{c.graded}</Chip>
      </Caption>

      {/* end card */}
      <Sequence from={END_START}>
        <AbsoluteFill
          style={{
            background: '#060c18',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: interpolate(frame - END_START, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
            <img src={staticFile('icon-512.png')} width={200} height={200} style={{ borderRadius: 48 }} />
            <div style={{ ...font, color: '#fff', fontWeight: 800, fontSize: 66, textAlign: 'center', maxWidth: 900 }}>{c.ctaTitle}</div>
            <div style={{ ...font, color: '#94a3b8', fontWeight: 600, fontSize: 46 }}>{c.ctaSub}</div>
            <div style={{ ...font, color: '#7dd3fc', fontWeight: 800, fontSize: 76 }}>{c.ctaUrl}</div>
            <div style={{ ...font, color: '#94a3b8', fontWeight: 600, fontSize: 40 }}>{c.ctaHandle}</div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* voice-over and music bed */}
      <Sequence from={6}><Audio src={staticFile(`vo-short-sim/${lang}/hook.mp3`)} /></Sequence>
      <Sequence from={112}><Audio src={staticFile(`vo-short-sim/${lang}/steps.mp3`)} /></Sequence>
      <Sequence from={FREE_START + 12}><Audio src={staticFile(`vo-short-sim/${lang}/free.mp3`)} /></Sequence>
      <Sequence from={END_START + 4}><Audio src={staticFile(`vo-short-sim/${lang}/cta.mp3`)} /></Sequence>
      <Audio src={staticFile('music.mp3')} volume={0.16} />
    </AbsoluteFill>
  );
};
