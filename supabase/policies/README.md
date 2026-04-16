# Supabase Row Level Security Strategy

When you move to Supabase, enable RLS on all user-owned tables.

## Tables requiring RLS
- profiles
- lesson_progress
- driving_sessions
- quiz_attempts
- subscriptions

## Core policy principle
Users should only be able to read/write their own rows.

### Profiles
- select: `auth.uid() = id`
- update: `auth.uid() = id`

### Lesson Progress
- select/update/insert/delete: `auth.uid() = user_id`

### Driving Sessions
- select/update/insert/delete: `auth.uid() = user_id`

### Quiz Attempts
- select/insert: `auth.uid() = user_id`
- update/delete usually not needed

### Subscriptions
- select: `auth.uid() = user_id`
- updates preferably server-side only later

## Suggested future additions
- admin role for content moderation / support
- service role for webhooks and premium sync
- immutable legal acceptance logs later

## Important
Do not rely on frontend filtering for security.
Always enforce access at database policy level.
