import React from 'react';
import { Composition } from 'remotion';
import { DemoVideo } from './DemoVideo.tsx';
import { ShortCockpit, SHORT_FRAMES } from './ShortCockpit.tsx';
import { ShortReadiness, READINESS_FRAMES } from './ShortReadiness.tsx';
import { ShortParking, PARKING_FRAMES } from './ShortParking.tsx';
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
  </>
);
