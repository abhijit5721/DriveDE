# Supabase Integration Checklist

## Before creating Supabase
- [ ] Keep current frontend stable
- [ ] Finalize lesson/content structure
- [ ] Add frontend service abstraction layer
- [ ] Decide guest-mode-first strategy

## When ready to create Supabase
- [ ] Create free Supabase project
- [ ] Save project URL and anon key
- [ ] Apply SQL migrations from `supabase/migrations`
- [ ] Review and add RLS policies

## First integration scope
- [ ] Profiles
- [ ] Lesson progress
- [ ] Driving sessions
- [ ] Quiz attempts

## Frontend tasks
- [ ] Add environment variables
- [ ] Create Supabase browser client
- [ ] Create Supabase server client later (for Next.js)
- [ ] Replace local-only persistence gradually

## Auth decisions
- [ ] keep guest mode available
- [ ] optional email sign-in later
- [ ] optional magic-link sign-in later

## Next.js migration tasks later
- [ ] move landing page
- [ ] move legal pages
- [ ] move dashboard
- [ ] move tracker
- [ ] move curriculum
- [ ] move maneuvers
- [ ] move review/legal flows

## Do not do yet
- [ ] complex premium billing
- [ ] school admin dashboard
- [ ] full CMS
- [ ] advanced analytics backend
