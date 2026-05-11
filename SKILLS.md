# Antigravity Skills & Checklist

This document tracks mandatory procedures and recurring tasks that must be performed for the DriveDE project.

## 🚀 Deployment & Build Workflow
- **Version Bumping**: Always increment the `version` in `package.json` before any major logic change or fix intended for the mobile app.
- **Build**: Run `npm run build` (or `npx vite build`) to ensure the production assets are valid and lint-free.
- **OTA Push**: After building, run `npx capgo bundle upload de.drivede.app` to deploy the bundle to the Capgo cloud.
- **Sync Command**: Use `npm run push-app` to combine build and push in one step.

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
