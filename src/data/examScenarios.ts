/**
 * (c) 2026 DriveDE. All rights reserved.
 *
 * The exam situations live in api/_lib/examScenarios.ts so the grading endpoint
 * (api/grade-scenario.ts) reads the same answer keys as the app; Vercel functions can
 * only import helpers from inside api/.
 */
export * from '../../api/_lib/examScenarios';
