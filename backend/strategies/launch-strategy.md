# Backend Launch Strategy

## Stage 0 — Current
- Frontend only
- local state
- no cloud dependency

## Stage 1 — Schema Ready
- keep SQL migrations in repo
- review table design
- review API contract
- no infrastructure account required yet

## Stage 2 — Free Backend Trial
- create Supabase free account
- apply initial migration
- create auth users
- wire profile, progress, tracker, quiz tables

## Stage 3 — Controlled Beta
- a few testers with real accounts
- sync progress across devices
- monitor schema fit

## Stage 4 — Launch Candidate
- finalize legal text
- add audit fields if needed
- add premium entitlements later

## Migration strategy
- Use incremental SQL files under `supabase/migrations`
- Never edit old migrations after applying them in a shared environment
- Add new numbered migrations for changes

## Local-to-cloud strategy
- Keep frontend data model stable first
- Map frontend lesson IDs directly into progress and quiz tables
- Keep reference lesson content in frontend for now
- Sync only user-owned data first

## What not to build first
- payments
- school dashboards
- notifications
- analytics pipeline
- CMS

Those can come after the product is validated.
