# DriveDE Next.js App Blueprint

This folder is a blueprint only.
It documents how a future Next.js app should be structured when you are ready to migrate.

## Suggested structure

```text
next-app/
  app/
    page.tsx
    layout.tsx
    legal/
    app/
      dashboard/
      curriculum/
      maneuvers/
      tracker/
      review/
    api/
      profile/
      progress/
      tracker/
      quiz/
  components/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    services/
  types/
  styles/
```

## What to move first
1. landing page
2. legal pages
3. shared header/footer
4. dashboard
5. tracker

## Keep shared assets/data portable
Until migration, keep shared domain logic portable:
- types
- curriculum data
- filtering utils
- legal content

## Why this exists
So you can plan the migration before committing to a full framework rewrite.
