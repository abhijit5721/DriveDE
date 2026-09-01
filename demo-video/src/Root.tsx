import React from 'react';
import { Composition } from 'remotion';
import { DemoVideo } from './DemoVideo.tsx';
import { ShortCockpit, SHORT_FRAMES } from './ShortCockpit.tsx';
import { ShortReadiness, READINESS_FRAMES } from './ShortReadiness.tsx';
import { ShortParking, PARKING_FRAMES } from './ShortParking.tsx';
import { ShortNarrated, NARR_TOTAL_FRAMES } from './ShortNarrated.tsx';
import { ShortAvatar, AVATAR_TOTAL_FRAMES } from './ShortAvatar.tsx';
import { ShortExaminerEp1, EP1_TOTAL_FRAMES } from './ShortExaminerEp1.tsx';
import { ShortExaminerEp1Answer, EP1ANS_TOTAL_FRAMES } from './ShortExaminerEp1Answer.tsx';
import { RoundaboutExplainer, RB_TOTAL_FRAMES } from './RoundaboutExplainer.tsx';
import { FPS, TOTAL_FRAMES } from './timings.ts';

export const Root: React.FC = () => (
  <>
    {(['de', 'en'] as const).map((lang) => (
      <Composition
        key={lang}
        id={`demo-${lang}`}
        component={DemoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ lang }}
      />
    ))}
    {(['de', 'en'] as const).map((lang) => (
      <Composition
        key={`short-${lang}`}
        id={`short-cockpit-${lang}`}
        component={ShortCockpit}
        durationInFrames={SHORT_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang }}
      />
    ))}
    {(['de', 'en'] as const).map((lang) => (
      <Composition
        key={`readiness-${lang}`}
        id={`short-readiness-${lang}`}
        component={ShortReadiness}
        durationInFrames={READINESS_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang }}
      />
    ))}
    {(['de', 'en'] as const).map((lang) => (
      <Composition
        key={`parking-${lang}`}
        id={`short-parking-${lang}`}
        component={ShortParking}
        durationInFrames={PARKING_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang }}
      />
    ))}
    {(['de', 'en'] as const).map((lang) => (
      <Composition
        key={`narrated-${lang}`}
        id={`short-narrated-${lang}`}
        component={ShortNarrated}
        durationInFrames={NARR_TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang }}
      />
    ))}
    <Composition
      id="short-avatar-en"
      component={ShortAvatar}
      durationInFrames={AVATAR_TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ lang: 'en' as const }}
    />
    <Composition
      id="examiner-ep1-quiz"
      component={ShortExaminerEp1}
      durationInFrames={EP1_TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    <Composition
      id="examiner-ep1-answer"
      component={ShortExaminerEp1Answer}
      durationInFrames={EP1ANS_TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
    {(['de', 'en'] as const).map((lang) => (
      <Composition
        key={`rb-${lang}`}
        id={`roundabout-${lang}`}
        component={RoundaboutExplainer}
        durationInFrames={RB_TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang }}
      />
    ))}
  </>
);
