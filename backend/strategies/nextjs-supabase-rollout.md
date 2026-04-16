# Next.js + Supabase Rollout Strategy

## Goal
Adopt Next.js + Supabase without breaking the current working Vite app.

## Stage 1 — Stabilize current app
- finish content corrections
- stabilize navigation
- keep local storage working
- add legal/footer/support polish

## Stage 2 — Add service abstraction in current app
Create frontend services:
- profile service
- progress service
- tracker service
- quiz service

Each service should support local mode first.

## Stage 3 — Supabase project setup
When ready:
- create Supabase project
- apply `supabase/migrations/*.sql`
- set up RLS policies
- configure auth but do not force login

## Stage 4 — Introduce cloud sync
Start with:
- profiles
- lesson progress
- driving sessions
- quiz attempts

Keep guest mode available.

## Stage 5 — Introduce Next.js app
Use Next.js for:
- marketing landing pages
- auth flow
- route handlers
- future admin pages

## Stage 6 — Migrate screens gradually
Suggested order:
1. legal pages
2. landing page
3. dashboard
4. tracker
5. curriculum
6. maneuvers
7. review pack

## Stage 7 — Expand backend features later
- premium entitlements
- PDF generation on server
- school/instructor dashboards
- content CMS/admin

## Recommendation
Do not mix all steps at once.
Separate:
- product/content work
- persistence work
- framework migration
