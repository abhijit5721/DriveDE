/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Scenarios for the multi-lane turning trainer (DRI-56). The learner's car
 * approaches from the bottom heading north and turns onto a road with two
 * lanes in its direction. The question is always the same: in which lane of
 * the new road must the car arrive? "inner" is the lane next to the centre
 * line, "outer" the kerbside lane.
 */
export type LaneSide = 'inner' | 'outer';

export interface LaneTurnScenario {
  id: string;
  turn: 'left' | 'right';
  /** How many lanes of the approach turn in this direction. */
  turningLanes: 1 | 2;
  /** Which approach lane the learner's car is in. With one turning lane this is always inner for left, outer for right. */
  carLane: LaneSide;
  /** The lane of the new road the car must arrive in. */
  correct: LaneSide;
  /** Why the other lane is wrong; picks the translated error and fact. */
  reasonKey: 'laneToLane' | 'keepRight' | 'rightTurnShoulder';
}

export const LANE_TURN_SCENARIOS: LaneTurnScenario[] = [
  { id: 'lane-left-parallel-outer', turn: 'left', turningLanes: 2, carLane: 'outer', correct: 'outer', reasonKey: 'laneToLane' },
  { id: 'lane-left-parallel-inner', turn: 'left', turningLanes: 2, carLane: 'inner', correct: 'inner', reasonKey: 'laneToLane' },
  { id: 'lane-left-single', turn: 'left', turningLanes: 1, carLane: 'inner', correct: 'outer', reasonKey: 'keepRight' },
  { id: 'lane-right-parallel-inner', turn: 'right', turningLanes: 2, carLane: 'inner', correct: 'inner', reasonKey: 'rightTurnShoulder' },
];
