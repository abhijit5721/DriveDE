# DriveDE Supabase Quickstart

DriveDE now supports **hybrid persistence**:
- **Local storage always works** (default fallback)
- **Supabase sync works when configured**

## How it behaves

### If Supabase is NOT configured
The app continues to work exactly as before:
- no sign-in required
- progress saved locally in browser storage
- tracker saved locally
- quiz scores saved locally

### If Supabase IS configured
The app still keeps local storage, but also tries to sync:
- profile preferences
- completed lessons
- driving sessions
- quiz attempts

## Step 1 — Create Supabase project
Create a free project at:
https://supabase.com/

## Step 2 — Apply migrations
Run the SQL files in:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_seed_reference_data.sql`

Use the Supabase SQL editor.

## Step 3 — Create local env file
Copy `.env.example` to `.env` and set:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4 — Enable Google auth provider (optional social sign-in)
In your Supabase dashboard:
1. Go to **Authentication → Providers**
2. Enable **Google**
3. Add your Google OAuth client ID and secret
4. Add allowed redirect URLs for:
   - your local app (for example `http://localhost:5173`)
   - your deployed app URL

Without this step, the **Continue with Google** button will appear but cannot complete login.

## Step 5 — Install dependencies
Already added in this repo:
- `@supabase/supabase-js`

If needed again:

```bash
npm install
```

## Step 5 — Run app

```bash
npm run dev
```

## Important current limitation
This version adds **optional sync plumbing**, but it does **not yet enforce sign-in**.
That means:
- local mode remains primary
- cloud sync only works when a valid Supabase user session exists
- sign-up/sign-in UI can be added next without breaking current local users

## Recommended next step
Add:
1. optional guest vs account mode
2. Supabase auth buttons
3. hydrate local state from Supabase after sign-in
4. conflict strategy (cloud wins / latest wins)
