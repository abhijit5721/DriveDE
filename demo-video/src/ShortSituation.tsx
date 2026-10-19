/**
 * Situation short: one exam situation in about 40 s, 1080x1920 @ 30fps.
 * Texts and narration timings come from src/situationShorts.json, written by
 * record/make-situation-short.mjs (which also renders the MP3s to public/vo-sit/<id>/<lang>/).
 * Beats: hook title, the situation, the examiner's German instruction, the key points
 * one by one, the severe mistake, end card. Every caption appears when its line is spoken.
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import shorts from './situationShorts.json';

type Seg = { from: number; frames: number; text: string };
type Data = { title: string; situation: string; examinerDe: string; examinerEn: string; points: { label: string; severe: boolean }[]; severe: { text: string; why: string }; law: string; segments: Record<string, Seg>; totalFrames: number; fps: number };
const DATA = shorts as Record<string, Record<'de' | 'en', Data>>;

export const situationFrames = (id: string, lang: 'de' | 'en') => DATA[id]?.[lang]?.totalFrames ?? 1200;
export const situationIds = () => Object.keys(DATA);

const font = { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" } as const;
const NAVY = '#060c18', BLUE = '#60a5fa', MUTED = '#94a3b8', RED = '#f87171', GREEN = '#6ee7b7';

function Rise({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } });
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * 40}px)` }}>{children}</div>;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ ...font, color: BLUE, fontWeight: 800, fontSize: 30, letterSpacing: 3, textTransform: 'uppercase' }}>{children}</div>
);

export const ShortSituation: React.FC<{ id: string; lang: 'de' | 'en' }> = ({ id, lang }) => {
  const d = DATA[id][lang];
  const frame = useCurrentFrame();
  const seg = d.segments;
  const de = lang === 'de';
  const pointKeys = Object.keys(seg).filter((k) => /^p\d$/.test(k));
  const pointsStart = seg[pointKeys[0]].from;
  const severeStart = seg.severe.from;
  const ctaStart = seg.cta.from;
  const endStart = ctaStart - 6;

  return (
    <AbsoluteFill style={{ background: NAVY, color: '#fff', ...font }}>
      {/* soft road graphic: two lane lines rising into the distance */}
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
        <path d="M 200 1920 L 480 400 L 600 400 L 880 1920 Z" fill="#1e3a8a" />
        <path d="M 540 1920 L 540 400" stroke="#93c5fd" strokeWidth={10} strokeDasharray="60 80" />
      </svg>

      {/* header strip, always on */}
      <div style={{ position: 'absolute', top: 90, left: 70, right: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <img src={staticFile('icon-512.png')} width={64} height={64} style={{ borderRadius: 16 }} />
          <span style={{ fontWeight: 800, fontSize: 36 }}>DriveDE</span>
        </div>
        <span style={{ color: MUTED, fontWeight: 600, fontSize: 28 }}>{de ? 'Praktische Prüfung' : 'German driving test'}</span>
      </div>

      {/* hook */}
      {frame < seg.situation.from && (
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
          <Rise>
            <Label>{de ? 'Prüfungssituation' : 'Exam situation'}</Label>
            <div style={{ fontWeight: 800, fontSize: 96, lineHeight: 1.08, marginTop: 18, textWrap: 'balance' as never }}>{d.title}</div>
            <div style={{ color: BLUE, fontWeight: 700, fontSize: 48, marginTop: 28 }}>{de ? 'Was der Prüfer sehen will' : 'What the examiner wants to see'}</div>
          </Rise>
        </AbsoluteFill>
      )}

      {/* situation and examiner line */}
      {frame >= seg.situation.from && frame < pointsStart && (
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px', gap: 40 }}>
          <Rise>
            <Label>{d.title}</Label>
            <div style={{ fontSize: 50, lineHeight: 1.35, marginTop: 16, color: '#e2e8f0' }}>{d.situation}</div>
          </Rise>
          {frame >= seg.examiner.from && (
            <Rise>
              <div style={{ background: 'rgba(96,165,250,0.14)', border: '2px solid rgba(96,165,250,0.5)', borderRadius: 28, padding: '30px 36px' }}>
                <div style={{ color: BLUE, fontWeight: 800, fontSize: 26, letterSpacing: 2, textTransform: 'uppercase' }}>{de ? 'Der Prüfer sagt' : 'The examiner says'}</div>
                <div style={{ fontWeight: 800, fontSize: 54, lineHeight: 1.2, marginTop: 10 }}>„{d.examinerDe}“</div>
                {!de && <div style={{ color: MUTED, fontSize: 36, marginTop: 10, fontStyle: 'italic' }}>"{d.examinerEn}"</div>}
              </div>
            </Rise>
          )}
        </AbsoluteFill>
      )}

      {/* key points, one per narration line */}
      {frame >= pointsStart && frame < severeStart && (
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
          <Label>{de ? 'Das will der Prüfer sehen' : 'The examiner wants to see'}</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginTop: 30 }}>
            {pointKeys.map((k, i) => frame >= seg[k].from && (
              <Rise key={k}>
                <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: '26px 30px' }}>
                  <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 18, background: d.points[i].severe ? RED : BLUE, color: NAVY, fontWeight: 800, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                  <div style={{ fontSize: 42, lineHeight: 1.3, fontWeight: 600 }}>{d.points[i].label}</div>
                </div>
              </Rise>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* severe mistake */}
      {frame >= severeStart && frame < endStart && (
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 80px' }}>
          <Rise>
            <div style={{ background: 'rgba(248,113,113,0.12)', border: '2px solid rgba(248,113,113,0.6)', borderRadius: 28, padding: '36px 40px' }}>
              <div style={{ color: RED, fontWeight: 800, fontSize: 30, letterSpacing: 3, textTransform: 'uppercase' }}>{de ? 'Schwerer Fehler' : 'Severe mistake'}</div>
              <div style={{ fontWeight: 800, fontSize: 60, lineHeight: 1.15, marginTop: 14 }}>{d.severe.text}</div>
              <div style={{ color: '#fecaca', fontSize: 40, lineHeight: 1.35, marginTop: 22 }}>{d.severe.why}</div>
            </div>
            <div style={{ color: MUTED, fontSize: 32, marginTop: 30 }}>{d.law}</div>
          </Rise>
        </AbsoluteFill>
      )}

      {/* end card */}
      {frame >= endStart && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: interpolate(frame - endStart, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, padding: '0 80px', textAlign: 'center' }}>
            <img src={staticFile('icon-512.png')} width={200} height={200} style={{ borderRadius: 48 }} />
            <div style={{ fontWeight: 800, fontSize: 66, lineHeight: 1.1 }}>{de ? 'Alle 20 Prüfungssituationen' : 'All 20 exam situations'}</div>
            <div style={{ color: GREEN, fontWeight: 700, fontSize: 46 }}>{de ? 'Kostenlos, ohne Konto' : 'Free, no account'}</div>
            <div style={{ color: BLUE, fontWeight: 800, fontSize: 76 }}>drivede.app</div>
            <div style={{ color: MUTED, fontWeight: 600, fontSize: 40 }}>@drivedeapp</div>
          </div>
        </AbsoluteFill>
      )}

      {/* narration, one file per beat, and the music bed */}
      {Object.entries(seg).map(([k, s]) => (
        <Sequence key={k} from={s.from} durationInFrames={s.frames + 8}>
          <Audio src={staticFile(`vo-sit/${id}/${lang}/${k}.mp3`)} />
        </Sequence>
      ))}
      <Audio src={staticFile('music.mp3')} volume={0.14} loop />
    </AbsoluteFill>
  );
};
