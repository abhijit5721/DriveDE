# DriveDE Backend Setup Plan

This project currently runs as a frontend-first React app. This document adds a production-minded backend plan without forcing you to set up paid infrastructure yet.

## Do you need a Supabase account now?

No.

You can start with:
- frontend only
- local storage
- zero-cost local development
- backend schema and migration files stored in this repo

You only need a Supabase account when you want to:
- create a hosted PostgreSQL database
- enable auth
- sync user progress across devices
- store cloud data
- use storage or edge functions in production

## Recommended rollout

### Phase 1 — Now
- Keep app frontend-only
- Store backend architecture in repo
- Review schema, API, and migration files
- Continue product/content validation

### Phase 2 — Local backend prototype
- Use PostgreSQL locally or Supabase later
- Implement auth + progress sync + tracker endpoints first

### Phase 3 — Free cloud backend
- Create Supabase free-tier account
- Apply SQL migrations in `supabase/migrations`
- Use Supabase Auth + Database + Storage

## What was added to the repo

- `backend/README.md` — backend architecture overview
- `backend/api/openapi.yaml` — API contract draft
- `backend/services/README.md` — service/module breakdown
- `backend/strategies/launch-strategy.md` — migration and rollout strategy
- `supabase/migrations/001_initial_schema.sql` — initial schema
- `supabase/migrations/002_seed_reference_data.sql` — seed/reference data
- `supabase/policies/README.md` — suggested Row Level Security strategy

## First backend milestone recommended

Build only these first:
1. users/profile
2. lesson progress sync
3. tracker/logbook sync
4. quiz attempts
5. premium entitlement placeholder

## Current repo status

A lightweight **Supabase client integration with local-storage fallback** is now wired into the frontend:
- local storage remains the default and always works
- Supabase sync activates only when env vars are configured and a user session exists
- no forced sign-in yet
- safe for launch preparation without breaking guest mode

## Suggested local dev order

1. Keep current frontend running
2. Add local Git commits
3. Review schema and API files in this repo
4. When ready, create Supabase free account
5. Apply migrations
6. Wire frontend gradually

## Why Supabase later?

Supabase is a good fit because it gives:
- PostgreSQL
- Auth
- Storage
- REST + realtime capabilities
- free tier for early stage

But you should not block progress waiting for infrastructure.

## Recommended free-first approach

- Design backend now
- Implement frontend polish now
- Add backend only after content/product is stable
