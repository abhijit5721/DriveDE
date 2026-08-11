import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { COPY, type Lang } from './copy.ts';
import { SCENES, TRANSITION_FRAMES } from './timings.ts';
import { Hook } from './scenes/Hook.tsx';
import { FeatureScene, appPoint } from './scenes/FeatureScene.tsx';
import { DevicesScene } from './scenes/DevicesScene.tsx';
import { EndCard } from './scenes/EndCard.tsx';
import type { Shot } from './components/CameraRig.tsx';

/**
 * Shot lists per scene, in app-CSS coordinates (390x844 viewport).
 * Tuned against the recorded frames — adjust cx/cy after eyeballing stills.
 */
const wide: Shot = { at: 0, scale: 1, cx: 960, cy: 540 };
const shotLists: Record<'tracker' | 'readiness' | 'curriculum' | 'maneuvers', Shot[]> = {
  tracker: [
    wide,
    { at: 60, scale: 1.4, ...appPoint(195, 520) },   // map bottom + speed dial + score
    { at: 160, scale: 1.25, ...appPoint(195, 260) }, // map + next-road banner
  ],
  readiness: [
    { at: 0, scale: 1.15, ...appPoint(195, 300) },   // gauge sweeps on entry
    { at: 90, scale: 1.75, ...appPoint(195, 330) },  // punch into the 74%
    { at: 180, scale: 1.1, ...appPoint(195, 420) },  // settle out
  ],
  curriculum: [
    { at: 0, scale: 1.25, ...appPoint(195, 420) },   // follow the quest path scroll
    { at: 150, scale: 1.5, ...appPoint(195, 460) },
  ],
  maneuvers: [
    { at: 0, scale: 1.2, ...appPoint(195, 380) },    // 3D animation stage
    { at: 120, scale: 1.55, ...appPoint(195, 420) },
  ],
};

/** Voiceover clip, delayed a touch into its scene for a natural feel. */
const VO: React.FC<{ lang: Lang; scene: string }> = ({ lang, scene }) => (
  <Audio src={staticFile(`vo/${lang}/${scene}.mp3`)} />
);

export const DemoVideo: React.FC<{ lang: Lang }> = ({ lang }) => {
  const c = COPY[lang];
  const t = () => (
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
    />
  );

  return (
    <AbsoluteFill>
      {/* music bed: pre-ducked to -28 LUFS with fades baked into the file */}
      <Audio src={staticFile('music.mp3')} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.hook.dur + TRANSITION_FRAMES}>
          <Hook clip={`readiness-${lang}.mp4`} text={c.hook} />
          <VO lang={lang} scene="hook" />
        </TransitionSeries.Sequence>
        {t()}
        <TransitionSeries.Sequence durationInFrames={SCENES.tracker.dur + TRANSITION_FRAMES}>
          <FeatureScene clip={`tracker-${lang}.mp4`} caption={c.tracker} shots={shotLists.tracker} />
          <VO lang={lang} scene="tracker" />
        </TransitionSeries.Sequence>
        {t()}
        <TransitionSeries.Sequence durationInFrames={SCENES.readiness.dur + TRANSITION_FRAMES}>
          <FeatureScene clip={`readiness-${lang}.mp4`} caption={c.readiness} shots={shotLists.readiness} />
          <VO lang={lang} scene="readiness" />
        </TransitionSeries.Sequence>
        {t()}
        <TransitionSeries.Sequence durationInFrames={SCENES.curriculum.dur + TRANSITION_FRAMES}>
          <FeatureScene clip={`curriculum-${lang}.mp4`} caption={c.curriculum} shots={shotLists.curriculum} />
          <VO lang={lang} scene="curriculum" />
        </TransitionSeries.Sequence>
        {t()}
        <TransitionSeries.Sequence durationInFrames={SCENES.maneuvers.dur + TRANSITION_FRAMES}>
          <FeatureScene clip={`maneuvers-${lang}.mp4`} caption={c.maneuvers} shots={shotLists.maneuvers} />
          <VO lang={lang} scene="maneuvers" />
        </TransitionSeries.Sequence>
        {t()}
        <TransitionSeries.Sequence durationInFrames={SCENES.devices.dur + TRANSITION_FRAMES}>
          <DevicesScene lang={lang} caption={c.devices} />
          <VO lang={lang} scene="devices" />
        </TransitionSeries.Sequence>
        {t()}
        <TransitionSeries.Sequence durationInFrames={SCENES.cta.dur}>
          <EndCard title={c.ctaTitle} sub={c.ctaSub} domain={c.domain} />
          <VO lang={lang} scene="cta" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
