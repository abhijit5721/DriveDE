# Antigravity Skills & Checklist

This document tracks mandatory procedures and recurring tasks that must be performed for the DriveDE project.

## 🚀 Deployment & Build Workflow (Recommended: CI/CD)
- **Standard Workflow**:
    1. Increment `version` in `package.json`.
    2. Commit and push to `main` branch.
    3. GitHub Actions will automatically run linting, tests, and push the OTA bundle to Capgo.
- **Manual Local Push** (Only if CI is down):
    - Run `npm run push-app` (build + upload).
    - Note: The CI will gracefully skip if you've already pushed the version locally.

## 🛠️ State & Logic Integrity
- **Achievement Sync**: When adding new achievements, ensure they are:
    1. Added to `src/data/achievements.ts` with robust criteria.
    2. Included in the `unlocked_achievements` column in Supabase (via `supabaseSync.ts`).
    3. Added to the silent hydration logic in `App.tsx` to prevent phantom triggers.
- **Profile Sync**: Any new user progress field (e.g., currency, XP, settings) must be added to:
    - `ensureProfileFromState` (Upsert to Cloud)
    - `hydrateFromSupabase` (Fetch from Cloud)

## 🎨 UI & Design Standards
- **Premium Aesthetics**: Maintain the "WOW" factor. Use modern typography (Inter/Outfit), smooth gradients, and glassmorphism.
- **Theme Support**: Always test both Light and Dark modes.
- **Mobile First**: Ensure all interactive elements are touch-friendly and fit within safe areas.

## 🧪 Testing
- **Linting**: Run `npm run lint` before committing/pushing.
- **Type Checking**: Run `npm run typecheck` to catch potential runtime errors.
