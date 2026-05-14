import { registerPlugin } from '@capacitor/core';
import type { DriveTrackingPluginDefinition } from './definitions';

export const DriveTracking: DriveTrackingPluginDefinition = registerPlugin('DriveTracking', {
  web: {
    ping: () => Promise.resolve(),
  },
});

export interface LocationUpdate {
  lat: number;
  lng: number;
  speed: number;
  accuracy: number;
  bearing: number;
  altitude: number;
  timestamp: number;
}