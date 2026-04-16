# DriveDE Next.js + Supabase Integration Plan

This document explains how to integrate a backend using **Next.js + Supabase** while keeping the current product usable and minimizing rework.

---

## 1. Recommended architecture

### Frontend / App layer
- **Option A (recommended migration path):** keep the current Vite React app running while you validate the product, and create a separate Next.js app later.
- **Option B:** migrate the current app fully into Next.js App Router when you are ready.

### Backend / Data layer
- **Supabase PostgreSQL** for database
- **Supabase Auth** for optional user accounts later
- **Supabase Storage** later for documents/assets if needed
- **Next.js Route Handlers / Server Actions** for app-specific backend logic

### Why this combination works
- Fast to build
- Great DX for small teams/solo founders
- Secure if RLS is done correctly
- Can start with local-only frontend, then progressively enable cloud sync

---

## 2. Do you need to migrate to Next.js immediately?

No.

### Recommended rollout
1. Keep the current Vite app as the working frontend
2. Finalize content/product structure
3. Create Supabase project later on free tier
4. Add a small Next.js app or migrate when you need:
   - server-side auth handling
   - marketing landing page + app together
   - route handlers
   - future dashboard/admin pages

This avoids rebuilding everything too early.

---

## 3. Best migration strategy

### Phase 0 — Current state
- Current app: Vite + React + Tailwind
- State: local Zustand store
- Data: local lesson content in `src/data/curriculum.ts`
- Backend: planned only

### Phase 1 — Supabase preparation
- Create Supabase free account later
- Apply migrations from `supabase/migrations`
- Enable Auth providers only when needed
- Keep app still mostly local for beta

### Phase 2 — Add a frontend data service layer
Before touching backend integration heavily, create a clean service abstraction:
- `src/services/profileService.ts`
- `src/services/progressService.ts`
- `src/services/trackerService.ts`
- `src/services/quizService.ts`

Each service should first support **local mode**, then later **supabase mode**.

### Phase 3 — Introduce Next.js app
Create a new app folder later, for example:

```text
/apps
  /web        -> Next.js app
/packages
  /shared     -> shared types/data/ui later
```

Or simpler:

```text
/drivede-web  -> Next.js app
/drivede-vite -> current app
```

Use Next.js for:
- landing page / SEO pages
- auth callbacks
- route handlers
- future admin/instructor pages

### Phase 4 — Move app screens gradually
Migrate screens one by one into Next.js:
- dashboard
- curriculum
- maneuvers
- tracker
- review/legal pages

---

## 4. What Next.js would handle

### Public pages
- landing page
- pricing page later
- privacy / terms / GDPR / impressum

### App pages
- dashboard
- chapters
- maneuvers
- tracker
- review pack

### Server-side pieces
- route handlers for custom logic
- server-side PDF generation later if desired
- entitlement checks later
- webhooks later (subscriptions)

---

## 5. What Supabase would handle

### Database
Use existing planned tables:
- `profiles`
- `lesson_progress`
- `driving_sessions`
- `quiz_attempts`
- `subscriptions`

### Auth
Later, optional:
- email/password
- magic link
- Google sign-in
- Apple sign-in later
- guest mode can still remain in frontend initially

### RLS
Enable row-level security so users can only access their own rows.

### Storage
Later use for:
- downloadable exports
- static premium assets
- uploaded school assets later

---

## 6. Data flow recommendation

### For beta (no login yet)
- Keep local storage as source of truth
- Add export/import backup
- Backend not required yet for usage

### After Supabase integration begins
Use a dual-mode strategy:
- guest user => local storage
- signed-in user => sync with Supabase

This avoids forced auth too early.

---

## 7. Suggested folder structure for future Next.js version

```text
apps/
  web/
    app/
      (marketing)/
      app/
        dashboard/
        curriculum/
        maneuvers/
        tracker/
        review/
        legal/
      api/
        profile/
        progress/
        tracker/
        quiz/
      layout.tsx
      page.tsx
    components/
    lib/
      supabase/
        client.ts
        server.ts
        middleware.ts
      services/
        profile-service.ts
        progress-service.ts
        tracker-service.ts
        quiz-service.ts
    types/
    styles/
```

---

## 8. Supabase client strategy

### Browser client
Use for signed-in user reads/writes that RLS permits.

### Server client
Use in:
- route handlers
- server components
- admin operations later

### Service abstraction
Do not scatter raw Supabase calls across UI components.

Instead:
- UI -> service layer -> Supabase

This will keep maintenance easier.

---

## 9. First backend features to integrate

Implement these first, in order:

1. **Profile sync**
   - learning path
   - transmission
   - language
   - theme

2. **Lesson progress sync**
   - completed lessons
   - progress status
   - confidence rating later

3. **Tracker sync**
   - driving sessions
   - category
   - duration

4. **Quiz attempts sync**
   - answers
   - correctness

5. **Optional premium placeholder**
   - keep simple boolean/entitlement field initially

---

## 10. API strategy with Next.js

Prefer this split:

### Direct Supabase access from client for simple user-owned data
- progress
- tracker
- quiz attempts

### Next.js route handlers for custom logic
- export generation later
- complex joins/aggregations later
- admin/instructor workflows later
- payment webhooks later

This avoids unnecessary backend complexity too early.

---

## 11. Security strategy

### Essentials
- enable RLS on all user-owned tables
- use auth UID as row owner
- do not trust client-side premium flags
- keep service role keys only on server
- use route handlers for privileged operations only

### Launch-safe approach
- guest mode for beta
- authenticated sync later
- minimal PII initially

---

## 12. What to build next in the codebase

### Recommended next implementation work
1. Add a frontend **service layer abstraction**
2. Add **export/import backup**
3. Add a **storage adapter pattern**:
   - local adapter
   - future supabase adapter
4. Keep app product work moving
5. Only then create a Supabase project

---

## 13. Zero-cost path

You can do all planning now for free.

You only need a Supabase account later when you actually want cloud sync.
Supabase has a free tier suitable for early-stage development.

---

## 14. Recommended decision

### If you want fastest progress now
- Keep current Vite app
- Add service abstraction first
- Add Supabase later
- Add/migrate to Next.js when you want unified marketing + app + auth flow

### If you want to fully standardize on Next.js soon
- Create a parallel Next.js app
- Move the landing/legal pages first
- Move app screens gradually
- Reuse the same shared data/types

---

## 15. Final recommendation

For DriveDE, the best path is:

1. **Do not rebuild everything today**
2. **Prepare the app for backend integration**
3. **Use Supabase as the backend**
4. **Use Next.js when you are ready for a unified web/app platform**

This gives you speed now and maintainability later.
