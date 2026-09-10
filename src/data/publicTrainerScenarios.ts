/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Scenarios for the landing-page trainer that visitors can play without an
 * account (DRI-44). Kept separate from curriculum.ts so the landing chunk does
 * not pull in the whole curriculum. The three mirror the first interactive
 * lessons: plain right-before-left, a bending priority road, and a stop sign.
 */
import type { SimulatorScenario } from '../types';

export const PUBLIC_TRAINER_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'public-rvl',
    factKey: 'rvl',
    cars: [
      { id: 'blue-car', color: 'blue', positionKey: 'right', order: 0, labelKey: 'blueCar' },
      { id: 'red-car', color: 'red', positionKey: 'bottom', order: 1, labelKey: 'redCar' },
    ],
  },
  {
    id: 'public-bending',
    factKey: 'bending',
    bendingConfig: { path: 'bottom-left' },
    signs: [
      { type: 'bending-priority', position: 'bottom' },
      { type: 'yield', position: 'right' },
    ],
    cars: [
      { id: 'blue-car', color: 'blue', positionKey: 'bottom', order: 0, labelKey: 'blueCar' },
      { id: 'red-car', color: 'red', positionKey: 'right', order: 1, labelKey: 'redCar' },
    ],
  },
  {
    id: 'public-stop',
    factKey: 'stop',
    signs: [
      { type: 'stop', position: 'bottom' },
      { type: 'priority', position: 'left' },
    ],
    cars: [
      { id: 'blue-car', color: 'blue', positionKey: 'bottom', order: 1, labelKey: 'blueCar' },
      { id: 'red-car', color: 'red', positionKey: 'left', order: 0, labelKey: 'redCar' },
    ],
  },
];
