/**
 * "Roundabout in 15 seconds" - AutoDad-style 3D explainer. Two Google Flow
 * clips (public/flow/veo-rb-1.mp4 + veo-rb-2.mp4, 720x1280, 8 s each) + hook-first text
 * beats + Chatterbox VO (public/vo-narrator/rb-{lang}/s1..4.wav, synthetic:
 * posts MUST carry AI flags). Hook text lands on frame 0 - no brand-first.
 * Ends on a comment-bait card. 1080x1920 @ 30fps.
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

const VIDEO_FRAMES = 480;
export const RB_TOTAL_FRAMES = VIDEO_FRAMES + 85;

const COPY = {
  de: {
    hook: 'KREISVERKEHR\nIN 15 SEK',
    beat1: 'Im Kreisel = VORFAHRT',
    beat2: 'Einfahren: NICHT blinken!',
    beat3: 'Ausfahrt: Blinker RECHTS\n+ Schulterblick',
    bait: 'Blinkst du beim Einfahren?',
    bait2: 'Ehrlich! 👇',
    url: 'drivede.app',
  },
  en: {
    hook: 'GERMAN ROUNDABOUT\nIN 15 SEC',
    beat1: 'Ring traffic has PRIORITY',
    beat2: 'Entering: NO signal!',
    beat3: 'Exit: signal RIGHT\n+ shoulder check',
    bait: 'Do you signal when entering?',
    bait2: 'Be honest 👇',
    url: 'drivede.app',
  },
} as const;

const font = { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" } as const;

function Punch({ children, color = '#fff', size = 84, stroke = true, fade = true }: {
  children: React.ReactNode; color?: string; size?: number; stroke?: boolean; fade?: boolean;
}) {
  const frame = useCurrentFrame();
  // The hook passes fade={false}: a fade-in would leave frame 0 blank, and
  // frame 0 is both the first thing the feed shows and the cover thumbnail.
  const t = fade
    ? interpolate(frame, [0, 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1;
  const pop = interpolate(frame, [0, 5, 9], [0.7, 1.06, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        ...font,
        opacity: t,
        transform: `scale(${pop})`,
        color,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.08,
        textAlign: 'center',
        whiteSpace: 'pre-line',
        letterSpacing: 1,
        WebkitTextStroke: stroke ? '3px rgba(6,12,24,0.9)' : undefined,
        textShadow: '0 4px 24px rgba(0,0,0,0.55)',
        maxWidth: 980,
      }}
    >
      {children}
    </div>
  );
}

export const RoundaboutExplainer: React.FC<{ lang: 'de' | 'en' }> = ({ lang }) => {
  const frame = useCurrentFrame();
  const c = COPY[lang];

  return (
    <AbsoluteFill style={{ background: '#060c18' }}>
      {/* Background: two Google Flow (Veo) clips, 8 s each at 30 fps = 480 frames.
          Clip 1: the red car circulates, the blue car waits at the entry (yield).
          Clip 2: the blue car enters without a signal, drives round anticlockwise
          and exits at the top. The Blender render used before showed a car
          crossing the island in a straight line and was pulled on 12 Sep. */}
      {frame < 240 && (
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile('flow/veo-rb-1-cfr.mp4')}
            style={{ width: 1080, height: 1920, objectFit: 'cover' }}
            muted
          />
        </AbsoluteFill>
      )}
      {frame >= 240 && frame < VIDEO_FRAMES + 12 && (
        <Sequence from={240} durationInFrames={VIDEO_FRAMES + 12 - 240}>
          <AbsoluteFill>
            {/* Veo drove this one clockwise (up the left of the island). The -cfr-mirrored
                file is the same clip flipped horizontally with ffmpeg, so the car enters,
                passes on the right and exits at the top: anticlockwise, as German
                roundabouts are driven. No text or signage in the clip reads wrong mirrored.
                Both clips are re-encoded to constant 30 fps; Remotion's compositor failed
                on the variable-frame-rate originals. */}
            <OffthreadVideo
              src={staticFile('flow/veo-rb-2-cfr-mirrored.mp4')}
              style={{ width: 1080, height: 1920, objectFit: 'cover' }}
              muted
            />
          </AbsoluteFill>
        </Sequence>
      )}

      {/* HOOK on frame 0 - the first thing the test batch sees */}
      <Sequence from={0} durationInFrames={95}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 240 }}>
          <Punch color="#fbbf24" size={104} fade={false}>{c.hook}</Punch>
        </AbsoluteFill>
      </Sequence>

      {/* brand tag only after the hook has done its job */}
      {frame >= 95 && frame < VIDEO_FRAMES && (
        <div style={{ ...font, position: 'absolute', top: 56, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(6,12,24,0.65)', color: '#7dd3fc', fontWeight: 800, fontSize: 34, letterSpacing: 4, padding: '8px 26px', borderRadius: 999 }}>
            DRIVEDE
          </div>
        </div>
      )}

      <Sequence from={100} durationInFrames={78}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1440 }}>
          <Punch color="#fca5a5" size={78}>{c.beat1}</Punch>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={185} durationInFrames={110}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1440 }}>
          <Punch color="#7dd3fc" size={84}>{c.beat2}</Punch>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={305} durationInFrames={VIDEO_FRAMES - 305}>
        <AbsoluteFill style={{ alignItems: 'center', paddingTop: 1440 }}>
          <Punch color="#6ee7b7" size={76}>{c.beat3}</Punch>
        </AbsoluteFill>
      </Sequence>

      {/* comment-bait end card */}
      <Sequence from={VIDEO_FRAMES}>
        <AbsoluteFill
          style={{
            background: '#060c18',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: interpolate(frame - VIDEO_FRAMES, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
            <Punch color="#fff" size={82} stroke={false}>{c.bait}</Punch>
            <Punch color="#fbbf24" size={96} stroke={false}>{c.bait2}</Punch>
            <div style={{ ...font, color: '#7dd3fc', fontWeight: 800, fontSize: 52, marginTop: 26 }}>{c.url}</div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* VO timed to the beats */}
      <Sequence from={4}><Audio src={staticFile(`vo-narrator/rb-${lang}/s1.wav`)} /></Sequence>
      <Sequence from={102}><Audio src={staticFile(`vo-narrator/rb-${lang}/s2.wav`)} /></Sequence>
      <Sequence from={210}><Audio src={staticFile(`vo-narrator/rb-${lang}/s3.wav`)} /></Sequence>
      <Sequence from={330}><Audio src={staticFile(`vo-narrator/rb-${lang}/s4.wav`)} /></Sequence>
      <Audio src={staticFile('music.mp3')} volume={0.1} loop />
    </AbsoluteFill>
  );
};
