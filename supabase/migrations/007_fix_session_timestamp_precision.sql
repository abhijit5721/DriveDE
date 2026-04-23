-- 007_fix_session_timestamp_precision.sql
-- Change session_date from DATE to TIMESTAMPTZ to preserve precise start times

-- 1. Alter the column type
ALTER TABLE public.driving_sessions 
ALTER COLUMN session_date TYPE timestamptz 
USING session_date::timestamptz;

-- 2. Clean up duplicates (Optional but recommended)
-- Delete rows where an external_id version exists for the same user/date/duration
DELETE FROM public.driving_sessions a
WHERE a.external_id IS NULL
AND EXISTS (
    SELECT 1 FROM public.driving_sessions b
    WHERE b.user_id = a.user_id
    AND b.external_id IS NOT NULL
    AND b.session_date::date = a.session_date::date
    AND b.duration_minutes = a.duration_minutes
    AND b.category = a.category
);
