# DriveDE Backend Architecture

## Goal
A backend that supports:
- user accounts
- path/transmission aware profiles
- synced progress across devices
- tracker/logbook storage
- quiz attempts and scenario results
- legal/content versioning later
- subscription/premium entitlement later
- school/instructor features later

## Recommended stack
- Database: PostgreSQL
- Platform: Supabase (later, optional at this stage)
- Auth: Supabase Auth
- Storage: Supabase Storage
- API: Supabase REST / RPC initially, custom service later if needed

## Core modules

### 1. Auth
- sign up / sign in
- password reset
- anonymous/guest migration later

### 2. Profiles
- learning path
- transmission
- language
- dark mode
- exam target metadata

### 3. Curriculum Progress
- lesson completion
- chapter progress
- bookmarks/favorites later
- notes later

### 4. Tracker / Logbook
- lesson sessions
- normal lessons vs special drives
- instructor notes later

### 5. Quiz / Scenario Results
- attempts
- correctness
- weak topic analytics later

### 6. Premium Entitlements
- placeholder initially
- Stripe/RevenueCat later

### 7. Review / Export
- review pack metadata later
- downloadable export history later

## Suggested directory roles
- `backend/api/` — API contracts/specs
- `backend/services/` — service design docs
- `backend/strategies/` — rollout and migration strategy
- `supabase/migrations/` — database DDL
- `supabase/policies/` — RLS strategy docs

## Frontend integration plan
Start with these endpoints/tables only:
1. profile
2. lesson progress
3. tracker entries
4. quiz attempts

Everything else can wait.
