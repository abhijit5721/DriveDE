/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * cockpitTrainer.ts (DRI-11)
 *
 * Data model for the interactive "moving off & shifting" cockpit trainer.
 * Steps are checked against the live simulation state each tick; the strings
 * live in translations under maneuvers.interactive.cockpit.steps keyed by id.
 */

export type ManualGear = 'N' | 'R' | 1 | 2 | 3 | 4 | 5 | 6;
export type AutoGear = 'P' | 'R' | 'N' | 'D';
export type TrainerMode = 'manual' | 'automatic';

export interface CockpitSimState {
  engineOn: boolean;
  stalled: boolean;
  rpm: number;      // 0 while off; idle ~800
  speed: number;    // km/h
  gear: ManualGear; // manual transmission position
  autoGear: AutoGear;
  clutch: number;   // 0-100, 100 = pedal fully pressed (disengaged)
  brake: boolean;
  gas: boolean;
  /** distance travelled (arbitrary units) — drives the windshield scene */
  distance: number;
}

export interface TrainerStep {
  id: string;
  isDone: (s: CockpitSimState) => boolean;
}

// ---- simulation constants ----
export const IDLE_RPM = 800;
export const MAX_RPM = 4500;
export const STALL_RPM = 650;
/** clutch % below which the clutch starts transmitting power (biting point zone) */
export const BITE_START = 60;
/** top speed per manual gear (km/h) used for the simple ratio model */
export const GEAR_TOP_SPEED: Record<number, number> = { 1: 15, 2: 30, 3: 50, 4: 70, 5: 95, 6: 120 };
export const TICK_MS = 100;

/** 0..1 how much engine power reaches the wheels for a clutch position */
export function powerFactor(clutch: number, gear: ManualGear): number {
  if (gear === 'N') return 0;
  if (clutch >= BITE_START) return 0;
  return (BITE_START - clutch) / BITE_START;
}

export const MANUAL_STEPS: TrainerStep[] = [
  // 1. Clutch + brake down, start the engine
  { id: 'start', isDone: (s) => s.engineOn },
  // 2. Clutch fully pressed, select 1st gear
  { id: 'first', isDone: (s) => s.engineOn && s.gear === 1 },
  // 3. Find the biting point + gas: move off (>= 8 km/h without stalling)
  { id: 'moveOff', isDone: (s) => s.engineOn && s.speed >= 8 },
  // 4. Accelerate and shift to 2nd, keep rolling
  { id: 'second', isDone: (s) => s.engineOn && s.gear === 2 && s.speed >= 15 },
  // 5. Brake to a stop with the clutch pressed before standstill
  { id: 'stop', isDone: (s) => s.engineOn && s.speed === 0 && s.clutch >= BITE_START && s.gear === 2 },
  // 6. Neutral, engine off
  { id: 'off', isDone: (s) => s.gear === 'N' && !s.engineOn && !s.stalled },
];

export const AUTOMATIC_STEPS: TrainerStep[] = [
  // 1. Brake down, start the engine
  { id: 'start', isDone: (s) => s.engineOn },
  // 2. With the brake held, shift to D
  { id: 'drive', isDone: (s) => s.engineOn && s.autoGear === 'D' },
  // 3. Release the brake (creep), add gas: reach 10 km/h
  { id: 'moveOff', isDone: (s) => s.engineOn && s.speed >= 10 },
  // 4. Brake to a full stop
  { id: 'stop', isDone: (s) => s.engineOn && s.speed === 0 && s.brake && s.autoGear === 'D' },
  // 5. Shift to P, engine off
  { id: 'park', isDone: (s) => s.autoGear === 'P' && !s.engineOn },
];

export const STEPS: Record<TrainerMode, TrainerStep[]> = {
  manual: MANUAL_STEPS,
  automatic: AUTOMATIC_STEPS,
};
