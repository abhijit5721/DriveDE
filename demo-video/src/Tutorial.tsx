import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { Background } from './components/Background.tsx';
import { PhoneFrame, PHONE_W, PHONE_H } from './components/PhoneFrame.tsx';
import { Caption } from './components/Caption.tsx';
import timingsDe from './tutorialTimings.de.json';
import timingsEn from './tutorialTimings.en.json';
import clips from './tutorialClips.json';

const { fontFamily } = loadFont();
export const FPS = 30;
type Lang = 'de' | 'en';

/** Scene order of the walkthrough; `clip` names frames/tut-<clip>-<lang> after assemble. */
const SCENES: { id: string; clip: string | null; text: Record<Lang, string>; title?: Record<Lang, string> }[] = [
  { id: 's01', clip: 'landing', title: { de: 'DriveDE', en: 'DriveDE' }, text: { de: 'Die App für die praktische Prüfung', en: 'The app for the practical driving test' } },
  { id: 's02', clip: 'start', text: { de: 'Start ohne Anmeldung', en: 'Start without registering' } },
  { id: 's03', clip: 'simlist', text: { de: 'Prüfungssimulation', en: 'Exam simulation' } },
  { id: 's04', clip: 'steps', text: { de: 'Schritte in die richtige Reihenfolge bringen', en: 'Put the steps in the right order' } },
  { id: 's05', clip: 'free', text: { de: 'Oder in eigenen Worten', en: 'Or in your own words' } },
  { id: 's06', clip: 'protocol', text: { de: 'Deine Bewertung wie beim Prüfer', en: 'Your rating, the examiner\'s way' } },
  { id: 's07', clip: 'maneuvers', text: { de: 'Manöver Schritt für Schritt', en: 'Manoeuvres step by step' } },
  { id: 's08', clip: 'tracker', text: { de: 'Fahrstunde aufzeichnen', en: 'Record a lesson' } },
  { id: 's09', clip: 'history', text: { de: 'Nachbereiten und Kosten im Blick', en: 'Review, and keep an eye on costs' } },
  { id: 's10', clip: 'account', text: { de: 'Konto sichern, Pro später', en: 'Secure the account, Pro later' } },
  { id: 's11', clip: null, title: { de: 'drivede.app', en: 'drivede.app' }, text: { de: 'Kostenlos, ohne Anmeldung', en: 'Free, no registration' } },
];

const timings = (lang: Lang) => (lang === 'de' ? timingsDe : timingsEn);
/** A scene lasts as long as its narration plus pause, but never shorter than its recording. */
const sceneFrames = (lang: Lang, i: number) => {
  const clip = SCENES[i].clip ? (clips as Record<string, number>)[SCENES[i].clip!] : 0;
  return Math.round(Math.max(timings(lang).scenes[i].seconds, clip) * FPS);
};
export const tutorialFrames = (lang: Lang) => SCENES.reduce((n, _s, i) => n + sceneFrames(lang, i), 0);
/** Scene start times in seconds, for YouTube chapters. */
export const tutorialChapters = (lang: Lang) => { let f = 0; return SCENES.map((s, i) => { const at = f / FPS; f += sceneFrames(lang, i); return { id: s.id, at }; }); };

const PHONE_X = (1920 - PHONE_W) / 2;
const PHONE_Y = (1080 - PHONE_H) / 2;

const TitleCard: React.FC<{ title: string; sub: string }> = ({ title, sub }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 200, stiffness: 70 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily }}>
      <div style={{ transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`, opacity: p, textAlign: 'center' }}>
        <div style={{ fontSize: 112, fontWeight: 900, letterSpacing: -3, color: '#f8fafc' }}>
          {title === 'DriveDE' || title === 'drivede.app' ? <>{title.startsWith('drive') ? 'drive' : 'Drive'}<span style={{ color: '#3b82f6' }}>{title.startsWith('drive') ? 'de.app' : 'DE'}</span></> : title}
        </div>
        <div style={{ marginTop: 18, fontSize: 44, fontWeight: 600, color: 'rgba(226,232,240,0.9)' }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Tutorial: React.FC<{ lang: Lang }> = ({ lang }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: '#0b1220' }}>
      <Background />
      {SCENES.map((s, i) => {
        const dur = sceneFrames(lang, i);
        const start = from;
        from += dur;
        return (
          <Sequence key={s.id} from={start} durationInFrames={dur}>
            {s.clip ? (
              <AbsoluteFill>
                <PhoneFrame x={PHONE_X} y={PHONE_Y}>
                  <OffthreadVideo src={staticFile(`tut-${s.clip}-${lang}.mp4`)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </PhoneFrame>
                <Caption text={s.text[lang]} />
              </AbsoluteFill>
            ) : (
              <TitleCard title={s.title![lang]} sub={s.text[lang]} />
            )}
            <Sequence from={6}>
              <Audio src={staticFile(`vo-tut/${lang}/${s.id}.mp3`)} />
            </Sequence>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
